import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  COUNTRY_READ_PATH,
  FILE_READ_PATH,
  MODE_CONFIG_PATH,
  PRODUCT_READ_PATH,
  SHIPMENT_METHOD_READ_PATH,
  USER_PATH,
  WAREHOUSE_READ_PATH,
  ZONE_READ_PATH,
} from '@aies/aies-core';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  API_COUNTRY,
  API_FILE,
  API_MODE_CONFIG,
  API_OVERVIEW,
  API_PRODUCT,
  API_SHIPMENT_METHOD,
  API_USER,
  API_WAREHOUSE,
  API_ZONE,
} from '../snippets';

interface ResourceIdRow {
  id: string;
  meaning: string;
  path: string;
  serviceCall: string;
  customCall: string;
}

interface ApiServiceEntry {
  id: string;
  title: string;
  hint: string;
  path: string;
  /** Models page fragment for the matching shape group. */
  modelAnchor: string;
  modelLabel: string;
  resourceCalls?: {
    page: string;
    all: string;
    byId: string;
  };
  returns?: string;
  code: string;
}

interface ApiServiceGroup {
  id: string;
  title: string;
  hint: string;
  services: ApiServiceEntry[];
}

/**
 * How-to catalog for `@aies/aies-core` HTTP services.
 * Field shapes live on the Models page.
 */
