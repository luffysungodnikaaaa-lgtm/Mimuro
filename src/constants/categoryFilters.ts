export type CategoryFilterState = {
  genres: string[];
  termTypes: string[];
  seasons: string[];
  years: string[];
  statuses: string[];
  languages: string[];
  ratings: string[];
  sources: string[];
  sort: string;
  epMin: string;
  epMax: string;
};

export const EMPTY_CATEGORY_FILTERS: CategoryFilterState = {
  genres: [],
  termTypes: [],
  seasons: [],
  years: [],
  statuses: [],
  languages: [],
  ratings: [],
  sources: [],
  sort: 'default',
  epMin: '',
  epMax: '',
};

export type CategoryFilterOption = {
  label: string;
  value: string;
};

export const CATEGORY_GENRES: CategoryFilterOption[] = [
  { label: 'Action', value: '1' },
  { label: 'Adventure', value: '2' },
  { label: 'Cars', value: '538' },
  { label: 'Comedy', value: '8' },
  { label: 'Dementia', value: '453' },
  { label: 'Demons', value: '119' },
  { label: 'Drama', value: '62' },
  { label: 'Ecchi', value: '214' },
  { label: 'Fantasy', value: '3' },
  { label: 'Game', value: '180' },
  { label: 'Harem', value: '215' },
  { label: 'Historical', value: '70' },
  { label: 'Horror', value: '222' },
  { label: 'Isekai', value: '74' },
  { label: 'Josei', value: '404' },
  { label: 'Kids', value: '46' },
  { label: 'Magic', value: '203' },
  { label: 'Mahou Shoujo', value: '2310' },
  { label: 'Martial Arts', value: '114' },
  { label: 'Mecha', value: '123' },
  { label: 'Military', value: '125' },
  { label: 'Music', value: '242' },
  { label: 'Mystery', value: '57' },
  { label: 'Parody', value: '162' },
  { label: 'Police', value: '136' },
  { label: 'Psychological', value: '73' },
  { label: 'Romance', value: '28' },
  { label: 'Samurai', value: '163' },
  { label: 'School', value: '14' },
  { label: 'Sci-Fi', value: '12' },
  { label: 'Seinen', value: '50' },
  { label: 'Shoujo', value: '252' },
  { label: 'Shoujo Ai', value: '235' },
  { label: 'Shounen', value: '15' },
  { label: 'Shounen Ai', value: '233' },
  { label: 'Slice of Life', value: '35' },
  { label: 'Space', value: '124' },
  { label: 'Sports', value: '29' },
  { label: 'Super Power', value: '16' },
  { label: 'Supernatural', value: '9' },
  { label: 'Suspense', value: '2316' },
  { label: 'Thriller', value: '54' },
  { label: 'Vampire', value: '58' },
];

export const CATEGORY_SEASONS: CategoryFilterOption[] = [
  { label: 'Fall', value: 'fall' },
  { label: 'Summer', value: 'summer' },
  { label: 'Spring', value: 'spring' },
  { label: 'Winter', value: 'winter' },
];

export const CATEGORY_TERM_TYPES: CategoryFilterOption[] = [
  { label: 'Movie', value: 'Movie' },
  { label: 'Music', value: 'Music' },
  { label: 'ONA', value: 'ONA' },
  { label: 'OVA', value: 'OVA' },
  { label: 'Special', value: 'Special' },
  { label: 'TV', value: 'TV' },
  { label: 'TV Short', value: 'TV_SHORT' },
];

export const CATEGORY_STATUSES: CategoryFilterOption[] = [
  { label: 'Finished Airing', value: 'finished-airing' },
  { label: 'Currently Airing', value: 'currently-airing' },
  { label: 'Not yet aired', value: 'not-yet-aired' },
];

export const CATEGORY_LANGUAGES: CategoryFilterOption[] = [
  { label: 'Sub', value: 'sub' },
  { label: 'Dub', value: 'dub' },
];

export const CATEGORY_RATINGS: CategoryFilterOption[] = [
  { label: 'PG - Children', value: 'PG' },
  { label: 'PG-13 - Teens 13+', value: 'PG-13' },
  { label: 'G - All Ages', value: 'G' },
  { label: 'R - 17+', value: 'R' },
  { label: 'R+ - Mild Nudity', value: 'R+' },
  { label: 'Rx - Hentai', value: 'Rx' },
];

export const CATEGORY_SOURCES: CategoryFilterOption[] = [
  { label: 'Manga', value: 'manga' },
  { label: 'Original', value: 'original' },
  { label: 'Light Novel', value: 'light_novel' },
  { label: 'Other', value: 'other' },
  { label: 'Video Game', value: 'video_game' },
  { label: 'Visual Novel', value: 'visual_novel' },
  { label: 'Novel', value: 'novel' },
  { label: 'Web Novel', value: 'web_novel' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Web Manga', value: 'web_manga' },
  { label: 'Game', value: 'game' },
  { label: '4-koma Manga', value: '4-koma_manga' },
  { label: 'Book', value: 'book' },
  { label: 'Picture Book', value: 'picture_book' },
  { label: 'Mixed Media', value: 'mixed_media' },
  { label: 'Card Game', value: 'card_game' },
  { label: 'Music', value: 'music' },
  { label: 'Radio', value: 'radio' },
];

export const CATEGORY_SORT_OPTIONS: CategoryFilterOption[] = [
  { label: 'Default', value: 'default' },
  { label: 'Latest Updated', value: 'latest-updated' },
  { label: 'Latest Added', value: 'latest-added' },
  { label: 'Score', value: 'score' },
  { label: 'Name A-Z', value: 'name-az' },
  { label: 'Release Date', value: 'release-date' },
  { label: 'Most Viewed', value: 'most-viewed' },
  { label: 'Number of Episodes', value: 'number_of_episodes' },
];

export const CATEGORY_YEARS: CategoryFilterOption[] = Array.from(
  { length: 2026 - 1980 + 1 },
  (_, index) => {
    const year = String(2026 - index);
    return { label: year, value: year };
  },
);

export function countActiveCategoryFilters(filters: CategoryFilterState): number {
  let count = 0;

  if (filters.genres.length) count += 1;
  if (filters.termTypes.length) count += 1;
  if (filters.seasons.length) count += 1;
  if (filters.years.length) count += 1;
  if (filters.statuses.length) count += 1;
  if (filters.languages.length) count += 1;
  if (filters.ratings.length) count += 1;
  if (filters.sources.length) count += 1;
  if (filters.sort !== 'default') count += 1;
  if (filters.epMin || filters.epMax) count += 1;

  return count;
}

export function hasCategoryFilters(filters: CategoryFilterState): boolean {
  return countActiveCategoryFilters(filters) > 0;
}

export function getFilterSelectionSummary(
  values: string[],
  options: CategoryFilterOption[],
): string {
  if (!values.length) {
    return 'Any';
  }

  if (values.length === 1) {
    return options.find(option => option.value === values[0])?.label ?? '1 selected';
  }

  return `${values.length} selected`;
}

export function getSortLabel(sort: string): string {
  return (
    CATEGORY_SORT_OPTIONS.find(option => option.value === sort)?.label ?? 'Default'
  );
}
