#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR/web"

PORT="${PORT:-5173}"

echo "Serving web client at http://localhost:${PORT}"
python3 -m http.server "$PORT"
