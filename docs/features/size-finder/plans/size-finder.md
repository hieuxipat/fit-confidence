# Size Finder (Shopify Theme App Extension) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a real **Shopify app** whose **Theme App Extension** adds a "Find my size" widget to the product page; the widget calls a TDD-tested `recommendSize()` core.

**Architecture:** Shopify CLI scaffolds the app + a theme app extension under `app/`. The recommendation logic lives in a single self-contained ESM asset (`extensions/size-finder/assets/sizing.js`) — served to the storefront *and* unit-tested by Vitest (no bundler). A Liquid app block renders the button + modal (markup/CSS matching the prototype) and an inline module imports `sizing.js`. Verification runs `npm test` + `shopify app build` + the harness integrity check.

**Tech Stack:** Shopify CLI 3.85+, Theme App Extension (Liquid + ESM JS + CSS), Vitest, Node 20.

## Global Constraints

- Node pinned to **20** via `.nvmrc` (repo root); the app's `package.json` adds `"engines": { "node": ">=20" }`.
- Recommendation logic stays in `extensions/size-finder/assets/sizing.js` — pure, no DOM/network, ESM `export`. The size chart constant lives in the **same file** (avoid cross-asset ESM imports, which break under Shopify's hashed asset URLs).
- The block markup/CSS must look **visually equivalent** to `docs/features/size-finder/prototype/size-finder-widget.html` (UI source of truth).
- TDD: write the failing test first for every logic change. Sizes are exactly `S | M | L | XL`.
- `recommendSize` is **total**: out-of-range returns a best estimate; only invalid input throws `InvalidMeasurementError`.
- Prerequisite (manual, done by the operator): Shopify Partner account + dev store + `shopify auth login`. Do NOT commit `.env`/secrets; do not weaken `.claude/` guardrails.

---

### Task 1: Scaffold Shopify app + theme app extension + Vitest

**Files:**
- Create (via CLI): `app/` (Shopify app), `app/extensions/size-finder/` (theme app extension)
- Modify: `app/package.json`
- Create: `app/vitest.config.js`, `app/extensions/size-finder/assets/smoke.test.js`

**Interfaces:**
- Produces: a buildable Shopify app; working `npm test` (Vitest) in `app/`.

- [ ] **Step 1: Authenticate and scaffold the app** (interactive — operator runs)

```bash
shopify auth login
shopify app init --path app --name fit-confidence --template none
```
Expected: `app/` contains `shopify.app.toml` and a `package.json`. (If the CLI nests differently, treat the folder containing `shopify.app.toml` as the app root and adjust paths below.)

- [ ] **Step 2: Generate the theme app extension**

```bash
cd app && shopify app generate extension --type theme_app_extension --name size-finder
```
Expected: `app/extensions/size-finder/` with `shopify.extension.toml`, `blocks/`, `assets/`, `snippets/`, `locales/` (a sample block is created — we replace it in Task 6).

- [ ] **Step 3: Add Vitest to `app/package.json`**

Add `"test": "vitest run"` to `scripts`, an `engines` field, and Vitest as a dev dependency:

```json
{
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^1.6.0"
  }
}
```
(Merge into the CLI-generated file — keep its existing `dev`/`build`/`deploy` scripts and deps.)

- [ ] **Step 4: Create `app/vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { globals: true, environment: 'node', include: ['extensions/**/*.test.js'] },
});
```

- [ ] **Step 5: Create `app/extensions/size-finder/assets/smoke.test.js`**

```js
import { describe, it, expect } from 'vitest';

describe('tooling', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Install and run the smoke test**

Run: `cd app && npm install && npm test`
Expected: 1 test file, 1 test passing.

- [ ] **Step 7: Commit**

```bash
git add app .gitignore
git commit -m "chore: scaffold Shopify app + size-finder theme extension + Vitest"
```
(Ensure `app/node_modules/` and any `.env` are git-ignored.)

---

### Task 2: `recommendSize` — exact match (RED → GREEN)

**Files:**
- Create: `app/extensions/size-finder/assets/sizing.js`
- Test: `app/extensions/size-finder/assets/sizing.test.js`

**Interfaces:**
- Produces: `recommendSize(m, chart)`, `TSHIRT_CHART`, `InvalidMeasurementError` (ESM exports). `m = { height_cm, weight_kg, fit }`, returns `{ size, reason, exact }`.

- [ ] **Step 1: Write the failing test `assets/sizing.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { recommendSize, TSHIRT_CHART } from './sizing.js';

describe('recommendSize — exact match', () => {
  it('170/65/regular -> M', () => {
    const r = recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('M');
    expect(r.exact).toBe(true);
    expect(r.reason).toContain('M');
  });
  it('185/90/regular -> XL', () => {
    expect(recommendSize({ height_cm: 185, weight_kg: 90, fit: 'regular' }, TSHIRT_CHART).size).toBe('XL');
  });
  it('160/52/regular -> S', () => {
    expect(recommendSize({ height_cm: 160, weight_kg: 52, fit: 'regular' }, TSHIRT_CHART).size).toBe('S');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test`
Expected: FAIL — `./sizing.js` / `recommendSize` missing.

- [ ] **Step 3: Write minimal implementation `assets/sizing.js`**

```js
export const TSHIRT_CHART = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];

function contains(row, m) {
  return m.height_cm >= row.height_min && m.height_cm <= row.height_max &&
         m.weight_kg >= row.weight_min && m.weight_kg <= row.weight_max;
}

export function recommendSize(m, chart) {
  const match = chart.find((row) => contains(row, m));
  if (match) {
    return {
      size: match.size,
      exact: true,
      reason: `${m.height_cm}cm & ${m.weight_kg}kg fall in ${match.size} ` +
        `(${match.height_min}-${match.height_max}cm, ${match.weight_min}-${match.weight_max}kg); ${m.fit} fit kept.`,
    };
  }
  // Placeholder until Task 4 adds nearest-match.
  return { size: chart[0].size, exact: false, reason: 'no exact match' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test`
Expected: PASS (exact-match cases green).

- [ ] **Step 5: Commit**

```bash
git add app/extensions/size-finder/assets/sizing.js app/extensions/size-finder/assets/sizing.test.js
git commit -m "feat: recommendSize exact-match by height and weight (TDD)"
```

---

### Task 3: `recommendSize` — validation and errors

**Files:**
- Modify: `app/extensions/size-finder/assets/sizing.js`
- Test: `app/extensions/size-finder/assets/sizing.test.js` (add cases)

**Interfaces:**
- Produces: throws `InvalidMeasurementError` on bad input; `Error('size chart is empty')` on empty chart.

- [ ] **Step 1: Add failing tests**

```js
import { InvalidMeasurementError } from './sizing.js';

describe('recommendSize — validation', () => {
  it('throws on non-positive height', () => {
    expect(() => recommendSize({ height_cm: 0, weight_kg: 65, fit: 'regular' }, TSHIRT_CHART)).toThrow(InvalidMeasurementError);
  });
  it('throws on absurd weight', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 999, fit: 'regular' }, TSHIRT_CHART)).toThrow(InvalidMeasurementError);
  });
  it('throws on invalid fit', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 65, fit: 'baggy' }, TSHIRT_CHART)).toThrow(InvalidMeasurementError);
  });
  it('throws on empty chart', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, [])).toThrow('size chart is empty');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test`
Expected: FAIL — no validation yet.

- [ ] **Step 3: Add the error class + `validate()` and call it first**

Add at the top of `sizing.js`:

```js
export class InvalidMeasurementError extends Error {
  constructor(message) { super(message); this.name = 'InvalidMeasurementError'; }
}

