import { StyleSheet, Text, View } from 'react-native';
import type { Episode } from '../../api/episode';
import { colors } from '../../theme';

type WatchActiveEpisodeCardProps = {
  episode: Episode;
};

export function WatchActiveEpisodeCard({ episode }: WatchActiveEpisodeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Episode {episode.episode}</Text>
      {episode.title ? (
        <Text style={styles.title} numberOfLines={2}>
          {episode.title}
        </Text>
      ) : null}
      <View style={styles.meta}>
        {episode.hasSub ? (
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>SUB</Text>
          </View>
        ) : null}
        {episode.hasDub ? (
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>DUB</Text>
          </View>
        ) : null}
        {episode.isFiller ? (
          <View style={styles.fillerBadge}>
            <Text style={styles.fillerBadgeText}>FILLER</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  fillerBadge: {
    borderRadius: 6,
    backgroundColor: 'rgba(255, 171, 145, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  fillerBadgeText: {
    color: '#FFAB91',
    fontSize: 10,
    fontWeight: '700',
  },
});
