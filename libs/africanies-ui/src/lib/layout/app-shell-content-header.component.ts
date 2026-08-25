import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import { BreadcrumbComponent } from '../navigation/breadcrumb';
import {
  resolveCatalogRootLink,
  resolveContentBackTarget,
  resolveParentPathFromRootSnapshot,
} from '../navigation/header-back.util';
import type { AfricaniesNavItem } from '../navigation/nav-item';
import type { AfricaniesSideNavItem } from '../navigation/side-nav';
import { PageHeaderComponent } from './page-header.component';

/**
 * Content chrome above the app-shell body: Back, breadcrumbs, then the page
 * title and optional subtitle.
 */
@Component({
  selector: 'africanies-app-shell-content-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, BreadcrumbComponent, PageHeaderComponent, RouterLink],
  template: `
    @if (showBackButton() || breadcrumbs().length || title() || subtitle()) {
      <div class="mb-6 flex flex-col gap-4">
        @if (showBackButton() || breadcrumbs().length) {
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            @if (showBackButton()) {
              <a
                class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-background-welcome hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                [attr.aria-label]="backLabel()"
                [routerLink]="backTarget()!.routerLink"
                [queryParams]="backTarget()!.queryParams"
                [fragment]="backTarget()!.fragment"
              >
                <africanies-icon name="chevron-left" [size]="18" aria-hidden="true" />
              </a>
            }

            @if (breadcrumbs().length) {
              <div
                class="min-w-0 flex-1"
                [class.border-l]="showBackButton()"
                [class.pl-2]="showBackButton()"
                [class.sm:pl-3]="showBackButton()"
                [class.border-border]="showBackButton()"
                [class.dark:border-white/10]="showBackButton()"
              >
                <africanies-breadcrumb [items]="breadcrumbs()" />
              </div>
            }
          </div>
        }

        @if (title() || subtitle()) {
          <africanies-page-header [title]="title()" [subtitle]="subtitle()" />
        }
      </div>
    }
  `,
})
export class AppShellContentHeaderComponent {
  private readonly router = inject(Router);

  readonly breadcrumbs = input<AfricaniesNavItem[]>([]);
  readonly title = input('');
  /** Supporting line under the title (what this page is for). */
  readonly subtitle = input('');
  readonly url = input('');
  readonly catalogNav = input<AfricaniesSideNavItem[]>([]);
  readonly showBack = input(true, { transform: booleanAttribute });
  readonly backLink = input<string | readonly unknown[] | null>(null);
  readonly backLabel = input('Back');

  private readonly routeUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly backTarget = computed(() => {
    const url = this.routeUrl() || this.url();
    return resolveContentBackTarget(
      resolveParentPathFromRootSnapshot(this.router.routerState.snapshot.root),
      url,
      resolveCatalogRootLink(url, this.catalogNav()),
      this.backLink(),
    );
  });

  protected readonly showBackButton = computed(
    () => this.showBack() && this.backTarget() != null,
  );
}
