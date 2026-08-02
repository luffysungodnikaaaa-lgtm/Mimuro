import { privateBackendUnavailable } from './_privateNotice';

export interface Episode {
  episodeId: number;
  episode: number;
  slug: string;
  title?: string;
  japaneseTitle?: string;
  hasSub: boolean;
  hasDub: boolean;
  isFiller: boolean;
  malId?: number;
  dataIds: string;
  range: string;
  timestamp?: number;
}

/** Private provider logic omitted from public review repo. */
export const getEpisode = async (_dataId = 1458): Promise<Episode[]> => {
  privateBackendUnavailable();
};
