# Design — Size Finder Admin (merchant edits the size chart)

**Date:** 2026-06-29
**Status:** Phase 2 / stretch — build only after the storefront widget works & verifies.
**Depends on:** `size-finder-design.md` (the `recommendSize` core + theme extension).

## 1. Objective
Let the merchant edit the S/M/L/XL size chart from an **embedded Shopify Admin page**
(Polaris), and have the **storefront widget** use that edited chart — so the app is no
longer hardcoded. This restores F011 and makes it a full (admin + storefront) Shopify app.

## 2. Key decision — persistence via a shop metafield
The chart is stored in a **shop metafield** (JSON), not a database:
- namespace/key: `fit_confidence.size_chart`, type `json` (array of size rows).
- Admin **writes** it with the Admin GraphQL `metafieldsSet` mutation.
- The theme app extension **reads** it in Liquid (`shop.metafields.fit_confidence.size_chart`)
  and passes the JSON to `recommendSize`; if absent/empty → fall back to the built-in
  `TSHIRT_CHART` (so the widget never breaks).
- The metafield needs a **definition with storefront read access** so the theme block can see it.

This connects admin edits → storefront with no server/DB, the Shopify-native way.
> Verify exact metafield definition + GraphQL with the `shopify-custom-data` and
> `shopify-admin` skills during implementation.

## 3. Architecture impact
- The app must be the **embedded Remix template** (App Bridge + OAuth + Prisma session),
  not `--template none`. The theme extension lives under the same app.
- New admin route (Remix + Polaris): loads the chart, shows an editable table, saves it.

```
app/
  app/routes/app.size-chart.tsx   # Polaris page: load + edit + save the chart
  app/size-chart.server.ts        # read/write the shop metafield (Admin GraphQL)
  app/size-chart.validate.ts      # pure validateChart() — TDD'd
  extensions/size-finder/...       # block reads the metafield, falls back to default
```

## 4. Admin UX
- One page, one card: a table with 4 rows (S/M/L/XL), each with height_min/max, weight_min/max
  number inputs, plus **Save** (primary) and a "Reset to default" secondary action.
- Validation (per `validateChart`): every row has min ≤ max; numbers positive and sane;
  all four sizes present. Invalid → inline Polaris error banner, no save.
- Success → Polaris toast "Size chart saved".

## 5. Data flow
```
Admin page load  → loader → read shop metafield (or default) → render table
Merchant edits + Save → action → validateChart() → metafieldsSet → toast
Storefront block load → Liquid reads shop metafield (or default) → recommendSize(chart)
```

## 6. Testing
- `validateChart(chart)` is a **pure function → TDD** (this is the admin's B3 evidence):
  valid chart passes; min>max fails; missing size fails; negative/NaN fails.
- `recommendSize` already total over any chart shape — add one test feeding a *custom* chart
  to prove it isn't hardcoded to `TSHIRT_CHART`.
- Loader/action + Polaris UI: verified manually via `shopify app dev`.

## 7. Verification & demo
- `npm test` (validateChart + recommendSize) green; `shopify app build` succeeds.
- Demo: `shopify app dev` → Admin → edit M's max height → Save → storefront widget now
  recommends differently for a borderline measurement → proves admin↔storefront link.

## 8. Risks
- **Deadline:** embedded app + metafield + route is the most time-consuming piece → do it
  only after the storefront widget is shippable. Always keep a working demo.
- **Metafield storefront access:** must enable storefront read on the definition, else the
  block can't see merchant edits → fallback to default hides the link. Verify early.
