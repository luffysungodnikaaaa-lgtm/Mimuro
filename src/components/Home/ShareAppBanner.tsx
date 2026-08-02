import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { APP_SHARE_URL } from '../../config/share';
import { colors } from '../../theme';

export function ShareAppBanner() {
  const shareApp = () => {
    void Share.share({
      message: `I've been watching on Mimuro — give it a try:\n${APP_SHARE_URL}`,
      title: 'Share Mimuro',
      url: APP_SHARE_URL,
    });
  };

  return (
    <Pressable
      onPress={shareApp}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Share Mimuro with friends"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="heart" size={20} color="#fff" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Love Mimuro? Share it</Text>
        <Text style={styles.subtitle}>Send the app to a friend</Text>
      </View>
      <Ionicons name="share-outline" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
