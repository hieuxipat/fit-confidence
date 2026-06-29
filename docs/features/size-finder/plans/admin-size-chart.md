# Size Finder Admin (size-chart editor) Implementation Plan

> **STATUS (2026-06-29):** Implementation COMPLETE & build-verified. Tasks 1–5 done — embedded **React Router** app (the CLI's successor to the Remix template) scaffolded via `shopify app init`, consolidated to `app/`; `validateChart` TDD; `readChart`/`writeChart`/`ensureSizeChartDefinition`; admin route `app/app/routes/app.size-chart.jsx`; theme block already reads the metafield. Deviations from the plan as written: route is `.jsx` using **Polaris web components** (`s-*`) not `@shopify/polaris` React; the metafield definition is created idempotently in code (`ensureSizeChartDefinition`, storefront `PUBLIC_READ`) instead of a manual operator GraphQL step. **Only remaining:** Task 6's live `shopify app dev` admin↔storefront demo (operator) → then `task-app-admin` → `passing`.
>
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.
> **Phase 2 / stretch** — execute only after `size-finder.md` (storefront widget) is shippable and verifies. Spec: `../specs/admin-size-chart-design.md`.

**Goal:** A merchant edits the S/M/L/XL size chart from an embedded Shopify Admin (Polaris) page; the storefront widget uses that chart via a shop metafield.

**Architecture:** Embedded Shopify Remix app (App Bridge + OAuth). Chart stored in a shop metafield `fit_confidence.size_chart` (type `json`). Admin route loads/saves it; the theme block reads it in Liquid with a fallback to the built-in default. Pure `validateChart()` is TDD-tested.

**Tech Stack:** Shopify CLI, Remix + Polaris + App Bridge, Admin GraphQL (`metafieldsSet`), shop metafield, Vitest, Node 20.

## Global Constraints

- Persistence = **shop metafield** `fit_confidence.size_chart` (json). No database for the chart.
- The theme block must **fall back** to the built-in `TSHIRT_CHART` when the metafield is absent/empty (widget never breaks).
- `validateChart()` and `recommendSize()` stay pure and TDD-tested.
- Verify exact metafield definition (storefront access) + GraphQL with the `shopify-custom-data` and `shopify-admin` skills before writing the mutations.
- Do not commit `.env`/secrets; do not weaken `.claude/` guardrails.

---

### Task 1: Scaffold (or re-scaffold) as an embedded Remix app

**Supersedes** `size-finder.md` Task 1 step 1: use the **Remix template** (not `--template none`) so the app has admin + App Bridge + session. The theme extension from `size-finder.md` lives under the same app.

- [ ] **Step 1: Init the embedded app** (operator runs; needs `shopify auth login`)

```bash
shopify app init --path app --name fit-confidence   # choose the Remix template
cd app && npm install
```
Expected: `app/` has Remix structure (`app/routes/`, `prisma/`, `shopify.app.toml`), `shopify app dev` can open the embedded admin.

- [ ] **Step 2: Ensure the theme extension exists** (from `size-finder.md` Task 1)

```bash
cd app && shopify app generate extension --type theme_app_extension --name size-finder
```
Expected: `app/extensions/size-finder/` present. (Skip if already generated.)

- [ ] **Step 3: Add Vitest (if not already from size-finder.md)** — `"test": "vitest run"`, `vitest` devDep, `vitest.config.js` with `include: ['app/**/*.test.js','extensions/**/*.test.js']`.

- [ ] **Step 4: Commit**

```bash
git add app && git commit -m "chore: scaffold embedded Remix app for Size Finder admin"
```

---

### Task 2: `validateChart()` — pure validation (TDD)

**Files:**
- Create: `app/app/size-chart.validate.js`
- Test: `app/app/size-chart.validate.test.js`

**Interfaces:**
- Produces: `validateChart(chart) -> { ok: boolean, errors: string[] }`. Used by the admin action and (optionally) the loader's default.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import { validateChart } from './size-chart.validate.js';

const good = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];

