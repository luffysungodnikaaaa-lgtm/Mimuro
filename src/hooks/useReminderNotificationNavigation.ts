import { useEffect } from 'react';
import notifee from '@notifee/react-native';
import {
  attachReminderEventHandlers,
  parseReminderNotificationData,
} from '../lib/notifications';
import { consumePendingWatchNavigation } from '../lib/pendingWatchNavigation';
import { navigateToWatch, navigationRef } from '../navigation/navigationRef';

function openFromReminder(animeId: string, episode: number) {
  const tryNavigate = () => {
    if (!navigationRef.isReady()) {
      return false;
    }
    navigateToWatch(animeId, episode);
    return true;
  };

  if (tryNavigate()) {
    return;
  }

  const timer = setInterval(() => {
    if (tryNavigate()) {
      clearInterval(timer);
    }
  }, 200);

  setTimeout(() => clearInterval(timer), 5000);
}

export function useReminderNotificationNavigation() {
  useEffect(() => {
    const pending = consumePendingWatchNavigation();
    if (pending) {
      openFromReminder(pending.id, pending.episode);
    }

    notifee.getInitialNotification().then(initial => {
      const data = parseReminderNotificationData(
        initial?.notification?.data as Record<string, unknown> | undefined,
      );
      if (!data) {
        return;
      }
      openFromReminder(data.animeId, Number(data.episode) || 1);
    });

    return attachReminderEventHandlers(data => {
      openFromReminder(data.animeId, Number(data.episode) || 1);
    });
  }, []);
}
