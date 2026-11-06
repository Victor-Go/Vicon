import { toSvg, type Shape } from './index';

/** <vicon-icon value="alice" size="64" shape="circle"> - works in plain JS and Angular (CUSTOM_ELEMENTS_SCHEMA). */
// Safe to import on the server (SSR): HTMLElement only exists in browsers.
const Base = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement;

export class ViconElement extends Base {
  static observedAttributes = ['value', 'size', 'shape'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }
  private render() {
    this.style.display = 'inline-block';
    this.style.lineHeight = '0';
    this.innerHTML = toSvg(this.getAttribute('value') ?? '', {
      size: Number(this.getAttribute('size') ?? 128),
      shape: (this.getAttribute('shape') as Shape) ?? 'rounded',
    });
  }
}

export function defineViconElement(tag = 'vicon-icon') {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) customElements.define(tag, ViconElement);
}
defineViconElement();
