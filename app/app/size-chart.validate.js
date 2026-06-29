const SIZES = ['S', 'M', 'L', 'XL'];
const NUM = ['height_min', 'height_max', 'weight_min', 'weight_max'];

export function validateChart(chart) {
  const errors = [];
  if (!Array.isArray(chart)) return { ok: false, errors: ['chart must be an array'] };
  for (const s of SIZES) if (!chart.some((r) => r && r.size === s)) errors.push(`missing size ${s}`);
  for (const row of chart) {
    if (!row || !SIZES.includes(row.size)) { errors.push(`invalid size row: ${JSON.stringify(row)}`); continue; }
    for (const k of NUM) {
      const v = row[k];
      if (!Number.isFinite(v) || v <= 0) errors.push(`${row.size}.${k} must be a positive number`);
    }
    if (Number.isFinite(row.height_min) && Number.isFinite(row.height_max) && row.height_min > row.height_max)
      errors.push(`${row.size}: height_min > height_max`);
    if (Number.isFinite(row.weight_min) && Number.isFinite(row.weight_max) && row.weight_min > row.weight_max)
      errors.push(`${row.size}: weight_min > weight_max`);
  }
  return { ok: errors.length === 0, errors };
}
