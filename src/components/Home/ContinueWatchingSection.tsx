import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContinueWatching } from '../../hooks/useContinueWatching';
import type { RootStackParamList } from '../../navigation/StackNavigator';
import { colors } from '../../theme';
import { HomeSection } from './HomeSection';
import { LatestEpisodeCarousel } from './LatestEpisodeCarousel';
import { LatestEpisodeSkeleton } from './LatestEpisodeSkeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ContinueWatchingSection() {
  const navigation = useNavigation<NavigationProp>();
  const { items, isLoading, removeItem } = useContinueWatching();

  if (!isLoading && !items.length) {
    return null;
  }

  const preview = items.map(item => ({
    id: item.id,
    title: item.title,
    japaneseTitle: '',
    image: item.image,
    episode: item.episode,
    type: item.type ?? '',
    totalEpisodes: item.totalEpisodes,
  }));

  const handleSeeAll = () => {
    navigation.navigate('ContinueWatching');
  };

  const handleRemove = (id: string) => {
    void removeItem(id);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Continue Watching</Text>
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
        isLoading={isLoading}
        isError={false}
        error={null}
        data={preview}
        emptyMessage="No continue watching yet"
        errorMessage="Failed to load continue watching"
        loading={<LatestEpisodeSkeleton />}
      >
        {sectionData => (
          <LatestEpisodeCarousel
            data={sectionData}
            onRemove={handleRemove}
            onViewMore={handleSeeAll}
          />
        )}
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