function validate(m, chart) {
  if (chart.length === 0) throw new Error('size chart is empty');
  if (!Number.isFinite(m.height_cm) || m.height_cm <= 0 || m.height_cm > 260)
    throw new InvalidMeasurementError(`invalid height_cm: ${m.height_cm}`);
  if (!Number.isFinite(m.weight_kg) || m.weight_kg <= 0 || m.weight_kg > 400)
    throw new InvalidMeasurementError(`invalid weight_kg: ${m.weight_kg}`);
  if (m.fit !== 'slim' && m.fit !== 'regular' && m.fit !== 'relaxed')
    throw new InvalidMeasurementError(`invalid fit: ${m.fit}`);
}
```

Make the first line of `recommendSize`: `validate(m, chart);`

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/extensions/size-finder/assets/sizing.js app/extensions/size-finder/assets/sizing.test.js
git commit -m "feat: validate measurements and reject bad input"
```

---

### Task 4: `recommendSize` — out-of-range nearest match

**Files:**
- Modify: `app/extensions/size-finder/assets/sizing.js`
- Test: same test file (add a case)

- [ ] **Step 1: Add failing test**

```js
describe('recommendSize — out of range', () => {
  it('205/120 -> nearest XL, exact false', () => {
    const r = recommendSize({ height_cm: 205, weight_kg: 120, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('XL');
    expect(r.exact).toBe(false);
    expect(r.reason.toLowerCase()).toContain('estimate');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test`
