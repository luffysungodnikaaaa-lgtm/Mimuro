import { privateBackendUnavailable } from './_privateNotice';

export interface TopAnimeItem {
  rank: number;
  title: string;
  japaneseTitle: string;
  id: string;
  image: string;
  subEpisode?: number;
  dubEpisode?: number;
  type: string;
}

export interface TopAnimeResult {
  title: string;
  day: TopAnimeItem[];
  week: TopAnimeItem[];
  month: TopAnimeItem[];
}

/** Private provider logic omitted from public review repo. */
export const getTopAnime = async (): Promise<TopAnimeResult> => {
  privateBackendUnavailable();
};
