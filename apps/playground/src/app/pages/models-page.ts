import { Component } from '@angular/core';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  MODELS_API_RESPONSE,
  MODELS_ASYNC_STATE,
  MODELS_COUNTRY,
  MODELS_IMPORT,
  MODELS_MODE_CONFIG,
  MODELS_PAGINATION,
  MODELS_SHIPPING_MODE,
} from '../snippets';

interface ModelEntry {
  name: string;
  packagePath: string;
  description: string;
  /** TypeScript shape from `@aies/aies-models` (display-only). */
  structure: string;
}

interface ModelGroup {
  id: string;
  title: string;
  hint: string;
  code: string;
  models: ModelEntry[];
}

/**
 * Catalog of `@aies/aies-models` types with their field structures.
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
        description="Domain contracts for the AIES Web SDK — API envelopes, public utilities (countries), shipping/mode config, filters, and async UI snapshots. Interfaces use a *Model suffix. For live HTTP calls, see SDK API."
      />

      <app-demo-section
        title="Import"
        hint="Types only — no Angular providers needed. Prefer *Model names for domain shapes."
        [code]="importCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Shared across packages: ApiResponseModel for HTTP, CountryModel for
          utility reads, mode/filter configs for product rules, and
          AsyncQueryStateModel for aies-async-state. Live CountryService /
          ModeConfigService demos live under Foundation → SDK API.
        </p>
      </app-demo-section>

      @for (group of groups; track group.id) {
        <app-demo-section
          [title]="group.title"
          [hint]="group.hint"
          [badge]="group.models.length + ''"
          [code]="group.code"
        >
          <div class="grid gap-4">
            @for (entry of group.models; track entry.name) {
              <article
                class="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink sm:p-5"
              >
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 class="m-0 font-mono text-body font-medium text-ink dark:text-white">
                    {{ entry.name }}
                  </h2>
                  <p
                    class="m-0 text-caption font-medium uppercase tracking-[0.12em] text-neutral-400"
                  >
                    {{ entry.packagePath }}
                  </p>
                </div>
                <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
                  {{ entry.description }}
                </p>
                <pre
                  class="m-0 overflow-x-auto rounded-lg border border-border bg-[#1e1e1e] p-3 font-mono text-caption leading-relaxed text-[#d4d4d4] dark:border-white/10"
                ><code>{{ entry.structure }}</code></pre>
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
          structure: `interface ApiResponseModel<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: ApiErrorDetailModel[] | null;
  pagination: PaginationMetaModel | null;
  statusCode: number | null;
}`,
        },
        {
          name: 'ApiErrorDetailModel',
          packagePath: 'api',
          description: 'Field-level or global error detail on failed responses.',
          structure: `interface ApiErrorDetailModel {
  field: string | null;
  message: string;
  code: string | null;
}`,
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
          name: 'PaginationMetaModel',
          packagePath: 'api',
          description:
            'Response-side slice: currentPage, perPage, totals, hasNext/PreviousPage.',
          structure: `interface PaginationMetaModel {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}`,
        },
        {
          name: 'PaginationQueryParamsModel',
          packagePath: 'api',
          description: 'Request-side page / size / order helpers for list fetches.',
          structure: `interface PaginationQueryParamsModel {
  page?: number;
  size?: number;
  order?: string;
}`,
        },
        {
          name: 'ResourceId',
          packagePath: 'api',
          description: "Path segment union: null (list) | 'all' | number (detail).",
          structure: `type ResourceId = number | 'all' | null;`,
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
          name: 'AsyncQueryStateModel<T>',
          packagePath: 'async',
          description:
            'data, isLoading, isFetching, isError, error — map from injectQuery() or manual fetches.',
          structure: `interface AsyncQueryStateModel<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: string | null;
}`,
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
          structure: `type ShippingMode = 'stn' | 'sfn';`,
        },
      ],
    },
    {
      id: 'country',
      title: 'Country utility',
      hint: 'CountryService fetches /public/country/read/{id|all} — data is always CountryModel[].',
      code: MODELS_COUNTRY,
      models: [
        {
          name: 'CountryModel',
          packagePath: 'country',
          description:
            'Country record with ISO codes and nested states from the public utility API.',
          structure: `interface CountryModel {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  states: CountryStateModel[];
}`,
        },
        {
          name: 'CountryStateModel',
          packagePath: 'country',
          description:
            'Subdivision under a country — wire state_code maps to stateCode.',
          structure: `interface CountryStateModel {
  name: string;
  stateCode: string;
}`,
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
          name: 'ModeConfigDataModel',
          packagePath: 'mode',
          description: 'Top-level STN/SFN region, currency, and unit configuration.',
          structure: `interface ModeConfigDataModel {
  sfn: ModeSfnConfigModel;
  stn: ModeStnConfigModel;
}`,
        },
        {
          name: 'ModeRegionConfigModel',
          packagePath: 'mode',
          description: 'Per-region currency symbol and measurement units.',
          structure: `interface ModeRegionConfigModel {
  dimensionUnit: 'cm' | 'inches';
  massUnit: 'KG' | 'LBS';
  currency: 'NGN' | 'USD';
  currencySymbol: string;
}`,
        },
        {
          name: 'ModeSfnConfigModel',
          packagePath: 'mode',
          description: 'SFN region map — default + Nigeria (ng) only.',
          structure: `interface ModeSfnConfigModel {
  default: ModeRegionConfigModel;
  ng: ModeRegionConfigModel;
}`,
        },
        {
          name: 'ModeStnConfigModel',
          packagePath: 'mode',
          description: 'STN region map — default + us / cn / gb.',
          structure: `interface ModeStnConfigModel {
  default: ModeRegionConfigModel;
  us: ModeRegionConfigModel;
  cn: ModeRegionConfigModel;
  gb: ModeRegionConfigModel;
}`,
        },
      ],
    },
  ];
}
