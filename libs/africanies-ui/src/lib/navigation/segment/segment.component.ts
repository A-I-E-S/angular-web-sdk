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
  template: `
    <div
      class="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-background-welcome p-1 dark:bg-ink-950"
      role="group"
      [attr.aria-label]="ariaLabel()"
    >
      @for (item of items(); track item.id) {
        @if (item.routerLink !== null && item.routerLink !== undefined) {
          <a
            [class]="
              segmentChrome() +
              ' ' +
              (isItemActive(item) ? selectedClass() : idleClass())
            "
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
            [class]="
              segmentChrome() +
              ' ' +
              (isItemActive(item) ? selectedClass() : idleClass())
            "
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

  protected readonly segmentChrome = computed(
    () =>
      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-body-sm transition-colors duration-150 no-underline',
  );

  protected readonly selectedClass = computed(() => {
    const colors = this.modeColor.classes();
    return `${colors.soft} ${colors.text} shadow-sm font-semibold`;
  });

  protected readonly idleClass = computed(
    () =>
      'font-medium text-neutral-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white',
  );

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
