import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContinueWatchingListItem } from '../components/ContinueWatching/ContinueWatchingListItem';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchEmptyState } from '../components/Search/SearchEmptyState';
import { SearchSkeleton } from '../components/Search/SearchSkeleton';
import { WatchBackButton } from '../components/Watch/WatchBackButton';
import { useContinueWatching } from '../hooks/useContinueWatching';
import type { ContinueWatchingItem } from '../lib/continueWatching';
import type { RootStackParamList } from '../navigation/StackNavigator';
import { colors } from '../theme';

type ContinueWatchingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ContinueWatching'
>;

type SortOption = 'recent' | 'titleAsc' | 'titleDesc' | 'episodeDesc' | 'episodeAsc';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'titleAsc', label: 'A–Z' },
  { id: 'titleDesc', label: 'Z–A' },
  { id: 'episodeDesc', label: 'EP High' },
  { id: 'episodeAsc', label: 'EP Low' },
];

function sortItems(
  items: ContinueWatchingItem[],
  sort: SortOption,
): ContinueWatchingItem[] {
  const next = [...items];

  switch (sort) {
    case 'titleAsc':
      return next.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
      );
    case 'titleDesc':
      return next.sort((a, b) =>
        b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }),
      );
    case 'episodeDesc':
      return next.sort((a, b) => b.episode - a.episode);
    case 'episodeAsc':
      return next.sort((a, b) => a.episode - b.episode);
    case 'recent':
    default:
      return next.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export function ContinueWatchingScreen({
  navigation,
}: ContinueWatchingScreenProps) {
  const { items, isLoading, removeItem } = useContinueWatching();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matched = normalizedQuery
      ? items.filter(item => item.title.toLowerCase().includes(normalizedQuery))
      : items;

    return sortItems(matched, sort);
  }, [items, query, sort]);

  const handleRemove = useCallback(
    (id: string) => {
      void removeItem(id);
    },
    [removeItem],
  );

  const renderItem: ListRenderItem<ContinueWatchingItem> = useCallback(
    ({ item }) => (
      <ContinueWatchingListItem item={item} onRemove={handleRemove} />
    ),
    [handleRemove],
  );

  const hasItems = items.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <WatchBackButton onPress={() => navigation.goBack()} variant="bar" />
        <Text style={styles.headerTitle}>Continue Watching</Text>
      </View>

      {hasItems || isLoading ? (
        <View style={styles.controls}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
            style={styles.sortScroll}
          >
            {SORT_OPTIONS.map(option => {
              const isActive = sort === option.id;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSort(option.id)}
                  style={[styles.sortChip, isActive && styles.sortChipActive]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      isActive && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {isLoading ? (
        <SearchSkeleton />
      ) : !hasItems ? (
        <SearchEmptyState message="Nothing to continue yet. Start watching an anime and it will show up here." />
      ) : filteredItems.length ? (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <SearchEmptyState
          message={
            hasQuery
              ? `No results found for "${query.trim()}"`
              : 'No continue watching items found'
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  controls: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  sortScroll: {
    flexGrow: 0,
  },
  sortRow: {
    alignItems: 'center',
    gap: 8,
  },
  sortChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  sortChipActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.2)',
  },
  sortChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: colors.accent,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
});
