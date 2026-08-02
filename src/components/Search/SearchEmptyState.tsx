import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type SearchEmptyStateProps = {
  message: string;
};

export function SearchEmptyState({ message }: SearchEmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
