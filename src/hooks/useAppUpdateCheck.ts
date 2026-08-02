import { useCallback, useEffect, useState } from 'react';
import {
  fetchAppUpdateInfo,
  type AppUpdateInfo,
} from '../lib/appUpdate';

export function useAppUpdateCheck() {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  const check = useCallback(async () => {
    try {
      const info = await fetchAppUpdateInfo();
      if (!info) {
        setUpdate(null);
        setVisible(false);
        return;
      }

      setUpdate(info);
      setVisible(true);
    } catch {
      // Offline / GitHub unreachable — skip quietly.
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const dismiss = useCallback(() => {
    if (update?.forceDownload) {
      return;
    }
    setVisible(false);
  }, [update?.forceDownload]);

  return {
    update,
    visible: visible && update != null,
    dismiss,
    recheck: check,
  };
}
