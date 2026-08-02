import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_KEY = 'scheduleReminders:items';

export type ReminderMode = 'always' | 'once';

export type ScheduleReminder = {
  animeId: string;
  title: string;
  mode: ReminderMode;
  /** Required for once mode — episode number of that airing. */
  episode?: number;
  /** Required for once mode — air timestamp from schedule (`at`). */
  at?: number;
  createdAt: number;
};

export async function getScheduleReminders(): Promise<ScheduleReminder[]> {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ScheduleReminder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveScheduleReminders(
  items: ScheduleReminder[],
): Promise<ScheduleReminder[]> {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(items));
  return items;
}

export function reminderKey(reminder: ScheduleReminder): string {
  if (reminder.mode === 'once') {
    return `once:${reminder.animeId}:${reminder.at ?? 0}`;
  }
  return `always:${reminder.animeId}`;
}

export type ReminderInput = {
  id: string;
  title: string;
  episode?: number;
  at?: number;
  passed?: boolean;
};

export function isAnimeReminded(
  reminders: ScheduleReminder[],
  animeId: string,
  at?: number,
): boolean {
  if (!animeId) {
    return false;
  }

  return reminders.some(reminder => {
    if (reminder.animeId !== animeId) {
      return false;
    }
    if (reminder.mode === 'always') {
      return true;
    }
    // Anime-level check (Watch): any once reminder counts.
    if (typeof at !== 'number') {
      return true;
    }
    return reminder.at === at;
  });
}

export function getReminderForAnime(
  reminders: ScheduleReminder[],
  animeId: string,
  at?: number,
): ScheduleReminder | undefined {
  const always = reminders.find(
    reminder => reminder.animeId === animeId && reminder.mode === 'always',
  );
  if (always) {
    return always;
  }

  if (typeof at === 'number') {
    return reminders.find(
      reminder =>
        reminder.animeId === animeId &&
        reminder.mode === 'once' &&
        reminder.at === at,
    );
  }

  return reminders.find(
    reminder => reminder.animeId === animeId && reminder.mode === 'once',
  );
}

export async function upsertScheduleReminder(
  input: Omit<ScheduleReminder, 'createdAt'> & { createdAt?: number },
): Promise<ScheduleReminder[]> {
  const existing = await getScheduleReminders();
  const nextItem: ScheduleReminder = {
    ...input,
    createdAt: input.createdAt ?? Date.now(),
  };

  // One subscription per anime: replacing once/always keeps state simple.
  const filtered = existing.filter(item => item.animeId !== input.animeId);
  return saveScheduleReminders([nextItem, ...filtered]);
}

export async function removeScheduleReminder(
  animeId: string,
  at?: number,
): Promise<ScheduleReminder[]> {
  const existing = await getScheduleReminders();
  const next = existing.filter(item => {
    if (item.animeId !== animeId) {
      return true;
    }
    if (item.mode === 'always') {
      return false;
    }
    if (typeof at === 'number') {
      return item.at !== at;
    }
    return false;
  });

  if (next.length === existing.length) {
    return existing;
  }

  return saveScheduleReminders(next);
}

export async function prunePastOnceReminders(
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<ScheduleReminder[]> {
  const existing = await getScheduleReminders();
  const next = existing.filter(item => {
    if (item.mode !== 'once') {
      return true;
    }
    return typeof item.at === 'number' && item.at > nowSeconds;
  });

  if (next.length === existing.length) {
    return existing;
  }

  return saveScheduleReminders(next);
}
