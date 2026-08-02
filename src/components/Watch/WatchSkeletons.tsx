import { Fragment } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import { WATCH_ANIME_CARD_WIDTH } from './WatchAnimeCard';
import { WatchBackButton } from './WatchBackButton';
import { WatchEpisodeNavSkeleton } from './WatchEpisodeNav';
import { colors } from '../../theme';

const PANEL_COLOR = '#222228';
const POSTER_WIDTH = 96;
const POSTER_HEIGHT = 136;
const ANIME_CARD_HEIGHT = 152;
const EPISODE_CHIP_SIZE = 48;
const RELATED_POSTER_WIDTH = 56;
const RELATED_POSTER_HEIGHT = 80;

function ServerRowSkeleton({ chipWidths }: { chipWidths: number[] }) {
  return (
    <View style={styles.serverRow}>
      <SkeletonBox width={44} height={12} borderRadius={4} />
      <View style={styles.serverChips}>
        {chipWidths.map((width, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={styles.serverChipGap} /> : null}
            <SkeletonBox width={width} height={36} borderRadius={10} />
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export function WatchServerListSkeleton({ embedded = false }: { embedded?: boolean }) {
  return (
    <View style={embedded ? styles.serverPanelEmbedded : styles.serverPanel}>
      <SkeletonBox width="92%" height={17} borderRadius={4} />
      <ServerRowSkeleton chipWidths={[72, 88, 64]} />
      <ServerRowSkeleton chipWidths={[80, 72]} />
      <ServerRowSkeleton chipWidths={[68, 92, 76]} />
    </View>
  );
}

export function WatchEpisodeListSkeleton() {
  return (
    <View style={styles.episodeSection}>
      <View style={styles.episodeHeader}>
        <Text style={styles.episodeTitle}>Episodes</Text>
        <SkeletonBox width={24} height={24} borderRadius={8} />
      </View>
      <View style={styles.episodeChips}>
        {Array.from({ length: 6 }, (_, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={styles.episodeChipGap} /> : null}
            <SkeletonBox
              width={EPISODE_CHIP_SIZE}
              height={EPISODE_CHIP_SIZE}
              borderRadius={12}
            />
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export function WatchAnimeInfoSkeleton() {
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoHero}>
        <SkeletonBox width={POSTER_WIDTH} height={POSTER_HEIGHT} borderRadius={12} />
        <View style={styles.infoHeroContent}>
          <SkeletonBox width="100%" height={22} borderRadius={4} />
          <SkeletonBox width="85%" height={22} borderRadius={4} />
          <SkeletonBox width="70%" height={14} borderRadius={4} />
          <SkeletonBox width="55%" height={12} borderRadius={4} />
          <View style={styles.infoBadges}>
            <SkeletonBox width={36} height={18} borderRadius={6} />
            <SkeletonBox width={34} height={18} borderRadius={6} />
            <SkeletonBox width={34} height={18} borderRadius={6} />
            <SkeletonBox width={48} height={18} borderRadius={6} />
          </View>
        </View>
      </View>

      <View style={styles.genreRow}>
        <SkeletonBox width={64} height={28} borderRadius={999} />
        <SkeletonBox width={72} height={28} borderRadius={999} />
        <SkeletonBox width={58} height={28} borderRadius={999} />
        <SkeletonBox width={80} height={28} borderRadius={999} />
      </View>

      <View style={styles.metaCard}>
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} style={styles.metaRow}>
            <SkeletonBox width={84} height={12} borderRadius={4} />
            <SkeletonBox width={`${55 + (index % 3) * 10}%`} height={12} borderRadius={4} />
          </View>
        ))}
      </View>

      <View style={styles.synopsisSection}>
        <SkeletonBox width={72} height={11} borderRadius={4} />
        <SkeletonBox width="100%" height={14} borderRadius={4} />
        <SkeletonBox width="100%" height={14} borderRadius={4} />
        <SkeletonBox width="88%" height={14} borderRadius={4} />
        <SkeletonBox width="72%" height={14} borderRadius={4} />
      </View>
    </View>
  );
}

export function WatchActiveEpisodeCardSkeleton() {
  return (
    <View style={styles.activeEpisodeCard}>
      <SkeletonBox width={108} height={11} borderRadius={4} />
      <SkeletonBox width="100%" height={16} borderRadius={4} />
      <SkeletonBox width="78%" height={16} borderRadius={4} />
      <View style={styles.infoBadges}>
        <SkeletonBox width={38} height={18} borderRadius={6} />
        <SkeletonBox width={38} height={18} borderRadius={6} />
      </View>
    </View>
  );
}

function WatchAnimeCardSkeleton() {
  return (
    <View style={styles.animeCard}>
      <SkeletonBox
        width={WATCH_ANIME_CARD_WIDTH}
        height={ANIME_CARD_HEIGHT}
        borderRadius={8}
      />
      <SkeletonBox
        width={WATCH_ANIME_CARD_WIDTH}
        height={14}
        borderRadius={4}
        style={styles.animeCardTitle}
      />
      <SkeletonBox
        width={WATCH_ANIME_CARD_WIDTH * 0.75}
        height={14}
        borderRadius={4}
      />
    </View>
  );
}

export function WatchAnimeCarouselSkeleton({
  title,
  titleWidth = 120,
}: {
  title?: string;
  titleWidth?: number;
}) {
  return (
    <View style={styles.carouselSection}>
      {title ? (
        <Text style={styles.carouselTitleText}>{title}</Text>
      ) : (
        <SkeletonBox
          width={titleWidth}
          height={20}
          borderRadius={4}
          style={styles.carouselTitle}
        />
      )}
      <View style={styles.carouselRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={styles.carouselGap} /> : null}
            <WatchAnimeCardSkeleton />
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export function WatchRelatedAnimeListSkeleton({ title }: { title?: string }) {
  return (
    <View style={styles.carouselSection}>
      {title ? (
        <Text style={styles.carouselTitleText}>{title}</Text>
      ) : (
        <SkeletonBox width={140} height={20} borderRadius={4} style={styles.carouselTitle} />
      )}
      <View style={styles.relatedList}>
        {Array.from({ length: 3 }, (_, index) => (
          <View key={index} style={styles.relatedRow}>
            <SkeletonBox
              width={RELATED_POSTER_WIDTH}
              height={RELATED_POSTER_HEIGHT}
              borderRadius={8}
            />
            <View style={styles.relatedContent}>
              <SkeletonBox width="100%" height={16} borderRadius={4} />
              <SkeletonBox width="72%" height={16} borderRadius={4} />
              <SkeletonBox width="55%" height={12} borderRadius={4} />
              <View style={styles.infoBadges}>
                <SkeletonBox width={52} height={18} borderRadius={6} />
                <SkeletonBox width={36} height={12} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function WatchPlayerSkeleton() {
  return (
    <View style={styles.player}>
      <SkeletonBox style={StyleSheet.absoluteFill} borderRadius={0} />
    </View>
  );
}

type WatchScreenSkeletonProps = {
  onBack: () => void;
};

export function WatchScreenSkeleton({ onBack }: WatchScreenSkeletonProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.playerSection}>
        <WatchPlayerSkeleton />
        <WatchBackButton onPress={onBack} />
      </View>

      <View style={styles.playerControls}>
        <View style={styles.serverSection}>
          <WatchEpisodeNavSkeleton />
          <WatchServerListSkeleton />
        </View>
        <WatchEpisodeListSkeleton />
      </View>

      <View style={styles.body}>
        <WatchAnimeInfoSkeleton />
        <WatchActiveEpisodeCardSkeleton />
      </View>

      <View style={styles.sections}>
        <WatchAnimeCarouselSkeleton titleWidth={72} />
        <WatchRelatedAnimeListSkeleton />
        <WatchAnimeCarouselSkeleton titleWidth={120} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 32,
  },
  playerSection: {
    position: 'relative',
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  playerControls: {
    gap: 20,
  },
  serverSection: {
    gap: 0,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  sections: {
    paddingTop: 24,
    gap: 24,
  },
  serverPanel: {
    backgroundColor: PANEL_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  serverPanelEmbedded: {
    gap: 8,
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serverChips: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverChipGap: {
    width: 6,
  },
  episodeSection: {
    gap: 10,
  },
  episodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  episodeTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  episodeChips: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  episodeChipGap: {
    width: 8,
  },
  infoSection: {
    gap: 16,
  },
  infoHero: {
    flexDirection: 'row',
    gap: 14,
  },
  infoHeroContent: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  infoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    alignItems: 'center',
  },
  synopsisSection: {
    gap: 8,
  },
  activeEpisodeCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  carouselSection: {
    gap: 12,
  },
  carouselTitle: {
    marginHorizontal: 20,
  },
  carouselTitleText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
  },
  carouselRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  carouselGap: {
    width: 12,
  },
  animeCard: {
    width: WATCH_ANIME_CARD_WIDTH,
  },
  animeCardTitle: {
    marginTop: 8,
    marginBottom: 2,
  },
  relatedList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  relatedRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
  },
  relatedContent: {
    flex: 1,
    gap: 6,
    paddingVertical: 2,
  },
});
