import { Ctx, tone, land, isLit } from '../palettes';
import { mix, lighten, darken, n, rngFor, range, pick, Rng } from '../util';
import { groundColor } from './scene';

/**
 * Layer 6: foreground. 128 variants.
 * Land: 0-63 roads+vehicles (4 roads x 16 vehicles), 64-79 railway (4 trains x 4 colours), 80-95 flowers (4 x 4),
 *       96-111 fences & fields (4 x 4), 112-127 roadside props (8 x 2).
 * Sea:  only the first 32 (beach scenes: 8 kinds x 4 colourways).
 */
export const FORE_COUNT = 128;
export const FORE_SEA = 32;

const gtf = (px: number, py: number, s: number, body: string, flip = false) =>
  `<g transform="translate(${n(px)} ${n(py)}) scale(${flip ? -s : s} ${s})">${body}</g>`;
const wheel = (cx: number, r = 2) => `<circle cx="${cx}" cy="${-r}" r="${r}" fill="#1f232a"/><circle cx="${cx}" cy="${-r}" r="${n(r * 0.45)}" fill="#aab2bd"/>`;

// ------------------------------------------------------------------ vehicles (local: facing right, wheels touch y=0)
function vehicle(id: number, x: Ctx): string {
  const T = (c: string) => tone(c, x);
  const win = T('#bfe3ff');
  const lampOn = isLit(x);
  const head = (px: number, py: number) => lampOn ? `<path d="M${px} ${py}L${px + 22} ${py + 3}L${px + 22} ${py - 5}Z" fill="#fff3a0" opacity=".35"/><rect x="${px - 1}" y="${py - 1}" width="1.6" height="1.8" fill="#fff3a0"/>` : `<rect x="${px - 1}" y="${py - 1}" width="1.6" height="1.8" fill="#ffe9a0"/>`;
  const car = (c: string, tall = false) => {
    const C = T(c), k = tall ? 2.4 : 0;
    return `<rect x="-${10 + (tall ? 1 : 0)}" y="${-6.2 - k}" width="${20 + (tall ? 2 : 0)}" height="${4.4 + k}" rx="1.4" fill="${C}"/>` +
      (tall ? `<path d="M-8 -8.6L-6.4 -12.4H6L9 -8.6Z" fill="${C}"/><path d="M-6.8 -8.8L-5.6 -11.6H-.4V-8.8Z M.6 -8.8V-11.6H5.2L7.4 -8.8Z" fill="${win}"/><rect x="-5.5" y="-13.1" width="10" height=".8" fill="${darken(C, 0.35)}"/>`
        : `<path d="M-5.6 -6.2L-3.2 -9.6H4.2L7.4 -6.2Z" fill="${C}"/><path d="M-4.4 -6.4L-2.7 -9H-.2V-6.4Z M.8 -6.4V-9H3.7L5.9 -6.4Z" fill="${win}"/>`) +
      wheel(-6.2, tall ? 2.3 : 2) + wheel(6.2, tall ? 2.3 : 2) + head(tall ? 11 : 10, -4.6 - k / 2);
  };
  switch (id) {
    case 0: case 2: {           // city bus / school bus
      const C = T(id === 0 ? '#2f6fed' : '#ffc61a');
      return `<rect x="-15" y="-13" width="30" height="10.6" rx="1.6" fill="${C}"/><rect x="-13.6" y="-11.4" width="21" height="4" fill="${win}"/>` +
        [-9, -4, 1].map((px) => `<rect x="${px + 2}" y="-11.4" width=".7" height="4" fill="${C}"/>`).join('') +
        `<rect x="9" y="-11.4" width="4" height="8.2" fill="${win}"/><rect x="-15" y="-5.2" width="30" height=".9" fill="${darken(C, 0.25)}"/>` + wheel(-9, 2.2) + wheel(9, 2.2) + head(15, -4.6);
    }
    case 1: {                   // double decker
      const C = T('#d62f3a');
      return `<rect x="-14" y="-19" width="28" height="16.6" rx="1.6" fill="${C}"/><rect x="-12.6" y="-17.6" width="19" height="4" fill="${win}"/><rect x="-12.6" y="-10.6" width="19" height="4" fill="${win}"/><rect x="8" y="-10.6" width="4" height="8" fill="${win}"/><rect x="8" y="-17.6" width="4" height="4" fill="${win}"/>` + wheel(-8.5, 2.2) + wheel(8.5, 2.2) + head(14, -4.6);
    }
    case 3: return car('#d62f3a');
    case 4: return car('#f1f3f6');
    case 5: return car('#1f9aa6');
    case 6: return car('#2b2f36', true);
    case 7: return car('#6b8a3a', true);
    case 8: return car('#f08a24', true);
    case 9: case 10: case 11: { // trucks
      const box = T(['#f1f3f6', '#3a86ff', '#3fa66a'][id - 9]), cab = T(['#d62f3a', '#ffb703', '#e76f51'][id - 9]);
      return `<rect x="-17" y="-14.2" width="21" height="11.4" rx=".8" fill="${box}"/><rect x="-17" y="-8" width="21" height="1" fill="${darken(box, 0.12)}"/><path d="M5 -2.8V-10.4Q5 -11.4 6 -11.4H10.6L14.6 -6.6V-2.8Z" fill="${cab}"/><path d="M6.4 -10.2H10L12.6 -7H6.4Z" fill="${win}"/><rect x="-17" y="-3.4" width="32" height="1.4" fill="#2a2e35"/>` + wheel(-12, 2) + wheel(-7, 2) + wheel(10, 2) + head(14.6, -4.6);
    }
    case 12: {                  // taxi
      return car('#ffc61a') + `<rect x="-1.6" y="-11.2" width="4.4" height="1.6" rx=".4" fill="${T('#222')}"/>`;
    }
    case 13: {                  // motorcycle
      const C = T('#d62f3a'), D = T('#2b2f36'), J = T('#2b3a55'), H = T('#ffc61a');
      return wheel(-6.2, 2.8) + wheel(6.2, 2.8) +
        `<path d="M-6.2 -2.8L-3.4 -5.6" stroke="${D}" stroke-width="1" fill="none"/><path d="M6.2 -2.8L4.4 -8.4" stroke="#8d96a3" stroke-width="1" fill="none"/>` +
        `<rect x="-2.6" y="-5" width="5.6" height="3.4" rx=".8" fill="${D}"/>` +
        `<path d="M-7.6 -6Q-7.6 -7.4 -6 -7.4H-1.4V-5.4H-7.6Z" fill="${C}"/><path d="M-1.4 -7.6Q1.6 -9 4 -7.4L3.6 -5H-1.4Z" fill="${C}"/>` +
        `<path d="M4.2 -8.6L3.2 -10.4H2" stroke="${D}" stroke-width=".8" fill="none"/><circle cx="5.4" cy="-7.4" r="1.1" fill="${lampOn ? '#fff3a0' : T('#e8eef5')}"/>` +
        `<path d="M-3 -8L.8 -6L.4 -3.2" stroke="${J}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M-3 -8L.4 -12.6" stroke="${J}" stroke-width="2.8" stroke-linecap="round"/><path d="M.4 -12.2L3.4 -10.6" stroke="${J}" stroke-width="1.4" stroke-linecap="round"/>` +
        `<circle cx="1.4" cy="-14.4" r="1.9" fill="${H}"/><path d="M2.4 -15.2Q3.5 -14.6 3.2 -13.6H2.4Z" fill="#233a5e"/>` + head(7, -7.4);
    }
    case 14: {                  // bicycle
      const C = T('#2f6fed'), D = T('#2a2e35'), J = T('#e76f51'), skin = T('#f0c9a0');
      return `<g fill="none" stroke="${D}" stroke-width="1"><circle cx="-5.6" cy="-3.4" r="3.4"/><circle cx="5.6" cy="-3.4" r="3.4"/></g><circle cx="-5.6" cy="-3.4" r=".6" fill="${D}"/><circle cx="5.6" cy="-3.4" r=".6" fill="${D}"/>` +
        `<path d="M-5.6 -3.4L-.6 -3.4L3.8 -8.2L-2.4 -8.2ZM-.6 -3.4L-2.4 -8.2M3.8 -8.2L5.6 -3.4" stroke="${C}" stroke-width="1" fill="none" stroke-linejoin="round"/>` +
        `<path d="M3.8 -8.2L3.2 -9.8H4.8M-3.4 -8.8H-1.4" stroke="${D}" stroke-width=".9" fill="none"/>` +
        `<path d="M-2.4 -9.4L.6 -6.6L-.4 -3.8" stroke="${T('#1d2f6f')}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M-2.4 -9.4L.6 -13.4" stroke="${J}" stroke-width="2.4" stroke-linecap="round"/><path d="M.6 -13L3.2 -9.8" stroke="${J}" stroke-width="1.2" stroke-linecap="round"/>` +
        `<circle cx="1.6" cy="-15.2" r="1.6" fill="${skin}"/><path d="M.1 -15.4Q1.6 -17.6 3.2 -15.4Z" fill="${C}"/>`;
    }
    default: {                  // cones + sign
      const cone = (px: number) => `<path d="M${px} -6L${px + 2} 0H${px - 2}Z" fill="${T('#ff7a1a')}"/><rect x="${px - 1}" y="-3.4" width="2" height=".9" fill="#fff"/>`;
      return cone(-9) + cone(-2) + cone(5) + `<rect x="10" y="-14" width=".8" height="14" fill="#777"/><path d="M10.4 -17L14.8 -12.6L10.4 -8.2L6 -12.6Z" fill="${T('#ffc61a')}"/>`;
    }
  }
}

