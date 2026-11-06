import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { select, toSvgFromSelection, type Shape } from 'vicon-avatars';

/**
 * <vicon value="alice@example.com" [size]="64" shape="circle" />
 * The same `value` always renders the same landscape.
 */
@Component({
  selector: 'vicon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:inline-block;line-height:0' },
  template: `<span [innerHTML]="html()"></span>`,
})
export class ViconComponent {
  readonly value = input.required<string>();
  readonly size = input<number>(128);
  readonly shape = input<Shape>('rounded');
  readonly title = input<string | undefined>(undefined);

  private readonly sanitizer = inject(DomSanitizer);

  // The SVG is generated locally from a fixed set of templates (user text is only ever
  // escaped into aria-label), so it is safe to bypass Angular's sanitizer, which would
  // otherwise strip <clipPath>/<mask>/<linearGradient>.
  protected readonly html = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      toSvgFromSelection(select(this.value()), { size: this.size(), shape: this.shape(), title: this.title() }, this.value()),
    ),
  );
}
