import { getSchedule, type ScheduleAnime } from '../api/schedule';
import { getScheduleDays } from '../utils/scheduleDays';
import { getTimezoneOffsetHours } from '../utils/timezone';
import {
  buildReminderNotificationId,
  cancelAllScheduledReminders,
  ensureNotificationPermission,
  scheduleAnimeReminder,
  toFireDate,
} from './notifications';
import {
  getScheduleReminders,
  prunePastOnceReminders,
  type ScheduleReminder,
} from './scheduleReminders';

export type ReminderAirItem = {
  animeId: string;
  title: string;
  episode: number;
  at: number;
};

function collectDesiredAirings(
  reminders: ScheduleReminder[],
  scheduleItems: ScheduleAnime[],
): ReminderAirItem[] {
  const now = Date.now();
  const desired: ReminderAirItem[] = [];
  const seen = new Set<string>();

  const pushUnique = (item: ReminderAirItem) => {
    if (toFireDate(item.at).getTime() <= now + 5_000) {
      return;
    }
    const key = buildReminderNotificationId(
      item.animeId,
      item.episode,
      item.at,
    );
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    desired.push(item);
  };

  for (const reminder of reminders) {
    if (reminder.mode === 'once') {
      if (
        typeof reminder.at === 'number' &&
        typeof reminder.episode === 'number'
      ) {
        pushUnique({
          animeId: reminder.animeId,
          title: reminder.title,
          episode: reminder.episode,
          at: reminder.at,
        });
      }
      continue;
    }

    for (const item of scheduleItems) {
      if (item.id !== reminder.animeId || !item.at) {
        continue;
      }
      pushUnique({
        animeId: item.id,
        title: item.title || reminder.title,
        episode: item.episode,
        at: item.at,
      });
    }
  }

  return desired;
}

async function fetchUpcomingWeekSchedule(): Promise<ScheduleAnime[]> {
  const tz = getTimezoneOffsetHours();
  const days = getScheduleDays();
  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

  const upcomingDays = days.filter(day => day.timestamp >= todayStart - 86_400);

  const results = await Promise.all(
    upcomingDays.map(async day => {
      try {
        return await getSchedule(tz, day.timestamp);
      } catch {
        return [] as ScheduleAnime[];
      }
    }),
  );

  return results.flat();
}

/**
 * Rebuilds local trigger notifications from saved reminder preferences
 * and the current week schedule (no backend).
 */
export async function syncScheduleReminders(
  scheduleItems?: ScheduleAnime[],
): Promise<number> {
  const reminders = await prunePastOnceReminders();
  if (reminders.length === 0) {
    await cancelAllScheduledReminders();
    return 0;
  }

  const hasAlways = reminders.some(item => item.mode === 'always');
  const items =
    scheduleItems && !hasAlways
      ? scheduleItems
      : await fetchUpcomingWeekSchedule();

  const desired = collectDesiredAirings(reminders, items);

  await cancelAllScheduledReminders();

  if (desired.length === 0) {
    return 0;
  }

  const allowed = await ensureNotificationPermission();
  if (!allowed) {
    return 0;
  }

  let scheduled = 0;
  for (const item of desired) {
    const id = await scheduleAnimeReminder(item);
    if (id) {
      scheduled += 1;
    }
  }

  return scheduled;
}
