import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './StackNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToWatch(id: string, episode?: number) {
  if (!id || !navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate('Watch', {
    id,
    episode: episode && episode > 0 ? episode : 1,
  });
}
