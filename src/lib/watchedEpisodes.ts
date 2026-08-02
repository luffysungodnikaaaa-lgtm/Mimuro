import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHED_EPISODES_KEY = 'watchedEpisodes:byAnime';

type WatchedEpisodesMap = Record<string, number[]>;

async function readMap(): Promise<WatchedEpisodesMap> {
  const raw = await AsyncStorage.getItem(WATCHED_EPISODES_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as WatchedEpisodesMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function getWatchedEpisodes(animeId: string): Promise<number[]> {
  if (!animeId) {
    return [];
  }

  const map = await readMap();
  const episodes = map[animeId];
  return Array.isArray(episodes) ? episodes : [];
}

export async function markEpisodeWatched(
  animeId: string,
  episode: number,
): Promise<number[]> {
  if (!animeId || !Number.isFinite(episode) || episode < 1) {
    return [];
  }

  const map = await readMap();
  const existing = Array.isArray(map[animeId]) ? map[animeId] : [];

  if (existing.includes(episode)) {
    return existing;
  }

  const next = [...existing, episode].sort((a, b) => a - b);
  map[animeId] = next;
  await AsyncStorage.setItem(WATCHED_EPISODES_KEY, JSON.stringify(map));
  return next;
}
