import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toPng, saveAvatar } from '../dist/node.js';
import { toSvg, toDataUri, select, LAYERS, LAYER_COUNTS } from '../dist/index.js';

const require = createRequire(import.meta.url);

test('same seed gives identical output', () => {
  assert.equal(toSvg('alice'), toSvg('alice'));
  assert.notEqual(toSvg('alice'), toSvg('bob'));
});

test('CommonJS build works', () => {
  assert.equal(require('../dist/index.cjs').toSvg('alice'), toSvg('alice'));
});

test('5000 seeds: valid selection, no NaN / undefined in output', () => {
  for (let i = 0; i < 5000; i++) {
    const seed = 'seed-' + i;
    const sel = select(seed);
    for (const k of LAYERS) assert.ok(Number.isInteger(sel[k]) && sel[k] >= 0 && sel[k] < LAYER_COUNTS[k]);
    const svg = toSvg(seed);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
    assert.ok(!/NaN|undefined|Infinity/.test(svg), `bad output for ${seed}`);
  }
});

test('every option of every layer renders cleanly', () => {
  const base = select('x');
  for (const k of LAYERS) for (let i = 0; i < LAYER_COUNTS[k]; i++) {
    const svg = toSvg('x').length && require('../dist/index.cjs').toSvgFromSelection({ ...base, [k]: i });
    assert.ok(!/NaN|undefined|Infinity/.test(svg), `layer ${k} option ${i}`);
  }
});

test('user text is escaped in aria-label', () => {
  assert.ok(!toSvg('"><script>alert(1)</script>').includes('<script'));
});

test('toDataUri', () => assert.ok(toDataUri('a').startsWith('data:image/svg+xml;charset=utf-8,%3Csvg')));

test('CLI prints an svg', () => {
  const out = execFileSync(process.execPath, ['dist/cli.js', 'alice', '--shape', 'circle', '-s', '64']).toString();
  assert.ok(out.startsWith('<svg') && out.includes('width="64"'));
});

test('element entry is import-safe in Node (SSR)', async () => { await import('../dist/element.js'); });

const pngSize = (b) => [b.readUInt32BE(16), b.readUInt32BE(20)];

test('toPng returns a PNG of the requested size', async () => {
  const b = await toPng('alice', { size: 64 });
  assert.equal(b.subarray(1, 4).toString(), 'PNG');
  assert.deepEqual(pngSize(b), [64, 64]);
  assert.deepEqual(pngSize(await toPng('alice', { size: 64, scale: 2, shape: 'circle' })), [128, 128]);
});

test('saveAvatar picks the format from the extension', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'vicon-'));
  await saveAvatar(join(dir, 'a.svg'), 'alice');
  await saveAvatar(join(dir, 'a.png'), 'alice', { size: 32 });
  assert.ok(readFileSync(join(dir, 'a.svg'), 'utf8').startsWith('<svg'));
  assert.deepEqual(pngSize(readFileSync(join(dir, 'a.png'))), [32, 32]);
  await assert.rejects(saveAvatar(join(dir, 'a.gif'), 'alice'), /Unsupported file extension/);
});

test('CLI writes png', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vicon-'));
  execFileSync(process.execPath, ['dist/cli.js', 'alice', '-o', join(dir, 'x.png'), '-s', '48']);
  assert.ok(existsSync(join(dir, 'x.png')));
  assert.deepEqual(pngSize(readFileSync(join(dir, 'x.png'))), [48, 48]);
});
