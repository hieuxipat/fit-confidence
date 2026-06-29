# Design — fit-confidence: Size Finder MVP

**Date:** 2026-06-29
**Repo:** fit-confidence (this harness repo)
**Goal:** A simple, demoable **Shopify app (Theme App Extension)** "Size Finder" that
recommends a clothing size from a shopper's height/weight/fit preference — built to
showcase course knowledge (TDD, verification, harness, guardrails) for the final
demo on 30/06.

## 1. Objective & scope

A shopper on a product page taps **"Find my size"**, enters height (cm), weight
(kg) and a fit preference, and gets a recommended size (S/M/L/XL) **with a
reason**. This reduces wrong-size returns (fashion return rate ~30%).

This ships as a **real Shopify app** via a **Theme App Extension** — the widget is
an app block a merchant adds to the product page in the theme editor. The
centerpiece is a **pure, fully test-driven recommendation function** that the
block's JS calls. No OAuth backend / database is needed for a storefront-only
theme extension.

### In scope (MVP)
- A **Shopify app + Theme App Extension** (app block) installable on a dev store.
- `recommendSize()` core logic (TDD) — **the demo + B3 evidence centerpiece**.
- One seed size chart (t-shirt: S/M/L/XL by height & weight range).
- Storefront widget block: button → modal → form → result, matching the prototype.
- Verification wired into `init.sh` (tests + extension check + harness integrity).

### Out of scope (deliberate cuts — stated in the demo as "reading complexity")
- AI/ML recommender, OCR size import, billing tiers, analytics, i18n.
- Embedded **admin** app (Polaris) for merchants to edit the chart — chart is a
  seeded constant in the extension. (Mentioned as a "difficulty / next step".)
- Any server/database — the extension is static (Liquid + JS asset).

### Prerequisites (manual, user-provided — interactive logins)
- Shopify **Partner account** (free) + a **development store** (free).
- Shopify CLI (already installed: `shopify 3.85.5`); `shopify auth login`.
- `shopify app dev` to tunnel + preview the block on the dev store theme.

## 2. Architecture

Shopify app scaffolded with the Shopify CLI; a Theme App Extension holds the
storefront block. The recommendation logic is plain **ES-module JS** so it is
served directly as a theme asset **and** unit-tested with Vitest — no bundler.

```
quan-ly... (app root, from `shopify app init`)
  shopify.app.toml             # app config (CLI-generated)
  package.json                 # scripts: test (vitest), build/dev via shopify
  extensions/
    size-finder/
      shopify.extension.toml   # theme app extension config
      blocks/
        size-finder.liquid     # app block: button + modal markup, schema settings
      assets/
        sizing.js              # recommendSize() — pure ESM. The TDD core.
        sizing.test.js         # Vitest unit tests (RED→GREEN→REFACTOR).
        tshirt-chart.js        # seed size chart constant.
        size-finder.js         # UI wiring: open modal, read form, call recommendSize, render.
        size-finder.css        # styling — matches the prototype.
```

**Boundaries / why:**
- `assets/sizing.js` is a **pure function** (no DOM/network) → trivially unit-testable
  by Vitest, and served as-is to the storefront. One file is both source and asset.
- `size-finder.js` only handles DOM input/output and calls `sizing.js` — UI can
  change without touching tested logic.
- `tshirt-chart.js` is separate so swapping/extending charts never touches logic.
- The block markup/CSS must look equivalent to
  `docs/features/size-finder/prototype/size-finder-widget.html` (UI source of truth).

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
2. `npm test` (Vitest on `assets/sizing.test.js` — must pass)
3. `shopify app build` (validates the extension config/build — must succeed)
4. `scripts/verify-harness.sh` (existing harness integrity check)

Raw output of `./init.sh` is the demo's verification evidence. `feature_list.json`
gains a `feat-app` feature with tasks (scaffold, recommender-TDD, block/widget,
verify), each moved to `passing` only with recorded evidence.

## 8. Demo script (maps to CHUAN-BI-DEMO.md)

`shopify app dev` → open the dev-store theme editor → add the **Size Finder** app
block to the product page → on the storefront tap "Find my size" → enter
`170/65/regular` → shows **M** + reason. Then show `npm test` green output and the
`git log` RED→GREEN commits. (Fallback if tunnel/login fails on demo day: open the
prototype HTML to show the same UI + run `npm test` for the logic.)

## 9. Risks

- **Time:** logic + tests first (TDD core) so there is always a demoable, verifiable
  centerpiece even if the Liquid block is unfinished.
- **Shopify setup risk (deadline):** Partner account / dev store / `shopify auth login`
  / tunnel can eat time or fail on demo day → mitigated by the prototype HTML +
  `npm test` fallback in §8, and by building the testable core before the block.
- **Fabricated sizing numbers:** the seed chart uses realistic, documented ranges;
  tests lock expected outputs so AI-suggested values can't silently drift.
