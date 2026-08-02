import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';

const CARD_WIDTH = 108;
const POSTER_HEIGHT = 152;

type WatchAnimeCardProps = {
  id: string;
  title: string;
  image: string;
  badge?: string;
  isActive?: boolean;
  isDimmed?: boolean;
  episode?: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function WatchAnimeCard({
  id,
  title,
  image,
  badge,
  isActive,
  isDimmed,
  episode = 1,
}: WatchAnimeCardProps) {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    if (!id) {
      return;
    }

    navigation.push('Watch', { id, episode });
  };

  return (
    <View style={[styles.card, isDimmed && styles.cardDimmed]}>
      <Pressable
        onPress={handlePress}
        disabled={!id}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View style={[styles.posterWrap, isActive && styles.posterWrapActive]}>
          <Image source={{ uri: image }} style={styles.poster} />
          {isActive ? (
            <>
              <View pointerEvents="none" style={styles.activeRing} />
              <LinearGradient
                colors={['transparent', 'rgba(28, 28, 34, 0.35)', 'rgba(28, 28, 34, 0.92)']}
                locations={[0, 0.45, 1]}
                style={styles.activeOverlay}
                pointerEvents="none"
              />
              <View style={styles.currentBadge}>
                <Ionicons name="play" size={10} color={colors.text} />
                <Text style={styles.currentBadgeText}>Watching</Text>
              </View>
            </>
          ) : null}
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        onPress={handlePress}
        disabled={!id}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {isActive ? (
          <View style={styles.activeTitleRow}>
            <View style={styles.activeDot} />
            <Text style={[styles.title, styles.titleActive]} numberOfLines={2}>
              {title}
            </Text>
          </View>
        ) : (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export const WATCH_ANIME_CARD_WIDTH = CARD_WIDTH;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
  },
  cardDimmed: {
    opacity: 0.48,
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
  posterWrapActive: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  activeRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: colors.accent,
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  currentBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  currentBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    maxWidth: CARD_WIDTH - 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activeTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 5,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    flex: 1,
  },
  titleActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
