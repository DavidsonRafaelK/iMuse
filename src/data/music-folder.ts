import { useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

export type MusicFolder = {
  uri: string;
  name: string;
};

export type MusicFile = {
  uri: string;
  name: string;
};

const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".m4a",
  ".wav",
  ".aac",
  ".flac",
  ".ogg",
]);

export type MusicFolderListing =
  | { ok: true; files: MusicFile[] }
  | { ok: false; error: unknown };

// Reads the folder's contents fresh each call — cheap, and keeps this in
// sync with files added/removed on disk without needing our own cache.
//
// A folder that was deleted or had its permission revoked reads as a
// failed listing rather than an exception, so a screen can call this while
// rendering without a bad folder taking the screen down.
export function listMusicFiles(folderUri: string): MusicFolderListing {
  try {
    const directory = new Directory(folderUri);
    // A revoked or deleted SAF folder lists as empty rather than throwing,
    // which would otherwise read to the user as "this folder has no music"
    // when the truth is we can't see into it at all.
    if (!directory.exists) {
      return { ok: false, error: new Error(`No access to ${folderUri}`) };
    }

    const entries = directory.list();
    const files = entries
      .filter(
        (entry): entry is File =>
          entry instanceof File &&
          AUDIO_EXTENSIONS.has(entry.extension.toLowerCase()),
      )
      .map((file) => ({
        uri: file.uri,
        name: file.name.replace(/\.[^./]+$/, ""),
      }));
    return { ok: true, files };
  } catch (error) {
    console.warn(`Couldn't read the music folder at ${folderUri}:`, error);
    return { ok: false, error };
  }
}

let folder: MusicFolder | null = null;
let restored = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Android grants the picked folder a persistable permission, so the URI
// keeps working across restarts — but only if we remember which folder was
// picked. A tiny JSON file next to the app's documents is enough; there's
// no key-value store in the project to lean on.
const STORE_FILE_NAME = "music-folder.json";

function storeFile(): File {
  return new File(Paths.document, STORE_FILE_NAME);
}

function persistFolder(value: MusicFolder | null) {
  if (Platform.OS === "web") return;
  try {
    const file = storeFile();
    if (!value) {
      if (file.exists) file.delete();
      return;
    }
    if (!file.exists) file.create();
    file.write(JSON.stringify(value));
  } catch (error) {
    // Losing the folder on next launch is a nuisance, not a failure worth
    // interrupting the user over.
    console.warn("Couldn't remember the chosen music folder:", error);
  }
}

function readPersistedFolder(): MusicFolder | null {
  if (Platform.OS === "web") return null;
  try {
    const file = storeFile();
    if (!file.exists) return null;
    const parsed = JSON.parse(file.textSync()) as Partial<MusicFolder>;
    if (typeof parsed?.uri !== "string" || typeof parsed?.name !== "string") {
      return null;
    }
    return { uri: parsed.uri, name: parsed.name };
  } catch (error) {
    console.warn("Couldn't read the remembered music folder:", error);
    return null;
  }
}

// SAF directory names come back like "primary:Music" — the "primary:" part
// is just the storage volume id, not useful to show.
function cleanFolderName(rawName: string): string {
  return rawName.replace(/^[^:/\\]+:/, "");
}

// The picker rejects rather than resolving when the user backs out of it.
function isPickerCancelled(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "ERR_PICKER_CANCELLED";
}

// Lets the user pick a folder on their device to store iMuse's music in.
// Native-only (iOS/Android SAF folder picker) — there's no equivalent
// filesystem-directory concept to grant access to on web.
//
// Resolves to null when the user backs out, and rejects only when picking
// genuinely failed, so callers can tell those two apart.
export async function chooseMusicFolder(): Promise<MusicFolder | null> {
  let directory: Directory;
  try {
    directory = await Directory.pickDirectoryAsync();
  } catch (error) {
    if (isPickerCancelled(error)) return null;
    throw error;
  }

  const rawName = directory.name || directory.uri;
  folder = { uri: directory.uri, name: cleanFolderName(rawName) };
  persistFolder(folder);
  notifyListeners();
  return folder;
}

export function useMusicFolder(): MusicFolder | null {
  // Reading the stored folder touches the filesystem, so it waits for a
  // subscriber instead of running at import time.
  useEffect(() => {
    if (restored) return;
    restored = true;
    const stored = readPersistedFolder();
    if (stored) {
      folder = stored;
      notifyListeners();
    }
  }, []);

  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => folder,
    () => null,
  );
}
