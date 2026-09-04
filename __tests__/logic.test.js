import { canPour, isSolved, pour, solve, topInfo } from '../src/game/logic';
import { generateLevel, starsFor } from '../src/game/levels';

test('topInfo returns the top contiguous run', () => {
  expect(topInfo([0, 1, 1, 1])).toEqual({ color: 1, count: 3 });
  expect(topInfo([])).toEqual({ color: null, count: 0 });
});

test('canPour respects colour match and capacity', () => {
  const s = [[0, 0], [0], [], [1, 1, 1, 1]];
  expect(canPour(s, 0, 1)).toBe(true); // 0 onto 0
  expect(canPour(s, 0, 2)).toBe(true); // onto empty
  expect(canPour(s, 0, 3)).toBe(false); // full + colour mismatch
  expect(canPour(s, 2, 0)).toBe(false); // empty source
});

test('pour moves the whole top run when there is room', () => {
  const s = [[1, 0, 0], [0]];
  const ns = pour(s, 0, 1);
  expect(ns[0]).toEqual([1]);
  expect(ns[1]).toEqual([0, 0, 0]);
});

test('isSolved only when every tube is empty or a full single colour', () => {
  expect(isSolved([[0, 0, 0, 0], []])).toBe(true);
  expect(isSolved([[0, 0, 0], []])).toBe(false);
});

test('solver solves a simple scramble', () => {
  const s = [[0, 1, 0, 1], [1, 0, 1, 0], [], []];
  const sol = solve(s);
  expect(Array.isArray(sol)).toBe(true);
  let cur = s;
  sol.forEach(([f, t]) => {
    cur = pour(cur, f, t);
    expect(cur).not.toBeNull();
  });
  expect(isSolved(cur)).toBe(true);
});

test('generated levels are always solvable', () => {
  for (const level of [1, 3, 6, 10, 15]) {
    const { bottles, par } = generateLevel(level);
    expect(isSolved(bottles)).toBe(false);
    expect(solve(bottles)).not.toBeNull();
    expect(par).toBeGreaterThan(0);
  }
});

test('level generation is deterministic', () => {
  for (const level of [1, 4, 9]) {
    expect(generateLevel(level).bottles).toEqual(generateLevel(level).bottles);
  }
});

test('stars drop as the player drifts from par', () => {
  expect(starsFor(10, 10)).toBe(3);
  expect(starsFor(12, 10)).toBe(3);
  expect(starsFor(13, 10)).toBe(2);
  expect(starsFor(16, 10)).toBe(2);
  expect(starsFor(17, 10)).toBe(1);
});
