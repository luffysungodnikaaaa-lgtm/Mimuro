import { useQuery } from '@tanstack/react-query';
import { getDownloads } from '../api/download';

export const downloadsQueryKey = ['downloads'] as const;

type DownloadParams = {
  malId?: number;
  episode?: number;
  timestamp?: number;
};

export function useDownloads({ malId, episode, timestamp }: DownloadParams) {
  return useQuery({
    queryKey: [...downloadsQueryKey, malId, episode, timestamp],
    queryFn: () => getDownloads(malId!, episode!, timestamp!),
    enabled: !!malId && !!episode && !!timestamp,
  });
}
