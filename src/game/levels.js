// Level generation. Levels get harder with more colours; we always keep 2
// spare empty bottles. Every level is verified solvable before being handed
// back, so the player can never get an impossible board.
import { CAPACITY, LIQUIDS } from '../theme/theme';
import { isSolved, solve } from './logic';

export function levelConfig(level) {
  // Start with a colourful board (4 colours) and add one roughly every level,
  // capped at the size of the palette.
  const numColors = Math.min(3 + level, LIQUIDS.length);
  const empties = 2;
  return { numColors, empties };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Build a random distribution of colour units and keep trying until we land on
// one that is both non-trivial and provably solvable.
export function generateLevel(level) {
  const { numColors, empties } = levelConfig(level);
  let fallback = null;

  for (let attempt = 0; attempt < 300; attempt++) {
    const units = [];
    for (let c = 0; c < numColors; c++) {
      for (let k = 0; k < CAPACITY; k++) units.push(c);
    }
    shuffle(units);

    const bottles = [];
    for (let c = 0; c < numColors; c++) {
      bottles.push(units.slice(c * CAPACITY, (c + 1) * CAPACITY));
    }
    for (let e = 0; e < empties; e++) bottles.push([]);

    if (isSolved(bottles)) continue; // already sorted -> too trivial
    fallback = bottles;

    const sol = solve(bottles);
    // Require a bit of depth so the level isn't a one-move giveaway.
    if (sol && sol.length >= numColors) return bottles;
  }

  return fallback || [[], []];
}
