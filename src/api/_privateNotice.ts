/**
 * Streaming / scrape provider implementations are intentionally omitted
 * from this public repository so the app cannot be cloned and redistributed
 * with working content sources.
 *
 * UI, navigation, and local features remain for code review.
 */
export const PRIVATE_BACKEND_NOTICE =
  'Private content API is not included in this public repository.';

export function privateBackendUnavailable(): never {
  throw new Error(PRIVATE_BACKEND_NOTICE);
}
