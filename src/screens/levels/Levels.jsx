import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../../components/AdBanner';
import Background from '../../components/Background';
import CoinPill from '../../components/CoinPill';
import Stars from '../../components/Stars';
import { useApp } from '../../state/AppState';
import { haptic } from '../../util/haptics';
import { COLORS } from '../../theme/theme';

const COLUMNS = 4;
// Levels are generated on demand, so the map can always show a healthy runway
// of upcoming levels beyond whatever the player has unlocked.
const LOOKAHEAD = 24;

export default function Levels({ onPlay, onBack }) {
  const insets = useSafeAreaInsets();
  const { coins, unlocked, save, theme } = useApp();

  const data = useMemo(() => {
    const total = unlocked + LOOKAHEAD;
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [unlocked]);

  // Open one row above the player's current level. initialScrollIndex is an
  // *item* index, while getItemLayout below measures in rows — with numColumns
  // those are different units, so convert explicitly.
  const startIndex = useMemo(() => {
    const row = Math.max(0, Math.floor((unlocked - 1) / COLUMNS) - 1);
    return row * COLUMNS;
  }, [unlocked]);

  const renderItem = ({ item: level }) => {
    const locked = level > unlocked;
    const stars = save.stars[level] || 0;
    const cleared = stars > 0;

    return (
      <Pressable
        disabled={locked}
        onPress={() => {
          haptic('selection');
          onPlay(level);
        }}
        style={({ pressed }) => [
          styles.cell,
          cleared && { borderColor: theme.accent },
          locked && styles.cellLocked,
          pressed && styles.cellPressed,
        ]}
      >
        <Text style={[styles.cellNum, locked && styles.cellNumLocked]}>
          {locked ? '🔒' : level}
        </Text>
        {!locked && <Stars value={stars} size={11} style={styles.cellStars} />}
      </Pressable>
    );
  };

  return (
    <Background>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Level Map</Text>
          <CoinPill coins={coins} />
        </View>

        <FlatList
          data={data}
          keyExtractor={n => String(n)}
          numColumns={COLUMNS}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({
            length: CELL_TOTAL,
            offset: CELL_TOTAL * Math.floor(index / COLUMNS),
            index,
          })}
          showsVerticalScrollIndicator={false}
        />

        <AdBanner style={{ marginBottom: insets.bottom + 4 }} />
      </View>
    </Background>
  );
}

const CELL_SIZE = 68;
const CELL_MARGIN = 6;
const CELL_TOTAL = CELL_SIZE + CELL_MARGIN * 2;

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 12 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconBtnText: { color: COLORS.text, fontSize: 30, marginTop: -4 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  list: { paddingBottom: 16 },
  row: { justifyContent: 'center' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: CELL_MARGIN,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cellLocked: { opacity: 0.45 },
  cellPressed: { opacity: 0.6 },
  cellNum: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  cellNumLocked: { fontSize: 18 },
  cellStars: { marginTop: 3 },
});
