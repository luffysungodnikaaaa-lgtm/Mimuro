import { useCallback, useEffect, useState } from 'react';
import {
  getPreferredServer,
  setPreferredServer,
  type PreferredServer,
} from '../lib/preferences';

export function usePreferredServer() {
  const [preferred, setPreferredState] = useState<PreferredServer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    getPreferredServer()
      .then(value => {
        if (active) {
          setPreferredState(value);
        }
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const savePreferred = useCallback((next: PreferredServer) => {
    const normalized = {
      typeKey: next.typeKey.trim().toLowerCase(),
      serverName: next.serverName,
    };
    setPreferredState(normalized);
    void setPreferredServer(normalized);
  }, []);

  return { preferred, savePreferred, isReady };
}
