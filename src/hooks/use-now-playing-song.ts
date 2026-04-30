import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { loadLocalSongMetadata, type LocalSongMetadata } from "@/data/local-song";
import {
  playNextInQueue,
  playPreviousInQueue,
  useQueueState,
} from "@/data/playback-queue";
import { realSong, useRealSongMetadata } from "@/data/real-song";
import type { LyricLine } from "@/data/real-song";

export function useNowPlayingSong({
  id,
  title,
  artist,
  image,
}: {
  id: string;
  title: string;
  artist: string;
  image: string;
}) {
  const queueState = useQueueState();
  // Falls back to the params that opened this screen — e.g. right after a
  // Fast Refresh wipes the in-memory queue while this screen stays mounted.
  const current = queueState.song ?? { id, title, artist, image };

  const localUri = current.localUri ?? null;
  const isRealSong = current.id === realSong.id;
  const isLocalSong = !isRealSong && !!localUri;
  const canPlay = isRealSong || isLocalSong;

  // The default 500ms status tick is too coarse for synced lyrics — a line
  // could sit half a second late — and makes the progress bar visibly step
  // rather than slide.
  const player = useAudioPlayer(isRealSong ? realSong.audioSource : localUri, {
    updateInterval: 100,
  });
  const rawStatus = useAudioPlayerStatus(player);

  // Status only advances when the player emits an update, and a song with no
  // audio behind it never emits one — so the previous song's numbers would
  // stay on screen: its duration, its position, and a Pause icon for
  // something that isn't playing. Worse, `playing` reading true here would
  // make a skip think it should resume into a song that can't play at all.
  const status = useMemo(
    () =>
      canPlay
        ? rawStatus
        : { ...rawStatus, playing: false, currentTime: 0, duration: 0 },
    [rawStatus, canPlay],
  );

  // Whether the user wants music playing, tracked separately from whether a
  // player currently is. Skipping past songs with no audio would otherwise
  // lose that intent: they never report `playing`, so asking the player
  // "were we playing?" answers no and playback dies on the way through.
  const wantsPlaybackRef = useRef(false);

  // A Next/Previous tap swaps the source and hands back a freshly created,
  // paused player. Keyed on the queue position rather than the player:
  // skipping between two unplayable songs leaves the source at null, so the
  // same player is reused and an effect watching it would never fire.
  useEffect(() => {
    // Songs with no audio behind them are simply passed over; the intent
    // survives until a playable one comes up.
    if (!wantsPlaybackRef.current || !canPlay) return;
    player.play();
  }, [queueState.index, canPlay, player]);

  const goToNext = () => {
    playNextInQueue();
  };
  const goToPrevious = () => {
    playPreviousInQueue();
  };

  const realSongMetadata = useRealSongMetadata();
  // Tagged with the file it describes instead of being cleared on every
  // song change: resetting it from inside the effect would set state during
  // the effect body and cascade an extra render each time.
  const [loadedLocal, setLoadedLocal] = useState<{
    uri: string;
    metadata: LocalSongMetadata;
  } | null>(null);
  useEffect(() => {
    if (!localUri) return;
    let cancelled = false;
    loadLocalSongMetadata(localUri).then((metadata) => {
      if (!cancelled) setLoadedLocal({ uri: localUri, metadata });
    });
    return () => {
      cancelled = true;
    };
  }, [localUri]);

  // Metadata still describing the previous song counts as "not loaded yet".
  const localMetadata =
    loadedLocal && loadedLocal.uri === localUri ? loadedLocal.metadata : null;

  const lyrics: LyricLine[] = isRealSong
    ? realSongMetadata?.lyrics ?? []
    : isLocalSong
      ? localMetadata?.lyrics ?? []
      : [];

  const metadataReady = isRealSong
    ? realSongMetadata !== null
    : isLocalSong
      ? localMetadata !== null
      : false;

  // The cover player is the whole screen whenever the lyrics view has
  // nothing to show: either metadata is still loading, or it finished and
  // this song carries no synced lyrics. Waiting on the first case used to
  // render an empty screen, since `lyrics` is legitimately empty until the
  // tag has been read.
  const showCoverOnly = canPlay && (!metadataReady || lyrics.length === 0);

  const displayArtist =
    isLocalSong && localMetadata?.artist ? localMetadata.artist : current.artist;
  const displayImage =
    isLocalSong && localMetadata?.image ? localMetadata.image : current.image;
  const album = isRealSong ? realSongMetadata?.album : localMetadata?.album;

  // Registers this player for lock screen / notification controls and keeps
  // background playback alive past Android's ~3 minute cap (see
  // shouldPlayInBackground's docs). Re-runs whenever the displayed metadata
  // changes, e.g. once a local file's real title/art finish loading.
  useEffect(() => {
    if (!canPlay) return;
    player.setActiveForLockScreen(
      true,
      { title: current.title, artist: displayArtist, artworkUrl: displayImage },
      { showSeekBackward: true, showSeekForward: true },
    );
    return () => {
      // When this runs because the player itself changed — a skip, or the
      // screen closing — expo-audio has already released the underlying
      // shared object and reaching for it throws
      // ERR_USING_RELEASED_SHARED_OBJECT. A released player drops its own
      // lock screen entry, so there's nothing left to clean up in that case.
      try {
        player.clearLockScreenControls();
      } catch {
        // Already released; its controls went with it.
      }
    };
  }, [canPlay, player, current.title, displayArtist, displayImage]);

  const togglePlayback = () => {
    if (!canPlay) return;
    if (status.playing) {
      wantsPlaybackRef.current = false;
      player.pause();
    } else {
      wantsPlaybackRef.current = true;
      player.play();
    }
  };

  return {
    title: current.title,
    isRealSong,
    canPlay,
    showCoverOnly,
    player,
    status,
    lyrics,
    displayArtist,
    displayImage,
    album,
    togglePlayback,
    hasNext: queueState.hasNext,
    hasPrevious: queueState.hasPrevious,
    goToNext,
    goToPrevious,
  };
}
