import { mix } from './util';

export type Time = 'day' | 'dusk' | 'night';
export type Scene = 'mountain' | 'hills' | 'snow' | 'plain' | 'sea' | 'forest';

export interface Palette {
  name: string;
  time: Time;
  top: string;     // sky, top
  bot: string;     // sky, horizon
  grass: string;   // base land colour
  sun: string;     // sun body (day/dusk) or moon body (night)
  cloud: string;
  amb: string;     // ambient colour mixed over everything
  dim: number;     // how strongly amb is mixed in (0..1)
}

export const PALETTES: Palette[] = [
  // ---- day (6)
  { name: 'Clear Noon',     time: 'day',   top: '#3f9cf5', bot: '#cdeaff', grass: '#5cb860', sun: '#ffd23f', cloud: '#ffffff', amb: '#ffffff', dim: 0 },
  { name: 'Soft Morning',   time: 'day',   top: '#86bff7', bot: '#fff0d2', grass: '#7cc576', sun: '#ffc93c', cloud: '#fffaf0', amb: '#fff1d6', dim: 0.05 },
  { name: 'Lagoon',         time: 'day',   top: '#22bfd3', bot: '#d9fff3', grass: '#43b894', sun: '#fff07a', cloud: '#f4fffd', amb: '#e0fff7', dim: 0.05 },
  { name: 'Golden Day',     time: 'day',   top: '#58aef0', bot: '#fff4c4', grass: '#9ccb55', sun: '#ffb627', cloud: '#fffdf2', amb: '#fff0b8', dim: 0.08 },
  { name: 'Hazy Grey',      time: 'day',   top: '#93aec8', bot: '#eef1f4', grass: '#8caf88', sun: '#fff3c9', cloud: '#f6f8fa', amb: '#dfe6ec', dim: 0.12 },
  { name: 'Candy Spring',   time: 'day',   top: '#7ccfff', bot: '#ffe0ef', grass: '#8ad68f', sun: '#ffe066', cloud: '#fff7fb', amb: '#ffe6f2', dim: 0.06 },
  // ---- dusk (5)
  { name: 'Orange Sunset',  time: 'dusk',  top: '#4c3f94', bot: '#ff9a55', grass: '#6a9a4e', sun: '#ff7a2f', cloud: '#ffc79a', amb: '#ff8a4a', dim: 0.28 },
  { name: 'Rose Dusk',      time: 'dusk',  top: '#6f55bd', bot: '#ff8fb1', grass: '#6a9d6b', sun: '#ffb3a0', cloud: '#ffc2d6', amb: '#e0679b', dim: 0.3 },
  { name: 'Amber Glow',     time: 'dusk',  top: '#e0663f', bot: '#ffd36e', grass: '#8f9a45', sun: '#fff0a0', cloud: '#ffe0a8', amb: '#ffa63d', dim: 0.25 },
  { name: 'Teal Horizon',   time: 'dusk',  top: '#27598f', bot: '#ff7e6b', grass: '#4f8f78', sun: '#ffd0a0', cloud: '#ffb3a3', amb: '#ff7a6a', dim: 0.3 },
  { name: 'Crimson Evening',time: 'dusk',  top: '#7a2a58', bot: '#ff6a38', grass: '#6f8a40', sun: '#ffcf70', cloud: '#ff9a7a', amb: '#ff5c38', dim: 0.34 },
  // ---- night (5)
  { name: 'Deep Navy',      time: 'night', top: '#050a28', bot: '#1d2f70', grass: '#3d7a5a', sun: '#f4efc8', cloud: '#40508f', amb: '#0a1238', dim: 0.58 },
  { name: 'Violet Night',   time: 'night', top: '#190d3a', bot: '#4b2a80', grass: '#3d6a62', sun: '#f2e6ff', cloud: '#65459f', amb: '#1c0f40', dim: 0.58 },
  { name: 'Teal Night',     time: 'night', top: '#03121c', bot: '#0f4b5c', grass: '#2f7a66', sun: '#d8fff4', cloud: '#2a6676', amb: '#04202b', dim: 0.58 },
  { name: 'Aurora',         time: 'night', top: '#06102a', bot: '#12806a', grass: '#33806a', sun: '#e8ffd8', cloud: '#2a8878', amb: '#062a30', dim: 0.52 },
  { name: 'Midnight Ink',   time: 'night', top: '#02030d', bot: '#141f48', grass: '#356a5a', sun: '#ffe9b0', cloud: '#2b3665', amb: '#04061a', dim: 0.62 },
];

export interface Ctx {
  p: Palette;
  scene: Scene;
  baseY: number;     // y where land / water begins
  uid: string;       // unique id prefix for defs
}

/** Colour as seen under the palette's lighting. */
export const tone = (c: string, x: Ctx) => mix(c, x.p.amb, x.p.dim);

/** Land colour with atmospheric perspective: depth 0 = far / hazy, 1 = near / saturated. */
export const land = (c: string, x: Ctx, depth: number) => mix(tone(c, x), x.p.bot, (1 - depth) * 0.55);

/** Windows etc. glow when it is not bright daytime. */
export const isLit = (x: Ctx) => x.p.time !== 'day';
