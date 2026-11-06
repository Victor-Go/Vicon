import { Ctx, Scene, tone, land } from '../palettes';
import { mix, lighten, darken, n, rngFor, range, Rng } from '../util';

/** Layer 4: the landscape backdrop. 16 variants over 6 scene kinds. */
export const SCENE_COUNT = 16;

export function sceneInfo(v: number): { scene: Scene; baseY: number } {
  if (v < 3) return { scene: 'mountain', baseY: 66 };
  if (v < 6) return { scene: 'hills', baseY: 66 };
  if (v < 9) return { scene: 'snow', baseY: 66 };
  if (v < 11) return { scene: 'plain', baseY: 62 };
  if (v < 14) return { scene: 'sea', baseY: 58 };
  return { scene: 'forest', baseY: 64 };
}

/** Colour of the flat land that mid / fore layers stand on. */
export function groundColor(x: Ctx, depth = 0.7): string {
  const base = x.scene === 'snow' ? '#e7eff7' : x.scene === 'plain' ? lighten(x.p.grass, 0.12) : x.p.grass;
  return land(base, x, depth);
}

type Pt = [number, number];

function ridge(r: Rng, count: number, base: number, amp: number, valley = 0.3): Pt[] {
  const pts: Pt[] = [];
  const step = 110 / count;
  for (let i = 0; i <= count; i++) {
    const peak = i % 2 === 0;
    const px = -5 + i * step + range(r, -step * 0.2, step * 0.2);
    pts.push([px, base - (peak ? amp * range(r, 0.55, 1) : amp * range(r, 0, valley))]);
  }
  return pts;
}

