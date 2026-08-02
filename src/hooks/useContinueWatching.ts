import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getContinueWatching,
  removeContinueWatching,
  type ContinueWatchingItem,
} from '../lib/continueWatching';

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setIsLoading(true);
      getContinueWatching().then(data => {
        if (active) {
          setItems(data);
          setIsLoading(false);
        }
      });

      return () => {
        active = false;
      };
    }, []),
  );

  const removeItem = useCallback(async (id: string) => {
    if (!id) {
      return;
    }

    setItems(current => current.filter(item => item.id !== id));

    try {
      const next = await removeContinueWatching(id);
      setItems(next);
    } catch {
      const restored = await getContinueWatching();
      setItems(restored);
    }
  }, []);

  return { items, isLoading, removeItem };
}
