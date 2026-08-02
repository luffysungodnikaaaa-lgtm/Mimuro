import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import {
  LATEST_EPISODE_CARD_WIDTH,
  LATEST_EPISODE_POSTER_HEIGHT,
} from './LatestEpisodeCard';

const SKELETON_COUNT = 4;
const SEPARATOR_WIDTH = 12;

function LatestEpisodeCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.posterWrap}>
        <SkeletonBox
          width={LATEST_EPISODE_CARD_WIDTH}
          height={LATEST_EPISODE_POSTER_HEIGHT}
          borderRadius={8}
        />
        <SkeletonBox
          width={36}
          height={18}
          borderRadius={4}
          style={styles.typeBadge}
        />
        <SkeletonBox
          width={44}
          height={18}
          borderRadius={4}
          style={styles.episodeBadge}
        />
      </View>
      <SkeletonBox
        width={LATEST_EPISODE_CARD_WIDTH}
        height={16}
        borderRadius={4}
        style={styles.titleLine}
      />
      <SkeletonBox
        width={LATEST_EPISODE_CARD_WIDTH * 0.7}
        height={16}
        borderRadius={4}
        style={styles.titleLine}
      />
      <View style={styles.meta}>
        <SkeletonBox width={34} height={10} borderRadius={4} />
        <SkeletonBox width={34} height={10} borderRadius={4} />
        <SkeletonBox width={20} height={10} borderRadius={4} />
      </View>
    </View>
  );
}

export function LatestEpisodeSkeleton() {
  return (
    <View style={styles.row}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={styles.separator} /> : null}
          <LatestEpisodeCardSkeleton />
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  separator: {
    width: SEPARATOR_WIDTH,
  },
  card: {
    width: LATEST_EPISODE_CARD_WIDTH,
  },
  posterWrap: {
    width: LATEST_EPISODE_CARD_WIDTH,
    height: LATEST_EPISODE_POSTER_HEIGHT,
    marginBottom: 8,
  },
  typeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  episodeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  titleLine: {
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
});
