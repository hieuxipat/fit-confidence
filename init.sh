#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Install: app dependencies (Vitest etc.) for the Shopify app under app/.
INSTALL_CMD=(bash -c 'cd "'"$ROOT_DIR"'/app" && npm install')
# Verify: unit tests, the Shopify extension build, then the harness integrity check.
VERIFY_CMD=(bash -c 'cd "'"$ROOT_DIR"'/app" && npm test && shopify app build && bash "'"$ROOT_DIR"'/scripts/verify-harness.sh"')
# Start: the storefront widget demo (preview on a dev store).
START_CMD=(bash -c 'cd "'"$ROOT_DIR"'/app" && shopify app dev')

echo "==> Working directory: $PWD"

# Pin Node version (matches .nvmrc). Warn — don't hard-fail — so verification still runs.
if [ -f .nvmrc ]; then
  want="$(cat .nvmrc)"
  have="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')"
  if [ -n "$have" ] && [ "$have" != "$want" ]; then
    echo "⚠️  Node major $have != .nvmrc ($want). Run: nvm install $want && nvm use" >&2
  fi
fi

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
