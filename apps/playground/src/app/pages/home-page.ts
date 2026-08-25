import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import { ModeColorService } from '@africanies/africanies-theme';
import { ButtonComponent } from '@africanies/africanies-ui';

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
    | 'globe'
    | 'filter'
    | 'tags'
    | 'book'
    | 'truck'
    | 'key';
  group: string;
}

/**
 * Playground landing — brand-forward overview of the SDK catalog.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, AfricaniesIconComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-12">
      <section class="relative overflow-hidden rounded-2xl bg-ink-brand text-white">
        <div class="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div class="flex flex-col gap-5">
            <p class="m-0 text-caption font-medium uppercase tracking-[0.16em] text-white/70">
              African Import Export Solutions
            </p>
            <h1 class="m-0 max-w-xl text-heading-1 text-white">
              The shared UI toolkit for Import &amp; Export apps.
            </h1>
            <p class="m-0 max-w-lg text-body-lg text-white/75">
              Owned by AFRICANIES for every product surface we ship. One Angular SDK —
              components, icons, tokens, and API wiring — with Import (STN) and
              Export (SFN) modes built in so accents and behavior match production.
            </p>
            <div class="flex flex-wrap gap-3">
              <a africanies-button routerLink="/components/button" class="!no-underline">
                Explore components
              </a>
              <a
                africanies-button
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
              <dt class="text-caption text-white/60">API services</dt>
              <dd class="m-0 mt-1 text-heading-3 text-white">6</dd>
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
              class="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 no-underline transition-colors hover:border-neutral-400 dark:border-white/10 dark:bg-ink dark:hover:border-white/25"
            >
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background-welcome text-ink dark:bg-ink-950 dark:text-white"
                  [class]="modeColor.classes().bgSubtle"
                >
                  <africanies-icon [name]="card.icon" [size]="20" />
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
      blurb: 'Primary, secondary, ghost, and danger actions — mode-colored primary.',
      icon: 'adjust',
      group: 'Components',
    },
    {
      path: '/components/alert',
      title: 'Alert',
      blurb: 'Inline page notices the user can dismiss — not fetch errors.',
      icon: 'info-circle',
      group: 'Components',
    },
    {
      path: '/components/chip',
      title: 'Chip',
      blurb: 'Status and category labels for tables, filters, and tags.',
      icon: 'tags',
      group: 'Components',
    },
    {
      path: '/components/action-menu',
      title: 'Action menu',
      blurb: 'Overflow (…) menu for row and toolbar actions.',
      icon: 'ellipsis-v',
      group: 'Components',
    },
    {
      path: '/components/feedback',
      title: 'Feedback states',
      blurb: 'Loading, error, empty, and AsyncState for query-driven regions.',
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
      blurb: 'Shared inputs with label, hint, error, and form binding.',
      icon: 'accordion-menu',
      group: 'Components',
    },
    {
      path: '/components/filters',
      title: 'Filters',
      blurb: 'Schema-driven list filter drawer and URL/HTTP serialize.',
      icon: 'filter',
      group: 'Components',
    },
    {
      path: '/components/tooltip',
      title: 'Tooltip',
      blurb: 'Short help beside dense labels and controls.',
      icon: 'info-circle',
      group: 'Components',
    },
    {
      path: '/components/toast',
      title: 'Toast',
      blurb: 'Corner messages after actions — timed, sticky errors, HTTP tags.',
      icon: 'warning',
      group: 'Components',
    },
    {
      path: '/components/navigation/overview',
      title: 'Navigation',
      blurb: 'App shell, side nav, breadcrumbs, tabs, and segments.',
      icon: 'panel',
      group: 'Components',
    },
    {
      path: '/components/table',
      title: 'Table & pagination',
      blurb: 'Presentational grid with template cells and server paging.',
      icon: 'align-justify',
      group: 'Components',
    },
    {
      path: '/components/stepper',
      title: 'Stepper',
      blurb: 'Multi-step wizards — linear or free navigation.',
      icon: 'warehouse',
      group: 'Components',
    },
    {
      path: '/usecases/shipment',
      title: 'Back button and Breadcrumbs',
      blurb: 'App-shell Back and breadcrumbs, plus a list that restores filters and page from the URL.',
      icon: 'truck',
      group: 'Use cases',
    },
    {
      path: '/usecases/onboarding/login',
      title: 'Forgot password',
      blurb: 'Email-only reset link from login. First-login default password is a separate screen.',
      icon: 'key',
      group: 'Use cases',
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
      blurb: 'Colors, type, and Import/Export accents from the theme.',
      icon: 'palette',
      group: 'Foundation',
    },
    {
      path: '/models',
      title: 'Shared models',
      blurb: 'Field shapes from @africanies/africanies-models — types only.',
      icon: 'code',
      group: 'Foundation',
    },
    {
      path: '/api',
      title: 'SDK API',
      blurb: 'How to call services — ResourceId, paths, and usage snippets.',
      icon: 'globe',
      group: 'Foundation',
    },
    {
      path: '/lecture',
      title: 'Lecture',
      blurb: 'Angular & RxJS concepts linked from Show code panels.',
      icon: 'book',
      group: 'Learn',
    },
  ];
}
