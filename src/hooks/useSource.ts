import { useQuery } from '@tanstack/react-query';
import { getSource } from '../api/source';

export const sourceQueryKey = ['source'] as const;

export function useSource(linkId?: string) {
  return useQuery({
    queryKey: [...sourceQueryKey, linkId],
    queryFn: () => getSource(linkId!),
    enabled: !!linkId,
  });
}
