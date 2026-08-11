import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';
import { ButtonComponent } from '@aies/aies-ui';

interface CatalogCard {
  path: string;
  title: string;
  blurb: string;
  icon:
    | 'adjust'
    | 'info-circle'
    | 'ellipsis-v'
    | 'warning'
    | 'modal'
    | 'accordion-menu'
    | 'align-justify'
    | 'warehouse'
    | 'panel'
    | 'abacus'
    | 'palette'
    | 'code'
    | 'filter';
  group: string;
}

/**
 * Playground landing — brand-forward overview of the SDK catalog.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, AiesIconComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-12">
      <section class="relative overflow-hidden rounded-2xl bg-ink-brand text-white">
        <div class="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div class="flex flex-col gap-5">
            <p class="m-0 text-caption font-medium uppercase tracking-[0.16em] text-white/70">
              AIES Web SDK
            </p>
            <h1 class="m-0 max-w-xl text-heading-1 text-white">
              Ship STN &amp; SFN UI from one toolkit.
            </h1>
            <p class="m-0 max-w-lg text-body-lg text-white/75">
              Browse live components, icons, and tokens with the same theme and
              shipment-mode wiring your apps will use in production.
            </p>
            <div class="flex flex-wrap gap-3">
              <a aies-button routerLink="/components/button" class="!no-underline">
                Explore components
              </a>
              <a
                aies-button
                variant="secondary"
                routerLink="/tokens"
                class="!border-white/30 !bg-transparent !text-white !no-underline hover:!bg-white/10"
              >
                View tokens
              </a>
            </div>
          </div>
          <dl class="grid grid-cols-3 gap-4 rounded-xl border border-white/15 bg-black/20 p-5 backdrop-blur-sm">
            <div>
              <dt class="text-caption text-white/60">Packages</dt>
              <dd class="m-0 mt-1 text-heading-3 text-white">6</dd>
            </div>
            <div>
              <dt class="text-caption text-white/60">Icons</dt>
              <dd class="m-0 mt-1 text-heading-3 text-white">638</dd>
            </div>
            <div>
              <dt class="text-caption text-white/60">Modes</dt>
              <dd class="m-0 mt-1 text-heading-3 text-white">2</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="flex flex-col gap-5">
        <div class="flex flex-col gap-1">
          <p class="pg-kicker m-0">Catalog</p>
          <h2 class="m-0 text-heading-3 text-ink dark:text-white">Jump into a surface</h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (card of cards; track card.path) {
            <a
              [routerLink]="card.path"
              class="group flex flex-col gap-4 rounded-xl border border-border bg-white p-5 no-underline transition duration-200 hover:-translate-y-0.5 hover:border-neutral-400 dark:border-white/10 dark:bg-ink dark:hover:border-white/25"
            >
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background-welcome text-ink transition group-hover:scale-105 dark:bg-ink-950 dark:text-white"
                  [class]="modeColor.classes().bgSubtle"
                >
                  <aies-icon [name]="card.icon" [size]="20" />
                </span>
                <span class="text-caption text-neutral-600">{{ card.group }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-body font-medium text-ink dark:text-white">{{ card.title }}</span>
                <span class="text-body-sm text-neutral-600 dark:text-neutral-400">{{ card.blurb }}</span>
              </div>
            </a>
          }
        </div>
      </section>
    </div>
  `,
})
export class HomePage {
  protected readonly modeColor = inject(ModeColorService);

  protected readonly cards: CatalogCard[] = [
    {
      path: '/components/button',
      title: 'Button',
      blurb: 'Primary, secondary, ghost, danger — sizes and disabled.',
      icon: 'adjust',
      group: 'Components',
    },
    {
      path: '/components/alert',
      title: 'Alert',
      blurb: 'Dismissible info / success / warning / danger banners.',
      icon: 'info-circle',
      group: 'Components',
    },
    {
      path: '/components/action-menu',
      title: 'Action menu',
      blurb: 'Overflow menu for row and toolbar actions.',
      icon: 'ellipsis-v',
      group: 'Components',
    },
    {
      path: '/components/feedback',
      title: 'Feedback states',
      blurb: 'Loading, error, empty, and async stale badges.',
      icon: 'warning',
      group: 'Components',
    },
    {
      path: '/components/overlays',
      title: 'Overlays',
      blurb: 'Modal, drawer, and confirm via service APIs.',
      icon: 'modal',
      group: 'Components',
    },
    {
      path: '/components/forms',
      title: 'Form controls',
      blurb: 'Text, select, number, upload, and more with errors.',
      icon: 'accordion-menu',
      group: 'Components',
    },
    {
      path: '/components/filters',
      title: 'Filters',
      blurb: 'Schema-driven list filter drawer + legacy/named serialize.',
      icon: 'filter',
      group: 'Components',
    },
    {
      path: '/components/tooltip',
      title: 'Tooltip',
      blurb: 'Help tip with default icon or custom trigger target.',
      icon: 'info-circle',
      group: 'Components',
    },
    {
      path: '/components/navigation/overview',
      title: 'Navigation',
      blurb: 'Breadcrumb, tabs, and segment — router or local.',
      icon: 'panel',
      group: 'Components',
    },
    {
      path: '/components/table',
      title: 'Table & pagination',
      blurb: 'Template cells, sort signals, server-style paging.',
      icon: 'align-justify',
      group: 'Components',
    },
    {
      path: '/components/stepper',
      title: 'Stepper',
      blurb: 'Linear and free-nav wizard flows.',
      icon: 'warehouse',
      group: 'Components',
    },
    {
      path: '/icons',
      title: 'Icon gallery',
      blurb: 'Browse and copy every IconName from the sprite.',
      icon: 'abacus',
      group: 'Foundation',
    },
    {
      path: '/tokens',
      title: 'Design tokens',
      blurb: 'Colors, type, and mode accents from the theme.',
      icon: 'palette',
      group: 'Foundation',
    },
    {
      path: '/models',
      title: 'Shared models',
      blurb: 'Domain types shared across AIES packages.',
      icon: 'code',
      group: 'Foundation',
    },
  ];
}
