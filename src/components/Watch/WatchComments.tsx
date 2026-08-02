import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview';
import { colors } from '../../theme';

type WatchCommentsProps = {
  visible: boolean;
  onClose: () => void;
  malId?: number;
  episodeNumber?: number;
};

/** Comments provider host omitted from this public review repo. */
const BASE_URL =
  process.env.MIMURO_COMMENTS_BASE_URL ?? 'https://YOUR_PRIVATE_COMMENTS.example';
const AUTH_ORIGIN =
  process.env.MIMURO_COMMENTS_AUTH_ORIGIN ??
  'https://YOUR_PRIVATE_COMMENTS.example';
const LOGIN_TIP_DISMISSED_KEY = 'comments:loginTipDismissed';
const OAUTH_UNSUPPORTED_MESSAGE =
  'Google and other OAuth sign-ins are not supported in the app. Please use email and password instead.';
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.1;
const OPEN_DURATION = 280;
const CLOSE_DURATION = 220;

/**
 * The Anime Community login opens a popup, then posts a Firebase customToken
 * back through window.opener. RN WebViews don't provide a real opener, so we
 * open that auth URL ourselves and relay the token into the embed iframe.
 */
const AUTH_BRIDGE_SCRIPT = `
(function () {
  if (window.__tacAuthBridgeInstalled) return;
  window.__tacAuthBridgeInstalled = true;

  function sendToken(customToken) {
    if (!customToken || !window.ReactNativeWebView) return;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'auth_custom_token',
      customToken: String(customToken)
    }));
  }

  function maybeExtract(url, bodyText) {
    try {
      if (!url || !/\\/api\\/v1\\/auth\\/exchange_(token|session)/.test(String(url))) {
        return;
      }
      var data = JSON.parse(bodyText);
      if (data && data.customToken) {
        sendToken(data.customToken);
      }
    } catch (e) {}
  }

  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__tacUrl = url;
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('load', function () {
      maybeExtract(this.__tacUrl, this.responseText);
    });
    return originalSend.apply(this, arguments);
  };

  if (window.fetch) {
    var originalFetch = window.fetch.bind(window);
    window.fetch = function () {
      var args = arguments;
      var input = args[0];
      var url = typeof input === 'string' ? input : (input && input.url);
      return originalFetch.apply(window, args).then(function (response) {
        try {
          var clone = response.clone();
          clone.text().then(function (text) {
            maybeExtract(url, text);
          });
        } catch (e) {}
        return response;
      });
    };
  }

  window.opener = {
    origin: '${AUTH_ORIGIN}',
    postMessage: function (data) {
      if (!window.ReactNativeWebView) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'auth_opener_message',
        data: data
      }));
    }
  };
})();
true;
`;

function buildAuthSuccessScript(customToken: string) {
  const token = JSON.stringify(customToken);
  return `
(function () {
  var payload = { type: 'auth_success', customToken: ${token} };
  var origin = '${AUTH_ORIGIN}';
  try { window.postMessage(payload, '*'); } catch (e) {}
  try {
    var iframe = document.getElementById('anime-community-comment-section-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(payload, origin);
      iframe.contentWindow.postMessage(
        { type: 'auth_success_with_custom_token', customToken: ${token} },
        origin
      );
    }
  } catch (e) {}
})();
true;
`;
}

function buildCommentsHtml(malId: number, episodeNumber: number) {
  const config = {
    MAL_ID: String(malId),
    episodeChapterNumber: String(episodeNumber),
    mediaType: 'anime',
    removeBorder: 'true',
    removePadding: 'true',
    colorScheme: {
      primaryColor: colors.accent,
      backgroundColor: colors.background,
      dropDownTextColor: colors.text,
      strongTextColor: colors.text,
      primaryTextColor: colors.text,
      secondaryTextColor: colors.textMuted,
      iconColor: colors.textMuted,
      accentColor: 'rgba(255, 255, 255, 0.12)',
    },
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1"
  />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: ${colors.background};
      overflow-x: hidden;
    }
    #anime-community-comment-section {
      min-height: 280px;
      padding: 4px 0 24px;
    }
  </style>
