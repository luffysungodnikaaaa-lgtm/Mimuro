import { privateBackendUnavailable } from './_privateNotice';

export interface SpotlightAnime {
  title: string;
  japaneseTitle: string;
  quality: string;
  date: string;
  hasSub: boolean;
  hasDub: boolean;
  synopsis: string;
  id: string;
  image: string;
}

/** Private provider logic omitted from public review repo. */
export const getSpotlight = async (): Promise<SpotlightAnime[]> => {
  privateBackendUnavailable();
};
