import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CategoryAnime } from '../../api/category';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';

type SearchResultItemProps = {
  item: CategoryAnime;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SearchResultItem({ item }: SearchResultItemProps) {
  const navigation = useNavigation<NavigationProp>();
  const genres = item.genres.slice(0, 3).join(' · ');

  const handlePress = () => {
    if (!item.id) {
      return;
    }

    navigation.push('Watch', { id: item.id, episode: 1 });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!item.id}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.posterWrap}>
        <Image source={{ uri: item.image }} style={styles.poster} />
        {item.type ? (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText} numberOfLines={1}>
              {item.type}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.japaneseTitle ? (
          <Text style={styles.japaneseTitle} numberOfLines={1}>
            {item.japaneseTitle}
          </Text>
        ) : null}
        {genres ? (
          <Text style={styles.genres} numberOfLines={1}>
            {genres}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {item.subEpisode != null ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>SUB {item.subEpisode}</Text>
            </View>
          ) : null}
          {item.dubEpisode != null ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>DUB {item.dubEpisode}</Text>
            </View>
          ) : null}
          {item.rating != null ? (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {item.rating.toFixed(2)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const POSTER_WIDTH = 76;
const POSTER_HEIGHT = 108;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  posterWrap: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    maxWidth: POSTER_WIDTH - 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: 4,
    paddingVertical: 2,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  japaneseTitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  genres: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  metaBadge: {
    borderRadius: 6,
    backgroundColor: 'rgba(123, 140, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  ratingBadge: {
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
});
