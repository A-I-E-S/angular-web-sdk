import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type IsActiveMatchOptions,
  NavigationEnd,
  Router,
} from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import { ModeColorService } from '@africanies/africanies-theme';

import type { AfricaniesNavItem } from '../nav-item';
import { isNavItemActive } from '../nav-router.util';
import {
  isModifiedClick,
  navigateNavItem,
  navItemHref,
} from '../navigate-nav-item';

const DEFAULT_LINK_ACTIVE: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

/**
 * Compact segmented control for view modes and filters.
 *
 * Selected option uses a **solid brand pill** (white label) on a neutral track —
 * same pattern as the portal shipping-mode toggle. With exactly two options the
 * pill slides; with more options each selected chip fills in place.
 *
 * ## Router mode (URL is source of truth)
 *
 * Set `routerLink` (and optional `queryParams`) on items. The selected pill
 * follows `Router.isActive` — including **cold loads**. Defaults to exact
 * path + query matching (sibling routes / density query params).
 *
 * Routed segments navigate with `{ scroll: 'manual' }` by default so the page
 * does not jump to the top. Pass `[keepScroll]="false"` to use the app’s
 * normal router scroll behaviour.
 *
 * ## Local mode
 *
 * Omit `routerLink` and bind `[(activeId)]`.
 *
 * @example
 * ```html
 * <africanies-segment [items]="[
 *   { id: 'list', label: 'List', routerLink: '/shipments', queryParams: { view: 'list' } },
 *   { id: 'map', label: 'Map', routerLink: '/shipments', queryParams: { view: 'map' } }
 * ]" />
 * ```
 */
@Component({
  selector: 'africanies-segment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent],
  styles: `
    :host .africanies-segment-thumb {
      width: calc((100% - 0.5rem) / 2);
    }
  `,
  template: `
    <div
      class="relative inline-grid max-w-full rounded-lg bg-[#f0f2f5] p-1 dark:bg-[#2a2c31]"
      role="group"
      [attr.aria-label]="ariaLabel()"
      [class.grid-cols-2]="useSlidingThumb()"
      [class.inline-flex]="!useSlidingThumb()"
      [class.flex-wrap]="!useSlidingThumb()"
      [class.gap-1]="!useSlidingThumb()"
    >
      @if (useSlidingThumb()) {
        <div
          class="africanies-segment-thumb pointer-events-none absolute top-1 bottom-1 left-1 rounded-md shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
          [class]="thumbFillClass()"
          [style.transform]="
            activeIndex() === 1
              ? 'translateX(calc(100% + 0.25rem))'
              : 'translateX(0)'
          "
          aria-hidden="true"
        ></div>
      }

      @for (item of items(); track item.id) {
        @if (item.routerLink !== null && item.routerLink !== undefined) {
          <a
            [class]="optionChrome(item)"
            [class.cursor-pointer]="!item.disabled"
            [class.cursor-not-allowed]="item.disabled"
            [class.opacity-50]="item.disabled"
            [attr.href]="item.disabled ? null : hrefFor(item)"
            [attr.aria-current]="isItemActive(item) ? 'true' : null"
            [attr.aria-disabled]="item.disabled ? true : null"
            (click)="onRoutedClick($event, item)"
          >
            @if (item.icon; as icon) {
              <africanies-icon [name]="icon" [size]="14" class="shrink-0" />
            }
            {{ item.label }}
          </a>
        } @else {
          <button
            type="button"
            [class]="optionChrome(item)"
            [disabled]="!!item.disabled"
            [class.cursor-pointer]="!item.disabled"
            [class.cursor-not-allowed]="item.disabled"
            [attr.aria-pressed]="isItemActive(item)"
            (click)="selectLocal(item)"
          >
            @if (item.icon; as icon) {
              <africanies-icon [name]="icon" [size]="14" class="shrink-0" />
            }
            {{ item.label }}
          </button>
        }
      }
    </div>
  `,
})
export class SegmentComponent {
  private readonly router = inject(Router);
  protected readonly modeColor = inject(ModeColorService);

  /** Segment options. */
  readonly items = input.required<AfricaniesNavItem[]>();

  /**
   * Selected id. For routed items this is **synced from the Router**
   * (including cold URL loads). For local items, bind `[(activeId)]`.
   */
  readonly activeId = model<string | null>(null);

