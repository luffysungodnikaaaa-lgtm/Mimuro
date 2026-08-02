import { useQuery } from '@tanstack/react-query';
import { getTopAnime } from '../api/top-anime';

export const topAnimeQueryKey = ['top-anime'] as const;

export function useTopAnime() {
  return useQuery({
    queryKey: topAnimeQueryKey,
    queryFn: getTopAnime,
  });
}
