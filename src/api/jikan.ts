import axios from 'axios';

const jikanClient = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 12_000,
});

type JikanAnime = {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string | null;
  episodes: number | null;
};

type JikanSearchResponse = {
  data: JikanAnime[];
};

export type FindMalIdOptions = {
  japaneseTitle?: string;
  type?: string;
  totalEpisodes?: number;
};

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(
  query: string,
  anime: JikanAnime,
  options?: FindMalIdOptions,
) {
  const normalizedQuery = normalizeTitle(query);
  if (!normalizedQuery) {
    return 0;
  }

  const titles = [anime.title, anime.title_english, anime.title_japanese]
    .filter((title): title is string => !!title?.trim())
    .map(normalizeTitle);

  let score = 0;

  for (const title of titles) {
    if (title === normalizedQuery) {
      score = Math.max(score, 100);
      continue;
    }

    if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) {
      score = Math.max(score, 75);
      continue;
    }

    const queryTokens = new Set(normalizedQuery.split(' ').filter(Boolean));
    const titleTokens = title.split(' ').filter(Boolean);
    if (!queryTokens.size || !titleTokens.length) {
      continue;
    }

    const overlap = titleTokens.filter(token => queryTokens.has(token)).length;
    score = Math.max(
      score,
      (overlap / Math.max(queryTokens.size, titleTokens.length)) * 60,
    );
  }

  if (options?.type && anime.type) {
    const infoType = options.type.toLowerCase();
    const animeType = anime.type.toLowerCase();
    if (infoType.includes(animeType) || animeType.includes(infoType)) {
      score += 8;
    }
  }

  if (
    options?.totalEpisodes &&
    anime.episodes &&
    options.totalEpisodes === anime.episodes
  ) {
    score += 12;
  }

  return score;
}

function pickBestMalId(
  results: JikanAnime[],
  query: string,
  options?: FindMalIdOptions,
) {
  let best = results[0];
  let bestScore = scoreMatch(query, best, options);

  for (const item of results.slice(1)) {
    const score = scoreMatch(query, item, options);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }

  if (options?.japaneseTitle) {
    for (const item of results) {
      const score = scoreMatch(options.japaneseTitle, item, options);
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    }
  }

  return best.mal_id;
}

export async function findMalIdByTitle(
  title: string,
  options?: FindMalIdOptions,
): Promise<number | undefined> {
  const query = title.trim();
  if (!query) {
    return undefined;
  }

  const response = await jikanClient.get<JikanSearchResponse>('/anime', {
    params: {
      q: query,
      limit: 8,
      sfw: true,
    },
  });

  const results = response.data.data;
  if (results?.length) {
    return pickBestMalId(results, query, options);
  }

  const japaneseTitle = options?.japaneseTitle?.trim();
  if (!japaneseTitle || japaneseTitle === query) {
    return undefined;
  }

  const japaneseResponse = await jikanClient.get<JikanSearchResponse>(
    '/anime',
    {
      params: {
        q: japaneseTitle,
        limit: 8,
        sfw: true,
      },
    },
  );

  const japaneseResults = japaneseResponse.data.data;
  if (!japaneseResults?.length) {
    return undefined;
  }

  return pickBestMalId(japaneseResults, japaneseTitle, options);
}
