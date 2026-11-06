#!/usr/bin/env node
import { EOL } from 'node:os';
import { toSvg, type Shape } from './index';
import { saveAvatar, toPng, type OutputFormat } from './node';

const HELP = `vicon-avatars <value> [options]

  -o, --out <file>      write to a file (.svg or .png); default: print SVG to stdout
  -f, --format <fmt>    svg | png (default: from the file extension, else svg)
  -s, --size <number>   pixel size (default 128)
      --scale <number>  pixel multiplier for PNG, e.g. 2 for retina (default 1)
      --shape <shape>   rounded | circle | square (default rounded)
  -h, --help            show this help

PNG needs the optional dependency @resvg/resvg-js (npm install @resvg/resvg-js).

Example: npx vicon-avatars alice@example.com -o alice.png --shape circle --size 256`;

const fail = (msg: string): never => { console.error(msg); process.exit(1); };
const args = process.argv.slice(2);
let value: string | undefined, out: string | undefined, size: number | undefined, scale: number | undefined, shape: Shape | undefined, format: OutputFormat | undefined;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '-h' || a === '--help') { console.log(HELP); process.exit(0); }
  else if (a === '-o' || a === '--out') out = args[++i];
  else if (a === '-f' || a === '--format') format = args[++i] as OutputFormat;
  else if (a === '-s' || a === '--size') size = Number(args[++i]);
  else if (a === '--scale') scale = Number(args[++i]);
  else if (a === '--shape') shape = args[++i] as Shape;
  else if (value === undefined) value = a;
  else fail(`Unexpected argument: ${a}\n\n${HELP}`);
}
if (value === undefined) fail(HELP);
if (size !== undefined && !(size > 0)) fail('--size must be a positive number');
if (scale !== undefined && !(scale > 0)) fail('--scale must be a positive number');
if (shape !== undefined && !['rounded', 'circle', 'square'].includes(shape)) fail('--shape must be rounded, circle or square');
if (format !== undefined && !['svg', 'png'].includes(format)) fail('--format must be svg or png');

const opts = { size, scale, shape };
(async () => {
  if (out) await saveAvatar(out, value!, { ...opts, format });
  else if (format === 'png') process.stdout.write(await toPng(value!, opts));
  else process.stdout.write(toSvg(value!, opts) + EOL);
})().catch((e) => fail(e instanceof Error ? e.message : String(e)));
