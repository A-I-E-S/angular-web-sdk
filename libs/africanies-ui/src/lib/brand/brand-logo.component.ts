import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 *
 */
export type BrandLogoSize = 'sm' | 'md' | 'lg';

/**
 * Default AFRICANIES wordmark — inlined so it works without copying static assets.
 *
 * Override with a custom `logoSrc` on {@link SideNavComponent} when the host
 * ships its own mark.
 */
@Component({
  selector: 'africanies-brand-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0 items-center',
    role: 'img',
    'aria-label': 'Africanies',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 24"
      [class]="svgClass()"
      aria-hidden="true"
    >
      <rect
        x="0"
        y="2"
        width="20"
        height="20"
        rx="5"
        class="fill-export"
      />
      <path
        d="M6.2 16.5 10 7.5h1.6l3.8 9h-1.9l-.8-2H8.9l-.8 2H6.2Zm2.5-3.6h2.6l-1.3-3.4-1.3 3.4Z"
        class="fill-white"
      />
      <text
        x="26"
        y="17"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="15"
        font-weight="700"
        class="fill-ink dark:fill-white"
      >
        Africanies
      </text>
    </svg>
  `,
})
export class BrandLogoComponent {
  readonly size = input<BrandLogoSize>('md');

  protected readonly svgClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-5 w-auto';
      case 'lg':
        return 'h-8 w-auto';
      default:
        return 'h-6 w-auto';
    }
  });
}
