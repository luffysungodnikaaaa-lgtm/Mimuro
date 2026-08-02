import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Episode } from '../../api/episode';
import { colors } from '../../theme';
import { WatchEpisodeChip } from './WatchEpisodeChip';
import { WatchScrollFadeList } from './WatchScrollFadeList';
import { WatchEpisodeListSkeleton } from './WatchSkeletons';

const EPISODES_PER_PAGE = 100;
const EPISODE_CHIP_SIZE = 48;
const EPISODE_CHIP_GAP = 8;
const EPISODE_ITEM_STRIDE = EPISODE_CHIP_SIZE + EPISODE_CHIP_GAP;
const EPISODE_LIST_PADDING = 20;
const RANGE_CHIP_WIDTH = 72;
const RANGE_CHIP_GAP = 8;
const RANGE_ITEM_STRIDE = RANGE_CHIP_WIDTH + RANGE_CHIP_GAP;
const RANGE_LIST_PADDING = 20;

type EpisodeRange = {
  label: string;
  episodes: Episode[];
};

type WatchEpisodeListProps = {
  episodes?: Episode[];
  activeEpisode?: Episode;
  watchedEpisodes?: Set<number>;
  onEpisodeSelect: (episode: Episode) => void;
  isLoading?: boolean;
};

function buildEpisodeRanges(episodes: Episode[]): EpisodeRange[] {
  const ranges: EpisodeRange[] = [];

  for (let index = 0; index < episodes.length; index += EPISODES_PER_PAGE) {
    const chunk = episodes.slice(index, index + EPISODES_PER_PAGE);
    const start = chunk[0]?.episode ?? index + 1;
    const end = chunk[chunk.length - 1]?.episode ?? start;

    ranges.push({
      label: `${start}-${end}`,
      episodes: chunk,
    });
  }

  return ranges;
}

function findRangeIndex(ranges: EpisodeRange[], episode?: Episode) {
  if (!episode) {
    return 0;
  }

  const index = ranges.findIndex(range =>
    range.episodes.some(item => item.episodeId === episode.episodeId),
  );

  return index >= 0 ? index : 0;
}

function findEpisodeIndexInRange(range: EpisodeRange | undefined, episode?: Episode) {
  if (!episode || !range?.episodes.length) {
    return -1;
  }

  return range.episodes.findIndex(
    item => item.episodeId === episode.episodeId,
  );
}

