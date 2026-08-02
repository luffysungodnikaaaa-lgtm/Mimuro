import { privateBackendUnavailable } from './_privateNotice';

export interface ScheduleGenre {
  name: string;
  slug: string;
}

export interface ScheduleAnime {
  title: string;
  japaneseTitle: string;
  id: string;
  episode: number;
  time: string;
  poster: string;
  synopsis: string;
  genres: ScheduleGenre[];
  airing: boolean;
  passed: boolean;
  next: boolean;
  at: number;
}

/** Private provider logic omitted from public review repo. */
export const getSchedule = async (
  _tz: number,
  _time: number,
): Promise<ScheduleAnime[]> => {
  privateBackendUnavailable();
};
