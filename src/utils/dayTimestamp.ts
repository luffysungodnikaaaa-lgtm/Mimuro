import dayjs, { type Dayjs } from 'dayjs';

export function getDayStartTimestamp(date: Date | Dayjs = dayjs()): number {
  const d = dayjs(date);
  return Math.floor(Date.UTC(d.year(), d.month(), d.date()) / 1000);
}
