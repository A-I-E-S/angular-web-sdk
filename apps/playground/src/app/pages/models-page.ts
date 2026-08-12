import { Component } from '@angular/core';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  MODELS_API_RESPONSE,
  MODELS_ASYNC_STATE,
  MODELS_IMPORT,
  MODELS_MODE_CONFIG,
  MODELS_PAGINATION,
  MODELS_SHIPPING_MODE,
} from '../snippets';

interface ModelEntry {
  name: string;
  packagePath: string;
  description: string;
}

interface ModelGroup {
  id: string;
  title: string;
  hint: string;
  code: string;
  models: ModelEntry[];
}

/**
 *
 */
@Component({
  selector: 'app-models-page',
  standalone: true,
  imports: [PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Foundation"
        title="Models"
        description="TypeScript exports from @aies/aies-models — shared shapes with no Angular runtime. Open Show code on each section for wiring patterns."
      />

      <app-demo-section
        title="Import"
        hint="Types only — no Angular providers needed."
        [code]="importCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Use these shapes in feature state, API clients, and UI bindings (e.g.
          AsyncQueryState for aies-async-state, PaginationMeta for aies-pagination).
        </p>
      </app-demo-section>

      @for (group of groups; track group.id) {
        <app-demo-section
          [title]="group.title"
          [hint]="group.hint"
          [badge]="group.models.length + ''"
          [code]="group.code"
        >
          <div class="grid gap-3">
            @for (entry of group.models; track entry.name) {
              <article
                class="grid gap-3 rounded-xl border border-border bg-background-welcome p-4 dark:border-white/10 dark:bg-ink-950 sm:grid-cols-[8rem_1fr]"
              >
                <p
                  class="m-0 text-caption font-medium uppercase tracking-[0.12em] text-neutral-400"
                >
                  {{ entry.packagePath }}
                </p>
                <div class="flex flex-col gap-1">
                  <h2 class="m-0 font-mono text-body-sm font-medium text-ink dark:text-white">
                    {{ entry.name }}
                  </h2>
                  <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
                    {{ entry.description }}
                  </p>
                </div>
              </article>
            }
          </div>
        </app-demo-section>
      }
    </div>
  `,
})
export class ModelsPage {
  protected readonly importCode = MODELS_IMPORT;

  protected readonly groups: ModelGroup[] = [
    {
      id: 'api',
      title: 'API envelope',
      hint: 'Wrapped responses from ApiClient — every field is explicitly null when absent.',
      code: MODELS_API_RESPONSE,
      models: [
        {
          name: 'ApiResponseModel<T>',
          packagePath: 'api',
          description:
            'Canonical envelope: success, data, message, errors, pagination, statusCode.',
        },
        {
          name: 'ApiErrorDetail',
          packagePath: 'api',
          description: 'Field-level or global error detail on failed responses.',
        },
      ],
    },
    {
      id: 'pagination',
      title: 'Pagination & resources',
      hint: 'ResourceId conventions for getResource — list, all, or single record.',
      code: MODELS_PAGINATION,
      models: [
        {
          name: 'PaginationMeta',
          packagePath: 'api',
          description:
            'Response-side slice: currentPage, perPage, totals, hasNext/PreviousPage.',
        },
        {
          name: 'PaginationQueryParams',
          packagePath: 'api',
          description: 'Request-side page / size / order helpers for list fetches.',
        },
        {
          name: 'ResourceId',
          packagePath: 'api',
          description: "Path segment union: null (list) | 'all' | number (detail).",
        },
      ],
    },
    {
      id: 'async',
      title: 'Async query state',
      hint: 'UI snapshot for aies-async-state — mirrors TanStack Query signals.',
      code: MODELS_ASYNC_STATE,
      models: [
        {
          name: 'AsyncQueryState<T>',
          packagePath: 'async',
          description:
            'data, isLoading, isFetching, isError, error — map from injectQuery() or manual fetches.',
        },
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping mode',
      hint: 'STN / SFN literal — theme accents and x-shipment-mode header.',
      code: MODELS_SHIPPING_MODE,
      models: [
        {
          name: 'ShippingMode',
          packagePath: 'shipping',
          description: "Product mode literal: 'stn' | 'sfn'.",
        },
      ],
    },
    {
      id: 'mode-config',
      title: 'Mode config',
      hint: 'ModeConfigService fetches /public/mode/config, persists the record, resolves by country + STN/SFN.',
      code: MODELS_MODE_CONFIG,
      models: [
        {
          name: 'ModeConfigData',
          packagePath: 'mode',
          description: 'Top-level STN/SFN region, currency, and unit configuration.',
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
            'Mode-specific region maps — different country keys by design (ng vs us/cn/gb).',
        },
      ],
    },
  ];
}
