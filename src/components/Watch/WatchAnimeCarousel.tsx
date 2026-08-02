import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../theme';
import { WATCH_ANIME_CARD_WIDTH, WatchAnimeCard } from './WatchAnimeCard';
import { WatchAnimeCarouselSkeleton } from './WatchSkeletons';

const CAROUSEL_SEPARATOR = 12;
const CAROUSEL_ITEM_LENGTH = WATCH_ANIME_CARD_WIDTH + CAROUSEL_SEPARATOR;

type WatchAnimeCarouselItem = {
  id: string;
  title: string;
  image: string;
  badge?: string;
  isActive?: boolean;
};

type WatchAnimeCarouselProps = {
  title: string;
  items?: WatchAnimeCarouselItem[];
  isLoading?: boolean;
};

export function WatchAnimeCarousel({
  title,
  items,
  isLoading,
}: WatchAnimeCarouselProps) {
  const listRef = useRef<FlatList<WatchAnimeCarouselItem>>(null);
  const data = items?.filter(item => item.id && item.title) ?? [];
  const activeIndex = useMemo(
    () => data.findIndex(item => item.isActive),
    [data],
  );

  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeIndex, data.length]);

  const getItemLayout = useCallback(
    (_: ArrayLike<WatchAnimeCarouselItem> | null | undefined, index: number) => ({
      length: CAROUSEL_ITEM_LENGTH,
      offset: CAROUSEL_ITEM_LENGTH * index,
      index,
    }),
    [],
  );

  const hasActive = activeIndex >= 0;

  const renderItem: ListRenderItem<WatchAnimeCarouselItem> = useCallback(
    ({ item }) => (
      <WatchAnimeCard
        id={item.id}
        title={item.title}
        image={item.image}
        badge={item.badge}
        isActive={item.isActive}
        isDimmed={hasActive && !item.isActive}
      />
    ),
    [hasActive],
  );

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  if (isLoading) {
    return <WatchAnimeCarouselSkeleton title={title} />;
  }

  if (!data.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        nestedScrollEnabled
        keyExtractor={item => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        ItemSeparatorComponent={ItemSeparatorComponent}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.list}
        onScrollToIndexFailed={info => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
  },
  list: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 20,
  },
  separator: {
    width: 12,
  },
});
