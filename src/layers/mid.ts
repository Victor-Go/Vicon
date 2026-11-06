import { Ctx, tone, land, isLit } from '../palettes';
import { mix, lighten, darken, n, rngFor, range, pick, Rng } from '../util';

/**
 * Layer 5: mid-ground. 128 variants:
 *   0-47 city skylines (6 styles x 8 colour sets), 48-95 woods (6 tree kinds x 8 arrangements),
 *   96-127 boats (8 boats x 4 colourways) - boats are the only option on a sea scene.
 */
export const MID_COUNT = 128;
export const MID_LAND = 96;
export const MID_BOATS = 32;
const B = 80;                                // baseline of land things

const SETS: [string, string, string][] = [
  ['#7d8fa8', '#98a8bd', '#6a7b92'], ['#c0674f', '#d98b6a', '#a85a45'], ['#f6b8c4', '#b8dff0', '#f8e3a6'], ['#4fa9b8', '#7ccad4', '#3a8a99'],
  ['#eef1f5', '#d5dbe3', '#c3ccd8'], ['#d9b98a', '#c9a574', '#e8d0a8'], ['#4a5568', '#3a4455', '#5c6a80'], ['#ef476f', '#ffd166', '#06d6a0'],
];

// ------------------------------------------------------------------ cities
interface Win { u: string; l: string }
function windows(W: Win, x0: number, y0: number, w: number, h: number, r: Rng, litP: number, sx = 3, sy = 3.3) {
  for (let yy = y0 + 2; yy < y0 + h - 2.5; yy += sy)
    for (let xx = x0 + 1.4; xx < x0 + w - 2; xx += sx) {
      const d = `M${n(xx)} ${n(yy)}h1.5v1.7h-1.5z`;
      if (r() < litP) W.l += d; else W.u += d;
    }
}