</head>
<body>
  <div id="anime-community-comment-section"></div>
  <script>
    window.theAnimeCommunityConfig = ${JSON.stringify(config)};
  </script>
  <script
    src="${BASE_URL}/embed.js"
    id="anime-community-script"
    defer
  ></script>
</body>
</html>`;
}

function isGoogleOAuthUrl(url: string) {
  return /accounts\.google\.com|google\.com\/(?:o\/)?oauth/i.test(url);
}

function isAuthPopupUrl(url: string) {
  try {
    const origin = new URL(AUTH_ORIGIN).hostname.replace(/\./g, '\\.');
    return new RegExp(`${origin}/embeddedAuth/`, 'i').test(url);
  } catch {
    return /\/embeddedAuth\//i.test(url);
  }
}

export function WatchComments({
  visible,
  onClose,
  malId,
  episodeNumber = 1,
}: WatchCommentsProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  // Keep the 16:9 player visible above the sheet (TikTok-style).
  const playerReserve = Math.round(windowWidth * (9 / 16)) + insets.top;

  const commentsWebViewRef = useRef<any>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);
  const closingRef = useRef(false);
  const sheetHeightRef = useRef(
    Dimensions.get('screen').height - playerReserve,
  );

  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [showLoginTip, setShowLoginTip] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(
    () => Dimensions.get('screen').height - playerReserve,
  );

  useEffect(() => {
    sheetHeightRef.current = sheetHeight;
  }, [sheetHeight]);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(LOGIN_TIP_DISMISSED_KEY)
      .then(value => {
        if (!cancelled) {
          setShowLoginTip(value !== 'true');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShowLoginTip(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dismissLoginTip = useCallback(() => {
    setShowLoginTip(false);
    AsyncStorage.setItem(LOGIN_TIP_DISMISSED_KEY, 'true').catch(() => {
      // Ignore persistence errors; tip is still hidden for this session.
    });
  }, []);

  const html = useMemo(() => {
    if (!malId) {
      return null;
    }

    return buildCommentsHtml(malId, episodeNumber);
  }, [episodeNumber, malId]);

  const closeAuth = useCallback(() => {
    setAuthUrl(null);
    setAuthNotice(null);
  }, []);

  const deliverAuthToken = useCallback(
    (customToken: string) => {
      commentsWebViewRef.current?.injectJavaScript(
        buildAuthSuccessScript(customToken),
      );
      closeAuth();
    },
    [closeAuth],
  );

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
    closeAuth();
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
  }, [closeAuth, onClose, translateY]);

  useEffect(() => {
    if (visible) {
      animateOpen();
    } else {
      translateY.setValue(sheetHeightRef.current);
      closingRef.current = false;
      closeAuth();
    }
  }, [animateOpen, closeAuth, translateY, visible]);

  const handleSheetLayout = useCallback(
    (event: { nativeEvent: { layout: { height: number } } }) => {
      const nextHeight = Math.max(
        1,
        Math.round(event.nativeEvent.layout.height),
      );
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

  const handleOpenWindow = useCallback(
    (event: { nativeEvent: { targetUrl?: string } }) => {
      const targetUrl = event.nativeEvent.targetUrl;
      if (!targetUrl) {
        return;
      }

      if (isGoogleOAuthUrl(targetUrl)) {
        setAuthNotice(OAUTH_UNSUPPORTED_MESSAGE);
        return;
      }

      if (isAuthPopupUrl(targetUrl) || targetUrl.startsWith(AUTH_ORIGIN)) {
        setAuthNotice(null);
        setAuthUrl(targetUrl);
      }
    },
    [],
  );

  const handleAuthMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          customToken?: string;
          data?: { type?: string; customToken?: string };
        };

        if (
          payload.type === 'auth_custom_token' &&
          typeof payload.customToken === 'string'
        ) {
          deliverAuthToken(payload.customToken);
          return;
        }

        if (
          payload.type === 'auth_opener_message' &&
          payload.data?.type === 'auth_success_with_custom_token' &&
          typeof payload.data.customToken === 'string'
        ) {
          deliverAuthToken(payload.data.customToken);
          return;
        }

        if (
          payload.type === 'auth_opener_message' &&
          payload.data?.type === 'auth_success' &&
          typeof payload.data.customToken === 'string'
        ) {
          deliverAuthToken(payload.data.customToken);
        }
      } catch {
        // Ignore non-JSON messages.
      }
    },
    [deliverAuthToken],
  );

  const handleAuthNavigation = useCallback((request: { url: string }) => {
    if (isGoogleOAuthUrl(request.url)) {
      setAuthNotice(OAUTH_UNSUPPORTED_MESSAGE);
      return false;
    }

    return true;
  }, []);

  const handleAuthNavState = useCallback((navState: WebViewNavigation) => {
    if (isGoogleOAuthUrl(navState.url)) {
      setAuthNotice(OAUTH_UNSUPPORTED_MESSAGE);
    }
  }, []);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, Math.max(sheetHeight, 1)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

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
          style={[styles.playerPeek, { height: playerReserve }]}
          onPress={() => animateClose()}
          accessibilityRole="button"
          accessibilityLabel="Close comments"
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdropFill,
            {
              top: playerReserve,
              opacity: backdropOpacity,
            },
          ]}
        />

        <View style={[styles.sheetSlot, { marginTop: playerReserve }]}>
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
                <Text style={styles.title}>Comments</Text>
                <Pressable
                  onPress={() => animateClose()}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close comments"
                >
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            {showLoginTip ? (
              <View style={styles.loginTip} accessibilityRole="alert">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#FFAB91"
                  style={styles.loginTipIcon}
                />
                <Text style={styles.loginTipText}>
                  Sign-in tip: Google and other OAuth logins don't work in the
                  app yet. Use email and password instead.
                </Text>
                <Pressable
                  onPress={dismissLoginTip}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.loginTipDismiss,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss sign-in tip"
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            ) : null}

            <View style={styles.body}>
              {malId && html ? (
                <WebView
                  ref={commentsWebViewRef}
                  key={`${malId}-${episodeNumber}`}
                  originWhitelist={['*']}
                  source={{ html, baseUrl: BASE_URL }}
                  style={styles.webview}
                  javaScriptEnabled
                  domStorageEnabled
                  javaScriptCanOpenWindowsAutomatically
                  setSupportMultipleWindows={true}
                  onOpenWindow={handleOpenWindow}
                  mixedContentMode="always"
                  thirdPartyCookiesEnabled
                  sharedCookiesEnabled
                  allowsInlineMediaPlayback
                  startInLoadingState
                />
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    Comments are unavailable for this episode.
                  </Text>
                </View>
              )}
            </View>

            {authUrl ? (
              <View style={styles.authOverlay}>
                <View style={styles.authHeader}>
                  <Text style={styles.authTitle}>Log in</Text>
                  <Pressable
                    onPress={closeAuth}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.closeButton,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Close login"
                  >
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </Pressable>
                </View>

                {authNotice ? (
                  <Text style={styles.authNotice}>{authNotice}</Text>
                ) : null}

                <WebView
                  key={authUrl}
                  originWhitelist={['*']}
                  source={{ uri: authUrl }}
                  style={styles.authWebview}
                  javaScriptEnabled
                  domStorageEnabled
                  mixedContentMode="always"
                  thirdPartyCookiesEnabled
                  sharedCookiesEnabled
                  setSupportMultipleWindows={false}
                  injectedJavaScriptBeforeContentLoaded={AUTH_BRIDGE_SCRIPT}
                  injectedJavaScript={AUTH_BRIDGE_SCRIPT}
                  onMessage={handleAuthMessage}
                  onShouldStartLoadWithRequest={handleAuthNavigation}
                  onNavigationStateChange={handleAuthNavState}
                  startInLoadingState
                />
              </View>
            ) : null}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  playerPeek: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backdropFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetSlot: {
    flex: 1,
    overflow: 'hidden',
  },
  sheet: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  loginTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 171, 145, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 171, 145, 0.32)',
  },
  loginTipIcon: {
    marginTop: 1,
  },
  loginTipText: {
    flex: 1,
    color: '#FFCCBC',
    fontSize: 12,
    lineHeight: 17,
  },
  loginTipDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
    opacity: 0.99,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  authOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    zIndex: 5,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  authTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  authNotice: {
    color: '#FFAB91',
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  authWebview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
