import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LatestEpisodeAnime } from '../../api/latest-episode';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';

const CARD_WIDTH = 120;
const POSTER_HEIGHT = 168;

type LatestEpisodeCardProps = {
  item: LatestEpisodeAnime;
  onRemove?: (id: string) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LatestEpisodeCard({ item, onRemove }: LatestEpisodeCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const hasMeta =
    item.subEpisode != null ||
    item.dubEpisode != null ||
    item.totalEpisodes != null;

  const handlePress = () => {
    if (!item.id) {
      return;
    }

    navigation.push('Watch', { id: item.id, episode: item.episode || 1 });
  };

  const handleRemove = () => {
    if (!item.id || !onRemove) {
      return;
    }

    onRemove(item.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.posterWrap}>
        <Pressable
          onPress={handlePress}
          disabled={!item.id}
          style={({ pressed }) => [styles.posterPressable, pressed && styles.pressed]}
        >
          <Image source={{ uri: item.image }} style={styles.poster} />
          {item.type ? (
            <View
              style={[
                styles.typeBadge,
                onRemove ? styles.typeBadgeWithRemove : styles.typeBadgeDefault,
              ]}
            >
              <Text style={styles.typeBadgeText} numberOfLines={1}>
                {item.type}
              </Text>
            </View>
          ) : null}
          {item.episode > 0 ? (
            <View style={styles.episodeBadge}>
              <Text style={styles.episodeBadgeText}>EP {item.episode}</Text>
            </View>
          ) : null}
        </Pressable>
        {onRemove ? (
          <Pressable
            onPress={handleRemove}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title} from continue watching`}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.removeButtonPressed,
            ]}
          >
            <Ionicons name="close" size={14} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
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
          {item.totalEpisodes != null ? (
            <Text style={styles.metaTextMuted}>{item.totalEpisodes}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const LATEST_EPISODE_CARD_WIDTH = CARD_WIDTH;
export const LATEST_EPISODE_POSTER_HEIGHT = POSTER_HEIGHT;

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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  posterPressable: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    zIndex: 2,
  },
  removeButtonPressed: {
    opacity: 0.75,
  },
  episodeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  episodeBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeDefault: {
    right: 6,
    maxWidth: CARD_WIDTH - 12,
  },
  typeBadgeWithRemove: {
    left: 6,
    maxWidth: CARD_WIDTH - 40,
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
  metaTextMuted: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
});
