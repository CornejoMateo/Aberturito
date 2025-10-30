#!/bin/zsh
set -euo pipefail

SRC="public/logo-ar.png"
OUTDIR="public/icons"

if [ ! -f "$SRC" ]; then
  echo "Source image $SRC not found. Please place your logo at $SRC"
  exit 1
fi

mkdir -p "$OUTDIR"

# Generate common sizes used for PWA
sips -z 192 192 "$SRC" --out "$OUTDIR/icon-192.png"
sips -z 512 512 "$SRC" --out "$OUTDIR/icon-512.png"
sips -z 1024 1024 "$SRC" --out "$OUTDIR/icon-1024.png"
sips -z 180 180 "$SRC" --out "$OUTDIR/icon-180.png"

echo "Generated icons in $OUTDIR:"
ls -lh "$OUTDIR" || true

echo "Done. Update manifest or layout if you changed paths."