describe('validateChart', () => {
  it('accepts a well-formed chart', () => {
    expect(validateChart(good).ok).toBe(true);
  });
  it('rejects min > max', () => {
    const bad = structuredClone(good); bad[1].height_min = 999;
    const r = validateChart(bad);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/M/);
  });
  it('rejects a missing size', () => {
    expect(validateChart(good.slice(0, 3)).ok).toBe(false);
  });
  it('rejects negative or NaN numbers', () => {
    const bad = structuredClone(good); bad[0].weight_min = -1;
    expect(validateChart(bad).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test`
Expected: FAIL — `validateChart` missing.

- [ ] **Step 3: Implement `app/app/size-chart.validate.js`**

```js
const SIZES = ['S', 'M', 'L', 'XL'];
const NUM = ['height_min', 'height_max', 'weight_min', 'weight_max'];

export function validateChart(chart) {
  const errors = [];
  if (!Array.isArray(chart)) return { ok: false, errors: ['chart must be an array'] };
  for (const s of SIZES) if (!chart.some((r) => r && r.size === s)) errors.push(`missing size ${s}`);
  for (const row of chart) {
    if (!row || !SIZES.includes(row.size)) { errors.push(`invalid size row: ${JSON.stringify(row)}`); continue; }
    for (const k of NUM) {
      const v = row[k];
      if (!Number.isFinite(v) || v <= 0) errors.push(`${row.size}.${k} must be a positive number`);
    }
    if (Number.isFinite(row.height_min) && Number.isFinite(row.height_max) && row.height_min > row.height_max)
      errors.push(`${row.size}: height_min > height_max`);
    if (Number.isFinite(row.weight_min) && Number.isFinite(row.weight_max) && row.weight_min > row.weight_max)
      errors.push(`${row.size}: weight_min > weight_max`);
  }
  return { ok: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test`
Expected: PASS.

- [ ] **Step 5: Prove `recommendSize` is not hardcoded** — add to `extensions/size-finder/assets/sizing.test.js`:

```js
it('uses a custom chart, not a hardcoded one', () => {
  const custom = [{ size: 'S', height_min: 100, height_max: 250, weight_min: 1, weight_max: 300 }];
  expect(recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, custom).size).toBe('S');
});
```
Run `npm test` → PASS (already total over any chart).

- [ ] **Step 6: Commit**

```bash
git add app/app/size-chart.validate.js app/app/size-chart.validate.test.js app/extensions/size-finder/assets/sizing.test.js
git commit -m "feat: validateChart() for the size-chart editor (TDD)"
```

---

### Task 3: Read/write the chart metafield (server)

**Files:**
- Create: `app/app/size-chart.server.js`

**Interfaces:**
- Produces: `readChart(admin) -> chart[]` (metafield or default) and `writeChart(admin, chart) -> void`.

> Confirm the exact GraphQL + metafield definition with `shopify-custom-data` / `shopify-admin` skills before finalizing. The metafield definition must enable **storefront read access** so the theme block can read it.

- [ ] **Step 1: Implement `app/app/size-chart.server.js`** (shape — adjust field names to the verified GraphQL)

```js
import { DEFAULT_CHART } from './default-chart.js';

const NS = 'fit_confidence';
const KEY = 'size_chart';

export async function readChart(admin) {
  const res = await admin.graphql(`#graphql
    query { shop { metafield(namespace: "${NS}", key: "${KEY}") { value } } }`);
  const json = await res.json();
  const value = json?.data?.shop?.metafield?.value;
  if (!value) return DEFAULT_CHART;
  try { return JSON.parse(value); } catch { return DEFAULT_CHART; }
}

export async function writeChart(admin, chart) {
  const shopRes = await admin.graphql(`#graphql query { shop { id } }`);
  const ownerId = (await shopRes.json()).data.shop.id;
  await admin.graphql(`#graphql
    mutation Set($mf: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $mf) { userErrors { field message } }
    }`, { variables: { mf: [{
      ownerId, namespace: NS, key: KEY, type: 'json', value: JSON.stringify(chart),
    }] } });
}
```

- [ ] **Step 2: Create `app/app/default-chart.js`** (single source of the default, reused by fallback)

```js
export const DEFAULT_CHART = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];
```

- [ ] **Step 3: Create the metafield definition with storefront access** — via the `shopify-custom-data` skill (definition `fit_confidence.size_chart`, type `json`, storefront read). Record the command/mutation used.

- [ ] **Step 4: Commit**

```bash
git add app/app/size-chart.server.js app/app/default-chart.js
git commit -m "feat: read/write size chart in a shop metafield"
```

---

### Task 4: Admin Polaris page (load + edit + save)

**Files:**
- Create: `app/app/routes/app.size-chart.tsx` (or `.jsx` to match the template)

**Interfaces:**
- Consumes: `readChart`/`writeChart` (Task 3), `validateChart` (Task 2), Remix `authenticate.admin`.

- [ ] **Step 1: Implement the route** (loader reads, action validates + saves; Polaris table form). Skeleton:

```jsx
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { Page, Card, IndexTable, TextField, Button, Banner, Toast } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { readChart, writeChart } from "../size-chart.server.js";
import { validateChart } from "../size-chart.validate.js";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  return json({ chart: await readChart(admin) });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();
  const chart = JSON.parse(form.get("chart"));        // table serialized client-side
  const { ok, errors } = validateChart(chart);
  if (!ok) return json({ ok: false, errors }, { status: 422 });
  await writeChart(admin, chart);
  return json({ ok: true });
}

export default function SizeChartPage() {
  const { chart } = useLoaderData();
  const result = useActionData();
  // Render: Page > Card > editable table of 4 rows (TextField per number),
  // serialize rows into a hidden "chart" field, submit via <Form method="post">.
  // Show <Banner tone="critical"> with result.errors when !result.ok;
  // <Toast content="Size chart saved" /> when result.ok.
  return (/* Polaris layout — build with shopify-polaris-app-home skill */);
}
```

> Build the exact Polaris markup with the `shopify-polaris-app-home` skill. Keep it one card, four rows, Save (primary) + Reset to default (secondary).

- [ ] **Step 2: Manual check** — `cd app && shopify app dev` → open the embedded admin → edit a value → Save → reload shows the saved value; an invalid value (min>max) shows the error banner.

- [ ] **Step 3: Commit**

```bash
git add app/app/routes/app.size-chart.tsx
git commit -m "feat: admin Polaris page to edit the size chart"
```

---

### Task 5: Theme block reads the merchant's chart

**Files:**
- Modify: `app/extensions/size-finder/blocks/size-finder.liquid`

**Interfaces:**
- The inline module uses the merchant chart from the metafield, falling back to the built-in default.

- [ ] **Step 1: Pass the metafield JSON into the widget** — in the Liquid block, before the module, emit the chart (or empty) and use it with a fallback:

```liquid
<script type="application/json" id="sf-chart">
  {{ shop.metafields.fit_confidence.size_chart.value }}
</script>
<script type="module">
  import { recommendSize, TSHIRT_CHART } from "{{ 'sizing.js' | asset_url }}";
  let chart = TSHIRT_CHART;
  try { const raw = document.getElementById('sf-chart').textContent.trim(); if (raw) chart = JSON.parse(raw); } catch (e) {}
  // ... existing wiring, but call recommendSize({...}, chart) instead of TSHIRT_CHART ...
</script>
```

- [ ] **Step 2: Manual check** — `shopify app dev` → edit M's `height_max` in admin → Save → on storefront a borderline height now recommends a different size. Proves admin↔storefront link.

- [ ] **Step 3: Commit**

```bash
git add app/extensions/size-finder/blocks/size-finder.liquid
git commit -m "feat: storefront widget uses the merchant-edited chart (metafield + fallback)"
```

---

### Task 6: Record state + verify

**Files:**
- Modify: `feature_list.json`

- [ ] **Step 1: Run the full path** — `./init.sh` → `npm test` (validateChart + recommendSize) green, `shopify app build` ok, harness `RESULT: PASS`. Save raw output.

- [ ] **Step 2: Add an admin task to `feature_list.json` `feat-app`** (status `passing` only with evidence):

```json
{
  "id": "task-app-admin",
  "title": "Admin Polaris size-chart editor (metafield)",
  "requirements": ["Merchant edits chart in admin; stored in shop metafield; storefront widget uses it."],
  "status": "passing",
  "spec_ids": ["admin-size-chart-design"],
  "plan_ref": "docs/features/size-finder/plans/admin-size-chart.md",
  "review": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
  "release": { "rounds": 0, "max_rounds": 3, "last_result": "n/a" },
  "dod": [
    { "criterion": "validateChart suite green; edit in admin reflects on storefront", "met": true, "evidence": "npm test; shopify app dev demo" }
  ],
  "evidence": ["admin edit -> metafield -> storefront widget changes recommendation"],
  "notes": "Restores F011; persistence via shop metafield, no DB."
}
```

- [ ] **Step 3: Commit**

```bash
git add feature_list.json && git commit -m "chore: record admin size-chart editor feature with evidence"
```

---

## Self-Review

**Spec coverage:** §2 metafield → Tasks 3, 5. §3 architecture (Remix template) → Task 1. §4 admin UX → Task 4. §5 data flow → Tasks 3–5. §6 testing (validateChart TDD + custom-chart recommendSize) → Task 2. §7 verify/demo → Tasks 5–6. ✓

**Placeholder scan:** Polaris markup and exact GraphQL are intentionally deferred to the `shopify-polaris-app-home` / `shopify-custom-data` skills (Shopify-specific, safer generated than guessed) — these are named, scoped pointers, not bare TODOs. `validateChart`, `readChart`/`writeChart`, `DEFAULT_CHART`, the Liquid read are full code. ✓

**Type/name consistency:** `validateChart -> {ok,errors}`; `readChart(admin)`/`writeChart(admin, chart)`; `DEFAULT_CHART`; metafield `fit_confidence.size_chart`; chart row shape (`size,height_min/max,weight_min/max`) matches `size-finder.md` and the prototype. ✓
