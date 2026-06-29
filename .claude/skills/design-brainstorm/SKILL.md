---
name: design-brainstorm
description: >
  Turn a feature request into structured written design reasoning — no HTML,
  no code. Use when the user says "suggest design for X", "brainstorm UI for X",
  "design ideas for X", "how should X work UX-wise", "ignore my UI, suggest…",
  "design thinking on X", "design recommendation for X", or similar phrasings
  that ask for design direction before any implementation. NEVER trigger when
  the user says "prototype", "mock up", "build", or "visualize" — those go to
  design-prototype. Output is structured English markdown in chat, with optional
  inline widgets for flows or state comparisons when a visual clarifies the
  recommendation.
---

# Design brainstorm (ot-frontend)

Produce **written design reasoning** for an ot-frontend feature: problem framing → primary flow → component choices → copy → states → open questions. Anchored on `polaris-ux.md`. The deliverable is a chat response, not a file.

> **Scope:** ot-frontend (Shopify embedded Admin app). Other workspace surfaces (`ot-storefront/`, `ot-api-portal/`, `ot-cms/`) are out of scope — ask the user to clarify if their request points elsewhere.
> **Pairs with:** `design-prototype`. Every brainstorm ends with an invitation to prototype the recommendation. Conversely, when `design-prototype` runs after this skill, it should reuse the brainstorm as its Step 5 plan rather than re-derive.

## Inputs

- **Inline PRD / requirement / story / test-case / Jira content** that the user has pasted into chat → use as-is.
- **Bare feature name or Jira key with no pasted content** → stop and ask the user to paste the requirement / Jira description into chat. Do NOT auto-fetch from Jira; do NOT invent content.

If multiple distinct features are present in one input, list them and ask the user to pick one.

## Reference files (load on demand)

- **`../design-prototype/references/polaris-ux.md`** — UX principles, color roles, density, Polaris component choices, common actions, layout patterns, copy/tone, a11y, BFS. **Load this every run.** The §15 checklist drives the brainstorm.
- **`../design-prototype/references/react.md` § "Portal components"** — only when the recommended design uses Modal / Popover / Tooltip / Toast / Sheet, so the response can flag prototype-mode implications.

Do NOT load `react.md`, `wc.md`, `css.md`, or `viz.md` in full — those are implementation references for `design-prototype`. This skill is implementation-agnostic.

## Process

### Step 1 — Resolve input

- **Inline content pasted in chat** (PRD, story, Jira description, etc.) → use as-is.
- **Bare feature name or Jira key with no pasted content** → stop. Ask the user to paste the requirement / Jira description. Do NOT auto-fetch from Jira.

### Step 2 — Read surrounding ot-frontend context

The point of this skill being **ot-frontend-specific** is that designs should fit the live app, not just generic Polaris. This step gathers the existing patterns the new design will live alongside.

**Hard budget: 3 files × 300 lines = 900 lines.** Don't exceed.

1. **Identify the feature area.** From the requirement, locate the most relevant subdirectory of `ot-frontend/src/pages/` — `Dashboard/`, `Shipments/`, `Settings/`, `Notifications/`, `Plan/`, `ShipmentAnalytics/`, `TrackingPage/`, `Welcome/`, `Feedback/`, `ReviewTable/`. If the feature touches more than one, pick the primary one.

2. **Read the area's `index.tsx`** with `limit: 300`. Mandatory.

