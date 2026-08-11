import { Component } from '@angular/core';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { MODELS_IMPORT } from '../snippets';

interface ModelEntry {
  name: string;
  packagePath: string;
  description: string;
}

@Component({
  selector: 'app-models-page',
  standalone: true,
  imports: [PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-8">
      <app-page-header
        eyebrow="Foundation"
        title="Models"
        description="Key TypeScript exports from @aies/aies-models — shared shapes with no Angular runtime."
      />

      <app-demo-section
        title="Import"
        hint="Types only — no Angular providers required."
        [code]="importCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Use these shapes in feature state, API clients, and UI bindings (e.g.
          AsyncQueryState for aies-async-state).
        </p>
      </app-demo-section>

      <div class="grid gap-3">
        @for (entry of models; track entry.name) {
          <article
            class="group grid gap-3 rounded-xl border border-border bg-white p-5 transition hover:border-neutral-400 dark:border-white/10 dark:bg-ink dark:hover:border-white/25 sm:grid-cols-[10rem_1fr]"
          >
            <p class="m-0 text-caption font-medium uppercase tracking-[0.12em] text-neutral-400">
              {{ entry.packagePath }}
            </p>
            <div class="flex flex-col gap-1.5">
              <h2 class="m-0 font-mono text-body font-medium text-ink dark:text-white">
                {{ entry.name }}
              </h2>
              <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
                {{ entry.description }}
              </p>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class ModelsPage {
  protected readonly importCode = MODELS_IMPORT;

  protected readonly models: ModelEntry[] = [
    {
      name: 'ApiResponseModel<T>',
      packagePath: 'api',
      description:
        'Canonical API envelope with success, data, message, errors, pagination, and statusCode — every field null-coalesced.',
    },
    {
      name: 'ApiErrorDetail',
      packagePath: 'api',
      description: 'Field-level or global error detail carried on failed responses.',
    },
    {
      name: 'PaginationMeta',
      packagePath: 'api',
      description:
        'List pagination slice: currentPage, perPage, totals, hasNext/PreviousPage.',
    },
    {
      name: 'PaginationQueryParams',
      packagePath: 'api',
      description: 'Request-side page / size / order helpers for list fetches.',
    },
    {
      name: 'ResourceId',
      packagePath: 'api',
      description: "Resource identifier union: number | 'all' | null.",
    },
    {
      name: 'ShippingMode',
      packagePath: 'shipping',
      description: "Active product mode literal: 'stn' | 'sfn'.",
    },
    {
      name: 'ModeConfigData',
      packagePath: 'mode',
      description: 'Top-level STN/SFN region, currency, and unit configuration payload.',
    },
    {
      name: 'ModeRegionConfig',
      packagePath: 'mode',
      description: 'Per-region currency symbol and measurement units.',
    },
    {
      name: 'ModeSfnConfig / ModeStnConfig',
      packagePath: 'mode',
      description:
        'Mode-specific region maps — intentionally different country key sets (ng vs us/cn/gb).',
    },
    {
      name: 'AsyncQueryState<T>',
      packagePath: 'async',
      description:
        'UI async snapshot (data, isLoading, isFetching, isError, error) for AsyncStateComponent.',
    },
  ];
}
