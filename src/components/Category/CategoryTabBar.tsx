import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type CategoryTabBarProps = {
  tabs: { id: string; label: string }[];
  activeTabId: string;
  onSelect: (id: string) => void;
};

export function CategoryTabBar({
  tabs,
  activeTabId,
  onSelect,
}: CategoryTabBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelect(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

type CategorySubTabBarProps = {
  items: { id: string; label: string }[];
  activeItemId: string;
  onSelect: (id: string) => void;
};

export function CategorySubTabBar({
  items,
  activeItemId,
  onSelect,
}: CategorySubTabBarProps) {
  return (
    <View style={styles.subTabsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subTabs}
      >
        {items.map(item => {
          const isActive = item.id === activeItemId;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => [
                styles.subTab,
                isActive && styles.subTabActive,
                pressed && styles.tabPressed,
              ]}
            >
              <Text
                style={[
                  styles.subTabText,
                  isActive && styles.subTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.12)',
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: colors.text,
  },
  subTabsWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  subTabs: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  subTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  subTabActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(123, 140, 255, 0.35)',
  },
  subTabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  subTabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
});
