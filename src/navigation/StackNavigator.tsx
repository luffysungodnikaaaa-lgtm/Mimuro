import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { withOfflineGate } from '../components/ui/OfflineGate';
import { ContinueWatchingScreen } from '../screens/ContinueWatchingScreen';
import { WatchScreen } from '../screens/WatchScreen';
import { TabNavigator, type TabParamList } from './TabNavigator';
import { stackScreenOptions } from '../theme';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  Watch: { id: string; episode?: number };
  ContinueWatching: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Watch = withOfflineGate(WatchScreen);
const ContinueWatching = withOfflineGate(ContinueWatchingScreen);

export function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Watch" component={Watch} />
      <Stack.Screen name="ContinueWatching" component={ContinueWatching} />
    </Stack.Navigator>
  );
}
