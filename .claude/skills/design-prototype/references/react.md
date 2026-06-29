# Primary mode — Polaris React via CDN

Used by default. Matches the ot-frontend stack (React 18 + Polaris 12 today, or whatever Step 0 resolved).

**Requires network.** If the user says they're offline / behind a restrictive proxy, use fallback mode (`--css`) instead.

Placeholders `{{REACT}}`, `{{POLARIS}}`, `{{POLARIS_ICONS}}`, `{{POLARIS_VIZ}}` below are filled from Step 0 discovery. The `?deps=` value MUST match the React version from Step 0 exactly.

## Template

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{feature}} — Prototype</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shopify/polaris@{{POLARIS}}/build/esm/styles.css" />
  <style>body{margin:0;background:#f1f1f1;}</style>
</head>
<body>
  <div id="root"></div>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@{{REACT}}",
      "react/jsx-runtime": "https://esm.sh/react@{{REACT}}/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@{{REACT}}",
      "react-dom/client": "https://esm.sh/react-dom@{{REACT}}/client",
      "@shopify/polaris": "https://esm.sh/@shopify/polaris@{{POLARIS}}?deps=react@{{REACT}},react-dom@{{REACT}}",
      "@shopify/polaris-icons": "https://esm.sh/@shopify/polaris-icons@{{POLARIS_ICONS}}?deps=react@{{REACT}}",
      "htm": "https://esm.sh/htm@3.1.1"
    }
  }
  </script>
  <script type="module">
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import htm from 'htm';
    import { AppProvider, Page, Card, Button /* ... */ } from '@shopify/polaris';
    import { PlusIcon /* ... */ } from '@shopify/polaris-icons';

    const i18n = await fetch('https://cdn.jsdelivr.net/npm/@shopify/polaris@{{POLARIS}}/locales/en.json').then(r => r.json());
    const html = htm.bind(React.createElement);

    function App() { return html`<${AppProvider} i18n=${i18n}>...</${AppProvider}>`; }
    createRoot(document.getElementById('root')).render(html`<${App} />`);
  </script>
</body>
</html>
```

## Critical

- `@shopify/polaris-icons` MUST have `?deps=react@{{REACT}}` matching the React version, or you get React error #31 (dual React).
- htm syntax: `<${Component}>...</${Component}>`, props `prop=${value}`.

## Portal components — use CSS fallback

Features that render **`Modal`**, **`Popover`**, **`Tooltip`**, **`Toast`**, **`Sheet`**, or **`Frame`** with toasts cannot be prototyped reliably in react mode on esm.sh. esm.sh rewrites Polaris's internal `import 'react'` to a canonical build URL (e.g. `https://esm.sh/v135/react@{{REACT}}/es2022/react.mjs`) that is not identical to the importmap's `react` entry — the browser loads two React instances, each with its own `$$typeof` Symbol. Non-portal components render inline through a single instance tree and are fine, but `createPortal` crosses the boundary and throws React error #31: *"Objects are not valid as a React child (found: object with keys {$$typeof, type, key, ref, props})"*. `?deps=` and `?external=react,react-dom` do not fix this — `react-dom` and `react-dom/client` are separate module paths in the browser and loading both initializes react-dom twice.

**Action:** if the feature needs any portal component, switch to `--css` mode automatically and note the switch in Step 8's report. Do not attempt to patch the react template.

## Icon version compatibility

`@shopify/polaris-icons@8.x` and `@shopify/polaris-icons@9.x` use **different import names** (v8: `PlusMinor` / `PlusMajor`, v9: `PlusIcon`). Pick imports that match the major version resolved in Step 0. Cross-check at https://polaris-icons.shopify.com/.

Under `polaris-icons@8.11.x` only a subset of v9-style `*Icon` names are aliased — others still require the `*Minor`/`*Major` suffix. Verified safe at 8.11.1: `RedoIcon`, `CalendarIcon`, `InfoIcon`, `ChevronDownIcon`, `CheckCircleIcon`, `UploadIcon`, `XIcon`. Confirmed *unsafe* at 8.11.1: `XCircleIcon` (v9-only). When in doubt, **use inline SVG** (see Extension-mode note) rather than importing from `polaris-icons` — a single missing named import halts the entire module and produces a blank page with no visible error.

## Extension-mode note

Standalone HTML can't import ot-frontend's real `Custom*` wrappers. Simulate them by composing the same underlying Polaris components in the same shape — e.g. `CustomPage` ≈ `<Page>` + action slots, `CustomCard` ≈ `<Card>` with a specific padding/header style. Match the visible result; don't copy source.

## Charts

If the feature involves charts, read `references/viz.md`.
