#!/bin/bash
# Builds the static site into out-staging, then swaps it in as out/ in one step,
# so the page served from out/ (localhost:3737) never shows an error while a build runs.
set -e
cd "$(dirname "$0")/.."
rm -rf out-staging
BUILD_OUT_DIR=out-staging npm run build
[ -f out-staging/index.html ] || { echo "staged build has no index.html; leaving out/ untouched"; exit 1; }
rm -rf out-old
[ -d out ] && mv out out-old
mv out-staging out
rm -rf out-old
echo "swapped in new out/"
