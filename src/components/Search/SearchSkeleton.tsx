import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from '../ui/SkeletonBox';

const ROW_COUNT = 6;

export function SearchSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <View key={index} style={styles.row}>
          <SkeletonBox width={76} height={108} borderRadius={10} />
          <View style={styles.content}>
            <SkeletonBox height={14} />
            <SkeletonBox width="80%" height={12} />
            <SkeletonBox width="60%" height={11} />
            <View style={styles.badges}>
              <SkeletonBox width={52} height={18} borderRadius={6} />
              <SkeletonBox width={44} height={18} borderRadius={6} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  content: {
    flex: 1,
    gap: 8,
    paddingVertical: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
});
