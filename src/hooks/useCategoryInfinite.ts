import { useInfiniteQuery } from '@tanstack/react-query';
import { getCategory } from '../api/category';
import { withPage } from '../utils/withPage';
import { categoryQueryKey } from './useCategory';

export function useCategoryInfinite(params: string) {
  return useInfiniteQuery({
    queryKey: [...categoryQueryKey, 'infinite', params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getCategory(withPage(params, pageParam)),
    getNextPageParam: lastPage =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
  });
}