function city(v: number, x: Ctx): string {
  const style = v % 6, [c0, c1, c2] = SETS[(v / 6) | 0];
  const r = rngFor(71, v);
  const lit = isLit(x);
  const litP = x.p.time === 'night' ? 0.55 : x.p.time === 'dusk' ? 0.3 : 0;
  const W: Win = { u: '', l: '' };
  const cols = [tone(c0, x), tone(c1, x), tone(c2, x)];
  let s = '';
  // hazy back row
  let bx = -2;
  while (bx < 100) {
    const w = range(r, 7, 12), h = range(r, 10, style === 0 || style === 5 ? 34 : style === 3 ? 12 : 22);
    s += `<rect x="${n(bx)}" y="${n(B - h)}" width="${n(w)}" height="${n(h)}" fill="${land(c1, x, 0.3)}"/>`;
    bx += w + range(r, -1, 1.5);
  }
  const unlit = (c: string) => x.p.time === 'day' ? mix(lighten(c, 0.25), '#9fd0ff', 0.45) : darken(c, 0.35);
  bx = range(r, 0, 4);
  let i = 0;
  while (bx < 96) {
    const col = cols[i++ % 3];
    let w: number, h: number, extra = '';
    if (style === 0) {            // skyscrapers
      w = range(r, 7, 11); h = range(r, 22, 44);
      s += `<rect x="${n(bx)}" y="${n(B - h)}" width="${n(w)}" height="${n(h)}" fill="${col}"/>`;
      if (r() < 0.5) extra = `<rect x="${n(bx + w / 2 - 0.4)}" y="${n(B - h - 6)}" width=".8" height="6" fill="${col}"/>`;
      windows(W, bx, B - h, w, h, r, litP);
    } else if (style === 1) {     // residential blocks
      w = range(r, 9, 13); h = range(r, 14, 24);
      s += `<rect x="${n(bx)}" y="${n(B - h)}" width="${n(w)}" height="${n(h)}" fill="${col}"/><rect x="${n(bx - 0.5)}" y="${n(B - h - 1.4)}" width="${n(w + 1)}" height="1.4" fill="${darken(col, 0.18)}"/>`;
      windows(W, bx, B - h, w, h, r, litP, 3.2, 3.6);
    } else if (style === 2) {     // mixed
      const tall = i % 3 === 1;
      w = tall ? range(r, 7, 9) : range(r, 10, 15); h = tall ? range(r, 28, 40) : range(r, 9, 16);
      s += `<rect x="${n(bx)}" y="${n(B - h)}" width="${n(w)}" height="${n(h)}" fill="${col}"/>`;
      if (tall) s += `<path d="M${n(bx)} ${n(B - h)}L${n(bx + w / 2)} ${n(B - h - 5)}L${n(bx + w)} ${n(B - h)}Z" fill="${darken(col, 0.2)}"/>`;
      windows(W, bx, B - h, w, h, r, litP);
    } else if (style === 3) {     // townhouses
      w = range(r, 8, 11); h = range(r, 9, 14);
      s += `<rect x="${n(bx)}" y="${n(B - h)}" width="${n(w)}" height="${n(h)}" fill="${col}"/><path d="M${n(bx - 0.8)} ${n(B - h)}L${n(bx + w / 2)} ${n(B - h - 5)}L${n(bx + w + 0.8)} ${n(B - h)}Z" fill="${darken(cols[(i + 1) % 3], 0.25)}"/>`;
      windows(W, bx, B - h + 1, w, h - 1, r, litP, 3.4, 3.8);
      s += `<rect x="${n(bx + w / 2 - 0.9)}" y="${n(B - 3.4)}" width="1.8" height="3.4" fill="${darken(col, 0.4)}"/>`;
    } else if (style === 4) {     // factories
      w = range(r, 14, 20); h = range(r, 8, 12);
      s += `<rect x="${n(bx)}" y="${n(B - h)}" width="${n(w)}" height="${n(h)}" fill="${col}"/>`;
      for (let k = 0; k < 3; k++) s += `<path d="M${n(bx + k * w / 3)} ${n(B - h)}L${n(bx + k * w / 3)} ${n(B - h - 3)}L${n(bx + (k + 1) * w / 3)} ${n(B - h)}Z" fill="${darken(col, 0.15)}"/>`;
      const cx = bx + w * range(r, 0.2, 0.8);
      s += `<rect x="${n(cx)}" y="${n(B - h - 11)}" width="2.2" height="11" fill="${darken(col, 0.3)}"/><rect x="${n(cx - 0.3)}" y="${n(B - h - 11)}" width="2.8" height="1.2" fill="${darken(col, 0.5)}"/>`;
      s += `<circle cx="${n(cx + 2.6)}" cy="${n(B - h - 14)}" r="2.2" fill="${tone('#ffffff', x)}" opacity=".5"/><circle cx="${n(cx + 5.4)}" cy="${n(B - h - 17)}" r="2.8" fill="${tone('#ffffff', x)}" opacity=".35"/>`;
      windows(W, bx + 1, B - h + 2, w - 2, h - 2, r, litP, 3.6, 4);
    } else {                      // modern stepped towers / spires
      w = range(r, 8, 12); h = range(r, 20, 38);
      const kind = i % 3;
      if (kind === 0) s += `<path d="M${n(bx)} ${B}V${n(B - h + 5)}L${n(bx + w)} ${n(B - h)}V${B}Z" fill="${col}"/>`;
      else if (kind === 1) s += `<rect x="${n(bx)}" y="${n(B - h * 0.6)}" width="${n(w)}" height="${n(h * 0.6)}" fill="${col}"/><rect x="${n(bx + w * 0.2)}" y="${n(B - h)}" width="${n(w * 0.6)}" height="${n(h * 0.4)}" fill="${darken(col, 0.1)}"/><rect x="${n(bx + w / 2 - 0.3)}" y="${n(B - h - 5)}" width=".6" height="5" fill="${col}"/>`;
      else s += `<path d="M${n(bx)} ${B}V${n(B - h * 0.5)}Q${n(bx + w / 2)} ${n(B - h * 1.15)} ${n(bx + w)} ${n(B - h * 0.5)}V${B}Z" fill="${col}"/>`;
      windows(W, bx, B - h * 0.55, w, h * 0.55, r, litP);
    }
    s += extra;
    bx += w + range(r, 0.4, 2);
  }
  const unlitC = unlit(c1);
  s += `<path d="${W.u}" fill="${unlitC}" opacity="${x.p.time === 'day' ? 0.75 : 0.5}"/>`;
  if (W.l) s += `<path d="${W.l}" fill="#ffe58a"/>`;
  void lit;
  return s;
}

// ------------------------------------------------------------------ woods
interface TreeKind { trunk: string; crowns: string[] }
const TREES: TreeKind[] = [
  { trunk: '#5b4030', crowns: ['#1f6b4a', '#2a7d55', '#185a3e'] },             // pine
  { trunk: '#6b4a32', crowns: ['#4caf50', '#5fbf5a', '#3f9e48'] },             // round
  { trunk: '#5b4030', crowns: ['#3d7a3a', '#4a8a3f', '#5d9a45'] },             // cypress
  { trunk: '#f1efe6', crowns: ['#a8cf4a', '#b9d95a', '#94c040'] },             // birch
  { trunk: '#6b4a3a', crowns: ['#ffb7d1', '#ff9fc2', '#ffc9dc'] },             // sakura
  { trunk: '#6b4a32', crowns: ['#f08a24', '#e0512b', '#f5c02e'] },             // autumn
];

