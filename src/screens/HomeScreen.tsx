import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { CategorySection } from '../components/Home/CategorySection';
import { ContinueWatchingSection } from '../components/Home/ContinueWatchingSection';
import { DiscordInviteBanner } from '../components/Home/DiscordInviteBanner';
import { HomeSection } from '../components/Home/HomeSection';
import { LatestEpisodeSection } from '../components/Home/LatestEpisodeSection';
import { ShareAppBanner } from '../components/Home/ShareAppBanner';
import { SpotlightCarousel } from '../components/Home/SpotlightCarousel';
import { SpotlightSkeleton } from '../components/Home/SpotlightSkeleton';
import { TopAnimeSection } from '../components/Home/TopAnimeSection';
import { categoryQueryKey } from '../hooks/useCategory';
import { latestEpisodeQueryKey } from '../hooks/useLatestEpisode';
import { useSpotlight, spotlightQueryKey } from '../hooks/useSpotlight';
import { topAnimeQueryKey } from '../hooks/useTopAnime';
import { colors } from '../theme';

const HOME_CATEGORY_PARAMS = [
  '/new-release',
  '/status/not-yet-aired',
] as const;

export function HomeScreen() {
  const spotlight = useSpotlight();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: spotlightQueryKey }),
        queryClient.invalidateQueries({ queryKey: latestEpisodeQueryKey }),
        queryClient.invalidateQueries({ queryKey: topAnimeQueryKey }),
        ...HOME_CATEGORY_PARAMS.map(params =>
          queryClient.invalidateQueries({
            queryKey: [...categoryQueryKey, params],
          }),
        ),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <HomeSection
        isLoading={spotlight.isLoading}
        isError={spotlight.isError}
        error={spotlight.error}
        data={spotlight.data}
        emptyMessage="No spotlight anime found"
        errorMessage="Failed to load spotlight"
        loading={<SpotlightSkeleton />}
      >
        {data => <SpotlightCarousel data={data} />}
      </HomeSection>

      <DiscordInviteBanner />
      <ShareAppBanner />

      <ContinueWatchingSection />

      <LatestEpisodeSection />

      <TopAnimeSection />

      <CategorySection
        params={HOME_CATEGORY_PARAMS[0]}
        fallbackTitle="Recently Added"
        categoryTabId="added"
      />

      <CategorySection
        params={HOME_CATEGORY_PARAMS[1]}
        fallbackTitle="Upcoming"
        categoryTabId="upcoming"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
  },
});
