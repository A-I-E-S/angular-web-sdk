import { Component } from '@angular/core';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  MODELS_API_RESPONSE,
  MODELS_ASYNC_STATE,
  MODELS_COUNTRY,
  MODELS_FILE,
  MODELS_IMPORT,
  MODELS_MODE_CONFIG,
  MODELS_PAGINATION,
  MODELS_PRODUCT,
  MODELS_SHIPMENT_METHOD,
  MODELS_SHIPPING_MODE,
  MODELS_USER,
  MODELS_WAREHOUSE,
  MODELS_ZONE,
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
        description="TypeScript contracts shared across the SDK — API envelopes, countries, warehouses, products, files, mode config, filters, and async UI state. Names end in *Model. Types only (no Angular providers). For service usage snippets, open SDK API."
      />

      <app-demo-section
        title="Import"
        hint="Pull shapes from @aies/aies-models in any app or library. No providers required — these are interfaces and helpers only."
        [code]="importCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Shared across packages: ApiResponseModel for HTTP, CountryModel and
          ShipmentMethodModel for utility reads, mode/filter configs for product
          rules, and AsyncQueryStateModel for aies-async-state. Service paths and
          usage examples live under Foundation → SDK API.
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
      hint: 'How every SDK HTTP call is wrapped — success, data, message, errors, pagination.',
      code: MODELS_API_RESPONSE,
      models: [
        {
          name: 'ApiResponseModel<T>',
          packagePath: 'api',
          description:
            'Canonical envelope: success, data, message, errors, pagination, status_code.',
          structure: `interface ApiResponseModel<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: ApiErrorDetailModel[] | null;
  pagination: PaginationMetaModel | null;
  status_code: number | null;
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
      hint: 'ResourceId path segments for every list GET — null (page), all, or number — plus page query helpers.',
      code: MODELS_PAGINATION,
      models: [
        {
          name: 'PaginationMetaModel',
          packagePath: 'api',
          description:
            'Response-side slice: current_page, per_page, totals, has_next/previous_page.',
          structure: `interface PaginationMetaModel {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}`,
        },
        {
          name: 'PaginationQueryParamsModel',
          packagePath: 'api',
          description: 'Request-side page / size / order — only used when ResourceId is null.',
          structure: `interface PaginationQueryParamsModel {
  page?: number;
  size?: number;
  order?: string;
}`,
        },
        {
          name: 'ResourceId',
          packagePath: 'api',
          description:
            "null → paginated list · 'all' → full dump · number → single record. Use getResourcePage / getResourceAll / getResourceById for custom routes.",
          structure: `type ResourceId = number | 'all' | null;
// null  → GET {base}           (+ page/size/order)
// 'all' → GET {base}/all
// 42    → GET {base}/42`,
        },
      ],
    },
    {
      id: 'async',
      title: 'Async query state',
      hint: 'Snapshot you pass to aies-async-state — loading, fetching, error, and data in one object.',
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
      hint: 'Import (STN) vs Export (SFN) — drives theme accents and the x-shipment-mode header.',
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
      hint: 'Country list and detail from the public utility API — ISO codes and nested states.',
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
            'Subdivision under a country — wire `state_code`.',
          structure: `interface CountryStateModel {
  name: string;
  state_code: string;
}`,
        },
      ],
    },
    {
      id: 'shipment-method',
      title: 'Shipment methods / carriers',
      hint: 'Carrier / method records with delivery windows, limits, and zone pricing pages.',
      code: MODELS_SHIPMENT_METHOD,
      models: [
        {
          name: 'ShipmentMethodModel',
          packagePath: 'shipment-method',
          description:
            'Carrier record with delivery windows, weight/dim limits, discounts, and zone_values page.',
          structure: `interface ShipmentMethodModel {
  id: number;
  name: string;
  slug: string;
  mode: ShippingMode;
  sea_only: boolean;
  // …commercial + dimension fields
  zone_values: ShipmentMethodZonePageModel;
}`,
        },
        {
          name: 'ShipmentMethodZonePageModel',
          packagePath: 'shipment-method',
          description:
            'First Laravel page of zone links embedded on a method (`data` + total/last_page).',
          structure: `interface ShipmentMethodZonePageModel {
  data: ShipmentMethodZoneLinkModel[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}`,
        },
      ],
    },
    {
      id: 'warehouse',
      title: 'Warehouses',
      hint: 'Warehouse locations with address, charges, and nested country/state.',
      code: MODELS_WAREHOUSE,
      models: [
        {
          name: 'WarehouseModel',
          packagePath: 'warehouse',
          description:
            'Warehouse with address, geo, storage/delivery charges, and nested CountryModel.',
          structure: `interface WarehouseModel {
  id: number;
  name: string;
  city: string;
  zip_code: string;
  country: CountryModel | null;
  state: WarehouseStateModel | null;
  api_enabled: boolean;
  // …charges, geo, flags
}`,
        },
        {
          name: 'WarehouseStateModel',
          packagePath: 'warehouse',
          description:
            'Selected subdivision on the warehouse — wire state_code / country_code.',
          structure: `interface WarehouseStateModel {
  id: number;
  name: string;
  state_code: string;
  country: string;
  country_code: string;
}`,
        },
      ],
    },
    {
      id: 'zone',
      title: 'Zones',
      hint: 'Shipping zones used for routing and pricing.',
      code: MODELS_ZONE,
      models: [
        {
          name: 'ZoneModel',
          packagePath: 'zone',
          description: 'Shipping zone record (name, type, active, timestamps).',
          structure: `interface ZoneModel {
  id: number;
  name: string;
  type: string;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}`,
        },
      ],
    },
    {
      id: 'product',
      title: 'Products',
      hint: 'Catalog products from GET /product/read/{id|all} — HS codes, document/ETW labels.',
      code: MODELS_PRODUCT,
      models: [
        {
          name: 'ProductModel',
          packagePath: 'product',
          description:
            'Product record (snake_case) with HS codes and document detail labels.',
          structure: `interface ProductModel {
  id: number;
  account_id: number | null;
  product_category_id: number | null;
  hs_code: string;
  hs_code_10: string | null;
  hs_code_8: string | null;
  hs_code_6: string | null;
  name: string;
  value: number;
  usage: number;
  document_ids: number[] | null;
  etw_ids: number[] | null;
  active: boolean;
  is_external: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  document_details: string[];
  etw_document_details: string[];
  zone_product_required_documents: ApiJsonValue[];
}`,
        },
      ],
    },
    {
      id: 'file',
      title: 'Files',
      hint: 'Document payload from POST /file/read — single object in data (not a list).',
      code: MODELS_FILE,
      models: [
        {
          name: 'FileReadRequestModel',
          packagePath: 'file',
          description: 'Request body for FileService.read / readByBody.',
          structure: `interface FileReadRequestModel {
  ref: string;
}`,
        },
        {
          name: 'FileReadModel',
          packagePath: 'file',
          description:
            'Envelope data object — prefer url for downloads; base_64 can be large.',
          structure: `interface FileReadModel {
  mime_type: string;
  base_64: string;
  url: string;
}`,
        },
      ],
    },
    {
      id: 'user',
      title: 'Current user',
      hint: 'Authenticated profile from GET /user — after login, call AuthTokenService.set then UserService.me().',
      code: MODELS_USER,
      models: [
        {
          name: 'UserModel',
          packagePath: 'user',
          description:
            'Authenticated profile (snake_case wire keys) with nested country, business_account, and account_manager.',
          structure: `interface UserModel {
  id?: number | null;
  central_id?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  country?: UserCountryModel | null;
  state?: string | null;
  main_region?: string | null;
  shipping_type?: ShippingType | null;
  business_account?: UserBusinessAccountModel | null;
  account_manager?: UserAccountManagerModel | null;
  // …verification, flags, accounts
}`,
        },
        {
          name: 'UserBusinessAccountModel',
          packagePath: 'user',
          description: 'Optional business account with plan + subscription.',
          structure: `interface UserBusinessAccountModel {
  id?: number | null;
  name?: string | null;
  type?: AccountType | null;
  plan?: UserPlanModel | null;
  subscription?: UserSubscriptionModel | null;
  // …
}`,
        },
        {
          name: 'UserCountryModel',
          packagePath: 'user',
          description: 'Country nested on the profile — states use state_code.',
          structure: `interface UserCountryModel {
  id?: number | null;
  name?: string | null;
  iso2?: string | null;
  states?: UserStateModel[] | null;
}`,
        },
      ],
    },
    {
      id: 'mode-config',
      title: 'Mode config',
      hint: 'Per-mode region currency and units (loaded at startup or on demand).',
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
  dimension_unit: 'cm' | 'inches';
  mass_unit: 'KG' | 'LBS';
  currency: 'NGN' | 'USD';
  currency_symbol: string;
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