@Component({
  selector: 'app-api-page',
  standalone: true,
  imports: [PageHeaderComponent, DemoSectionComponent, RouterLink],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Foundation"
        title="SDK API"
        description="How to call built-in services and custom list GETs. Bootstrap once, learn ResourceId, then pick a service. Field shapes live under Foundation → Models."
      />

      <app-demo-section
        title="Bootstrap"
        hint="Wire the SDK once: provideAiesSdk (base URL) and provideAiesHttpClient (interceptors). Relative paths resolve against baseUrl."
        [code]="overviewCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          After setup, inject a domain service below — or use ApiClient helpers for
          custom routes.
        </p>
      </app-demo-section>

      <app-demo-section
        anchorId="resource-id"
        title="ResourceId"
        hint="Every list-style GET uses the same id segment. Built-in reference services and custom ApiClient calls share this rule."
      >
        <div class="flex flex-col gap-5">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[36rem] border-collapse text-left text-body-sm">
              <thead>
                <tr
                  class="border-b border-border text-caption uppercase tracking-wide text-neutral-500 dark:border-white/10"
                >
                  <th class="py-2 pr-4 font-medium">id</th>
                  <th class="py-2 pr-4 font-medium">Meaning</th>
                  <th class="py-2 pr-4 font-medium">Path</th>
                  <th class="py-2 pr-4 font-medium">Service</th>
                  <th class="py-2 font-medium">Custom</th>
                </tr>
              </thead>
              <tbody>
                @for (row of resourceIdRows; track row.id) {
                  <tr
                    class="border-b border-border/70 last:border-0 dark:border-white/10"
                  >
                    <td class="py-3 pr-4 align-top">
                      <code class="font-mono text-ink dark:text-white">{{
                        row.id
                      }}</code>
                    </td>
                    <td
                      class="py-3 pr-4 align-top text-neutral-600 dark:text-neutral-400"
                    >
                      {{ row.meaning }}
                    </td>
                    <td class="py-3 pr-4 align-top">
                      <code
                        class="font-mono text-caption text-ink dark:text-white"
                        >{{ row.path }}</code
                      >
                    </td>
                    <td class="py-3 pr-4 align-top">
                      <code
                        class="font-mono text-caption text-ink dark:text-white"
                        >{{ row.serviceCall }}</code
                      >
                    </td>
                    <td class="py-3 align-top">
                      <code
                        class="font-mono text-caption text-ink dark:text-white"
                        >{{ row.customCall }}</code
                      >
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <p class="m-0 text-caption text-neutral-500 dark:text-neutral-400">
            Paginated calls may send
            <code class="font-mono">page</code> /
            <code class="font-mono">size</code> /
            <code class="font-mono">order</code>. Page size defaults to
            <code class="font-mono">api.paginate.*.pageSize</code> when omitted.
            Bind <code class="font-mono">res.pagination</code> to
            <code class="font-mono">aies-pagination</code>. Shapes:
            <a
              class="font-medium text-ink underline-offset-2 hover:underline dark:text-white"
              routerLink="/models"
              fragment="pagination"
              >Pagination &amp; ResourceId</a
            >.
          </p>
        </div>
      </app-demo-section>

      @for (group of serviceGroups; track group.id) {
        <section class="flex flex-col gap-6" [attr.id]="group.id">
          <div class="flex flex-col gap-1 border-b border-border pb-3 dark:border-white/10">
            <h2 class="m-0 text-heading-3 text-ink dark:text-white">
              {{ group.title }}
            </h2>
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ group.hint }}
            </p>
          </div>

          @for (entry of group.services; track entry.id) {
            <app-demo-section
              [anchorId]="entry.id"
              [title]="entry.title"
              [hint]="entry.hint"
              [code]="entry.code"
            >
              <dl
                class="m-0 grid gap-3 text-body-sm sm:grid-cols-[7rem_1fr] sm:gap-x-4 sm:gap-y-3"
              >
                <dt
                  class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-500"
                >
                  Path
                </dt>
                <dd class="m-0 font-mono text-ink dark:text-white">
                  {{ entry.path }}
                </dd>

                @if (entry.resourceCalls; as calls) {
                  <dt
                    class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-500"
                  >
                    Calls
                  </dt>
                  <dd
                    class="m-0 flex flex-col gap-1.5 font-mono text-caption text-ink dark:text-white"
                  >
                    <span>{{ calls.page }}</span>
                    <span>{{ calls.all }}</span>
                    <span>{{ calls.byId }}</span>
                  </dd>
                } @else if (entry.returns) {
                  <dt
                    class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-500"
                  >
                    Returns
                  </dt>
                  <dd class="m-0 font-mono text-ink dark:text-white">
                    {{ entry.returns }}
                  </dd>
                }

                <dt
                  class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-500"
                >
                  Model
                </dt>
                <dd class="m-0">
                  <a
                    class="font-mono text-ink underline-offset-2 hover:underline dark:text-white"
                    routerLink="/models"
                    [fragment]="entry.modelAnchor"
                    >{{ entry.modelLabel }}</a
                  >
                </dd>
              </dl>
            </app-demo-section>
          }
        </section>
      }
    </div>
  `,
})
export class ApiPage {
  protected readonly overviewCode = API_OVERVIEW;

  protected readonly resourceIdRows: ResourceIdRow[] = [
    {
      id: 'null',
      meaning: 'Paginated page',
      path: '{base}',
      serviceCall: 'read() / readPage({ page })',
      customCall: 'getResourcePage(base, query)',
    },
    {
      id: "'all'",
      meaning: 'Full list, not paginated',
      path: '{base}/all',
      serviceCall: "read('all') / readAll()",
      customCall: 'getResourceAll(base)',
    },
    {
      id: 'number',
      meaning: 'Single matching record',
      path: '{base}/{id}',
      serviceCall: 'read(42) / readById(42)',
      customCall: 'getResourceById(base, 42)',
    },
  ];

  protected readonly serviceGroups: ApiServiceGroup[] = [
    {
      id: 'reference-data',
      title: 'Reference data',
      hint: 'Catalog GETs that follow ResourceId — page, all, or by id.',
      services: [
        {
          id: 'country',
          title: 'CountryService',
          hint: 'Public countries for destination pickers and address forms.',
          path: `GET ${COUNTRY_READ_PATH}/{id?}`,
          modelAnchor: 'country',
          modelLabel: 'CountryModel',
          resourceCalls: {
            page: 'readPage({ page }) → CountryModel[]',
            all: 'readAll() → CountryModel[]',
            byId: 'readById(n) → CountryModel',
          },
          code: API_COUNTRY,
        },
        {
          id: 'shipment-method',
          title: 'ShipmentMethodService',
          hint: 'Carriers with delivery windows and zone values.',
          path: `GET ${SHIPMENT_METHOD_READ_PATH}/{id?}`,
          modelAnchor: 'shipment-method',
          modelLabel: 'ShipmentMethodModel',
          resourceCalls: {
            page: 'readPage({ page }) → ShipmentMethodModel[]',
            all: 'readAll() → ShipmentMethodModel[]',
            byId: 'readById(n) → ShipmentMethodModel',
          },
          code: API_SHIPMENT_METHOD,
        },
        {
          id: 'warehouse',
          title: 'WarehouseService',
          hint: 'Warehouse locations with address, charges, and nested country.',
          path: `GET ${WAREHOUSE_READ_PATH}/{id?}`,
          modelAnchor: 'warehouse',
          modelLabel: 'WarehouseModel',
          resourceCalls: {
            page: 'readPage({ page }) → WarehouseModel[]',
            all: 'readAll() → WarehouseModel[]',
            byId: 'readById(n) → WarehouseModel',
          },
          code: API_WAREHOUSE,
        },
        {
          id: 'zone',
          title: 'ZoneService',
          hint: 'Shipping zones for routing and pricing rules.',
          path: `GET ${ZONE_READ_PATH}/{id?}`,
          modelAnchor: 'zone',
          modelLabel: 'ZoneModel',
          resourceCalls: {
            page: 'readPage({ page }) → ZoneModel[]',
            all: 'readAll() → ZoneModel[]',
            byId: 'readById(n) → ZoneModel',
          },
          code: API_ZONE,
        },
        {
          id: 'product',
          title: 'ProductService',
          hint: 'Catalog products with HS codes and document / ETW labels.',
          path: `GET ${PRODUCT_READ_PATH}/{id?}`,
          modelAnchor: 'product',
          modelLabel: 'ProductModel',
          resourceCalls: {
            page: 'readPage({ page }) → ProductModel[]',
            all: 'readAll() → ProductModel[]',
            byId: 'readById(n) → ProductModel',
          },
          code: API_PRODUCT,
        },
      ],
    },
    {
      id: 'session-config',
      title: 'Session & config',
      hint: 'Current user and STN/SFN region units — not ResourceId list reads.',
      services: [
        {
          id: 'user',
          title: 'UserService',
          hint: 'Current user. Call AuthTokenService.set(access_token) after login.',
          path: `GET ${USER_PATH}`,
          modelAnchor: 'user',
          modelLabel: 'UserModel',
          returns: 'me() → ApiResponseModel<UserModel>',
          code: API_USER,
        },
        {
          id: 'mode-config',
          title: 'ModeConfigService',
          hint: 'Region currency and units for STN/SFN — usually loaded at startup.',
          path: `GET ${MODE_CONFIG_PATH}`,
          modelAnchor: 'mode-config',
          modelLabel: 'ModeConfigDataModel',
          returns: 'loadConfig() → ModeConfigDataModel',
          code: API_MODE_CONFIG,
        },
      ],
    },
    {
      id: 'files',
      title: 'Files',
      hint: 'Single-object file resolve — not a list, not paginated.',
      services: [
        {
          id: 'file',
          title: 'FileService',
          hint: 'Resolve a storage ref to MIME type, optional base64, and a signed URL.',
          path: `POST ${FILE_READ_PATH}`,
          modelAnchor: 'file',
          modelLabel: 'FileReadModel',
          returns: 'read(ref) → ApiResponseModel<FileReadModel>',
          code: API_FILE,
        },
      ],
    },
  ];
}
