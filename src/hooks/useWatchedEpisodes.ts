import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getWatchedEpisodes,
  markEpisodeWatched,
} from '../lib/watchedEpisodes';

export function useWatchedEpisodes(animeId?: string) {
  const [episodes, setEpisodes] = useState<number[]>([]);

  useEffect(() => {
    let active = true;

    if (!animeId) {
      setEpisodes([]);
      return;
    }

    getWatchedEpisodes(animeId).then(data => {
      if (active) {
        setEpisodes(data);
      }
    });

    return () => {
      active = false;
    };
  }, [animeId]);

  const markWatched = useCallback(
    async (episode: number) => {
      if (!animeId) {
        return;
      }

      const next = await markEpisodeWatched(animeId, episode);
      setEpisodes(next);
    },
    [animeId],
  );

  const watchedSet = useMemo(() => new Set(episodes), [episodes]);

  return { watchedSet, markWatched };
}
