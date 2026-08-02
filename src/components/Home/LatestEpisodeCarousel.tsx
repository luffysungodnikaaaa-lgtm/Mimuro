import { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LatestEpisodeAnime } from '../../api/latest-episode';
import { colors } from '../../theme';
import {
  LatestEpisodeCard,
  LATEST_EPISODE_CARD_WIDTH,
  LATEST_EPISODE_POSTER_HEIGHT,
} from './LatestEpisodeCard';

type LatestEpisodeCarouselProps = {
  data: LatestEpisodeAnime[];
  onRemove?: (id: string) => void;
  onViewMore?: () => void;
};

export function LatestEpisodeCarousel({
  data,
  onRemove,
  onViewMore,
}: LatestEpisodeCarouselProps) {
  const renderItem: ListRenderItem<LatestEpisodeAnime> = useCallback(
    ({ item }) => <LatestEpisodeCard item={item} onRemove={onRemove} />,
    [onRemove],
  );

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const ListFooterComponent = useCallback(() => {
    if (!onViewMore || !data.length) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <Pressable
          onPress={onViewMore}
          accessibilityRole="button"
          accessibilityLabel="View more continue watching"
          style={({ pressed }) => [
            styles.viewMoreButton,
            pressed && styles.viewMorePressed,
          ]}
        >
          <Text style={styles.viewMoreText}>View More</Text>
        </Pressable>
      </View>
    );
  }, [data.length, onViewMore]);

  return (
    <FlatList
      data={data}
      keyExtractor={item => `${item.id}-${item.episode}`}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListFooterComponent={ListFooterComponent}
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
  footer: {
    marginLeft: 12,
    width: LATEST_EPISODE_CARD_WIDTH,
    justifyContent: 'flex-start',
  },
  viewMoreButton: {
    width: LATEST_EPISODE_CARD_WIDTH,
    height: LATEST_EPISODE_POSTER_HEIGHT,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewMorePressed: {
    opacity: 0.75,
  },
  viewMoreText: {
    color: '#9a9aa3',
    fontSize: 14,
    fontWeight: '500',
  },
});
