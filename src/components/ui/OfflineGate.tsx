import { useState, type ComponentType, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OfflineView } from './OfflineView';

type OfflineGateProps = {
  children: ReactNode;
};

export function OfflineGate({ children }: OfflineGateProps) {
  const { showOfflineScreen, refresh } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);

  const onRetry = async () => {
    setRetrying(true);
    try {
      const online = await refresh();
      if (online) {
        await queryClient.invalidateQueries();
      }
    } finally {
      setRetrying(false);
    }
  };

  // Only block on cold-start offline. If content was already loaded and the
  // connection drops mid-session, keep the existing UI.
  if (showOfflineScreen) {
    return <OfflineView onRetry={onRetry} retrying={retrying} />;
  }

  return <>{children}</>;
}

export function withOfflineGate<P extends object>(Screen: ComponentType<P>) {
  function OfflineAwareScreen(props: P) {
    return (
      <OfflineGate>
        <Screen {...props} />
      </OfflineGate>
    );
  }

  const screenName = Screen.displayName ?? Screen.name ?? 'Screen';
  OfflineAwareScreen.displayName = `withOfflineGate(${screenName})`;

  return OfflineAwareScreen;
}
