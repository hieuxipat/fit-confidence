# Keeping this harness in sync with the source course

This repo is a **customized copy** of the harness templates from the
*Learn Harness Engineering* course repo. The local files (`AGENTS.md`,
`CLAUDE.md`, `init.sh`, `feature_list.json`, ...) are intentionally edited for
this project, so they are NOT expected to match the upstream templates verbatim.

To stay current when the course repo changes:

```sh
# 1. Pull the latest source (in the course repo checkout)
cd ../harness && git pull

# 2. Scan for upstream template changes (in this repo)
cd ../harness-agent && node scripts/scan-source.mjs

# 3. For any row marked CHANGED, look at what moved upstream and merge the
#    relevant bits into the matching local file by hand.

# 4. Record the new upstream state as the baseline
node scripts/scan-source.mjs --update
git add .harness-baseline && git commit -m "Sync harness baseline with upstream"
```

## How the scan works

`scripts/scan-source.mjs` compares the current upstream templates against the
snapshot in `.harness-baseline/` (the upstream content as of the last sync). It
reports `CHANGED` only when **upstream itself** moved — independent of your local
customizations. This avoids the false "everything drifted" result you would get
from diffing upstream against the customized local files.

- Default source path: `../harness`
- Override with `HARNESS_SOURCE=/path/to/harness node scripts/scan-source.mjs`

## File mapping

| Local file | Upstream source |
|---|---|
| `AGENTS.md` | `docs/en/resources/templates/AGENTS.md` |
| `CLAUDE.md` | `docs/en/resources/templates/CLAUDE.md` |
| `feature_list.json` | `docs/en/resources/templates/feature_list.json` |
| `init.sh` | `docs/en/resources/templates/init.sh` |
| `claude-progress.md` | `docs/en/resources/templates/claude-progress.md` |
| `session-handoff.md` | `skills/harness-creator/templates/session-handoff.md` |
