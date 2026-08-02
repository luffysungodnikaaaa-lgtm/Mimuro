import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { AnimeInfo } from '../../api/info';
import type { ReminderMode } from '../../lib/scheduleReminders';
import { colors } from '../../theme';
import { WatchAnimeInfoSkeleton } from './WatchSkeletons';

const SYNOPSIS_MAX_LINES = 4;

type SynopsisReadMoreProps = {
  text: string;
};

function SynopsisReadMore({ text }: SynopsisReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setIsTruncated(false);
  }, [text]);

  return (
    <View style={styles.synopsisSection}>
      <Text style={styles.sectionLabel}>Synopsis</Text>
      <Text
        style={styles.hiddenSynopsis}
        onTextLayout={event => {
          setIsTruncated(event.nativeEvent.lines.length > SYNOPSIS_MAX_LINES);
        }}
      >
        {text}
      </Text>
      <Text
        style={styles.synopsis}
        numberOfLines={expanded ? undefined : SYNOPSIS_MAX_LINES}
      >
        {text}
      </Text>
      {isTruncated ? (
        <Pressable
          onPress={() => setExpanded(current => !current)}
          style={({ pressed }) => [styles.readMoreButton, pressed && styles.readMorePressed]}
        >
          <Text style={styles.readMoreText}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type WatchAnimeInfoProps = {
  info?: AnimeInfo | null;
  isLoading?: boolean;
  isReminded?: boolean;
  reminderMode?: ReminderMode;
  onToggleReminder?: () => void;
};

type MetaRow = {
  label: string;
  value: string;
};

function buildMetaRows(info: AnimeInfo): MetaRow[] {
  const rows: MetaRow[] = [];

  if (info.type) {
    rows.push({ label: 'Type', value: info.type });
  }
  if (info.status) {
    rows.push({ label: 'Status', value: info.status });
  }
  if (info.aired) {
    rows.push({ label: 'Aired', value: info.aired });
  }
  if (info.premiered) {
    rows.push({ label: 'Premiered', value: info.premiered });
  }
  if (info.duration) {
    rows.push({ label: 'Duration', value: info.duration });
  }
  if (info.totalEpisodes != null) {
    rows.push({ label: 'Episodes', value: String(info.totalEpisodes) });
  }
  if (info.malRating != null) {
    rows.push({ label: 'MAL', value: info.malRating.toFixed(2) });
  }
  if (info.studios.length) {
    rows.push({ label: 'Studios', value: info.studios.join(', ') });
  }
  if (info.producers.length) {
    rows.push({ label: 'Producers', value: info.producers.join(', ') });
  }

  return rows;
}

export function WatchAnimeInfo({
  info,
  isLoading,
  isReminded = false,
  reminderMode,
  onToggleReminder,
}: WatchAnimeInfoProps) {
  if (isLoading && !info) {
    return <WatchAnimeInfoSkeleton />;
  }

  if (!info) {
    return null;
  }

  const metaRows = buildMetaRows(info);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        {info.image ? (
          <View style={styles.posterWrap}>
            <Image source={{ uri: info.image }} style={styles.poster} />
            {info.type ? (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText} numberOfLines={1}>
                  {info.type}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.heroContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{info.title}</Text>
            {onToggleReminder ? (
              <Pressable
                onPress={onToggleReminder}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.remindButton,
                  isReminded && styles.remindButtonActive,
                  pressed && styles.remindPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isReminded ? 'Turn off reminder' : 'Set reminder'
                }
              >
                <Ionicons
                  name={isReminded ? 'notifications' : 'notifications-outline'}
                  size={18}
                  color={isReminded ? colors.accent : colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>
          {isReminded && reminderMode ? (
            <Text style={styles.remindHint}>
              {reminderMode === 'always'
                ? 'Reminding every release'
                : 'Reminding next airing'}
            </Text>
          ) : null}
          {info.japaneseTitle ? (
            <Text style={styles.japaneseTitle} numberOfLines={2}>
              {info.japaneseTitle}
            </Text>
          ) : null}
          {info.altNames ? (
            <Text style={styles.altNames} numberOfLines={2}>
              {info.altNames}
            </Text>
          ) : null}

          <View style={styles.badges}>
            {info.quality ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{info.quality}</Text>
              </View>
            ) : null}
            {info.hasSub ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SUB</Text>
              </View>
            ) : null}
            {info.hasDub ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>DUB</Text>
              </View>
            ) : null}
            {info.rating ? (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {info.rating}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {info.genres.length ? (
        <View style={styles.genres}>
          {info.genres.map(genre => (
            <View key={genre} style={styles.genreChip}>
              <Text style={styles.genreChipText}>{genre}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {metaRows.length ? (
        <View style={styles.metaCard}>
          {metaRows.map(row => (
            <View key={row.label} style={styles.metaRow}>
              <Text style={styles.metaLabel}>{row.label}</Text>
              <Text style={styles.metaValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {info.synopsis ? <SynopsisReadMore text={info.synopsis} /> : null}
    </View>
  );
}

const POSTER_WIDTH = 96;
const POSTER_HEIGHT = 136;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  hero: {
    flexDirection: 'row',
    gap: 14,
  },
  posterWrap: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  remindButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 2,
  },
  remindButtonActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.18)',
  },
  remindPressed: {
    opacity: 0.85,
  },
  remindHint: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  heroContent: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  japaneseTitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  altNames: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    borderRadius: 6,
    backgroundColor: 'rgba(123, 140, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
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
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  genreChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaLabel: {
    width: 84,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  synopsisSection: {
    gap: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  synopsis: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  hiddenSynopsis: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    width: '100%',
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  readMorePressed: {
    opacity: 0.85,
  },
  readMoreText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
