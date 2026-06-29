# Prototype — Size Finder

UI **source of truth** for the Size Finder feature (per lession-7: "repo is spec,
including UI"). The agent must build the UI to match what lands here, not invent
its own styling.

## Contents
- `size-finder-widget.html` — **storefront** prototype: product page mock + "Find my
  size" button → modal (height/weight/fit form) → result states (exact /
  out-of-range "estimate" / input error). Built from `../specs/size-finder-design.md`.
- `admin-size-chart.html` — **embedded-admin** prototype (Polaris look, offline/CSS mode):
  Size chart editor — Card with a 4-row table (S/M/L/XL × height/weight min/max), Save
  (primary) + Reset to default, critical Banner on validation error, "Size chart saved"
  toast. Built from `../specs/admin-size-chart-design.md` (Phase 2 / stretch).

## How it plugs into the harness
- `AGENTS.md` points here as the UI source of truth ("no raw unstyled HTML").
- Widget → realized by `../plans/size-finder.md` (Task 6), visually equivalent.
- Admin editor → realized by `../plans/admin-size-chart.md` (Task 4), visually equivalent.

## Status
- ✅ `size-finder-widget.html` — storefront (hand-authored; the Polaris-admin skill
  doesn't fit a storefront surface).
- ✅ `admin-size-chart.html` — admin Polaris editor (CSS/offline mode; Toast is a portal
  component → CSS mode per the design-prototype skill). Mirrors `validateChart` for the
  interactive validation demo.