function drawTree(kind: number, cx: number, by: number, h: number, x: Ctx, r: Rng, snow: boolean): string {
  const t = TREES[kind];
  const crown = tone(pick(r, t.crowns), x);
  const light = lighten(crown, 0.16);
  const trunk = tone(t.trunk, x);
  const snowC = tone('#ffffff', x);
  let s = '';
  if (kind === 0) {
    s += `<rect x="${n(cx - h * 0.04)}" y="${n(by - h * 0.18)}" width="${n(h * 0.08)}" height="${n(h * 0.18)}" fill="${trunk}"/>`;
    for (let i = 0; i < 3; i++) {
      const ay = by - h + i * h * 0.24, hw = h * (0.17 + i * 0.07), bt = ay + h * 0.4;
      s += `<path d="M${n(cx)} ${n(ay)}L${n(cx + hw)} ${n(bt)}L${n(cx - hw)} ${n(bt)}Z" fill="${i % 2 ? crown : darken(crown, 0.08)}"/>`;
      if (snow) s += `<path d="M${n(cx)} ${n(ay)}L${n(cx + hw * 0.55)} ${n(ay + h * 0.2)}L${n(cx + hw * 0.1)} ${n(ay + h * 0.17)}L${n(cx - hw * 0.25)} ${n(ay + h * 0.22)}L${n(cx - hw * 0.55)} ${n(ay + h * 0.2)}Z" fill="${snowC}"/>`;
    }
  } else if (kind === 2) {
    s += `<rect x="${n(cx - h * 0.03)}" y="${n(by - h * 0.12)}" width="${n(h * 0.06)}" height="${n(h * 0.12)}" fill="${trunk}"/><ellipse cx="${n(cx)}" cy="${n(by - h * 0.55)}" rx="${n(h * 0.14)}" ry="${n(h * 0.45)}" fill="${crown}"/><ellipse cx="${n(cx - h * 0.03)}" cy="${n(by - h * 0.6)}" rx="${n(h * 0.06)}" ry="${n(h * 0.3)}" fill="${light}" opacity=".6"/>`;
  } else {
    const tw = kind === 3 ? 0.07 : 0.08, th = kind === 3 ? 0.5 : 0.34;
    s += `<rect x="${n(cx - h * tw / 2)}" y="${n(by - h * th)}" width="${n(h * tw)}" height="${n(h * th)}" fill="${trunk}"/>`;
    if (kind === 3) s += `<path d="M${n(cx - h * 0.03)} ${n(by - h * 0.2)}h${n(h * 0.06)}M${n(cx - h * 0.03)} ${n(by - h * 0.34)}h${n(h * 0.04)}" stroke="#333" stroke-width=".5"/>`;
    const cy = by - h * (kind === 3 ? 0.72 : 0.66), R = h * (kind === 3 ? 0.26 : 0.3);
    s += `<circle cx="${n(cx - R * 0.7)}" cy="${n(cy + R * 0.4)}" r="${n(R * 0.8)}" fill="${darken(crown, 0.06)}"/><circle cx="${n(cx + R * 0.7)}" cy="${n(cy + R * 0.4)}" r="${n(R * 0.8)}" fill="${darken(crown, 0.06)}"/><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(R)}" fill="${crown}"/><circle cx="${n(cx - R * 0.25)}" cy="${n(cy - R * 0.3)}" r="${n(R * 0.45)}" fill="${light}" opacity=".7"/>`;
  }
  return s;
}

