import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import {
  TOP_ANIME_CARD_WIDTH,
  TOP_ANIME_POSTER_HEIGHT,
} from './TopAnimeCard';

const SKELETON_COUNT = 4;
const SEPARATOR_WIDTH = 12;

function TopAnimeCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.posterWrap}>
        <SkeletonBox
          width={TOP_ANIME_CARD_WIDTH}
          height={TOP_ANIME_POSTER_HEIGHT}
          borderRadius={10}
        />
        <SkeletonBox
          width={34}
          height={22}
          borderRadius={6}
          style={styles.rankBadge}
        />
        <SkeletonBox
          width={36}
          height={18}
          borderRadius={4}
          style={styles.typeBadge}
        />
      </View>
      <SkeletonBox
        width={TOP_ANIME_CARD_WIDTH}
        height={16}
        borderRadius={4}
        style={styles.titleLine}
      />
      <SkeletonBox
        width={TOP_ANIME_CARD_WIDTH * 0.72}
        height={16}
        borderRadius={4}
        style={styles.titleLine}
      />
      <View style={styles.meta}>
        <SkeletonBox width={34} height={10} borderRadius={4} />
        <SkeletonBox width={34} height={10} borderRadius={4} />
      </View>
    </View>
  );
}

export function TopAnimeSkeleton() {
  return (
    <View style={styles.row}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={styles.separator} /> : null}
          <TopAnimeCardSkeleton />
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
    width: TOP_ANIME_CARD_WIDTH,
  },
  posterWrap: {
    width: TOP_ANIME_CARD_WIDTH,
    height: TOP_ANIME_POSTER_HEIGHT,
    marginBottom: 8,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
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
