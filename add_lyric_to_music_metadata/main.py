#!/usr/bin/env python3
"""Embed synchronised LRC lyrics + basic tags/cover art into an MP3.

Usage:
    python main.py lagu.mp3 lirik.lrc [--lang eng] \\
        [--artist "Sidney Gish"] [--album "No Dogs Allowed"] [--year 2017] \\
        [--image image/cover.png]
"""

import argparse
import os
import re
import sys

from mutagen.id3 import (
    ID3,
    ID3NoHeaderError,
    SYLT,
    TPE1,
    TALB,
    TDRC,
    APIC,
    Encoding,
)

# [mm:ss.xx] or [mm:ss.xxx] timestamp, optionally followed by lyric text.
TIMESTAMP_RE = re.compile(r"\[(\d{2}):(\d{2})([.:]\d{2,3})?\]")
# Metadata header tags like [ar:...], [ti:...], [al:...], [length:...], [id:...]
HEADER_RE = re.compile(r"^\[[a-zA-Z#]+:.*\]$")

IMAGE_MAGIC = (
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"\xff\xd8\xff", "image/jpeg"),
)


def timestamp_to_ms(minutes: str, seconds: str, fraction: str | None) -> int:
    ms = int(minutes) * 60_000 + int(seconds) * 1000
    if fraction:
        frac_digits = fraction[1:]  # drop the leading '.' or ':'
        frac_ms = int(frac_digits.ljust(3, "0")[:3])
        ms += frac_ms
    return ms


def parse_lrc(path: str) -> list[tuple[str, int]]:
    """Parse an LRC file into a list of (text, timestamp_ms) pairs.

    Skips metadata headers ([ar:], [ti:], [al:], ...) and empty/instrumental
    lines (a timestamp with no following text).
    """
    lyrics: list[tuple[str, int]] = []

    with open(path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line:
                continue

            if HEADER_RE.match(line):
                continue

            matches = list(TIMESTAMP_RE.finditer(line))
            if not matches:
                # No timestamp on this line at all — not a lyric line, skip.
                continue

            # Text is whatever remains after stripping all leading timestamp tags
            # (a line can carry multiple timestamps sharing the same text).
            text = TIMESTAMP_RE.sub("", line).strip()
            if not text:
                # Timestamp with no text = instrumental/pause marker, exclude.
                continue

            for m in matches:
                minutes, seconds, fraction = m.group(1), m.group(2), m.group(3)
                ms = timestamp_to_ms(minutes, seconds, fraction)
                lyrics.append((text, ms))

    lyrics.sort(key=lambda pair: pair[1])
    return lyrics


def detect_image_mime(data: bytes) -> str:
    for magic, mime in IMAGE_MAGIC:
        if data.startswith(magic):
            return mime
    raise ValueError("Unrecognized image format (expected PNG or JPEG)")


def embed_metadata(
    mp3_path: str,
    lyrics: list[tuple[str, int]],
    lang: str,
    artist: str | None,
    album: str | None,
    year: str | None,
    image_path: str | None,
) -> None:
    try:
        tags = ID3(mp3_path)
    except ID3NoHeaderError:
        tags = ID3()

    # Remove existing frames of each kind first to avoid duplicates/stale copies.
    tags.delall("SYLT")
    tags.add(
        SYLT(
            encoding=Encoding.UTF8,
            lang=lang,
            format=2,  # timestamps in milliseconds
            type=1,  # 1 = lyrics
            desc="",
            text=lyrics,
        )
    )

    if artist:
        tags.delall("TPE1")
        tags.add(TPE1(encoding=Encoding.UTF8, text=[artist]))

    if album:
        tags.delall("TALB")
        tags.add(TALB(encoding=Encoding.UTF8, text=[album]))

    if year:
        tags.delall("TDRC")
        tags.add(TDRC(encoding=Encoding.UTF8, text=[str(year)]))

    if image_path:
        with open(image_path, "rb") as f:
            image_data = f.read()
        mime = detect_image_mime(image_data)
        tags.delall("APIC")
        tags.add(
            APIC(
                encoding=Encoding.UTF8,
                mime=mime,
                type=3,  # 3 = front cover
                desc="Cover",
                data=image_data,
            )
        )

    # ID3v2.3 has no UTF-8 encoding byte (would silently downgrade to UTF-16),
    # so use ID3v2.4 to honor Encoding.UTF8.
    tags.save(mp3_path, v2_version=4)


def main() -> int:
    parser = argparse.ArgumentParser(description="Embed LRC lyrics + tags/cover art into an MP3.")
    parser.add_argument("mp3", help="Path to the target .mp3 file")
    parser.add_argument("lrc", help="Path to the source .lrc file")
    parser.add_argument("--lang", default="eng", help="ISO 639-2 language code (default: eng)")
    parser.add_argument("--artist", help="Artist name (TPE1)")
    parser.add_argument("--album", help="Album name (TALB)")
    parser.add_argument("--year", help="Release year (TDRC)")
    parser.add_argument("--image", help="Path to a PNG/JPEG cover image (APIC)")
    args = parser.parse_args()

    if not os.path.isfile(args.mp3):
        print(f"Error: MP3 file not found: {args.mp3}", file=sys.stderr)
        return 1
    if not os.path.isfile(args.lrc):
        print(f"Error: LRC file not found: {args.lrc}", file=sys.stderr)
        return 1
    if args.image and not os.path.isfile(args.image):
        print(f"Error: image file not found: {args.image}", file=sys.stderr)
        return 1

    lyrics = parse_lrc(args.lrc)
    print(f"Parsed {len(lyrics)} lyric lines from {args.lrc}")

    if not lyrics:
        print("Error: no lyric lines parsed, aborting write.", file=sys.stderr)
        return 1

    embed_metadata(
        args.mp3, lyrics, args.lang, args.artist, args.album, args.year, args.image
    )

    extras = []
    if args.artist:
        extras.append(f"artist={args.artist}")
    if args.album:
        extras.append(f"album={args.album}")
    if args.year:
        extras.append(f"year={args.year}")
    if args.image:
        extras.append(f"cover={args.image}")
    extra_str = f", {', '.join(extras)}" if extras else ""
    print(f"Tags written to {args.mp3} (lang={args.lang}, {len(lyrics)} lines{extra_str})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
