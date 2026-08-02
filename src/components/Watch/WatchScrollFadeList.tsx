import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type FlatListProps,
  type ListRenderItem,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FADE_WIDTH = 28;

type WatchScrollFadeListProps<T> = {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  fadeColor: string;
  showFades?: boolean;
  fill?: boolean;
  scrollToIndex?: number;
  scrollToken?: number;
  itemSize?: number;
  itemStride?: number;
  contentPaddingHorizontal?: number;
  getItemLayout?: FlatListProps<T>['getItemLayout'];
  ItemSeparatorComponent?: FlatListProps<T>['ItemSeparatorComponent'];
  contentContainerStyle?: FlatListProps<T>['contentContainerStyle'];
};

function FadeEdge({
  side,
  color,
}: {
  side: 'left' | 'right';
  color: string;
}) {
  const colors = side === 'right' ? ['transparent', color] : [color, 'transparent'];

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      pointerEvents="none"
      style={[styles.fadeEdge, side === 'left' ? styles.fadeLeft : styles.fadeRight]}
    />
  );
}

export function WatchScrollFadeList<T>({
  data,
  renderItem,
  keyExtractor,
  fadeColor,
  showFades = true,
  fill = true,
  scrollToIndex,
  scrollToken = 0,
  itemSize,
  itemStride,
  contentPaddingHorizontal = 0,
  getItemLayout,
  ItemSeparatorComponent,
  contentContainerStyle,
}: WatchScrollFadeListProps<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const isScrollable = contentWidth > layoutWidth + 1;
  const showLeftFade = showFades && isScrollable && scrollX > 2;
  const showRightFade =
    showFades && isScrollable && scrollX + layoutWidth < contentWidth - 2;

  const scrollToCenteredIndex = useCallback(
    (index: number, animated = true) => {
      if (!listRef.current || index < 0 || index >= data.length) {
        return;
      }

      if (itemStride != null && itemSize != null && layoutWidth > 0) {
        const width =
          contentWidth > 0
            ? contentWidth
            : contentPaddingHorizontal * 2 + itemStride * data.length;
        const itemStart = contentPaddingHorizontal + itemStride * index;
        const itemCenter = itemStart + itemSize / 2;
        const targetOffset = itemCenter - layoutWidth / 2;
        const maxOffset = Math.max(0, width - layoutWidth);

        listRef.current.scrollToOffset({
          offset: Math.min(maxOffset, Math.max(0, targetOffset)),
          animated,
        });
        return;
      }

      listRef.current.scrollToIndex({
        index,
        animated,
        viewPosition: 0.5,
      });
    },
    [
      contentPaddingHorizontal,
      contentWidth,
      data.length,
      itemSize,
      itemStride,
      layoutWidth,
    ],
  );

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      if (itemStride != null) {
        scrollToCenteredIndex(info.index);
        return;
      }

      listRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
    },
    [itemStride, scrollToCenteredIndex],
  );

  useEffect(() => {
    if (
      scrollToIndex == null ||
      scrollToIndex < 0 ||
      scrollToIndex >= data.length ||
      layoutWidth <= 0
    ) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToCenteredIndex(scrollToIndex);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    scrollToIndex,
    scrollToken,
    data,
    layoutWidth,
    contentWidth,
    scrollToCenteredIndex,
  ]);

  return (
    <View
      style={[styles.wrap, fill && styles.wrapFill]}
      onLayout={event => setLayoutWidth(event.nativeEvent.layout.width)}
    >
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        nestedScrollEnabled
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
        onContentSizeChange={width => setContentWidth(width)}
        onScroll={event => setScrollX(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />
      {showLeftFade ? <FadeEdge side="left" color={fadeColor} /> : null}
      {showRightFade ? <FadeEdge side="right" color={fadeColor} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  wrapFill: {
    flex: 1,
    minWidth: 0,
  },
  fadeEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
  },
  fadeLeft: {
    left: 0,
  },
  fadeRight: {
    right: 0,
  },
});
