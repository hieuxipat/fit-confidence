---
name: design-prototype
description: >
  Create a single-file HTML prototype for a feature in the ot-frontend
  Shopify embedded Admin app (Polaris React). Input is a requirement / PRD
  pasted inline in chat, or a Jira ticket the user explicitly points to.
  Output visually matches the live ot-frontend — reusing existing Custom*
  wrappers and layout patterns when the prototype extends an existing feature.
  Use this skill when the user says "prototype feature", "mock up feature",
  "visualize feature", "shopify prototype", "design prototype",
  "quick prototype", "build the prototype", or asks to turn a requirement /
  story / PRD into a working UI mockup. Pairs with design-brainstorm — when
  a brainstorm just ran for the same feature, reuse its output as the plan.
---

# Design Prototype (ot-frontend)

Turn a requirement / PRD / Jira ticket into a single-file HTML prototype for the **ot-frontend** Shopify embedded Admin app. Output must visually match the live ot-frontend — not generic Polaris.

> **Scope:** only `ot-frontend/` (merchant-facing Shopify embedded Admin app). Other workspace surfaces (`ot-storefront/`, `ot-api-portal/`, `ot-cms/`) are out of scope.
> **Future migration:** when ot-frontend moves to Polaris Web Components, swap **primary** and **secondary** modes. No other changes needed.

## Reference files (load on demand)

Only load the reference(s) for the mode(s) you'll use in this run. Do NOT pre-load all of them.

- `references/react.md` — primary mode template, critical notes, icon-version compat, extension-mode note
- `references/wc.md` — secondary mode template, component catalog, gotchas, icon shortlist
- `references/css.md` — fallback mode, Inter setup, semantic tokens, class shadows, rules
- `references/viz.md` — Polaris Viz usage across all modes (only load if feature involves charts)
- `references/polaris-ux.md` — UX principles, Polaris component-choice decisions, copy/tone, a11y, BFS design requirements (load in Step 5)

## Inputs

- Inline requirement / PRD / story / test-case text in chat, OR
- Jira content the user has already fetched/pasted (skill does NOT fetch Jira), OR
- A feature name the user calls out directly

If no input is given, ask for it. Do NOT invent one.

## Flags (all optional)

Mode: `--react` (primary, default), `--wc` (secondary), `--css` (fallback).
Greenfield/extension: `--greenfield`, `--extension`.
Extension depth: `--extension-light`, `--extension-heavy`, `--force-greenfield` (skip the "no match" ask).
Generation: `--no-confirm` (skip plan confirmation), `--extension-read-full` (lift the 300-line-per-file cap in Step 4), `--detailed-plan` (longer Step 5 plan).

## Fast path

If the user provides the feature + all needed flags up front, skip every ask and generate. Example prompt that triggers zero questions:

> "Prototype: bulk export for Shipments. --extension --extension-heavy --no-confirm"

## Process

### Step 0 — Discover versions

Read `ai-ordertracking-workspace/ot-frontend/package.json`. Capture installed versions of `react`, `react-dom`, `@shopify/polaris`, `@shopify/polaris-icons`, `@shopify/polaris-viz`. Resolve semver (`^12.0.1` → latest stable `12.x`). Inject into output via `{{REACT}}`, `{{POLARIS}}`, `{{POLARIS_ICONS}}`, `{{POLARIS_VIZ}}` placeholders. **Never hardcode versions in output.**

**Cache within session.** If versions were discovered earlier in this Claude session and `package.json` hasn't been modified, reuse — skip the file read.

**Fallback (only if `package.json` unreadable):** `react@18.3.1`, `@shopify/polaris@12.27.0`, `@shopify/polaris-icons@8.11.1` (v8, not v9), `@shopify/polaris-viz@16.16.0`. Note the fallback in the final report.

### Step 1 — Read the requirement

Extract feature name, user goal, main actions, key data shown, constraints. If the input is missing or too vague to identify a single feature, stop and ask. Do not guess.

### Step 2 — Confirm the feature

Single feature → echo it in one sentence and move on. Multiple features → list them, ask the user to pick one. Skip if the user already named the target.

### Step 3 — Greenfield or extension?

Ask explicitly: "brand-new screen (greenfield) or modifies/extends an existing ot-frontend screen (extension)?" Skip if `--greenfield` or `--extension` was passed.

### Step 4 — Read surrounding ot-frontend context

**Skip if `design-brainstorm` just ran for this feature** and produced a §"Fits into" section. That section already captures the surrounding context (page shell, Custom\* wrappers, recurring patterns). Use it directly — don't re-read the files.

Otherwise, run this step. Both extension and greenfield need to fit the existing app — extension needs to mirror more, greenfield needs the page shell + recurring patterns.

