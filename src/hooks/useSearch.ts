import { useInfiniteQuery } from '@tanstack/react-query';
import { getCategory } from '../api/category';
import type { CategoryFilterState } from '../constants/categoryFilters';
import { buildFilterParams } from '../utils/buildFilterParams';
import { categoryQueryKey } from './useCategory';

export function useSearch(keyword: string, filters: CategoryFilterState) {
  const trimmed = keyword.trim();

  return useInfiniteQuery({
    queryKey: [...categoryQueryKey, 'search', trimmed, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getCategory(buildFilterParams(trimmed, filters, pageParam)),
    getNextPageParam: lastPage =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
  });
}
