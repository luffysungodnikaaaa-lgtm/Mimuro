import { privateBackendUnavailable } from './_privateNotice';

export interface SkipData {
  intro: [number, number];
  outro: [number, number];
}

export interface SourceResult {
  url: string;
  skipData: SkipData;
}

/** Private provider logic omitted from public review repo. */
export const getSource = async (
  _linkId: string,
): Promise<SourceResult | null> => {
  privateBackendUnavailable();
};
