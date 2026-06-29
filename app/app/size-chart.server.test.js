import { describe, it, expect } from 'vitest';
import { writeChart, readChart, ensureSizeChartDefinition } from './size-chart.server.js';

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
