import { writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { toSvg, type RasterOptions } from './index';

export type OutputFormat = 'svg' | 'png';

async function loadResvg() {
  try {
    return (await import('@resvg/resvg-js')).Resvg;
  } catch {
    throw new Error('PNG output in Node needs the optional dependency: npm install @resvg/resvg-js');
  }
}

/** Render a PNG. Needs the optional peer dependency `@resvg/resvg-js`. */
export async function toPng(seed: string, opts: RasterOptions = {}): Promise<Buffer> {
  const Resvg = await loadResvg();
  const px = Math.max(1, Math.round((opts.size ?? 128) * (opts.scale ?? 1)));
  return new Resvg(toSvg(seed, opts), { fitTo: { mode: 'width', value: px } }).render().asPng();
}

/** Write an avatar to disk. The format comes from `opts.format`, else from the file extension (.svg / .png). */
export async function saveAvatar(path: string, seed: string, opts: RasterOptions & { format?: OutputFormat } = {}): Promise<void> {
  const ext = extname(path).slice(1).toLowerCase();
  const format = opts.format ?? (ext === 'png' ? 'png' : ext === 'svg' || ext === '' ? 'svg' : undefined);
  if (!format) throw new Error(`Unsupported file extension ".${ext}" (use .svg or .png, or pass { format })`);
  await writeFile(path, format === 'png' ? await toPng(seed, opts) : toSvg(seed, opts));
}
