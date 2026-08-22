import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Known inbound / last-mile carrier slugs with bundled SVG marks. */
export type CarrierLogoSlug = 'dhl';

export type CarrierLogoSize = 'sm' | 'md';

/**
 * Normalizes free-text carrier names to a logo slug when recognized.
 *
 * @param value - Raw carrier string from API or form state.
 * @returns Slug when a bundled mark exists, otherwise `null`.
 */
export function normalizeCarrierLogoSlug(
  value: string | null | undefined,
): CarrierLogoSlug | null {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'dhl') {
    return 'dhl';
  }
  return null;
}

/**
 * Inline carrier marks for delivery vendor cells.
 *
 * Falls back to a compact text badge when no SVG is bundled for the slug.
 *
 * @example
 * ```html
 * <aies-carrier-logo carrier="dhl" />
 * <aies-carrier-logo [carrier]="item.delivery_vendor" />
 * ```
 */
@Component({
  selector: 'aies-carrier-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0 items-center',
  },
  template: `
    @if (slug(); as key) {
      @switch (key) {
        @case ('dhl') {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            overflow="visible"
            version="1.0"
            viewBox="-26.3622 -9.6965 228.4724 58.179"
            [class]="svgClass()"
            [attr.aria-label]="ariaLabel()"
            role="img"
          >
            <path fill="#FECC00" d="M0 38.786V0h175.748v38.786z" />
            <path
              fill="#D50029"
              d="M56.665 16.206c-.768 1.04-2.053 2.848-2.835 3.904-.397.537-1.114 1.512 1.263 1.512h12.515s2.017-2.744 3.708-5.039c2.3-3.122.199-9.618-8.024-9.618H30.908l-5.615 7.629h30.603c1.545 0 1.524.588.769 1.612zm-9.194 7.298c-2.377 0-1.66-.977-1.263-1.514.782-1.056 2.088-2.845 2.856-3.885.756-1.024.776-1.612-.771-1.612H34.297L23.02 31.819h27.501c9.083 0 14.14-6.178 15.699-8.314 0-.001-16.235-.001-18.749-.001zm17.89 8.315h16.133l6.116-8.316-16.131.002c-.005-.001-6.118 8.314-6.118 8.314zm41.625-24.854l-6.188 8.405h-7.2l6.185-8.405H83.655l-10.79 14.657h39.46l10.787-14.657zM88.694 31.819h16.127l6.119-8.314H94.813c-.006-.001-6.119 8.314-6.119 8.314zM0 26.784v1.766h22.468l1.298-1.766zm26.181-3.28H0v1.764h24.88zM0 31.819h20.061l1.292-1.756H0zm152.072-3.27h23.676v-1.766h-22.376zm-2.405 3.27h26.081v-1.756h-24.79zm6.116-8.315l-1.297 1.766h21.262v-1.766zm-21.124-1.882l10.789-14.657h-17.081c-.006 0-10.797 14.657-10.797 14.657zm-18.472 1.882s-1.179 1.611-1.752 2.387c-2.025 2.736-.234 5.928 6.376 5.928h25.901l6.119-8.314h-36.644z"
            />
          </svg>
        }
      }
    } @else if (fallbackLabel(); as label) {
      <span
        class="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-caption font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
        [attr.aria-label]="label + ' carrier'"
      >
        {{ label }}
      </span>
    }
  `,
})
export class CarrierLogoComponent {
  /** Raw carrier slug or label from the API. */
  readonly carrier = input('');

  readonly size = input<CarrierLogoSize>('sm');

  protected readonly slug = computed(() =>
    normalizeCarrierLogoSlug(this.carrier()),
  );

  protected readonly fallbackLabel = computed(() => {
    if (this.slug()) {
      return '';
    }
    const label = this.carrier().trim();
    if (!label || label.toLowerCase() === 'others') {
      return '';
    }
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  });

  protected readonly ariaLabel = computed(() => {
    const slug = this.slug();
    if (slug === 'dhl') {
      return 'DHL';
    }
    return this.fallbackLabel();
  });

  protected readonly svgClass = computed(() =>
    this.size() === 'md' ? 'h-6 w-auto' : 'h-5 w-auto',
  );
}
