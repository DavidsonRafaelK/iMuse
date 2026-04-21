# iMuse

A music streaming app UI built with Expo Router, NativeWind v5, and gluestack-ui.

## Tech stack

- Expo SDK 57 + Expo Router (file-based routing)
- React Native 0.86, React 19
- NativeWind v5 (Tailwind CSS v4 for React Native)
- gluestack-ui
- expo-audio for playback
- react-native-reanimated for gesture-driven and animated transitions
- TypeScript

## Features

- Bottom tab navigation: Home, New, Streaming, Library, Search
- Home screen sections: Listen Now (album carousel with tap-to-open detail), Favourite (paged song list), New This Week, Recent Releases, More to Explore
- Album detail screen with tracklist, play/shuffle/add controls, and a song options sheet (share, view credits, create station)
- Now Playing screen with:
  - Real audio playback (one bundled track, `assets/audio/impostor-syndrome.mp3`)
  - Synchronised lyrics read directly from the file's embedded SYLT ID3 tag (see `src/lib/id3.ts`), auto-scrolling and centering the active line as the song plays
  - A drag-to-reveal full player view (cover art, progress bar, transport controls) that tracks the user's swipe in real time
  - All other songs fall back to placeholder lyrics and disabled playback controls, since no audio file backs them
- Full light/dark theme support, including the Android status bar and system navigation bar
- Responsive layout on web (content is capped and centered on wide viewports)

## Project structure

- `src/app` - screens and routes (Expo Router)
- `src/components` - reusable UI components, grouped by feature (`home`, `album`, `now-playing`)
- `src/data` - static data and the real song's runtime-detected metadata
- `src/hooks` - shared hooks (theme colors, paged widths, playback navigation)
- `src/lib/id3.ts` - the ID3v2 tag parser used to read the bundled track's metadata and lyrics
- `assets/audio` - the bundled mp3 used by the Now Playing screen

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- a web browser, via `npx expo start --web`

## Notes on the real song

Only "Impostor Syndrome" in the Favourite section has real audio and lyrics. Its artist, album, year, cover art, and synchronised lyrics are parsed at runtime from the mp3's ID3 tags, not hardcoded in the app. If the file's tags change, the app picks up the new values automatically.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind documentation](https://www.nativewind.dev/)
- [gluestack-ui documentation](https://gluestack.io/ui/docs/home/overview/quick-start)
