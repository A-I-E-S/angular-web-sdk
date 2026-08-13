import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
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

import { AIES_BRAND_LOGO_MINI_URL, AIES_BRAND_LOGO_URL } from '../../brand';
import { isNavItemActive, navItemUrlTree } from '../nav-router.util';
import type { AiesSideNavItem } from './side-nav-item';

const DEFAULT_LINK_ACTIVE: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

/**
 * App shell side navigation with icons, nested items, and a collapsible rail.
 *
 * **Design — ink spine:** a continuous mode-accent edge with soft active
 * highlights. Collapsed mode keeps icons; hover opens a floating label blade
 * (name + children) instead of a plain tooltip.
 *
 * ## Parent items with children
 * Clicking a branch parent expands a collapsed rail, opens the branch, and
 * activates the first enabled child (router navigation or `activeId`). Clicking
 * again while the branch is already open collapses it without navigating.
 *
 * ## Router mode
 * Set `routerLink` on items. Active state follows the consumer’s Router
 * (including cold loads).
 *
 * ## Local mode
 * Omit `routerLink` and bind `[(activeId)]`.
 *
 * @example
 * ```html
 * <aies-side-nav
 *   [items]="nav"
 *   [(collapsed)]="collapsed"
 *   [(activeId)]="activeId"
 *   ariaLabel="Main"
 *   (logout)="signOut()"
 * />
 * ```
 */
