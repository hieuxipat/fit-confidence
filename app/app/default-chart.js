// Single source of the built-in default size chart, reused by the admin
// fallback (readChart) and mirrored by the storefront's TSHIRT_CHART so the
// widget never breaks when the merchant has not saved a custom chart yet.
export const DEFAULT_CHART = [
  { size: 'S',  height_min: 158, height_max: 167, weight_min: 50, weight_max: 60 },
  { size: 'M',  height_min: 167, height_max: 176, weight_min: 60, weight_max: 72 },
  { size: 'L',  height_min: 176, height_max: 184, weight_min: 72, weight_max: 84 },
  { size: 'XL', height_min: 184, height_max: 193, weight_min: 84, weight_max: 96 },
];
