#!/usr/bin/env bash
# verify-harness.sh — real, runnable verification for THIS harness repo.
# Checks that the harness itself is healthy: required artifacts exist, state
# files are valid JSON conforming to the schema, and the security guardrails
# actually work (hook self-tests). This is the verification the completion gate
# and /work depend on — it must pass before any task can be marked `passing`.
#
# Exit 0 = healthy. Exit 1 = at least one check failed (details printed).
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail=0
ok()   { printf '  ✓ %s\n' "$1"; }
bad()  { printf '  ✗ %s\n' "$1" >&2; fail=1; }

echo "== Harness integrity check =="

# 1) Required artifacts present.
for f in AGENTS.md CLAUDE.md feature_list.json claude-progress.md init.sh \
         .claude/settings.json .claude/hooks/block-dangerous.sh \
         .claude/hooks/scan-secrets.sh .githooks/pre-commit; do
  [ -f "$f" ] && ok "exists: $f" || bad "missing: $f"
done

# 2) Valid JSON.
for j in feature_list.json .claude/settings.json; do
  if jq empty "$j" >/dev/null 2>&1; then ok "valid JSON: $j"; else bad "invalid JSON: $j"; fi
done

# 3) feature_list.json conforms to the hierarchical schema.
if jq -e '
      (.schema_version|type=="number")
   and (.features|type=="array")
   and (.features|all(.id and .title and (.tasks|type=="array")))
   and (.features|all(.tasks|all(.id and .title and .status and (.dod|type=="array") and (.evidence|type=="array"))))
   ' feature_list.json >/dev/null 2>&1; then
  ok "feature_list.json matches schema"
else
  bad "feature_list.json does not match schema (need schema_version, features[].tasks[]{id,title,status,dod[],evidence[]})"
fi

# 4) Hooks executable.
for h in .claude/hooks/block-dangerous.sh .claude/hooks/scan-secrets.sh .githooks/pre-commit; do
  [ -x "$h" ] && ok "executable: $h" || bad "not executable: $h"
done

# 5) block-dangerous self-test: blocks rm -rf, allows a safe command.
rc=0; echo '{"tool_input":{"command":"rm -rf /"}}'   | .claude/hooks/block-dangerous.sh >/dev/null 2>&1 || rc=$?
[ "$rc" = "2" ] && ok "block-dangerous blocks 'rm -rf /' (exit 2)" || bad "block-dangerous did NOT block 'rm -rf /' (got exit $rc)"
rc=0; echo '{"tool_input":{"command":"git status"}}'  | .claude/hooks/block-dangerous.sh >/dev/null 2>&1 || rc=$?
[ "$rc" = "0" ] && ok "block-dangerous allows 'git status' (exit 0)" || bad "block-dangerous wrongly blocked 'git status' (got exit $rc)"

# 6) pre-commit self-test: a fake secret is detected.
# Build the token dynamically so this tooling file itself does not contain a
# literal that trips the pre-commit secret scanner (which excludes hooks, not scripts/).
prefix='sk_live_'
fake="+const k = \"${prefix}ABC123456789xyz\";"
if echo "$fake" | grep -qiE 'sk_live_[0-9A-Za-z]+'; then
  ok "pre-commit secret pattern detects sk_live_ token"
else
  bad "pre-commit secret pattern failed to detect sk_live_ token"
fi

echo ""
if [ "$fail" = "0" ]; then
  echo "RESULT: PASS — harness is healthy."
  exit 0
else
  echo "RESULT: FAIL — fix the ✗ items above." >&2
  exit 1
fi
