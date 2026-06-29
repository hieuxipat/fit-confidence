# Size Finder MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a demoable "Size Finder" — a TDD-tested `recommendSize()` core plus a storefront-style widget that calls it — in the `fit-confidence` repo.

**Architecture:** A pure, framework-free TypeScript function (`src/lib/sizing.ts`) holds all recommendation logic and is fully unit-tested with Vitest. A thin browser widget (`src/widget/`) collects height/weight/fit and renders the result. A seed size chart lives in `src/data/`. Vite serves the demo; `init.sh` runs install → test → build → harness check.

**Tech Stack:** TypeScript, Vite, Vitest. No Shopify CLI / OAuth (deliberate scope cut — runs standalone, structured to later become a theme extension).

## Global Constraints

- Node version pinned to **20** via `.nvmrc` (already in repo); `package.json` declares `"engines": { "node": ">=20" }` and `init.sh` warns on mismatch.
- Units: height in **cm**, weight in **kg**.
- All recommendation logic stays in `src/lib/sizing.ts` — pure, no DOM/network.
- TDD: write the failing test first for every logic change.
- Sizes are exactly `S | M | L | XL`, ordered S→XL.
- `recommendSize` is **total**: out-of-range returns a best estimate; only invalid input throws `InvalidMeasurementError`.
- Do not weaken the `.claude/` guardrails; commits pass the pre-commit secret hook.

---

### Task 1: Project scaffold (TypeScript + Vite + Vitest)

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`
- Test: `src/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: working `npm test` / `npm run build` / `npm run dev` scripts.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "fit-confidence",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.6.0"
  }
}
```

The `engines` field matches `.nvmrc` (Node 20) — keep them in sync.

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"],
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { globals: true, environment: 'node' },
});
```

- [ ] **Step 4: Create `src/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('tooling', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Install and run the smoke test**

Run: `npm install && npm test`
Expected: 1 test file, 1 test passing.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json vite.config.ts src/smoke.test.ts package-lock.json
git commit -m "chore: scaffold TypeScript + Vite + Vitest project"
```

---

### Task 2: Types and seed size chart

**Files:**
- Create: `src/lib/types.ts`, `src/data/tshirt-chart.ts`
- Test: `src/data/tshirt-chart.test.ts`

**Interfaces:**
- Produces: `Fit`, `Size`, `Measurement`, `SizeRow`, `SizeChart`, `Recommendation`, `InvalidMeasurementError` (from `types.ts`); `TSHIRT_CHART: SizeChart` (from `tshirt-chart.ts`).

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
export type Fit = 'slim' | 'regular' | 'relaxed';
export type Size = 'S' | 'M' | 'L' | 'XL';

export interface Measurement {
  height_cm: number;
  weight_kg: number;
  fit: Fit;
}

export interface SizeRow {
  size: Size;
  height_min: number;
  height_max: number;
  weight_min: number;
  weight_max: number;
}

export type SizeChart = SizeRow[];

export interface Recommendation {
  size: Size;
  reason: string;
  exact: boolean;
}

export class InvalidMeasurementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMeasurementError';
  }
}
```

- [ ] **Step 2: Create `src/data/tshirt-chart.ts`**

```ts
import type { SizeChart } from '../lib/types';

// Contiguous, realistic t-shirt ranges (height cm, weight kg).
export const TSHIRT_CHART: SizeChart = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];
```

- [ ] **Step 3: Write the failing test `src/data/tshirt-chart.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { TSHIRT_CHART } from './tshirt-chart';