@Component({
  selector: 'aies-side-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, RouterLink, NgTemplateOutlet],
  host: {
    class: 'relative z-20 block h-full',
  },
  styles: [
    `
      @keyframes aies-side-nav-badge-pulse {
        0% {
          transform: translate(-50%, -50%) scale(0.85);
          opacity: 0.9;
        }
        70% {
          transform: translate(-50%, -50%) scale(2.4);
          opacity: 0;
        }
        100% {
          transform: translate(-50%, -50%) scale(2.4);
          opacity: 0;
        }
      }

      .aies-side-nav-badge-ping {
        animation: aies-side-nav-badge-pulse 1.4s cubic-bezier(0, 0, 0.2, 1)
          infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .aies-side-nav-badge-ping {
          animation: none;
          opacity: 0.5;
        }
      }
    `,
  ],
  template: `
    <aside
      class="relative flex h-full flex-col overflow-visible border-r border-border bg-white transition-[width] duration-200 ease-out dark:border-white/10 dark:bg-ink"
      [style.width]="collapsed() ? '3.75rem' : '15rem'"
      [attr.aria-label]="ariaLabel()"
    >
      <div
        class="pointer-events-none absolute inset-y-0 left-0 w-[3px] transition-colors"
        [class]="modeColor.classes().bg"
        aria-hidden="true"
      ></div>

      <div
        class="flex shrink-0 items-center gap-2 border-b border-border py-3 dark:border-white/10"
        [class.flex-col]="collapsed()"
        [class.px-3]="collapsed()"
        [class.pl-4]="!collapsed()"
        [class.pr-2]="!collapsed()"
      >
        @if (collapsed()) {
          @if (showLogo()) {
            <img
              [src]="resolvedMiniLogo()"
              alt="African Import Export Solutions"
              class="size-8 shrink-0 object-contain"
            />
          }
        } @else {
          @if (showLogo()) {
            <div class="min-w-0 flex-1">
              <img
                [src]="resolvedFullLogo()"
                alt="African Import Export Solutions"
                class="h-9 max-w-full object-contain object-left"
              />
            </div>
          } @else {
            <div
              class="min-w-0 flex-1 truncate text-body-sm font-semibold text-ink dark:text-white"
            >
              <ng-content select="[brand]" />
            </div>
          }
        }
        <button
          type="button"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-background-welcome hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          [attr.aria-label]="
            collapsed() ? 'Expand navigation' : 'Collapse navigation'
          "
          [attr.aria-expanded]="!collapsed()"
          (click)="toggleCollapsed()"
        >
          <aies-icon
            [name]="collapsed() ? 'angle-double-right' : 'angle-double-left'"
            [size]="16"
          />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto overflow-x-visible px-3 py-4">
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
          @for (item of items(); track item.id) {
            <li
              class="relative overflow-visible"
              (mouseenter)="onItemEnter(item.id)"
              (mouseleave)="onItemLeave(item.id)"
            >
              @if (item.routerLink !== null && item.routerLink !== undefined) {
                <a
                  [routerLink]="item.disabled ? null : item.routerLink"
                  [queryParams]="item.queryParams"
                  [fragment]="item.fragment"
                  [class]="rowClass(item)"
                  [attr.aria-current]="isLeafActive(item) ? 'page' : null"
                  [attr.aria-expanded]="
                    item.children?.length ? isBranchOpen(item.id) : null
                  "
                  [attr.aria-disabled]="item.disabled ? true : null"
                  (click)="onActivate(item, $event)"
                >
                  <ng-container
                    [ngTemplateOutlet]="rowInner"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              } @else {
                <button
                  type="button"
                  [class]="rowClass(item)"
                  [disabled]="!!item.disabled"
                  [attr.aria-current]="isLeafActive(item) ? 'page' : null"
                  [attr.aria-expanded]="
                    item.children?.length ? isBranchOpen(item.id) : null
                  "
                  (click)="onActivate(item, $event)"
                >
                  <ng-container
                    [ngTemplateOutlet]="rowInner"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </button>
              }

              @if (!collapsed() && item.children?.length) {
                <div
                  class="grid transition-[grid-template-rows] duration-200 ease-out"
                  [style.grid-template-rows]="
                    isBranchOpen(item.id) ? '1fr' : '0fr'
                  "
                  [attr.aria-hidden]="!isBranchOpen(item.id)"
                  [class.pointer-events-none]="!isBranchOpen(item.id)"
                >
                  <ul
                    class="relative m-0 mt-0.5 min-h-0 list-none space-y-0.5 overflow-hidden py-1 pl-4 before:absolute before:bottom-1 before:left-[1.35rem] before:top-0 before:w-px before:bg-border dark:before:bg-white/15"
                  >
                    @for (child of item.children; track child.id) {
                      <li
                        class="transition-opacity duration-200 ease-out"
                        [class.opacity-0]="!isBranchOpen(item.id)"
                        [class.opacity-100]="isBranchOpen(item.id)"
                      >
                      @if (
                        child.routerLink !== null &&
                        child.routerLink !== undefined
                      ) {
                        <a
                          [routerLink]="child.disabled ? null : child.routerLink"
                          [queryParams]="child.queryParams"
                          [fragment]="child.fragment"
                          [class]="childRowClass(child)"
                          [attr.aria-current]="
                            isLeafActive(child) ? 'page' : null
                          "
                          (click)="onActivate(child, $event)"
                        >
                          @if (child.icon; as icon) {
                            <aies-icon
                              [name]="icon"
                              [size]="14"
                              class="shrink-0 opacity-80"
                            />
                          }
                          <span class="truncate">{{ child.label }}</span>
                          <ng-container
                            [ngTemplateOutlet]="navBadge"
                            [ngTemplateOutletContext]="{
                              visible: child.badge,
                              compact: false,
                            }"
                          />
                        </a>
                      } @else {
                        <button
                          type="button"
                          [class]="childRowClass(child)"
                          [disabled]="!!child.disabled"
                          [attr.aria-current]="
                            isLeafActive(child) ? 'page' : null
                          "
                          (click)="onActivate(child, $event)"
                        >
                          @if (child.icon; as icon) {
                            <aies-icon
                              [name]="icon"
                              [size]="14"
                              class="shrink-0 opacity-80"
                            />
                          }
                          <span class="truncate">{{ child.label }}</span>
                          <ng-container
                            [ngTemplateOutlet]="navBadge"
                            [ngTemplateOutletContext]="{
                              visible: child.badge,
                              compact: false,
                            }"
                          />
                        </button>
                      }
                    </li>
                  }
                  </ul>
                </div>
              }

              @if (collapsed() && hoverId() === item.id) {
                <div
                  class="absolute left-full top-0 z-50 ml-2 min-w-[11rem] overflow-hidden rounded-md border border-border bg-ink text-white shadow-lg dark:border-white/15"
                  role="tooltip"
                >
                  <div
                    class="absolute inset-y-0 left-0 w-1"
                    [class]="modeColor.classes().bg"
                    aria-hidden="true"
                  ></div>
                  <div class="border-b border-white/10 px-3 py-2 pl-4">
                    <p class="m-0 text-body-sm font-semibold">{{ item.label }}</p>
                  </div>
                  @if (item.children?.length) {
                    <ul class="m-0 list-none space-y-0.5 p-1.5">
                      @for (child of item.children; track child.id) {
                        <li>
                          @if (
                            child.routerLink !== null &&
                            child.routerLink !== undefined
                          ) {
                            <a
                              [routerLink]="
                                child.disabled ? null : child.routerLink
                              "
                              [queryParams]="child.queryParams"
                              [fragment]="child.fragment"
                              class="relative flex items-center gap-2 rounded px-2.5 py-1.5 text-body-sm text-white/85 no-underline transition-colors hover:bg-white/10 hover:text-white"
                              [class.opacity-50]="child.disabled"
                              (click)="onActivate(child, $event)"
                            >
                              @if (child.icon; as icon) {
                                <aies-icon [name]="icon" [size]="14" />
                              }
                              {{ child.label }}
                              <ng-container
                                [ngTemplateOutlet]="navBadge"
                                [ngTemplateOutletContext]="{
                                  visible: child.badge,
                                  compact: true,
                                }"
                              />
                            </a>
                          } @else {
                            <button
                              type="button"
                              class="relative flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-body-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                              [disabled]="!!child.disabled"
                              (click)="onActivate(child, $event)"
                            >
                              @if (child.icon; as icon) {
                                <aies-icon [name]="icon" [size]="14" />
                              }
                              {{ child.label }}
                              <ng-container
                                [ngTemplateOutlet]="navBadge"
                                [ngTemplateOutletContext]="{
                                  visible: child.badge,
                                  compact: true,
                                }"
                              />
                            </button>
                          }
                        </li>
                      }
                    </ul>
                  }
                </div>
              }
            </li>
          }
        </ul>
      </nav>

      @if (showLogout()) {
        <div
          class="shrink-0 border-t border-border px-3 py-3 dark:border-white/10"
        >
          <ng-content select="[footer]" />
          <button
            type="button"
            [class]="logoutClass()"
            (click)="logout.emit()"
          >
            <aies-icon name="sign-out" [size]="16" class="shrink-0" />
            @if (!collapsed()) {
              <span class="truncate">{{ logoutLabel() }}</span>
            }
          </button>
        </div>
      } @else {
        <ng-content select="[footer]" />
      }
    </aside>

    <ng-template #rowInner let-item>
      <span class="inline-flex size-5 shrink-0 items-center justify-center">
        @if (item.icon; as icon) {
          <aies-icon [name]="icon" [size]="16" />
        } @else {
          <span
            class="size-1.5 rounded-full bg-current opacity-70"
            aria-hidden="true"
          ></span>
        }
      </span>
      @if (!collapsed()) {
        <span class="min-w-0 flex-1 truncate text-left">{{ item.label }}</span>
        @if (item.children?.length) {
          <aies-icon
            name="chevron-down"
            [size]="14"
            class="shrink-0 opacity-70 transition-transform duration-200 ease-out"
            [class.rotate-180]="isBranchOpen(item.id)"
          />
        }
      }
      <ng-container
        [ngTemplateOutlet]="navBadge"
        [ngTemplateOutletContext]="{
          visible: item.badge,
          compact: collapsed(),
        }"
      />
    </ng-template>

    <ng-template #navBadge let-visible="visible" let-compact="compact">
      @if (visible) {
        <span
          class="pointer-events-none absolute z-10 overflow-visible"
          [class]="compact ? 'right-0.5 top-0.5 h-2 w-2' : 'right-1.5 top-1 h-2 w-2'"
          aria-hidden="true"
        >
          <span
            class="aies-side-nav-badge-ping absolute left-1/2 top-1/2 size-2 rounded-full bg-danger"
          ></span>
          <span
            class="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger ring-2 ring-white dark:ring-ink"
          ></span>
        </span>
      }
    </ng-template>
  `,
})
export class SideNavComponent {
  protected readonly modeColor = inject(ModeColorService);
  private readonly defaultLogoUrl = inject(AIES_BRAND_LOGO_URL);
  private readonly defaultLogoMiniUrl = inject(AIES_BRAND_LOGO_MINI_URL);
  private readonly router = inject(Router);

