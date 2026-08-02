import dayjs, { type Dayjs } from 'dayjs';
import { getDayStartTimestamp } from './dayTimestamp';

export interface ScheduleDay {
  label: string;
  shortLabel: string;
  dateLabel: string;
  timestamp: number;
  isToday: boolean;
}

function getMonday(date: Dayjs) {
  const day = date.day(); // 0 = Sunday
  const offset = day === 0 ? -6 : 1 - day;
  return date.add(offset, 'day').startOf('day');
}

export function getScheduleDays(
  referenceDate: Date | Dayjs = dayjs(),
): ScheduleDay[] {
  const start = getMonday(dayjs(referenceDate));
  const today = dayjs().startOf('day');

  return Array.from({ length: 7 }, (_, index) => {
    const date = start.add(index, 'day');

    return {
      label: date.format('dddd, MMM D'),
      shortLabel: date.format('ddd'),
      dateLabel: date.format('D'),
      timestamp: getDayStartTimestamp(date),
      isToday: date.isSame(today, 'day'),
    };
  });
}
