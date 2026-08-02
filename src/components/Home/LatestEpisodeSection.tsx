import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import {
  LATEST_EPISODE_CATEGORY_OPTIONS,
  type LatestEpisodeCategory,
} from '../../api/latest-episode';
import { useLatestEpisode } from '../../hooks/useLatestEpisode';
import { colors } from '../../theme';
import { HomeSection } from './HomeSection';
import { LatestEpisodeCarousel } from './LatestEpisodeCarousel';
import { LatestEpisodeSkeleton } from './LatestEpisodeSkeleton';

export function LatestEpisodeSection() {
  const [category, setCategory] = useState<LatestEpisodeCategory>('all');
  const [page, setPage] = useState(1);

  const latestEpisode = useLatestEpisode(category, page);

  const handleCategoryChange = useCallback((next: LatestEpisodeCategory) => {
    setCategory(next);
    setPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage(current => Math.max(1, current - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(current => current + 1);
  }, []);

  const canGoPrevious = page > 1;
  const canGoNext = !latestEpisode.isLoading && !!latestEpisode.data?.length;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Episodes</Text>
        <View style={styles.pagination}>
          <Pressable
            onPress={handlePreviousPage}
            disabled={!canGoPrevious || latestEpisode.isLoading}
            style={[
              styles.pageButton,
              (!canGoPrevious || latestEpisode.isLoading) &&
                styles.pageButtonDisabled,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={
                canGoPrevious && !latestEpisode.isLoading
                  ? colors.text
                  : colors.textMuted
              }
            />
          </Pressable>
          <Pressable
            onPress={handleNextPage}
            disabled={!canGoNext}
            style={[styles.pageButton, !canGoNext && styles.pageButtonDisabled]}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={canGoNext ? colors.text : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoriesScroll}
      >
        {LATEST_EPISODE_CATEGORY_OPTIONS.map(option => {
          const isActive = category === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => handleCategoryChange(option.id)}
              style={[styles.category, isActive && styles.categoryActive]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <HomeSection
        isLoading={latestEpisode.isLoading}
        isError={latestEpisode.isError}
        error={latestEpisode.error}
        data={latestEpisode.data}
        emptyMessage="No latest episodes found"
        errorMessage="Failed to load latest episodes"
        loading={<LatestEpisodeSkeleton />}
      >
        {data => <LatestEpisodeCarousel data={data} />}
      </HomeSection>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  categoriesScroll: {
    marginBottom: 14,
  },
  categories: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  category: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  categoryActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.2)',
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.accent,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
});
