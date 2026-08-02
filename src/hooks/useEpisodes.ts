import { useQuery } from '@tanstack/react-query';
import { getEpisode } from '../api/episode';

export const episodesQueryKey = ['episodes'] as const;

export function useEpisodes(dataId?: number) {
  return useQuery({
    queryKey: [...episodesQueryKey, dataId],
    queryFn: () => getEpisode(dataId!),
    enabled: dataId != null,
  });
}
