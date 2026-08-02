import { useQuery } from '@tanstack/react-query';
import { getSchedule } from '../api/schedule';
import { getTimezoneOffsetHours } from '../utils/timezone';

export const scheduleQueryKey = ['schedule'] as const;

export function useSchedule(dayTimestamp: number) {
  const tz = getTimezoneOffsetHours();

  return useQuery({
    queryKey: [...scheduleQueryKey, tz, dayTimestamp],
    queryFn: () => getSchedule(tz, dayTimestamp),
  });
}
