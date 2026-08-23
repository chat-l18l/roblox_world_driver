#!/bin/sh
# Start Rojo live-sync. Run from anywhere; requires Rokit tools on PATH.
set -eu
cd "$(dirname "$0")"
if ! command -v rojo >/dev/null 2>&1; then
  echo "rojo niet gevonden. Eerst: rokit install (in rbx/) en restart de terminal."
  exit 1
fi
exec rojo serve
