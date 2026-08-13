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
 * **Design - ink spine:** a continuous mode-accent edge with soft active
 * highlights. Collapsed mode keeps icons; hover opens a floating label blade
 * (name + children) instead of a plain tooltip.
 *
 * ## Parent items with children
 * **Expanded rail:** branches start open by default (`expandBranchesByDefault`).
 * Clicking a parent only opens/closes the branch (no route change).
 * **Collapsed rail:** clicking a parent expands the rail, opens the
 * branch, and activates the first enabled child (router or `activeId`).
 *
 * ## Router mode
 * Set `routerLink` on items. Active state follows the consumer's Router
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
  styleUrl: './aies-side-nav.component.css',
  templateUrl: './aies-side-nav.component.html',
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

  /**
   * When true (default), every parent with children starts expanded on first
   * render. Users can still collapse branches manually.
   */
  readonly expandBranchesByDefault = input(true, {
    transform: booleanAttribute,
  });

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

  /** Ensures default-expanded seeding runs once per mount (after items arrive). */
  private branchesSeeded = false;

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
      const parents = this.collectParentIds(this.items());
      if (
        !this.expandBranchesByDefault() ||
        this.branchesSeeded ||
        parents.length === 0
      ) {
        return;
      }
      this.openBranches.set(new Set(parents));
      this.branchesSeeded = true;
    });

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
   * Exact active leaf (or local id match) - not parent-of-active.
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
   * Toggle the branch when expanded; when collapsed, expand the rail and
   * activate the index child.
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

    // Expanded rail -> accordion only (never route to the index child).
    if (!wasCollapsed) {
      if (item.routerLink != null) {
        event.preventDefault();
      }
      if (!this.expandParents()) {
        return;
      }
      this.openBranches.update((set) => {
        const next = new Set(set);
        if (wasOpen) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
      return;
    }

    // Collapsed rail -> expand, open branch, select first enabled child.
    this.collapsed.set(false);
    this.hoverId.set(null);

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

  /** Ids of every node that has nested children (any depth). */
  private collectParentIds(items: AiesSideNavItem[]): string[] {
    const ids: string[] = [];
    for (const item of items) {
      if (item.children?.length) {
        ids.push(item.id);
        ids.push(...this.collectParentIds(item.children));
      }
    }
    return ids;
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
