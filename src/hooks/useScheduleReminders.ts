import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import type { ScheduleAnime } from '../api/schedule';
import { ensureNotificationPermission } from '../lib/notifications';
import {
  getReminderForAnime,
  getScheduleReminders,
  isAnimeReminded,
  removeScheduleReminder,
  upsertScheduleReminder,
  type ReminderInput,
  type ReminderMode,
  type ScheduleReminder,
} from '../lib/scheduleReminders';
import { syncScheduleReminders } from '../lib/syncScheduleReminders';

function syncInBackground() {
  syncScheduleReminders().catch(() => {
    // Preference is saved; sync can retry on next Schedule focus.
  });
}

export function useScheduleReminders() {
  const [reminders, setReminders] = useState<ScheduleReminder[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const reload = useCallback(async () => {
    const items = await getScheduleReminders();
    setReminders(items);
    setIsReady(true);
    return items;
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const sync = useCallback(async (scheduleItems?: ScheduleAnime[]) => {
    setIsSyncing(true);
    try {
      await syncScheduleReminders(scheduleItems);
      await reload();
    } finally {
      setIsSyncing(false);
    }
  }, [reload]);

  const isReminded = useCallback(
    (animeId: string, at?: number) => isAnimeReminded(reminders, animeId, at),
    [reminders],
  );

  const getReminder = useCallback(
    (animeId: string, at?: number) =>
      getReminderForAnime(reminders, animeId, at),
    [reminders],
  );

  const enableReminder = useCallback(
    async (item: ReminderInput, mode: ReminderMode): Promise<boolean> => {
      if (!item.id) {
        return false;
      }

      if (mode === 'once') {
        if (!item.at || item.passed) {
          Toast.show({
            type: 'info',
            text1: 'No upcoming air time',
            text2: 'Try Every release, or set it from Schedule.',
          });
          return false;
        }
      }

      const allowed = await ensureNotificationPermission();
      if (!allowed) {
        Toast.show({
          type: 'error',
          text1: 'Notifications blocked',
          text2: 'Enable notifications in system settings.',
        });
        return false;
      }

      const next = await upsertScheduleReminder({
        animeId: item.id,
        title: item.title,
        mode,
        episode: mode === 'once' ? item.episode : undefined,
        at: mode === 'once' ? item.at : undefined,
      });
      setReminders(next);

      Toast.show({
        type: 'success',
        text1: mode === 'always' ? 'Reminders on' : 'Reminder set',
        text2:
          mode === 'always'
            ? `We'll notify you for ${item.title} releases.`
            : `${item.title}${item.episode && item.episode > 0 ? ` EP ${item.episode}` : ''}`,
      });

      syncInBackground();
      return true;
    },
    [],
  );

  const disableReminder = useCallback(
    async (item: ReminderInput): Promise<boolean> => {
      if (!item.id) {
        return false;
      }

      const existing = getReminderForAnime(reminders, item.id, item.at);
      const next = await removeScheduleReminder(
        item.id,
        existing?.mode === 'once' ? existing.at ?? item.at : undefined,
      );
      setReminders(next);

      Toast.show({
        type: 'info',
        text1: 'Reminder off',
        text2: item.title,
      });

      syncInBackground();
      return true;
    },
    [reminders],
  );

  return {
    reminders,
    isReady,
    isSyncing,
    isReminded,
    getReminder,
    enableReminder,
    disableReminder,
    sync,
    reload,
  };
}
