import { useQuery } from '@tanstack/react-query';
import { getServer } from '../api/server';

export const serversQueryKey = ['servers'] as const;

export function useServers(dataIds?: string) {
  return useQuery({
    queryKey: [...serversQueryKey, dataIds],
    queryFn: () => getServer(dataIds!),
    enabled: !!dataIds,
  });
}