#### Extension mode — full pass

Ask: "light (read 1–2 existing files, echo their layout / Custom\* choices) or heavy (mirror component tree 1:1, reuse same Custom\* wrappers, match spacing/ordering exactly)?" Skip if `--extension-light` / `--extension-heavy` was passed.

**Search budget (hard caps to protect context):**
1. `grep -l` feature name (and obvious synonyms) in `ot-frontend/src/pages/` and `ot-frontend/src/components/` — filenames only, not content
2. Pick top 2–3 most relevant hits by path/name
3. Read each with `limit: 300` lines max. Total budget: 3 files × 300 lines = 900 lines
4. Override only with `--extension-read-full`

**Light:** reuse same Custom\* wrappers + roughly the same section order. Small divergences fine.
**Heavy:** mirror HTML structure 1:1. Same wrappers in same order, same spacing, same banner/empty-state placement. Divergence only where the new requirement demands it.

**No match found:** stop and ask (a) fall back to greenfield, or (b) point at a specific file. Unless `--force-greenfield` — then silently fall back (record in report).

#### Greenfield mode — light pass (mandatory)

Even greenfield prototypes need to look like ot-frontend, not generic Polaris. Run this lighter pass:

1. Identify the closest feature area in `ot-frontend/src/pages/` (Dashboard, Shipments, Settings, Notifications, Plan, ShipmentAnalytics, TrackingPage, Welcome, Feedback, ReviewTable). Pick by purpose, not name.
2. Read its `index.tsx` with `limit: 200` lines. Mandatory — even pure greenfield needs this anchor.
3. Glob `ot-frontend/src/components/Custom*/` directory listing — filenames only, no content.
4. **Budget:** 1 file × 200 lines + directory listings = ~400 lines. Don't exceed.

#### Capture (both modes)

- Which `Custom*` wrappers are used in the area: `CustomPage`, `CustomCard`, `CustomTable`, `CustomBanner`, `CustomLayoutOneThird`, `CustomCollapsible`
- Recurring cross-page patterns: `ControlBar`, `OnboardingGuide`, `HelpBanner`, `UpgradeCard`, `UpgradeLock`, `FeedbackPopup`
- Page shell choice: `Layout` vs `CustomPage`, `fullWidth` vs default, where primary actions live in the header
- Plan-locking presence (`isLockFeature` calls, `LockIcon` usage, upgrade-modal patterns)
- Tab structure, table structure, empty-state treatment, banner placement

The capture feeds Step 5 — both the page shell and the wrapper choices echo into the plan.

### Step 5 — Plan the screen

**Check first: did `design-brainstorm` just run for this feature?** If yes (the user invoked it earlier in this conversation and produced a structured brainstorm with §"Primary user flow", §"Surface choices", §"Copy", §"States" sections), **reuse that brainstorm as the plan** — skip the §15 re-walk below. Confirm with the user once: *"Using the brainstorm output as the plan — proceed?"* and generate.

Otherwise, **read `references/polaris-ux.md` first.** Walk the §15 checklist (one job, primary action, cost-before-commit, default state, empty/loading/error states, density, component choices, card actions, color role, copy, a11y, portal-on-react) and let it inform the plan. Component-choice questions (Modal vs Sheet, ChoiceList vs Select, Banner vs Toast, etc.) get resolved here, not silently during generation.

Default: brief plan (3–5 bullets covering purpose, main sections, primary/secondary actions, data shown, visible interactive state). `--detailed-plan` → longer plan covering banners, empty states, modals, edge cases.

If extension mode, add a short "Reusing from `<existing feature>`:" sub-list naming the Custom\* wrappers being carried over.

If the plan reveals UX questions the requirement doesn't answer (cost surfacing, empty-state copy, default selection, etc.), surface them in the confirmation step rather than guessing.

**Stop and ask for confirmation** before generating. Skip only if `--no-confirm`.

### Step 6 — Generate

Pick the mode based on flags. Load the matching reference file:
- Default / `--react` → `references/react.md`
- `--wc` → `references/wc.md`
- `--css` → `references/css.md`

If the feature involves charts, also load `references/viz.md`.

**Portal auto-switch:** before generating in react mode, check whether the planned screen requires any portal component — `Modal`, `Popover`, `Tooltip`, `Toast`, `Sheet`, or `Frame` with toasts. If yes, **switch to `--css` mode** (React mode breaks these via a dual-React issue on esm.sh — see `references/react.md` → "Portal components"). Note the auto-switch in Step 8's report so the user knows why they got CSS output instead of React.

