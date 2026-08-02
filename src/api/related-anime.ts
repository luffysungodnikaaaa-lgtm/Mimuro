import { privateBackendUnavailable } from './_privateNotice';

export interface RelatedAnimeItem {
  dataId: number;
  relation: string;
  title: string;
  japaneseTitle: string;
  id: string;
  image: string;
  type: string;
}

export interface RelatedAnimeResult {
  title: string;
  anime: RelatedAnimeItem[];
}

/** Private provider logic omitted from public review repo. */
export const getRelatedAnime = async (
  _dataId = 1458,
): Promise<RelatedAnimeResult> => {
  privateBackendUnavailable();
};
