import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

function isOnlineState(state: NetInfoState) {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export type NetworkStatus = {
  isOffline: boolean;
  /** Full offline screen — only when never connected this session (cold start offline). */
  showOfflineScreen: boolean;
  isConnected: boolean | null;
  refresh: () => Promise<boolean>;
};

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasBeenOnline, setHasBeenOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = isOnlineState(state);
      setIsConnected(online);
      if (online) {
        setHasBeenOnline(true);
      }
    });

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    const online = isOnlineState(state);
    setIsConnected(online);
    if (online) {
      setHasBeenOnline(true);
    }
    return online;
  }, []);

  const isOffline = isConnected === false;

  return {
    isConnected,
    isOffline,
    // Keep loaded content visible if connection drops mid-session
    showOfflineScreen: isOffline && !hasBeenOnline,
    refresh,
  };
}
