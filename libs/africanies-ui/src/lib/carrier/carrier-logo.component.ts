import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Known inbound / last-mile carrier slugs with bundled SVG marks. */
export type CarrierLogoSlug = 'amazon' | 'dhl' | 'fedex' | 'usps' | 'ups';

export type CarrierLogoSize = 'sm' | 'md';

const CARRIER_LOGO_SLUGS = [
  'amazon',
  'dhl',
  'fedex',
  'usps',
  'ups',
] as const satisfies readonly CarrierLogoSlug[];

const CARRIER_LOGO_LABELS: Record<CarrierLogoSlug, string> = {
  amazon: 'Amazon',
  dhl: 'DHL',
  fedex: 'FedEx',
  usps: 'USPS',
  ups: 'UPS',
};

const CARRIER_LOGO_ASSET_BASE = '/assets/africanies-ui/carriers';

/**
 * Normalizes free-text carrier names to a logo slug when recognized.
 * Matches lowercase vendor ids (`fedex`, `dhl`, …); no mark for `others`.
 */
export function normalizeCarrierLogoSlug(
  value: string | null | undefined,
): CarrierLogoSlug | null {
  const normalized = (value ?? '').trim().toLowerCase();
  if (!normalized || normalized === 'others') {
    return null;
  }

  for (const slug of CARRIER_LOGO_SLUGS) {
    if (
      normalized === slug ||
      normalized.startsWith(`${slug} `) ||
      normalized.startsWith(`${slug}-`)
    ) {
      return slug;
    }
  }

  return null;
}

/**
 * Carrier marks for delivery vendor cells.
 *
 * Loads bundled SVGs from `assets/africanies-ui/carriers/{slug}.svg`.
 * Falls back to a compact text badge when no SVG exists for the value.
 *
 * @example
 * ```html
 * <africanies-carrier-logo carrier="fedex" />
 * <africanies-carrier-logo [carrier]="item.delivery_vendor" />
 * ```
 */
@Component({
  selector: 'africanies-carrier-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0 items-center',
  },
  template: `
    @if (slug(); as key) {
      <img
        [src]="logoSrc(key)"
        [alt]="ariaLabel()"
        [class]="imgClass()"
        loading="lazy"
        decoding="async"
      />
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
    if (slug) {
      return CARRIER_LOGO_LABELS[slug];
    }
    return this.fallbackLabel();
  });

  protected readonly imgClass = computed(() =>
    this.size() === 'md'
      ? 'h-6 w-auto max-w-[7rem] object-contain'
      : 'h-5 w-auto max-w-[5.5rem] object-contain',
  );

  protected logoSrc(slug: CarrierLogoSlug): string {
    return `${CARRIER_LOGO_ASSET_BASE}/${slug}.svg`;
  }
}
