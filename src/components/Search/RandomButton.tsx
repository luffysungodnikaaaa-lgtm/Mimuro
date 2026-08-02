import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useRandom } from '../../hooks/useRandom';
import { colors } from '../../theme';

export function RandomButton() {
  const random = useRandom();

  return (
    <Pressable
      onPress={() => random.mutate()}
      disabled={random.isPending}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        random.isPending && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Watch a random anime"
    >
      {random.isPending ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <Ionicons name="shuffle-outline" size={18} color={colors.text} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
});
