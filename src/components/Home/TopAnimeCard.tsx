import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TopAnimeItem } from '../../api/top-anime';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';

const CARD_WIDTH = 128;
const POSTER_HEIGHT = 176;

type TopAnimeCardProps = {
  item: TopAnimeItem;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getRankStyle(rank: number) {
  if (rank === 1) {
    return { badge: styles.rankGold, text: styles.rankGoldText };
  }
  if (rank === 2) {
    return { badge: styles.rankSilver, text: styles.rankSilverText };
  }
  if (rank === 3) {
    return { badge: styles.rankBronze, text: styles.rankBronzeText };
  }
  return { badge: styles.rankDefault, text: styles.rankDefaultText };
}

export function TopAnimeCard({ item }: TopAnimeCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const rankStyle = getRankStyle(item.rank);
  const hasMeta = item.subEpisode != null || item.dubEpisode != null;

  const handlePress = () => {
    if (!item.id) {
      return;
    }

    navigation.push('Watch', { id: item.id, episode: 1 });
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={handlePress}
        disabled={!item.id}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View style={styles.posterWrap}>
          <Image source={{ uri: item.image }} style={styles.poster} />
          <View style={[styles.rankBadge, rankStyle.badge]}>
            <Text style={[styles.rankText, rankStyle.text]}>#{item.rank}</Text>
          </View>
          {item.type ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText} numberOfLines={1}>
                {item.type}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        onPress={handlePress}
        disabled={!item.id}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </Pressable>
      {hasMeta ? (
        <View style={styles.meta}>
          {item.subEpisode != null ? (
            <Text style={styles.metaText}>SUB {item.subEpisode}</Text>
          ) : null}
          {item.dubEpisode != null ? (
            <Text style={styles.metaText}>DUB {item.dubEpisode}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const TOP_ANIME_CARD_WIDTH = CARD_WIDTH;
export const TOP_ANIME_POSTER_HEIGHT = POSTER_HEIGHT;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
  },
  pressed: {
    opacity: 0.85,
  },
  posterWrap: {
    width: CARD_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    minWidth: 30,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rankGold: {
    backgroundColor: '#FFD54F',
  },
  rankGoldText: {
    color: '#1c1c22',
  },
  rankSilver: {
    backgroundColor: '#CFD8DC',
  },
  rankSilverText: {
    color: '#1c1c22',
  },
  rankBronze: {
    backgroundColor: '#FFAB91',
  },
  rankBronzeText: {
    color: '#1c1c22',
  },
  rankDefault: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  rankDefaultText: {
    color: colors.text,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    maxWidth: CARD_WIDTH - 52,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
});
