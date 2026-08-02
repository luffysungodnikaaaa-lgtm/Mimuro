import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { getContentWidth } from '../../theme';
import { SkeletonBox } from '../ui/SkeletonBox';
import { SPOTLIGHT_HEIGHT } from './SpotlightSlide';

export function SpotlightSkeleton() {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = getContentWidth(windowWidth);

  return (
    <View style={[styles.slide, { width: contentWidth }]}>
      <SkeletonBox
        height={SPOTLIGHT_HEIGHT}
        borderRadius={0}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.badges}>
          <SkeletonBox width={44} height={20} borderRadius={4} />
          <SkeletonBox width={34} height={20} borderRadius={4} />
          <SkeletonBox width={34} height={20} borderRadius={4} />
        </View>
        <SkeletonBox
          width="88%"
          height={28}
          borderRadius={4}
          style={styles.titleLine}
        />
        <SkeletonBox
          width="62%"
          height={28}
          borderRadius={4}
          style={styles.titleLine}
        />
        <SkeletonBox
          width="40%"
          height={13}
          borderRadius={4}
          style={styles.japaneseTitle}
        />
        <SkeletonBox
          width="100%"
          height={18}
          borderRadius={4}
          style={styles.synopsisLine}
        />
        <SkeletonBox
          width="100%"
          height={18}
          borderRadius={4}
          style={styles.synopsisLine}
        />
        <SkeletonBox width="72%" height={18} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: SPOTLIGHT_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  titleLine: {
    marginBottom: 4,
  },
  japaneseTitle: {
    marginBottom: 8,
  },
  synopsisLine: {
    marginBottom: 4,
  },
});
