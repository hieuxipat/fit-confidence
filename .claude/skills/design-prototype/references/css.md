# Fallback mode — Plain HTML + Polaris-standard CSS

Used when `--css` is passed, or when neither CDN loads cleanly. Output must still visually match ot-frontend.

**Works offline.** The only network call is the Inter webfont; if it fails, the stack falls back to system font automatically.

## Typography

Include Inter in `<head>`:
```html
<link rel="preconnect" href="https://rsms.me/">
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">
```

In CSS:
```css
html { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
@supports (font-variation-settings: normal) {
  html { font-family: 'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
}
body { font-size: 14px; line-height: 1.45; color: var(--p-color-text); background: var(--p-color-bg); }
```

## Design tokens (MANDATORY — copy unchanged)

Polaris semantic names — prototype CSS translates 1:1 to real code.

```css
:root {
  /* Surface / background */
  --p-color-bg: #f1f1f1;
  --p-color-bg-surface: #ffffff;
  --p-color-bg-surface-hover: #fafbfb;
  --p-color-bg-surface-selected: #f1f2f3;

  /* Border */
  --p-color-border: #e1e3e5;
  --p-color-border-strong: #c9cccf;

  /* Text */
  --p-color-text: #303030;
  --p-color-text-secondary: #616161;
  --p-color-text-on-color: #ffffff;

  /* Primary action (Shopify 2024+ dark admin button) */
  --p-color-bg-primary: #303030;
  --p-color-bg-primary-hover: #1a1a1a;

  /* Status */
  --p-color-bg-critical: #fde2dd;
  --p-color-text-critical: #e51c00;
  --p-color-bg-success: #cdfee1;
  --p-color-text-success: #0c5132;
  --p-color-bg-warning: #ffe9d6;
  --p-color-text-warning: #916a00;
  --p-color-bg-info: #ebf9fc;
  --p-color-text-info: #00527c;

  /* Shape */
  --p-border-radius-200: 8px;
  --p-border-radius-100: 6px;
  --p-shadow-100: 0 1px 0 rgba(22,29,37,.05), 0 0 0 1px rgba(22,29,37,.07);
}
```

## Required classes (shadow real Polaris class names)

- `.Polaris-Page` — max-width 1200px, padding 20px, margin auto
- `.Polaris-Card` — bg `--p-color-bg-surface`, radius `--p-border-radius-200`, shadow `--p-shadow-100`, padding 16px
- `.Polaris-Button`, `.Polaris-Button--primary` (dark bg, white text), `.Polaris-Button--tertiary` (transparent)
- `.Polaris-Badge`, `.Polaris-Badge--success`, `--warning`, `--info`, `--critical`
- `.Polaris-Tag` — removable chip (rounded 14px, grey bg)
- `.Polaris-TextField__Input`, `.Polaris-TextField__Textarea`, `.Polaris-Search`
- `.Polaris-DataTable` / `.Polaris-IndexTable` — clean borders, hover `--p-color-bg-surface-hover`, uppercase subdued header
- `.Polaris-Banner`, `.Polaris-Banner--success`, `--warning`, `--critical`, `--info` — 4px colored left border
- `.Polaris-Modal`, `.Polaris-Modal__Backdrop` — centered 520px

## Rules

- NO third-party CSS (no Tailwind, Bootstrap, Bulma)
- Semantic HTML (`<button>`, `<table>`, `<input>`, `<h1>`)
- Dark buttons (Shopify 2024+ admin), not green
- All interactive states visible (hover, active/selected, disabled)
