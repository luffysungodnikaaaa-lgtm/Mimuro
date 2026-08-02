import { privateBackendUnavailable } from './_privateNotice';

export interface RelatedAnime {
  title: string;
  japaneseTitle: string;
  id: string;
  image: string;
}

export interface NextEpisode {
  predictedAt: string;
  at?: number;
}

export interface AnimeInfo {
  id: string;
  dataId?: number;
  title: string;
  japaneseTitle: string;
  altNames: string;
  image: string;
  banner: string;
  rating: string;
  quality: string;
  hasSub: boolean;
  hasDub: boolean;
  synopsis: string;
  type: string;
  premiered: string;
  aired: string;
  status: string;
  genres: string[];
  malRating?: number;
  duration: string;
  totalEpisodes?: number;
  studios: string[];
  producers: string[];
  nextEpisode?: NextEpisode;
  trending: RelatedAnime[];
  recommended: RelatedAnime[];
}

/** Private provider logic omitted from public review repo. */
export const getInfo = async (_id = ''): Promise<AnimeInfo | null> => {
  privateBackendUnavailable();
};
