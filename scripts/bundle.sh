#!/usr/bin/env sh
# Build a distributable plugin zip at build/navsweeper.zip.
# Run via `bun run bundle`.
set -eu

cd "$(dirname "$0")/.."

SLUG=navsweeper
OUT=build/$SLUG
rm -rf build
mkdir -p "$OUT"

# Allowlist: only what WordPress reads at runtime.
cp "$SLUG.php" readme.txt LICENSE changelog.txt "$OUT/"
cp -r includes views assets "$OUT/"
[ -d languages ] && [ -n "$(ls -A languages)" ] && cp -r languages "$OUT/"

find "$OUT" -type d -empty -delete

(cd build && bestzip "$SLUG.zip" "$SLUG")
rm -rf "$OUT"
echo "Wrote build/$SLUG.zip ($(du -h "build/$SLUG.zip" | cut -f1))"
