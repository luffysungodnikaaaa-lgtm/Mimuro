/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { parseReminderNotificationData } from './src/lib/notifications';
import { setPendingWatchNavigation } from './src/lib/pendingWatchNavigation';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.PRESS && type !== EventType.ACTION_PRESS) {
    return;
  }

  const data = parseReminderNotificationData(
    detail.notification?.data,
  );
  if (!data) {
    return;
  }

  setPendingWatchNavigation(data.animeId, Number(data.episode) || 1);
});

AppRegistry.registerComponent(appName, () => App);
