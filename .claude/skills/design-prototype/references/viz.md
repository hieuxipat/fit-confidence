# Polaris Viz (charts)

ot-frontend uses `@shopify/polaris-viz` on screens like `Dashboard/`, `ShipmentAnalytics/`, `ReviewTable/`. If the feature involves charts, match that — don't fake with custom SVG when polaris-viz would be used in real code.

## Primary mode (React)

Add to the import map, using version from Step 0:
```json
"@shopify/polaris-viz": "https://esm.sh/@shopify/polaris-viz@{{POLARIS_VIZ}}?deps=react@{{REACT}},react-dom@{{REACT}}"
```

Wrap the app in `PolarisVizProvider`, use `LineChart`, `BarChart`, `DonutChart`, `FunnelChart`, `StackedAreaChart`, `SparkLineChart`:

```js
import { PolarisVizProvider, LineChart } from '@shopify/polaris-viz';
// <${LineChart} data=${data} theme="Light" />
```

## Secondary mode (WC)

No official polaris-viz WC build. Render an inline SVG placeholder sized like the real chart and add:
```html
<!-- chart: polaris-viz <ChartName> in real app -->
```

## Fallback mode (CSS)

Render a simple SVG placeholder with a label `Polaris Viz <ChartName>` and a light neutral background. Do NOT attempt to replicate real chart rendering — this mode is explicitly lo-fi.

## All modes

- Realistic data shape: time-series for line/area, category buckets for bar/donut
- Theme: `Light` (ot-frontend is light-mode)
