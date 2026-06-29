#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Install: nothing to fetch yet for the harness itself (no app dependencies).
INSTALL_CMD=(echo "No external dependencies to install for the harness.")
# Verify: run the real harness integrity check (artifacts, JSON schema, hook self-tests).
VERIFY_CMD=(bash "$ROOT_DIR/scripts/verify-harness.sh")
# Start: the harness has no long-running app; this is the entrypoint reminder.
START_CMD=(echo "Harness has no app to start. Use the AGENTS.md workflow / slash-command flow.")

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
