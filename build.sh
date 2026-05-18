#!/usr/bin/env bash
set -euo pipefail

CONTENT_REPO="https://github.com/tpougy/blog-content.git"
CONTENT_DIR="$(dirname "$0")/content"

echo "Cloning blog-content..."
rm -rf "$CONTENT_DIR"
git clone --depth=1 "$CONTENT_REPO" "$CONTENT_DIR"

echo "Building..."
cd "$(dirname "$0")"
bun astro sync && bun astro build && bun pagefind --site dist

echo "Build complete."
