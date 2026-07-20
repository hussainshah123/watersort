// Pure, framework-free game logic. A "state" is an array of bottles; each
// bottle is an array of colour ids ordered bottom -> top (last item = top).
import { CAPACITY } from '../theme/theme';

export function clone(state) {
  return state.map(b => b.slice());
}

// Top contiguous run of the same colour: {color, count}.
export function topInfo(bottle) {
  if (bottle.length === 0) return { color: null, count: 0 };
  const color = bottle[bottle.length - 1];
  let count = 1;
  for (let i = bottle.length - 2; i >= 0 && bottle[i] === color; i--) count++;
  return { color, count };
}

export function canPour(state, from, to) {
  if (from === to) return false;
  const src = state[from];
  const dst = state[to];
  if (src.length === 0) return false;
  if (dst.length >= CAPACITY) return false;
  const { color } = topInfo(src);
  if (dst.length === 0) return true;
  return dst[dst.length - 1] === color;
}

// How many units would actually move (limited by destination free space).
export function pourCount(state, from, to) {
  if (!canPour(state, from, to)) return 0;
  const { count } = topInfo(state[from]);
  const space = CAPACITY - state[to].length;
  return Math.min(count, space);
}

export function pour(state, from, to) {
  const n = pourCount(state, from, to);
  if (n === 0) return null;
  const ns = clone(state);
  const { color } = topInfo(ns[from]);
  for (let i = 0; i < n; i++) {
    ns[from].pop();
    ns[to].push(color);
  }
  return ns;
}

// A bottle is "done" when empty or full of a single colour.
export function isSolved(state) {
  return state.every(
    b => b.length === 0 || (b.length === CAPACITY && b.every(c => c === b[0])),
  );
}

// Order-independent fingerprint so the solver treats identical layouts (and
// interchangeable empty bottles) as the same node.
function canon(state) {
  return state
    .map(b => b.join(','))
    .sort()
    .join('|');
}

// Depth-first solver. Returns a full list of [from, to] moves that solves the
// state, or null. Used both to guarantee generated levels are solvable and to
// power the Hint button (path[0] is always a safe, progress-making move).
export function solve(state, maxIter = 400000) {
  const start = clone(state);
  const visited = new Set([canon(start)]);
  const stack = [{ state: start, path: [] }];
  let iter = 0;

  while (stack.length) {
    if (++iter > maxIter) return null;
    const { state: cur, path } = stack.pop();
    if (isSolved(cur)) return path;

    const n = cur.length;
    for (let f = 0; f < n; f++) {
      if (cur[f].length === 0) continue;
      const info = topInfo(cur[f]);
      const pure = info.count === cur[f].length;
      // Never disturb a completed bottle, and never move a pure bottle into an
      // empty one (that only shuffles the problem sideways).
      if (pure && cur[f].length === CAPACITY) continue;

      for (let t = 0; t < n; t++) {
        if (f === t || !canPour(cur, f, t)) continue;
        if (pure && cur[t].length === 0) continue;
        const ns = pour(cur, f, t);
        const key = canon(ns);
        if (visited.has(key)) continue;
        visited.add(key);
        stack.push({ state: ns, path: [...path, [f, t]] });
      }
    }
  }
  return null;
}
