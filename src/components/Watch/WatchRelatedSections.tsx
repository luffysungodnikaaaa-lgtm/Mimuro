import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Season } from '../../api/seasons';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';
import { WatchAnimeCarousel } from './WatchAnimeCarousel';
import { WatchAnimeCarouselSkeleton, WatchRelatedAnimeListSkeleton } from './WatchSkeletons';

type WatchSeasonListProps = {
  seasons?: Season[];
  currentId?: string;
  isLoading?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RELATED_PREVIEW_LIMIT = 5;

export function WatchSeasonList({
  seasons,
  currentId,
  isLoading,
}: WatchSeasonListProps) {
  const items = seasons?.filter(season => season.id) ?? [];

  if (isLoading) {
    return <WatchAnimeCarouselSkeleton title="Seasons" />;
  }

  if (items.length <= 1) {
    return null;
  }

  return (
    <WatchAnimeCarousel
      title="Seasons"
      items={items.map(season => ({
        id: season.id,
        title: season.title,
        image: season.image,
        isActive: season.isActive || season.id === currentId,
      }))}
    />
  );
}

type WatchRelatedAnimeListProps = {
  title?: string;
  anime?: Array<{
    id: string;
    title: string;
    japaneseTitle: string;
    image: string;
    relation: string;
    type: string;
  }>;
  isLoading?: boolean;
};

export function WatchRelatedAnimeList({
  title = 'Related Anime',
  anime,
  isLoading,
}: WatchRelatedAnimeListProps) {
  const navigation = useNavigation<NavigationProp>();
  const [showAll, setShowAll] = useState(false);
  const items = anime?.filter(item => item.id && item.title) ?? [];
  const hasMore = items.length > RELATED_PREVIEW_LIMIT;
  const visibleItems =
    showAll || !hasMore ? items : items.slice(0, RELATED_PREVIEW_LIMIT);

  if (isLoading) {
    return <WatchRelatedAnimeListSkeleton title={title} />;
  }

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {visibleItems.map(item => (
          <Pressable
            key={`${item.id}-${item.relation}`}
            onPress={() => navigation.push('Watch', { id: item.id, episode: 1 })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Image source={{ uri: item.image }} style={styles.poster} />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              {item.japaneseTitle ? (
                <Text style={styles.japaneseTitle} numberOfLines={1}>
                  {item.japaneseTitle}
                </Text>
              ) : null}
              <View style={styles.meta}>
                {item.relation ? (
                  <View style={styles.relationBadge}>
                    <Text style={styles.relationText}>{item.relation}</Text>
                  </View>
                ) : null}
                {item.type ? (
                  <Text style={styles.typeText}>{item.type}</Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      {hasMore ? (
        <Pressable
          onPress={() => setShowAll(current => !current)}
          style={({ pressed }) => [styles.viewAllButton, pressed && styles.pressed]}
        >
          <Text style={styles.viewAllText}>{showAll ? 'Show Less' : 'View All'}</Text>
        </Pressable>
      ) : null}
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
  viewAllButton: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  viewAllText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  poster: {
    width: 56,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    gap: 3,
    paddingVertical: 2,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  japaneseTitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  relationBadge: {
    borderRadius: 6,
    backgroundColor: 'rgba(123, 140, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  relationText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  typeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
