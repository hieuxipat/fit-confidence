import { describe, it, expect } from 'vitest';
import { writeChart, readChart, readChartStatus, ensureSizeChartDefinition } from './size-chart.server.js';
import { DEFAULT_CHART } from './default-chart.js';

// Strip GraphQL line comments the same way Shopify's parser does — everything
// after a `#` on a line is a comment. A query written as a single line starting
// with `#graphql ...` collapses to empty, which Shopify rejects with
// "syntax error, unexpected end of file". This guard reproduces that.
const stripComments = (q) =>
  q.split('\n').map((line) => line.replace(/#.*/, '')).join('\n').trim();

function mockAdmin() {
  const queries = [];
  return {
    queries,
    async graphql(query) {
      queries.push(query);
      return {
        async json() {
          return {
            data: {
              shop: { id: 'gid://shopify/Shop/1', chart: { jsonValue: null } },
              metafieldsSet: { metafields: [{ id: 'gid://x/1' }], userErrors: [] },
              metafieldDefinitionCreate: { createdDefinition: { id: 'gid://d/1' }, userErrors: [] },
            },
          };
        },
      };
    },
  };
}

// Mock that returns a response shaped per the operation, so behaviour (not just
// query strings) can be asserted. Branches on the operation in the query text.
function makeAdmin({ chartValue = null, setErrors = [] } = {}) {
  return {
    async graphql(query) {
      let data = {};
      if (query.includes('metafieldsSet')) {
        data = { metafieldsSet: { metafields: [{ id: 'gid://x/1' }], userErrors: setErrors } };
      } else if (query.includes('ShopId')) {
        data = { shop: { id: 'gid://shopify/Shop/1' } };
      } else if (query.includes('metafield(namespace')) {
        data = { shop: { chart: { jsonValue: chartValue } } };
      } else if (query.includes('metafieldDefinitionCreate')) {
        data = { metafieldDefinitionCreate: { createdDefinition: { id: 'd' }, userErrors: [] } };
      }
      return { async json() { return { data }; } };
    },
  };
}

const CHART = [
  { size: 'S', height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M', height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L', height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];

describe('size-chart.server GraphQL operations', () => {
  it('every operation is a non-empty query after stripping # comments', async () => {
    const admin = mockAdmin();
    await writeChart(admin, CHART);
    await readChart(admin);
    await ensureSizeChartDefinition(admin);

    expect(admin.queries.length).toBeGreaterThan(0);
    for (const q of admin.queries) {
      const stripped = stripComments(q);
      expect(stripped.length).toBeGreaterThan(0); // not fully commented out
      expect(stripped).toMatch(/\{/); // has a real selection set
    }
  });
});

describe('writeChart', () => {
  it('resolves when metafieldsSet returns no userErrors', async () => {
    await expect(writeChart(makeAdmin(), CHART)).resolves.toBeUndefined();
  });

  it('throws with the message when metafieldsSet returns userErrors', async () => {
    const admin = makeAdmin({ setErrors: [{ field: ['value'], message: 'value is invalid JSON' }] });
    await expect(writeChart(admin, CHART)).rejects.toThrow(/value is invalid JSON/);
  });
});

describe('readChartStatus', () => {
  it('reports customized and returns the saved chart when the metafield is set', async () => {
    const saved = [{ size: 'S', height_min: 100, height_max: 250, weight_min: 1, weight_max: 300 }];
    const r = await readChartStatus(makeAdmin({ chartValue: saved }));
    expect(r.customized).toBe(true);
    expect(r.chart).toEqual(saved);
  });

  it('falls back to the default chart (not customized) when the metafield is empty', async () => {
    const r = await readChartStatus(makeAdmin({ chartValue: null }));
    expect(r.customized).toBe(false);
    expect(r.chart).toBe(DEFAULT_CHART);
  });
});
