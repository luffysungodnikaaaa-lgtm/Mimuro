import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ScheduleAnime } from '../api/schedule';
import { getInfo } from '../api/info';
import { ScheduleEmptyState } from '../components/Schedule/ScheduleEmptyState';
import { ScheduleItem } from '../components/Schedule/ScheduleItem';
import { ScheduleListHeader } from '../components/Schedule/ScheduleListHeader';
import { ScheduleReminderConfirmSheet } from '../components/Schedule/ScheduleReminderConfirmSheet';
import { ScheduleReminderModeSheet } from '../components/Schedule/ScheduleReminderModeSheet';
import { ScheduleSkeleton } from '../components/Schedule/ScheduleSkeleton';
import { animeInfoQueryKey } from '../hooks/useAnimeInfo';
import { useSchedule } from '../hooks/useSchedule';
import { useScheduleReminders } from '../hooks/useScheduleReminders';
import type { ReminderMode } from '../lib/scheduleReminders';
import { isLikelyMovieTitle, isMovieContent } from '../utils/isMovieContent';
import { getScheduleDays } from '../utils/scheduleDays';
import { colors } from '../theme';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function ScheduleScreen() {
  const queryClient = useQueryClient();
  const days = useMemo(() => getScheduleDays(), []);
  const todayTimestamp =
    days.find(day => day.isToday)?.timestamp ?? days[0]?.timestamp ?? 0;
  const [selectedDay, setSelectedDay] = useState(todayTimestamp);
  const [scrollToTodayKey, setScrollToTodayKey] = useState(0);
  const [modeSheetItem, setModeSheetItem] = useState<ScheduleAnime | null>(
    null,
  );
  const [confirmSheetItem, setConfirmSheetItem] =
    useState<ScheduleAnime | null>(null);
  const [modeSheetIsMovie, setModeSheetIsMovie] = useState(false);
  const schedule = useSchedule(selectedDay);
  const selectedDayInfo = days.find(day => day.timestamp === selectedDay);
  const items = schedule.data ?? [];
  const showCount = !schedule.isLoading && !schedule.isError;
  const {
    isReminded,
    getReminder,
    enableReminder,
    disableReminder,
    sync,
  } = useScheduleReminders();
  const confirmReminder = confirmSheetItem
    ? getReminder(confirmSheetItem.id, confirmSheetItem.at)
    : undefined;

  const resolveIsMovie = useCallback(
    async (item: ScheduleAnime) => {
      const fallback = isLikelyMovieTitle(item.title);
      if (!item.id) {
        return fallback;
      }

      try {
        const info = await queryClient.fetchQuery({
          queryKey: [...animeInfoQueryKey, item.id],
          queryFn: () => getInfo(item.id),
          staleTime: 1000 * 60 * 30,
        });
        return isMovieContent({ type: info?.type, title: item.title });
      } catch {
        return fallback;
      }
    },
    [queryClient],
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedDay(todayTimestamp);
      setScrollToTodayKey(key => key + 1);
      sync().catch(() => {
        // Best-effort reschedule when Schedule is opened.
      });
    }, [sync, todayTimestamp]),
  );

  useEffect(() => {
    if (!modeSheetItem) {
      setModeSheetIsMovie(false);
      return;
    }

    setModeSheetIsMovie(isLikelyMovieTitle(modeSheetItem.title));
    let cancelled = false;
    void resolveIsMovie(modeSheetItem).then(isMovie => {
      if (!cancelled) {
        setModeSheetIsMovie(isMovie);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [modeSheetItem, resolveIsMovie]);

  const handleToggleReminder = useCallback(
    (item: ScheduleAnime) => {
      if (!item.id) {
        return;
      }

      if (isReminded(item.id, item.at)) {
        setConfirmSheetItem(item);
        return;
      }

      setModeSheetItem(item);
    },
    [isReminded],
  );

  const handleSelectMode = useCallback(
    async (mode: ReminderMode) => {
      const item = modeSheetItem;
      setModeSheetItem(null);
      if (!item) {
        return;
      }
      await enableReminder(item, mode);
    },
    [enableReminder, modeSheetItem],
  );

  const handleConfirmDisable = useCallback(async () => {
    const item = confirmSheetItem;
    setConfirmSheetItem(null);
    if (!item) {
      return;
    }
    await disableReminder(item);
  }, [confirmSheetItem, disableReminder]);

  const listEmpty = () => {
    if (schedule.isLoading) {
      return <ScheduleSkeleton />;
    }

    if (schedule.isError) {
      return (
        <ScheduleEmptyState
          message={getErrorMessage(schedule.error, 'Failed to load schedule')}
        />
      );
    }

    return (
      <ScheduleEmptyState message="No anime scheduled for this day" />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={items}
          keyExtractor={item => `${item.id}-${item.episode}-${item.at}`}
          renderItem={({ item, index }) => {
            const reminded = isReminded(item.id, item.at);
            const reminder = getReminder(item.id, item.at);

            return (
              <ScheduleItem
                item={item}
                isLast={index === items.length - 1}
                isReminded={reminded}
                reminderMode={reminder?.mode}
                onToggleReminder={handleToggleReminder}
              />
            );
          }}
          ListHeaderComponent={
            <ScheduleListHeader
              days={days}
              selectedDay={selectedDay}
              subtitle={selectedDayInfo?.label ?? 'Pick a day'}
              count={showCount ? items.length : undefined}
              scrollToTodayKey={scrollToTodayKey}
              onSelectDay={setSelectedDay}
            />
          }
          ListEmptyComponent={listEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
        {schedule.isFetching && !schedule.isLoading ? (
          <View style={styles.refreshing}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : null}
      </View>

      <ScheduleReminderModeSheet
        visible={modeSheetItem != null}
        title={modeSheetItem?.title ?? ''}
        isMovie={modeSheetIsMovie}
        onClose={() => setModeSheetItem(null)}
        onSelect={handleSelectMode}
      />

      <ScheduleReminderConfirmSheet
        visible={confirmSheetItem != null}
        title={confirmSheetItem?.title ?? ''}
        mode={confirmReminder?.mode}
        onClose={() => setConfirmSheetItem(null)}
        onConfirm={handleConfirmDisable}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  refreshing: {
    position: 'absolute',
    top: 12,
    right: 20,
  },
});
