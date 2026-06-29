# Prototype — Size Finder

UI **source of truth** for the Size Finder feature (per lession-7: "repo is spec,
including UI"). The agent must build the widget to match what lands here, not
invent its own styling.

## Planned contents
- `size-finder-widget.html` — single-file storefront prototype: product page mock
  + "Find my size" button → modal (height/weight/fit form) → result states
  (exact / out-of-range "estimate" / input error). Built from the design brief in
  `../specs/size-finder-design.md`.

## How it plugs into the harness
- `AGENTS.md` points here as the UI source of truth ("no raw unstyled HTML").
- Plan task for the widget (`../plans/size-finder.md`) = "realize this prototype,
  visually equivalent".

> Status: ✅ `size-finder-widget.html` generated (storefront-only, hand-authored from the
> brief; the Polaris-admin skills don't fit a storefront surface). It is now the UI the
> app must match in plan Task 7.
