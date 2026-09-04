import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../../components/AdBanner';
import Background from '../../components/Background';
import Bottle from '../../components/Bottle';
import CoinPill from '../../components/CoinPill';
import Confetti from '../../components/Confetti';
import PressButton from '../../components/PressButton';
import Stars from '../../components/Stars';
import { onLevelCompleted } from '../../ads/ads';
import { canPour, clone, isSolved, pour, pourCount, solve } from '../../game/logic';
import { generateLevel, starsFor } from '../../game/levels';
import { COST, useApp } from '../../state/AppState';
import { haptic } from '../../util/haptics';
import { initSounds, play } from '../../util/sound';
import { COLORS, TUBE_W } from '../../theme/theme';

const CELL_W = TUBE_W + 10;
const POUR_LIFT = 44; // how high the source tube rises while pouring

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Game({ level, onExit, onHome, onNext }) {
  const insets = useSafeAreaInsets();
  const { coins, spendCoins, completeLevel, save, theme } = useApp();

  // Generated once per mounted level (parent remounts via key on level change).
  const { bottles: initial, par } = useMemo(() => generateLevel(level), [level]);

  const [bottles, setBottles] = useState(() => clone(initial));
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [hintPair, setHintPair] = useState(null);
  const [extraUsed, setExtraUsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [won, setWon] = useState(false);
  const [result, setResult] = useState(null); // {stars, earned, best}

  // Per-bottle vertical lift (selection + pour gesture). Rebuilt if a bottle
  // is added. A single Animated.Value per bottle driving one translateY entry
  // is the only Animated pattern that is stable on the New Architecture here.
  const liftAnims = useMemo(
    () => bottles.map(() => new Animated.Value(0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bottles.length],
  );

  const hintTimer = useRef(null);
  const toastTimer = useRef(null);

  // Preload sound effects once.
  useEffect(() => {
    initSounds();
  }, []);

  // Level timer. Stops the moment the board is solved.
  useEffect(() => {
    if (won) return undefined;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [won]);

  // Clear pending timers on unmount so a late callback can't touch dead state.
  useEffect(
    () => () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const flash = useCallback(msg => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
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

  const finish = (finalMoves, finalSeconds) => {
    const stars = starsFor(finalMoves, par);
    const prevBest = save.bestTime[level];
    const earned = completeLevel(level, {
      moves: finalMoves,
      stars,
      seconds: finalSeconds,
    });
    setResult({
      stars,
      earned,
      newBest: !prevBest || finalSeconds < prevBest,
    });
    setWon(true);
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
      const nextMoves = moves + 1;
      setHistory(h => [...h, clone(bottles)]);
      setBottles(next);
      setMoves(nextMoves);

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
          finish(nextMoves, seconds);
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
    setResult(null);
  };

  const restart = () => {
    if (animating) return;
    clearHint();
    if (selected != null) setLift(selected, 0);
    setSelected(null);
    setBottles(clone(initial));
    setHistory([]);
    setMoves(0);
    setSeconds(0);
    setExtraUsed(false);
    setWon(false);
    setResult(null);
  };

  const addBottle = () => {
    if (animating || extraUsed || won) return;
    if (!spendCoins(COST.bottle)) {
      haptic('notificationError');
      play('error');
      flash(`Need ${COST.bottle - coins} more coins`);
      return;
    }
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
    const sol = solve(bottles);
    if (!sol || sol.length === 0) {
      haptic('notificationError');
      play('error');
      flash('No move can solve this — try Undo');
      return;
    }
    // Only charge once we know there is a hint worth selling.
    if (!spendCoins(COST.hint)) {
      haptic('notificationError');
      play('error');
      flash(`Need ${COST.hint - coins} more coins`);
      return;
    }
    clearHint();
    const [f, t] = sol[0];
    setHintPair({ from: f, to: t });
    hintTimer.current = setTimeout(() => setHintPair(null), 1600);
  };

  // The interstitial (if one is due) plays between levels, never mid-puzzle.
  const goNext = () => onLevelCompleted(onNext);

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
          <CoinPill coins={coins} />
        </View>

        {/* stats strip */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{moves}</Text>
            <Text style={styles.statLabel}>moves</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatTime(seconds)}</Text>
            <Text style={styles.statLabel}>time</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{par}</Text>
            <Text style={styles.statLabel}>par</Text>
          </View>
          {save.bestTime[level] ? (
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {formatTime(save.bestTime[level])}
              </Text>
              <Text style={styles.statLabel}>best</Text>
            </View>
          ) : null}
        </View>

        {/* board */}
        <View style={styles.boardWrap}>
          <View style={styles.board}>
            {bottles.map((b, i) => {
              const hinted =
                hintPair && (hintPair.from === i || hintPair.to === i);
              return (
                <Pressable key={i} onPress={() => onTap(i)} style={styles.cell}>
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

        {toast ? <Text style={styles.toast}>{toast}</Text> : null}

        {/* tools */}
        <View style={styles.tools}>
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
            label={`${COST.hint}🪙`}
            onPress={hint}
            disabled={animating || won}
          />
          <PressButton
            variant="tool"
            icon="➕"
            label={extraUsed ? 'Used' : `${COST.bottle}🪙`}
            onPress={addBottle}
            disabled={extraUsed || animating || won}
          />
        </View>

        <AdBanner style={{ marginBottom: insets.bottom + 4 }} />
      </View>

      {/* win overlay */}
      {won && result && (
        <View style={styles.winOverlay} pointerEvents="box-none">
          <Confetti count={70} />
          <View style={styles.winCard}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={styles.winTitle}>Level Complete!</Text>
            <Stars value={result.stars} size={30} style={styles.winStars} />
            <Text style={styles.winSub}>
              {moves} moves · {formatTime(seconds)}
              {result.newBest ? ' · new best!' : ''}
            </Text>
            <Text style={[styles.winCoins, { color: theme.accent }]}>
              {result.earned > 0
                ? `+${result.earned} 🪙`
                : 'Beat your star count to earn more'}
            </Text>
            <PressButton label="Next Level" icon="▶" onPress={goNext} />
            <Pressable onPress={restart} style={styles.winSecondary}>
              <Text style={styles.winSecondaryText}>Replay for 3 ★</Text>
            </Pressable>
            <Pressable onPress={onHome} style={styles.winSecondary}>
              <Text style={styles.winSecondaryText}>Home</Text>
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stat: { alignItems: 'center', marginHorizontal: 16 },
  statValue: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  statLabel: { color: COLORS.textDim, fontSize: 10, letterSpacing: 1 },
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
  toast: {
    color: '#FFD54A',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 8,
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
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: '#1B2447',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  winEmoji: { fontSize: 48 },
  winTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 4,
  },
  winStars: { marginTop: 10 },
  winSub: { color: COLORS.textDim, fontSize: 14, marginTop: 8 },
  winCoins: { fontSize: 15, fontWeight: '800', marginTop: 6, marginBottom: 20 },
  winSecondary: { marginTop: 12, padding: 6 },
  winSecondaryText: { color: COLORS.textDim, fontSize: 14, fontWeight: '700' },
});