function woods(v: number, x: Ctx): string {
  const kind = v % 6, arr = (v / 6) | 0;
  const r = rngFor(81, v);
  const snow = x.scene === 'snow' && arr === 6;
  const items: { k: number; x: number; y: number; h: number }[] = [];
  const add = (k: number, cx: number, h: number, dy = 0) => items.push({ k, x: cx, y: B - range(r, 0, 3) + dy, h });
  const other = (kind + 1 + Math.floor(r() * 5)) % 6;
  switch (arr) {
    case 0: for (let i = 0; i < 14; i++) add(kind, 3 + i * 7 + range(r, -2, 2), range(r, 12, 16)); break;
    case 1: for (let i = 0; i < 4; i++) add(kind, 12 + i * 25 + range(r, -4, 4), range(r, 26, 34)); break;
    case 2: for (let i = 0; i < 8; i++) add(kind, 8 + i * 12 + range(r, -3, 3), range(r, 18, 24)); break;
    case 3: for (let i = 0; i < 9; i++) add(i % 3 === 1 ? other : kind, 6 + i * 11 + range(r, -2, 2), range(r, 15, 24)); break;
    case 4: for (let i = 0; i < 5; i++) { add(kind, 4 + i * 6 + range(r, -1.5, 1.5), range(r, 18, 26)); add(kind, 70 + i * 6 + range(r, -1.5, 1.5), range(r, 18, 26)); } break;
    case 5: for (let i = 0; i < 12; i++) add(kind, 4 + i * 8 + range(r, -2, 2), range(r, 10, 14), -2); for (let i = 0; i < 3; i++) add(kind, 14 + i * 36 + range(r, -4, 4), range(r, 28, 34), 2); break;
    case 6: if (snow) { for (let i = 0; i < 9; i++) add(0, 6 + i * 11 + range(r, -2, 2), range(r, 16, 26)); } else { for (let i = 0; i < 18; i++) add(kind, 3 + i * 5.4 + range(r, -1, 1), range(r, 6, 9)); } break;
    default: for (let i = 0; i < 8; i++) add(kind, 8 + i * 12 + range(r, -2, 2), 30 - i * 2.8, i * 0.9);
  }
  items.sort((a, b) => a.y - b.y);
  return items.map((t) => drawTree(t.k, t.x, t.y, t.h, x, r, snow)).join('');
}

// ------------------------------------------------------------------ boats (sea scenes only)
const BOAT_SETS: [string, string, string][] = [['#e63946', '#ffffff', '#1d3557'], ['#1d3557', '#f1faee', '#e63946'], ['#ffb703', '#ffffff', '#023047'], ['#2a9d8f', '#fefae0', '#e76f51']];

