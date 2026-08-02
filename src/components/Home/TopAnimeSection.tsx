import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TopAnimeResult } from '../../api/top-anime';
import { useTopAnime } from '../../hooks/useTopAnime';
import { colors } from '../../theme';
import { HomeSection } from './HomeSection';
import { TopAnimeCarousel } from './TopAnimeCarousel';
import { TopAnimeSkeleton } from './TopAnimeSkeleton';

type TopAnimePeriod = keyof Pick<TopAnimeResult, 'day' | 'week' | 'month'>;

const TOP_ANIME_PERIOD_OPTIONS: { id: TopAnimePeriod; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export function TopAnimeSection() {
  const [period, setPeriod] = useState<TopAnimePeriod>('day');
  const topAnime = useTopAnime();

  const handlePeriodChange = useCallback((next: TopAnimePeriod) => {
    setPeriod(next);
  }, []);

  const items = topAnime.data?.[period] ?? [];
  const sectionTitle = topAnime.data?.title || 'Top Anime';

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periods}
        style={styles.periodsScroll}
      >
        {TOP_ANIME_PERIOD_OPTIONS.map(option => {
          const isActive = period === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => handlePeriodChange(option.id)}
              style={[styles.period, isActive && styles.periodActive]}
            >
              <Text
                style={[
                  styles.periodText,
                  isActive && styles.periodTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <HomeSection
        isLoading={topAnime.isLoading}
        isError={topAnime.isError}
        error={topAnime.error}
        data={items}
        emptyMessage="No top anime found"
        errorMessage="Failed to load top anime"
        loading={<TopAnimeSkeleton />}
      >
        {data => <TopAnimeCarousel data={data} />}
      </HomeSection>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  periodsScroll: {
    marginBottom: 14,
  },
  periods: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  period: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  periodActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.2)',
  },
  periodText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  periodTextActive: {
    color: colors.accent,
  },
});
