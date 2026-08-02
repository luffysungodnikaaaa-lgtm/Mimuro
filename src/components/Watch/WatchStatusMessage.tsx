import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type WatchStatusMessageProps = {
  message: string;
};

export function WatchStatusMessage({ message }: WatchStatusMessageProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
