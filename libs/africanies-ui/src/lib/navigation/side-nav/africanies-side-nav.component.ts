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

import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import { ModeColorService } from '@africanies/africanies-theme';

import { AFRICANIES_BRAND_LOGO_MINI_URL, AFRICANIES_BRAND_LOGO_URL } from '../../brand';
import { resolveActiveSideNavItem } from '../header-back.util';
import { navItemUrlTree } from '../nav-router.util';
import type { AfricaniesSideNavItem } from './side-nav-item';

const DEFAULT_LINK_ACTIVE: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

/**
 * App shell side navigation with icons, nested items, and a collapsible rail.
 *
 * **Design - ink spine:** a continuous mode-accent edge; active leaves use
 * primary fill + white text (portal parity); expanded parents of an active
 * child use primary text on white. Collapsed mode keeps icons; hover opens a
 * floating label blade (name + children) instead of a plain tooltip.
 *
 * ## Parent items with children
 * **Expanded rail:** branches start open by default (`expandBranchesByDefault`).
 * Clicking a parent only opens/closes the branch (no route change). When any
 * branch is open, a sticky collapse-all control sits above the list (top right).
 * The rail expand/collapse control stays pinned in the logo header.
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
 * <africanies-side-nav
 *   [items]="nav"
 *   [(collapsed)]="collapsed"
 *   [(activeId)]="activeId"
 *   ariaLabel="Main"
 * />
 * ```
 */
@Component({
  selector: 'africanies-side-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, RouterLink, NgTemplateOutlet],
  host: {
    class: 'relative z-20 block h-full min-h-0',
  },
  styleUrl: './africanies-side-nav.component.css',
  templateUrl: './africanies-side-nav.component.html',
})
export class SideNavComponent {
  protected readonly modeColor = inject(ModeColorService);
  private readonly defaultLogoUrl = inject(AFRICANIES_BRAND_LOGO_URL);
  private readonly defaultLogoMiniUrl = inject(AFRICANIES_BRAND_LOGO_MINI_URL);
  private readonly router = inject(Router);

  /** Navigation tree. */
  readonly items = input.required<AfricaniesSideNavItem[]>();

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

  /**
   * Reserved for API compatibility. Active highlighting uses longest-prefix
   * catalog matching ({@link resolveActiveSideNavItem}), same as breadcrumbs.
   */
  readonly linkActiveOptions = input<IsActiveMatchOptions>(
    DEFAULT_LINK_ACTIVE,
  );

  /** When true (default), show the packaged Africanies logo in the brand row. */
  readonly showLogo = input(true, { transform: booleanAttribute });

  /** Optional custom full wordmark URL (expanded rail). */
  readonly logoSrc = input<string | null>(null);

  /** Optional custom compact mark URL (collapsed rail). Defaults to mini logo. */
  readonly logoMiniSrc = input<string | null>(null);

  protected readonly resolvedFullLogo = computed(
    () => this.logoSrc() ?? this.defaultLogoUrl,
  );

  protected readonly resolvedMiniLogo = computed(
    () => this.logoMiniSrc() ?? this.defaultLogoMiniUrl,
  );

  private readonly openBranches = signal<ReadonlySet<string>>(new Set());
  protected readonly hoverId = signal<string | null>(null);

  protected readonly hasOpenBranches = computed(
    () => this.openBranches().size > 0,
  );

  /** Longest-prefix catalog match for the current URL (incl. nested child routes). */
  protected readonly matchedRoutedItem = computed(() =>
    resolveActiveSideNavItem(this.url(), this.items()),
  );

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
      const match = this.matchedRoutedItem();
      if (match && this.activeId() !== match.id) {
        this.activeId.set(match.id);
      }
    });
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
    this.hoverId.set(null);
  }

  /** Fold every parent branch on the expanded rail. */
  collapseAllBranches(): void {
    this.openBranches.set(new Set());
  }

  /** Open every parent branch (e.g. so the collapse-all control is visible). */
  expandAllBranches(): void {
    this.openBranches.set(new Set(this.collectParentIds(this.items())));
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
  protected isLeafActive(item: AfricaniesSideNavItem): boolean {
    if (item.routerLink != null) {
      return this.matchedRoutedItem()?.id === item.id;
    }
    return this.activeId() === item.id;
  }

  protected isItemActive(item: AfricaniesSideNavItem): boolean {
    if (this.isLeafActive(item)) {
      return true;
    }
    return (item.children ?? []).some((c) => this.isItemActive(c));
  }

  protected rowClass(item: AfricaniesSideNavItem): string {
    const base =
      'group relative flex w-full items-center gap-2 rounded-lg text-body-sm no-underline transition-colors ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus ' +
      (this.collapsed() ? 'justify-center px-1.5 py-2' : 'px-3 py-2') +
      (item.disabled ? ' cursor-not-allowed opacity-50' : ' cursor-pointer');

    const leaf = this.isLeafActive(item);
    const ancestor = !leaf && this.isItemActive(item);
    const colors = this.modeColor.classes();

    // Portal: active leaf / collapsed rail = primary fill + white text.
    if (leaf) {
      return `${base} ${colors.activeFill} font-semibold`;
    }
    // Portal: expanded parent of active child = primary text on white.
    if (ancestor) {
      return `${base} bg-transparent ${colors.text} font-semibold`;
    }
    return (
      `${base} font-medium text-neutral-600 hover:bg-background-hover hover:text-ink ` +
      'dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white'
    );
  }

  protected childRowClass(item: AfricaniesSideNavItem): string {
    const base =
      'relative flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-body-sm no-underline transition-colors ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus ' +
      (item.disabled ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer ');

    if (this.isLeafActive(item)) {
      return `${base} ${this.modeColor.classes().activeFill} font-semibold`;
    }
    return (
      `${base} font-medium text-neutral-600 hover:bg-background-hover hover:text-ink ` +
      'dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white'
    );
  }

  /**
   * @param item - Clicked entry.
   * @param event - Click event.
   */
  protected onActivate(item: AfricaniesSideNavItem, event: Event): void {
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
    item: AfricaniesSideNavItem,
    children: AfricaniesSideNavItem[],
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
  private activateLeaf(item: AfricaniesSideNavItem): void {
    if (item.routerLink != null) {
      const tree = navItemUrlTree(this.router, item);
      if (tree) {
        void this.router.navigateByUrl(tree);
      }
      return;
    }
    this.activeId.set(item.id);
  }

  private flatten(items: AfricaniesSideNavItem[]): AfricaniesSideNavItem[] {
    const out: AfricaniesSideNavItem[] = [];
    for (const item of items) {
      out.push(item);
      if (item.children?.length) {
        out.push(...this.flatten(item.children));
      }
    }
    return out;
  }

  /**
   * Ids of every node that has nested children (any depth).
   *
   * @param items - Side-nav nodes to walk.
   * @returns Parent item ids, including nested groups.
   */
  private collectParentIds(items: AfricaniesSideNavItem[]): string[] {
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
    items: AfricaniesSideNavItem[],
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
