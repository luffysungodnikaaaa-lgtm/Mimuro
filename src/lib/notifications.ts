import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  TriggerType,
  type Event,
  type TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';

export const REMINDER_CHANNEL_ID = 'anime-reminders';
export const REMINDER_NOTIFICATION_PREFIX = 'mimuro-sr-';

export type ReminderNotificationData = {
  type: 'schedule-reminder';
  animeId: string;
  episode: string;
  title: string;
};

let channelReady = false;

export function toFireDate(at: number): Date {
  const ms = at < 1e12 ? at * 1000 : at;
  return new Date(ms);
}

export function buildReminderNotificationId(
  animeId: string,
  episode: number,
  at: number,
): string {
  const safeId = animeId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  return `${REMINDER_NOTIFICATION_PREFIX}${at}_${episode}_${safeId}`.slice(
    0,
    64,
  );
}

export async function ensureReminderChannel(): Promise<void> {
  if (channelReady || Platform.OS !== 'android') {
    channelReady = true;
    return;
  }

  await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'Anime reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
  channelReady = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  if (granted) {
    await ensureReminderChannel();
  }

  return granted;
}

export async function scheduleAnimeReminder(input: {
  animeId: string;
  title: string;
  episode: number;
  at: number;
}): Promise<string | null> {
  const fireDate = toFireDate(input.at);
  if (fireDate.getTime() <= Date.now() + 5_000) {
    return null;
  }

  const allowed = await ensureNotificationPermission();
  if (!allowed) {
    return null;
  }

  await ensureReminderChannel();

  const notificationId = buildReminderNotificationId(
    input.animeId,
    input.episode,
    input.at,
  );

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: fireDate.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  const episodeLabel =
    input.episode > 0 ? `EP ${input.episode}` : 'New episode';

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: input.title,
      body: `${episodeLabel} is airing`,
      data: {
        type: 'schedule-reminder',
        animeId: input.animeId,
        episode: String(input.episode > 0 ? input.episode : 1),
        title: input.title,
      } satisfies ReminderNotificationData,
      android: {
        channelId: REMINDER_CHANNEL_ID,
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );

  return notificationId;
}

export async function cancelReminderNotification(
  notificationId: string,
): Promise<void> {
  if (!notificationId) {
    return;
  }
  await notifee.cancelNotification(notificationId);
}

export async function cancelReminderNotifications(
  notificationIds: string[],
): Promise<void> {
  await Promise.all(
    notificationIds.map(id => notifee.cancelNotification(id)),
  );
}

export async function getScheduledReminderIds(): Promise<string[]> {
  const triggers = await notifee.getTriggerNotificationIds();
  return triggers.filter(id => id.startsWith(REMINDER_NOTIFICATION_PREFIX));
}

export async function cancelAllScheduledReminders(): Promise<void> {
  const ids = await getScheduledReminderIds();
  await cancelReminderNotifications(ids);
}

export function parseReminderNotificationData(
  data: Record<string, unknown> | undefined,
): ReminderNotificationData | null {
  if (!data || data.type !== 'schedule-reminder') {
    return null;
  }

  const animeId = typeof data.animeId === 'string' ? data.animeId : '';
  if (!animeId) {
    return null;
  }

  return {
    type: 'schedule-reminder',
    animeId,
    episode: typeof data.episode === 'string' ? data.episode : '1',
    title: typeof data.title === 'string' ? data.title : '',
  };
}

export function attachReminderEventHandlers(
  onOpen: (data: ReminderNotificationData) => void,
): () => void {
  const handle = ({ type, detail }: Event) => {
    if (
      type !== EventType.PRESS &&
      type !== EventType.ACTION_PRESS
    ) {
      return;
    }

    const data = parseReminderNotificationData(
      detail.notification?.data as Record<string, unknown> | undefined,
    );
    if (data) {
      onOpen(data);
    }
  };

  return notifee.onForegroundEvent(handle);
}
