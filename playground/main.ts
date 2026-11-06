import { rasterize, saveBlob } from '../src/browser';
import { LAYERS, LAYER_COUNTS, TOTAL_COMBINATIONS, PALETTES, select, toSvgFromSelection, describe, type Selection, type LayerName, type Shape } from '../src/index';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
type Lang = 'en' | 'zh';
const DICT: Record<Lang, Record<string, string>> = {
  en: {
    seed: 'Seed (any string)', rand: 'Random seed', shape: 'Shape', shape_rounded: 'Rounded', shape_circle: 'Circle', shape_square: 'Square',
    layers: 'Layers', reset: 'Reset to seed', dl_svg: 'Download SVG', dl_png: 'Download PNG', gallery: '🎲 Random gallery', hint: 'Click an icon to inspect · 🎲 re-rolls',
    total: 'nominal combinations', palette: 'Palette', resolves: 'Seed resolves to', size: 'SVG size',
    sky: '1 Sky', deco1: '2 Sun / Moon', deco2: '3 Sky objects', scene: '4 Backdrop', mid: '5 Mid-ground', fore: '6 Foreground',
    day: 'day', dusk: 'dusk', night: 'night',
  },
  zh: {
    seed: '种子（任意字符串）', rand: '随机种子', shape: '形状', shape_rounded: '圆角', shape_circle: '圆形', shape_square: '方形',
    layers: '图层', reset: '还原为种子结果', dl_svg: '下载 SVG', dl_png: '下载 PNG', gallery: '🎲 随机画廊', hint: '点击图标查看 · 🎲 重新随机',
    total: '理论组合数', palette: '配色', resolves: '种子对应的选择', size: 'SVG 体积',
    sky: '1 天空', deco1: '2 日 / 月 / 星', deco2: '3 天空物件', scene: '4 风景背景', mid: '5 风景中景', fore: '6 风景前景',
    day: '白天', dusk: '黄昏', night: '夜晚',
  },
};
const detect = (): Lang => {
  try { const saved = localStorage.getItem('vicon-lang'); if (saved === 'en' || saved === 'zh') return saved; } catch { /* storage blocked */ }
  return (navigator.languages?.[0] ?? navigator.language ?? 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
};
let lang: Lang = detect();
const t = (k: string) => DICT[lang][k] ?? k;

let seed = 'hello vicon';
let sel: Selection = select(seed);
let shape: Shape = 'rounded';
let randomSeeds: string[] = [];


const svg = (s: Selection, size: number, label = '') => toSvgFromSelection(s, { size, shape }, label);

function renderLayers() {
  $('layers').innerHTML = LAYERS.map((k) => `<div class="layer"><b>${t(k)}</b><input type="range" data-k="${k}" min="0" max="${LAYER_COUNTS[k] - 1}" value="${sel[k]}"><span id="v-${k}">${sel[k]}</span></div>`).join('');
  $('layers').querySelectorAll<HTMLInputElement>('input[type=range]').forEach((el) => {
    el.addEventListener('input', () => { sel = { ...sel, [el.dataset.k!]: Number(el.value) }; refresh(false); });
  });
}

function refreshInfo() {
  const d = describe(seed);
  const p = PALETTES[sel.sky];
  $('info').innerHTML = `${t('palette')}: <code>${p.name}</code> (${t(p.time)})<br>${t('resolves')}: <code>${LAYERS.map((k) => d.selection[k]).join(' / ')}</code><br>${t('size')}: <code>${(new Blob([svg(sel, 128)]).size / 1024).toFixed(1)} KB</code>`;
}

function renderGrid() {
  const grid = $('grid');
  grid.dataset.shape = shape;
  grid.style.setProperty('--cell', '104px');
  if (!randomSeeds.length) randomSeeds = Array.from({ length: 72 }, () => Math.random().toString(36).slice(2, 9));
  grid.innerHTML = randomSeeds.map((s) => `<div class="cell" data-seed="${s}" title="${s}">${toSvgFromSelection(select(s), { size: 200, shape }, s)}</div>`).join('');
  grid.querySelectorAll<HTMLElement>('.cell').forEach((c) => c.addEventListener('click', () => { seed = c.dataset.seed!; ($('seed') as HTMLInputElement).value = seed; sel = select(seed); renderLayers(); refresh(false); }));
}

function refresh(fullGrid = true) {
  $('big').innerHTML = svg(sel, 240, seed);
  LAYERS.forEach((k) => { const sp = document.getElementById('v-' + k); if (sp) sp.textContent = String(sel[k]); });
  refreshInfo();
  if (fullGrid) renderGrid();
}

($('seed') as HTMLInputElement).addEventListener('input', (e) => { seed = (e.target as HTMLInputElement).value; sel = select(seed); renderLayers(); refresh(false); });
$('rand').addEventListener('click', () => { randomSeeds = []; seed = Math.random().toString(36).slice(2, 10); ($('seed') as HTMLInputElement).value = seed; sel = select(seed); function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n!); });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle!); });
  $('total').textContent = `${LAYERS.map((k) => LAYER_COUNTS[k]).join(' × ')} = ${TOTAL_COMBINATIONS.toLocaleString()} ${t('total')}`;
  $('lang').textContent = lang === 'zh' ? 'English' : '中文';
  renderLayers();
  refreshInfo();
}
$('lang').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem('vicon-lang', lang); } catch { /* ignore */ }
  applyLang();
});

const fileBase = () => (seed.replace(/[^\w.-]+/g, '_').slice(0, 40) || 'avatar');
$('dl-svg').addEventListener('click', () => saveBlob(new Blob([svg(sel, 512, seed)], { type: 'image/svg+xml' }), fileBase() + '.svg'));
$('dl-png').addEventListener('click', async () => saveBlob(await rasterize(svg(sel, 512, seed), 512), fileBase() + '.png'));

applyLang(); refresh(true); });
$('reset').addEventListener('click', () => { sel = select(seed); renderLayers(); refresh(false); });
$('shape').addEventListener('change', (e) => { shape = (e.target as HTMLSelectElement).value as Shape; refresh(true); });

function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n!); });
  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle!); });
  $('total').textContent = `${LAYERS.map((k) => LAYER_COUNTS[k]).join(' × ')} = ${TOTAL_COMBINATIONS.toLocaleString()} ${t('total')}`;
  $('lang').textContent = lang === 'zh' ? 'English' : '中文';
  renderLayers();
  refreshInfo();
}
$('lang').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem('vicon-lang', lang); } catch { /* ignore */ }
  applyLang();
});

const fileBase = () => (seed.replace(/[^\w.-]+/g, '_').slice(0, 40) || 'avatar');
$('dl-svg').addEventListener('click', () => saveBlob(new Blob([svg(sel, 512, seed)], { type: 'image/svg+xml' }), fileBase() + '.svg'));
$('dl-png').addEventListener('click', async () => saveBlob(await rasterize(svg(sel, 512, seed), 512), fileBase() + '.png'));

applyLang(); refresh(true);
