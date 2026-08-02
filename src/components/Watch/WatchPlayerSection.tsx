import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import { WatchBackButton } from './WatchBackButton';
import { WatchPlayer } from './WatchPlayer';
import { WatchPlayerSkeleton } from './WatchSkeletons';

type WatchPlayerSectionProps = {
  url?: string;
  isLoading?: boolean;
  onBack: () => void;
  onVideoEnd?: () => void;
  fillScreen?: boolean;
  onHostFullscreenChange?: (active: boolean) => void;
};

export const WatchPlayerSection = memo(function WatchPlayerSection({
  url,
  isLoading,
  onBack,
  onVideoEnd,
  fillScreen = false,
  onHostFullscreenChange,
}: WatchPlayerSectionProps) {
  const showSkeleton = isLoading && !url;

  return (
    <View
      style={fillScreen ? styles.fillContainer : styles.container}
      collapsable={false}
    >
      {showSkeleton ? (
        <WatchPlayerSkeleton />
      ) : (
        <WatchPlayer
          url={url}
          isLoading={isLoading}
          onVideoEnd={onVideoEnd}
          fillScreen={fillScreen}
          onHostFullscreenChange={onHostFullscreenChange}
        />
      )}
      {!fillScreen ? <WatchBackButton onPress={onBack} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.background,
  },
  fillContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
});
