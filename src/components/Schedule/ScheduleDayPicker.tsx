import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScheduleDay } from '../../utils/scheduleDays';
import { colors } from '../../theme';

const CHIP_WIDTH = 52;
const CHIP_GAP = 8;
const PICKER_PADDING = 20;

type ScheduleDayPickerProps = {
  days: ScheduleDay[];
  selectedDay: number;
  scrollToTodayKey?: number;
  onSelectDay: (timestamp: number) => void;
};

export function ScheduleDayPicker({
  days,
  selectedDay,
  scrollToTodayKey = 0,
  onSelectDay,
}: ScheduleDayPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!scrollToTodayKey || days.length === 0) {
      return;
    }

    const todayIndex = days.findIndex(day => day.isToday);
    if (todayIndex < 0) {
      return;
    }

    const offset = Math.max(
      0,
      todayIndex * (CHIP_WIDTH + CHIP_GAP) - PICKER_PADDING,
    );

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [days, scrollToTodayKey]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dayPicker}
    >
      {days.map(day => {
        const isActive = selectedDay === day.timestamp;

        return (
          <Pressable
            key={day.timestamp}
            onPress={() => onSelectDay(day.timestamp)}
            style={[styles.dayChip, isActive && styles.dayChipActive]}
          >
            <Text style={[styles.dayShort, isActive && styles.dayTextActive]}>
              {day.shortLabel}
            </Text>
            <Text style={[styles.dayDate, isActive && styles.dayTextActive]}>
              {day.dateLabel}
            </Text>
            {day.isToday ? <View style={styles.todayDot} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dayPicker: {
    gap: CHIP_GAP,
    paddingHorizontal: PICKER_PADDING,
    paddingBottom: 20,
  },
  dayChip: {
    width: CHIP_WIDTH,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    gap: 2,
  },
  dayChipActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.18)',
  },
  dayShort: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayDate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dayTextActive: {
    color: colors.accent,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
});
