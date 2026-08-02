import { useCallback } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { AppUpdateInfo } from '../lib/appUpdate';
import { colors } from '../theme';

type UpdateRequiredModalProps = {
  visible: boolean;
  update: AppUpdateInfo;
  onDismiss: () => void;
};

export function UpdateRequiredModal({
  visible,
  update,
  onDismiss,
}: UpdateRequiredModalProps) {
  const openApk = useCallback(() => {
    void Linking.openURL(update.apkUrl);
  }, [update.apkUrl]);

  const openWebsite = useCallback(() => {
    if (!update.websiteLink) {
      return;
    }
    void Linking.openURL(update.websiteLink);
  }, [update.websiteLink]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={update.forceDownload ? () => undefined : onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-download-outline" size={28} color={colors.accent} />
          </View>

          <Text style={styles.title}>Update available</Text>
          <Text style={styles.message}>
            A newer version of Mimuro is ready. Install {update.remoteVersion} to
            keep using the latest features and fixes.
          </Text>
          <Text style={styles.versions}>
            Installed {update.currentVersion} → {update.remoteVersion}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={openApk}
          >
            <Text style={styles.primaryButtonText}>Download update</Text>
          </Pressable>

          {update.websiteLink ? (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              onPress={openWebsite}
            >
              <Text style={styles.secondaryButtonText}>Open website</Text>
            </Pressable>
          ) : null}

          {!update.forceDownload ? (
            <Pressable
              style={({ pressed }) => [
                styles.laterButton,
                pressed && styles.pressed,
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </Pressable>
          ) : (
            <Text style={styles.requiredNote}>
              This update is required to continue.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(123, 140, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  versions: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0f1020',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  laterButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  laterButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  requiredNote: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.85,
  },
});