  /** Navigation tree. */
  readonly items = input.required<AiesSideNavItem[]>();

  /** When true, the rail collapses to icons only. Two-way bindable. */
  readonly collapsed = model(false);

  /**
   * Active item id for local (non-routed) trees. Synced from the router when
   * items use `routerLink`.
   */
  readonly activeId = model<string | null>(null);

  /** Accessible label for the `<aside>`. */
  readonly ariaLabel = input('Side navigation');

  /**
   * When true (default), nested branches expand when a descendant is active or
   * when the parent row is clicked.
   */
  readonly expandParents = input(true, { transform: booleanAttribute });

  /** Router active-match options for items with `routerLink`. */
  readonly linkActiveOptions = input<IsActiveMatchOptions>(
    DEFAULT_LINK_ACTIVE,
  );

  /** When true (default), show the packaged Africanies logo in the brand row. */
  readonly showLogo = input(true, { transform: booleanAttribute });

  /** Optional custom full wordmark URL (expanded rail). */
  readonly logoSrc = input<string | null>(null);

  /** Optional custom compact mark URL (collapsed rail). Defaults to mini logo. */
  readonly logoMiniSrc = input<string | null>(null);

  /** When true, render a logout control in the footer. */
  readonly showLogout = input(false, { transform: booleanAttribute });

