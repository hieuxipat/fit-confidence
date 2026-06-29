#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Replace these commands with the correct commands for your repository.
INSTALL_CMD=(echo "TODO: replace with your install command, e.g. npm install")
VERIFY_CMD=(echo "TODO: replace with your verification command, e.g. npm test")
START_CMD=(echo "TODO: replace with your start command, e.g. npm run dev")

echo "==> Working directory: $PWD"

# Enable repo-managed git hooks (secret-scan pre-commit). Idempotent.
if [ -d .githooks ] && git rev-parse --git-dir >/dev/null 2>&1; then
  git config core.hooksPath .githooks
  echo "==> git hooks: core.hooksPath -> .githooks"
fi

echo "==> Syncing dependencies"
"${INSTALL_CMD[@]}"

echo "==> Running baseline verification"
"${VERIFY_CMD[@]}"

echo "==> Startup command"
printf '    %q' "${START_CMD[@]}"
printf '\n'

if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> Starting the app"
  exec "${START_CMD[@]}"
fi

echo "Set RUN_START_COMMAND=1 if you want init.sh to launch the app directly."
