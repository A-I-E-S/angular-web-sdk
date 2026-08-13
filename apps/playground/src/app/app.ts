import { Component, inject, signal } from '@angular/core';
import { type IsActiveMatchOptions, RouterOutlet } from '@angular/router';

import { ShippingModeService } from '@aies/aies-core';
import { AiesIconComponent } from '@aies/aies-icons';
import type { ShippingMode } from '@aies/aies-models';
import { ThemeService } from '@aies/aies-theme';
import {
  type AiesMenuItem,
  type AiesNavItem,
  type AiesNotification,
  type AiesSideNavItem,
  AppShellComponent,
  AppShellHeaderComponent,
  AppShellHeaderEndDirective,
  AppShellHeaderSlotDirective,
  ButtonComponent,
  SideNavComponent,
} from '@aies/aies-ui';

/**
 * Playground root — product {@link AppShellComponent} + catalog side nav.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppShellComponent,
    AppShellHeaderComponent,
    AppShellHeaderSlotDirective,
    AppShellHeaderEndDirective,
    SideNavComponent,
    ButtonComponent,
    AiesIconComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly shipping = inject(ShippingModeService);

  protected readonly themeMode = this.theme.theme;
  protected readonly shippingMode = this.shipping.mode;
  protected readonly navCollapsed = signal(false);

  /**
   * Exact path match keeps `/` from lighting up every route (SideNav default
   * is subset). Navigation uses its overview path; child nav demos stay nested
   * under that page’s own chrome.
   */
  protected readonly linkActiveOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'exact',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };

  protected readonly crumbs: AiesNavItem[] = [
    { id: 'home', label: 'Home', icon: 'home', routerLink: '/' },
    { id: 'playground', label: 'Playground' },
  ];

  protected readonly accountMenu: AiesMenuItem[] = [
    {
      label: 'Profile',
      icon: 'user',
      onClick: () => undefined,
    },
    {
      label: 'Settings',
      icon: 'cog',
      onClick: () => undefined,
    },
  ];

  protected readonly notifications: AiesNotification[] = [
    {
      id: 'n1',
      title: 'Welcome to the Web SDK playground',
      body: 'Browse components, foundation pages, and shipping-mode accents.',
      timestamp: new Date().toISOString(),
    },
  ];

  protected readonly navItems: AiesSideNavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'home', routerLink: '/' },
    {
      id: 'components',
      label: 'Components',
      icon: 'grid',
      children: [
        { id: 'button', label: 'Button', routerLink: '/components/button' },
        { id: 'alert', label: 'Alert', routerLink: '/components/alert' },
        { id: 'chip', label: 'Chip', routerLink: '/components/chip' },
        {
          id: 'action-menu',
          label: 'Action menu',
          routerLink: '/components/action-menu',
        },
        {
          id: 'feedback',
          label: 'Feedback',
          routerLink: '/components/feedback',
        },
        {
          id: 'overlays',
          label: 'Overlays',
          routerLink: '/components/overlays',
        },
        { id: 'forms', label: 'Forms', routerLink: '/components/forms' },
        { id: 'filters', label: 'Filters', routerLink: '/components/filters' },
        { id: 'tooltip', label: 'Tooltip', routerLink: '/components/tooltip' },
        { id: 'toast', label: 'Toast', routerLink: '/components/toast' },
        {
          id: 'navigation',
          label: 'Navigation',
          routerLink: '/components/navigation/overview',
        },
        { id: 'table', label: 'Table', routerLink: '/components/table' },
        { id: 'stepper', label: 'Stepper', routerLink: '/components/stepper' },
      ],
    },
    {
      id: 'foundation',
      label: 'Foundation',
      icon: 'cube',
      children: [
        { id: 'icons', label: 'Icons', routerLink: '/icons' },
        { id: 'tokens', label: 'Tokens', routerLink: '/tokens' },
        { id: 'models', label: 'Models', routerLink: '/models' },
        { id: 'api', label: 'SDK API', routerLink: '/api' },
      ],
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: 'book',
      children: [{ id: 'lecture', label: 'Lecture', routerLink: '/lecture' }],
    },
  ];

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected setShippingMode(mode: ShippingMode): void {
    this.shipping.setMode(mode);
  }
}
