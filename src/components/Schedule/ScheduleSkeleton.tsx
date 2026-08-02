import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';
import { colors } from '../../theme';

const ROW_COUNT = 5;

export function ScheduleSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.timeline}>
            <View style={styles.dot} />
            {index < ROW_COUNT - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.timeColumn}>
            <SkeletonBox width={48} height={12} />
          </View>
          <View style={styles.card}>
            <SkeletonBox width={68} height={96} borderRadius={10} />
            <View style={styles.content}>
              <SkeletonBox height={14} />
              <SkeletonBox width="70%" height={12} />
              <SkeletonBox width="45%" height={11} />
              <SkeletonBox height={28} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  timeline: {
    width: 14,
    alignItems: 'center',
    paddingTop: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  line: {
    flex: 1,
    width: 1,
    marginTop: 6,
    backgroundColor: colors.border,
  },
  timeColumn: {
    width: 64,
    paddingTop: 14,
    paddingRight: 8,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
  },
  content: {
    flex: 1,
    gap: 8,
    paddingVertical: 4,
  },
});
