import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';

import type { AiesNavItem } from '../nav-item';
import { isNavItemActive } from '../nav-router.util';
import { TabDefDirective } from './tab-def.directive';

const DEFAULT_LINK_ACTIVE: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

/**
 * Tab list for page / section navigation.
 *
 * ## Router mode (URL is source of truth)
 *
 * Set `routerLink` on items. Active styling and `activeId` follow the
 * consumer’s Router — including **cold loads** (`/shipments/docs` highlights
 * Docs). Pair with a `<router-outlet>` for panel content.
 *
 * ## Local mode
 *
 * Omit `routerLink` and bind `[(activeId)]`. Project panels with
 * `<ng-template aiesTabDef="id">`.
 *
 * @example
 * ```html
 * <!-- URL-driven (child routes) -->
 * <aies-tabs [items]="[
 *   { id: 'overview', label: 'Overview', routerLink: '/shipments/1/overview' },
 *   { id: 'docs', label: 'Docs', routerLink: '/shipments/1/docs' }
 * ]" />
 * <router-outlet />
 * ```
 */
@Component({
  selector: 'aies-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, NgTemplateOutlet, RouterLink],
  template: `
    <div class="flex flex-col gap-4">
      <div
        class="flex flex-wrap gap-1 border-b border-border dark:border-white/10"
        role="tablist"
        tabindex="-1"
        [attr.aria-label]="ariaLabel()"
        (keydown)="onTablistKeydown($event)"
      >
        @for (item of items(); track item.id) {
          @if (item.routerLink !== null && item.routerLink !== undefined) {
            <a
              #tabEl
              role="tab"
              [class]="
                tabChrome() +
                ' ' +
                (isItemActive(item) ? activeTabClass() : inactiveTabClass())
              "
              [class.cursor-not-allowed]="item.disabled"
              [class.opacity-50]="item.disabled"
              [routerLink]="item.disabled ? null : item.routerLink"
              [queryParams]="item.queryParams"
              [fragment]="item.fragment"
              [attr.aria-selected]="isItemActive(item)"
              [attr.tabindex]="isItemActive(item) ? 0 : -1"
              [attr.aria-disabled]="item.disabled ? true : null"
              [attr.id]="'aies-tab-' + item.id"
            >
              @if (item.icon; as icon) {
                <aies-icon [name]="icon" [size]="16" class="shrink-0" />
              }
              {{ item.label }}
            </a>
          } @else {
            <button
              #tabEl
              type="button"
              role="tab"
              [class]="
                tabChrome() +
                ' ' +
                (isItemActive(item) ? activeTabClass() : inactiveTabClass())
              "
              [disabled]="!!item.disabled"
              [attr.aria-selected]="isItemActive(item)"
              [attr.tabindex]="isItemActive(item) ? 0 : -1"
              [attr.id]="'aies-tab-' + item.id"
              [attr.aria-controls]="
                hasPanels() ? 'aies-tab-panel-' + item.id : null
              "
              (click)="selectLocal(item)"
            >
              @if (item.icon; as icon) {
                <aies-icon [name]="icon" [size]="16" class="shrink-0" />
              }
              {{ item.label }}
            </button>
          }
        }
      </div>

      @if (hasPanels()) {
        @if (activePanel(); as panel) {
          <div
            role="tabpanel"
            class="min-w-0 text-ink dark:text-white"
            [attr.id]="'aies-tab-panel-' + activeId()"
            [attr.aria-labelledby]="'aies-tab-' + activeId()"
          >
            <ng-container
              [ngTemplateOutlet]="panel"
              [ngTemplateOutletContext]="{ $implicit: activeId() }"
            />
          </div>
        }
      }
    </div>
  `,
})
export class TabsComponent {
  private readonly router = inject(Router);
  protected readonly modeColor = inject(ModeColorService);

  private readonly tabDefs = contentChildren(TabDefDirective);
  private readonly tabEls = viewChildren<ElementRef<HTMLElement>>('tabEl');

  /** Tab definitions. */
  readonly items = input.required<AiesNavItem[]>();

  /**
   * Selected tab id. For routed items this is **synced from the Router**
   * (including cold URL loads). For local items, bind `[(activeId)]`.
   */
  readonly activeId = model<string | null>(null);

  /** Accessible name for the tablist. */
  readonly ariaLabel = input('Tabs');

  /**
   * Match options for routed items (same contract as `Router.isActive`).
   * Defaults to subset path matching, ignoring query/fragment.
   */
  readonly linkActiveOptions =
    input<IsActiveMatchOptions>(DEFAULT_LINK_ACTIVE);

  /** Re-evaluate active state on every successful navigation (and initial URL). */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly panelMap = computed(() => {
    const map = new Map<string, TabDefDirective['template']>();
    for (const def of this.tabDefs()) {
      map.set(def.aiesTabDef(), def.template);
    }
    return map;
  });

  protected readonly hasPanels = computed(() => this.panelMap().size > 0);

  protected readonly activePanel = computed(() => {
    const id = this.activeId();
    if (!id) {
      return null;
    }
    return this.panelMap().get(id) ?? null;
  });

  protected readonly tabChrome = computed(
    () =>
      'inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-body-sm transition-colors -mb-px',
  );

  protected readonly activeTabClass = computed(() => {
    const colors = this.modeColor.classes();
    return `${colors.text} border-current font-semibold`;
  });

  protected readonly inactiveTabClass = computed(
    () =>
      'border-transparent font-medium text-neutral-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white',
  );

  constructor() {
    // Keep activeId aligned with the URL whenever any item is router-backed.
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

  protected isItemActive(item: AiesNavItem): boolean {
    if (item.routerLink != null) {
      this.url();
      return isNavItemActive(this.router, item, this.linkActiveOptions());
    }
    return this.activeId() === item.id;
  }

  protected selectLocal(item: AiesNavItem): void {
    if (item.disabled || item.routerLink != null) {
      return;
    }
    this.activeId.set(item.id);
  }

  /**
   * Arrow-key navigation for the tablist. Local buttons also change selection
   * (ARIA tabs); routed links only move focus.
   * @param event
   */
  protected onTablistKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    const els = this.tabEls()
      .map((r) => r.nativeElement)
      .filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-disabled') !== 'true',
      );
    if (els.length === 0) {
      return;
    }
    const current = document.activeElement as HTMLElement | null;
    const idx = els.findIndex((el) => el === current);
    if (idx < 0) {
      return;
    }
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = (idx + delta + els.length) % els.length;
    const nextEl = els[next];
    if (!nextEl) {
      return;
    }
    nextEl.focus();

    if (nextEl.tagName === 'BUTTON') {
      const id = nextEl.id.replace(/^aies-tab-/, '');
      const item = this.items().find((t) => t.id === id);
      if (item) {
        this.selectLocal(item);
      }
    }
  }
}
