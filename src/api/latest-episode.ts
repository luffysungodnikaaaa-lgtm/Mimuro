import { privateBackendUnavailable } from './_privateNotice';

export const LATEST_EPISODE_CATEGORIES = {
  all: 'updated-all',
  sub: 'updated-sub',
  dub: 'updated-dub',
  trending: 'trending',
  random: 'random',
} as const;

export type LatestEpisodeCategory = keyof typeof LATEST_EPISODE_CATEGORIES;

export const LATEST_EPISODE_CATEGORY_OPTIONS: {
  id: LatestEpisodeCategory;
  label: string;
}[] = [
  { id: 'all', label: 'All' },
  { id: 'sub', label: 'Sub' },
  { id: 'dub', label: 'Dub' },
  { id: 'trending', label: 'Trending' },
  { id: 'random', label: 'Random' },
];

export interface LatestEpisodeAnime {
  title: string;
  japaneseTitle: string;
  id: string;
  episode: number;
  image: string;
  subEpisode?: number;
  dubEpisode?: number;
  totalEpisodes?: number;
  type: string;
}

/** Private provider logic omitted from public review repo. */
export const getLatestEpisode = async (
  _category: LatestEpisodeCategory,
  _page: number,
): Promise<LatestEpisodeAnime[]> => {
  privateBackendUnavailable();
};
