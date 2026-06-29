# Secondary mode — Shopify Polaris Web Components

Used when `--wc` is passed, or when primary mode doesn't cover a component well. Becomes **primary** after ot-frontend migrates to Polaris Web Components.

**Requires network** (loads `polaris.js` from Shopify's CDN). No version to pin — CDN always serves the latest build.

## Template

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{feature}} — Prototype</title>
  <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
  <style>body{margin:0;background:#fff;}</style>
</head>
<body>
  <s-page heading="{{feature}}" subheading="{{context}}">
    <s-button slot="primary-action" variant="primary" icon="plus">...</s-button>
    <!-- sections -->
  </s-page>
</body>
</html>
```

## Component catalog

- Actions: `<s-button>`, `<s-clickable>`, `<s-link>`, `<s-menu>`, `<s-button-group>`, `<s-clickable-chip>`
- Feedback: `<s-badge>`, `<s-banner>`, `<s-spinner>`
- Forms: `<s-text-field>`, `<s-text-area>`, `<s-search-field>`, `<s-number-field>`, `<s-money-field>`, `<s-checkbox>`, `<s-select>`, `<s-switch>`, `<s-choice-list>`, `<s-date-field>`, `<s-date-picker>`, `<s-drop-zone>`
- Layout: `<s-box>`, `<s-divider>`, `<s-grid>`, `<s-page>`, `<s-section>`, `<s-stack>`, `<s-table>`, `<s-ordered-list>`, `<s-unordered-list>`
- Overlays: `<s-modal>`, `<s-popover>`
- Media: `<s-avatar>`, `<s-icon>`, `<s-image>`, `<s-thumbnail>`
- Typography: `<s-chip>`, `<s-heading>`, `<s-paragraph>`, `<s-text>`, `<s-tooltip>`

## Gotchas

- Attributes are camelCase: `gridTemplateColumns="280px 1fr"`, NOT kebab-case
- `<s-table>` requires `<s-table-header-row>` → `<s-table-body>` → `<s-table-row>` → `<s-table-cell>`
- Icon-only buttons must have `accessibilityLabel="..."`
- Page actions go in slots: `<s-button slot="primary-action">`, `<s-button slot="secondary-actions">`

## Icons

`<s-icon type="pin">`, `<s-button icon="export">...`. Kebab-case the name.

Verified types: `pin`, `search`, `plus`, `edit`, `export`, `order`, `check`, `chevron-down`, `chevron-right`, `alert`, `info`, `delete`, `filter`, `refresh`, `settings`, `external`, `arrow-left`, `arrow-right`.

Full catalog: https://polaris-icons.shopify.com/

## Charts

No official polaris-viz WC build. For charts, render an inline SVG placeholder sized like the real chart and add `<!-- chart: polaris-viz <ChartName> in real app -->`. See `references/viz.md`.
