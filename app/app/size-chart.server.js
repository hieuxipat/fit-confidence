// Read/write the merchant's size chart in a SHOP metafield via the Admin API.
//
// Persistence = shop metafield `fit_confidence.size_chart` (type `json`).
// We intentionally use a custom (merchant-owned) namespace rather than the
// reserved `$app` namespace so the theme app extension can read it from Liquid
// as `shop.metafields.fit_confidence.size_chart.value`. That read requires the
// metafield DEFINITION to grant storefront read access, created idempotently by
// ensureSizeChartDefinition() on admin load (no manual operator step needed).
import { DEFAULT_CHART } from './default-chart.js';

const NS = 'fit_confidence';
const KEY = 'size_chart';

// ensureSizeChartDefinition(admin) -> void : idempotently create the metafield
// definition so the value is readable from the storefront/theme via Liquid
// (`shop.metafields.fit_confidence.size_chart`). Safe to call on every admin
// load — a pre-existing definition returns a TAKEN userError, which we ignore.
export async function ensureSizeChartDefinition(admin) {
  const res = await admin.graphql(
    `#graphql
    mutation CreateSizeChartDef($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id }
        userErrors { field message code }
      }
    }`,
    {
      variables: {
        definition: {
          name: 'Size Finder size chart',
          namespace: NS,
          key: KEY,
          type: 'json',
          ownerType: 'SHOP',
          access: { storefront: 'PUBLIC_READ' },
        },
      },
    },
  );
  const errors = (await res.json())?.data?.metafieldDefinitionCreate?.userErrors ?? [];
  const fatal = errors.filter((e) => e.code !== 'TAKEN');
  if (fatal.length) throw new Error(fatal.map((e) => e.message).join('; '));
}

// readChart(admin) -> chart[] : the saved chart, or DEFAULT_CHART when absent/invalid.
export async function readChart(admin) {
  const res = await admin.graphql(
    `#graphql
    query SizeChart($ns: String!, $key: String!) {
      shop {
        chart: metafield(namespace: $ns, key: $key) { jsonValue }
      }
    }`,
    { variables: { ns: NS, key: KEY } },
  );
  const body = await res.json();
  const value = body?.data?.shop?.chart?.jsonValue;
  return Array.isArray(value) && value.length ? value : DEFAULT_CHART;
}

// writeChart(admin, chart) -> void : persist the chart JSON to the shop metafield.
// Caller must validate with validateChart() before invoking this.
export async function writeChart(admin, chart) {
  const shopRes = await admin.graphql(`#graphql query ShopId { shop { id } }`);
  const ownerId = (await shopRes.json())?.data?.shop?.id;

  const res = await admin.graphql(
    `#graphql
    mutation SetSizeChart($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace: NS,
            key: KEY,
            type: 'json',
            value: JSON.stringify(chart),
          },
        ],
      },
    },
  );
  const errors = (await res.json())?.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length) throw new Error(errors.map((e) => e.message).join('; '));
}
