import { Ctx } from '../palettes';
import { mix, lighten, darken, n, rngFor, range } from '../util';

export const SKY_COUNT = 16;   // palettes live in palettes.ts
export const DECO1_COUNT = 8;

export function sky(x: Ctx): string {
  const id = x.uid + 'sky';
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${x.p.top}"/><stop offset="1" stop-color="${x.p.bot}"/></linearGradient></defs><rect width="100" height="100" fill="url(#${id})"/>`;
}

const sparkle = (cx: number, cy: number, r: number, c: string, o = 1) =>
  `<path d="M${n(cx)} ${n(cy - r)}Q${n(cx)} ${n(cy)} ${n(cx + r)} ${n(cy)}Q${n(cx)} ${n(cy)} ${n(cx)} ${n(cy + r)}Q${n(cx)} ${n(cy)} ${n(cx - r)} ${n(cy)}Q${n(cx)} ${n(cy)} ${n(cx)} ${n(cy - r)}Z" fill="${c}" opacity="${o}"/>`;

function stars(count: number, seed: number, c: string, minY = 3, maxY = 46) {
  const r = rngFor(11, seed);
  let s = '';
  for (let i = 0; i < count; i++) {
    const big = r() < 0.3;
    const px = range(r, 4, 96), py = range(r, minY, maxY);
    s += big ? sparkle(px, py, range(r, 1.6, 2.6), c, 0.95) : `<circle cx="${n(px)}" cy="${n(py)}" r="${n(range(r, 0.3, 0.7))}" fill="${c}" opacity="${n(range(r, 0.5, 1))}"/>`;
  }
  return s;
}

function moon(x: Ctx, kind: 'crescent' | 'full' | 'half', cx: number, cy: number, r: number, halo: boolean) {
  const c = x.p.sun;
  let s = '';
  if (halo) s += `<circle cx="${cx}" cy="${cy}" r="${n(r * 1.9)}" fill="${c}" opacity=".10"/><circle cx="${cx}" cy="${cy}" r="${n(r * 1.45)}" fill="${c}" opacity=".14"/>`;
  if (kind === 'full') {
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
    const cr = darken(c, 0.12);
    s += `<circle cx="${n(cx - r * 0.3)}" cy="${n(cy - r * 0.2)}" r="${n(r * 0.22)}" fill="${cr}" opacity=".55"/>`;
    s += `<circle cx="${n(cx + r * 0.35)}" cy="${n(cy + r * 0.3)}" r="${n(r * 0.28)}" fill="${cr}" opacity=".45"/>`;
    s += `<circle cx="${n(cx + r * 0.1)}" cy="${n(cy - r * 0.5)}" r="${n(r * 0.12)}" fill="${cr}" opacity=".5"/>`;
  } else if (kind === 'half') {
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity=".16"/>`;
    s += `<path d="M${cx} ${n(cy - r)}A${r} ${r} 0 0 1 ${cx} ${n(cy + r)}Z" fill="${c}"/>`;
  } else {
    const id = x.uid + 'mm';
    s += `<mask id="${id}"><rect width="100" height="100" fill="#000"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><circle cx="${n(cx + r * 0.55)}" cy="${n(cy - r * 0.25)}" r="${n(r * 0.88)}" fill="#000"/></mask>`;
    s += `<rect width="100" height="100" fill="${c}" mask="url(#${id})"/>`;
  }
  return s;
}

function sun(x: Ctx, v: number) {
  const c = x.p.sun;
  const dusk = x.p.time === 'dusk';
  const core = lighten(c, 0.35);
  const rays = (cx: number, cy: number, r0: number, r1: number, k: number, w = 1) => {
    let s = '';
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      s += `<line x1="${n(cx + Math.cos(a) * r0)}" y1="${n(cy + Math.sin(a) * r0)}" x2="${n(cx + Math.cos(a) * r1)}" y2="${n(cy + Math.sin(a) * r1)}"/>`;
    }
    return `<g stroke="${c}" stroke-width="${w}" stroke-linecap="round">${s}</g>`;
  };
  const px = v % 2 ? 74 : 26;
  const py = dusk ? 36 : 22;
  switch (v) {
    case 0: return `<circle cx="${px}" cy="${py}" r="6" fill="${c}"/>`;
    case 1: return `<circle cx="${px}" cy="${py}" r="11" fill="${c}"/><circle cx="${px}" cy="${py}" r="7" fill="${core}" opacity=".6"/>`;
    case 2: return rays(px, py, 9, 14, 12, 1.4) + `<circle cx="${px}" cy="${py}" r="7" fill="${c}"/>`;
    case 3: return `<circle cx="${px}" cy="${py}" r="20" fill="${c}" opacity=".12"/><circle cx="${px}" cy="${py}" r="14" fill="${c}" opacity=".2"/><circle cx="${px}" cy="${py}" r="8" fill="${c}"/>`;
    case 4: return `<circle cx="${px}" cy="${n(x.baseY - 4)}" r="${dusk ? 18 : 15}" fill="${c}"/><circle cx="${px}" cy="${n(x.baseY - 4)}" r="${dusk ? 26 : 22}" fill="${c}" opacity=".18"/>`;
    case 5: return rays(px, py, 7, 10, 8, 1) + `<circle cx="${px}" cy="${py}" r="5.5" fill="${c}"/><circle cx="${px}" cy="${py}" r="14" fill="${c}" opacity=".15"/>`;
    case 6: return `<circle cx="${px}" cy="${py}" r="9" fill="${mix(c, x.p.cloud, 0.45)}"/><circle cx="${px}" cy="${py}" r="5.5" fill="${c}"/>`;
    default: return [24, 18, 12, 7].map((r, i) => `<circle cx="${px}" cy="${py}" r="${r}" fill="${c}" opacity="${[0.08, 0.14, 0.3, 1][i]}"/>`).join('');
  }
}

/** Layer 2: celestial body. 8 variants; night -> stars/moon, day & dusk -> sun. */
export function deco1(v: number, x: Ctx): string {
  if (x.p.time !== 'night') return sun(x, v);
  const sc = lighten(x.p.sun, 0.3);
  switch (v) {
    case 0: return stars(7, 1, sc);
    case 1: return stars(22, 2, sc);
    case 2: { const gid = x.uid + 'sh'; return stars(12, 3, sc) + `<defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="42" y1="9" x2="68" y2="24"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><line x1="42" y1="9" x2="68" y2="24" stroke="url(#${gid})" stroke-width="1.4" stroke-linecap="round"/><circle cx="68" cy="24" r="1.5" fill="#fff"/>`; }
    case 3: return moon(x, 'crescent', 72, 22, 10, false);
    case 4: return moon(x, 'full', 28, 24, 10, true);
    case 5: return moon(x, 'half', 70, 24, 9, false);
    case 6: return stars(10, 6, sc) + moon(x, 'crescent', 28, 22, 9, true);
    default: return stars(16, 7, sc) + moon(x, 'full', 72, 24, 12, true);
  }
}
