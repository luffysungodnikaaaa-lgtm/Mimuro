import { memo, useCallback, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainer } from '../ui/ScreenContainer';
import type { CategoryFilterOption } from '../../constants/categoryFilters';
import {
  CATEGORY_GENRES,
  CATEGORY_LANGUAGES,
  CATEGORY_RATINGS,
  CATEGORY_SEASONS,
  CATEGORY_SORT_OPTIONS,
  CATEGORY_SOURCES,
  CATEGORY_STATUSES,
  CATEGORY_TERM_TYPES,
  CATEGORY_YEARS,
  EMPTY_CATEGORY_FILTERS,
  getFilterSelectionSummary,
  getSortLabel,
  type CategoryFilterState,
} from '../../constants/categoryFilters';
import { colors } from '../../theme';

type CategoryFilterModalProps = {
  visible: boolean;
  filters: CategoryFilterState;
  onChange: (filters: CategoryFilterState) => void;
  onClose: () => void;
  onApply: () => void;
};

type FilterSectionProps = {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
  children: ReactNode;
};

const FilterSection = memo(function FilterSection({
  title,
  summary,
  expanded,
  onToggle,
  isLast = false,
  children,
}: FilterSectionProps) {
  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.row,
          expanded && styles.rowExpanded,
          pressed && styles.rowPressed,
          isLast && !expanded && styles.rowLast,
        ]}
      >
        <Text style={[styles.rowLabel, expanded && styles.rowLabelExpanded]}>
          {title}
        </Text>
        <View style={styles.rowRight}>
          {!expanded && summary !== 'Any' ? (
            <Text style={styles.rowSummary} numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={expanded ? colors.accent : colors.textMuted}
          />
        </View>
      </Pressable>
      {expanded ? (
        <View style={[styles.sectionBody, isLast && styles.sectionBodyLast]}>
          {children}
        </View>
      ) : null}
    </View>
  );
});

