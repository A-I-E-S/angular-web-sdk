import { Component, computed, effect, input, signal } from '@angular/core';

import {
  type AiesMenuItem,
  type AiesNavItem,
  type AiesNotification,
  type AiesSideNavItem,
  AppShellComponent,
  type AppShellLayoutPreview,
  SideNavComponent,
} from '@aies/aies-ui';

/**
 * Single app shell preview at a fixed viewport width.
 */
@Component({
  selector: 'app-shell-viewport-preview',
  standalone: true,
  imports: [AppShellComponent, SideNavComponent],
  template: `
    <div
      class="mx-auto overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:border-white/10 dark:bg-ink"
      [class]="frameClass()"
    >
      <aies-app-shell
        contentWidth="5xl"
        [layoutPreview]="layout()"
        [breadcrumbs]="breadcrumbs()"
        [userName]="userName()"
        [userMenuItems]="userMenuItems()"
        [notifications]="notifications()"
      >
        <aies-side-nav
          sidenav
          [items]="sideNav()"
          [(collapsed)]="collapsed"
          [(activeId)]="activeId"
          [showLogout]="true"
          [attr.aria-label]="ariaLabel()"
        />
        <div class="flex flex-col gap-1.5">
          <p class="m-0 text-body-sm font-medium text-ink dark:text-white">
            Content
          </p>
          <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
            {{ contentHint() }}
          </p>
        </div>
      </aies-app-shell>
    </div>
  `,
})
export class AppShellViewportPreviewComponent {
  readonly layout = input.required<AppShellLayoutPreview>();
  readonly sideNav = input.required<AiesSideNavItem[]>();
  readonly breadcrumbs = input.required<AiesNavItem[]>();
  readonly userName = input('Jane Doe');
  readonly userMenuItems = input.required<AiesMenuItem[]>();
  readonly notifications = input.required<AiesNotification[]>();

  protected readonly collapsed = signal(false);
  protected readonly activeId = signal('track');

  protected readonly ariaLabel = computed(() => {
    const label =
      this.layout() === 'mobile'
        ? 'Mobile'
        : this.layout() === 'tablet'
          ? 'Tablet'
          : 'Desktop';
    return `${label} navigation`;
  });

  protected readonly frameClass = computed(() => {
    switch (this.layout()) {
      case 'mobile':
        return 'h-[35rem] w-full max-w-[375px]';
      case 'tablet':
        return 'h-[32.5rem] w-full max-w-[768px]';
      default:
        return 'h-[30rem] w-full';
    }
  });

  protected readonly contentHint = computed(() => {
    switch (this.layout()) {
      case 'mobile':
        return 'Tap the menu icon to open the side nav drawer. Clock stays in the header; breadcrumbs and Back sit above the content.';
      case 'tablet':
        return 'Same drawer pattern as phone, with more horizontal room and date/time in the header.';
      default:
        return 'Persistent side rail, header utilities, and centered content with breadcrumbs above the page body.';
    }
  });

  constructor() {
    effect(() => {
      const layout = this.layout();
      this.collapsed.set(layout === 'mobile');
      this.activeId.set(layout === 'desktop' ? 'home' : 'track');
    });
  }
}