function road(v: number, x: Ctx): string {
  const style = v % 4, veh = (v / 4) | 0;
  const r = rngFor(101, v);
  const T = (c: string) => tone(c, x);
  let s = '';
  const top = 84, bot = 95;
  if (style === 1) {
    s += `<rect y="${top}" width="100" height="${bot - top}" fill="${T('#b88c5c')}"/><rect y="${top + 3}" width="100" height="1.4" fill="${T('#9c7347')}"/><rect y="${bot - 4}" width="100" height="1.4" fill="${T('#9c7347')}"/>`;
    for (let i = 0; i < 14; i++) s += `<circle cx="${n(range(r, 0, 100))}" cy="${n(range(r, top + 1, bot - 1))}" r="${n(range(r, 0.3, 0.7))}" fill="${T('#8a6540')}"/>`;
  } else {
    const asph = style === 3 ? '#3b3f48' : style === 2 ? '#5a5f6b' : '#4a4f5a';
    s += `<rect y="${top}" width="100" height="${bot - top}" fill="${T(asph)}"/>`;
    if (style === 0) s += `<path d="M0 ${top + 5.5}H100" stroke="${T('#f4f4f4')}" stroke-width=".9" stroke-dasharray="6 5"/>`;
    if (style === 2) {
      s += `<rect y="${top - 1.6}" width="100" height="2" fill="${T('#cfd4da')}"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${12 + i * 2.6}" y="${top}" width="1.5" height="${bot - top}" fill="${T('#f4f4f4')}" opacity=".85"/>`;
      s += `<path d="M0 ${top + 5.5}H100" stroke="${T('#f4f4f4')}" stroke-width=".7" stroke-dasharray="5 6"/>`;
    }
    if (style === 3) s += `<path d="M0 ${top + 4.6}H100M0 ${top + 6.2}H100" stroke="${T('#ffc61a')}" stroke-width=".6"/>`;
  }
  s += `<rect y="${bot}" width="100" height=".8" fill="${darken(T('#b0b5bd'), 0.1)}"/>`;
  const px = range(r, 32, 68), flip = (style + veh) % 2 === 1;
  const sc = veh <= 2 ? 1.2 : 1.35;
  s += `<ellipse cx="${n(px)}" cy="93.4" rx="${veh <= 2 ? 19 : 15}" ry="1.2" fill="#000" opacity=".22"/>`;
  s += gtf(px, 93, sc, vehicle(veh, x), flip);
  return s;
}