  /** Logout button label when expanded. */
  readonly logoutLabel = input('Log out');

  /** Emitted when the footer logout control is clicked. */
  readonly logout = output<void>();

  protected readonly resolvedFullLogo = computed(
    () => this.logoSrc() ?? this.defaultLogoUrl,
  );

  protected readonly resolvedMiniLogo = computed(
    () => this.logoMiniSrc() ?? this.defaultLogoMiniUrl,
  );

  private readonly openBranches = signal<ReadonlySet<string>>(new Set());
  protected readonly hoverId = signal<string | null>(null);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    effect(() => {
      const id = this.activeId();
      if (id) {
        this.ensureAncestorsOpen(id);
      }
    });

    effect(() => {
      this.url();
      const options = this.linkActiveOptions();
      const flat = this.flatten(this.items());
      const routed = flat.filter((i) => i.routerLink != null);
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

  protected toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
    this.hoverId.set(null);
  }

  protected onItemEnter(id: string): void {
    if (this.collapsed()) {
      this.hoverId.set(id);
    }
  }

  protected onItemLeave(id: string): void {
    if (this.hoverId() === id) {
      this.hoverId.set(null);
    }
  }

  protected isBranchOpen(id: string): boolean {
    return this.openBranches().has(id);
  }

  /**
   * Exact active leaf (or local id match) — not parent-of-active.
   * @param item - Side nav entry to test.
   * @returns Whether this leaf matches the current route or `activeId`.
   */
  protected isLeafActive(item: AiesSideNavItem): boolean {
    if (item.routerLink != null) {
      return isNavItemActive(this.router, item, this.linkActiveOptions());
    }
    return this.activeId() === item.id;
  }

  protected isItemActive(item: AiesSideNavItem): boolean {
    if (this.isLeafActive(item)) {
      return true;
    }
    return (item.children ?? []).some((c) => this.isItemActive(c));
  }

  protected rowClass(item: AiesSideNavItem): string {
    const base =
      'group relative flex w-full items-center gap-2 rounded-lg text-body-sm no-underline transition-colors ' +
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' +
      (this.collapsed() ? 'justify-center px-1.5 py-2' : 'px-3 py-2') +
      (item.disabled ? ' cursor-not-allowed opacity-50' : '');

    const leaf = this.isLeafActive(item);
    const ancestor = !leaf && this.isItemActive(item);

    if (leaf) {
      return `${base} ${this.modeColor.classes().soft} ${this.modeColor.classes().text} font-semibold`;
    }
    if (ancestor) {
      return `${base} ${this.modeColor.classes().soft} ${this.modeColor.classes().text} font-semibold`;
    }
    return (
      `${base} font-medium text-neutral-600 hover:bg-background-welcome hover:text-ink ` +
      'dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white'
    );
  }

  protected childRowClass(item: AiesSideNavItem): string {
    const base =
      'relative flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-body-sm no-underline transition-colors ' +
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' +
      (item.disabled ? 'cursor-not-allowed opacity-50 ' : '');

    if (this.isLeafActive(item)) {
      return `${base} ${this.modeColor.classes().soft} ${this.modeColor.classes().text} font-semibold`;
    }
    return (
      `${base} font-medium text-neutral-600 hover:bg-background-welcome hover:text-ink ` +
      'dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white'
    );
  }

  protected logoutClass(): string {
    const base =
      'flex w-full items-center gap-2 rounded-lg text-body-sm font-medium text-neutral-600 transition-colors ' +
      'hover:bg-background-welcome hover:text-ink focus-visible:outline focus-visible:outline-2 ' +
      'focus-visible:outline-offset-2 focus-visible:outline-ink ' +
      'dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white';
    return this.collapsed()
      ? `${base} justify-center px-1.5 py-2`
      : `${base} px-3 py-2`;
  }

  /**
   * @param item - Clicked entry.
   * @param event - Click event.
   */
  protected onActivate(item: AiesSideNavItem, event: Event): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    const children = item.children ?? [];
    const hasChildren = children.length > 0;

    if (hasChildren) {
      this.onParentActivate(item, children, event);
      return;
    }

    if (item.routerLink == null) {
      this.activeId.set(item.id);
    }

    if (this.collapsed()) {
      this.hoverId.set(null);
    }
  }

