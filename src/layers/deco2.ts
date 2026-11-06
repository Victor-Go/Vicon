import { Ctx, tone } from '../palettes';
import { mix, lighten, darken, n, rngFor, range, pick } from '../util';

/** Layer 3: things in the sky. 128 variants = 32 clouds + 24 birds + 24 planes + 24 balloons + 24 rockets. */
export const DECO2_COUNT = 128;

const g = (x: number, y: number, s: number, body: string, rot = 0, flip = false) =>
  `<g transform="translate(${n(x)} ${n(y)}) rotate(${rot}) scale(${flip ? -s : s} ${s})">${body}</g>`;

// ---------------------------------------------------------------- clouds (32 = 8 shapes x 4 arrangements)
const CLOUD_SHAPES: ((c: string) => string)[] = [
  (c) => `<g fill="${c}"><circle cx="-8" cy="1" r="6"/><circle cx="0" cy="-3" r="8"/><circle cx="8" cy="0" r="6.5"/><rect x="-14" y="1" width="28" height="7" rx="3.5"/></g>`,
  (c) => `<g fill="${c}"><circle cx="-13" cy="2" r="5"/><circle cx="-5" cy="-2" r="7"/><circle cx="5" cy="-1" r="7.5"/><circle cx="13" cy="2" r="5.5"/><rect x="-18" y="2" width="36" height="6" rx="3"/></g>`,
  (c) => `<g fill="${c}"><rect x="-16" y="-4" width="26" height="3.4" rx="1.7"/><rect x="-8" y="1" width="30" height="3.4" rx="1.7" opacity=".85"/><rect x="-18" y="6" width="22" height="3.4" rx="1.7" opacity=".7"/></g>`,
  (c) => `<g fill="${c}"><circle cx="2" cy="-8" r="5.5"/><circle cx="-4" cy="-4" r="5"/><circle cx="-9" cy="2" r="5"/><circle cx="0" cy="1" r="7"/><circle cx="9" cy="2" r="5.5"/><rect x="-14" y="2" width="28" height="6" rx="3"/></g>`,
  (c) => `<g fill="${c}"><circle cx="-12" cy="2" r="4"/><circle cx="-6" cy="-1" r="5"/><rect x="-16" y="2" width="18" height="5" rx="2.5"/><circle cx="9" cy="5" r="3"/><circle cx="14" cy="3" r="3.6"/><rect x="5" y="5" width="14" height="3.6" rx="1.8"/></g>`,
  (c) => `<g fill="${c}"><circle cx="-10" cy="2" r="7"/><circle cx="-2" cy="-5" r="10"/><circle cx="9" cy="-1" r="8"/><circle cx="16" cy="4" r="5"/><rect x="-17" y="2" width="38" height="8" rx="4"/></g>`,
  (c) => `<g fill="${c}"><rect x="-17" y="1" width="30" height="5" rx="2.5"/><rect x="-10" y="-3" width="24" height="5" rx="2.5"/><circle cx="-2" cy="-4" r="4"/><circle cx="8" cy="-4" r="3.2"/></g>`,
  (c) => `<g fill="${c}"><circle cx="-6" cy="0" r="6"/><circle cx="2" cy="-3" r="7"/><circle cx="9" cy="1" r="5"/><rect x="-12" y="1" width="26" height="6" rx="3"/><circle cx="19" cy="5" r="2.4"/><circle cx="24" cy="6" r="1.6"/><circle cx="27" cy="6.5" r=".9"/></g>`,
];
const CLOUD_LAYOUTS: [number, number, number][][] = [
  [[32, 22, 1.05]],
  [[68, 28, 0.95]],
  [[26, 17, 0.85], [70, 33, 0.65]],
  [[18, 15, 0.55], [52, 26, 0.8], [84, 13, 0.5]],
];

function cloud(v: number, x: Ctx) {
  const c = tone(x.p.cloud, x);
  const sh = mix(c, x.p.top, 0.3);
  const shape = CLOUD_SHAPES[v % 8];
  return CLOUD_LAYOUTS[(v / 8) | 0]
    .map(([px, py, s], i) => { const f = (i + v) % 2 === 1; return g(px, py + 1.4 * s, s, shape(sh), 0, f) + g(px, py, s, shape(c), 0, f); })
    .join('');
}

