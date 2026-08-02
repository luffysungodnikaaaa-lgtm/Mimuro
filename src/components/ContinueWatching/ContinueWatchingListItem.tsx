import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ContinueWatchingItem } from '../../lib/continueWatching';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';

type ContinueWatchingListItemProps = {
  item: ContinueWatchingItem;
  onRemove?: (id: string) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ContinueWatchingListItem({
  item,
  onRemove,
}: ContinueWatchingListItemProps) {
  const navigation = useNavigation<NavigationProp>();

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
        {item.episode > 0 ? (
          <View style={styles.episodeBadge}>
            <Text style={styles.episodeBadgeText}>EP {item.episode}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Continue from EP {item.episode}
        </Text>
        <View style={styles.metaRow}>
          {item.type ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{item.type}</Text>
            </View>
          ) : null}
          {item.totalEpisodes != null ? (
            <View style={styles.metaBadgeMuted}>
              <Text style={styles.metaBadgeMutedText}>
                {item.totalEpisodes} eps
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {onRemove ? (
        <Pressable
          onPress={handleRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.title} from continue watching`}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
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
  content: {
    flex: 1,
    gap: 4,
    paddingVertical: 2,
    justifyContent: 'flex-start',
    paddingRight: 28,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  removeButtonPressed: {
    opacity: 0.7,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
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
  metaBadgeMuted: {
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaBadgeMutedText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
