import { Pressable, StyleSheet, Text } from 'react-native';
import type { Episode } from '../../api/episode';
import { colors } from '../../theme';

type WatchEpisodeChipProps = {
  item: Episode;
  isActive: boolean;
  isWatched?: boolean;
  onPress: () => void;
};

export function WatchEpisodeChip({
  item,
  isActive,
  isWatched = false,
  onPress,
}: WatchEpisodeChipProps) {
  const isFiller = item.isFiller;
  const showFiller = isFiller && !isActive;
  const showWatched = isWatched && !isActive && !isFiller;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        showFiller && styles.chipFiller,
        showWatched && styles.chipWatched,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          showFiller && styles.chipFillerText,
          showWatched && styles.chipWatchedText,
          isActive && styles.chipTextActive,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {item.episode}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipFiller: {
    backgroundColor: 'rgba(255, 171, 145, 0.16)',
  },
  chipWatched: {
    backgroundColor: 'rgba(123, 140, 255, 0.22)',
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  chipFillerText: {
    color: '#FFAB91',
  },
  chipWatchedText: {
    color: '#A8B4FF',
  },
  chipTextActive: {
    color: colors.text,
  },
});