  /** Accessible name for the group. */
  readonly ariaLabel = input('Segments');

  /**
   * Match options for routed items. Defaults to exact path + query params.
   */
  readonly linkActiveOptions =
    input<IsActiveMatchOptions>(DEFAULT_LINK_ACTIVE);

  /**
   * Keep the viewport where it is when a routed segment navigates (default).
   * Uses Angular’s `{ scroll: 'manual' }` so app-wide scroll restoration does
   * not jump to the top. Set false to use normal router scrolling.
   */
  readonly keepScroll = input(true, { transform: booleanAttribute });

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Two equal options → portal-style sliding brand pill. */
  protected readonly useSlidingThumb = computed(
    () => this.items().length === 2,
  );

  /** Index of the active option (0 / 1 for the sliding thumb). */
  protected readonly activeIndex = computed(() => {
    const list = this.items();
    const idx = list.findIndex((item) => this.isItemActive(item));
    return idx < 0 ? 0 : idx;
  });

  constructor() {
    effect(() => {
      this.url();
      const options = this.linkActiveOptions();
      const routed = this.items().filter((i) => i.routerLink != null);
      if (routed.length === 0) {
        return;
      }
      const match = routed.find((i) =>
        isNavItemActive(this.router, i, options),
      );
      if (match && this.activeId() !== match.id) {
        this.activeId.set(match.id);
      }
    });
  }

  protected hrefFor(item: AfricaniesNavItem): string | null {
    return navItemHref(this.router, item);
  }

  protected isItemActive(item: AfricaniesNavItem): boolean {
    if (item.routerLink != null) {
      this.url();
      return isNavItemActive(this.router, item, this.linkActiveOptions());
    }
    return this.activeId() === item.id;
  }

  /**
   * Sliding thumb fill. STN / SFN options keep their own brand color so the
   * pill matches mode identity; other pairs follow the active theme primary.
   */
  protected thumbFillClass(): string {
    const active = this.items()[this.activeIndex()];
    return this.brandFillFor(active?.id ?? null);
  }

  /**
   * Option chrome: sliding mode keeps labels transparent over the thumb;
   * multi-option mode paints a solid selected chip in place.
   *
   * @param item - Option being rendered.
   * @returns Class string for the control.
   */
  protected optionChrome(item: AfricaniesNavItem): string {
    const base =
      'relative z-10 inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-center text-body-sm no-underline transition-colors duration-150';
    const active = this.isItemActive(item);

    if (this.useSlidingThumb()) {
      return (
        base +
        ' w-full ' +
        (active
          ? 'font-semibold text-white'
          : 'font-medium text-ink hover:text-ink dark:text-neutral-300 dark:hover:text-white')
      );
    }

    if (active) {
      return `${base} font-semibold text-white shadow-sm ${this.brandFillFor(item.id)}`;
    }

    return (
      base +
      ' font-medium text-ink hover:bg-white/70 hover:text-ink dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'
    );
  }

  /**
   * Solid brand fill for a selected option / sliding thumb.
   *
   * Light + dark use the same SFN green / STN orange primaries so the control
   * stays mode-identifiable on both surfaces (portal primary, not soft tint).
   * Class strings are full literals so Tailwind keeps them.
   *
   * @param id - Option id (`stn` / `sfn` get fixed brands; else theme primary).
   * @returns Background utility classes.
   */
  protected brandFillFor(id: string | null): string {
    if (id === 'stn') {
      return 'bg-import dark:bg-import';
    }
    if (id === 'sfn') {
      return 'bg-export dark:bg-export';
    }
    return this.modeColor.classes().activeFill;
  }

  protected selectLocal(item: AfricaniesNavItem): void {
    if (item.disabled || item.routerLink != null) {
      return;
    }
    this.activeId.set(item.id);
  }

  /**
   * Primary click navigates in-app without scrolling to top. Modified clicks
   * keep the native link behaviour for new tabs.
   * @param event
   * @param item
   */
  protected onRoutedClick(event: MouseEvent, item: AfricaniesNavItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (isModifiedClick(event)) {
      return;
    }
    event.preventDefault();
    void navigateNavItem(this.router, item, this.keepScroll());
  }
}
