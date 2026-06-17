#!/usr/bin/env node
// Re-scan the upstream "Learn Harness Engineering" repo and report whether any
// canonical template changed UPSTREAM since the last time this repo synced.
//
// It compares the current upstream templates against a baseline snapshot stored
// in .harness-baseline/. It does NOT compare against the local harness files,
// because those are intentionally customized — that comparison would always
// show "drift". This answers the real question: "did the source change?"
//
// Workflow:
//   1. cd into the source course repo and `git pull`.
//   2. From this repo run:  node scripts/scan-source.mjs
//   3. For each CHANGED template, review the upstream edit and merge anything
//      relevant into the matching local file by hand.
//   4. Accept the new upstream as the baseline: node scripts/scan-source.mjs --update
//
// Point at a different source checkout with:
//   HARNESS_SOURCE=/path/to/harness node scripts/scan-source.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const localRoot = path.resolve(here, '..');
const baselineDir = path.join(localRoot, '.harness-baseline');
const sourceRoot = path.resolve(
  process.env.HARNESS_SOURCE || path.join(localRoot, '..', 'harness')
);
const update = process.argv.includes('--update');

// upstream template (relative to source repo) -> baseline file name
const MAP = [
  ['docs/en/resources/templates/AGENTS.md', 'AGENTS.md'],
  ['docs/en/resources/templates/CLAUDE.md', 'CLAUDE.md'],
  ['docs/en/resources/templates/feature_list.json', 'feature_list.json'],
  ['docs/en/resources/templates/init.sh', 'init.sh'],
  ['docs/en/resources/templates/claude-progress.md', 'claude-progress.md'],
  ['skills/harness-creator/templates/session-handoff.md', 'session-handoff.md']
];

const norm = (s) => s.replace(/\r\n/g, '\n').trimEnd();

async function readMaybe(file) {
  if (!existsSync(file)) return null;
  return norm(await readFile(file, 'utf8'));
}

if (!existsSync(sourceRoot)) {
  console.error(`Source repo not found: ${sourceRoot}`);
  console.error('Set HARNESS_SOURCE to the course repo checkout and retry.');
  process.exit(2);
}

console.log(`Source  : ${sourceRoot}`);
console.log(`Baseline: ${baselineDir}\n`);

if (update) await mkdir(baselineDir, { recursive: true });

let changed = 0;
let missing = 0;
for (const [src, name] of MAP) {
  const upstream = await readMaybe(path.join(sourceRoot, src));
  if (upstream === null) {
    console.log(`SOURCE-MISSING  ${name.padEnd(22)} <- ${src}`);
    missing++;
    continue;
  }

  if (update) {
    await writeFile(path.join(baselineDir, name), upstream + '\n');
    console.log(`captured        ${name.padEnd(22)} <- ${src}`);
    continue;
  }

  const baseline = await readMaybe(path.join(baselineDir, name));
  let status;
  if (baseline === null) {
    status = 'NO-BASELINE';
    missing++;
  } else if (baseline === upstream) {
    status = 'unchanged';
  } else {
    status = 'CHANGED';
    changed++;
  }
  console.log(`${status.padEnd(15)} ${name.padEnd(22)} <- ${src}`);
}

console.log('');
if (update) {
  console.log('Baseline updated. Commit .harness-baseline/ to record this sync point.');
} else if (changed === 0 && missing === 0) {
  console.log('No upstream changes since last sync. Nothing to merge.');
} else {
  console.log(`${changed} upstream template(s) changed, ${missing} unresolved.`);
  console.log('Review the upstream edits, merge into local files, then run --update.');
}
process.exit(changed > 0 ? 1 : 0);
