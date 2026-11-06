import { toSvg, type RasterOptions } from './index';

/** Rasterise an SVG string to a PNG Blob using the browser's own renderer (no dependencies). */
export async function rasterize(svg: string, px: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise<void>((ok, fail) => { img.onload = () => ok(); img.onerror = () => fail(new Error('Could not rasterise the SVG')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = px;
    canvas.getContext('2d')!.drawImage(img, 0, 0, px, px);
    return await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('canvas.toBlob failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function toPngBlob(seed: string, opts: RasterOptions = {}): Promise<Blob> {
  const px = Math.max(1, Math.round((opts.size ?? 128) * (opts.scale ?? 1)));
  return rasterize(toSvg(seed, { ...opts, size: px }), px);
}

/** Trigger a file download for a Blob. */
export function saveBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** One call: build the avatar and download it as .svg or .png. */
export async function downloadAvatar(seed: string, opts: RasterOptions & { format?: 'svg' | 'png'; filename?: string } = {}) {
  const format = opts.format ?? 'svg';
  const blob = format === 'png' ? await toPngBlob(seed, opts) : new Blob([toSvg(seed, opts)], { type: 'image/svg+xml' });
  saveBlob(blob, opts.filename ?? `${seed.replace(/[^\w.-]+/g, '_').slice(0, 40) || 'avatar'}.${format}`);
}
