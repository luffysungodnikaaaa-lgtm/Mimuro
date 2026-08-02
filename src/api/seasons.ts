import { privateBackendUnavailable } from './_privateNotice';

export interface Season {
  title: string;
  id: string;
  image: string;
  isActive: boolean;
}

/** Private provider logic omitted from public review repo. */
export const getSeasons = async (_dataId = 1458): Promise<Season[]> => {
  privateBackendUnavailable();
};
