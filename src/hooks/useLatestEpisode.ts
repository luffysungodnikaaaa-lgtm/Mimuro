import { useQuery } from '@tanstack/react-query';
import {
  getLatestEpisode,
  type LatestEpisodeCategory,
} from '../api/latest-episode';

export const latestEpisodeQueryKey = ['latest-episode'] as const;

export function useLatestEpisode(
  category: LatestEpisodeCategory,
  page: number,
) {
  return useQuery({
    queryKey: [...latestEpisodeQueryKey, category, page],
    queryFn: () => getLatestEpisode(category, page),
  });
}
