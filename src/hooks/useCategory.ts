import { useQuery } from '@tanstack/react-query';
import { getCategory } from '../api/category';

export const categoryQueryKey = ['category'] as const;

export function useCategory(params: string) {
  return useQuery({
    queryKey: [...categoryQueryKey, params],
    queryFn: () => getCategory(params),
  });
}
