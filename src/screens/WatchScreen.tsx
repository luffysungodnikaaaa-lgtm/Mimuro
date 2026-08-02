import {
  BackHandler,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  LandscapeDirection,
  Orientation,
  getCurrentOrientation,
  lockToLandscape,
  lockToPortrait,
  onOrientationChange,
  startOrientationTracking,
  stopOrientationTracking,
  unlockAllOrientations,
} from 'react-native-orientation-turbo';
import type { Episode } from '../api/episode';
import type { Server, ServerResult } from '../api/server';
import { WatchActiveEpisodeCard } from '../components/Watch/WatchActiveEpisodeCard';
import { WatchAnimeCarousel } from '../components/Watch/WatchAnimeCarousel';
import { WatchAnimeInfo } from '../components/Watch/WatchAnimeInfo';
import { WatchBackButton } from '../components/Watch/WatchBackButton';
import { WatchComments } from '../components/Watch/WatchComments';
import { WatchDownloadList } from '../components/Watch/WatchDownloadList';
import { WatchEpisodeList } from '../components/Watch/WatchEpisodeList';
import { WatchEpisodeNav, findAdjacentEpisodes } from '../components/Watch/WatchEpisodeNav';
import { WatchNextEpisode } from '../components/Watch/WatchNextEpisode';
import { WatchPlayerSection } from '../components/Watch/WatchPlayerSection';
import { ScheduleReminderConfirmSheet } from '../components/Schedule/ScheduleReminderConfirmSheet';
import {
  WatchRelatedAnimeList,
  WatchSeasonList,
} from '../components/Watch/WatchRelatedSections';
import { WatchServerList } from '../components/Watch/WatchServerList';
import { WatchStatusMessage } from '../components/Watch/WatchStatusMessage';
import { WatchActiveEpisodeCardSkeleton, WatchScreenSkeleton } from '../components/Watch/WatchSkeletons';
import { useAutoNext } from '../hooks/useAutoNext';
import { useAnimeInfo } from '../hooks/useAnimeInfo';
import { useDownloads } from '../hooks/useDownloads';
import { useEpisodes } from '../hooks/useEpisodes';
import { useMalId } from '../hooks/useMalId';
import { usePreferredServer } from '../hooks/usePreferredServer';
import { useRelatedAnime } from '../hooks/useRelatedAnime';
import { useScheduleReminders } from '../hooks/useScheduleReminders';
import { useSeasons } from '../hooks/useSeasons';
import { useServers } from '../hooks/useServers';
import { useSource } from '../hooks/useSource';
import { useWatchedEpisodes } from '../hooks/useWatchedEpisodes';
import { saveContinueWatching } from '../lib/continueWatching';
import type { PreferredServer } from '../lib/preferences';
import type { RootStackParamList } from '../navigation/StackNavigator';
import { isMovieContent } from '../utils/isMovieContent';
import { colors } from '../theme';

const BG_GRADIENT = [
  'rgba(28, 28, 34, 0.45)',
  'rgba(28, 28, 34, 0.72)',
  'rgba(28, 28, 34, 0.9)',
  colors.background,
] as const;

type WatchScreenProps = NativeStackScreenProps<RootStackParamList, 'Watch'>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeServerTypeKey(type: { type: string; label: string }) {
  return (type.label || type.type).trim().toLowerCase();
}

function findFirstAvailableServer(servers?: ServerResult): Server | undefined {
  return servers?.types.find(type => type.servers.length > 0)?.servers[0];
}

function findServerForPreference(
  servers: ServerResult,
  preferred: PreferredServer | null,
): Server | undefined {
  if (!preferred) {
    return findFirstAvailableServer(servers);
  }

  const preferredType = servers.types.find(
    type =>
      type.servers.length > 0 &&
      normalizeServerTypeKey(type) === preferred.typeKey,
  );

  if (!preferredType) {
    return findFirstAvailableServer(servers);
  }

  return (
    preferredType.servers.find(server => server.name === preferred.serverName) ??
    preferredType.servers[0]
  );
}

function findEpisodeByNumber(
  episodes: Episode[] | undefined,
  episodeNumber: number,
) {
  if (!episodes?.length) {
    return undefined;
  }

  return (
    episodes.find(item => item.episode === episodeNumber) ?? episodes[0]
  );
}