Expected: FAIL — placeholder returns `chart[0]` ('S') / 'no exact match'.

- [ ] **Step 3: Add `nearest()` and replace the placeholder branch**

Add helper:

```js
function nearest(chart, m) {
  let best = chart[0], bestDist = Infinity;
  for (const row of chart) {
    const ch = (row.height_min + row.height_max) / 2;
    const cw = (row.weight_min + row.weight_max) / 2;
    const dh = (m.height_cm - ch) / 10, dw = (m.weight_kg - cw) / 8;
    const dist = dh * dh + dw * dw;
    if (dist < bestDist) { bestDist = dist; best = row; }
  }
  return best;
}
```

Replace the placeholder `return` at the end of `recommendSize` with:

```js
  const near = nearest(chart, m);
  return {
    size: near.size,
    exact: false,
    reason: `${m.height_cm}cm & ${m.weight_kg}kg are outside the chart; closest size is ${near.size} (estimate).`,
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/extensions/size-finder/assets/sizing.js app/extensions/size-finder/assets/sizing.test.js
git commit -m "feat: nearest-size estimate for out-of-range measurements"
```

---

### Task 5: `recommendSize` — fit adjustment

**Files:**
- Modify: `app/extensions/size-finder/assets/sizing.js`
- Test: same test file (add cases)

- [ ] **Step 1: Add failing tests**

```js
describe('recommendSize — fit adjustment', () => {
  it('174/68 regular stays M, relaxed -> L', () => {
    expect(recommendSize({ height_cm: 174, weight_kg: 68, fit: 'regular' }, TSHIRT_CHART).size).toBe('M');
    expect(recommendSize({ height_cm: 174, weight_kg: 68, fit: 'relaxed' }, TSHIRT_CHART).size).toBe('L');
  });
  it('168/61 slim -> S', () => {
    expect(recommendSize({ height_cm: 168, weight_kg: 61, fit: 'slim' }, TSHIRT_CHART).size).toBe('S');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test`
Expected: FAIL — fit currently ignored.

- [ ] **Step 3: Add `ORDER` + `shiftForFit()` and apply it in the exact-match branch**

Add near the top:

```js
const ORDER = ['S', 'M', 'L', 'XL'];

function shiftForFit(size, m, row) {
  if (m.fit === 'regular') return size;
  const span = row.height_max - row.height_min;
  const pos = span > 0 ? (m.height_cm - row.height_min) / span : 0.5;
  const i = ORDER.indexOf(size);
  if (m.fit === 'slim' && pos <= 0.34 && i > 0) return ORDER[i - 1];
  if (m.fit === 'relaxed' && pos >= 0.66 && i < ORDER.length - 1) return ORDER[i + 1];
  return size;
}
```

Update the exact-match branch:

```js
  if (match) {
    const finalSize = shiftForFit(match.size, m, match);
    const adjusted = finalSize !== match.size;
    const reason = adjusted
      ? `${m.height_cm}cm & ${m.weight_kg}kg fit ${match.size}; ${m.fit} fit adjusts to ${finalSize}.`
      : `${m.height_cm}cm & ${m.weight_kg}kg fall in ${match.size} ` +
        `(${match.height_min}-${match.height_max}cm, ${match.weight_min}-${match.weight_max}kg); ${m.fit} fit kept.`;
    return { size: finalSize, exact: true, reason };
  }
```

- [ ] **Step 4: Run test to verify all pass**

Run: `cd app && npm test`
Expected: PASS — full suite green.

- [ ] **Step 5: Commit**

```bash
git add app/extensions/size-finder/assets/sizing.js app/extensions/size-finder/assets/sizing.test.js
git commit -m "feat: adjust recommended size by fit preference (TDD)"
```

---

### Task 6: Theme app block + widget UI (match the prototype)

**Files:**
- Modify/Create: `app/extensions/size-finder/blocks/size-finder.liquid`
- Create: `app/extensions/size-finder/assets/size-finder.css`
- Reference: `docs/features/size-finder/prototype/size-finder-widget.html` (copy the markup/CSS)

**Interfaces:**
- Consumes: `recommendSize`, `TSHIRT_CHART` from `sizing.js` (imported in an inline module via `asset_url`).
- Produces: a merchant-addable app block that renders the Find-my-size button + modal.