3. **Read up to 2 directly-relevant siblings** (a sub-component inside the area, or a closely related sibling area's `index.tsx`). Pick by filename relevance. Skip if nothing's clearly relevant.

4. **Glob the `Custom*` wrapper directory** at `ot-frontend/src/components/Custom*/` — **filenames only, no content.** This makes the brainstorm able to name the wrappers available without paying their content cost.

5. **Capture (mentally, don't paste):**
   - Which `Custom*` wrappers and recurring patterns appear in the area: `CustomPage`, `CustomCard`, `CustomTable`, `CustomBanner`, `CustomLayoutOneThird`, `CustomCollapsible`, `HelpBanner`, `OnboardingGuide`, `ControlBar`, `UpgradeCard`, `UpgradeLock`, `FeedbackPopup`, `NavigationLink`
   - Whether the area handles plan-locking (`isLockFeature`, `LockIcon`, upgrade modals)
   - The page shell choice (`Layout` vs `CustomPage`, `fullWidth` vs default, where primary actions live in the header)
   - Repeated hooks / patterns (`useConfirmationNavigate`, redux slice naming, etc.)
   - Tab structure, table structure, banner placement, footer-skip pattern (in onboarding flows)

6. **If no related area exists** (rare, pure greenfield), read just one closest analogue's `index.tsx` and note the absence.

This step's budget is reserved by the skill — never skip it on the assumption "the requirement says enough." The whole reason the skill is ot-frontend-specific is this read.

### Step 3 — Walk the §15 checklist of polaris-ux.md (silently)

Load `polaris-ux.md` if not already in context. Mentally walk every item from §15: one job, primary action, cost-before-commit, default state, states (empty/loading/error), density (high vs low), component choices, card-action placement, color role, copy, a11y, portal-on-react.

Use the checklist to drive the response — don't paste it into the output.

### Step 4 — Produce the response

Use **this exact structure**. Skip a section only when truly N/A, and call out the skip.

```
## Problem framing
[1 sentence: what the merchant wants, what's blocking them, why now]

## North-star design idea
[1 paragraph: the central insight that distinguishes this design from
the obvious alternative. The "what makes this good"]

## Primary user flow
[Numbered steps the merchant walks through. Be concrete — name the
buttons, the counts, the screens. If multiple screens, group by screen]

## Fits into
[1–3 lines: the existing screens / flows this feature slots into; the
specific Custom* wrappers and recurring patterns from Step 2 that
this design should reuse; the page shell choice (Layout vs CustomPage)
that matches the surrounding area.

If Step 2 found no relevant precedent (pure greenfield with no
analogue), skip this section with one line: "Greenfield — no existing
ot-frontend pattern to extend. Closest analogue: <path>."]

## Surface choices
[Which Polaris components AND which existing ot-frontend wrappers
(CustomPage, CustomCard, HelpBanner, etc. — name them when extending).
Why. Cite polaris-ux.md sections (§2, §7, etc.) when the choice comes
from a documented Polaris pattern; cite the existing component file
(e.g. "Plan/index.tsx") when reusing an app-specific pattern.
Flag portal components with ⚠]

## Copy
[Apply Polaris voice (§10 of polaris-ux.md). Show the actual strings:
button labels, modal titles, error messages, banner copy, empty-state copy.
Sentence case. Action-first. No exclamations. No "click here"]

## States & edge cases
[Empty, loading, error, first-use, over-quota, repeated-use, no-data,
permission-denied, etc. — pick what applies. Each gets one line]

## Open questions for the PO
[UX decisions the requirement doesn't answer. Surface explicitly so the
user can take them to the PO before prototyping. This is the highest-value
section — it prevents wasted prototype rounds.

Also surface conflicts between Polaris guidelines and existing ot-frontend
patterns when both are reasonable: e.g. "Polaris §7 says basic buttons in
card footer, but Plan/index.tsx uses primary buttons there — match
existing app pattern or migrate?"]

## Next step
Want me to prototype this? Run: `design-prototype [recommended flags]`
[Recommend flags based on type: --greenfield vs --extension, light vs heavy,
--css if portal components are involved]
```

**Length target:** ~500–800 words for typical features. Single-screen → lower end. Multi-screen → upper end.

### Step 5 — Inline widgets (optional, use sparingly)

When a visual clarifies the recommendation in a way that text doesn't, use `mcp__visualize__show_widget`. Always call `mcp__visualize__read_me` first (silently — don't narrate the call to the user).

Widgets that earn their keep:

- **User-flow diagram** — boxes-and-arrows for a multi-step journey across screens
- **State comparison** — side-by-side default state vs error/over-quota state, when the visual difference is the design's main idea
- **Layout mockup** — rough column proportions for a card layout (especially when picking between Resource detail 2fr/1fr vs App settings 2fr/5fr)
- **Decision tree** — when the brainstorm hinges on a contested fork (Modal vs Sheet vs Page, ChoiceList vs Select) and the user benefits from seeing the reasoning visually

Widgets that don't earn their keep:

- A picture of a button that text already names
- A wireframe that just repeats §"Primary user flow"
- Anything decorative

Default to no widget. Only add one when you'd otherwise need 200+ words of layout description.

### Step 6 — Stop

End with the "Next step" invitation. Do NOT produce a file. Do NOT start prototyping. Wait for the user.

## Output rules

- **English only.** Even if the input (Jira description, inline PRD) is in Vietnamese, output the brainstorm in English.
- **Markdown formatted** in chat with the exact section headings above.
- **No code blocks** except for quoting copy strings, component names, or the final `design-prototype` command.
- **Cite polaris-ux.md** by section when a recommendation comes directly from a documented pattern (e.g. *"per §7, Banner not Toast — this needs persistent action"*).
- **Flag portal components.** If the design needs Modal / Popover / Tooltip / Toast / Sheet, add ⚠ in §"Surface choices" with: *"prototype in `--css` mode — react.md → 'Portal components'"*.
- **Surface decisions, don't hide them.** When you pick between two equally valid Polaris options, name the alternative and explain why you didn't pick it. Designers benefit from seeing the fork.
- **Keep open questions concrete.** Bad: *"How should this work for power users?"*. Good: *"For merchants who already chose 'No past orders' at install and now upgrade — does our prompt at upgrade-time imply they should re-import, or stay opted out?"*

## Edge cases

- **Backend/infra-only feature** → tell the user this skill brainstorms ot-frontend UI. Ask if they want to think through a merchant-facing settings/admin screen exposing the change. If no, exit.
- **Pure Shopify Admin behavior with no real UI choice** (e.g. "we'll respect the new App Bridge sticker convention") → say so in §"North-star idea" and produce a shorter response. No need to force-fill all sections.
- **Already-prototyped feature** → ask whether the user wants alternative design directions, or refinements to the existing one. Different output for each.
- **Multiple screens** → one brainstorm response covers all. Number subsections per screen inside §"Primary user flow" and §"Surface choices".
- **Feature explicitly out of scope for ot-frontend** (storefront, CMS, API portal) → say so and exit.

## Cross-reference notes

- This skill is the *thinking* counterpart to `design-prototype`'s *building*. They share `polaris-ux.md` but produce different artifacts (chat response vs HTML file).
- When the user follows up with *"prototype it"* or *"build it"* after a brainstorm, `design-prototype` should treat the brainstorm output as the Step 5 plan and skip the §15 re-walk. (`design-prototype/SKILL.md` Step 5 has a note about this.)
- Never duplicate content from `polaris-ux.md` here. Load it; don't copy from it.