export function WatchScreen({ route, navigation }: WatchScreenProps) {
  const { id, episode = 1 } = route.params;
  // Re-render on rotate; layout uses full screen size (not window inset).
  useWindowDimensions();
  const screenSize = Dimensions.get('screen');
  const [selectedLinkId, setSelectedLinkId] = useState<string>();
  const [fullscreen, setFullscreen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reminderConfirmOpen, setReminderConfirmOpen] = useState(false);
  const { autoNext, toggleAutoNext } = useAutoNext();
  const { preferred, savePreferred, isReady: isPreferredServerReady } =
    usePreferredServer();
  const {
    isReminded,
    getReminder,
    enableReminder,
    disableReminder,
  } = useScheduleReminders();
  const info = useAnimeInfo(id);
  const episodes = useEpisodes(info.data?.dataId);
  const seasons = useSeasons(info.data?.dataId);
  const relatedAnime = useRelatedAnime(info.data?.dataId);
  const activeEpisode = findEpisodeByNumber(episodes.data, episode);
  const { malId } = useMalId({
    episodeMalId: activeEpisode?.malId,
    title: info.data?.title,
    japaneseTitle: info.data?.japaneseTitle,
    type: info.data?.type,
    totalEpisodes: info.data?.totalEpisodes,
  });
  const servers = useServers(activeEpisode?.dataIds);
  const source = useSource(selectedLinkId);
  const downloads = useDownloads({
    malId,
    episode: activeEpisode?.episode,
    timestamp: activeEpisode?.timestamp,
  });
  const { watchedSet, markWatched } = useWatchedEpisodes(info.data?.id);
  const reminderActive = isReminded(id);
  const activeReminder = getReminder(id);
  // Movies/films don't have episodic airings — reminder is schedule-only.
  const canRemind = !isMovieContent({ type: info.data?.type });
  const savedVisitKey = useRef<string | null>(null);
  const canLoadServers = !!activeEpisode?.dataIds;
  const canLoadDownloads =
    !!malId &&
    !!activeEpisode?.episode &&
    !!activeEpisode?.timestamp;
  const isServerListLoading =
    episodes.isLoading ||
    (episodes.isFetching && !episodes.data?.length) ||
    (canLoadServers && !servers.isFetched);
  const isDownloadListLoading =
    episodes.isLoading ||
    (episodes.isFetching && !episodes.data?.length) ||
    (canLoadDownloads && downloads.isLoading);

  useEffect(() => {
    if (!isPreferredServerReady || !servers.data) {
      return;
    }

    setSelectedLinkId(
      findServerForPreference(servers.data, preferred)?.linkId,
    );
  }, [
    activeEpisode?.dataIds,
    isPreferredServerReady,
    preferred,
    servers.data,
  ]);

  useEffect(() => {
    const anime = info.data;
    if (!anime?.id || !anime.title) {
      return;
    }

    const visitKey = `${anime.id}:${episode}`;
    if (savedVisitKey.current === visitKey) {
      return;
    }

    savedVisitKey.current = visitKey;
    void saveContinueWatching({
      id: anime.id,
      title: anime.title,
      image: anime.image,
      episode,
      type: anime.type || undefined,
      totalEpisodes: anime.totalEpisodes,
    });
    void markWatched(episode);
  }, [episode, info.data, markWatched]);

  useEffect(() => {
    if (fullscreen) {
      // Library locks one side only; follow tilt for both. Sensor vs lock is inverted on Android.
      const lockLandscapeSide = (orientation: Orientation | string) => {
        if (orientation === Orientation.LANDSCAPE_RIGHT) {
          lockToLandscape(LandscapeDirection.LEFT);
        } else if (orientation === Orientation.LANDSCAPE_LEFT) {
          lockToLandscape(LandscapeDirection.RIGHT);
        }
      };

      startOrientationTracking();
      const current = getCurrentOrientation();
      if (
        current === Orientation.LANDSCAPE_LEFT ||
        current === Orientation.LANDSCAPE_RIGHT
      ) {
        lockLandscapeSide(current);
      } else {
        lockToLandscape(LandscapeDirection.RIGHT);
      }

      StatusBar.setHidden(true, 'fade');
      if (Platform.OS === 'android') {
        SystemNavigationBar.stickyImmersive().catch(() => undefined);
      }

      const sub = onOrientationChange(({ orientation }) => {
        lockLandscapeSide(orientation);
      });

      return () => {
        sub.remove();
        stopOrientationTracking();
        StatusBar.setHidden(false, 'fade');
        unlockAllOrientations();
        if (Platform.OS === 'android') {
          SystemNavigationBar.navigationShow().catch(() => undefined);
        }
      };
    }

    stopOrientationTracking();
    lockToPortrait();
    StatusBar.setHidden(false, 'fade');
    if (Platform.OS === 'android') {
      SystemNavigationBar.navigationShow().catch(() => undefined);
    }
    setTimeout(() => unlockAllOrientations(), 300);

    return () => {
      StatusBar.setHidden(false, 'fade');
      unlockAllOrientations();
      if (Platform.OS === 'android') {
        SystemNavigationBar.navigationShow().catch(() => undefined);
      }
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) {
      return undefined;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setFullscreen(false);
      return true;
    });

    return () => sub.remove();
  }, [fullscreen]);

  const streamLoading =
    episodes.isLoading || servers.isLoading || source.isLoading;

  const isError =
    info.isError ||
    episodes.isError ||
    servers.isError ||
    source.isError;

  const errorMessage = info.isError
    ? getErrorMessage(info.error, 'Failed to load anime info')
    : episodes.isError
      ? getErrorMessage(episodes.error, 'Failed to load episodes')
      : servers.isError
        ? getErrorMessage(servers.error, 'Failed to load servers')
        : getErrorMessage(source.error, 'Failed to load source');

  const handleBack = () => navigation.goBack();
  const handleServerSelect = useCallback(
    (server: Server) => {
      setSelectedLinkId(server.linkId);

      const selectedType = servers.data?.types.find(type =>
        type.servers.some(item => item.linkId === server.linkId),
      );

      if (selectedType) {
        savePreferred({
          typeKey: normalizeServerTypeKey(selectedType),
          serverName: server.name,
        });
      }
    },
    [savePreferred, servers.data],
  );
  const handleEpisodeSelect = useCallback(
    (item: Episode) => {
      if (item.episode === episode) {
        return;
      }

      navigation.setParams({ episode: item.episode });
    },
    [episode, navigation],
  );

  const handleToggleReminder = useCallback(() => {
    if (!info.data?.id || !info.data.title) {
      return;
    }

    if (reminderActive) {
      setReminderConfirmOpen(true);
      return;
    }

    // Watch follows the show — one-shot airings are set from Schedule.
    void enableReminder(
      {
        id: info.data.id,
        title: info.data.title,
      },
      'always',
    );
  }, [enableReminder, info.data?.id, info.data?.title, reminderActive]);

  const handleConfirmDisableReminder = useCallback(async () => {
    setReminderConfirmOpen(false);
    if (!info.data?.id || !info.data.title) {
      return;
    }

    await disableReminder({
      id: info.data.id,
      title: info.data.title,
      at: activeReminder?.at,
    });
  }, [
    activeReminder?.at,
    disableReminder,
    info.data?.id,
    info.data?.title,
  ]);

  const handleAutoNextToggle = toggleAutoNext;
  const handleVideoEnd = useCallback(() => {
    if (!autoNext) {
      return;
    }

    const { next } = findAdjacentEpisodes(episodes.data, activeEpisode);
    if (next) {
      handleEpisodeSelect(next);
    }
  }, [activeEpisode, autoNext, episodes.data, handleEpisodeSelect]);

  if (info.isLoading && !info.data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <WatchScreenSkeleton onBack={handleBack} />
      </SafeAreaView>
    );
  }

  if (info.isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <WatchBackButton onPress={handleBack} variant="bar" />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const screenShort = Math.min(screenSize.width, screenSize.height);
  const backdropImage = info.data?.image;
  const showBackdrop = !fullscreen && !!backdropImage;

  return (
    <View style={fullscreen ? styles.fullscreenRoot : styles.root}>
      {showBackdrop ? (
        <View pointerEvents="none" style={styles.backdrop}>
          <Image
            source={{ uri: backdropImage }}
            style={styles.backdropImage}
            blurRadius={Platform.OS === 'ios' ? 18 : 8}
          />
          <LinearGradient
            colors={[...BG_GRADIENT]}
            locations={[0, 0.35, 0.7, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.backdropGradient}
          />
        </View>
      ) : null}
      <SafeAreaView
        style={
          fullscreen
            ? styles.fullscreenRoot
            : showBackdrop
              ? styles.safeAreaTransparent
              : styles.safeArea
        }
        edges={fullscreen ? [] : ['top', 'bottom']}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            fullscreen ? styles.fullscreenScrollContent : styles.scrollContent
          }
          scrollEnabled={!fullscreen}
          nestedScrollEnabled
          removeClippedSubviews={false}
        >
          <View
            style={
              fullscreen
                ? [styles.fullscreenPlayer, { minHeight: screenShort }]
                : undefined
            }
          >
            <WatchPlayerSection
              url={source.data?.url}
              isLoading={streamLoading}
              onBack={handleBack}
              onVideoEnd={handleVideoEnd}
              fillScreen={fullscreen}
              onHostFullscreenChange={setFullscreen}
            />
          </View>

          {!fullscreen ? (
            <>
              <WatchEpisodeNav
                episodes={episodes.data}
                activeEpisode={activeEpisode}
                onEpisodeSelect={handleEpisodeSelect}
                isLoading={episodes.isLoading}
                autoNext={autoNext}
                onAutoNextToggle={handleAutoNextToggle}
                onCommentPress={() => setCommentsOpen(true)}
              />

              <View style={styles.playerControls}>
                <View style={styles.serverSection}>
                  <View style={styles.streamPanel}>
                    <WatchServerList
                      servers={servers.data}
                      selectedLinkId={selectedLinkId}
                      onSelect={handleServerSelect}
                      isLoading={isServerListLoading}
                      embedded
                    />
                    <WatchDownloadList
                      downloads={downloads.data}
                      isLoading={isDownloadListLoading}
                      embedded
                    />
                  </View>
                </View>

                <WatchEpisodeList
                  episodes={episodes.data}
                  activeEpisode={activeEpisode}
                  watchedEpisodes={watchedSet}
                  onEpisodeSelect={handleEpisodeSelect}
                  isLoading={episodes.isLoading}
                />
              </View>

              <View style={styles.body}>
                <WatchNextEpisode nextEpisode={info.data?.nextEpisode} />

                <WatchAnimeInfo
                  info={info.data}
                  isLoading={info.isLoading}
                  isReminded={canRemind && reminderActive}
                  reminderMode={canRemind ? activeReminder?.mode : undefined}
                  onToggleReminder={
                    canRemind ? handleToggleReminder : undefined
                  }
                />

                {isError ? (
                  <WatchStatusMessage message={errorMessage} />
                ) : null}

                {activeEpisode ? (
                  <WatchActiveEpisodeCard episode={activeEpisode} />
                ) : episodes.isLoading ? (
                  <WatchActiveEpisodeCardSkeleton />
                ) : null}
              </View>

              <View style={styles.sections}>
                <WatchSeasonList
                  seasons={seasons.data}
                  currentId={id}
                  isLoading={seasons.isLoading}
                />

                <WatchRelatedAnimeList
                  key={info.data?.dataId}
                  title={relatedAnime.data?.title || 'Related Anime'}
                  anime={relatedAnime.data?.anime}
                  isLoading={relatedAnime.isLoading}
                />

                <WatchAnimeCarousel
                  title="Recommended"
                  items={info.data?.recommended?.map(item => ({
                    id: item.id,
                    title: item.title,
                    image: item.image,
                  }))}
                />
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <WatchComments
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        malId={malId}
        episodeNumber={activeEpisode?.episode ?? episode}
      />

      <ScheduleReminderConfirmSheet
        visible={reminderConfirmOpen}
        title={info.data?.title ?? ''}
        mode={activeReminder?.mode}
        onClose={() => setReminderConfirmOpen(false)}
        onConfirm={handleConfirmDisableReminder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullscreenRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenPlayer: {
    flex: 1,
    width: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backdropGradient: {
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeAreaTransparent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  fullscreenScrollContent: {
    flexGrow: 1,
  },
  playerControls: {
    gap: 20,
  },
  serverSection: {
    gap: 0,
  },
  streamPanel: {
    backgroundColor: '#222228',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  sections: {
    paddingTop: 24,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
