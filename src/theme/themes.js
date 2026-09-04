// Unlockable visual themes. A theme swaps the background gradient, the accent
// colour and the liquid palette — i.e. everything the player actually looks at
// — while the layout tokens in theme.js stay fixed.
import { LIQUIDS } from './theme';

// Helper: build a {main, light, shade} entry from a single hex.
function tint(hex, lightPct, shadePct) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c, pct, target) => Math.round(c + (target - c) * pct);
  const hexOf = (rr, gg, bb) =>
    '#' + [rr, gg, bb].map(v => v.toString(16).padStart(2, '0')).join('');
  return {
    main: hex,
    light: hexOf(mix(r, lightPct, 255), mix(g, lightPct, 255), mix(b, lightPct, 255)),
    shade: hexOf(mix(r, shadePct, 0), mix(g, shadePct, 0), mix(b, shadePct, 0)),
  };
}

const palette = hexes => hexes.map(h => tint(h, 0.38, 0.22));

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight',
    price: 0,
    bgTop: '#141A33',
    bgBottom: '#0B0F22',
    glowA: 'rgba(92,107,192,0.35)',
    glowB: 'rgba(37,194,230,0.20)',
    accent: '#25C2E6',
    accent2: '#5A63D8',
    onAccent: '#04121A',
    liquids: LIQUIDS,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    price: 250,
    bgTop: '#3B1B3F',
    bgBottom: '#160B1E',
    glowA: 'rgba(255,120,90,0.30)',
    glowB: 'rgba(255,190,90,0.18)',
    accent: '#FF8A5B',
    accent2: '#D8456F',
    onAccent: '#200A06',
    liquids: palette([
      '#FF5C5C', '#FF8A3D', '#FFC24B', '#F2E14C', '#9ED45B', '#3FBF9B',
      '#39B8D6', '#4C7FE0', '#7B62E0', '#B458D6', '#FF6FA8', '#C08457',
    ]),
  },
  {
    id: 'forest',
    name: 'Forest',
    price: 400,
    bgTop: '#12291F',
    bgBottom: '#07130E',
    glowA: 'rgba(72,187,120,0.28)',
    glowB: 'rgba(180,230,120,0.16)',
    accent: '#5CD68A',
    accent2: '#2E9E6B',
    onAccent: '#04160C',
    liquids: palette([
      '#E4572E', '#F49D37', '#F2D14C', '#A8D84B', '#4CAF50', '#20A39E',
      '#2FA8D6', '#3B6FD1', '#6B5BC7', '#A25BC2', '#E0619B', '#9C6B4A',
    ]),
  },
  {
    id: 'candy',
    name: 'Candy',
    price: 600,
    bgTop: '#2E1B4F',
    bgBottom: '#120A24',
    glowA: 'rgba(255,120,200,0.32)',
    glowB: 'rgba(140,200,255,0.20)',
    accent: '#FF7ACF',
    accent2: '#7C6BFF',
    onAccent: '#1B0718',
    liquids: palette([
      '#FF6B9D', '#FF9A76', '#FFD86B', '#C6F26B', '#6BE8A0', '#5BE0DA',
      '#6BC5FF', '#7C9BFF', '#A88BFF', '#D57AFF', '#FF7AE0', '#D9A382',
    ]),
  },
  {
    id: 'mono',
    name: 'Neon Ice',
    price: 800,
    bgTop: '#0E1E2B',
    bgBottom: '#050B12',
    glowA: 'rgba(80,220,255,0.30)',
    glowB: 'rgba(120,255,220,0.18)',
    accent: '#4FE3FF',
    accent2: '#2D8FB8',
    onAccent: '#02141B',
    liquids: palette([
      '#FF4D6D', '#FF8C42', '#FFD23F', '#B5E048', '#3DDC84', '#2DD4BF',
      '#38BDF8', '#4F86F7', '#7C6BF7', '#B15BF7', '#F75BC0', '#B08968',
    ]),
  },
];

export const DEFAULT_THEME_ID = 'midnight';

export function themeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}
