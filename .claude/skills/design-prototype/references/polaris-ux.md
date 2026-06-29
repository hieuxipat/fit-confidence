# UX & Polaris guidance for design planning

Consulted in Step 5 (planning) and during Step 6 generation. Use this to make component-choice and layout decisions before producing HTML — not as a styling cheatsheet.

**Canonical sources to defer to when this file is out of date:**
- Polaris React: https://polaris-react.shopify.com/
- Built for Shopify design requirements: https://shopify.dev/docs/apps/launch/built-for-shopify/requirements#design
- Polaris design tokens: https://polaris-react.shopify.com/tokens

This file is a working summary of those sources for Step 5 planning. Canonical docs win on conflict.

---

## 1. Pro design language (the four principles)

Polaris frames every decision around four principles. When two design options seem equally valid, pick the one that better serves these:

1. **Assign meaning.** Visual language is clear for merchants. Color carries strict semantics — red = danger, green = go, blue = info, purple = magic/AI. Color used as decoration is reserved for illustration. Established symbols (icons) replace text for known actions. Every visual plays a role.
2. **Increase density.** Optimize space while maintaining usability. High density for data-rich views (index pages, tables); low density for focused editing (resource detail, settings). Use space, color, and weight to create groups and emphasize what matters — not divider lines.
3. **Craft juicy interactions.** Interfaces feel real. Primary interaction points respond dramatically (buttons depress, hover transitions are smooth-then-snappy). Detailed micro-animations (checkbox tick, card lift) make the UI feel alive without distracting.
4. **Make it predictable.** Visually similar elements behave consistently. A merchant who learns one card learns all cards. Same signifiers throughout = lower cognitive load and a smoother learning curve.

The litmus test for any design decision: *"does this make the merchant feel like Shopify Admin treats their time and money seriously?"*

---

## 2. Color: roles & relationships

Color in the admin is purposeful, not decorative. The interface is intentionally monochrome (black/white/gray) so colored elements pop with meaning.

### Roles (each role has tokens for bg, fill, border, text, icon)

