import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { MODELS_IMPORT } from '../snippets';

interface ModelEntry {
  name: string;
  packagePath: string;
  description: string;
  /** TypeScript shape from `@africanies/africanies-models` (display-only). */
  structure: string;
}

interface ModelGroup {
  id: string;
  title: string;
  hint: string;
  models: ModelEntry[];
  /** Optional link to the matching SDK API service/group. */
  apiFragment?: string;
  apiLabel?: string;
}

interface ModelCategory {
  id: string;
  title: string;
  hint: string;
  groups: ModelGroup[];
}

/**
 * Shape catalog for `@africanies/africanies-models`.
 * How to call services lives on the SDK API page.
 */
@Component({
  selector: 'app-models-page',
  standalone: true,
  imports: [PageHeaderComponent, DemoSectionComponent, RouterLink],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Foundation"
        title="Models"
        description="TypeScript contracts from @africanies/africanies-models — field shapes only. Names end in *Model. For paths, ResourceId, and Show code usage, open Foundation → SDK API."
      />

      <app-demo-section
        title="Import"
        hint="Pull shapes from @africanies/africanies-models in any app or library. No providers required."
        [code]="importCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Types only — no Angular providers. Service calls and snippets live on
          <a
            class="font-medium text-ink underline-offset-2 hover:underline dark:text-white"
            routerLink="/api"
            >SDK API</a
          >.
        </p>
      </app-demo-section>

      @for (category of categories; track category.id) {
        <section class="flex flex-col gap-6" [attr.id]="category.id">
          <div
            class="flex flex-col gap-1 border-b border-border pb-3 dark:border-white/10"
          >
            <h2 class="m-0 text-heading-3 text-ink dark:text-white">
              {{ category.title }}
            </h2>
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ category.hint }}
            </p>
          </div>

          @for (group of category.groups; track group.id) {
            <app-demo-section
              [anchorId]="group.id"
              [title]="group.title"
              [hint]="group.hint"
              [badge]="group.models.length + ''"
            >
              @if (group.apiFragment) {
                <p class="mb-4 mt-0 text-caption text-neutral-500 dark:text-neutral-400">
                  How to call:
                  <a
                    class="font-medium text-ink underline-offset-2 hover:underline dark:text-white"
                    routerLink="/api"
                    [fragment]="group.apiFragment"
                    >{{ group.apiLabel ?? 'SDK API' }}</a
                  >
                </p>
              }

              <div class="grid gap-4">
                @for (entry of group.models; track entry.name) {
                  <article
                    class="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink-950 sm:p-5"
                  >
                    <div
                      class="flex flex-wrap items-baseline justify-between gap-2"
                    >
                      <h3
                        class="m-0 font-mono text-body font-medium text-ink dark:text-white"
                      >
                        {{ entry.name }}
                      </h3>
                      <p
                        class="m-0 text-caption font-medium uppercase tracking-[0.12em] text-neutral-400"
                      >
                        {{ entry.packagePath }}
                      </p>
                    </div>
                    <p
                      class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400"
                    >
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
        </section>
      }
    </div>
  `,
})
export class ModelsPage {
  protected readonly importCode = MODELS_IMPORT;

  protected readonly categories: ModelCategory[] = [
    {
      id: 'core',
      title: 'Core contracts',
      hint: 'Shared envelopes, pagination, async UI state, and shipping mode.',
      groups: [
        {
          id: 'api',
          title: 'API envelope',
          hint: 'How every SDK HTTP call is wrapped — success, data, message, errors, pagination.',
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
          title: 'Pagination & ResourceId',
          hint: 'List GET id segments and page metadata — usage on SDK API → ResourceId.',
          apiFragment: 'resource-id',
          apiLabel: 'ResourceId',
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
              description:
                'Request-side page / size / order — only when ResourceId is null. SDK default size is 15 (UI: 5 / 15 / 30); notifications use 30.',
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
                "null → paginated · 'all' → full dump · number → single record.",
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
          hint: 'Snapshot for africanies-async-state — loading, fetching, error, and data.',
          models: [
            {
              name: 'AsyncQueryStateModel<T>',
              packagePath: 'async',
              description:
                'data, isLoading, isFetching, isError, error — map from injectQuery() or fetches.',
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
          hint: 'Import (STN) vs Export (SFN) — theme accents and x-shipment-mode.',
          models: [
            {
              name: 'ShippingMode',
              packagePath: 'shipping',
              description: "Product mode literal: 'stn' | 'sfn'.",
              structure: `type ShippingMode = 'stn' | 'sfn';`,
            },
          ],
        },
      ],
    },
    {
      id: 'reference-data',
      title: 'Reference data',
      hint: 'Shapes returned by ResourceId catalog services.',
      groups: [
        {
          id: 'country',
          title: 'Countries',
          hint: 'Country list/detail — ISO codes and nested states.',
          apiFragment: 'country',
          apiLabel: 'CountryService',
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
              description: 'Subdivision under a country — wire `state_code`.',
              structure: `interface CountryStateModel {
  name: string;
  state_code: string;
}`,
            },
          ],
        },
        {
          id: 'service',
          title: 'Services',
          hint: 'Public subscription/add-on catalog — App Settings Services board.',
          apiFragment: 'service',
          apiLabel: 'ServiceService',
          models: [
            {
              name: 'ServiceModel',
              packagePath: 'service',
              description:
                'Service catalog record (snake_case) from GET /public/service/read.',
              structure: `interface ServiceModel {
  id: number;
  name: string;
  description: string | null;
  model: string;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}`,
            },
          ],
        },
        {
          id: 'document',
          title: 'Documents',
          hint: 'Catalog by document id — bind readById preview as doc.file_ref.base_64. Raw file_ref strings → FileService.',
          apiFragment: 'document',
          apiLabel: 'DocumentService',
          models: [
            {
              name: 'DocumentModel',
              packagePath: 'document',
              description:
                'GET /public/document/read/{id} — preview bytes live on nested file_ref.',
              structure: `interface DocumentModel {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  file_ref: FileReadModel | null;
}`,
            },
          ],
        },
        {
          id: 'plan',
          title: 'Plans',
          hint: 'Public subscription plans with nested packages.',
          apiFragment: 'plan',
          apiLabel: 'PlanService',
          models: [
            {
              name: 'PlanModel',
              packagePath: 'plan',
              description:
                'Plan catalog record with nested PlanPackageModel rows.',
              structure: `interface PlanModel {
  id: number;
  name: string;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  packages: PlanPackageModel[];
}`,
            },
            {
              name: 'PlanPackageModel',
              packagePath: 'plan',
              description:
                'Line item under a plan — pricing tiers and linked company_service_id.',
              structure: `interface PlanPackageModel {
  id: number;
  plan_id: number | null;
  company_service_id: number | null;
  name: string;
  metrics: string | null;
  volume: number | null;
  discount: string | null;
  model: string | null;
  monthly: string | null;
  quarterly: string | null;
  biannually: string | null;
  annually: string | null;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}`,
            },
          ],
        },
        {
          id: 'currency',
          title: 'Currencies',
          hint: 'App Settings currencies — rates, flags, nested processors, and create/update/delete bodies.',
          apiFragment: 'currency',
          apiLabel: 'CurrencyService',
          models: [
            {
              name: 'CurrencyModel',
              packagePath: 'currency',
              description:
                'Currency record (snake_case) with wire rate strings and payment methods. is_naira_greater is the same flag as is_local_currency_greater.',
              structure: `interface CurrencyModel {
  id: number;
  name: string;
  short_code: string;
  division_rate: string;
  multiplication_rate: string;
  is_local_currency_greater: boolean;
  is_naira_greater: boolean;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  payment_methods: CurrencyPaymentMethodModel[];
}`,
            },
            {
              name: 'CurrencyPaymentMethodModel',
              packagePath: 'currency',
              description:
                'Processor attached to a currency (Paystack, Stripe, …) plus pivot ids.',
              structure: `interface CurrencyPaymentMethodModel {
  id: number;
  name: string;
  model: string;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  pivot: CurrencyPaymentMethodPivotModel;
}`,
            },
            {
              name: 'CurrencyPaymentMethodPivotModel',
              packagePath: 'currency',
              description: 'Join keys on currency ↔ payment-method pivots.',
              structure: `interface CurrencyPaymentMethodPivotModel {
  currency_id: number;
  payment_method_id: number;
}`,
            },
            {
              name: 'CurrencyCreateRequestModel',
              packagePath: 'currency',
              description:
                'POST /currency/create. name / short_code come from the host currency list. Flags may be boolean or "1" / "0".',
              structure: `interface CurrencyCreateRequestModel {
  name: string;
  short_code: string;
  multiplication_rate: string;
  division_rate: string;
  active: boolean | CurrencyFlag01;
  is_naira_greater: boolean | CurrencyFlag01;
  payment_method_ids: number[];
}`,
            },
            {
              name: 'CurrencyUpdateRequestModel',
              packagePath: 'currency',
              description:
                'PUT /currency/update — id, rates, flags, payment_method_ids. Name and short code are not sent.',
              structure: `interface CurrencyUpdateRequestModel {
  id: number;
  multiplication_rate: string;
  division_rate: string;
  active: boolean | CurrencyFlag01;
  is_naira_greater: boolean | CurrencyFlag01;
  payment_method_ids: number[];
}`,
            },
            {
              name: 'CurrencyDeleteRequestModel',
              packagePath: 'currency',
              description:
                'DELETE /currency/delete JSON body. CurrencyService.remove also accepts a bare id.',
              structure: `interface CurrencyDeleteRequestModel {
  id: number;
}`,
            },
          ],
        },
        {
          id: 'payment-method',
          title: 'Payment methods',
          hint: 'App Settings processors — read + active toggle only (no create/delete). Nested currencies they accept.',
          apiFragment: 'payment-method',
          apiLabel: 'PaymentMethodService',
          models: [
            {
              name: 'PaymentMethodModel',
              packagePath: 'payment-method',
              description:
                'Processor record (snake_case) with nested currencies and pivot ids.',
              structure: `interface PaymentMethodModel {
  id: number;
  name: string;
  model: string;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  currencies: PaymentMethodCurrencyModel[];
}`,
            },
            {
              name: 'PaymentMethodCurrencyModel',
              packagePath: 'payment-method',
              description:
                'Currency nested on a processor — same rate fields as CurrencyModel plus pivot.',
              structure: `interface PaymentMethodCurrencyModel {
  id: number;
  name: string;
  short_code: string;
  division_rate: string;
  multiplication_rate: string;
  is_local_currency_greater: boolean;
  is_naira_greater: boolean;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  pivot: CurrencyPaymentMethodPivotModel;
}`,
            },
            {
              name: 'PaymentMethodUpdateRequestModel',
              packagePath: 'payment-method',
              description:
                'PUT /payment_method/update — id, name, model, active. Name/model are resent from the row; only active is edited (status switch).',
              structure: `interface PaymentMethodUpdateRequestModel {
  id: number;
  name: string;
  model: string;
  active: boolean | PaymentMethodFlag01;
}`,
            },
          ],
        },
        {
          id: 'shipment-method',
          title: 'Shipment methods / carriers',
          hint: 'Carrier records with delivery windows, limits, and zone pages.',
          apiFragment: 'shipment-method',
          apiLabel: 'ShipmentMethodService',
          models: [
            {
              name: 'ShipmentMethodModel',
              packagePath: 'shipment-method',
              description:
                'Carrier with delivery windows, weight/dim limits, discounts, and zone_values.',
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
                'First Laravel page of zone links on a method (`data` + totals).',
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
          hint: 'Locations with address, charges, and nested country/state.',
          apiFragment: 'warehouse',
          apiLabel: 'WarehouseService',
          models: [
            {
              name: 'WarehouseModel',
              packagePath: 'warehouse',
              description:
                'Warehouse with address, geo, charges, and nested CountryModel.',
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
                'Selected subdivision — wire state_code / country_code.',
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
          hint: 'Shipping zones for routing and pricing.',
          apiFragment: 'zone',
          apiLabel: 'ZoneService',
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
          hint: 'Catalog products — HS codes and document / ETW labels.',
          apiFragment: 'product',
          apiLabel: 'ProductService',
          models: [
            {
              name: 'ProductModel',
              packagePath: 'product',
              description:
                'Product record (snake_case) with HS codes and document labels.',
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
      ],
    },
    {
      id: 'session-config',
      title: 'Session & config',
      hint: 'Auth email flows, authenticated user profile, and STN/SFN region units.',
      groups: [
        {
          id: 'auth',
          title: 'Auth',
          hint: 'POST /auth/forgot/password — email only; backend emails a reset link. This frontend does not handle that link.',
          apiFragment: 'auth',
          apiLabel: 'AuthService',
          models: [
            {
              name: 'ForgotPasswordRequestModel',
              packagePath: 'auth',
              description:
                'Request body for AuthService.forgot. Response data is typically []. Same call from login and admin user/partner screens.',
              structure: `interface ForgotPasswordRequestModel {
  email: string;
}`,
            },
          ],
        },
        {
          id: 'user',
          title: 'Current user',
          hint: 'Profile from GET /user after AuthTokenService.set. default_password → /onboarding/reset-password (change password), not the email-link flow.',
          apiFragment: 'user',
          apiLabel: 'UserService',
          models: [
            {
              name: 'UserModel',
              packagePath: 'user',
              description:
                'Authenticated profile (snake_case) with nested country and accounts.',
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
  default_password?: boolean | null;
  // …verification, flags, accounts
}`,
            },
            {
              name: 'ChangePasswordRequestModel',
              packagePath: 'user',
              description:
                'POST /user/change/password after first login when default_password is set.',
              structure: `interface ChangePasswordRequestModel {
  current_password: string;
  password: string;
  password_confirmation: string;
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
              description: 'Country on the profile — states use state_code.',
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
          id: 'notification',
          title: 'Notifications',
          hint: 'Authenticated inbox rows from GET /user/notifications/read/all.',
          apiFragment: 'notification',
          apiLabel: 'NotificationService',
          models: [
            {
              name: 'NotificationModel',
              packagePath: 'notification',
              description:
                'Laravel database notification with parsed data payload.',
              structure: `interface NotificationModel {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationPayloadModel;
  read_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}`,
            },
            {
              name: 'NotificationPayloadModel',
              packagePath: 'notification',
              description:
                'Parsed JSON from the data column — title, body, link, image.',
              structure: `interface NotificationPayloadModel {
  user_id?: number | null;
  title: string;
  body?: string | null;
  link?: string | null;
  image?: string | null;
  external_link?: boolean | null;
}`,
            },
            {
              name: 'NotificationInboxItemModel',
              packagePath: 'notification',
              description:
                'Compact header/drawer item from mapNotificationInboxItem().',
              structure: `interface NotificationInboxItemModel {
  id: string;
  title: string;
  body?: string;
  timestamp?: string;
  read?: boolean;
  link?: string;
  external_link?: boolean;
  image?: string | null;
}`,
            },
          ],
        },
        {
          id: 'mode-config',
          title: 'Mode config',
          hint: 'Per-mode region currency and units.',
          apiFragment: 'mode-config',
          apiLabel: 'ModeConfigService',
          models: [
            {
              name: 'ModeConfigDataModel',
              packagePath: 'mode',
              description: 'Top-level STN/SFN region, currency, and unit config.',
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
              description: 'SFN region map — default + Nigeria (ng).',
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
      ],
    },
    {
      id: 'files',
      title: 'Files',
      hint: 'Single-object file payload — not a list.',
      groups: [
        {
          id: 'file',
          title: 'File read',
          hint: 'POST /file/read — data is one FileReadModel.',
          apiFragment: 'file',
          apiLabel: 'FileService',
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
      ],
    },
  ];
}
