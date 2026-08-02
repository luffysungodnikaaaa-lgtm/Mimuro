import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme';
import {
  buildHostFullscreenActiveScript,
  shouldAllowWebViewNavigation,
  WEBVIEW_HOST_FULLSCREEN_BEFORE_LOAD_SCRIPT,
  WEBVIEW_PLAYER_INJECTED_SCRIPT,
} from '../../utils/webviewAdBlock';

/** Referer for private player hosts is not published in this review repo. */
const PLAYER_REFERER =
  process.env.MIMURO_PLAYER_REFERER ?? 'https://YOUR_PRIVATE_PLAYER.example/';

type WatchPlayerProps = {
  url?: string;
  isLoading?: boolean;
  onVideoEnd?: () => void;
  fillScreen?: boolean;
  onHostFullscreenChange?: (active: boolean) => void;
};

export const WatchPlayer = memo(function WatchPlayer({
  url,
  isLoading,
  onVideoEnd,
  fillScreen = false,
  onHostFullscreenChange,
}: WatchPlayerProps) {
  const webViewRef = useRef<{ injectJavaScript: (script: string) => void } | null>(
    null,
  );
  const fillScreenRef = useRef(fillScreen);
  fillScreenRef.current = fillScreen;

  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      buildHostFullscreenActiveScript(fillScreen),
    );
  }, [fillScreen]);

  const handleLoadEnd = useCallback(() => {
    webViewRef.current?.injectJavaScript(WEBVIEW_PLAYER_INJECTED_SCRIPT);
    webViewRef.current?.injectJavaScript(
      buildHostFullscreenActiveScript(fillScreenRef.current),
    );
  }, []);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) =>
      shouldAllowWebViewNavigation(request.url, url),
    [url],
  );

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type?: string };
        if (data.type === 'videoEnded') {
          onVideoEnd?.();
          return;
        }
        if (data.type === 'hostFullscreenEnter') {
          if (!fillScreenRef.current) {
            onHostFullscreenChange?.(true);
          }
          return;
        }
        if (data.type === 'hostFullscreenExit') {
          if (fillScreenRef.current) {
            onHostFullscreenChange?.(false);
          }
        }
      } catch {
        // Ignore non-JSON messages from the embed page.
      }
    },
    [onHostFullscreenChange, onVideoEnd],
  );

  const source = useMemo(
    () =>
      url
        ? {
            uri: url,
            headers: {
              Referer: PLAYER_REFERER,
            },
          }
        : undefined,
    [url],
  );

  const showInitialLoading = isLoading && !url;

  return (
    <View
      style={fillScreen ? styles.fillContainer : styles.container}
      collapsable={false}
    >
      {showInitialLoading ? (
        <View style={styles.loading}>
          <View style={styles.loadingIcon}>
            <Ionicons name="play" size={28} color={colors.accent} />
          </View>
          <ActivityIndicator color={colors.accent} style={styles.spinner} />
          <Text style={styles.loadingText}>Loading stream...</Text>
        </View>
      ) : url && source ? (
        <WebView
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={webViewRef as any}
          key={url}
          source={source}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['https://*', 'http://*']}
          scrollEnabled={false}
          setSupportMultipleWindows={false}
          cacheEnabled
          overScrollMode="never"
          androidLayerType="hardware"
          injectedJavaScriptBeforeContentLoaded={
            WEBVIEW_HOST_FULLSCREEN_BEFORE_LOAD_SCRIPT
          }
          injectedJavaScript={WEBVIEW_PLAYER_INJECTED_SCRIPT}
          onMessage={handleMessage}
          onLoadEnd={handleLoadEnd}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        />
      ) : (
        <View style={styles.loading}>
          <View style={styles.loadingIcon}>
            <Ionicons name="videocam-off-outline" size={26} color={colors.textMuted} />
          </View>
          <Text style={styles.loadingText}>No stream available</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    ...(Platform.OS === 'android' ? { overflow: 'hidden' } : null),
  },
  fillContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
    opacity: 0.99,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  loadingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(123, 140, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 4,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
