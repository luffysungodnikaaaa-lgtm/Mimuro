import { useQuery } from '@tanstack/react-query';
import { findMalIdByTitle } from '../api/jikan';

export const malIdQueryKey = ['mal-id'] as const;

type UseMalIdParams = {
  episodeMalId?: number;
  title?: string;
  japaneseTitle?: string;
  type?: string;
  totalEpisodes?: number;
};

export function useMalId({
  episodeMalId,
  title,
  japaneseTitle,
  type,
  totalEpisodes,
}: UseMalIdParams) {
  const knownMalId = episodeMalId;

  const query = useQuery({
    queryKey: [
      ...malIdQueryKey,
      title,
      japaneseTitle,
      type,
      totalEpisodes,
    ],
    queryFn: () =>
      findMalIdByTitle(title!, {
        japaneseTitle,
        type,
        totalEpisodes,
      }),
    enabled: !knownMalId && !!title?.trim(),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  return {
    malId: knownMalId ?? query.data,
    isLoading: !knownMalId && query.isLoading,
    isError: !knownMalId && query.isError,
  };
}