// ---------------------------------------------------------------- birds (24 = 3 kinds x 8 flocks)
function birds(v: number, x: Ctx) {
  const kind = v % 3, k = (v / 3) | 0;
  const r = rngFor(21 + kind, k);
  const col = x.p.time === 'night' ? lighten(x.p.bot, 0.6) : darken(mix(x.p.top, '#101820', 0.55), 0.1);
  let s = '';
  if (kind === 0) {            // seagulls: loose scatter of M-shaped birds
    const count = [1, 2, 3, 2, 4, 3, 5, 3][k];
    for (let i = 0; i < count; i++) {
      const sc = range(r, 0.8, 1.5);
      s += g(range(r, 22, 78), range(r, 12, 38), sc, `<path d="M-5 1Q-3 -3 0 0Q3 -3 5 1" fill="none" stroke="${col}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
  } else if (kind === 1) {     // wild geese: V formation
    const count = [3, 5, 7, 5, 9, 7, 3, 5][k];
    const ox = range(r, 34, 66), oy = range(r, 14, 28), flip = k % 2 === 1;
    for (let i = 0; i < count; i++) {
      const row = Math.ceil(i / 2), side = i === 0 ? 0 : i % 2 ? -1 : 1;
      const px = ox + (flip ? -1 : 1) * row * 5.5, py = oy + row * 3.2 * side + (i === 0 ? 0 : 0);
      s += g(px, py, 0.85, `<path d="M-3.5 -1.5Q-1.6 -1 0 1Q1.6 -1 3.5 -1.5" fill="none" stroke="${col}" stroke-width=".9" stroke-linecap="round"/>`, 0, flip);
    }
  } else {                     // eagles: big soaring silhouettes
    const count = [1, 1, 2, 1, 2, 1, 2, 3][k];
    for (let i = 0; i < count; i++) {
      const sc = i === 0 ? range(r, 1.1, 1.7) : range(r, 0.6, 0.9);
      s += g(i === 0 ? range(r, 30, 70) : range(r, 20, 80), i === 0 ? range(r, 14, 30) : range(r, 26, 40), sc,
        `<path d="M0 -1C-3 -4-9 -4-14 -1.5C-9 -2.2-6 0-4 3L-1.5 2L0 6L1.5 2L4 3C6 0 9 -2.2 14 -1.5C9 -4 3 -4 0 -1Z" fill="${col}"/>`, range(r, -8, 8), r() < 0.5);
    }
  }
  return s;
}

// ---------------------------------------------------------------- planes (24 = 4 kinds x 6 colourways)
const PLANE_COLORS: [string, string][] = [['#f5f7fa', '#e63946'], ['#f5f7fa', '#2f6fed'], ['#a9b4c2', '#ff8c1a'], ['#ffd23f', '#1d2f6f'], ['#e63946', '#f5f7fa'], ['#2ec4b6', '#1d3557']];

function plane(v: number, x: Ctx) {
  const kind = v % 4, cw = (v / 4) | 0;
  const [bodyC, wingC] = PLANE_COLORS[cw].map((c) => tone(c, x));
  const glass = tone('#233a5e', x);          // dark glass: always readable against the body
  const dark = darken(wingC, 0.3);
  const eng = tone('#6b7482', x);
  const P = (d: string, f: string) => `<path d="${d}" fill="${f}" stroke="#0b1a33" stroke-opacity=".3" stroke-width=".4" stroke-linejoin="round"/>`;
  const prop = (px: number) => `<circle cx="${px}" cy="0" r="1.1" fill="${wingC}"/><ellipse cx="${px + 0.8}" cy="0" rx=".8" ry="5" fill="${dark}" opacity=".45"/>`;
  let b = '', tail = -17;
  if (kind === 0) {           // airliner
    b = P('M-2 -2.5L-5 -5.2H-2.4L2.6 -2.5Z', darken(wingC, 0.3)) +
      P('M-16.6 -2L-14.2 -8.8H-11L-9.4 -2.4Z', wingC) + P('M-14 -0.5L-18 -4H-15.6L-10 -1Z', dark) +
      P('M-17 -2L-14 -2.9H11Q17 -2.9 18 0Q17 2.7 11 2.7H-13Q-17 2.7 -17 -0.5Z', bodyC) +
      `<path d="M-15 .7H14" stroke="${wingC}" stroke-width=".8"/>` +
      [-10, -7, -4, -1, 2, 5, 8].map((px) => `<circle cx="${px}" cy="-0.9" r=".65" fill="${glass}"/>`).join('') +
      `<path d="M12 -2.3Q15.4 -2.3 16.6 -.5H12Z" fill="${glass}"/>` +
      `<rect x="2.2" y="2.2" width="1.4" height="1.6" fill="${eng}"/><rect x="0.2" y="3.4" width="6" height="2.6" rx="1.3" fill="${eng}"/><rect x="5" y="3.7" width="1" height="2" rx=".5" fill="${darken(eng, 0.4)}"/>` +
      P('M-1 1.2L-9 8H-5.2L6 1.2Z', wingC);
  } else if (kind === 1) {    // propeller plane
    tail = -13;
    b = P('M-14 -1L-12.8 -7H-9.4L-7.4 -2.4Z', wingC) + P('M-12.5 .2L-15.4 2.8H-12.6L-9 .8Z', dark) + P('M0 -3L-1.6 -4.8H1.4L3 -3Z', darken(wingC, 0.3)) +
      P('M-14 -.6L-10 -3.4H7Q12 -3.4 12.6 0Q12 3.2 7 3.2H-10L-14 .8Z', bodyC) +
      `<path d="M-2.4 -3.4Q0 -6.2 4.2 -3.4Z" fill="${glass}"/>` +
      P('M-2.4 1L-6.4 7.6H-1.6L4 1Z', wingC) + prop(12.8);
  } else if (kind === 2) {    // jet fighter
    tail = -21;
    b = `<path d="M-16 -.6L-21 .4L-16 1.6Z" fill="#ffb347"/>` + P('M-13 -1.2L-16 -8H-11.5L-7 -1.2Z', wingC) + P('M-6 -1.4L-11 -5H-8.6L-1 -1.4Z', dark) +
      P('M-16 -1.4L-4 -2.2Q6 -2.4 19 1Q8 3.2 -4 3L-16 2.4Z', bodyC) + `<path d="M1.5 -2.2Q4.6 -4.8 9.6 -.6H1.5Z" fill="${glass}"/>` +
      P('M-4 1.6L-14 8H-9L4 2Z', wingC);
  } else {                    // biplane
    tail = -13;
    b = `<path d="M-3 -6.6V4.6M5 -6.6V4.6" stroke="${dark}" stroke-width=".7"/>` +
      P('M-5.4 4.4H7.4Q8 5.2 7.4 6H-5.4Q-6 5.2 -5.4 4.4Z', wingC) + P('M-12 -1L-13 -6.4H-9.6L-8.6 -2.4Z', wingC) +
      P('M-12 -1L-9 -3H7Q11 -3 11.4 0Q11 3 7 3H-9Q-12 3 -12 1Z', bodyC) + `<path d="M0 -3Q2.4 -5.4 5.2 -3Z" fill="${glass}"/>` +
      P('M-6.4 -8.2H8.4Q9 -7.4 8.4 -6.6H-6.4Q-7 -7.4 -6.4 -8.2Z', wingC) + prop(11.8);
  }
  const r = rngFor(31, v);
  const flip = cw % 2 === 1;
  const ct = x.uid + 'ct';
  const trail = kind % 2 === 0
    ? `<defs><linearGradient id="${ct}" gradientUnits="userSpaceOnUse" x1="${tail}" y1="0" x2="${tail - 55}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="${x.p.time === 'night' ? 0.3 : 0.6}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="M${tail} .2L${tail - 55} -2L${tail - 55} 3Z" fill="url(#${ct})"/>` : '';
  const px = range(r, 38, 64), py = range(r, 16, 34), sc = range(r, 0.95, 1.3);
  return g(px, py, sc, trail + b, flip ? 7 : -7, flip);
}

// ---------------------------------------------------------------- hot-air balloons (24 = 4 kinds x 6 colourways)
const BALLOON_COLORS: [string, string, string][] = [
  ['#e63946', '#ffd166', '#8b5a2b'], ['#3a86ff', '#ffffff', '#6b4423'], ['#ff9f1c', '#2ec4b6', '#7a4b2a'],
  ['#8338ec', '#ffbe0b', '#5c3b1e'], ['#06d6a0', '#ef476f', '#8b5a2b'], ['#ff5d9e', '#fff1f7', '#6b4423'],
];
const ENV = 'M0 -14C11 -14 13.5 -2 4.5 9L-4.5 9C-13.5 -2 -11 -14 0 -14Z';

function balloonOne(kind: number, A: string, B: string, bk: string, x: Ctx, id: string) {
  const rope = `<path d="M-4.4 9L-3 14M4.4 9L3 14" stroke="${darken(bk, 0.3)}" stroke-width=".5"/><rect x="-3.4" y="14" width="6.8" height="4.6" rx=".8" fill="${bk}"/>`;
  let env = `<path d="${ENV}" fill="${A}"/>`;
  if (kind === 0) env += `<path d="M0 -14C5 -12 5.5 -2 1.6 9L-1.6 9C-5.5 -2 -5 -12 0 -14Z" fill="${B}"/>`;
  else if (kind === 1) env += `<clipPath id="${id}"><path d="${ENV}"/></clipPath><g clip-path="url(#${id})" fill="${B}"><rect x="-14" y="-9" width="28" height="3.4"/><rect x="-14" y="-1.5" width="28" height="3.4"/></g>`;
  else if (kind === 2) env += [[-4, -6], [4, -6], [0, -10], [0, -2], [-5, 2], [5, 2], [0, 5]].map(([px, py]) => `<circle cx="${px}" cy="${py}" r="1.5" fill="${B}"/>`).join('');
  else env += `<path d="M-8 -6Q0 -2 8 -6M-10 0Q0 4 10 0" fill="none" stroke="${B}" stroke-width="1.4"/>`;
  return env + `<path d="M0 -14C11 -14 13.5 -2 4.5 9L-4.5 9C-13.5 -2 -11 -14 0 -14Z" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".5"/>` + rope;
}

function balloon(v: number, x: Ctx) {
  const kind = v % 4, cw = (v / 4) | 0;
  const [A, B, bk] = BALLOON_COLORS[cw].map((c) => tone(c, x));
  const r = rngFor(41, v);
  const id = x.uid + 'bl';
  if (kind === 3) {            // a pair, one near one far
    const [A2, B2, bk2] = BALLOON_COLORS[(cw + 3) % 6].map((c) => tone(c, x));
    return g(range(r, 24, 40), range(r, 28, 36), 0.5, balloonOne(0, A2, B2, bk2, x, id + 'b')) + g(range(r, 54, 70), range(r, 24, 30), 0.85, balloonOne(2, A, B, bk, x, id));
  }
  return g(range(r, 30, 70), range(r, 22, 32), range(r, 0.85, 1.2), balloonOne(kind, A, B, bk, x, id));
}

// ---------------------------------------------------------------- rockets (24 = 4 kinds x 6 colourways)
const ROCKET_COLORS: [string, string][] = [['#f4f4f8', '#e63946'], ['#f4f4f8', '#3a86ff'], ['#ffd166', '#ef476f'], ['#2ec4b6', '#ffffff'], ['#c9ced6', '#ff7f11'], ['#8338ec', '#ffd6a5']];

function rocket(v: number, x: Ctx) {
  const kind = v % 4, cw = (v / 4) | 0;
  const [A, B] = ROCKET_COLORS[cw].map((c) => tone(c, x));
  const win = tone('#bfe6ff', x);
  const D = darken(B, 0.25);
  const S = (d: string, f: string) => `<path d="${d}" fill="${f}" stroke="#0b1a33" stroke-opacity=".25" stroke-width=".4" stroke-linejoin="round"/>`;
  const flame = `<path d="M-2.6 12Q0 27 2.6 12Z" fill="#ff8c1a"/><path d="M-1.4 12Q0 20 1.4 12Z" fill="#ffe066"/>`;
  let b = '';
  if (kind === 0) {           // classic: two small swept fins hugging the base
    b = S('M-4.8 3Q-9.4 5.6 -9.4 12L-4.4 9.4Z', B) + S('M4.8 3Q9.4 5.6 9.4 12L4.4 9.4Z', B) +
      S('M0 -16C6 -10 6 2 5 11H-5C-6 2 -6 -10 0 -16Z', A) +
      `<path d="M0 -16C2.6 -13.4 4.2 -10.6 4.8 -8H-4.8C-4.2 -10.6 -2.6 -13.4 0 -16Z" fill="${B}"/>` +
      `<circle cy="-1.5" r="2.4" fill="${win}" stroke="${B}" stroke-width=".9"/><rect x="-2.6" y="11" width="5.2" height="1.4" rx=".6" fill="${D}"/>`;
  } else if (kind === 1) {    // slim, three fins (centre one in front)
    b = S('M-3 4Q-7.2 6 -7.2 12L-3 10Z', B) + S('M3 4Q7.2 6 7.2 12L3 10Z', B) +
      S('M0 -17C3.6 -11 3.6 2 3.2 12H-3.2C-3.6 2 -3.6 -11 0 -17Z', A) +
      `<path d="M0 -17C1.8 -14 2.8 -12 3 -9.6H-3C-2.8 -12 -1.8 -14 0 -17Z" fill="${B}"/><rect x="-3.4" y="1" width="6.8" height="1.8" fill="${B}"/>` +
      `<circle cy="-5" r="1.5" fill="${win}" stroke="${B}" stroke-width=".7"/>` + S('M0 6L2 12H-2Z', D);
  } else if (kind === 2) {    // stubby capsule on legs
    b = `<path d="M-6 10L-9.8 13.6M6 10L9.8 13.6" stroke="${B}" stroke-width="1.5" stroke-linecap="round"/>` +
      S('M0 -12C8 -9 9 3 7 11H-7C-9 3 -8 -9 0 -12Z', A) +
      `<path d="M0 -12C3.4 -10.6 6 -8.6 7.2 -6H-7.2C-6 -8.6 -3.4 -10.6 0 -12Z" fill="${B}"/><circle r="3.6" fill="${win}" stroke="${B}" stroke-width="1.1"/><rect x="-5" y="10.6" width="10" height="1.8" rx=".6" fill="${D}"/>`;
  } else {                    // core + two strap-on boosters
    b = S('M-8.6 -2Q-8.6 -8 -6.3 -9.6Q-4 -8 -4 -2V10.6H-8.6Z', B) + S('M8.6 -2Q8.6 -8 6.3 -9.6Q4 -8 4 -2V10.6H8.6Z', B) +
      S('M0 -17C4.2 -11 4.2 2 4 11.5H-4C-4.2 2 -4.2 -11 0 -17Z', A) +
      `<circle cy="-6" r="1.7" fill="${win}" stroke="${B}" stroke-width=".7"/><rect x="-4.2" y="3" width="8.4" height="1.8" fill="${B}"/>`;
  }
  const r = rngFor(51, v);
  const rot = range(r, 25, 50) * (cw % 2 ? -1 : 1);
  const px = range(r, 34, 66), py = range(r, 22, 36);
  const trail = `<path d="M0 14Q-3 24 2 32T0 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="${x.p.time === 'night' ? 0.18 : 0.4}"/>`;
  return g(px, py, range(r, 0.8, 1.05), trail + flame + b, rot);
}

export function deco2(v: number, x: Ctx): string {
  if (v < 32) return cloud(v, x);
  if (v < 56) return birds(v - 32, x);
  if (v < 80) return plane(v - 56, x);
  if (v < 104) return balloon(v - 80, x);
  return rocket(v - 104, x);
}