- [ ] **Step 1: Write `blocks/size-finder.liquid`**

Port the prototype markup; load the CSS via `asset_url`; wire behavior in an inline module that imports the tested logic. Keep the `{% schema %}` consistent with the CLI-generated sample block (adjust `target` to match).

```liquid
{{ 'size-finder.css' | asset_url | stylesheet_tag }}

<div class="sf-wrap">
  <button type="button" id="sf-open" class="sf-link">📏 Find my size</button>

  <div id="sf-modal" class="sf-modal" hidden role="dialog" aria-modal="true" aria-labelledby="sf-title">
    <div class="sf-card">
      <h2 id="sf-title">Find my size</h2>
      <div class="sf-field"><label for="sf-h">Height (cm)</label><input id="sf-h" type="number" value="170" aria-describedby="sf-err"></div>
      <div class="sf-field"><label for="sf-w">Weight (kg)</label><input id="sf-w" type="number" value="65" aria-describedby="sf-err"></div>
      <div class="sf-field"><label for="sf-fit">Fit</label>
        <select id="sf-fit"><option value="slim">Slim</option><option value="regular" selected>Regular</option><option value="relaxed">Relaxed</option></select>
      </div>
      <button type="button" id="sf-go" class="sf-btn sf-btn--block">Recommend</button>
      <p id="sf-err" class="sf-error" role="alert" hidden></p>
      <div id="sf-result" class="sf-result" hidden>
        <div id="sf-badge" class="sf-badge"></div>
        <p id="sf-reason" class="sf-reason"></p>
        <span id="sf-tag" class="sf-tag" hidden>estimate</span>
      </div>
      <button type="button" id="sf-close" class="sf-btn sf-btn--ghost">Close</button>
    </div>
  </div>
</div>

<script type="module">
  import { recommendSize, TSHIRT_CHART } from "{{ 'sizing.js' | asset_url }}";
  const $ = (id) => document.getElementById(id);
  const modal = $('sf-modal'); let last = null;
  $('sf-open').addEventListener('click', () => { last = document.activeElement; modal.hidden = false; $('sf-h').focus(); });
  $('sf-close').addEventListener('click', () => { modal.hidden = true; if (last) last.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) { modal.hidden = true; if (last) last.focus(); } });
  $('sf-go').addEventListener('click', () => {
    const err = $('sf-err'), res = $('sf-result'), tag = $('sf-tag');
    err.hidden = true; res.hidden = true; tag.hidden = true;
    try {
      const rec = recommendSize({ height_cm: Number($('sf-h').value), weight_kg: Number($('sf-w').value), fit: $('sf-fit').value }, TSHIRT_CHART);
      $('sf-badge').textContent = rec.size; $('sf-reason').textContent = rec.reason; tag.hidden = rec.exact; res.hidden = false;
    } catch (e) { err.textContent = e.message; err.hidden = false; }
  });
</script>

{% schema %}
{ "name": "Size Finder", "target": "section", "settings": [] }
{% endschema %}
```

- [ ] **Step 2: Create `assets/size-finder.css`**

Copy the `<style>` rules from the prototype (`docs/features/size-finder/prototype/size-finder-widget.html`), renaming selectors to the `sf-` prefixes used above (`.sf-modal`, `.sf-card`, `.sf-field`, `.sf-btn`, `.sf-error`, `.sf-result`, `.sf-badge`, `.sf-tag`). Keep the modal overlay, card layout, badge size, and estimate tag styling visually equivalent.

- [ ] **Step 3: Validate the extension builds**

Run: `cd app && shopify app build`
Expected: build succeeds (extension config + assets valid).

- [ ] **Step 4: Preview on a dev store** (manual)

Run: `cd app && shopify app dev`
Expected: follow the URL → theme editor → add the **Size Finder** block to the product page → storefront → "Find my size" → `170/65/regular` → **M**. Try `0` height → inline error.

- [ ] **Step 5: Commit**

```bash
git add app/extensions/size-finder/blocks/size-finder.liquid app/extensions/size-finder/assets/size-finder.css
git commit -m "feat: Size Finder theme app block + widget UI (matches prototype)"
```

---

### Task 7: Wire verification into the harness and record state

**Files:**
- Modify: `init.sh`, `feature_list.json`

**Interfaces:**
- Produces: `./init.sh` runs Node check → `npm install`/`test`/`shopify app build` in `app/` → harness integrity check; `feature_list.json` records `feat-app` with evidence.

- [ ] **Step 1: Add the Node check + app build to `init.sh`**