export function WatchEpisodeList({
  episodes,
  activeEpisode,
  watchedEpisodes,
  onEpisodeSelect,
  isLoading,
}: WatchEpisodeListProps) {
  const ranges = useMemo(() => buildEpisodeRanges(episodes ?? []), [episodes]);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [rangeScrollIndex, setRangeScrollIndex] = useState(0);
  const [rangeScrollToken, setRangeScrollToken] = useState(0);
  const [episodeScrollIndex, setEpisodeScrollIndex] = useState(0);
  const [episodeScrollToken, setEpisodeScrollToken] = useState(0);
  const selectedRange = ranges[selectedRangeIndex];
  const showRangePicker = ranges.length > 1;

  useEffect(() => {
    const rangeIndex = findRangeIndex(ranges, activeEpisode);
    setSelectedRangeIndex(rangeIndex);

    if (rangeIndex >= 0) {
      setRangeScrollIndex(rangeIndex);
      setRangeScrollToken(token => token + 1);
    }

    if (!activeEpisode || !ranges[rangeIndex]?.episodes.length) {
      return;
    }

    const index = findEpisodeIndexInRange(ranges[rangeIndex], activeEpisode);

    if (index >= 0) {
      setEpisodeScrollIndex(index);
      setEpisodeScrollToken(token => token + 1);
    }
  }, [activeEpisode?.episodeId, ranges]);

  const handleRangeSelect = useCallback(
    (index: number) => {
      setSelectedRangeIndex(index);
      setRangeScrollIndex(index);
      setRangeScrollToken(token => token + 1);

      const activeIndex = findEpisodeIndexInRange(ranges[index], activeEpisode);
      setEpisodeScrollIndex(activeIndex >= 0 ? activeIndex : 0);
      setEpisodeScrollToken(token => token + 1);
    },
    [activeEpisode, ranges],
  );

  const getRangeItemLayout = useCallback(
    (_: ArrayLike<EpisodeRange> | null | undefined, index: number) => ({
      length: RANGE_ITEM_STRIDE,
      offset: RANGE_ITEM_STRIDE * index,
      index,
    }),
    [],
  );

  const getEpisodeItemLayout = useCallback(
    (_: ArrayLike<Episode> | null | undefined, index: number) => ({
      length: EPISODE_ITEM_STRIDE,
      offset: EPISODE_ITEM_STRIDE * index,
      index,
    }),
    [],
  );

  const renderRange = useCallback(
    ({ item, index }: { item: EpisodeRange; index: number }) => {
      const isActive = index === selectedRangeIndex;

      return (
        <View style={styles.rangeItem}>
          <Pressable
            onPress={() => handleRangeSelect(index)}
            style={({ pressed }) => [
              styles.rangeChip,
              isActive && styles.rangeChipActive,
              pressed && styles.rangeChipPressed,
            ]}
          >
            <Text
              style={[
                styles.rangeChipText,
                isActive && styles.rangeChipTextActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {item.label}
            </Text>
          </Pressable>
        </View>
      );
    },
    [handleRangeSelect, selectedRangeIndex],
  );

  const renderEpisode = useCallback(
    ({ item }: { item: Episode }) => (
      <View style={styles.episodeItem}>
        <WatchEpisodeChip
          item={item}
          isActive={item.episode === activeEpisode?.episode}
          isWatched={watchedEpisodes?.has(item.episode)}
          onPress={() => onEpisodeSelect(item)}
        />
      </View>
    ),
    [activeEpisode?.episode, onEpisodeSelect, watchedEpisodes],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Episodes</Text>
        {episodes?.length ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{episodes.length}</Text>
          </View>
        ) : null}
      </View>

      {isLoading && !episodes?.length ? (
        <WatchEpisodeListSkeleton />
      ) : episodes?.length ? (
        <>
          {showRangePicker ? (
            <WatchScrollFadeList
              data={ranges}
              fadeColor={colors.background}
              showFades={false}
              fill={false}
              scrollToIndex={rangeScrollIndex}
              scrollToken={rangeScrollToken}
              itemSize={RANGE_CHIP_WIDTH}
              itemStride={RANGE_ITEM_STRIDE}
              contentPaddingHorizontal={RANGE_LIST_PADDING}
              getItemLayout={getRangeItemLayout}
              keyExtractor={item => item.label}
              renderItem={renderRange}
              contentContainerStyle={styles.rangeList}
            />
          ) : null}

          <WatchScrollFadeList
            data={selectedRange?.episodes ?? []}
            fadeColor={colors.background}
            showFades={false}
            fill={false}
            scrollToIndex={episodeScrollIndex}
            scrollToken={episodeScrollToken}
            itemSize={EPISODE_CHIP_SIZE}
            itemStride={EPISODE_ITEM_STRIDE}
            contentPaddingHorizontal={EPISODE_LIST_PADDING}
            getItemLayout={getEpisodeItemLayout}
            keyExtractor={item => `${item.episodeId}-${item.episode}`}
            renderItem={renderEpisode}
            contentContainerStyle={styles.list}
          />
        </>
      ) : (
        <Text style={styles.emptyText}>No episodes found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(123, 140, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  rangeList: {
    paddingVertical: 2,
    paddingHorizontal: RANGE_LIST_PADDING,
  },
  rangeItem: {
    width: RANGE_ITEM_STRIDE,
    paddingRight: RANGE_CHIP_GAP,
  },
  rangeChip: {
    width: RANGE_CHIP_WIDTH,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeChipActive: {
    backgroundColor: colors.accent,
  },
  rangeChipPressed: {
    opacity: 0.85,
  },
  rangeChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  rangeChipTextActive: {
    color: colors.text,
  },
  list: {
    paddingVertical: 2,
    paddingHorizontal: EPISODE_LIST_PADDING,
  },
  episodeItem: {
    width: EPISODE_ITEM_STRIDE,
    paddingRight: EPISODE_CHIP_GAP,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: 20,
  },
});
