import { Component } from '@angular/core';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  TOKENS_CORE,
  TOKENS_EXPORT,
  TOKENS_FEEDBACK,
  TOKENS_IMPORT,
  TOKENS_MODE_ACCENTS,
  TOKENS_NEUTRAL,
  TOKENS_SETUP,
  TOKENS_TYPE,
} from '../snippets';

interface TokenSwatch {
  name: string;
  bgClass: string;
  hex: string;
  group: string;
}

@Component({
  selector: 'app-tokens-page',
  standalone: true,
  imports: [PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Foundation"
        title="Design tokens"
        description="Colors and type from @aies/aies-theme/tailwind-preset. Toggle STN/SFN in the header to feel mode accents. Open Show code on each section for full implementation notes."
      />

      <app-demo-section
        title="Tailwind setup"
        hint="Required once per consuming app — without content paths, UI utility classes are purged."
        [code]="setupCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Extend the AIES theme preset and scan both your app sources and the
          published <span class="pg-code">@aies/aies-ui</span> bundle so JIT
          keeps classes used inside the library.
        </p>
      </app-demo-section>

      @for (group of groups; track group) {
        <app-demo-section
          [title]="group"
          [badge]="countIn(group) + ' tokens'"
          [code]="codeForGroup(group)"
        >
          <div
            class="grid gap-3"
            style="grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));"
          >
            @for (token of colorsIn(group); track token.name) {
              <div
                class="overflow-hidden rounded-xl border border-border dark:border-white/10"
              >
                <div
                  class="h-20 border-b border-border dark:border-white/10"
                  [class]="token.bgClass"
                ></div>
                <div class="bg-white px-3 py-2.5 dark:bg-ink">
                  <p class="m-0 text-body-sm font-medium text-ink dark:text-white">
                    {{ token.name }}
                  </p>
                  <p class="m-0 mt-0.5 font-mono text-caption text-neutral-600">
                    {{ token.hex }}
                  </p>
                </div>
              </div>
            }
          </div>
        </app-demo-section>
      }

      <app-demo-section
        title="Typography scale"
        hint="Provisional sizes — flagged for design confirmation."
        [code]="typeCode"
      >
        <ul class="m-0 flex list-none flex-col gap-5 p-0">
          <li>
            <p class="pg-kicker m-0 mb-1">heading-1 · 2.5rem / 700</p>
            <p class="m-0 text-heading-1 text-ink dark:text-white">Ship across continents</p>
          </li>
          <li>
            <p class="pg-kicker m-0 mb-1">heading-2 · 2rem / 700</p>
            <p class="m-0 text-heading-2 text-ink dark:text-white">Shipment details</p>
          </li>
          <li>
            <p class="pg-kicker m-0 mb-1">heading-3 · 1.5rem / 600</p>
            <p class="m-0 text-heading-3 text-ink dark:text-white">Cargo summary</p>
          </li>
          <li>
            <p class="pg-kicker m-0 mb-1">body-lg</p>
            <p class="m-0 text-body-lg text-ink dark:text-white">
              Supporting sentence for denser marketing or empty states.
            </p>
          </li>
          <li>
            <p class="pg-kicker m-0 mb-1">body</p>
            <p class="m-0 text-body text-ink dark:text-white">
              Default reading size for forms, tables, and dialogs.
            </p>
          </li>
          <li>
            <p class="pg-kicker m-0 mb-1">body-sm</p>
            <p class="m-0 text-body-sm text-neutral-600">Secondary copy and dense metadata.</p>
          </li>
          <li>
            <p class="pg-kicker m-0 mb-1">caption</p>
            <p class="m-0 text-caption text-neutral-600">Hints, timestamps, and chip labels.</p>
          </li>
        </ul>
      </app-demo-section>

      <app-demo-section
        title="Mode accents in situ"
        muted
        [code]="modeAccentsCode"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-export-subtle p-5">
            <p class="m-0 text-caption font-medium uppercase tracking-wide text-export">SFN / export</p>
            <p class="mt-2 m-0 text-heading-3 text-ink dark:text-ink">Lagos outbound</p>
            <p class="mt-1 m-0 text-body-sm text-neutral-600">Uses export green tokens.</p>
          </div>
          <div class="rounded-xl bg-import-subtle p-5">
            <p class="m-0 text-caption font-medium uppercase tracking-wide text-import">STN / import</p>
            <p class="mt-2 m-0 text-heading-3 text-ink dark:text-ink">US inbound</p>
            <p class="mt-1 m-0 text-body-sm text-neutral-600">Uses import orange tokens.</p>
          </div>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class TokensPage {
  protected readonly groups = [
    'Core',
    'Neutral',
    'Export (SFN)',
    'Import (STN)',
    'Feedback',
  ];

  protected readonly setupCode = TOKENS_SETUP;
  protected readonly typeCode = TOKENS_TYPE;
  protected readonly modeAccentsCode = TOKENS_MODE_ACCENTS;

  protected readonly groupCode: Record<string, string> = {
    Core: TOKENS_CORE,
    Neutral: TOKENS_NEUTRAL,
    'Export (SFN)': TOKENS_EXPORT,
    'Import (STN)': TOKENS_IMPORT,
    Feedback: TOKENS_FEEDBACK,
  };

  protected codeForGroup(group: string): string {
    return this.groupCode[group] ?? this.setupCode;
  }

  protected readonly colors: TokenSwatch[] = [
    { name: 'black', bgClass: 'bg-black', hex: '#000000', group: 'Core' },
    { name: 'white', bgClass: 'bg-white', hex: '#ffffff', group: 'Core' },
    { name: 'ink', bgClass: 'bg-ink', hex: '#212529', group: 'Core' },
    { name: 'ink-blue', bgClass: 'bg-ink-blue', hex: '#192a3e', group: 'Core' },
    { name: 'ink-brand', bgClass: 'bg-ink-brand', hex: '#1c2b3f', group: 'Core' },
    { name: 'ink-950', bgClass: 'bg-ink-950', hex: '#272729', group: 'Core' },
    { name: 'neutral-300', bgClass: 'bg-neutral-300', hex: '#c9d5e1', group: 'Neutral' },
    { name: 'neutral-400', bgClass: 'bg-neutral-400', hex: '#a9b5cb', group: 'Neutral' },
    { name: 'neutral-600', bgClass: 'bg-neutral-600', hex: '#667185', group: 'Neutral' },
    { name: 'border', bgClass: 'bg-border', hex: '#f0f2f5', group: 'Neutral' },
    {
      name: 'background-welcome',
      bgClass: 'bg-background-welcome',
      hex: '#f9fafb',
      group: 'Neutral',
    },
    { name: 'export', bgClass: 'bg-export', hex: '#1cbd5d', group: 'Export (SFN)' },
    { name: 'export-light', bgClass: 'bg-export-light', hex: '#24dc6d', group: 'Export (SFN)' },
    { name: 'export-subtle', bgClass: 'bg-export-subtle', hex: '#e4fff3', group: 'Export (SFN)' },
    { name: 'export-tint', bgClass: 'bg-export-tint', hex: '#f2fff8', group: 'Export (SFN)' },
    { name: 'import', bgClass: 'bg-import', hex: '#f08829', group: 'Import (STN)' },
    { name: 'import-light', bgClass: 'bg-import-light', hex: '#ffa95b', group: 'Import (STN)' },
    { name: 'import-subtle', bgClass: 'bg-import-subtle', hex: '#fffcef', group: 'Import (STN)' },
    { name: 'danger', bgClass: 'bg-danger', hex: '#ff001c', group: 'Feedback' },
    { name: 'danger-dark', bgClass: 'bg-danger-dark', hex: '#b41433', group: 'Feedback' },
    { name: 'danger-strong', bgClass: 'bg-danger-strong', hex: '#C00B19', group: 'Feedback' },
    { name: 'danger-subtle', bgClass: 'bg-danger-subtle', hex: '#FFF2F2', group: 'Feedback' },
    { name: 'warning', bgClass: 'bg-warning', hex: '#DBB316', group: 'Feedback' },
    { name: 'warning-dark', bgClass: 'bg-warning-dark', hex: '#EF8833', group: 'Feedback' },
    { name: 'warning-subtle', bgClass: 'bg-warning-subtle', hex: '#FFF6E6', group: 'Feedback' },
  ];

  protected colorsIn(group: string): TokenSwatch[] {
    return this.colors.filter((c) => c.group === group);
  }

  protected countIn(group: string): number {
    return this.colorsIn(group).length;
  }
}
