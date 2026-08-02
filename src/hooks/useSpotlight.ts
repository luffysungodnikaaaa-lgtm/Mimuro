import { useQuery } from '@tanstack/react-query';
import { getSpotlight } from '../api/spotlight';

export const spotlightQueryKey = ['spotlight'] as const;

export function useSpotlight() {
  return useQuery({
    queryKey: spotlightQueryKey,
    queryFn: getSpotlight,
  });
}
