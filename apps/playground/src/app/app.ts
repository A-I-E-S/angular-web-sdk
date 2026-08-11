import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ShippingModeService } from '@aies/aies-core';
import { AiesIconComponent } from '@aies/aies-icons';
import type { ShippingMode } from '@aies/aies-models';
import { ModeColorService, ThemeService } from '@aies/aies-theme';
import { ButtonComponent } from '@aies/aies-ui';

interface NavLink {
  path: string;
  label: string;
  group: 'Overview' | 'Components' | 'Foundation';
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    AiesIconComponent,
    UpperCasePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly shipping = inject(ShippingModeService);
  protected readonly modeColor = inject(ModeColorService);

  protected readonly themeMode = this.theme.theme;
  protected readonly shippingMode = this.shipping.mode;
  protected readonly mobileNavOpen = signal(false);

  /** Active nav classes follow the current shipment mode accent. */
  protected readonly activeNavClass = computed(() =>
    this.shippingMode() === 'sfn'
      ? 'bg-export-subtle text-export font-medium dark:bg-export/15 dark:text-export-light'
      : 'bg-import-subtle text-import font-medium dark:bg-import/15 dark:text-import-light',
  );

  protected readonly navLinks: NavLink[] = [
    { path: '/', label: 'Overview', group: 'Overview' },
    { path: '/components/button', label: 'Button', group: 'Components' },
    { path: '/components/feedback', label: 'Feedback', group: 'Components' },
    { path: '/components/overlays', label: 'Overlays', group: 'Components' },
    { path: '/components/forms', label: 'Forms', group: 'Components' },
    { path: '/components/navigation/overview', label: 'Navigation', group: 'Components' },
    { path: '/components/table', label: 'Table', group: 'Components' },
    { path: '/components/stepper', label: 'Stepper', group: 'Components' },
    { path: '/icons', label: 'Icons', group: 'Foundation' },
    { path: '/tokens', label: 'Tokens', group: 'Foundation' },
    { path: '/models', label: 'Models', group: 'Foundation' },
  ];

  protected readonly groups: Array<NavLink['group']> = [
    'Overview',
    'Components',
    'Foundation',
  ];

  protected linksFor(group: NavLink['group']): NavLink[] {
    return this.navLinks.filter((l) => l.group === group);
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected setShippingMode(mode: ShippingMode): void {
    this.shipping.setMode(mode);
  }

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
