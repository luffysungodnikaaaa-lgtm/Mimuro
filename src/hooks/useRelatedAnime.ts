import { useQuery } from '@tanstack/react-query';
import { getRelatedAnime } from '../api/related-anime';

export const relatedAnimeQueryKey = ['related-anime'] as const;

export function useRelatedAnime(dataId?: number) {
  return useQuery({
    queryKey: [...relatedAnimeQueryKey, dataId],
    queryFn: () => getRelatedAnime(dataId!),
    enabled: dataId != null,
  });
}
