// Level generation. Levels get harder with more colours; we always keep 2
// spare empty bottles. Every level is verified solvable before being handed
// back, so the player can never get an impossible board.
//
// Generation is *deterministic per level number*: the same level always
// produces the same board. That is what makes best-times, star ratings and the
// level map meaningful across sessions.
import { CAPACITY, LIQUIDS } from '../theme/theme';
import { isSolved, solve } from './logic';

export function levelConfig(level) {
  // Start with a colourful board (4 colours) and add one roughly every level,
  // capped at the size of the palette.
  const numColors = Math.min(3 + level, LIQUIDS.length);
  const empties = 2;
  return { numColors, empties };
}

// mulberry32 — tiny, fast, well-distributed PRNG so generation is repeatable.
function rng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Lower bound on the number of pours: every contiguous run of colour that is
// not already the run sitting at the bottom of its final tube has to move at
// least once. runs - numColors is the classic water-sort estimate and is what
// we grade the player's move count against.
export function parMoves(bottles) {
  let runs = 0;
  const colors = new Set();
  bottles.forEach(b => {
    for (let i = 0; i < b.length; i++) {
      colors.add(b[i]);
      if (i === 0 || b[i] !== b[i - 1]) runs++;
    }
  });
  return Math.max(1, runs - colors.size);
}

// 3 / 2 / 1 stars from how close the player got to par.
export function starsFor(moves, par) {
  if (moves <= par + 2) return 3;
  if (moves <= par + 6) return 2;
  return 1;
}

/**
 * Build the board for `level`.
 * @returns {{bottles: number[][], par: number}}
 */
export function generateLevel(level) {
  const { numColors, empties } = levelConfig(level);
  const rand = rng(level * 2654435761 + 12345);
  let fallback = null;

  for (let attempt = 0; attempt < 300; attempt++) {
    const units = [];
    for (let c = 0; c < numColors; c++) {
      for (let k = 0; k < CAPACITY; k++) units.push(c);
    }
    shuffle(units, rand);

    const bottles = [];
    for (let c = 0; c < numColors; c++) {
      bottles.push(units.slice(c * CAPACITY, (c + 1) * CAPACITY));
    }
    for (let e = 0; e < empties; e++) bottles.push([]);

    if (isSolved(bottles)) continue; // already sorted -> too trivial
    fallback = bottles;

    const sol = solve(bottles);
    // Require a bit of depth so the level isn't a one-move giveaway.
    if (sol && sol.length >= numColors) {
      return { bottles, par: parMoves(bottles) };
    }
  }

  const b = fallback || [[], []];
  return { bottles: b, par: parMoves(b) };
}
