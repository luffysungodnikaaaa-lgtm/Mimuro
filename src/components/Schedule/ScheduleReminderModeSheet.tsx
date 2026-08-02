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

type ScheduleReminderModeSheetProps = {
  visible: boolean;
  title: string;
  /** When false, hides "This episode only" (e.g. Watch with no next air time). */
  showOnceOption?: boolean;
  /** Movies only get a single airing reminder — hide "Every release". */
  isMovie?: boolean;
  onClose: () => void;
  onSelect: (mode: ReminderMode) => void;
};

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.1;
const OPEN_DURATION = 280;
const CLOSE_DURATION = 220;
const FALLBACK_SHEET_HEIGHT = 320;

export function ScheduleReminderModeSheet({
  visible,
  title,
  showOnceOption = true,
  isMovie = false,
  onClose,
  onSelect,
}: ScheduleReminderModeSheetProps) {
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

  const animateClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    Animated.timing(translateY, {
      toValue: sheetHeightRef.current,
      duration: CLOSE_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onClose();
      }
      closingRef.current = false;
    });
  }, [onClose, translateY]);

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

  const handleSelect = (mode: ReminderMode) => {
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
        onSelect(mode);
      }
    });
  };

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
          accessibilityLabel="Close remind options"
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
                <Text style={styles.title}>Remind me</Text>
                {title ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {title}
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
                accessibilityLabel="Close remind options"
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <View style={styles.body}>
            {!isMovie ? (
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelect('always')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="notifications"
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Every release</Text>
                  <Text style={styles.optionDesc}>
                    Notify for upcoming episodes of this anime
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {showOnceOption ? (
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelect('once')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {isMovie ? 'This airing' : 'This episode only'}
                  </Text>
                  <Text style={styles.optionDesc}>
                    {isMovie
                      ? 'One reminder when this movie is scheduled to air'
                      : 'One reminder for this scheduled airing'}
                  </Text>
                </View>
              </Pressable>
            ) : null}
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 140, 255, 0.15)',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
