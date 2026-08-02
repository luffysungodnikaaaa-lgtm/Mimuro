import { useQuery } from '@tanstack/react-query';
import { getSeasons } from '../api/seasons';

export const seasonsQueryKey = ['seasons'] as const;

export function useSeasons(dataId?: number) {
  return useQuery({
    queryKey: [...seasonsQueryKey, dataId],
    queryFn: () => getSeasons(dataId!),
    enabled: dataId != null,
  });
}
