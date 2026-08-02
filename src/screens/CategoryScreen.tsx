import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CategoryAnime } from '../api/category';
import {
  CategorySubTabBar,
  CategoryTabBar,
} from '../components/Category/CategoryTabBar';
import { SearchEmptyState } from '../components/Search/SearchEmptyState';
import { SearchResultItem } from '../components/Search/SearchResultItem';
import { SearchSkeleton } from '../components/Search/SearchSkeleton';
import {
  BROWSE_AZ_ITEMS,
  BROWSE_GENRE_ITEMS,
  BROWSE_TYPE_ITEMS,
  CATEGORY_MAIN_TABS,
  formatCategoryTitle,
} from '../constants/browseMenu';
import { useCategoryInfinite } from '../hooks/useCategoryInfinite';
import type { TabParamList } from '../navigation/TabNavigator';
import { colors } from '../theme';

type CategoryScreenProps = BottomTabScreenProps<TabParamList, 'Category'>;

const DEFAULT_AZ_ID = 'a';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function CategoryScreen({ route }: CategoryScreenProps) {
  const [activeTabId, setActiveTabId] = useState(route.params?.tabId ?? 'popular');
  const [activeGenreId, setActiveGenreId] = useState(BROWSE_GENRE_ITEMS[0].id);
  const [activeTypeId, setActiveTypeId] = useState(BROWSE_TYPE_ITEMS[0].id);
  const [activeAzId, setActiveAzId] = useState(DEFAULT_AZ_ID);

  useEffect(() => {
    if (route.params?.tabId) {
      setActiveTabId(route.params.tabId);
    }
  }, [route.params?.tabId]);

  const activeTab = useMemo(
    () => CATEGORY_MAIN_TABS.find(tab => tab.id === activeTabId),
    [activeTabId],
  );

  const params = useMemo(() => {
    if (activeTab?.kind === 'genre') {
      return (
        BROWSE_GENRE_ITEMS.find(item => item.id === activeGenreId)?.params ??
        BROWSE_GENRE_ITEMS[0].params
      );
    }

    if (activeTab?.kind === 'types') {
      return (
        BROWSE_TYPE_ITEMS.find(item => item.id === activeTypeId)?.params ??
        BROWSE_TYPE_ITEMS[0].params
      );
    }

    if (activeTab?.kind === 'az') {
      return (
        BROWSE_AZ_ITEMS.find(item => item.id === activeAzId)?.params ??
        BROWSE_AZ_ITEMS.find(item => item.id === DEFAULT_AZ_ID)?.params ??
        '/az-list/A'
      );
    }

    return activeTab?.params ?? '/most-viewed';
  }, [activeAzId, activeGenreId, activeTab, activeTypeId]);

  const category = useCategoryInfinite(params);

  const anime = useMemo(
    () => category.data?.pages.flatMap(page => page.anime) ?? [],
    [category.data?.pages],
  );

  const fallbackTitle =
    activeTab?.kind === 'genre'
      ? BROWSE_GENRE_ITEMS.find(item => item.id === activeGenreId)?.label
      : activeTab?.kind === 'types'
        ? BROWSE_TYPE_ITEMS.find(item => item.id === activeTypeId)?.label
        : activeTab?.kind === 'az'
          ? BROWSE_AZ_ITEMS.find(item => item.id === activeAzId)?.label
          : activeTab?.label;

  const screenTitle = formatCategoryTitle(
    category.data?.pages[0]?.title || fallbackTitle || 'Category',
    fallbackTitle,
  );

  const handleSelectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CategoryAnime }) => <SearchResultItem item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: CategoryAnime, index: number) => `${params}-${item.id}-${index}`,
    [params],
  );

  const handleEndReached = useCallback(() => {
    if (category.hasNextPage && !category.isFetchingNextPage) {
      category.fetchNextPage();
    }
  }, [category]);

  const listEmpty = useCallback(() => {
    if (category.isLoading) {
      return <SearchSkeleton />;
    }

    if (category.isError) {
      return (
        <SearchEmptyState
          message={getErrorMessage(category.error, 'Failed to load anime')}
        />
      );
    }

    return <SearchEmptyState message="No anime found in this category" />;
  }, [category.error, category.isError, category.isLoading]);

  const listFooter = useCallback(() => {
    if (category.isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      );
    }

    return null;
  }, [category.isFetchingNextPage]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{screenTitle}</Text>
          <CategoryTabBar
            tabs={CATEGORY_MAIN_TABS}
            activeTabId={activeTabId}
            onSelect={handleSelectTab}
          />
          {activeTab?.kind === 'genre' ? (
            <CategorySubTabBar
              items={BROWSE_GENRE_ITEMS}
              activeItemId={activeGenreId}
              onSelect={setActiveGenreId}
            />
          ) : null}
          {activeTab?.kind === 'types' ? (
            <CategorySubTabBar
              items={BROWSE_TYPE_ITEMS}
              activeItemId={activeTypeId}
              onSelect={setActiveTypeId}
            />
          ) : null}
          {activeTab?.kind === 'az' ? (
            <CategorySubTabBar
              items={BROWSE_AZ_ITEMS}
              activeItemId={activeAzId}
              onSelect={setActiveAzId}
            />
          ) : null}
          {anime.length ? (
            <Text style={styles.resultCount}>{anime.length} anime loaded</Text>
          ) : null}
        </View>

        <FlatList
          data={anime}
          key={`${activeTabId}-${params}`}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
        />

        {category.isFetching &&
        !category.isLoading &&
        !category.isFetchingNextPage ? (
          <View style={styles.refreshing}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : null}
      </View>
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
    paddingTop: 8,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingBottom: 8,
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
