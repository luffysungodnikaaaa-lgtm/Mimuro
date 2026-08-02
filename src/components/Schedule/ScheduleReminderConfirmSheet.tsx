import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReminderMode } from '../../lib/scheduleReminders';
import { colors } from '../../theme';

type ScheduleReminderConfirmSheetProps = {
  visible: boolean;
  title: string;
  mode?: ReminderMode;
  onClose: () => void;
  onConfirm: () => void;
};

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.1;
const OPEN_DURATION = 280;
const CLOSE_DURATION = 220;
const FALLBACK_SHEET_HEIGHT = 280;

export function ScheduleReminderConfirmSheet({
  visible,
  title,
  mode,
  onClose,
  onConfirm,
}: ScheduleReminderConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(FALLBACK_SHEET_HEIGHT)).current;
  const dragStartY = useRef(0);
  const closingRef = useRef(false);
  const sheetHeightRef = useRef(FALLBACK_SHEET_HEIGHT);
  const [sheetHeight, setSheetHeight] = useState(FALLBACK_SHEET_HEIGHT);

  useEffect(() => {
    sheetHeightRef.current = sheetHeight;
  }, [sheetHeight]);

  const animateOpen = useCallback(() => {
    closingRef.current = false;
    translateY.setValue(sheetHeightRef.current);
    Animated.timing(translateY, {
      toValue: 0,
      duration: OPEN_DURATION,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const animateClose = useCallback(
    (afterClose?: () => void) => {
      if (closingRef.current) {
        return;
      }

      closingRef.current = true;
      Animated.timing(translateY, {
        toValue: sheetHeightRef.current,
        duration: CLOSE_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        closingRef.current = false;
        if (finished) {
          onClose();
          afterClose?.();
        }
      });
    },
    [onClose, translateY],
  );

  useEffect(() => {
    if (visible) {
      animateOpen();
    } else {
      translateY.setValue(sheetHeightRef.current);
      closingRef.current = false;
    }
  }, [animateOpen, translateY, visible]);

  const handleSheetLayout = useCallback(
    (event: { nativeEvent: { layout: { height: number } } }) => {
      const nextHeight = Math.max(1, Math.round(event.nativeEvent.layout.height));
      if (nextHeight === sheetHeightRef.current) {
        return;
      }

      sheetHeightRef.current = nextHeight;
      setSheetHeight(nextHeight);
      if (!visible) {
        translateY.setValue(nextHeight);
      }
    },
    [translateY, visible],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation(value => {
            dragStartY.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(0, dragStartY.current + gesture.dy);
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldDismiss =
            gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY;

          if (shouldDismiss) {
            animateClose();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 18,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 18,
          }).start();
        },
      }),
    [animateClose, translateY],
  );

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, Math.max(sheetHeight, 1)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const modeLabel =
    mode === 'always'
      ? 'every release'
      : mode === 'once'
        ? 'this airing'
        : 'this reminder';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => animateClose()}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdropPressable}
          onPress={() => animateClose()}
          accessibilityRole="button"
          accessibilityLabel="Cancel turn off reminder"
        />

        <Animated.View
          pointerEvents="none"
          style={[styles.backdropFill, { opacity: backdropOpacity }]}
        />

        <Animated.View
          onLayout={handleSheetLayout}
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{ translateY }],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Turn off reminder?</Text>
                {title ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    Stop notifying for {title} ({modeLabel}).
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => animateClose()}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel turn off reminder"
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <View style={styles.body}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.pressed,
              ]}
              onPress={() => animateClose(onConfirm)}
            >
              <Ionicons
                name="notifications-off-outline"
                size={18}
                color={colors.text}
              />
              <Text style={styles.confirmText}>Turn off</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={() => animateClose()}
            >
              <Text style={styles.cancelText}>Keep reminder</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  backdropFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    zIndex: 2,
  },
  dragArea: {
    paddingBottom: 4,
  },
  handleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    minHeight: 28,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 89, 89, 0.16)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  confirmText: {
    color: '#FF8A8A',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cancelText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
