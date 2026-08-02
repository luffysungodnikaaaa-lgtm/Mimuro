import { privateBackendUnavailable } from './_privateNotice';

/** Private provider logic omitted from public review repo. */
export const getRandom = async (): Promise<string | null> => {
  privateBackendUnavailable();
};
