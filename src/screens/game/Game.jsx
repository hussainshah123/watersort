import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Background from '../../components/Background';
import Bottle from '../../components/Bottle';
import Confetti from '../../components/Confetti';
import PressButton from '../../components/PressButton';
import { canPour, clone, isSolved, pour, pourCount, solve } from '../../game/logic';
import { generateLevel } from '../../game/levels';
import { haptic } from '../../util/haptics';
import { initSounds, play } from '../../util/sound';
import { COLORS, TUBE_W } from '../../theme/theme';

const CELL_W = TUBE_W + 10;
const POUR_LIFT = 44; // how high the source tube rises while pouring

export default function Game({ level, onExit, onNext }) {
  const insets = useSafeAreaInsets();

  // Generated once per mounted level (parent remounts via key on level change).
  const initial = useMemo(() => generateLevel(level), [level]);

  const [bottles, setBottles] = useState(() => clone(initial));
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [moves, setMoves] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [hintPair, setHintPair] = useState(null);
  const [extraUsed, setExtraUsed] = useState(false);
  const [won, setWon] = useState(false);

  // Per-bottle vertical lift (selection + pour gesture). Rebuilt if a bottle
  // is added. A single Animated.Value per bottle driving one translateY entry
  // is the only Animated pattern that is stable on the New Architecture here.
  const liftAnims = useMemo(
    () => bottles.map(() => new Animated.Value(0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bottles.length],
  );

  const hintTimer = useRef(null);

  // Preload sound effects once.
  useEffect(() => {
    initSounds();
  }, []);

  const setLift = (index, to) =>
    Animated.spring(liftAnims[index], {
      toValue: to,
      useNativeDriver: true,
      friction: 6,
      tension: 200,
    }).start();

  const clearHint = () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHintPair(null);
  };

  const applyPour = (from, to) => {
    clearHint();
    const n = pourCount(bottles, from, to);
    if (n === 0) return;

    setSelected(null);
    setAnimating(true);
    haptic('impactLight');
    play('pour');

    const src = liftAnims[from];
    // Phase 1: lift the source tube (single-value translateY — the only kind
    // of Animated update that is safe under the New Architecture here).
    Animated.timing(src, {
      toValue: -POUR_LIFT,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        setAnimating(false);
        return;
      }
      // Commit the pour at the top of the lift.
      const next = pour(bottles, from, to);
      setHistory(h => [...h, clone(bottles)]);
      setBottles(next);
      setMoves(m => m + 1);

      // Phase 2: set the tube back down.
      Animated.timing(src, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setAnimating(false);
        if (isSolved(next)) {
          haptic('notificationSuccess');
          play('win');
          setWon(true);
        }
      });
    });
  };

  const onTap = i => {
    if (animating || won) return;
    if (selected == null) {
      if (bottles[i].length === 0) return;
      setSelected(i);
      setLift(i, -16);
      haptic('selection');
      play('select');
      return;
    }
    if (selected === i) {
      setLift(i, 0);
      setSelected(null);
      return;
    }
    if (canPour(bottles, selected, i)) {
      applyPour(selected, i);
    } else {
      // Invalid target: move the selection to the newly tapped tube.
      setLift(selected, 0);
      if (bottles[i].length > 0) {
        setSelected(i);
        setLift(i, -16);
        haptic('selection');
        play('select');
      } else {
        setSelected(null);
      }
    }
  };

  const undo = () => {
    if (animating || history.length === 0) return;
    clearHint();
    if (selected != null) setLift(selected, 0);
    setSelected(null);
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setBottles(clone(prev));
    setMoves(m => Math.max(0, m - 1));
    setWon(false);
  };

  const restart = () => {
    if (animating) return;
    clearHint();
    if (selected != null) setLift(selected, 0);
    setSelected(null);
    setBottles(clone(initial));
    setHistory([]);
    setMoves(0);
    setExtraUsed(false);
    setWon(false);
  };

  const addBottle = () => {
    if (animating || extraUsed || won) return;
    clearHint();
    if (selected != null) setLift(selected, 0);
    setSelected(null);
    setExtraUsed(true);
    setBottles(b => [...b, []]);
    // Keep undo history structurally consistent with the new bottle count.
    setHistory(h => h.map(s => [...s, []]));
  };

  const hint = () => {
    if (animating || won) return;
    clearHint();
    const sol = solve(bottles);
    if (!sol || sol.length === 0) {
      haptic('notificationError');
      play('error');
      return;
    }
    const [f, t] = sol[0];
    setHintPair({ from: f, to: t });
    hintTimer.current = setTimeout(() => setHintPair(null), 1400);
  };

  return (
    <Background>
      <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
        {/* top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onExit} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>‹</Text>
          </Pressable>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>LEVEL {level}</Text>
          </View>
          <View style={styles.movesBox}>
            <Text style={styles.movesText}>{moves}</Text>
            <Text style={styles.movesLabel}>moves</Text>
          </View>
        </View>

        {/* board */}
        <View style={styles.boardWrap}>
          <View style={styles.board}>
            {bottles.map((b, i) => {
              const hinted =
                hintPair && (hintPair.from === i || hintPair.to === i);
              return (
                <Pressable
                  key={i}
                  onPress={() => onTap(i)}
                  style={styles.cell}
                >
                  <Bottle
                    colors={b}
                    selected={selected === i}
                    liftAnim={liftAnims[i]}
                    hint={hinted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* tools */}
        <View style={[styles.tools, { paddingBottom: insets.bottom + 10 }]}>
          <PressButton
            variant="tool"
            icon="↩"
            label="Undo"
            onPress={undo}
            disabled={history.length === 0 || animating}
          />
          <PressButton
            variant="tool"
            icon="↻"
            label="Restart"
            onPress={restart}
            disabled={animating}
          />
          <PressButton
            variant="tool"
            icon="💡"
            label="Hint"
            onPress={hint}
            disabled={animating || won}
          />
          <PressButton
            variant="tool"
            icon="➕"
            label="Bottle"
            onPress={addBottle}
            disabled={extraUsed || animating || won}
          />
        </View>
      </View>

      {/* win overlay */}
      {won && (
        <View style={styles.winOverlay} pointerEvents="box-none">
          <Confetti count={70} />
          <View style={styles.winCard}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={styles.winTitle}>Level Complete!</Text>
            <Text style={styles.winSub}>
              Level {level} solved in {moves} moves
            </Text>
            <PressButton label="Next Level" icon="▶" onPress={onNext} />
            <Pressable onPress={onExit} style={styles.winHome}>
              <Text style={styles.winHomeText}>Home</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 12 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  levelPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  levelText: {
    color: COLORS.text,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 15,
  },
  movesBox: { width: 44, alignItems: 'center' },
  movesText: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  movesLabel: { color: COLORS.textDim, fontSize: 10 },
  boardWrap: { flex: 1, justifyContent: 'center' },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cell: {
    width: CELL_W,
    marginHorizontal: 7,
    marginTop: 26,
    marginBottom: 10,
    alignItems: 'center',
  },
  cellSource: { zIndex: 100, elevation: 100 },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
  },
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,9,20,0.55)',
  },
  winCard: {
    width: '82%',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: '#1B2447',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  winEmoji: { fontSize: 54 },
  winTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  winSub: { color: COLORS.textDim, fontSize: 14, marginTop: 6, marginBottom: 22 },
  winHome: { marginTop: 16, padding: 8 },
  winHomeText: { color: COLORS.textDim, fontSize: 15, fontWeight: '700' },
});
