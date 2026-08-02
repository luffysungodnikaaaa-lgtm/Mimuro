import type { ScheduleDay } from '../../utils/scheduleDays';
import { ScheduleDayPicker } from './ScheduleDayPicker';
import { ScheduleHeader } from './ScheduleHeader';

type ScheduleListHeaderProps = {
  days: ScheduleDay[];
  selectedDay: number;
  subtitle: string;
  count?: number;
  scrollToTodayKey?: number;
  onSelectDay: (timestamp: number) => void;
};

export function ScheduleListHeader({
  days,
  selectedDay,
  subtitle,
  count,
  scrollToTodayKey,
  onSelectDay,
}: ScheduleListHeaderProps) {
  return (
    <>
      <ScheduleHeader subtitle={subtitle} count={count} />
      <ScheduleDayPicker
        days={days}
        selectedDay={selectedDay}
        scrollToTodayKey={scrollToTodayKey}
        onSelectDay={onSelectDay}
      />
    </>
  );
}
