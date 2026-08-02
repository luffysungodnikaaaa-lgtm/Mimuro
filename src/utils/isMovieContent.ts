/** True when API type is Movie or Film. */
export function isMovieType(type?: string | null) {
  return /^(movie|film)$/i.test((type ?? '').trim());
}

/** Fallback when schedule has no type field. */
export function isLikelyMovieTitle(title?: string | null) {
  return /\b(movie|film)\b/i.test(title ?? '');
}

/**
 * Prefer API type when present; otherwise fall back to the title.
 */
export function isMovieContent(options: {
  type?: string | null;
  title?: string | null;
}) {
  const type = options.type?.trim();
  if (type) {
    return isMovieType(type);
  }
  return isLikelyMovieTitle(options.title);
}
