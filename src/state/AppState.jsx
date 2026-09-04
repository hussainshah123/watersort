import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_SAVE, clearSave, loadSave, persistSave } from './storage';
import { themeById } from '../theme/themes';
import { setHapticsEnabled } from '../util/haptics';
import { setSoundEnabled } from '../util/sound';

// Prices for the in-game helpers, and the payouts for finishing a level.
export const COST = { hint: 25, bottle: 60 };
export const REWARD = { base: 15, perStar: 10, daily: 60, dailyStreakBonus: 15 };

const AppCtx = createContext(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>');
  return ctx;
}

// Local calendar day, used for the once-a-day bonus.
export function todayKey(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function AppStateProvider({ children }) {
  const [save, setSave] = useState(DEFAULT_SAVE);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // Hydrate once on boot.
  useEffect(() => {
    let alive = true;
    loadSave().then(s => {
      if (!alive) return;
      setSave(s);
      setSoundEnabled(s.settings.sound);
      setHapticsEnabled(s.settings.haptics);
      hydrated.current = true;
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist on every change, but never before hydration (that would overwrite
  // a real save with the defaults on a slow first read).
  useEffect(() => {
    if (!hydrated.current) return;
    persistSave(save);
  }, [save]);

  const update = useCallback(fn => setSave(prev => fn(prev)), []);

  // Records a finished level and returns the coins it paid out. Everything the
  // return value depends on is read from the current `save` (a React state
  // updater does not run synchronously, so a value computed inside one cannot
  // be returned from here).
  const completeLevel = useCallback(
    (level, { moves, stars, seconds }) => {
      const prevStars = save.stars[level] || 0;
      // A level pays out in full the first time; a replay only pays the
      // difference if the player improved their star count.
      const earned =
        prevStars > 0
          ? Math.max(0, (stars - prevStars) * REWARD.perStar)
          : REWARD.base + stars * REWARD.perStar;

      update(prev => {
        const bestMoves = prev.bestMoves[level];
        const bestTime = prev.bestTime[level];
        return {
          ...prev,
          coins: prev.coins + earned,
          unlocked: Math.max(prev.unlocked, level + 1),
          stars: {
            ...prev.stars,
            [level]: Math.max(prev.stars[level] || 0, stars),
          },
          bestMoves: {
            ...prev.bestMoves,
            [level]: bestMoves ? Math.min(bestMoves, moves) : moves,
          },
          bestTime: {
            ...prev.bestTime,
            [level]: bestTime ? Math.min(bestTime, seconds) : seconds,
          },
        };
      });
      return earned;
    },
    [save.stars, update],
  );

  const addCoins = useCallback(n => update(p => ({ ...p, coins: p.coins + n })), [update]);

  // Returns false (and changes nothing) when the player cannot afford it.
  const spendCoins = useCallback(
    n => {
      if (save.coins < n) return false;
      update(prev => (prev.coins < n ? prev : { ...prev, coins: prev.coins - n }));
      return true;
    },
    [save.coins, update],
  );

  const setSetting = useCallback(
    (key, value) => {
      if (key === 'sound') setSoundEnabled(value);
      if (key === 'haptics') setHapticsEnabled(value);
      update(p => ({ ...p, settings: { ...p.settings, [key]: value } }));
    },
    [update],
  );

  const buyTheme = useCallback(
    id => {
      if (save.ownedThemes.includes(id)) return false;
      const t = themeById(id);
      if (save.coins < t.price) return false;
      update(prev =>
        prev.ownedThemes.includes(id)
          ? prev
          : {
              ...prev,
              coins: prev.coins - t.price,
              ownedThemes: [...prev.ownedThemes, id],
              themeId: id,
            },
      );
      return true;
    },
    [save.coins, save.ownedThemes, update],
  );

  const selectTheme = useCallback(
    id =>
      update(p => (p.ownedThemes.includes(id) ? { ...p, themeId: id } : p)),
    [update],
  );

  const dailyAvailable = save.lastDailyClaim !== todayKey();

  const claimDaily = useCallback(() => {
    const today = todayKey();
    if (save.lastDailyClaim === today) return 0;

    const streak =
      save.lastDailyClaim === yesterdayKey() ? save.dailyStreak + 1 : 1;
    // The streak bonus tops out at day 7 so the payout stays sane.
    const amount =
      REWARD.daily + Math.min(streak - 1, 6) * REWARD.dailyStreakBonus;

    update(prev =>
      prev.lastDailyClaim === today
        ? prev
        : {
            ...prev,
            coins: prev.coins + amount,
            lastDailyClaim: today,
            dailyStreak: streak,
          },
    );
    return amount;
  }, [save.lastDailyClaim, save.dailyStreak, update]);

  const resetProgress = useCallback(() => {
    clearSave();
    setSave({ ...DEFAULT_SAVE });
    setSoundEnabled(DEFAULT_SAVE.settings.sound);
    setHapticsEnabled(DEFAULT_SAVE.settings.haptics);
  }, []);

  const theme = useMemo(() => themeById(save.themeId), [save.themeId]);

  const value = useMemo(
    () => ({
      ready,
      save,
      theme,
      coins: save.coins,
      unlocked: save.unlocked,
      settings: save.settings,
      dailyAvailable,
      completeLevel,
      addCoins,
      spendCoins,
      setSetting,
      buyTheme,
      selectTheme,
      claimDaily,
      resetProgress,
    }),
    [
      ready,
      save,
      theme,
      dailyAvailable,
      completeLevel,
      addCoins,
      spendCoins,
      setSetting,
      buyTheme,
      selectTheme,
      claimDaily,
      resetProgress,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

// Theme-only accessor. Falls back to the default theme when used outside the
// provider (e.g. in a snapshot test) so presentational components stay safe to
// render on their own.
export function useTheme() {
  const ctx = useContext(AppCtx);
  return ctx ? ctx.theme : themeById(null);
}
