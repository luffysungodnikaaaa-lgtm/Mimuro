import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTINUE_WATCHING_KEY = 'continueWatching:items';
/** Max continue-watching items kept and shown. */
export const CONTINUE_WATCHING_MAX_ITEMS = 10;

export type ContinueWatchingItem = {
  id: string;
  title: string;
  image: string;
  episode: number;
  type?: string;
  totalEpisodes?: number;
  updatedAt: number;
};

export async function getContinueWatching(): Promise<ContinueWatchingItem[]> {
  const raw = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ContinueWatchingItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const limited = parsed.slice(0, CONTINUE_WATCHING_MAX_ITEMS);
    if (limited.length < parsed.length) {
      await AsyncStorage.setItem(
        CONTINUE_WATCHING_KEY,
        JSON.stringify(limited),
      );
    }

    return limited;
  } catch {
    return [];
  }
}

export async function saveContinueWatching(
  item: Omit<ContinueWatchingItem, 'updatedAt'>,
): Promise<ContinueWatchingItem[]> {
  const existing = await getContinueWatching();
  const nextItem: ContinueWatchingItem = {
    ...item,
    updatedAt: Date.now(),
  };
  const filtered = existing.filter(entry => entry.id !== item.id);
  const next = [nextItem, ...filtered].slice(0, CONTINUE_WATCHING_MAX_ITEMS);

  await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(next));
  return next;
}

export async function removeContinueWatching(
  id: string,
): Promise<ContinueWatchingItem[]> {
  if (!id) {
    return getContinueWatching();
  }

  const existing = await getContinueWatching();
  const next = existing.filter(entry => entry.id !== id);

  if (next.length === existing.length) {
    return existing;
  }

  await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(next));
  return next;
}