// ------------------------------------------------------------------ railway
function railway(v: number, x: Ctx): string {
  const type = v % 4, cw = (v / 4) | 0;
  const C = tone(['#d62f3a', '#2f6fed', '#2f9e6a', '#f08a24'][cw], x);
  const T = (c: string) => tone(c, x);
  const win = T('#bfe3ff');
  let s = `<rect y="91" width="100" height="5" fill="${T('#8a8f98')}"/>`;
  for (let i = 0; i < 26; i++) s += `<rect x="${i * 4 - 1}" y="91.4" width="1.6" height="4.2" fill="${T('#6b5a48')}"/>`;
  s += `<rect y="92.2" width="100" height=".7" fill="${T('#c9ced6')}"/><rect y="94.4" width="100" height=".7" fill="${T('#c9ced6')}"/>`;
  const wh = (px: number, r = 1.8) => `<circle cx="${px}" cy="${-r}" r="${r}" fill="#262a31"/>`;
  let t = '';
  if (type === 0) {      // steam locomotive + coal car
    t = `<rect x="-14" y="-13" width="8" height="11" fill="${C}"/><rect x="-14.8" y="-14" width="9.6" height="1.6" fill="${darken(C, 0.3)}"/><rect x="-12.6" y="-11.4" width="5" height="3.6" fill="${win}"/><rect x="-6" y="-9.5" width="16" height="7.5" rx="3.5" fill="${darken(C, 0.35)}"/><rect x="6" y="-14.4" width="2.8" height="5" fill="#2b2f36"/><rect x="5.2" y="-15.4" width="4.4" height="1.4" fill="#2b2f36"/><rect x="-2" y="-11.6" width="3" height="2.4" fill="${C}"/><path d="M10 -2L12.6 -2L12.6 -4.4L10 -6Z" fill="${darken(C, 0.4)}"/><circle cx="7.4" cy="-18" r="2.2" fill="#fff" opacity=".6"/><circle cx="11" cy="-21" r="2.8" fill="#fff" opacity=".4"/>` + [-10, -5, 0, 5].map((p) => wh(p, 2.1)).join('') + `<rect x="13" y="-9" width="14" height="7" fill="${T('#3a3f48')}"/>` + wh(16) + wh(24);
  } else if (type === 1) { // bullet train
    t = `<path d="M-24 -2.4V-10Q-24 -12 -22 -12H8Q16 -12 22 -4L22 -2.4Z" fill="${T('#f1f3f6')}"/><path d="M-24 -6H20L21 -4.6H-24Z" fill="${C}"/><path d="M10 -11Q15 -11 18.6 -6.8H10Z" fill="${win}"/>` + [-20, -14, -8, -2, 4].map((p) => `<rect x="${p}" y="-10.4" width="3.4" height="2.8" rx=".6" fill="${win}"/>`).join('') + wh(-18) + wh(-6) + wh(8);
  } else if (type === 2) { // tram / metro
    t = `<rect x="-17" y="-12.5" width="34" height="10.5" rx="2" fill="${C}"/><rect x="-17" y="-8" width="34" height="1" fill="${lighten(C, 0.4)}"/>` + [-14, -8, -2, 4, 10].map((p) => `<rect x="${p}" y="-11" width="4.6" height="3.4" rx=".6" fill="${win}"/>`).join('') + `<rect x="-1" y="-17" width="2" height="4.8" fill="#555"/><path d="M-6 -17H6" stroke="#555" stroke-width=".8"/>` + wh(-11) + wh(11);
  } else {                 // freight
    const wag = (px: number, c: string) => `<rect x="${px}" y="-10.5" width="15" height="8.5" fill="${T(c)}"/><rect x="${px}" y="-10.5" width="15" height="1" fill="${darken(T(c), 0.2)}"/>` + wh(px + 3) + wh(px + 12);
    t = wag(-27, '#8a5a3a') + wag(-11, '#3a6ea8') + wag(5, '#c9a43a') + `<rect x="21" y="-12" width="9" height="10" fill="${C}"/><rect x="22.4" y="-10.4" width="3.6" height="3.4" fill="${win}"/>` + wh(23) + wh(28);
  }
  const px = type === 3 ? 38 : 50, r = rngFor(111, v);
  return s + gtf(px + range(r, -6, 6), 93.4, 1.1, t, (v >> 2) % 2 === 1);
}

