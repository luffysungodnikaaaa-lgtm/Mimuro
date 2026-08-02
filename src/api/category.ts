import { privateBackendUnavailable } from './_privateNotice';

export interface CategoryAnime {
  title: string;
  japaneseTitle: string;
  id: string;
  episode: number;
  image: string;
  subEpisode?: number;
  dubEpisode?: number;
  totalEpisodes?: number;
  type: string;
  genres: string[];
  rating?: number;
}

export interface CategoryResult {
  title: string;
  anime: CategoryAnime[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

/** Private provider logic omitted from public review repo. */
export const getCategory = async (_params: string): Promise<CategoryResult> => {
  privateBackendUnavailable();
};
