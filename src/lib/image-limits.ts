/**
 * Limits the image API enforces on resize sizes and crop edges (backend
 * SEC-03): whole pixels from 16 to 4096 per side. Checked here first so the
 * user gets a clear message instead of a 400.
 */
export const IMAGE_SIDE_MIN = 16;
export const IMAGE_SIDE_MAX = 4096;

export const IMAGE_SIDE_RULE = `Use whole numbers from ${IMAGE_SIDE_MIN} to ${IMAGE_SIDE_MAX} pixels.`;

export const isValidImageSide = (value: number) =>
  Number.isInteger(value) && value >= IMAGE_SIDE_MIN && value <= IMAGE_SIDE_MAX;
