// Thin AsyncStorage wrapper. The whole save file is one JSON blob — it is a
// few kilobytes at most, and writing it atomically avoids half-saved states.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'watersort.save.v1';

export const DEFAULT_SAVE = {
  unlocked: 1, // highest level the player may enter
  coins: 100,
  stars: {}, // { [level]: 1|2|3 }
  bestMoves: {}, // { [level]: number }
  bestTime: {}, // { [level]: seconds }
  themeId: 'midnight',
  ownedThemes: ['midnight'],
  lastDailyClaim: null, // 'YYYY-MM-DD'
  dailyStreak: 0,
  settings: { sound: true, haptics: true },
};

export async function loadSave() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    // Merge so a save written by an older build never misses a newer field.
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
    };
  } catch (e) {
    return { ...DEFAULT_SAVE };
  }
}

export async function persistSave(save) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    // Losing a write is survivable; never crash gameplay over it.
  }
}

export async function clearSave() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    // ignore
  }
}