**Output hygiene** (enforced in all modes):
- No tutorial / explanatory comments in the HTML — the prototype is not a teaching artifact
- Terse CSS, no redundant whitespace blocks
- One screen per file, no routing
- Under ~400 lines. For a large feature, focus on the primary screen and add a single HTML comment listing what was omitted
- Realistic placeholder data (actual-looking order IDs, customer names, dates, statuses — no Lorem ipsum)
- At least one interactive state visible (success banner, active filter chip, selected row, disabled button, open modal, etc.)

### Step 7 — Save

Path: `ai-ordertracking-workspace/prototypes/{{kebab-feature}}-{{YYYY-MM-DD}}.html`.
Non-primary mode → suffix: `-{{mode}}.html` (e.g. `-wc.html`, `-css.html`).
Multiple screens → one file per screen: `{{kebab}}-{{screen}}-{{date}}.html`.

Create `prototypes/` at workspace root if missing. This folder sits outside any subproject's git repo — skill does not write into `ot-frontend/` or any other subproject.

### Step 8 — Report

```
Prototype saved

File: {{path}}
Feature: {{feature}}
Mode: {{react | wc | css}}
Type: {{greenfield | extension-light | extension-heavy}}
Based on: {{existing feature path, or "n/a"}}
Versions: polaris@{{x}}, polaris-icons@{{x}}{{, polaris-viz@{{x}} if used}}
  {{ "(fallback — package.json unreadable)" if fallback used }}
Source: {{"inline" | "Jira <key>" | file path}}

Open in browser.
  {{ "Requires network (CDN)." for react/wc modes }}
  {{ "Works offline." for css mode }}
```

Do NOT open a preview, do NOT run a server, do NOT ask about next steps.

## Edge cases

- **Requirement too vague** → stop and ask (Step 1)
- **Multiple features in one requirement** → list, ask user to pick (Step 2)
- **Extension mode, no match in `src/`** → ask (Step 4), unless `--force-greenfield`
- **Feature is backend/infra only** → tell the user this skill builds ot-frontend UI prototypes; ask if they want a merchant-facing settings/admin screen exposing the change
- **Multiple screens needed** → one file per screen (Step 7)

## Design sources of truth (ot-frontend)

Consulted during Step 4 and when verifying patterns. Files live in `ai-ordertracking-workspace/ot-frontend/`:
- `src/pages/<FeatureArea>/` — `Dashboard/`, `Shipments/`, `Settings/`, `Notifications/`, `Plan/`, `ShipmentAnalytics/`, `TrackingPage/`, `Welcome/`
- `src/components/Custom*/` — the app's Polaris wrappers. **Prototypes that skip these and use raw Polaris will not match.**
- `src/components/ControlBar/`, `OnboardingGuide/`, `HelpBanner/`, `FeedbackPopup/`, `NavigationLink/` — recurring patterns
- `src/layouts/` — shell patterns
- `coding-and-style-guide.md`, `docs/shopify-conventions.md` — style + Shopify conventions

## Quality check before saving

Output must:
1. **Look like ot-frontend** — dark primary buttons, cards with subtle shadow, Polaris-style badges/chips, Inter typography, and (extension mode) the Custom\* wrappers identified in Step 4
2. **Be content-complete** — realistic data, at least one interactive state, renders standalone
3. **Use Step 0 versions** — import map / stylesheet / icon names all match `package.json` (or documented fallbacks). Every icon valid for the resolved icon-library major; cross-check at https://polaris-icons.shopify.com/ when unsure
4. **Handle charts correctly** — if charts involved, use Polaris Viz (primary) or a labeled placeholder (secondary/fallback) per `references/viz.md`, not a hand-drawn chart
5. **No portal components in react mode** — react-mode output must not import `Modal`, `Popover`, `Tooltip`, `Toast`, `Sheet`, or `Frame` (with toasts) from `@shopify/polaris`. If the feature requires any of these, Step 6 should have auto-switched to `--css`; if it didn't, regenerate in CSS mode. (See `references/react.md` → "Portal components" for why.)
6. **No unverified polaris-icons imports** — every icon imported from `@shopify/polaris-icons` must be verified for the resolved major version. At v8.11.x, prefer inline SVG for any icon not on the verified-safe list in `references/react.md` — a missing named import silently kills the script and produces a blank page.

If fallback output doesn't pass item 1, switch to primary mode and regenerate.

## Notes

- Step 0 reads `package.json` fresh per session, then caches. No manual version maintenance in this skill
- Reference files are loaded on demand — only the active mode pays the context cost per run
- `polaris.js` CDN (secondary) always serves the latest Shopify Web Components
- Prototypes are look-and-feel only — no real logic, no API calls
- Prototypes are saved outside any subproject's git repo and are not committed by this skill
- Primary and secondary modes require network at open time (CDN). Fallback mode works offline
