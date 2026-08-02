import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { getAutoNext, setAutoNext } from '../lib/preferences';

export function useAutoNext() {
  const [autoNext, setAutoNextState] = useState(false);
  const autoNextRef = useRef(autoNext);
  autoNextRef.current = autoNext;

  useEffect(() => {
    let active = true;

    getAutoNext().then(value => {
      if (active) {
        setAutoNextState(value);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const toggleAutoNext = useCallback(() => {
    const next = !autoNextRef.current;
    setAutoNextState(next);
    void setAutoNext(next);

    Toast.show({
      type: next ? 'success' : 'info',
      text1: next ? 'Auto Next enabled' : 'Auto Next disabled',
      text2: next
        ? 'The next episode will play automatically'
        : 'Episodes will stop when finished',
      visibilityTime: 1800,
      position: 'bottom',
    });
  }, []);

  return { autoNext, toggleAutoNext };
}