describe('TSHIRT_CHART', () => {
  it('has the four sizes in order', () => {
    expect(TSHIRT_CHART.map((r) => r.size)).toEqual(['S', 'M', 'L', 'XL']);
  });

  it('has min <= max for every row', () => {
    for (const r of TSHIRT_CHART) {
      expect(r.height_min).toBeLessThanOrEqual(r.height_max);
      expect(r.weight_min).toBeLessThanOrEqual(r.weight_max);
    }
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: PASS (chart already defined to satisfy it).

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/data/tshirt-chart.ts src/data/tshirt-chart.test.ts
git commit -m "feat: add size types and seed t-shirt chart"
```

---

### Task 3: `recommendSize` — exact match (RED → GREEN)

**Files:**
- Create: `src/lib/sizing.ts`
- Test: `src/lib/sizing.test.ts`

**Interfaces:**
- Consumes: `Measurement`, `SizeChart`, `Recommendation` from `./types`; `TSHIRT_CHART` from `../data/tshirt-chart`.
- Produces: `recommendSize(m: Measurement, chart: SizeChart): Recommendation`.

- [ ] **Step 1: Write the failing test `src/lib/sizing.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { recommendSize } from './sizing';
import { TSHIRT_CHART } from '../data/tshirt-chart';

describe('recommendSize — exact match', () => {
  it('170cm / 65kg / regular -> M', () => {
    const r = recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('M');
    expect(r.exact).toBe(true);
    expect(r.reason).toContain('M');
  });

  it('185cm / 90kg / regular -> XL', () => {
    const r = recommendSize({ height_cm: 185, weight_kg: 90, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('XL');
    expect(r.exact).toBe(true);
  });

  it('160cm / 52kg / regular -> S', () => {
    const r = recommendSize({ height_cm: 160, weight_kg: 52, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('S');
    expect(r.exact).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `recommendSize` not exported / module missing.

- [ ] **Step 3: Write minimal implementation `src/lib/sizing.ts`**

```ts
import {
  SizeChart, SizeRow, Measurement, Recommendation,
} from './types';

function contains(row: SizeRow, m: Measurement): boolean {
  return (
    m.height_cm >= row.height_min && m.height_cm <= row.height_max &&
    m.weight_kg >= row.weight_min && m.weight_kg <= row.weight_max
  );
}

export function recommendSize(m: Measurement, chart: SizeChart): Recommendation {
  const match = chart.find((row) => contains(row, m));
  if (match) {
    return {
      size: match.size,
      exact: true,
      reason: `${m.height_cm}cm & ${m.weight_kg}kg fall in ${match.size} ` +
        `(${match.height_min}-${match.height_max}cm, ${match.weight_min}-${match.weight_max}kg); ` +
        `${m.fit} fit kept.`,
    };
  }
  // Placeholder until Task 5 adds nearest-match; return first row for now.
  return { size: chart[0].size, exact: false, reason: 'no exact match' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (exact-match tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sizing.ts src/lib/sizing.test.ts
git commit -m "feat: recommendSize exact-match by height and weight (TDD)"
```

---

### Task 4: `recommendSize` — input validation and errors

**Files:**
- Modify: `src/lib/sizing.ts`
- Test: `src/lib/sizing.test.ts` (add cases)

**Interfaces:**
- Consumes: `InvalidMeasurementError` from `./types`.
- Produces: `recommendSize` throws `InvalidMeasurementError` on bad input and `Error('size chart is empty')` on empty chart.

- [ ] **Step 1: Add failing tests to `src/lib/sizing.test.ts`**

```ts
import { InvalidMeasurementError } from './types';

describe('recommendSize — validation', () => {
  it('throws on non-positive height', () => {
    expect(() => recommendSize({ height_cm: 0, weight_kg: 65, fit: 'regular' }, TSHIRT_CHART))
      .toThrow(InvalidMeasurementError);
  });

  it('throws on absurd weight', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 999, fit: 'regular' }, TSHIRT_CHART))
      .toThrow(InvalidMeasurementError);
  });

  it('throws on invalid fit', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 65, fit: 'baggy' as never }, TSHIRT_CHART))
      .toThrow(InvalidMeasurementError);
  });

  it('throws on empty chart', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, []))
      .toThrow('size chart is empty');
  });
});
```

- [ ] **Step 2: Run test to verify the new cases fail**

Run: `npm test`
Expected: FAIL — no validation yet (no throw).

- [ ] **Step 3: Add `validate()` and call it first in `src/lib/sizing.ts`**

Add the import and function, and call `validate` at the top of `recommendSize`:

```ts
import {
  SizeChart, SizeRow, Measurement, Recommendation, InvalidMeasurementError,
} from './types';

function validate(m: Measurement, chart: SizeChart): void {
  if (chart.length === 0) throw new Error('size chart is empty');
  if (!Number.isFinite(m.height_cm) || m.height_cm <= 0 || m.height_cm > 260)
    throw new InvalidMeasurementError(`invalid height_cm: ${m.height_cm}`);
  if (!Number.isFinite(m.weight_kg) || m.weight_kg <= 0 || m.weight_kg > 400)
    throw new InvalidMeasurementError(`invalid weight_kg: ${m.weight_kg}`);
  if (m.fit !== 'slim' && m.fit !== 'regular' && m.fit !== 'relaxed')
    throw new InvalidMeasurementError(`invalid fit: ${m.fit}`);
}
```

Then make the first line of `recommendSize`:

```ts
export function recommendSize(m: Measurement, chart: SizeChart): Recommendation {
  validate(m, chart);
  // ... existing match logic ...
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (all validation cases throw correctly).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sizing.ts src/lib/sizing.test.ts
git commit -m "feat: validate measurements and reject bad input"
```

---

### Task 5: `recommendSize` — out-of-range nearest match

**Files:**
- Modify: `src/lib/sizing.ts`
- Test: `src/lib/sizing.test.ts` (add cases)

**Interfaces:**
- Produces: when no row contains the measurement, returns the nearest size with `exact: false`.

- [ ] **Step 1: Add failing test to `src/lib/sizing.test.ts`**

```ts
describe('recommendSize — out of range', () => {
  it('205cm / 120kg -> nearest XL, exact false', () => {
    const r = recommendSize({ height_cm: 205, weight_kg: 120, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('XL');
    expect(r.exact).toBe(false);
    expect(r.reason.toLowerCase()).toContain('estimate');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — current placeholder returns `chart[0]` ('S') with reason 'no exact match'.

- [ ] **Step 3: Replace the placeholder branch with a `nearest()` helper in `src/lib/sizing.ts`**

Add the helper:

```ts
function nearest(chart: SizeChart, m: Measurement): SizeRow {
  let best = chart[0];
  let bestDist = Infinity;
  for (const row of chart) {
    const ch = (row.height_min + row.height_max) / 2;
    const cw = (row.weight_min + row.weight_max) / 2;
    const dh = (m.height_cm - ch) / 10;
    const dw = (m.weight_kg - cw) / 8;
    const dist = dh * dh + dw * dw;
    if (dist < bestDist) { bestDist = dist; best = row; }
  }
  return best;
}
```

Replace the placeholder `return` at the end of `recommendSize` with:

```ts
  const near = nearest(chart, m);
  return {
    size: near.size,
    exact: false,
    reason: `${m.height_cm}cm & ${m.weight_kg}kg are outside the chart; ` +
      `closest size is ${near.size} (estimate).`,
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (XL nearest, exact false, reason contains "estimate").

- [ ] **Step 5: Commit**

```bash
git add src/lib/sizing.ts src/lib/sizing.test.ts
git commit -m "feat: nearest-size estimate for out-of-range measurements"
```

---

### Task 6: `recommendSize` — fit adjustment

**Files:**
- Modify: `src/lib/sizing.ts`
- Test: `src/lib/sizing.test.ts` (add cases)

**Interfaces:**
- Produces: in an exact match, `slim` near the lower edge nudges one size down; `relaxed` near the upper edge nudges one size up; `regular` never changes the size.

- [ ] **Step 1: Add failing tests to `src/lib/sizing.test.ts`**

```ts
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

Run: `npm test`
Expected: FAIL — fit currently ignored (relaxed/slim still return M).

- [ ] **Step 3: Add `shiftForFit()` and apply it in the exact-match branch of `src/lib/sizing.ts`**

Add a size-order constant at the top and the helper:

```ts
import { Size } from './types';

const ORDER: Size[] = ['S', 'M', 'L', 'XL'];

function shiftForFit(size: Size, m: Measurement, row: SizeRow): Size {
  if (m.fit === 'regular') return size;
  const span = row.height_max - row.height_min;
  const pos = span > 0 ? (m.height_cm - row.height_min) / span : 0.5;
  const idx = ORDER.indexOf(size);
  if (m.fit === 'slim' && pos <= 0.34 && idx > 0) return ORDER[idx - 1];
  if (m.fit === 'relaxed' && pos >= 0.66 && idx < ORDER.length - 1) return ORDER[idx + 1];
  return size;
}
```

Update the exact-match branch to apply it:

```ts
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

Run: `npm test`
Expected: PASS — full suite green (exact, validation, out-of-range, fit).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sizing.ts src/lib/sizing.test.ts
git commit -m "feat: adjust recommended size by fit preference (TDD)"
```

---

### Task 7: Storefront widget

**Files:**
- Create: `index.html`, `src/widget/widget.ts`, `src/widget/widget.css`

**Interfaces:**
- Consumes: `recommendSize` from `./lib/sizing` (relative to `src/widget/`: `../lib/sizing`); `TSHIRT_CHART` from `../data/tshirt-chart`; `InvalidMeasurementError` from `../lib/types`.
- Produces: a runnable demo page (`npm run dev`).

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>fit-confidence — Size Finder</title>
  <link rel="stylesheet" href="/src/widget/widget.css" />
</head>
<body>
  <main class="pdp">
    <div class="product">
      <div class="product__image"></div>
      <div class="product__info">
        <h1>Classic Cotton T-Shirt</h1>
        <p class="price">$24.00</p>
        <button id="find-size" class="btn">Find my size</button>
      </div>
    </div>
  </main>

  <div id="modal" class="modal" hidden>
    <div class="modal__card">
      <h2>Find my size</h2>
      <label>Height (cm) <input id="height" type="number" value="170" /></label>
      <label>Weight (kg) <input id="weight" type="number" value="65" /></label>
      <label>Fit
        <select id="fit">
          <option value="slim">Slim</option>
          <option value="regular" selected>Regular</option>
          <option value="relaxed">Relaxed</option>
        </select>
      </label>
      <button id="recommend" class="btn">Recommend</button>
      <p id="error" class="error" hidden></p>
      <div id="result" class="result" hidden>
        <div id="size-badge" class="badge"></div>
        <p id="reason"></p>
      </div>
      <button id="close" class="btn btn--ghost">Close</button>
    </div>
  </div>

  <script type="module" src="/src/widget/widget.ts"></script>
</body>
</html>
```

- [ ] **Step 2: Create `src/widget/widget.ts`**

```ts
import { recommendSize } from '../lib/sizing';
import { TSHIRT_CHART } from '../data/tshirt-chart';
import { InvalidMeasurementError, Fit } from '../lib/types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const modal = $('modal');
$('find-size').addEventListener('click', () => { modal.hidden = false; });
$('close').addEventListener('click', () => { modal.hidden = true; });

$('recommend').addEventListener('click', () => {
  const error = $('error');
  const result = $('result');
  error.hidden = true;
  result.hidden = true;

  const height_cm = Number(($('height') as HTMLInputElement).value);
  const weight_kg = Number(($('weight') as HTMLInputElement).value);
  const fit = ($('fit') as HTMLSelectElement).value as Fit;

  try {
    const rec = recommendSize({ height_cm, weight_kg, fit }, TSHIRT_CHART);
    $('size-badge').textContent = rec.size;
    $('reason').textContent = rec.reason + (rec.exact ? '' : ' (estimate)');
    result.hidden = false;
  } catch (e) {
    error.textContent = e instanceof InvalidMeasurementError
      ? e.message
      : 'Something went wrong. Please check your input.';
    error.hidden = false;
  }
});
```

- [ ] **Step 3: Create `src/widget/widget.css`**

```css
* { box-sizing: border-box; font-family: -apple-system, system-ui, sans-serif; }
body { margin: 0; background: #f6f6f7; color: #1a1a1a; }
.pdp { max-width: 880px; margin: 40px auto; }
.product { display: flex; gap: 32px; background: #fff; padding: 32px; border-radius: 12px; }
.product__image { width: 280px; height: 320px; background: linear-gradient(135deg,#dfe6f0,#c3d0e0); border-radius: 8px; }
.price { font-size: 20px; color: #444; }
.btn { background: #1a1a1a; color: #fff; border: 0; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 15px; }
.btn--ghost { background: transparent; color: #555; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
.modal__card { background: #fff; padding: 28px; border-radius: 12px; width: 320px; display: flex; flex-direction: column; gap: 12px; }
.modal__card label { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.modal__card input, .modal__card select { width: 130px; padding: 6px; }
.error { color: #b42318; margin: 0; }
.result { text-align: center; }
.badge { font-size: 48px; font-weight: 700; }
```

- [ ] **Step 4: Run the dev server and verify manually**

Run: `npm run dev`
Expected: open the printed URL → "Find my size" → 170/65/regular → shows **M** and a reason. Try height `0` → inline error.

- [ ] **Step 5: Commit**

```bash
git add index.html src/widget/widget.ts src/widget/widget.css
git commit -m "feat: storefront size-finder widget calling recommendSize"
```

---

### Task 8: Wire verification into the harness and update state

**Files:**
- Modify: `init.sh`, `feature_list.json`

**Interfaces:**
- Consumes: `npm` scripts from Task 1; existing `scripts/verify-harness.sh`.
- Produces: `./init.sh` runs install → test → build → harness check; `feature_list.json` records the app feature with evidence.

- [ ] **Step 1a: Add a Node version check to `init.sh`**

Insert this immediately after the `cd "$ROOT_DIR"` line (before the install/verify command block):

```bash
# Pin Node version (matches .nvmrc). Warn — don't hard-fail — so the harness check still runs.
if [ -f .nvmrc ]; then
  want="$(cat .nvmrc)"
  have="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')"
  if [ -n "$have" ] && [ "$have" != "$want" ]; then
    echo "⚠️  Node major $have != .nvmrc ($want). Run: nvm install $want && nvm use" >&2
  fi
fi
```

- [ ] **Step 1b: Update the command block in `init.sh`**

Replace the install/verify/start command definitions with:

```bash
# Install app dependencies.
INSTALL_CMD=(npm install)
# Verify: run unit tests, the build, then the harness integrity check.
VERIFY_CMD=(bash -c 'npm test && npm run build && bash "'"$ROOT_DIR"'/scripts/verify-harness.sh"')
# Start: the storefront widget demo.
START_CMD=(npm run dev)
```

- [ ] **Step 2: Run the full startup path**

Run: `./init.sh`
Expected: deps install, Vitest suite passes, Vite build succeeds, harness check prints `RESULT: PASS`, exit 0. **Save this raw output as demo evidence.**

- [ ] **Step 3: Add the app feature to `feature_list.json`**

Add this object to the `features` array (after `feat-flow`):

```json
{
  "id": "feat-app",
  "title": "Size Finder MVP (recommendSize + storefront widget)",
  "source_idea": "docs/features/size-finder/specs/size-finder-design.md",
  "tasks": [
    {
      "id": "task-app-recommender",
      "title": "recommendSize() core logic, fully TDD",
      "requirements": [
        "Exact match by height+weight, fit adjustment, out-of-range estimate, input validation."
      ],
      "status": "passing",
      "spec_ids": ["size-finder-design"],
      "plan_ref": "docs/features/size-finder/plans/size-finder.md",
      "review": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "release": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "dod": [
        { "criterion": "Vitest suite passes (exact, validation, out-of-range, fit)", "met": true, "evidence": "npm test green; ./init.sh PASS" }
      ],
      "evidence": ["./init.sh RESULT: PASS — tests + build + harness check"],
      "notes": "TDD RED->GREEN visible in commit history."
    },
    {
      "id": "task-app-widget",
      "title": "Storefront Size Finder widget",
      "requirements": ["Button -> modal -> form -> calls recommendSize -> shows size + reason."],
      "status": "passing",
      "spec_ids": ["size-finder-design"],
      "plan_ref": "docs/features/size-finder/plans/size-finder.md",
      "review": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "release": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
      "dod": [
        { "criterion": "npm run dev shows M for 170/65/regular", "met": true, "evidence": "manual demo" }
      ],
      "evidence": ["manual demo: 170/65/regular -> M"],
      "notes": "Admin editor cut from MVP (chart hardcoded)."
    }
  ]
}
```

- [ ] **Step 4: Validate the state file and harness**

Run: `./init.sh`
Expected: `feature_list.json matches schema` still green; overall `RESULT: PASS`.

- [ ] **Step 5: Commit**

```bash
git add init.sh feature_list.json
git commit -m "chore: run app tests+build in init.sh; record Size Finder feature"
```

---

## Self-Review

**Spec coverage:**
- §3 core logic → Tasks 3–6. §4 error handling → Task 4 (+ out-of-range Task 5). §5 data flow → Task 7 widget. §6 testing → Tasks 3–6 (TDD). §7 verification → Task 8. §2 architecture/file layout → Tasks 1, 2, 7. §1 scope cuts (no admin, no real Shopify) → reflected; nothing in plan implements them. ✓ No gaps.
- §8 demo script → Task 7 step 4 + Task 8 step 2 produce the demo + evidence. ✓

**Placeholder scan:** Task 3 intentionally ships a temporary branch (`exact: false` returning `chart[0]`) that Task 5 replaces — this is real, runnable code with a stated successor, not a "TODO". All other steps contain full code/commands. ✓

**Type consistency:** `recommendSize(m, chart)`, `Recommendation {size, reason, exact}`, `Size`/`Fit`/`Measurement`/`SizeRow`, `TSHIRT_CHART`, `InvalidMeasurementError`, helpers `contains`/`validate`/`nearest`/`shiftForFit`, constant `ORDER` — names and signatures match across Tasks 2–8. ✓
