import { describe, it, expect } from 'vitest';
import { recommendSize, TSHIRT_CHART, InvalidMeasurementError } from './sizing.js';

describe('recommendSize — exact match', () => {
  it('170/65/regular -> M', () => {
    const r = recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('M');
    expect(r.exact).toBe(true);
    expect(r.reason).toContain('M');
  });
  it('185/90/regular -> XL', () => {
    expect(recommendSize({ height_cm: 185, weight_kg: 90, fit: 'regular' }, TSHIRT_CHART).size).toBe('XL');
  });
  it('160/52/regular -> S', () => {
    expect(recommendSize({ height_cm: 160, weight_kg: 52, fit: 'regular' }, TSHIRT_CHART).size).toBe('S');
  });
});

describe('recommendSize — validation', () => {
  it('throws on non-positive height', () => {
    expect(() => recommendSize({ height_cm: 0, weight_kg: 65, fit: 'regular' }, TSHIRT_CHART)).toThrow(InvalidMeasurementError);
  });
  it('throws on absurd weight', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 999, fit: 'regular' }, TSHIRT_CHART)).toThrow(InvalidMeasurementError);
  });
  it('throws on invalid fit', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 65, fit: 'baggy' }, TSHIRT_CHART)).toThrow(InvalidMeasurementError);
  });
  it('throws on empty chart', () => {
    expect(() => recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, [])).toThrow('size chart is empty');
  });
});

describe('recommendSize — out of range', () => {
  it('205/120 -> nearest XL, exact false', () => {
    const r = recommendSize({ height_cm: 205, weight_kg: 120, fit: 'regular' }, TSHIRT_CHART);
    expect(r.size).toBe('XL');
    expect(r.exact).toBe(false);
    expect(r.reason.toLowerCase()).toContain('estimate');
  });
});

describe('recommendSize — fit adjustment', () => {
  it('174/68 regular stays M, relaxed -> L', () => {
    expect(recommendSize({ height_cm: 174, weight_kg: 68, fit: 'regular' }, TSHIRT_CHART).size).toBe('M');
    expect(recommendSize({ height_cm: 174, weight_kg: 68, fit: 'relaxed' }, TSHIRT_CHART).size).toBe('L');
  });
  it('168/61 slim -> S', () => {
    expect(recommendSize({ height_cm: 168, weight_kg: 61, fit: 'slim' }, TSHIRT_CHART).size).toBe('S');
  });
  it('uses a custom chart, not a hardcoded one', () => {
    const custom = [{ size: 'S', height_min: 100, height_max: 250, weight_min: 1, weight_max: 300 }];
    expect(recommendSize({ height_cm: 170, weight_kg: 65, fit: 'regular' }, custom).size).toBe('S');
  });
});
