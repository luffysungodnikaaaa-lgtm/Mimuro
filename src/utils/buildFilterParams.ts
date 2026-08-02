import type { CategoryFilterState } from '../constants/categoryFilters';

function appendValues(params: URLSearchParams, key: string, values: string[]) {
  for (const value of values) {
    params.append(key, value);
  }
}

export function buildFilterParams(
  keyword: string,
  filters: CategoryFilterState,
  page: number,
): string {
  const searchParams = new URLSearchParams();

  searchParams.set('keyword', keyword);
  searchParams.set('type', '');
  searchParams.set('ep_min', filters.epMin);
  searchParams.set('ep_max', filters.epMax);
  searchParams.set('sort', filters.sort);

  appendValues(searchParams, 'genre[]', filters.genres);
  appendValues(searchParams, 'term_type[]', filters.termTypes);
  appendValues(searchParams, 'season[]', filters.seasons);
  appendValues(searchParams, 'year[]', filters.years);
  appendValues(searchParams, 'status[]', filters.statuses);
  appendValues(searchParams, 'language[]', filters.languages);
  appendValues(searchParams, 'rating[]', filters.ratings);
  appendValues(searchParams, 'source[]', filters.sources);

  if (page > 1) {
    searchParams.set('page', String(page));
  }

  return `/filter?${searchParams.toString()}`;
}
