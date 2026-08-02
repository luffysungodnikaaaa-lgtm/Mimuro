import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type WatchAnimeHeaderProps = {
  title?: string;
  japaneseTitle?: string;
};

export function WatchAnimeHeader({ title, japaneseTitle }: WatchAnimeHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {japaneseTitle ? (
        <Text style={styles.japaneseTitle} numberOfLines={1}>
          {japaneseTitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  japaneseTitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
