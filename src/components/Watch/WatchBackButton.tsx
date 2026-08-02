import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { colors } from '../../theme';

type WatchBackButtonProps = {
  onPress: () => void;
  variant?: 'overlay' | 'bar';
};

export function WatchBackButton({
  onPress,
  variant = 'overlay',
}: WatchBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        variant === 'overlay' ? styles.overlay : styles.bar,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
