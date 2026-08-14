import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';

import type { AiesNavItem } from '../nav-item';

/**
 * Breadcrumb trail for hierarchical navigation.
 *
 * Items may set {@link AiesNavItem.routerLink} so crumbs navigate via the
 * consumer’s Angular Router. The **last** item is always the current page
 * (`aria-current="page"`) and is not interactive.
 *
 * @example
 * ```html
 * <!-- Router-aware -->
 * <aies-breadcrumb [items]="[
 *   { id: 'home', label: 'Home', routerLink: '/overview' },
 *   { id: 'shipments', label: 'Shipments', routerLink: '/shipments' },
 *   { id: 'detail', label: 'SFN-1001' }
 * ]" />
 *
 * <!-- Static labels only -->
 * <aies-breadcrumb [items]="staticCrumbs" />
 * ```
 */
@Component({
  selector: 'aies-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, RouterLink, NgClass],
  template: `
    <nav aria-label="Breadcrumb" class="text-body-sm">
      <ol class="m-0 flex list-none flex-wrap items-center gap-1 p-0">
        @for (item of items(); track item.id; let last = $last; let i = $index) {
          <li class="inline-flex items-center gap-1 min-w-0">
            @if (i > 0) {
              <aies-icon
                name="angle-right"
                [size]="12"
                class="shrink-0 text-neutral-400"
                aria-hidden="true"
              />
            }
            @if (last) {
              <span
                class="truncate font-medium text-ink dark:text-white"
                aria-current="page"
              >
                @if (item.icon; as icon) {
                  <aies-icon [name]="icon" [size]="14" class="mr-1 inline-block align-text-bottom" />
                }
                {{ item.label }}
              </span>
            } @else if (item.routerLink !== null && item.routerLink !== undefined && !item.disabled) {
              <a
                class="inline-flex items-center gap-1 truncate transition-colors hover:underline"
                [ngClass]="modeColor.classes().text"
                [routerLink]="item.routerLink"
                [queryParams]="item.queryParams"
                [fragment]="item.fragment"
              >
                @if (item.icon; as icon) {
                  <aies-icon [name]="icon" [size]="14" class="shrink-0" />
                }
                {{ item.label }}
              </a>
            } @else {
              <span
                class="truncate text-neutral-600 dark:text-neutral-400"
                [class.opacity-50]="item.disabled"
              >
                @if (item.icon; as icon) {
                  <aies-icon [name]="icon" [size]="14" class="mr-1 inline-block align-text-bottom" />
                }
                {{ item.label }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  protected readonly modeColor = inject(ModeColorService);

  /** Ordered crumbs; the last entry is the current page. */
  readonly items = input.required<AiesNavItem[]>();
}
