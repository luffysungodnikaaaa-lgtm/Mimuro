import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { Episode } from '../../api/episode';
import { colors } from '../../theme';

const PANEL_COLOR = '#222228';

type WatchEpisodeNavProps = {
  episodes?: Episode[];
  activeEpisode?: Episode;
  onEpisodeSelect: (episode: Episode) => void;
  isLoading?: boolean;
  autoNext?: boolean;
  onAutoNextToggle?: () => void;
  onCommentPress?: () => void;
};

export function findAdjacentEpisodes(
  episodes: Episode[] | undefined,
  activeEpisode?: Episode,
) {
  if (!episodes?.length || !activeEpisode) {
    return { prev: undefined, next: undefined };
  }

  const index = episodes.findIndex(
    item => item.episodeId === activeEpisode.episodeId,
  );

  if (index < 0) {
    return { prev: undefined, next: undefined };
  }

  return {
    prev: index > 0 ? episodes[index - 1] : undefined,
    next: index < episodes.length - 1 ? episodes[index + 1] : undefined,
  };
}

export function WatchEpisodeNav({
  episodes,
  activeEpisode,
  onEpisodeSelect,
  isLoading,
  autoNext = false,
  onAutoNextToggle,
  onCommentPress,
}: WatchEpisodeNavProps) {
  const { prev, next } = findAdjacentEpisodes(episodes, activeEpisode);

  if ((isLoading && !episodes?.length) || !episodes?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={onAutoNextToggle}
          style={({ pressed }) => [
            styles.autoNextButton,
            autoNext && styles.actionButtonActive,
            pressed && styles.pressed,
          ]}
          accessibilityRole="switch"
          accessibilityState={{ checked: autoNext }}
          accessibilityLabel="Auto next episode"
        >
          <Ionicons
            name="play-skip-forward"
            size={16}
            color={autoNext ? colors.accent : colors.textMuted}
            style={styles.autoNextIcon}
          />
          <Text
            style={[
              styles.actionText,
              autoNext && styles.actionTextActive,
            ]}
          >
            Auto Next
          </Text>
        </Pressable>

        <Pressable
          onPress={onCommentPress}
          style={({ pressed }) => [
            styles.commentButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open comments"
        >
          <Ionicons name="chatbubble-ellipses" size={16} color={colors.textMuted} />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={() => prev && onEpisodeSelect(prev)}
          disabled={!prev}
          style={({ pressed }) => [
            styles.navButton,
            !prev && styles.buttonDisabled,
            pressed && !!prev && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={prev ? colors.text : colors.textMuted}
          />
          <Text
            style={[styles.navButtonText, !prev && styles.buttonTextDisabled]}
            numberOfLines={1}
          >
            {prev ? `Prev Episode ${prev.episode}` : 'Prev Episode'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => next && onEpisodeSelect(next)}
          disabled={!next}
          style={({ pressed }) => [
            styles.navButton,
            !next && styles.buttonDisabled,
            pressed && !!next && styles.pressed,
          ]}
        >
          <Text
            style={[styles.navButtonText, !next && styles.buttonTextDisabled]}
            numberOfLines={1}
          >
            {next ? `Next Episode ${next.episode}` : 'Next Episode'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={next ? colors.text : colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

export function WatchEpisodeNavSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.autoNextButton, styles.skeleton]} />
        <View style={[styles.commentButton, styles.skeleton]} />
      </View>
      <View style={styles.row}>
        <View style={[styles.navButton, styles.skeleton]} />
        <View style={[styles.navButton, styles.skeleton]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    backgroundColor: PANEL_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  autoNextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3a3a44',
    // Icon glyphs include extra left whitespace; tighten left so sides look even.
    paddingLeft: 10,
    paddingRight: 14,
    alignSelf: 'flex-start',
  },
  autoNextIcon: {
    marginLeft: -1,
  },
  commentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3a3a44',
    paddingHorizontal: 12,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.15)',
  },
  actionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  actionTextActive: {
    color: colors.accent,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3a3a44',
    paddingHorizontal: 10,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
  navButtonText: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  skeleton: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
});
