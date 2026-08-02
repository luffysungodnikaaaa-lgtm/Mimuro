import { privateBackendUnavailable } from './_privateNotice';

export interface DownloadOption {
  id: string;
  provider: string;
  type: 'sub' | 'dub';
  name: string;
  url: string;
}

export interface DownloadResult {
  downloads: DownloadOption[];
  servesFrom?: string;
  cacheExpiresIn?: string;
}

/** Private provider logic omitted from public review repo. */
export const getDownloads = async (
  _malId: number,
  _episode: number,
  _timestamp: number,
): Promise<DownloadResult> => {
  privateBackendUnavailable();
};