// ------------------------------------------------------------------ flowers & meadow
function flowers(v: number, x: Ctx): string {
  const kind = v % 4, cw = (v / 4) | 0;
  const r = rngFor(121, v);
  const T = (c: string) => tone(c, x);
  const stem = T('#3f8a46');
  const sets: string[][] = [
    ['#ffffff', '#fff1a8', '#ffe0f0', '#d6ecff'], ['#e63946', '#ff8fb1', '#ffc61a', '#c77dff'],
    ['#ffc61a', '#ffb000', '#ffd54a', '#ff9f1c'], ['#b583ff', '#8f6bff', '#d3b5ff', '#6c63ff'],
  ];
  const items: { y: number; svg: string }[] = [];
  const cnt = kind === 2 ? 8 : 15;
  for (let i = 0; i < cnt; i++) {
    const px = range(r, 3, 97), py = range(r, 86, 98), s = 0.8 + (py - 86) / 12 * 0.7;
    const col = T(kind === 3 ? sets[3][cw] : sets[kind === 1 ? 1 : kind === 2 ? 2 : 0][(i + cw) % 4]);
    let f = '';
    if (kind === 0) {                       // daisies
      f = `<path d="M0 0V-5" stroke="${stem}" stroke-width=".6"/>` + [0, 1, 2, 3, 4].map((k) => `<ellipse cx="0" cy="-7.4" rx=".9" ry="1.8" fill="${col}" transform="rotate(${k * 72} 0 -5.6)"/>`).join('') + `<circle cx="0" cy="-5.6" r="1.1" fill="${T('#ffb000')}"/>`;
    } else if (kind === 1) {                // tulips
      f = `<path d="M0 0V-6" stroke="${stem}" stroke-width=".6"/><path d="M-1.8 -9L-1.8 -6.6Q0 -5 1.8 -6.6V-9L.6 -7.8L0 -9.4L-.6 -7.8Z" fill="${col}"/><path d="M0 -1.5Q-3 -3 -3.4 -5.4Q-1 -4.4 0 -1.5Z" fill="${stem}"/>`;
    } else if (kind === 2) {                // sunflowers
      f = `<path d="M0 0V-9" stroke="${stem}" stroke-width=".9"/>` + Array.from({ length: 10 }, (_, k) => `<ellipse cx="0" cy="-12" rx=".9" ry="2.2" fill="${col}" transform="rotate(${k * 36} 0 -10)"/>`).join('') + `<circle cx="0" cy="-10" r="1.9" fill="${T('#6b4423')}"/><path d="M0 -3Q-3 -4 -4 -6.4Q-1 -5.8 0 -3Z" fill="${stem}"/>`;
    } else if (i % 3 === 0) {               // mushrooms
      f = `<rect x="-.6" y="-2.4" width="1.2" height="2.4" fill="${T('#f4ead8')}"/><path d="M-2.6 -2.2Q0 -6 2.6 -2.2Z" fill="${T('#d6453a')}"/><circle cx="-.8" cy="-3.2" r=".4" fill="#fff"/><circle cx="1" cy="-2.8" r=".35" fill="#fff"/>`;
    } else {                                // lavender / tall grass
      f = `<path d="M0 0V-7M-1 0L-2.2 -6M1 0L2.2 -6" stroke="${stem}" stroke-width=".5" fill="none"/>` + [[0, -7], [-2.2, -6], [2.2, -6]].map(([a, b]) => `<ellipse cx="${a}" cy="${b - 1.2}" rx=".7" ry="2" fill="${col}"/>`).join('');
    }
    items.push({ y: py, svg: gtf(px, py, s, f) });
  }
  for (let i = 0; i < 9; i++) { const px = range(r, 0, 100), py = range(r, 85, 99); items.push({ y: py, svg: `<path d="M${n(px)} ${n(py)}l-1 -3l1.2 2l.8 -3.4l.6 3.4l1.2 -2l-1 3z" fill="${stem}"/>` }); }
  return items.sort((a, b) => a.y - b.y).map((i) => i.svg).join('');
}

