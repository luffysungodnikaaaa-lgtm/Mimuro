import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { ScheduleAnime } from '../../api/schedule';
import type { ReminderMode } from '../../lib/scheduleReminders';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';

type ScheduleItemProps = {
  item: ScheduleAnime;
  isLast?: boolean;
  isReminded?: boolean;
  reminderMode?: ReminderMode;
  onToggleReminder?: (item: ScheduleAnime) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getStatusLabel(item: ScheduleAnime) {
  if (item.airing) {
    return 'Airing';
  }
  if (item.next) {
    return 'Up next';
  }
  if (item.passed) {
    return 'Aired';
  }
  return null;
}

export function ScheduleItem({
  item,
  isLast,
  isReminded = false,
  reminderMode,
  onToggleReminder,
}: ScheduleItemProps) {
  const navigation = useNavigation<NavigationProp>();
  const status = getStatusLabel(item);
  const genres = item.genres
    .slice(0, 2)
    .map(genre => genre.name)
    .join(' · ');

  const handlePress = () => {
    if (!item.id) {
      return;
    }

    navigation.push('Watch', {
      id: item.id,
      episode: item.episode > 0 ? item.episode : 1,
    });
  };

  const handleReminderPress = () => {
    onToggleReminder?.(item);
  };

  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            item.airing && styles.dotAiring,
            item.next && styles.dotNext,
            item.passed && styles.dotPassed,
          ]}
        />
        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={styles.timeColumn}>
        <Text
          style={[
            styles.time,
            item.passed && styles.timePassed,
            (item.airing || item.next) && styles.timeActive,
          ]}
        >
          {item.time || '--:--'}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          item.next && styles.cardNext,
          item.passed && styles.cardPassed,
        ]}
      >
        <Pressable
          onPress={handlePress}
          disabled={!item.id}
          style={({ pressed }) => [
            styles.cardPressable,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.posterWrap}>
            {item.poster ? (
              <Image source={{ uri: item.poster }} style={styles.poster} />
            ) : (
              <View style={styles.posterFallback} />
            )}
            {item.episode > 0 ? (
              <View style={styles.episodeBadge}>
                <Text style={styles.episodeBadgeText}>EP {item.episode}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, item.passed && styles.titlePassed]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {status ? (
                <View
                  style={[
                    styles.statusBadge,
                    item.airing && styles.statusAiring,
                    item.next && styles.statusNext,
                    item.passed && styles.statusPassed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.airing && styles.statusTextAiring,
                      item.next && styles.statusTextNext,
                      item.passed && styles.statusTextPassed,
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              ) : null}
            </View>
            {isReminded && reminderMode ? (
              <Text style={styles.remindHint}>
                {reminderMode === 'always'
                  ? 'Reminding every release'
                  : 'Reminding this airing'}
              </Text>
            ) : null}

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

            {item.synopsis ? (
              <Text style={styles.synopsis} numberOfLines={2}>
                {item.synopsis}
              </Text>
            ) : null}
          </View>
        </Pressable>

        {onToggleReminder ? (
          <Pressable
            onPress={handleReminderPress}
            hitSlop={8}
            style={({ pressed }) => [
              styles.remindButton,
              isReminded && styles.remindButtonActive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isReminded ? 'Turn off reminder' : 'Set reminder'
            }
          >
            <Ionicons
              name={isReminded ? 'notifications' : 'notifications-outline'}
              size={16}
              color={isReminded ? colors.accent : colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const POSTER_WIDTH = 68;
const POSTER_HEIGHT = 96;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  timeline: {
    width: 14,
    alignItems: 'center',
    paddingTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotAiring: {
    backgroundColor: '#4ADE80',
  },
  dotNext: {
    backgroundColor: colors.accent,
  },
  dotPassed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  line: {
    flex: 1,
    width: 1,
    marginTop: 6,
    backgroundColor: colors.border,
  },
  timeColumn: {
    width: 64,
    paddingTop: 14,
    paddingRight: 8,
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  timeActive: {
    color: colors.accent,
  },
  timePassed: {
    color: 'rgba(160, 160, 168, 0.7)',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardPressable: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  cardNext: {
    borderColor: 'rgba(123, 140, 255, 0.35)',
    backgroundColor: 'rgba(123, 140, 255, 0.08)',
  },
  cardPassed: {
    opacity: 0.72,
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
  posterFallback: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 3,
    paddingVertical: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  titlePassed: {
    color: colors.textMuted,
  },
  remindButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  remindButtonActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.18)',
  },
  remindHint: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusAiring: {
    backgroundColor: 'rgba(74, 222, 128, 0.16)',
  },
  statusNext: {
    backgroundColor: 'rgba(123, 140, 255, 0.18)',
  },
  statusPassed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextAiring: {
    color: '#4ADE80',
  },
  statusTextNext: {
    color: colors.accent,
  },
  statusTextPassed: {
    color: colors.textMuted,
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
    marginTop: 1,
  },
  synopsis: {
    color: 'rgba(160, 160, 168, 0.9)',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
});
