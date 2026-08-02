import NetInfo from '@react-native-community/netinfo';
import { onlineManager, QueryClient } from '@tanstack/react-query';

onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    const online =
      state.isConnected === true && state.isInternetReachable !== false;
    setOnline(online);
  });
});

export const queryClient = new QueryClient();