function boat(type: number, hull: string, hi: string, ac: string, x: Ctx, lit: boolean): string {
  const win = lit ? '#ffe58a' : tone('#8fd3ff', x);
  const H = (w: number, d = 4) => `<path d="M${-w} ${-d}H${w}L${w - d * 0.9} 0H${-w + d * 0.9}Z" fill="${hull}"/><path d="M${-w} ${-d}H${w}V${-d + 0.9}H${-w}Z" fill="${darken(hull, 0.2)}"/>`;
  switch (type) {
    case 0: return H(11) + `<rect x="-.4" y="-24" width=".8" height="20" fill="${darken(ac, 0.2)}"/><path d="M1 -23L1 -6L11 -6Z" fill="${hi}"/><path d="M-1 -20L-1 -6L-8 -6Z" fill="${mix(hi, ac, 0.25)}"/>`;
    case 1: return H(14, 4) + `<rect x="-1" y="-27" width=".9" height="23" fill="${darken(ac, 0.2)}"/><path d="M0 -26L0 -6L-12 -6Z" fill="${hi}"/><path d="M1 -22L1 -6L9 -6Z" fill="${ac}"/><path d="M1 -26L1 -22L7 -8" fill="none"/>`;
    case 2: return H(20, 4.5) + `<rect x="-17" y="-8.5" width="32" height="4" fill="${hi}"/><rect x="-13" y="-12.5" width="24" height="4" fill="${mix(hi, '#9fb4c8', 0.2)}"/><rect x="-8" y="-16" width="14" height="3.6" fill="${hi}"/><rect x="-1" y="-20" width="4.4" height="4" fill="${ac}"/>` + [-14, -10, -6, -2, 2, 6, 10, 13].map((px) => `<rect x="${px}" y="-7.4" width="1.6" height="1.3" fill="${win}"/>`).join('') + [-10, -6, -2, 2, 6, 9].map((px) => `<rect x="${px}" y="-11.4" width="1.6" height="1.3" fill="${win}"/>`).join('');
    case 3: return H(20, 4) + `<rect x="-16" y="-9" width="9" height="5" fill="${ac}"/><rect x="-6.5" y="-9" width="9" height="5" fill="${mix(ac, hi, 0.5)}"/><rect x="2.5" y="-9" width="9" height="5" fill="${ac}"/><rect x="-14" y="-13.5" width="9" height="4.5" fill="${mix(ac, hi, 0.5)}"/><rect x="-5" y="-13.5" width="9" height="4.5" fill="${hi}"/><rect x="12" y="-14" width="6" height="10" fill="${hi}"/><rect x="13" y="-12.4" width="4" height="1.5" fill="${win}"/>`;
    case 4: return `<path d="M-12 -4.4H8.6L13.4 -7L10.4 0H-8.6Q-12 0 -12 -4.4Z" fill="${hull}"/><path d="M-11.6 -2.8H11.6" stroke="${darken(hull, 0.3)}" stroke-width=".7"/>` +
      `<rect x="-8" y="-10.4" width="8" height="6" rx=".6" fill="${hi}"/><rect x="-8.8" y="-11.6" width="9.6" height="1.4" rx=".5" fill="${ac}"/><rect x="-6.6" y="-9" width="2.4" height="2.4" fill="${win}"/><rect x="-3" y="-9" width="2.4" height="2.4" fill="${win}"/>` +
      `<rect x="3" y="-18" width=".9" height="13.6" fill="${darken(ac, 0.2)}"/><path d="M3.4 -15.6L10.6 -8.4" stroke="${darken(ac, 0.2)}" stroke-width=".8"/><path d="M10.6 -8.4V-5.4" stroke="${darken(ac, 0.2)}" stroke-width=".4"/><path d="M3.9 -18L7.4 -16.8L3.9 -15.6Z" fill="${hi}"/>` +
      `<rect x="4.6" y="-6.8" width="3.6" height="2.4" fill="${ac}"/><rect x="-11" y="-6.4" width="2.4" height="2" fill="${ac}"/>`;
    case 5: return H(12, 4) + `<rect x="-6" y="-9" width="12" height="5" fill="${hi}"/><rect x="-3.4" y="-17" width="4" height="8" fill="${ac}"/><rect x="-3.6" y="-17.4" width="4.4" height="1" fill="#222"/><circle cx="-2" cy="-20" r="2.2" fill="${tone('#ffffff', x)}" opacity=".5"/><circle cx="1.4" cy="-23" r="2.8" fill="${tone('#ffffff', x)}" opacity=".35"/><circle cx="10" cy="-2.5" r="3" fill="${ac}" opacity=".9"/>`;
    case 6: return H(11, 3.6) + `<rect x="-3" y="-23" width=".8" height="20" fill="#5b3a29"/><rect x="5" y="-17" width=".8" height="14" fill="#5b3a29"/><path d="M-2.2 -22L-12 -18L-10 -7L-2.2 -6Z" fill="${ac === '#1d3557' ? '#b3402e' : ac}"/><path d="M5.8 -16L12 -13L11 -6L5.8 -6Z" fill="${mix(ac, '#b3402e', 0.5)}"/><path d="M-12 -14L-2.2 -14M-11 -10.5L-2.2 -10.5" stroke="#00000033" stroke-width=".4"/>`;
    default: return `<path d="M-16 -3Q-18 -3 -16 -1L-12 0H8L13 -2L16 -5L9 -5L5 -8H-3L-5 -5H-14Z" fill="${hull}"/><path d="M-3 -8L5 -8L7 -5L-5 -5Z" fill="${hi}"/><rect x="-1.4" y="-7.2" width="3.4" height="1.6" fill="${win}"/><path d="M-16 -1Q-24 -1 -30 1M-16 0Q-22 2 -26 4" stroke="#fff" stroke-width="1" opacity=".6" fill="none"/>`;
  }
}

function boats(v: number, x: Ctx): string {
  const type = v % 8, [hull, hi, ac] = BOAT_SETS[(v / 8) | 0].map((c) => tone(c, x));
  const r = rngFor(91, v);
  const bigs = type === 2 || type === 3;
  const wl = x.baseY + (bigs ? 9 : 13) + range(r, 0, 3);
  const px = range(r, 36, 62), sc = bigs ? 1.1 : 1.25;
  const lit = isLit(x);
  const far = ((v / 8) | 0) % 2 === 0
    ? `<g transform="translate(${n(range(r, 12, 28))} ${x.baseY + 3.5}) scale(.38)" opacity=".85">${boat(0, land('#ffffff', x, 0.3), land('#ffffff', x, 0.3), land('#cccccc', x, 0.3), x, false)}</g>` : '';
  const ripple = `<ellipse cx="${n(px)}" cy="${n(wl + 0.6)}" rx="${n(16 * sc)}" ry="1.2" fill="#fff" opacity=".35"/>`;
  return far + `<g transform="translate(${n(px)} ${n(wl)}) scale(${sc})">${boat(type, hull, hi, ac, x, lit)}</g>` + ripple;
}

export function mid(v: number, x: Ctx): string {
  if (x.scene === 'sea') return boats(v % MID_BOATS, x);
  const l = v % MID_LAND;
  return l < 48 ? city(l, x) : woods(l - 48, x);
}