  /**
   * Expand the rail if needed, open or close the branch, and select the index child.
   * @param item - Parent entry with children.
   * @param children - Non-empty child list.
   * @param event - Click event.
   */
  private onParentActivate(
    item: AiesSideNavItem,
    children: AiesSideNavItem[],
    event: Event,
  ): void {
    const wasCollapsed = this.collapsed();
    const wasOpen = this.isBranchOpen(item.id);

    if (wasCollapsed) {
      this.collapsed.set(false);
      this.hoverId.set(null);
    }

    // Already open on an expanded rail → collapse only (no re-navigation).
    if (!wasCollapsed && wasOpen && this.expandParents()) {
      this.openBranches.update((set) => {
        const next = new Set(set);
        next.delete(item.id);
        return next;
      });
      if (item.routerLink != null) {
        event.preventDefault();
      }
      return;
    }

    if (this.expandParents()) {
      this.openBranches.update((set) => {
        const next = new Set(set);
        next.add(item.id);
        return next;
      });
    }

    const indexChild = children.find((child) => !child.disabled);
    if (!indexChild) {
      return;
    }

    // Prefer the section index over a parent `routerLink`, if any.
    if (item.routerLink != null) {
      event.preventDefault();
    }
    this.activateLeaf(indexChild);
  }

  /**
   * Selects a leaf via router or local `activeId`.
   * @param item - Enabled leaf to activate.
   */
  private activateLeaf(item: AiesSideNavItem): void {
    if (item.routerLink != null) {
      const tree = navItemUrlTree(this.router, item);
      if (tree) {
        void this.router.navigateByUrl(tree);
      }
      return;
    }
    this.activeId.set(item.id);
  }

  private flatten(items: AiesSideNavItem[]): AiesSideNavItem[] {
    const out: AiesSideNavItem[] = [];
    for (const item of items) {
      out.push(item);
      if (item.children?.length) {
        out.push(...this.flatten(item.children));
      }
    }
    return out;
  }

  private ensureAncestorsOpen(activeId: string): void {
    const path = this.findPath(this.items(), activeId);
    if (!path || path.length < 2) {
      return;
    }
    this.openBranches.update((set) => {
      const next = new Set(set);
      for (const id of path.slice(0, -1)) {
        next.add(id);
      }
      return next;
    });
  }

  private findPath(
    items: AiesSideNavItem[],
    id: string,
    trail: string[] = [],
  ): string[] | null {
    for (const item of items) {
      const next = [...trail, item.id];
      if (item.id === id) {
        return next;
      }
      if (item.children?.length) {
        const found = this.findPath(item.children, id, next);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
