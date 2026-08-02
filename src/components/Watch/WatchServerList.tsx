import { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { Server, ServerResult, ServerType } from '../../api/server';
import { colors } from '../../theme';
import { renameServer } from '../../utils/renameServer';
import { WatchScrollFadeList } from './WatchScrollFadeList';
import { WatchServerListSkeleton } from './WatchSkeletons';

const PANEL_COLOR = '#222228';

type WatchServerListProps = {
  servers?: ServerResult;
  selectedLinkId?: string;
  onSelect: (server: Server) => void;
  isLoading?: boolean;
  /** When true, skips the outer panel so it can share one with downloads. */
  embedded?: boolean;
};

function ServerChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

type ServerTypeSectionProps = {
  type: ServerType;
  selectedLinkId?: string;
  onSelect: (server: Server) => void;
};

function ServerTypeSection({
  type,
  selectedLinkId,
  onSelect,
}: ServerTypeSectionProps) {
  const label = type.label || type.type;

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Server; index: number }) => (
      <ServerChip
        label={renameServer(item.name, index)}
        isActive={item.linkId === selectedLinkId}
        onPress={() => onSelect(item)}
      />
    ),
    [onSelect, selectedLinkId],
  );

  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel} numberOfLines={1}>
        {label}
      </Text>
      <WatchScrollFadeList
        data={type.servers}
        fadeColor={PANEL_COLOR}
        keyExtractor={item => item.linkId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
}

function ServerEmptyState({ embedded = false }: { embedded?: boolean }) {
  return (
    <View style={embedded ? styles.emptyEmbedded : styles.emptyPanel}>
      <View style={styles.emptyIcon}>
        <Ionicons name="server-outline" size={22} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No servers available</Text>
      <Text style={styles.emptySubtitle}>
        Try another episode or check back later
      </Text>
    </View>
  );
}

export function WatchServerList({
  servers,
  selectedLinkId,
  onSelect,
  isLoading,
  embedded = false,
}: WatchServerListProps) {
  const types = servers?.types.filter(type => type.servers.length > 0) ?? [];

  if (!types.length && isLoading) {
    if (embedded) {
      return <WatchServerListSkeleton embedded />;
    }

    return (
      <View style={styles.container}>
        <WatchServerListSkeleton />
      </View>
    );
  }

  if (types.length) {
    const content = (
      <>
        {servers?.message ? (
          <Text style={styles.tip}>{servers.message}</Text>
        ) : null}
        {types.map(type => (
          <ServerTypeSection
            key={type.type || type.label}
            type={type}
            selectedLinkId={selectedLinkId}
            onSelect={onSelect}
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

  if (embedded) {
    return <ServerEmptyState embedded />;
  }

  return (
    <View style={styles.container}>
      <ServerEmptyState />
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
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  emptyPanel: {
    backgroundColor: PANEL_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  emptyEmbedded: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 8,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 260,
  },
});
