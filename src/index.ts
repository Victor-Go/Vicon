import { xmur3 } from './util';
import { PALETTES, Ctx } from './palettes';
import { sky, deco1, DECO1_COUNT } from './layers/sky';
import { deco2, DECO2_COUNT } from './layers/deco2';
import { scene, sceneInfo, SCENE_COUNT } from './layers/scene';
import { mid, MID_COUNT } from './layers/mid';
import { fore, FORE_COUNT } from './layers/fore';

export { PALETTES } from './palettes';
export type { Palette, Scene, Time } from './palettes';

export const LAYERS = ['sky', 'deco1', 'deco2', 'scene', 'mid', 'fore'] as const;
export type LayerName = (typeof LAYERS)[number];

/** How many options each layer offers. */
export const LAYER_COUNTS: Record<LayerName, number> = {
  sky: PALETTES.length, deco1: DECO1_COUNT, deco2: DECO2_COUNT, scene: SCENE_COUNT, mid: MID_COUNT, fore: FORE_COUNT,
};
/** Nominal number of combinations (before scene-dependent filtering). */
export const TOTAL_COMBINATIONS = LAYERS.reduce((a, k) => a * LAYER_COUNTS[k], 1);

export type Selection = Record<LayerName, number>;
export type Shape = 'square' | 'rounded' | 'circle';

export interface ViconOptions {
  /** Pixel size of the generated <svg>. Default 128. */
  size?: number;
  /** Outline of the icon. Default 'rounded'. */
  shape?: Shape;
  /** Accessible label. Default: the seed. */
  title?: string;
}

export interface RasterOptions extends ViconOptions {
  /** Pixel multiplier for PNG output (2 = retina). Default 1. */
  scale?: number;
}

/** Deterministically map any string to one option per layer. */
export function select(seed: string): Selection {
  const next = xmur3(String(seed));
  const sel = {} as Selection;
  for (const k of LAYERS) sel[k] = next() % LAYER_COUNTS[k];
  return sel;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** The inside of the <svg> (viewBox 0 0 100 100). Useful for framework wrappers. */
export function renderInner(sel: Selection, shape: Shape = 'rounded'): string {
  const p = PALETTES[sel.sky % PALETTES.length];
  const { scene: kind, baseY } = sceneInfo(sel.scene);
  const uid = 'v' + LAYERS.map((k) => sel[k].toString(36)).join('') + '-';
  const x: Ctx = { p, scene: kind, baseY, uid };
  const body = sky(x) + deco1(sel.deco1, x) + deco2(sel.deco2, x) + scene(sel.scene, x) + mid(sel.mid, x) + fore(sel.fore, x);
  if (shape === 'square') return body;
  const clip = shape === 'circle' ? '<circle cx="50" cy="50" r="50"/>' : '<rect width="100" height="100" rx="20"/>';
  return `<defs><clipPath id="${uid}c">${clip}</clipPath></defs><g clip-path="url(#${uid}c)">${body}</g>`;
}

export function toSvgFromSelection(sel: Selection, opts: ViconOptions = {}, label = ''): string {
  const size = opts.size ?? 128;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${esc(opts.title ?? label)}">${renderInner(sel, opts.shape)}</svg>`;
}

/** One string in, one SVG string out. */
export function toSvg(seed: string, opts: ViconOptions = {}): string {
  return toSvgFromSelection(select(seed), opts, seed);
}

/** `data:` URI for <img src>, CSS backgrounds, Open Graph tags, etc. Works in Node and browsers. */
export function toDataUri(seed: string, opts: ViconOptions = {}): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(toSvg(seed, opts));
}

/** Info about what a seed resolves to - handy for debugging and docs. */
export function describe(seed: string) {
  const sel = select(seed);
  return { selection: sel, palette: PALETTES[sel.sky].name, time: PALETTES[sel.sky].time, scene: sceneInfo(sel.scene).scene };
}
