import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CategoryAnime } from '../api/category';
import { CategoryFilterModal } from '../components/Category/CategoryFilterModal';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchEmptyState } from '../components/Search/SearchEmptyState';
import { SearchResultItem } from '../components/Search/SearchResultItem';
import { SearchSkeleton } from '../components/Search/SearchSkeleton';
import { RandomButton } from '../components/Search/RandomButton';
import {
  EMPTY_CATEGORY_FILTERS,
  countActiveCategoryFilters,
  type CategoryFilterState,
} from '../constants/categoryFilters';
import { useSearch } from '../hooks/useSearch';
import { colors } from '../theme';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<CategoryFilterState>(
    EMPTY_CATEGORY_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<CategoryFilterState>(
    EMPTY_CATEGORY_FILTERS,
  );
  const [filterVisible, setFilterVisible] = useState(false);

  const search = useSearch(debouncedQuery, appliedFilters);
  const activeFilterCount = countActiveCategoryFilters(appliedFilters);
  const hasQuery = debouncedQuery.length > 0;

  const anime = useMemo(
    () => search.data?.pages.flatMap(page => page.anime) ?? [],
    [search.data?.pages],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 1000);
    return () => clearTimeout(timer);
  }, [query]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setFilterVisible(false);
  }, [draftFilters]);

  const handleOpenFilters = useCallback(() => {
    setDraftFilters(appliedFilters);
    setFilterVisible(true);
  }, [appliedFilters]);

  const renderItem = useCallback(
    ({ item }: { item: CategoryAnime }) => <SearchResultItem item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: CategoryAnime, index: number) =>
      `${debouncedQuery}-${item.id}-${index}`,
    [debouncedQuery],
  );

  const handleEndReached = useCallback(() => {
    if (search.hasNextPage && !search.isFetchingNextPage) {
      search.fetchNextPage();
    }
  }, [search]);

  const listEmpty = useCallback(() => {
    if (search.isLoading) {
      return <SearchSkeleton />;
    }

    if (search.isError) {
      return (
        <SearchEmptyState
          message={getErrorMessage(search.error, 'Failed to search anime')}
        />
      );
    }

    return (
      <SearchEmptyState
        message={
          hasQuery
            ? `No results found for "${debouncedQuery}"`
            : 'No anime found'
        }
      />
    );
  }, [
    debouncedQuery,
    hasQuery,
    search.error,
    search.isError,
    search.isLoading,
  ]);

  const listFooter = useCallback(() => {
    if (search.isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      );
    }

    return null;
  }, [search.isFetchingNextPage]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchBarWrap}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery('')}
              />
            </View>
            <RandomButton />
            <Pressable
              onPress={handleOpenFilters}
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.filterButtonPressed,
              ]}
            >
              <Ionicons name="options-outline" size={18} color={colors.text} />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
          {anime.length ? (
            <Text style={styles.resultCount}>
              {anime.length} result{anime.length === 1 ? '' : 's'} loaded
              {hasQuery ? ` for "${debouncedQuery}"` : ''}
            </Text>
          ) : null}
        </View>
        <FlatList
          data={anime}
          key={activeFilterCount}
          style={styles.list}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
        />
        {search.isFetching &&
        !search.isLoading &&
        !search.isFetchingNextPage ? (
          <View style={styles.refreshing}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : null}
      </View>

      <CategoryFilterModal
        visible={filterVisible}
        filters={draftFilters}
        onChange={setDraftFilters}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  searchBarWrap: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  filterButton: {
    width: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  filterButtonPressed: {
    opacity: 0.85,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
  },
  filterBadgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '700',
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  refreshing: {
    position: 'absolute',
    top: 12,
    right: 20,
  },
});
