import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCategory } from '../../hooks/useCategory';
import type { TabParamList } from '../../navigation/TabNavigator';
import { colors } from '../../theme';
import { HomeSection } from './HomeSection';
import { LatestEpisodeCarousel } from './LatestEpisodeCarousel';
import { LatestEpisodeSkeleton } from './LatestEpisodeSkeleton';

const PREVIEW_LIMIT = 10;

type CategorySectionProps = {
  params: string;
  fallbackTitle: string;
  categoryTabId: string;
};

export function CategorySection({
  params,
  fallbackTitle,
  categoryTabId,
}: CategorySectionProps) {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const category = useCategory(params);
  const items = (category.data?.anime ?? []).slice(0, PREVIEW_LIMIT);

  const handleSeeAll = () => {
    navigation.navigate('Category', { tabId: categoryTabId });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{fallbackTitle}</Text>
        <Pressable
          onPress={handleSeeAll}
          style={({ pressed }) => [
            styles.seeAll,
            pressed && styles.seeAllPressed,
          ]}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </Pressable>
      </View>

      <HomeSection
        isLoading={category.isLoading}
        isError={category.isError}
        error={category.error}
        data={items}
        emptyMessage="No anime found"
        errorMessage="Failed to load category"
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
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  seeAllPressed: {
    opacity: 0.75,
  },
  seeAllText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
