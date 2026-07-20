// Central design tokens for the whole game. Keeping every size / color here
// is what makes the UI feel consistent ("pixel perfect") across screens.

// ---- Liquid palette (vibrant, high-contrast, colour-blind friendly-ish) ----
// Each entry is {main, shade, light} so a single liquid segment can be drawn
// with a subtle top highlight + bottom shade for a glossy look.
export const LIQUIDS = [
  { main: '#F0483E', light: '#FF7A72', shade: '#C4342B' }, // red
  { main: '#FF922B', light: '#FFB165', shade: '#D9741A' }, // orange
  { main: '#FFC531', light: '#FFDC79', shade: '#E0A61B' }, // yellow
  { main: '#8FD14F', light: '#B4E585', shade: '#6FAE37' }, // lime
  { main: '#22B14C', light: '#5CD07E', shade: '#178A39' }, // green
  { main: '#17B7A6', light: '#5AD8CA', shade: '#0E8C7F' }, // teal
  { main: '#25C2E6', light: '#6FDCF5', shade: '#159CBD' }, // cyan
  { main: '#2C7BE5', light: '#6AA3F0', shade: '#1D5CB8' }, // blue
  { main: '#5A63D8', light: '#8A90EC', shade: '#3F47AF' }, // indigo
  { main: '#9B59B6', light: '#C083D8', shade: '#7A3E93' }, // purple
  { main: '#FF5C93', light: '#FF8FB6', shade: '#D63E72' }, // pink
  { main: '#A97551', light: '#C99A79', shade: '#875A3B' }, // brown
];

export const COLORS = {
  bgTop: '#141A33',
  bgBottom: '#0B0F22',
  glowA: 'rgba(92,107,192,0.35)',
  glowB: 'rgba(37,194,230,0.20)',
  glass: 'rgba(255,255,255,0.16)',
  glassBorder: 'rgba(255,255,255,0.38)',
  glassHi: 'rgba(255,255,255,0.28)',
  text: '#F5F7FF',
  textDim: 'rgba(245,247,255,0.62)',
  accent: '#25C2E6',
  accent2: '#5A63D8',
  card: 'rgba(255,255,255,0.08)',
  cardBorder: 'rgba(255,255,255,0.14)',
};

// ---- Bottle geometry (single source of truth for logic + rendering) ----
export const CAPACITY = 4;
export const SEG_H = 36; // height of one liquid unit
export const TUBE_W = 52; // inner tube width
export const HEADSPACE = 12; // empty gap above liquid inside the tube
export const TUBE_H = CAPACITY * SEG_H + HEADSPACE;
export const RADIUS_BOTTOM = 24;
export const RADIUS_TOP = 10;

export const SPACING = 8;
