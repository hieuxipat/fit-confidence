# Design — fit-confidence: Size Finder MVP

**Date:** 2026-06-29
**Repo:** fit-confidence (this harness repo)
**Goal:** A simple, demoable Shopify-style "Size Finder" that recommends a clothing
size from a shopper's height/weight/fit preference — built to showcase course
knowledge (TDD, verification, harness, guardrails) for the final demo on 30/06.

## 1. Objective & scope

A shopper on a product page taps **"Find my size"**, enters height (cm), weight
(kg) and a fit preference, and gets a recommended size (S/M/L/XL) **with a
reason**. This reduces wrong-size returns (fashion return rate ~30%).

The centerpiece is a **pure, fully test-driven recommendation function**. The UI
is a lightweight storefront-style widget that calls it. The piece is structured
so it can later be dropped into a real Shopify theme app extension, but the demo
runs standalone (no Partner account / OAuth / tunnel) to stay within the
deadline.

### In scope (MVP)
- `recommendSize()` core logic (TDD) — **the demo + B3 evidence centerpiece**.
- One seed size chart (t-shirt: S/M/L/XL by height & weight range).
- A runnable storefront-style widget: button → modal → form → result.
- Verification wired into `init.sh` (tests + harness integrity check).

### Out of scope (deliberate cuts — stated in the demo as "reading complexity")
- AI/ML recommender, OCR size import, billing tiers, analytics, i18n.
- Real Shopify install / embedded admin OAuth.
- Merchant admin editor — the size chart is hardcoded/seeded JSON. (Mentioned as
  a "difficulty / next step" in the presentation.)

## 2. Architecture

Small TypeScript project, Vite for the dev server + build, Vitest for tests.

```
src/
  lib/
    sizing.ts          # recommendSize() — pure, no I/O. The TDD core.
    sizing.test.ts     # Vitest unit tests (written first, RED→GREEN→REFACTOR).
    types.ts           # SizeChart, Measurement, Recommendation, Fit types.
  data/
    tshirt-chart.ts    # seed size chart (typed constant).
  widget/
    index.html         # storefront-style product page mock + "Find my size".
    widget.ts          # modal + form + calls recommendSize(), renders result.
    widget.css         # PDP-like styling.
index.html             # entry that loads the widget demo.
```

**Boundaries / why:**
- `lib/sizing.ts` is a **pure function** with no DOM/network — so it is trivially
  unit-testable and is the same code a future theme extension would import.
- `widget/` only handles input/output and calls the library — it can change
  without touching tested logic.
- `data/` is separate so swapping/extending charts never touches logic.

## 3. Core logic — `recommendSize`

```ts
type Fit = 'slim' | 'regular' | 'relaxed';

interface Measurement { height_cm: number; weight_kg: number; fit: Fit; }

interface SizeRow {
  size: 'S' | 'M' | 'L' | 'XL';
  height_min: number; height_max: number;   // cm
  weight_min: number; weight_max: number;    // kg
}
type SizeChart = SizeRow[];

interface Recommendation {
  size: SizeRow['size'];
  reason: string;          // human-readable, shown in the widget
  exact: boolean;          // true = measurements fell inside a row; false = nearest estimate
}
```

**Algorithm:**
1. **Validate** input (see §4). Invalid → throw `InvalidMeasurementError`.
2. **Exact match:** find the row whose height AND weight ranges both contain the
   measurement → `exact: true`.
3. **Fit adjustment:** `slim` → nudge one size down if the shopper is near the
   lower edge; `relaxed` → nudge one size up if near the upper edge; `regular`
   → no change. (Clamped to the available S–XL range.)
4. **No exact row (out of range):** pick the **nearest** row by normalized
   distance to range mid-points → `exact: false`, reason notes it is an estimate.
5. Always return a `reason` string explaining the choice (e.g.
   `"170cm & 65kg fall in M (165–174cm, 60–70kg); regular fit kept as-is."`).

The function is **total** — it never returns undefined; out-of-range yields a
best estimate, only truly invalid input throws.

## 4. Error handling

| Case | Behavior |
|---|---|
| height/weight not a finite number, ≤ 0, or absurd (height > 260, weight > 400) | throw `InvalidMeasurementError` with a clear message; widget shows inline error |
| `fit` not one of slim/regular/relaxed | throw `InvalidMeasurementError` |
| measurements outside every row's range | return nearest size, `exact: false`, reason flags it as an estimate |
| empty / malformed chart | throw `Error('size chart is empty')` (programmer error, covered by a test) |

Widget never crashes: validation errors render as a friendly message under the
form.

## 5. Data flow

```
[Find my size] click
  → open modal (height, weight, fit form)
  → submit → parse + validate inputs
  → recommendSize({height_cm, weight_kg, fit}, tshirtChart)
      → returns {size, reason, exact}
  → render: big size badge + reason text (+ "estimate" note if !exact)
```

## 6. Testing strategy (TDD — written before implementation)

Vitest. Tests authored RED first, then implement to GREEN, then REFACTOR.

Representative cases (commit shows the RED→GREEN progression):
- `170, 65, regular` → `M`, `exact: true`.
- `185, 90, regular` → `XL`, `exact: true`.
- `158, 50, regular` → `S`, `exact: true`.
- Fit adjustment: same measurement, `slim` vs `relaxed` shifts the size at an edge.
- Out of range: `205, 120, regular` → nearest (`XL`), `exact: false`.
- Invalid: `0/NaN/negative` height, bad `fit` → throws `InvalidMeasurementError`.
- Empty chart → throws.

`reason` is asserted to be non-empty and to mention the chosen size.

## 7. Verification (wired into harness)

`init.sh` runs, in order:
1. `npm install` (app deps)
2. `npm test` (Vitest — must pass)
3. `npm run build` (Vite build — must succeed)
4. `scripts/verify-harness.sh` (existing harness integrity check)

Raw output of `./init.sh` is the demo's verification evidence. `feature_list.json`
gains a `feat-app` feature with tasks (chart, recommender-TDD, widget, verify),
each moved to `passing` only with recorded evidence.

## 8. Demo script (maps to CHUAN-BI-DEMO.md)

`npm run dev` → open the product page → "Find my size" → enter `170/65/regular`
→ shows **M** + reason. Then show `npm test` green output and `git log` of the
RED→GREEN commits.

## 9. Risks

- **Time:** keep UI plain; logic + tests first so there is always a demoable core
  even if the widget is unfinished.
- **Fabricated sizing numbers:** the seed chart uses realistic, documented ranges;
  tests lock expected outputs so AI-suggested values can't silently drift.
