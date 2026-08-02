import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../../theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
};

export function SearchBar({ value, onChangeText, onClear }: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search anime..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />
      <Pressable
        onPress={onClear}
        hitSlop={8}
        disabled={value.length === 0}
        style={[
          styles.clearButton,
          value.length === 0 && styles.clearButtonHidden,
        ]}
      >
        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 18,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonHidden: {
    opacity: 0,
  },
});
