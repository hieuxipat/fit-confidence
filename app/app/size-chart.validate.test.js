import { describe, it, expect } from 'vitest';
import { validateChart } from './size-chart.validate.js';

const good = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];

describe('validateChart', () => {
  it('accepts a well-formed chart', () => {
    expect(validateChart(good).ok).toBe(true);
  });
  it('rejects min > max', () => {
    const bad = structuredClone(good); bad[1].height_min = 999;
    const r = validateChart(bad);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/M/);
  });
  it('rejects a missing size', () => {
    expect(validateChart(good.slice(0, 3)).ok).toBe(false);
  });
  it('rejects negative or NaN numbers', () => {
    const bad = structuredClone(good); bad[0].weight_min = -1;
    expect(validateChart(bad).ok).toBe(false);
  });
  it('rejects a non-array input', () => {
    expect(validateChart(null).ok).toBe(false);
    expect(validateChart({}).ok).toBe(false);
  });
});
