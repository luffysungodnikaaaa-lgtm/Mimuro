import { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import type { SpotlightAnime } from '../../api/spotlight';
import { SpotlightSlide } from './SpotlightSlide';

type SpotlightCarouselProps = {
  data: SpotlightAnime[];
};

export function SpotlightCarousel({ data }: SpotlightCarouselProps) {
  const renderItem: ListRenderItem<SpotlightAnime> = useCallback(
    ({ item }) => <SpotlightSlide item={item} />,
    [],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id || item.title}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
  },
});