| Role | Use for | Example tokens |
|---|---|---|
| **Default** | Baseline — most of the admin | `--p-color-text`, `--p-color-bg-surface` |
| **Brand** | Pull focus to the *one* most important action on a page | `--p-color-bg-fill-brand` (#303030 — dark, not green) |
| **Info** | Tips, promotions, incentives, "have you considered…" | `--p-color-bg-surface-info` (light blue) |
| **Success** | Confirmation that something completed correctly | `--p-color-bg-surface-success` (light green) |
| **Caution** | Stalled / incomplete / not-yet-started but not broken | `--p-color-bg-fill-caution` (yellow) |
| **Warning** | Needs merchant intervention, in-progress, pending | `--p-color-bg-fill-warning` (orange) |
| **Critical** | Action impossible, blocked, errored — highest urgency | `--p-color-bg-fill-critical` (red) |
| **Magic** | AI/automation features only | `--p-color-bg-fill-magic` (purple) |
| **Emphasis** | Active selection in editors (theme editor, etc.) | `--p-color-bg-fill-emphasis` (blue) |
| **Transparent** | Repeating low-affordance elements (tab fills, edit chevrons) | `--p-color-bg-fill-transparent` |
| **Inverse** | Dark surfaces — global top bar only | `--p-color-bg-inverse` |

Specialized roles: **Input** (form fields, ensures WCAG contrast), **Nav** (admin sidebar only).

### Caution vs Warning vs Critical — get this right

These are a three-level severity scale. Picking the wrong one is the most common Polaris mistake:

- **Caution (yellow)** — "this is stalled or hasn't started, but isn't broken." Pending shipment without a tracking number. Onboarding step not yet completed.
- **Warning (orange)** — "merchant action needed soon." Quota at 90%. Token expiring. Carrier integration degraded.
- **Critical (red)** — "blocked or errored." Quota exceeded. Sync failed. Token expired.

Don't use Critical for things that aren't actually broken. Don't use Caution for announcements ("under construction", "coming soon").

### Color relationships (where colors live)

- **Background** — page-level baseline. Multiple backgrounds only side-by-side, never stacked.
- **Surface** — cards, banners, modals. Surfaces nest, but don't mix role-surfaces (a critical surface inside a default surface is jarring).
- **Fill** — buttons, badges, the most vibrant elements. Fills sit on surfaces and have explicit `on-fill` text colors that must be paired correctly.
- **Border** — primarily for data tables. Don't use borders to delineate content elsewhere — use surfaces or stack gaps.
- **Text / Link / Icon** — accessibility-tuned per surface. Don't reuse `text-on-fill` colors outside their fill.

### Disabled state

Always use the explicit `--p-color-*-disabled` tokens — never opacity. Disabled elements don't need to meet WCAG contrast.

---

## 3. Depth (shadow, lighting, layering)

Depth signals **hierarchy**, **interactivity**, and **focus**.

- Higher Z = more important. Use sparingly — too many raised elements = clutter.
- Interactive elements get depth (buttons, raised cards). Static elements don't.
- Depth changes on interaction: button presses *down* and darkens; active page lifts *up* and brightens.
- Surface depth: a gray inset background pushes content *into* the page (de-emphasized container). A raised surface pulls content *out* (emphasized).
- Don't allow elements to protrude outside their parent. Maintain parent–child depth integrity.

Shadow tokens map to component types:
| Token | Used by |
|---|---|
| `--p-shadow-100` + `--p-shadow-bevel-100` | Cards, data tables, top bar, resource list, empty states |
| `--p-shadow-200` | Banners, callout cards |
| `--p-shadow-300` | Action lists, popovers, tooltips, color/date pickers |
| `--p-shadow-400` | Toasts |
| `--p-shadow-600` | Modals, search |

---

## 4. Layout & density

### Space defines proximity

Closer = more related. Group related items in the same card; nest related sub-groups inside.

### Emphasis creates hierarchy

Use **size, weight, contrast** — not divider lines — to create hierarchy. Divider lines are reserved for data and index tables.

### High density vs low density

- **High density** — index pages, data tables, action lists, popovers, dashboards. Tight spacing. Use surface-color shifts (not lines) to delineate. Action components (option lists, popovers) are always high density.
- **Low density** — resource detail, settings, focused editing. Generous spacing, larger hit targets, wordier buttons. Use Cards to switch contexts; one context per card.
- Don't mix: a single card shouldn't have both a low-density form and a high-density data table sharing space.
- Top-to-bottom rhythm in low density; grid/columns in high density.

### Spacing tokens (4px base)

| Token | Value | Used for |
|---|---|---|
| `--p-space-100` | 4px | Inside form-layout items (label-to-input); list items |
| `--p-space-200` | 8px | Between header/body/footer in a single-section card; section heading to content |
| `--p-space-300` | 12px | Between form layout items (variable-weight content) |
| `--p-space-400` | 16px | Card padding (default); between card sections |
| `--p-space-500` | 20px | Page-level vertical separation |
| `--p-space-800` | 32px | Major page-section breaks |

Use semantic tokens (`--p-space-card-padding`, `--p-space-card-gap`, `--p-space-table-cell-padding`) when they fit; primitive tokens otherwise.

### Padding rules

- Default Card padding: `--p-space-400` (16px).
- The deeper an element is nested, the smaller its padding.
- Use padding inside *visible* containers (Card, table header). Use stacks (gap), not padding, for spacing inside *invisible* containers (form layouts, BlockStacks).

### Nesting

- Inset surfaces should have *smaller* border radius than their parent (creates the "purpose-built" feel).
- Don't change the radius of nested buttons or badges.
- Tables nested in a Card use tighter horizontal padding than a standalone table — adjust to optimize space.

---

## 5. Typography

Inter (variable). Falls back to system font where Inter glyphs aren't available. Mono font (system) for code only.

### Two scales

- **Heading** — `heading3xl`, `heading2xl`, `headingXl`, `headingLg`, `headingMd`, `headingSm`, `headingXs`
- **Body** — `bodyLg`, `bodyMd`, `bodySm`, `bodyXs`

All line heights are multiples of 4px (vertical rhythm).

### Hierarchy rules

- Page title = `heading2xl` (one per page).
- Card title = `headingLg`.
- Sub-section within a Card = `headingMd`.
- Default body = `bodyMd`.
- Don't make headings larger than they need to be — short headings often look better in `headingMd` even at the top of a card.
- Body weight varies more than heading weight to create scan-paths in dense layouts.
- Never combine bold + caps + larger size — pick one emphasis dimension.

### Tabular numbers

For currency, money totals, repeating numbers in tables, use `font-variant-numeric: tabular-nums`. This aligns digit widths so columns of numbers line up vertically. Don't use mono font as a substitute.

Exception: for very large promotional numbers (plan pricing pages), tabular numbers can be skipped.

### Underlines

- Solid underline + link color = navigation link.
- Dotted underline = definition indicator (tooltip / popover, doesn't navigate).

---

## 6. General UX principles

These aren't Polaris-specific but apply to admin tooling. Walk this list during Step 5:

- **Show cost before commitment.** For any action that consumes quota, money, time, or destroys data, the confirm button must show the magnitude in its label and surface the cost in the modal body. *"Sync 104 orders"* > *"Confirm"*. *"Delete 3 templates"* > *"OK"*.
- **Default the safer choice.** Pre-select the option with the smallest blast radius. Force opt-in for impact, not opt-out.
- **Progressive disclosure.** Don't expose every option upfront. Group advanced settings behind `Collapsible`.
- **Empty states earn their keep.** Show what the section does, the one action that creates the first item, an illustration to anchor the eye. Never show "No data" alone.
- **Error recovery, not error reporting.** Every error must answer *"what should I do now?"* — include the corrective action.
- **Loading states promise time.** Spinners for <2s. Counter (`12 of 142 synced`) or progress bar for longer. Banners for jobs the merchant can navigate away from.
- **One job per screen.** More than one primary action = more than one job → split.
- **Reversibility beats confirmation.** A toast with *Undo* is better than a confirm dialog for any cleanly undoable action. Reserve confirm modals for irreversible/expensive operations.
- **Naming follows the merchant's mental model.** Shopify nouns: Orders, Customers, Products, Locations, Carriers. *"Sync past orders"* > *"Resync"*.

---

## 7. Polaris component choices

### Card layout — header / body / footer

Cards have a strict three-part anatomy. Get the action placement right or merchants can't find anything.

**Header**
- Card title represents the whole card. Default to using the object type as the title for list cards.
- Header actions represent the *whole* card — typically `Edit` or `View` as **tertiary icon buttons** (with tooltip, not text).
- **Don't** put call-to-actions in the header. Don't group unrelated actions there.
- **Don't** put list-item actions (delete a single row) in the card header — put them on the row.
- Table actions (add an item) go top-right of the header to keep them discoverable.

**Body**
- Group content into sections with section headings.
- For a single-section card, omit the section title but keep the `space-200` gap.
- Don't use card sections to divide list items — use a list component within one section.
- Never let a card grow so tall it can't be overviewed — provide an expand/collapse footer action.
- Section actions live in the section header, not the card header.

**Footer**
- Call-to-actions live here. **Default to basic (secondary) buttons** — primary only when this is *the* most important action on the page.
- Use `ActionList` if there are >2 footer actions.
- List add actions ("Add row") live bottom-left of the footer, near where the new item appears.
- Don't use footer actions to update card content/presentation — those are header actions.

### Form layouts inside cards

- Always wrap form elements in a form layout, even with a single item.
- Use `space-300` gap between layout items (their variable weight needs more breathing room).
- Use `space-100` between an item's label and input.
- Don't let layout items be wider than necessary — group them side-by-side when content is short.
- Don't leave large empty space next to a `ChoiceList` — pair it with another field horizontally.

### Buttons

- **Primary (`bg-fill-brand`, dark #303030)** — one per page section. Reserve for the action the merchant is most likely to want next.
- **Secondary (default)** — common alternatives. Multiple are fine.
- **Plain** — Cancel, Skip, Edit-link. Never use Primary for Cancel.
- **Tertiary** — icon-only, dense contexts. No fill, no border.
- **Critical-tone Primary (red)** — use sparingly. Don't pair with other tones in the same row (creates visual competition).

### Banner / Toast / InlineError / ExceptionList

- **Banner** — page-level, persistent. State the merchant must act on. Always include an action.
- **Toast** — transient confirmation of completion. Disappears in ~5s. Never for errors that need action.
- **InlineError** — field-level validation, below the input.
- **ExceptionList** — row-level issues in a table.

Rule: **banners persist, toasts pass.** If missing the message has consequences, banner. Otherwise, toast.

### ChoiceList / Select / RadioButton / Checkbox / Switch

- **3–5 options, all visible** → `ChoiceList` (radio behavior). Merchants compare without clicking.
- **6+ options or long labels** → `Select` (dropdown).
- **Single binary setting** → `Checkbox`.
- **Single binary live state change** → `Switch` (toggle a feature on right now).
- **Compound choice (range + presets + helpText)** → `ChoiceList` with helpText per option.

### Modal / Sheet / Page / inline

- **Modal** — short focused decision (≤2 fields, one primary action). Blocks the rest of the UI.
- **Sheet** — longer task, side panel, page context stays visible.
- **New Page** — multi-step, multi-screen, or pause-and-return tasks.
- **Inline** — settings with one obvious value. Don't pop a modal for a checkbox.

⚠️ **Don't use Modal/Popover/Tooltip/Sheet in react-mode prototypes.** See `references/react.md` → "Portal components" — they trigger React error #31 on esm.sh. Switch to `--css` mode.

### Filter / search placement (table headers)

- Above the table, left side: filters (`IndexFilters`).
- Above the table, right side: bulk actions, export, primary CTA.
- Don't mix table-level filters with page-level actions in the same row.

---

## 8. Common actions — icons & placement

Polaris standardizes recurring actions for predictability. Use these exact icons:

| Action | Icon | Placement | Variant |
|---|---|---|---|
| **Add** | `CirclePlusIcon` (or `PlusIcon`) | Bottom of short lists; card/page header for long lists; outside scrollable area for picker dropdowns | Secondary |
| **Copy text** | `ClipboardIcon` | Inline-right of the string, show on hover | Tertiary |
| **Copy URL/link** | `LinkIcon` | Inline-right of the URL, show on hover | Tertiary |
| **Delete** | `DeleteIcon` (trash) | Bottom of action lists; or inline-right on list items | Destructive in action list; tertiary inline |
| **Edit** | `EditIcon` (pencil) | Card header, or inline | Tertiary icon |
| **More actions** | `MenuHorizontalIcon` (⋯) | Right side of card header / row | Secondary or tertiary |
| **Pin** | `PinIcon` (filled when pinned) | Inline | Tertiary |
| **Remove** (≠ delete) | `XIcon` | Inline-right, show on hover | Tertiary |

Distinctions to keep straight:
- **Delete** destroys data. Use the trash icon, often destructive-tone.
- **Remove** breaks a relationship without deleting. Use `XIcon`, never the trash icon.
- **Add** is filled-circle-plus by default. Bottom of list (not table — table goes top of list). Top-of-list only for *long* resource lists where bottom would be hidden.

After-click feedback: inline copy → confirmation check icon. Action list copy → toast "Copied to clipboard."

---

## 9. Layout patterns

### Resource detail layout (used for Product, Order, Customer, etc.)

- 2-column grid: **2fr / 1fr** — primary content left (2/3), secondary right (1/3).
- Page header full-width with title + back action + secondary actions + pagination.
- Primary column: content that *defines* the resource (name, description, variants).
- Secondary column: status, metadata, summaries.
- Default page width — never `fullWidth`.
- Group similar content in the same Card.
- Page-level secondary actions: unique to this resource at the top of the action list (Duplicate, Print). Common object actions at the bottom (Archive, Delete).

### Resource index layout (used for Products, Orders list, etc.)

- Single column.
- Page title = resource type plural.
- Primary action top-right = "Add [resource]" (or remove if no creation flow).
- Below page header: tabs/filters/sort/search for filtering.
- Below filters: the index (`IndexTable` or list).
- Default to normal width unless table needs >5 columns.

### App settings layout

- 2-column grid: **2fr / 5fr** — *labels and descriptions* left, *settings cards* right.
- Each row = a settings group (heading + description + card with form fields).
- Multiple groups stack vertically with `Divider` between them on `sm`+ breakpoints.
- This is *not* the resource-detail layout — easy to confuse, but the column ratio is different.

### When to use which

- Editing one resource → **Resource detail**
- Listing/filtering many resources → **Resource index**
- Configuring app-wide settings → **App settings**

---

## 10. Copy and tone

Polaris voice is **plain, direct, helpful, never cute**. The mantra is *"could this header, subcopy, and button just be a button?"*

### Universal rules

- **Sentence case** for headings, subheadings, buttons, card titles, email subjects. Capitalize only proper/branded nouns.
- **Action-first button labels.** *"Save"*, *"Send invitation"*, *"Sync 104 orders"*. Never *"OK"*, *"Submit"*, *"Click here"*.
- **You-language**, not we-language. *"You haven't connected a carrier"* > *"We don't see a carrier"*.
- **Use contractions.** *"Don't"*, *"you're"*, *"can't"*. They sound human.
- **No exclamation marks** unless the moment is genuinely worth it ("You launched your first store" — yes; "Title updated" — no). Max one per page.
- **No question marks** if the answer's obvious or the option's binary. Reword to a statement.
- **Aim for 7th-grade reading level.** Read it out loud — does a human talk that way?
- **Numbers in numerals** (3, not three). Format with locale separators: `1,284` not `1284`. Use commas in 4+-digit numbers.
- **No periods** in single-sentence interface copy. Periods only when there are 2+ sentences.

### Headings

- Informative, scannable, single-sentence, no period.
- Conversational areas (Home cards, empty states, marketing) can use articles ("Secure your account…"); product UI typically doesn't.
- Avoid bold inside headings.

### Lists

- Bulleted: when sequence doesn't matter. Capitalize first word, no end punctuation unless any item has 2+ sentences (then punctuate all).
- Numbered: when sequence matters.
- Don't mix single-word bullets with sentence bullets in the same list.

### Errors

Anatomy: optional heading (effect on merchant) + body (how to fix it, link to help) + optional CTA (one-step solution).
- "Couldn't deposit payout. The bank account on file was closed. Update your details, and we'll retry automatically." → button *"Update bank account"*.
- Not "Invalid bank account. Your payout was not deposited because…"
- Avoid "invalid", "sorry", over-apology unless Shopify caused the problem.

### Links

- Avoid links if possible — they make the UI feel like a webpage, not software.
- Never *"click here"* or *"here"* as link text.
- Use *"Learn more"* sparingly (max one per screen).
- Punctuation outside the link unless it's a stand-alone sentence.

### Numbers, dates, currency

- Date: *"December 11, 2024"* or *"Dec 11, 2024"*. Never `12/11/24` or ordinals (`11th`).
- Time: 12-hour with `am`/`pm` lowercase, space before. `3:00 pm`, range `3:00 pm–4:00 pm`.
- Date + time: separate with the word *"at"*: *"Thursday, October 15, 2024 at 2:00 pm"*.
- Currency: amount then code: `$10,000 USD`. Not `USD$10,000`.
- Number ranges: en dash, no spaces: `5–10 products`.
- Plan display names per CLAUDE.md: `starter`→Free, `basic`→Launch, `professional`→Scale, `enterprise`→Pro.

---

## 11. Inclusive language

Don't ship terms with biased or exclusionary history. Polaris's specific replacements:

| Avoid | Use instead |
|---|---|
| Disable / disabled (as state verb) | Turn off, deactivate, inactive |
| Blacklist | Denylist, blocklist |
| Whitelist | Allowlist, permitted |
| Master (in master/slave or master copy) | Main, primary, source, expert |
| Grandfathered in | Legacy, legacied, exempt |
| Crazy / insane / nuts | Wild, extreme, unbelievable, intense |
| Just / easy / simple / quick (in instructions) | Drop the modifier — don't tell merchants something is easy |
| He / she / his/her | They / their (default) |
| Manpower / manmade / mailman | Workforce, synthetic, mail carrier |

Keep *"disabled"* only where it refers to a literal HTML element state. Note that some accessibility-tested code (e.g. `Labelled` / `aria-labelledby`) uses British spelling intentionally — don't "fix" it.

Default to American spelling for everything else (color, center, canceled).

---

## 12. Accessibility musts

Required, not optional. BFS audits these.

- **Color contrast** ≥4.5:1 body, ≥3:1 large text and UI components.
- **Never communicate state with color alone.** Pair with icon, label, or text.
- **Keyboard-reachable, visible focus ring.** Polaris provides `:focus-visible`; don't strip it.
- **Form labels visible or `accessibilityLabel`.** Placeholder ≠ label.
- **Modal focus trap, Esc to close, focus restored on close.** Polaris `Modal` does this — don't reinvent.
- **Heading order h1 → h2 → h3.** No skipping.
- **Touch targets ≥44×44px** at mobile breakpoints.
- **Icon-only buttons need `accessibilityLabel`** ("Edit shipment", not silent).
- **Errors associated** with inputs via `aria-describedby`.

### Alt text

- Every `<img>` needs `alt` — even decorative ones, set `alt=""`.
- Alt text is read 3× slower than visual reading. Be **brief**.
- Don't write "Image of…", "Photo of…" — screen readers already announce `<img>`.
- For interactive icons, describe the **action** (`accessibilityLabel="search"`), not the picture (`"magnifying glass"`).
- Decorative SVGs / spacer images / progress bars where info is also in text → `alt=""`.

---

## 13. Built for Shopify (BFS) design requirements

Apps applying for BFS status must meet these (paraphrased — verify at canonical URL):

- **Embedded apps must use App Bridge** for navigation, modals, toasts, resource pickers. Don't roll your own modal library.
- **Use Polaris React** (or Polaris Web Components when migrated). Custom UI permitted but must visually match.
- **Page structure** — page title at top, primary actions in page header, secondary actions near related content, no orphaned Save buttons.
- **Loading states** for any async action >300ms. Don't show stale data without an indicator.
- **Empty states** required for every list view — illustration + introductory copy + first-item action.
- **Error states** required for failed loads — banner + retry, not blank page.
- **Mobile responsive.** Embedded apps run inside Shopify's mobile app. Use Polaris responsive props, not custom media queries.
- **Match Admin nav structure** — top-level in sidebar, sub-nav in tabs at top of page. No third nav level.
- **Don't override App Bridge styles.** Top bar, save bar, breadcrumbs are Shopify's. App styles its own page content.
- **Performance** — TTI <2s, first paint <1s on mid-range hardware.
- **i18n** — all user-facing strings translatable. No string concatenation. Use ICU message format. Locale-aware date/number/currency formatting.

---

## 14. New features (when to use a "New" badge / pip)

⚠️ **Default = no badge.** The bar is high — most features don't qualify.

A feature gets a "New" badge or pip only if **all three** are true:
1. Shopify wants to drive adoption because the feature has high business value.
2. It creates new and outsized value (not just an improved way to do something existing).
3. It's worth distracting the merchant from their current workflow to inform them.

Examples that qualify: a new top-level page in settings, an entirely new technology/capability.

### Badge rules

- Use the **`info` tone Badge variant** for "New".
- Right-aligned or to the right of text. Polaris `Page` already places badges to the right of headings — match that.

### Pip rules

- Pips are for **status** in lists (a new item in a notifications list, an unread thread). **Not for new features.**

### Lifespan

The badge disappears when **any** of these happens (whichever first):
- Merchant clicks the element it's attached to.
- 5 days after first view.
- 3 sessions (3 separate page-loads of the same screen).

---

## 15. Step 5 planning checklist

When planning a screen, walk this list before writing the plan bullets:

1. **One job** — can you state the screen's purpose in one sentence? If not, split.
2. **Primary action** — one button, dynamic label naming the consequence (`Sync 104 orders`, not `Confirm`).
3. **Cost or risk** — does this consume quota / money / time / data? If yes, surface it in the body and the button label *before* the merchant commits.
4. **Safer default** — which option pre-selected creates the smallest blast radius?
5. **States** — what does this screen look like empty, loading, in-error?
6. **Density choice** — high (data-rich, tight) or low (focused editing, generous)?
7. **Component choices** — Modal vs Sheet vs Page; ChoiceList vs Select; Banner vs Toast; primary button vs basic. Refer to §7.
8. **Card actions** — header = represents-whole-card edit; footer = call-to-actions; list actions inline with rows. Not mixed.
9. **Color role** — Default for baseline; Caution / Warning / Critical only for the right severity; Brand only on *the* most important action.
10. **Copy pass** — sentence case, action-first, no exclamations, no "click here", you-language, contractions, numerals.
11. **a11y musts** — labels, focus order, keyboard reachable, color-not-the-only-signal.
12. **Portal-on-react check** — if the design needs Modal/Popover/Tooltip/Sheet, switch to `--css` mode (see `references/react.md`).

If any answer is "I don't know yet", that's a question to ask in Step 5 confirmation — not a thing to silently decide during generation.
