import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, useRouteError } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { ensureSizeChartDefinition, readChart, writeChart } from "../size-chart.server.js";
import { validateChart } from "../size-chart.validate.js";
import { DEFAULT_CHART } from "../default-chart.js";

const SIZES = ["S", "M", "L", "XL"];
const FIELDS = [
  { key: "height_min", label: "Height min (cm)" },
  { key: "height_max", label: "Height max (cm)" },
  { key: "weight_min", label: "Weight min (kg)" },
  { key: "weight_max", label: "Weight max (kg)" },
];

const toRows = (chart) =>
  Object.fromEntries(
    SIZES.map((size) => {
      const row = chart.find((r) => r.size === size) || {};
      return [size, Object.fromEntries(FIELDS.map(({ key }) => [key, String(row[key] ?? "")]))];
    }),
  );

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  await ensureSizeChartDefinition(admin);
  return { chart: await readChart(admin) };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();
  const chart = SIZES.map((size) => {
    const row = { size };
    for (const { key } of FIELDS) row[key] = Number(form.get(`${size}.${key}`));
    return row;
  });
  const { ok, errors } = validateChart(chart);
  if (!ok) return { ok: false, errors };
  await writeChart(admin, chart);
  return { ok: true };
};

export default function SizeChartPage() {
  const { chart } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [rows, setRows] = useState(() => toRows(chart));
  const result = fetcher.data;
  const saving = fetcher.state !== "idle";

  useEffect(() => {
    if (result?.ok) shopify.toast.show("Size chart saved");
  }, [result, shopify]);

  const setCell = (size, key, value) =>
    setRows((r) => ({ ...r, [size]: { ...r[size], [key]: value } }));

  const save = () => {
    const fd = new FormData();
    for (const size of SIZES) {
      for (const { key } of FIELDS) fd.append(`${size}.${key}`, rows[size][key]);
    }
    fetcher.submit(fd, { method: "POST" });
  };

  const reset = () => setRows(toRows(DEFAULT_CHART));

  return (
    <s-page heading="Size chart">
      <s-button
        slot="primary-action"
        onClick={save}
        {...(saving ? { loading: true } : {})}
      >
        Save
      </s-button>

      <s-section heading="S / M / L / XL ranges">
        <s-paragraph>
          Edit the height and weight ranges for each size. The storefront Size
          Finder widget uses this chart; when empty it falls back to the
          built-in default.
        </s-paragraph>

        {result && !result.ok && (
          <s-banner heading="Fix these before saving" tone="critical">
            <s-unordered-list>
              {result.errors.map((e, i) => (
                <s-list-item key={i}>{e}</s-list-item>
              ))}
            </s-unordered-list>
          </s-banner>
        )}

        <s-stack direction="block" gap="base">
          {SIZES.map((size) => (
            <s-grid
              key={size}
              gridTemplateColumns="auto 1fr 1fr 1fr 1fr"
              gap="base"
              alignItems="end"
            >
              <s-heading>{size}</s-heading>
              {FIELDS.map(({ key, label }) => (
                <s-number-field
                  key={key}
                  label={label}
                  name={`${size}.${key}`}
                  value={rows[size][key]}
                  inputMode="numeric"
                  onChange={(e) => setCell(size, key, e.currentTarget.value)}
                />
              ))}
            </s-grid>
          ))}
        </s-stack>

        <s-stack direction="inline" gap="base">
          <s-button variant="secondary" onClick={reset}>
            Reset to default
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
