import { useQuery } from '@tanstack/react-query';
import { getInfo } from '../api/info';

export const animeInfoQueryKey = ['anime-info'] as const;

export function useAnimeInfo(id: string) {
  return useQuery({
    queryKey: [...animeInfoQueryKey, id],
    queryFn: () => getInfo(id),
    enabled: !!id,
  });
}