// ------------------------------------------------------------------ fences & fields
function fences(v: number, x: Ctx): string {
  const kind = v % 4, cw = (v / 4) | 0;
  const r = rngFor(131, v);
  const T = (c: string) => tone(c, x);
  let s = '';
  if (kind === 0) {
    const c = T(['#a9743f', '#f4f1ea', '#8c9099', '#4f86c6'][cw]), d = darken(c, 0.2);
    s += `<rect y="89" width="100" height="1.4" fill="${c}"/><rect y="93" width="100" height="1.4" fill="${c}"/>`;
    for (let i = 0; i < 20; i++) s += `<path d="M${i * 5 + 0.5} 96.6V89.2L${i * 5 + 1.9} 87.8L${i * 5 + 3.3} 89.2V96.6Z" fill="${c}"/><path d="M${i * 5 + 3.3} 96.6V89.2" stroke="${d}" stroke-width=".4"/>`;
  } else if (kind === 1) {
    const c = ['#9aa0a8', '#c9b48a', '#6e737c', '#b0836a'][cw];
    for (let row = 0; row < 3; row++) {
      let px = -2 + (row % 2) * 3;
      while (px < 100) { const w = range(r, 5, 8); s += `<rect x="${n(px)}" y="${88 + row * 3.6}" width="${n(w - 0.5)}" height="3.2" rx="1.2" fill="${mix(T(c), row % 2 ? '#000' : '#fff', range(r, 0.02, 0.14))}"/>`; px += w; }
    }
  } else if (kind === 2) {
    const c = ['#3f9a4a', '#256b3a', '#4fa35a', '#c2792a'][cw];
    s += `<path d="M-2 98V90`;
    for (let px = 0; px < 104; px += 6) s += `Q${px + 1.5} ${86 + range(r, -1, 1)} ${px + 3} 89Q${px + 4.5} ${86 + range(r, -1, 1)} ${px + 6} 90`;
    s += `V98Z" fill="${T(c)}"/>`;
    for (let i = 0; i < (cw === 2 ? 28 : 12); i++) s += `<circle cx="${n(range(r, 2, 98))}" cy="${n(range(r, 89, 96))}" r="${n(range(r, 0.5, 0.9))}" fill="${T(cw === 2 ? '#ff7eb0' : cw === 3 ? '#ffd54a' : '#9be28f')}"/>`;
  } else {
    const c = ['#e3c35a', '#7cc860', '#a07ad6', '#7a5638'][cw];
    s += `<rect y="84" width="100" height="16" fill="${T(c)}"/>`;
    for (let i = -8; i < 14; i++) s += `<path d="M${50 + i * 4} 84L${50 + i * 15} 100" stroke="${darken(T(c), 0.25)}" stroke-width="${n(1 + Math.abs(i) * 0.08)}"/>`;
    s += `<path d="M0 84H100" stroke="${darken(T(c), 0.3)}" stroke-width=".5"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ roadside props
function props(v: number, x: Ctx): string {
  const kind = v % 8, alt = (v / 8) | 0;
  const r = rngFor(141, v);
  const T = (c: string) => tone(c, x);
  const lit = isLit(x);
  const px = range(r, 28, 72);
  let s = '';
  const sh = (cx: number, rx: number) => `<ellipse cx="${n(cx)}" cy="96.6" rx="${rx}" ry="1.3" fill="#000" opacity=".2"/>`;
  switch (kind) {
    case 0: { // tent + campfire
      const c = T(alt ? '#e76f51' : '#3a86ff');
      s = sh(px, 14) + gtf(px, 96.6, 1, `<path d="M-12 0L0 -17L12 0Z" fill="${c}"/><path d="M0 -17L4 0H-4Z" fill="${darken(c, 0.3)}"/>`) +
        gtf(px + 20, 96.6, 1, `<path d="M-4 0L4 -2.6M4 0L-4 -2.6" stroke="${T('#6b4423')}" stroke-width="1.2"/><path d="M0 -2Q-3 -5 0 -9Q3 -5 0 -2Z" fill="#ff8a1a"/><path d="M0 -2Q-1.4 -4 0 -6Q1.4 -4 0 -2Z" fill="#ffe066"/>` + (lit ? '<circle cy="-5" r="9" fill="#ff9a2a" opacity=".22"/>' : ''));
      break;
    }
    case 1: { // picnic
      const c = T(alt ? '#3a86ff' : '#e63946');
      s = `<path d="M${px - 14} 97L${px - 10} 91.5H${px + 12}L${px + 16} 97Z" fill="${c}"/>` + [0, 1, 2, 3].map((i) => `<path d="M${px - 10 + i * 6} 91.5L${px - 14 + i * 7} 97" stroke="#fff" stroke-width="1.4" opacity=".7"/>`).join('') + `<rect x="${px - 2}" y="${n(88.6)}" width="8" height="4.6" rx=".8" fill="${T('#b07a3c')}"/><path d="M${px - 1} 88.8Q${px + 2} 85 ${px + 5} 88.8" fill="none" stroke="${T('#7a4f24')}" stroke-width=".8"/><circle cx="${px - 8}" cy="93.4" r="1.4" fill="${T('#d6453a')}"/>`;
      break;
    }
    case 2: { // street lamp + bench
      s = sh(px, 16) + gtf(px - 8, 96.6, 1, `<rect x="-.7" y="-24" width="1.4" height="24" fill="${T('#3a3f48')}"/><path d="M0 -24Q5 -26 7 -22" fill="none" stroke="${T('#3a3f48')}" stroke-width="1.2"/><rect x="5" y="-22.4" width="4" height="2" rx=".8" fill="${lit ? '#fff3a0' : T('#d8dde4')}"/>` + (lit ? '<path d="M5 -20.4H9L13 -4H1Z" fill="#fff3a0" opacity=".2"/>' : '')) +
        gtf(px + 8, 96.6, 1, `<rect x="-8" y="-6" width="16" height="1.8" fill="${T(alt ? '#6b4423' : '#4a7a5a')}"/><rect x="-8" y="-10" width="16" height="1.4" fill="${T(alt ? '#6b4423' : '#4a7a5a')}"/><rect x="-7" y="-6" width="1.2" height="6" fill="#333"/><rect x="5.8" y="-6" width="1.2" height="6" fill="#333"/>`);
      break;
    }
    case 3: { // mailbox + signpost
      s = sh(px, 12) + gtf(px - 6, 96.6, 1, `<rect x="-.6" y="-8" width="1.2" height="8" fill="${T('#6b4423')}"/><rect x="-3.4" y="-12.6" width="6.8" height="4.6" rx="2" fill="${T(alt ? '#2f6fed' : '#d62f3a')}"/><rect x="2" y="-14" width=".8" height="3" fill="${T('#ffc61a')}"/>`) +
        gtf(px + 8, 96.6, 1, `<rect x="-.6" y="-16" width="1.2" height="16" fill="${T('#6b4423')}"/><path d="M-9 -15H6L8.4 -12.8L6 -10.6H-9Z" fill="${T('#e8c892')}"/><path d="M9 -9H-5L-7.4 -6.8L-5 -4.6H9Z" fill="${T('#d6b27a')}"/>`);
      break;
    }
    case 4: { // windmill
      const c = T(alt ? '#f1f3f6' : '#c9663a');
      s = sh(px, 10) + gtf(px, 96.6, 1, `<path d="M-6 0L-3.4 -20H3.4L6 0Z" fill="${c}"/><path d="M-4 -20L0 -26L4 -20Z" fill="${T('#6b4423')}"/><rect x="-1.4" y="-6" width="2.8" height="6" fill="${T('#6b4423')}"/><g stroke="${T('#e8d8b8')}" stroke-width="1.6" transform="translate(0 -20)"><path d="M0 0L-12 -12M0 0L12 12M0 0L12 -12M0 0L-12 12"/></g><circle cy="-20" r="1.4" fill="#333"/>`);
      break;
    }
    case 5: { // scarecrow
      s = sh(px, 8) + gtf(px, 96.6, 1, `<rect x="-.6" y="-18" width="1.2" height="18" fill="${T('#6b4423')}"/><rect x="-8" y="-13" width="16" height="1.2" fill="${T('#6b4423')}"/><path d="M-3 -13H3L2 -6H-2Z" fill="${T(alt ? '#3a86ff' : '#c9663a')}"/><circle cy="-16.4" r="2.6" fill="${T('#e8c892')}"/><path d="M-4 -17.4H4L2 -22H-2Z" fill="${T('#6b4a2a')}"/><path d="M-8 -12L-9.6 -9M8 -12L9.6 -9" stroke="${T('#e8c892')}" stroke-width=".7"/>`);
      break;
    }
    case 6: { // hay bales
      const c = T(alt ? '#e3c35a' : '#d1a847');
      const bale = (cx: number, cy: number) => `<ellipse cx="${cx}" cy="${cy}" rx="5.6" ry="5" fill="${c}"/><ellipse cx="${cx}" cy="${cy}" rx="3.4" ry="3" fill="none" stroke="${darken(c, 0.25)}" stroke-width=".5"/><ellipse cx="${cx}" cy="${cy}" rx="1.4" ry="1.2" fill="none" stroke="${darken(c, 0.25)}" stroke-width=".5"/>`;
      s = sh(px, 16) + bale(px - 8, 93.6) + bale(px + 2, 93.6) + bale(px - 3, 88.6);
      break;
    }
    default: { // pond with ducks
      const w = T(alt ? '#4fb3d9' : '#3a9ad9');
      s = `<ellipse cx="${n(px)}" cy="93" rx="19" ry="4.6" fill="${darken(w, 0.15)}"/><ellipse cx="${n(px)}" cy="92.6" rx="18" ry="4" fill="${w}"/><ellipse cx="${n(px - 6)}" cy="92" rx="5" ry="1" fill="#fff" opacity=".3"/>` +
        [[-4, 0], [5, 1.4]].map(([dx, dy], i) => gtf(px + dx, 93 + dy, 0.8, `<ellipse rx="3.4" ry="2" fill="${T(i ? '#f1e0b0' : '#ffffff')}"/><circle cx="3" cy="-2.4" r="1.5" fill="${T(i ? '#f1e0b0' : '#ffffff')}"/><path d="M4.2 -2.4L6 -2L4.2 -1.6Z" fill="#ff9f1c"/>`)).join('') +
        `<path d="M${px + 15} 95L${px + 14} 88M${px + 17} 95L${px + 17.6} 87M${px + 19} 95L${px + 20.4} 89" stroke="${T('#3f8a46')}" stroke-width=".7"/>`;
    }
  }
  return s;
}

// ------------------------------------------------------------------ sea fore-ground (beach & friends)
function beach(v: number, x: Ctx): string {
  const kind = v % 8, cw = (v / 8) | 0;
  const r = rngFor(151, v);
  const T = (c: string) => tone(c, x);
  const sand = T('#efd9a1');
  const col = T(['#e63946', '#3a86ff', '#ffc61a', '#2fbf71'][cw]);
  const wood = T(['#8a5a2e', '#a9743f', '#6b4423', '#c49a60'][cw]);
  let s = '';
  const shoreY = kind === 1 || kind === 2 ? 99 : 90;
  if (kind !== 1) {
    s += `<path d="M-2 ${shoreY + 2}Q25 ${shoreY - 3} 50 ${shoreY}T102 ${shoreY - 1}V100H-2Z" fill="${sand}"/>`;
    s += `<path d="M-2 ${shoreY + 2}Q25 ${shoreY - 3} 50 ${shoreY}T102 ${shoreY - 1}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/>`;
  } else s += `<path d="M-2 99Q25 96 50 98T102 97V100H-2Z" fill="${sand}"/>`;
  const px = range(r, 30, 70);
  switch (kind) {
    case 0: s += gtf(px, 95.5, 1, `<ellipse cy="1.2" rx="9" ry="1.3" fill="#000" opacity=".15"/><rect x="-.5" y="-14" width="1" height="14" fill="${T('#8a8f98')}"/><path d="M-10 -12Q0 -22 10 -12Z" fill="${col}"/><path d="M-3.4 -12Q-1 -20 0 -19.4Q1 -20 3.4 -12Z" fill="#fff" opacity=".85"/><rect x="5" y="-1.6" width="12" height="3" rx=".6" fill="${T('#fff')}"/>`); break;
    case 1: s += `<rect x="-2" y="${x.baseY + 26}" width="104" height="2.4" fill="${wood}"/>`; // pier
      for (let i = 0; i < 9; i++) s += `<rect x="${i * 11 - 3}" y="${x.baseY + 28}" width="2" height="${9 + (i % 2)}" fill="${darken(wood, 0.25)}"/>`;
      s += `<rect y="${x.baseY + 24}" width="100" height=".9" fill="${darken(wood, 0.1)}"/>` + gtf(px, x.baseY + 26, 1, `<circle cx="0" cy="-4" r="2.2" fill="${col}"/><circle cx="0" cy="-4" r="1" fill="${T('#8fd3ff')}"/>`);
      break;
    case 2: s += [0, 1, 2].map((i) => `<path d="M${px - 14 + i * 12} 100Q${px - 12 + i * 12} ${91 - i % 2 * 3} ${px - 6 + i * 12} 91Q${px + i * 12} 94 ${px + 2 + i * 12} 100Z" fill="${T(['#6e7681', '#7f8792', '#5d646e'][i])}"/>`).join('') + `<path d="M${px - 16} 98Q${px - 10} 95 ${px - 4} 98T${px + 8} 98T${px + 22} 98" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/>`; break;
    case 3: s += [0, 1, 2].map((i) => gtf(px - 16 + i * 17, x.baseY + 16 + i * 4.5, 0.9 + i * 0.12, `<ellipse cy="1.6" rx="4" ry="1" fill="#fff" opacity=".45"/><path d="M-2.6 0Q-3 -5 0 -6.4Q3 -5 2.6 0Z" fill="${col}"/><rect x="-2.8" y="-3.4" width="5.6" height="1.4" fill="#fff"/><rect x="-.3" y="-9" width=".6" height="3" fill="#555"/>`)).join(''); break;
    case 4: s += [[px - 10, 1], [px + 12, 0.8]].map(([cx, sc]) => gtf(cx, 95.5, sc, `<path d="M0 0Q2 -12 -1 -22" stroke="${wood}" stroke-width="2" fill="none"/>` + [-70, -35, 0, 35, 70].map((a) => `<path d="M-1 -22Q${n(Math.sin((a * Math.PI) / 180) * 9)} ${n(-22 - 5 + Math.abs(a) / 12)} ${n(Math.sin((a * Math.PI) / 180) * 12)} ${n(-18 + Math.abs(a) / 10)}" stroke="${T('#2f9e55')}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('') + `<circle cx="-1" cy="-21" r="1.2" fill="${T('#6b4423')}"/>`)).join(''); break;
    case 5: s += gtf(px, 95.5, 1, `<path d="M-8 0V-4H-5V-6H-3V-4H-1V-7H1V-4H3V-6H5V-4H8V0Z" fill="${darken(sand, 0.08)}"/><rect x="-1.4" y="-9" width="2.8" height="3" fill="${darken(sand, 0.12)}"/><rect x="-.3" y="-14" width=".6" height="5" fill="#666"/><path d="M.3 -14L5 -12.4L.3 -10.8Z" fill="${col}"/>`); break;
    case 6: s += `<path d="M-2 95Q10 88 24 94T50 93T76 94T102 90V100H-2Z" fill="#fff" opacity=".9"/><path d="M-2 98Q14 94 30 98T60 97T102 96" fill="none" stroke="${T('#bfe6f5')}" stroke-width="1.4"/>`; break;
    default: s += gtf(px, 96, 1, `<rect x="-5" y="-9" width="1.4" height="9" fill="${wood}"/><rect x="3.6" y="-9" width="1.4" height="9" fill="${wood}"/><path d="M-4 -7Q0 -3 4 -7" fill="none" stroke="${T('#b8a07a')}" stroke-width=".7"/><circle cx="12" cy="-3" r="3" fill="none" stroke="${col}" stroke-width="1.6"/><path d="M-15 -8Q-12 -11 -9 -8M-9 -8Q-6 -11 -3 -8" stroke="#fff" fill="none" stroke-width="1"/>`);
  }
  return s;
}

export function fore(v: number, x: Ctx): string {
  if (x.scene === 'sea') return beach(v % FORE_SEA, x);
  const ground = `<rect y="82" width="100" height="18" fill="${groundColor(x, 1)}"/>`;
  if (v < 64) return ground + road(v, x);
  if (v < 80) return ground + railway(v - 64, x);
  if (v < 96) return ground + flowers(v - 80, x);
  if (v < 112) return ground + fences(v - 96, x);
  return ground + props(v - 112, x);
}
