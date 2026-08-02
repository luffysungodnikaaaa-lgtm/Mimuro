import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { DISCORD_INVITE_URL } from '../../config/discord';
import { colors } from '../../theme';

const DISCORD_BLURPLE = '#5865F2';

export function DiscordInviteBanner() {
  if (!DISCORD_INVITE_URL.trim()) {
    return null;
  }

  const openDiscord = () => {
    void Linking.openURL(DISCORD_INVITE_URL.trim());
  };

  return (
    <Pressable
      onPress={openDiscord}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel="Join our Discord"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="logo-discord" size={20} color="#fff" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Join our Discord</Text>
        <Text style={styles.subtitle}>Chat, updates, and community</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 16,
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
    backgroundColor: DISCORD_BLURPLE,
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