const closeDown = (d: string, bottom = 100) => `${d}L105 ${bottom}L-5 ${bottom}Z`;
const jagPath = (pts: Pt[]) => closeDown('M' + pts.map((p) => `${n(p[0])} ${n(p[1])}`).join('L'));
function smoothPath(pts: Pt[]) {
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${n(pts[i][0])} ${n(pts[i][1])} ${n(mx)} ${n(my)}`;
  }
  const l = pts[pts.length - 1];
  return closeDown(d + `L${n(l[0])} ${n(l[1])}`);
}

function snowCaps(pts: Pt[], color: string, depth = 0.34) {
  let s = '';
  for (let i = 1; i < pts.length - 1; i += 2) {
    const [px, py] = pts[i], [lx, ly] = pts[i - 1], [rx, ry] = pts[i + 1];
    const a = (t: number, ax: number, ay: number): Pt => [px + (ax - px) * t, py + (ay - py) * t];
    const L = a(depth, lx, ly), R = a(depth, rx, ry);
    const Lm = a(depth * 0.55, lx, ly), Rm = a(depth * 0.5, rx, ry);
    const h = Math.min(ly, ry) - py;
    s += `<path d="M${n(px)} ${n(py)}L${n(L[0])} ${n(L[1])}L${n(Lm[0] + 1.2)} ${n(L[1] - h * 0.08)}L${n(px - 0.5)} ${n(py + h * depth * 0.95)}L${n(Rm[0] - 1.2)} ${n(R[1] - h * 0.04)}L${n(R[0])} ${n(R[1])}Z" fill="${color}"/>`;
  }
  return s;
}

function tree(cx: number, by: number, h: number, c: string, round: boolean) {
  return round
    ? `<circle cx="${n(cx)}" cy="${n(by - h * 0.6)}" r="${n(h * 0.5)}" fill="${c}"/>`
    : `<path d="M${n(cx)} ${n(by - h)}L${n(cx + h * 0.32)} ${n(by)}L${n(cx - h * 0.32)} ${n(by)}Z" fill="${c}"/>`;
}

export function scene(v: number, x: Ctx): string {
  const r = rngFor(61, v);
  const { baseY } = x;
  const k = x.scene;
  let s = '';
  const haze = x.p.bot;

  if (k === 'sea') {
    const id = x.uid + 'sea';
    const shallow = mix(x.p.bot, '#3aa6d8', 0.55), deep = mix(x.p.top, '#0f4f86', 0.55);
    s += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tone(shallow, x)}"/><stop offset="1" stop-color="${tone(deep, x)}"/></linearGradient></defs>`;
    if (v === 12) { // distant island
      const ix = range(r, 55, 78);
      s += `<path d="M${n(ix - 16)} ${baseY}Q${n(ix - 8)} ${baseY - 7} ${n(ix)} ${baseY - 8}Q${n(ix + 8)} ${baseY - 6} ${n(ix + 16)} ${baseY}Z" fill="${land(x.p.grass, x, 0.1)}"/>`;
    }
    s += `<rect y="${baseY}" width="100" height="${100 - baseY}" fill="url(#${id})"/>`;
    const wc = lighten(tone(shallow, x), 0.35);
    const rows = v === 13 ? 9 : 6;
    for (let i = 0; i < rows; i++) {
      const y = baseY + 3 + (i / rows) * (100 - baseY - 4) * (0.5 + 0.5 * (i / rows));
      const cnt = 3 + (i >> 1);
      for (let j = 0; j < cnt; j++) {
        const wx = range(r, 0, 95), w = 3 + i * 0.9;
        s += `<path d="M${n(wx)} ${n(y)}q${n(w / 4)} ${v === 13 ? -1.6 : -0.8} ${n(w / 2)} 0t${n(w / 2)} 0" fill="none" stroke="${wc}" stroke-width=".7" stroke-linecap="round" opacity=".6"/>`;
      }
    }
    if (v === 11) s += `<rect x="30" y="${baseY}" width="40" height="1.2" fill="${x.p.sun}" opacity=".35"/>`;
    return s;
  }

  const gfill = groundColor(x, 0.35);
  const rockFar = land(k === 'snow' ? '#8fa2c0' : '#8a97b2', x, 0.15);
  const rockNear = land(k === 'snow' ? '#6c7e9e' : '#6b7a8c', x, 0.45);
  const cap = tone('#ffffff', x);

  if (k === 'mountain' || k === 'snow') {
    const f = v % 3;
    const farPts = ridge(r, [6, 8, 5][f], baseY - 4, [30, 26, 36][f], 0.3);
    const nearPts = ridge(r, [8, 6, 9][f], baseY, [20, 26, 18][f], 0.2);
    s += `<path d="${jagPath(farPts)}" fill="${rockFar}"/>`;
    if (k === 'snow') s += snowCaps(farPts, lighten(cap, 0.02), 0.34);
    s += `<path d="${jagPath(nearPts)}" fill="${rockNear}"/>`;
    if (k === 'snow') s += snowCaps(nearPts, cap, 0.3);
  } else if (k === 'hills') {
    const f = v % 3;
    const cols = [land('#7aa66a', x, 0.15), land('#6aa05c', x, 0.35), land('#5c9650', x, 0.55)];
    for (let i = 0; i < 3; i++) {
      const pts = ridge(r, [4, 6, 5][f] + i, baseY - 6 + i * 2.5, [16, 22, 12][f] - i * 3, 0.5);
      s += `<path d="${smoothPath(pts)}" fill="${i === 0 ? mix(rockFar, cols[0], 0.5) : cols[i]}"/>`;
    }
  } else if (k === 'plain') {
    s += `<path d="${smoothPath(ridge(r, 6, baseY - 1, 7, 0.5))}" fill="${land('#7da07f', x, 0.1)}"/>`;
    if (v === 10) { // patchwork fields receding
      const cs = ['#d8c65c', '#9ccf5e', '#c2a45a', '#7fc06a'];
      for (let i = 0; i < 4; i++) {
        const y0 = baseY + i * i * 1.1 + i * 2, y1 = baseY + (i + 1) * (i + 1) * 1.1 + (i + 1) * 2;
        s += `<rect y="${n(y0)}" width="100" height="${n(y1 - y0 + 0.2)}" fill="${land(cs[i], x, 0.5 + i * 0.1)}"/>`;
      }
    }
  } else {            // forest backdrop
    const round = v === 15;
    const farC = land(round ? '#58a05a' : '#2f6f55', x, 0.2), nearC = land(round ? '#3f8a4a' : '#215c46', x, 0.5);
    const hillF = ridge(r, 4, baseY - 5, 10, 0.6);
    s += `<path d="${smoothPath(hillF)}" fill="${farC}"/>`;
    for (let i = 0; i < 24; i++) { const tx = -2 + i * 4.4 + range(r, -1, 1); s += tree(tx, baseY - 4 + range(r, -3, 0), range(r, 9, 14), farC, round); }
    s += `<path d="${smoothPath(ridge(r, 5, baseY + 1, 5, 0.6))}" fill="${nearC}"/>`;
    for (let i = 0; i < 20; i++) { const tx = 1 + i * 5.2 + range(r, -1, 1); s += tree(tx, baseY + 4 + range(r, -2, 1), range(r, 11, 17), nearC, round); }
  }
  // land that everything else stands on
  s += `<rect y="${baseY}" width="100" height="${100 - baseY}" fill="${gfill}"/>`;
  return s;
}
