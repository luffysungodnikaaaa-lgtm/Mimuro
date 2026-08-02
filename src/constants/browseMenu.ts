export type BrowseSubItem = {
  id: string;
  label: string;
  params: string;
};

export type BrowseMenuItem = {
  id: string;
  label: string;
  params: string;
};

export const BROWSE_MENU_ITEMS: BrowseMenuItem[] = [
  { id: 'updated', label: 'Updated', params: '/latest-updated' },
  { id: 'added', label: 'Added', params: '/new-release' },
  { id: 'popular', label: 'Popular', params: '/most-viewed' },
  { id: 'upcoming', label: 'Upcoming', params: '/status/not-yet-aired' },
  { id: 'ongoing', label: 'Ongoing', params: '/status/currently-airing' },
  { id: 'completed', label: 'Completed', params: '/status/finished-airing' },
];

export const BROWSE_GENRE_ITEMS: BrowseSubItem[] = [
  { id: 'action', label: 'Action', params: '/genre/action' },
  { id: 'adventure', label: 'Adventure', params: '/genre/adventure' },
  { id: 'comedy', label: 'Comedy', params: '/genre/comedy' },
  { id: 'drama', label: 'Drama', params: '/genre/drama' },
  { id: 'fantasy', label: 'Fantasy', params: '/genre/fantasy' },
  { id: 'horror', label: 'Horror', params: '/genre/horror' },
  { id: 'isekai', label: 'Isekai', params: '/genre/isekai' },
  { id: 'romance', label: 'Romance', params: '/genre/romance' },
  { id: 'sci-fi', label: 'Sci-Fi', params: '/genre/sci-fi' },
  { id: 'shounen', label: 'Shounen', params: '/genre/shounen' },
  { id: 'slice-of-life', label: 'Slice of Life', params: '/genre/slice-of-life' },
  { id: 'supernatural', label: 'Supernatural', params: '/genre/supernatural' },
];

export const BROWSE_TYPE_ITEMS: BrowseSubItem[] = [
  { id: 'tv', label: 'TV', params: '/type/tv' },
  { id: 'movie', label: 'Movie', params: '/type/movie' },
  { id: 'ova', label: 'OVA', params: '/type/ova' },
  { id: 'ona', label: 'ONA', params: '/type/ona' },
  { id: 'special', label: 'Special', params: '/type/special' },
  { id: 'music', label: 'Music', params: '/type/music' },
  { id: 'tv-short', label: 'TV Short', params: '/type/tv-short' },
];

const AZ_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const BROWSE_AZ_ITEMS: BrowseSubItem[] = [
  { id: 'all', label: 'All', params: '/az-list' },
  { id: 'other', label: '#', params: '/az-list/other' },
  { id: '0-9', label: '0-9', params: '/az-list/0-9' },
  ...AZ_LETTERS.map(letter => ({
    id: letter.toLowerCase(),
    label: letter,
    params: `/az-list/${letter}`,
  })),
];

export type CategoryMainTab = {
  id: string;
  label: string;
  kind: 'menu' | 'genre' | 'types' | 'az';
  params?: string;
};

export const CATEGORY_MAIN_TABS: CategoryMainTab[] = [
  { id: 'genre', label: 'Genre', kind: 'genre' },
  { id: 'types', label: 'Types', kind: 'types' },
  { id: 'az', label: 'A-Z', kind: 'az' },
  ...BROWSE_MENU_ITEMS.map(item => ({
    id: item.id,
    label: item.label,
    kind: 'menu' as const,
    params: item.params,
  })),
];

export function formatCategoryTitle(title: string, fallbackTitle?: string) {
  if (title === 'Not yet aired Anime') {
    return 'Upcoming';
  }

  if (title === 'Recently Added') {
    return 'Added';
  }

  return fallbackTitle || title;
}
