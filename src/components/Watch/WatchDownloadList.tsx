import { useCallback, useMemo } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DownloadOption, DownloadResult } from '../../api/download';
import { colors } from '../../theme';
import { renameDownload } from '../../utils/renameServer';
import { WatchScrollFadeList } from './WatchScrollFadeList';

const PANEL_COLOR = '#222228';

type WatchDownloadListProps = {
  downloads?: DownloadResult;
  isLoading?: boolean;
  /** When true, skips the outer panel so it can share one with servers. */
  embedded?: boolean;
};

function DownloadChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    >
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

type DownloadTypeSectionProps = {
  label: string;
  options: DownloadOption[];
  onSelect: (option: DownloadOption) => void;
};

function DownloadTypeSection({
  label,
  options,
  onSelect,
}: DownloadTypeSectionProps) {
  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: DownloadOption; index: number }) => (
      <DownloadChip
        label={renameDownload(item.name, index)}
        onPress={() => onSelect(item)}
      />
    ),
    [onSelect],
  );

  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel} numberOfLines={1}>
        {label}
      </Text>
      <WatchScrollFadeList
        data={options}
        fadeColor={PANEL_COLOR}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
}

export function WatchDownloadList({
  downloads,
  isLoading,
  embedded = false,
}: WatchDownloadListProps) {
  const groups = useMemo(() => {
    const list = downloads?.downloads ?? [];
    const sub = list.filter(item => item.type === 'sub');
    const dub = list.filter(item => item.type === 'dub');
    return [
      ...(sub.length ? [{ label: 'SUB', options: sub }] : []),
      ...(dub.length ? [{ label: 'DUB', options: dub }] : []),
    ];
  }, [downloads?.downloads]);

  const handleSelect = useCallback((option: DownloadOption) => {
    void Linking.openURL(option.url);
  }, []);

  if (!groups.length || isLoading) {
    return null;
  }

  const content = (
    <>
      <Text style={styles.tip}>Downloads</Text>
      {groups.map(group => (
        <DownloadTypeSection
          key={group.label}
          label={group.label}
          options={group.options}
          onSelect={handleSelect}
        />
      ))}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  panel: {
    backgroundColor: PANEL_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tip: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupLabel: {
    width: 44,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingVertical: 1,
  },
  separator: {
    width: 6,
  },
  chip: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#3a3a44',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 140,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
