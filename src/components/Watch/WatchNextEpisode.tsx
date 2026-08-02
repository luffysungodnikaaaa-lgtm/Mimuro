import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NextEpisode } from '../../api/info';
import { colors } from '../../theme';

type WatchNextEpisodeProps = {
  nextEpisode?: NextEpisode;
};

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return 'soon';
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? '' : 's'}`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }
  parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);

  return parts.join(', ');
}

function getRemainingSeconds(at: number) {
  return Math.max(0, at - Math.floor(Date.now() / 1000));
}

export function WatchNextEpisode({ nextEpisode }: WatchNextEpisodeProps) {
  const at = nextEpisode?.at;
  const [remaining, setRemaining] = useState(() =>
    at != null ? getRemainingSeconds(at) : 0,
  );

  useEffect(() => {
    if (at == null) {
      return undefined;
    }

    setRemaining(getRemainingSeconds(at));
    const timer = setInterval(() => {
      setRemaining(getRemainingSeconds(at));
    }, 1000);

    return () => clearInterval(timer);
  }, [at]);

  if (!nextEpisode?.predictedAt) {
    return null;
  }

  const countdown =
    at != null ? ` (${formatCountdown(remaining)})` : '';

  return (
    <View style={styles.alert}>
      <Ionicons
        name="notifications-outline"
        size={16}
        color={colors.accent}
        style={styles.icon}
      />
      <Text style={styles.text}>
        The next episode is predicted to arrive on{' '}
        <Text style={styles.emphasis}>{nextEpisode.predictedAt}</Text>
        {countdown}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(123, 140, 255, 0.12)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(123, 140, 255, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  emphasis: {
    color: colors.text,
    fontWeight: '600',
  },
});
