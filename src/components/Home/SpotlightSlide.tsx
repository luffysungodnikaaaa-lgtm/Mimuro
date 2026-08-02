import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { SpotlightAnime } from '../../api/spotlight';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors, getContentWidth } from '../../theme';

export const SPOTLIGHT_HEIGHT = 420;
const TRANSPARENT_BACKGROUND = 'rgba(28, 28, 34, 0)';

type SpotlightSlideProps = {
  item: SpotlightAnime;
};

type SpotlightNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SpotlightSlide({ item }: SpotlightSlideProps) {
  const navigation = useNavigation<SpotlightNavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = getContentWidth(windowWidth);

  const handleWatchPress = () => {
    if (!item.id) {
      return;
    }

    navigation.push('Watch', { id: item.id, episode: 1 });
  };

  return (
    <View style={[styles.slide, { width: contentWidth }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <LinearGradient
        colors={[
          TRANSPARENT_BACKGROUND,
          TRANSPARENT_BACKGROUND,
          'rgba(28, 28, 34, 0.72)',
          colors.background,
        ]}
        locations={[0, 0.15, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={[styles.overlay, { width: contentWidth }]}
      />
      <View style={styles.content}>
        <View style={styles.badges}>
          {item.quality ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.quality}</Text>
            </View>
          ) : null}
          {item.hasSub ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SUB</Text>
            </View>
          ) : null}
          {item.hasDub ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DUB</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.japaneseTitle ? (
          <Text style={styles.japaneseTitle} numberOfLines={1}>
            {item.japaneseTitle}
          </Text>
        ) : null}
        {item.synopsis ? (
          <Text style={styles.synopsis} numberOfLines={3}>
            {item.synopsis}
          </Text>
        ) : null}
        {item.id ? (
          <Pressable
            onPress={handleWatchPress}
            style={({ pressed }) => [
              styles.watchButton,
              pressed && styles.watchButtonPressed,
            ]}
          >
            <Ionicons name="play" size={16} color={colors.text} />
            <Text style={styles.watchButtonText}>Watch Now</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: SPOTLIGHT_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: SPOTLIGHT_HEIGHT,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: 'rgba(123, 140, 255, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  japaneseTitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  synopsis: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  watchButtonPressed: {
    opacity: 0.85,
  },
  watchButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