After `cd "$ROOT_DIR"`, add:

```bash
if [ -f .nvmrc ]; then
  want="$(cat .nvmrc)"; have="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')"
  if [ -n "$have" ] && [ "$have" != "$want" ]; then
    echo "⚠️  Node major $have != .nvmrc ($want). Run: nvm install $want && nvm use" >&2
  fi
fi
```

Set the command block to install + test + build the app, then the harness check:

```bash
INSTALL_CMD=(bash -c 'cd "'"$ROOT_DIR"'/app" && npm install')
VERIFY_CMD=(bash -c 'cd "'"$ROOT_DIR"'/app" && npm test && shopify app build && bash "'"$ROOT_DIR"'/scripts/verify-harness.sh"')
START_CMD=(bash -c 'cd "'"$ROOT_DIR"'/app" && shopify app dev')
```

- [ ] **Step 2: Run the full startup path**

Run: `./init.sh`
Expected: Node check, deps install, Vitest green, `shopify app build` succeeds, harness `RESULT: PASS`, exit 0. **Save this raw output as demo evidence.** (If `shopify app build` needs login, run `shopify auth login` first.)

- [ ] **Step 3: Add the app feature to `feature_list.json`**

Add to the `features` array (after `feat-flow`):

```json
{
  "id": "feat-app",
  "title": "Size Finder Shopify app (theme app extension)",
  "source_idea": "docs/features/size-finder/specs/size-finder-design.md",
  "tasks": [
    {
      "id": "task-app-recommender",
      "title": "recommendSize() core logic, fully TDD",
      "requirements": ["Exact match, fit adjustment, out-of-range estimate, input validation."],
      "status": "passing",
      "spec_ids": ["size-finder-design"],
      "plan_ref": "docs/features/size-finder/plans/size-finder.md",
      "review": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "release": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "dod": [
        { "criterion": "Vitest suite passes (exact, validation, out-of-range, fit)", "met": true, "evidence": "npm test green; ./init.sh PASS" }
      ],
      "evidence": ["./init.sh RESULT: PASS — tests + shopify app build + harness check"],
      "notes": "TDD RED->GREEN visible in commit history."
    },
    {
      "id": "task-app-block",
      "title": "Theme app block + widget UI",
      "requirements": ["App block renders button + modal; calls recommendSize; matches prototype."],
      "status": "passing",
      "spec_ids": ["size-finder-design"],
      "plan_ref": "docs/features/size-finder/plans/size-finder.md",
      "review": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "release": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "dod": [
        { "criterion": "shopify app build succeeds; block shows M for 170/65/regular on dev store", "met": true, "evidence": "shopify app dev demo" }
      ],
      "evidence": ["shopify app dev: block added to PDP, 170/65/regular -> M"],
      "notes": "UI matches docs/features/size-finder/prototype/. Admin chart editor cut from MVP."
    }
  ]
}
```

- [ ] **Step 4: Validate state + harness**

Run: `./init.sh`
Expected: `feature_list.json matches schema` green; overall `RESULT: PASS`.

- [ ] **Step 5: Commit**

```bash
git add init.sh feature_list.json
git commit -m "chore: run app tests + shopify build in init.sh; record Size Finder feature"
```

---

## Self-Review

**Spec coverage:** §1 scope (theme app extension, admin cut) → Tasks 1, 6. §2 architecture (app/extensions, sizing.js ESM) → Tasks 1, 2, 6. §3 logic → Tasks 2–5. §4 errors → Task 3 (+ out-of-range Task 4). §5 data flow → Task 6 block. §6 testing → Tasks 2–5 (TDD). §7 verification → Task 7. §8 demo (`shopify app dev`) → Task 6 step 4 + Task 7 step 2. Prerequisites → Task 1 step 1. ✓

**Placeholder scan:** Task 2 ships a temporary branch replaced in Task 4 (real, runnable, stated successor). Task 6 step 2 says "copy the prototype CSS, rename to `sf-` selectors" — the source file and exact selector list are named, not a vague TODO. The `{% schema %}` is given with a note to align `target` with the CLI sample. No bare TODOs. ✓

**Type/name consistency:** `recommendSize(m, chart)` → `{ size, reason, exact }`; `TSHIRT_CHART`; `InvalidMeasurementError`; helpers `contains`/`validate`/`nearest`/`shiftForFit`; `ORDER`; DOM ids `sf-*` consistent between the Liquid markup and the inline module. App root `app/` used consistently in init.sh + commands. ✓
