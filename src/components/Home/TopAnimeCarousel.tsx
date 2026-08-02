import { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import type { TopAnimeItem } from '../../api/top-anime';
import { TopAnimeCard } from './TopAnimeCard';

type TopAnimeCarouselProps = {
  data: TopAnimeItem[];
};

export function TopAnimeCarousel({ data }: TopAnimeCarouselProps) {
  const renderItem: ListRenderItem<TopAnimeItem> = useCallback(
    ({ item }) => <TopAnimeCard item={item} />,
    [],
  );

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={item => `${item.id}-${item.rank}`}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
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
