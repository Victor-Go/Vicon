// Regenerates docs/gallery.svg from the built package: node scripts/gallery.mjs (after `npm run build`)
import { writeFileSync } from 'node:fs';
import { select, renderInner } from '../dist/index.js';

const COLS = 8, ROWS = 4, S = 96, GAP = 14, PAD = 0;
const W = COLS * S + (COLS - 1) * GAP + PAD * 2, H = ROWS * S + (ROWS - 1) * GAP + PAD * 2;
let body = '';
for (let i = 0; i < COLS * ROWS; i++) {
  const x = PAD + (i % COLS) * (S + GAP), y = PAD + Math.floor(i / COLS) * (S + GAP);
  body += `<svg x="${x}" y="${y}" width="${S}" height="${S}" viewBox="0 0 100 100">${renderInner(select('vicon-' + (i + 1)), 'rounded')}</svg>`;
}
writeFileSync(new URL('../docs/gallery.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
console.log('docs/gallery.svg', W + 'x' + H);
