# Fit Confidence — Size Finder (Shopify app)

A small but **real, end-to-end** Shopify app that helps shoppers pick the right
size the first time and cut wrong-size returns. Built as a final-course demo to
show how the course methodology (planning, harness, guardrails, TDD,
verification, MCP, delegation) is applied across a product's whole lifecycle —
not just "AI wrote some code".

> 📊 The written report (objective · knowledge applied · AI's role · results ·
> challenges · lessons) is in **[`demo/report.md`](./demo/report.md)**, the
> projectable slide deck in **[`demo/slides.html`](./demo/slides.html)**, and the
> detailed prep notes in **[`demo/prep.md`](./demo/prep.md)**.

## What it does

Fashion stores lose ~30% to returns, mostly from **wrong size**. Fit Confidence
adds a **"Find my size"** widget to the product page: a shopper enters height,
weight and fit preference and gets an **S / M / L / XL** recommendation with a
reason, from the merchant's own size chart.

It is a real Shopify app with **two surfaces**:

- **Storefront** — a Theme App Extension app block (`Find my size` button →
  modal → recommendation). Runs on Shopify's CDN; no server needed.
- **Admin** — an embedded React Router + Polaris page where the merchant edits
  the S/M/L/XL chart.

The two are linked by an **app-owned shop metafield** (`$app:fit_confidence`,
type `json`) — **no database**. The recommendation logic is rule-based and
unit-tested; no AI guessing, and no shopper data leaves the page.

## How it's built

- **Recommender** (`app/extensions/size-finder/assets/sizing.js`): pure
  `recommendSize(measurements, chart)` — exact match, fit adjustment,
  out-of-range estimate. Fully TDD'd.
- **Admin** (`app/app/routes/app._index.jsx`, `app.size-chart.jsx`): Polaris web
  components; loads/validates/saves the chart.
- **Persistence** (`app/app/size-chart.server.js`): read/write the app-owned
  metafield via Admin GraphQL; `validateChart()` is pure and TDD'd.
- **Market scope** from a competitor dependency map (`/map-feature` →
  `outputs/kiwi-sizing-feature-map.html`) — deliberately cut from 31 features to
  4 hubs. Positioning vs Kiwi Sizing: free, rule-based recommender, no watermark.

## Run & verify

```bash
./init.sh                 # install + npm test + shopify app build + harness checks
cd app && shopify app dev # live preview on a dev store (needed for the admin page)
```

`./init.sh` is the standard verification gate — it must print `RESULT: PASS`
before any task is considered done. Current state: **`npm test` 21/21**,
`shopify app build` OK, deployed as version `fit-confidence-2`.

## Course methodology applied

The repo is also a **harness for AI coding agents** (tool-agnostic), following a
five-subsystem model so the agent can start, stay in scope, verify, and resume:

| Subsystem | Artifact | Purpose |
|---|---|---|
| Instructions | `AGENTS.md` / `CLAUDE.md` | Startup path, working rules, definition of done |
| State | `feature_list.json`, `claude-progress.md` | Feature status, **risk**, evidence, next step |
| Verification | `init.sh`, `scripts/verify-harness.sh` | Checks the agent must run before claiming done |
| Scope | feature priorities & done criteria | Prevents overreach and half-finished work |
| Lifecycle | `session-handoff.md`, end-of-session routine | Makes the next session restartable |

Applied across the course topics, with evidence in the repo:

- **Guardrails / hooks / permissions** — `.claude/` (block dangerous commands,
  allow/ask/deny, secret scan) + `.githooks/pre-commit` (actually blocked real
  commits); self-protecting config.
- **TDD & verification** — `*.test.js` (21 tests, RED→GREEN); real runnable
  `init.sh` gate; evidence recorded, not just claimed.
- **Planning & delegation** — spec + plan artifacts in
  `docs/features/size-finder/`; a 7-subagent parallel audit of lesson coverage.
- **MCP** — codegraph (code knowledge graph) + Shopify MCP skills to validate
  GraphQL / Polaris against the schema.
- **Risk Matrix** — per-task `risk` in `feature_list.json`, machine-enforced by
  `verify-harness.sh`; a custom `code-reviewer` sub-agent in `.claude/agents/`.

## The contract

An agent working in this repo must:

- work on **one** feature at a time,
- run the verification before marking anything `passing`,
- record **evidence**, not just claims,
- leave the repo restartable from `./init.sh`.

## Repo layout

```
app/                         # the Shopify app (embedded React Router + theme extension)
  app/routes/                #   admin pages (Home dashboard, Size chart editor)
  app/size-chart.*.js        #   metafield read/write + validation (TDD)
  extensions/size-finder/    #   storefront widget (Theme App Extension)
docs/features/size-finder/   # specs, plans, prototype
outputs/                     # competitor feature map (/map-feature)
.claude/                     # settings, hooks, skills, agents
AGENTS.md CLAUDE.md          # harness instructions
feature_list.json            # state (status / risk / DoD / evidence)
init.sh                      # standard startup + verification
```
