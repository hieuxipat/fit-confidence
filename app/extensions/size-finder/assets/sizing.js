// Size Finder core logic — pure, no DOM/network. Served as a theme asset AND
// unit-tested by Vitest. The size chart lives here (no cross-asset imports).

export const TSHIRT_CHART = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];

const ORDER = ['S', 'M', 'L', 'XL'];

export class InvalidMeasurementError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidMeasurementError';
  }
}

function validate(m, chart) {
  if (!Array.isArray(chart) || chart.length === 0) throw new Error('size chart is empty');
  if (!Number.isFinite(m.height_cm) || m.height_cm <= 0 || m.height_cm > 260)
    throw new InvalidMeasurementError(`invalid height_cm: ${m.height_cm}`);
  if (!Number.isFinite(m.weight_kg) || m.weight_kg <= 0 || m.weight_kg > 400)
    throw new InvalidMeasurementError(`invalid weight_kg: ${m.weight_kg}`);
  if (m.fit !== 'slim' && m.fit !== 'regular' && m.fit !== 'relaxed')
    throw new InvalidMeasurementError(`invalid fit: ${m.fit}`);
}

function contains(row, m) {
  return (
    m.height_cm >= row.height_min && m.height_cm <= row.height_max &&
    m.weight_kg >= row.weight_min && m.weight_kg <= row.weight_max
  );
}

function nearest(chart, m) {
  let best = chart[0];
  let bestDist = Infinity;
  for (const row of chart) {
    const ch = (row.height_min + row.height_max) / 2;
    const cw = (row.weight_min + row.weight_max) / 2;
    const dh = (m.height_cm - ch) / 10;
    const dw = (m.weight_kg - cw) / 8;
    const dist = dh * dh + dw * dw;
    if (dist < bestDist) { bestDist = dist; best = row; }
  }
  return best;
}

function shiftForFit(size, m, row) {
  if (m.fit === 'regular') return size;
  const span = row.height_max - row.height_min;
  const pos = span > 0 ? (m.height_cm - row.height_min) / span : 0.5;
  const i = ORDER.indexOf(size);
  if (m.fit === 'slim' && pos <= 0.34 && i > 0) return ORDER[i - 1];
  if (m.fit === 'relaxed' && pos >= 0.66 && i < ORDER.length - 1) return ORDER[i + 1];
  return size;
}

export function recommendSize(m, chart) {
  validate(m, chart);

  const match = chart.find((row) => contains(row, m));
  if (match) {
    const finalSize = shiftForFit(match.size, m, match);
    const adjusted = finalSize !== match.size;
    const reason = adjusted
      ? `${m.height_cm}cm & ${m.weight_kg}kg fit ${match.size}; ${m.fit} fit adjusts to ${finalSize}.`
      : `${m.height_cm}cm & ${m.weight_kg}kg fall in ${match.size} ` +
        `(${match.height_min}-${match.height_max}cm, ${match.weight_min}-${match.weight_max}kg); ${m.fit} fit kept.`;
    return { size: finalSize, exact: true, reason };
  }

  const near = nearest(chart, m);
  return {
    size: near.size,
    exact: false,
    reason: `${m.height_cm}cm & ${m.weight_kg}kg are outside the chart; closest size is ${near.size} (estimate).`,
  };
}