const FilterChipGrid = memo(function FilterChipGrid({
  options,
  values,
  onToggle,
}: {
  options: CategoryFilterOption[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map(option => {
        const isActive = values.includes(option.value);

        return (
          <Pressable
            key={option.value}
            onPress={() => onToggle(option.value)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

export function CategoryFilterModal({
  visible,
  filters,
  onChange,
  onClose,
  onApply,
}: CategoryFilterModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const updateFilters = useCallback(
    (patch: Partial<CategoryFilterState>) => {
      onChange({ ...filters, ...patch });
    },
    [filters, onChange],
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSection(current => (current === section ? null : section));
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenContainer>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
            <Text style={styles.headerTitle}>Filters</Text>
            <Pressable
              onPress={() => onChange(EMPTY_CATEGORY_FILTERS)}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>Reset</Text>
            </Pressable>
          </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.menu}>
            <FilterSection
              title="Genre"
              summary={getFilterSelectionSummary(filters.genres, CATEGORY_GENRES)}
              expanded={expandedSection === 'genre'}
              onToggle={() => toggleSection('genre')}
            >
              <FilterChipGrid
                options={CATEGORY_GENRES}
                values={filters.genres}
                onToggle={value =>
                  updateFilters({ genres: toggleValue(filters.genres, value) })
                }
              />
            </FilterSection>

            <FilterSection
              title="Type"
              summary={getFilterSelectionSummary(
                filters.termTypes,
                CATEGORY_TERM_TYPES,
              )}
              expanded={expandedSection === 'type'}
              onToggle={() => toggleSection('type')}
            >
              <FilterChipGrid
                options={CATEGORY_TERM_TYPES}
                values={filters.termTypes}
                onToggle={value =>
                  updateFilters({
                    termTypes: toggleValue(filters.termTypes, value),
                  })
                }
              />
            </FilterSection>

            <FilterSection
              title="Season"
              summary={getFilterSelectionSummary(filters.seasons, CATEGORY_SEASONS)}
              expanded={expandedSection === 'season'}
              onToggle={() => toggleSection('season')}
            >
              <FilterChipGrid
                options={CATEGORY_SEASONS}
                values={filters.seasons}
                onToggle={value =>
                  updateFilters({ seasons: toggleValue(filters.seasons, value) })
                }
              />
            </FilterSection>

            <FilterSection
              title="Year"
              summary={getFilterSelectionSummary(filters.years, CATEGORY_YEARS)}
              expanded={expandedSection === 'year'}
              onToggle={() => toggleSection('year')}
            >
              <FilterChipGrid
                options={CATEGORY_YEARS}
                values={filters.years}
                onToggle={value =>
                  updateFilters({ years: toggleValue(filters.years, value) })
                }
              />
            </FilterSection>

            <FilterSection
              title="Status"
              summary={getFilterSelectionSummary(
                filters.statuses,
                CATEGORY_STATUSES,
              )}
              expanded={expandedSection === 'status'}
              onToggle={() => toggleSection('status')}
            >
              <FilterChipGrid
                options={CATEGORY_STATUSES}
                values={filters.statuses}
                onToggle={value =>
                  updateFilters({
                    statuses: toggleValue(filters.statuses, value),
                  })
                }
              />
            </FilterSection>

            <FilterSection
              title="Language"
              summary={getFilterSelectionSummary(
                filters.languages,
                CATEGORY_LANGUAGES,
              )}
              expanded={expandedSection === 'language'}
              onToggle={() => toggleSection('language')}
            >
              <FilterChipGrid
                options={CATEGORY_LANGUAGES}
                values={filters.languages}
                onToggle={value =>
                  updateFilters({
                    languages: toggleValue(filters.languages, value),
                  })
                }
              />
            </FilterSection>

            <FilterSection
              title="Rating"
              summary={getFilterSelectionSummary(filters.ratings, CATEGORY_RATINGS)}
              expanded={expandedSection === 'rating'}
              onToggle={() => toggleSection('rating')}
            >
              <FilterChipGrid
                options={CATEGORY_RATINGS}
                values={filters.ratings}
                onToggle={value =>
                  updateFilters({ ratings: toggleValue(filters.ratings, value) })
                }
              />
            </FilterSection>

            <FilterSection
              title="Source"
              summary={getFilterSelectionSummary(filters.sources, CATEGORY_SOURCES)}
              expanded={expandedSection === 'source'}
              onToggle={() => toggleSection('source')}
            >
              <FilterChipGrid
                options={CATEGORY_SOURCES}
                values={filters.sources}
                onToggle={value =>
                  updateFilters({ sources: toggleValue(filters.sources, value) })
                }
              />
            </FilterSection>

            <FilterSection
              title="Episodes"
              summary={
                filters.epMin || filters.epMax
                  ? `${filters.epMin || '0'} – ${filters.epMax || '∞'}`
                  : 'Any'
              }
              expanded={expandedSection === 'episodes'}
              onToggle={() => toggleSection('episodes')}
            >
              <View style={styles.rangeRow}>
                <TextInput
                  value={filters.epMin}
                  onChangeText={value =>
                    updateFilters({ epMin: value.replace(/[^\d]/g, '') })
                  }
                  placeholder="Min"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.rangeInput}
                />
                <Text style={styles.rangeDivider}>–</Text>
                <TextInput
                  value={filters.epMax}
                  onChangeText={value =>
                    updateFilters({ epMax: value.replace(/[^\d]/g, '') })
                  }
                  placeholder="Max"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.rangeInput}
                />
              </View>
            </FilterSection>

            <FilterSection
              title="Sort By"
              summary={getSortLabel(filters.sort)}
              expanded={expandedSection === 'sort'}
              onToggle={() => toggleSection('sort')}
              isLast
            >
              <FilterChipGrid
                options={CATEGORY_SORT_OPTIONS}
                values={[filters.sort]}
                onToggle={value => updateFilters({ sort: value })}
              />
            </FilterSection>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={onApply}
            style={({ pressed }) => [
              styles.applyButton,
              pressed && styles.applyButtonPressed,
            ]}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
        </ScreenContainer>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  clearText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  menu: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#22222a',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowExpanded: {
    backgroundColor: 'rgba(123, 140, 255, 0.10)',
    borderBottomColor: 'transparent',
  },
  rowPressed: {
    backgroundColor: 'rgba(123, 140, 255, 0.06)',
  },
  rowLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  rowLabelExpanded: {
    color: colors.accent,
  },
  rowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    maxWidth: '55%',
  },
  rowSummary: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    flexShrink: 1,
  },
  sectionBody: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionBodyLast: {
    borderBottomWidth: 0,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: 'rgba(123, 140, 255, 0.12)',
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rangeInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  rangeDivider: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  applyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
  },
  applyButtonPressed: {
    opacity: 0.88,
  },
  applyButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
