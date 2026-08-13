import { Component, inject, OnInit, signal } from '@angular/core';

import {
  COUNTRY_READ_PATH,
  CountryService,
  MODE_CONFIG_PATH,
  ModeConfigService,
  SHIPMENT_METHOD_READ_PATH,
  ShipmentMethodService,
  USER_PATH,
  UserService,
  WAREHOUSE_READ_PATH,
  WarehouseService,
  ZONE_READ_PATH,
  ZoneService,
} from '@aies/aies-core';
import type {
  CountryModel,
  ModeConfigDataModel,
  ModeRegionConfigModel,
  ShipmentMethodModel,
  UserModel,
  WarehouseModel,
  ZoneModel,
} from '@aies/aies-models';
import { AiesActionsModule } from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  API_COUNTRY,
  API_MODE_CONFIG,
  API_OVERVIEW,
  API_SHIPMENT_METHOD,
  API_USER,
  API_WAREHOUSE,
  API_ZONE,
} from '../snippets';

/**
 * Live catalog of HTTP calls owned by `@aies/aies-core` services.
 */
@Component({
  selector: 'app-api-page',
  standalone: true,
  imports: [AiesActionsModule, PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Foundation"
        title="SDK API"
        description="HTTP endpoints the SDK calls for you — Country, ModeConfig, ShipmentMethod, Warehouse, Zone, User, and more. Paths and snake→camel mapping live in @aies/aies-core; shapes come from @aies/aies-models. GET /user returns a bare object — ApiClient still normalizes it."
      />

      <app-demo-section
        title="Bootstrap"
        hint="provideAiesSdk + provideAiesHttpClient — ApiClient resolves relative paths against baseUrl."
        [code]="overviewCode"
      >
        <dl class="m-0 grid gap-3 text-body-sm sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink">
            <dt class="m-0 font-mono text-caption text-neutral-500">Mode config</dt>
            <dd class="m-0 mt-1 font-mono text-ink dark:text-white">
              GET {{ MODE_CONFIG_PATH }}
            </dd>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              Loaded on startup when loadModeConfig is true (default).
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink">
            <dt class="m-0 font-mono text-caption text-neutral-500">Countries</dt>
            <dd class="m-0 mt-1 font-mono text-ink dark:text-white">
              GET {{ COUNTRY_READ_PATH }}/&#123;id|all&#125;
            </dd>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              On demand via CountryService.read() — default id is all.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink">
            <dt class="m-0 font-mono text-caption text-neutral-500">Carriers</dt>
            <dd class="m-0 mt-1 font-mono text-ink dark:text-white">
              GET {{ SHIPMENT_METHOD_READ_PATH }}/&#123;id|all&#125;
            </dd>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              On demand via ShipmentMethodService.read() — default id is all.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink">
            <dt class="m-0 font-mono text-caption text-neutral-500">Warehouses</dt>
            <dd class="m-0 mt-1 font-mono text-ink dark:text-white">
              GET {{ WAREHOUSE_READ_PATH }}/&#123;id|all&#125;
            </dd>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              On demand via WarehouseService.read() — default id is all.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink">
            <dt class="m-0 font-mono text-caption text-neutral-500">Zones</dt>
            <dd class="m-0 mt-1 font-mono text-ink dark:text-white">
              GET {{ ZONE_READ_PATH }}/&#123;id|all&#125;
            </dd>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              On demand via ZoneService.read() — default id is all.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink">
            <dt class="m-0 font-mono text-caption text-neutral-500">Current user</dt>
            <dd class="m-0 mt-1 font-mono text-ink dark:text-white">
              GET {{ USER_PATH }}
            </dd>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              Bare JSON body — auth required. UserService.me() maps to UserModel.
            </p>
          </div>
        </dl>
      </app-demo-section>

      <app-demo-section
        title="CountryService"
        hint="Public utility — returns ApiResponseModel&lt;CountryModel[]&gt;."
        [code]="countryCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              aies-button
              type="button"
              size="sm"
              [disabled]="countriesLoading()"
              (click)="loadCountries('all')"
            >
              read('all')
            </button>
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              [disabled]="countriesLoading()"
              (click)="loadCountries(1)"
            >
              readById(1)
            </button>
          </div>

          @if (countriesError(); as err) {
            <p class="m-0 text-body-sm text-danger" role="alert">{{ err }}</p>
          } @else if (countriesLoading()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading…
            </p>
          } @else if (countries()[0]; as first) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ countries().length }} countr{{
                countries().length === 1 ? 'y' : 'ies'
              }}
              · first:
              <span class="font-medium text-ink dark:text-white">{{
                first.name
              }}</span>
              ({{ first.iso2 }}) · {{ first.states.length }} states
            </p>
            <pre
              class="m-0 max-h-56 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ formatJson(first) }}</pre>
          } @else {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No countries returned.
            </p>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="ShipmentMethodService"
        hint="Carriers — returns ApiResponseModel&lt;ShipmentMethodModel[]&gt; with mapped zoneValues."
        [code]="shipmentMethodCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              aies-button
              type="button"
              size="sm"
              [disabled]="methodsLoading()"
              (click)="loadMethods('all')"
            >
              read('all')
            </button>
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              [disabled]="methodsLoading()"
              (click)="loadMethods(12)"
            >
              readById(12)
            </button>
          </div>

          @if (methodsError(); as err) {
            <p class="m-0 text-body-sm text-danger" role="alert">{{ err }}</p>
          } @else if (methodsLoading()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading…
            </p>
          } @else if (methods()[0]; as first) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ methods().length }} method{{ methods().length === 1 ? '' : 's' }}
              · first:
              <span class="font-medium text-ink dark:text-white">{{
                first.name
              }}</span>
              ({{ first.mode.toUpperCase() }}) ·
              {{ first.min_delivery_business_day }}–{{ first.max_delivery_business_day }}
              days · {{ first.zone_values.total }} zone links
            </p>
            <pre
              class="m-0 max-h-56 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ formatJson(first) }}</pre>
          } @else {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No shipment methods returned.
            </p>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="WarehouseService"
        hint="Warehouses — returns ApiResponseModel&lt;WarehouseModel[]&gt; with nested CountryModel."
        [code]="warehouseCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              aies-button
              type="button"
              size="sm"
              [disabled]="warehousesLoading()"
              (click)="loadWarehouses('all')"
            >
              read('all')
            </button>
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              [disabled]="warehousesLoading()"
              (click)="loadWarehouses(37)"
            >
              readById(37)
            </button>
          </div>

          @if (warehousesError(); as err) {
            <p class="m-0 text-body-sm text-danger" role="alert">{{ err }}</p>
          } @else if (warehousesLoading()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading…
            </p>
          } @else if (warehouses()[0]; as first) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ warehouses().length }} warehouse{{
                warehouses().length === 1 ? '' : 's'
              }}
              · first:
              <span class="font-medium text-ink dark:text-white">{{
                first.name
              }}</span>
              · {{ first.city }}
              @if (first.country; as country) {
                ({{ country.iso2 }})
              }
              · {{ first.currency }} {{ first.storage_charge }}
            </p>
            <pre
              class="m-0 max-h-56 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ formatJson(first) }}</pre>
          } @else {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No warehouses returned.
            </p>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="ZoneService"
        hint="Zones — returns ApiResponseModel&lt;ZoneModel[]&gt; from /zone/read/records."
        [code]="zoneCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              aies-button
              type="button"
              size="sm"
              [disabled]="zonesLoading()"
              (click)="loadZones('all')"
            >
              read('all')
            </button>
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              [disabled]="zonesLoading()"
              (click)="loadZones(1)"
            >
              readById(1)
            </button>
          </div>

          @if (zonesError(); as err) {
            <p class="m-0 text-body-sm text-danger" role="alert">{{ err }}</p>
          } @else if (zonesLoading()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading…
            </p>
          } @else if (zones()[0]; as first) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ zones().length }} zone{{ zones().length === 1 ? '' : 's' }}
              · first:
              <span class="font-medium text-ink dark:text-white">{{
                first.name
              }}</span>
              ({{ first.type }}) ·
              {{ first.active ? 'active' : 'inactive' }}
            </p>
            <pre
              class="m-0 max-h-56 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ formatJson(first) }}</pre>
          } @else {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No zones returned.
            </p>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="UserService"
        hint="Current user — bare GET /user body; ApiClient wraps it, then mapUser → UserModel. Auth required."
        [code]="userCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              aies-button
              type="button"
              size="sm"
              [disabled]="userLoading()"
              (click)="loadUser()"
            >
              me()
            </button>
          </div>

          @if (userError(); as err) {
            <p class="m-0 text-body-sm text-danger" role="alert">{{ err }}</p>
          } @else if (userLoading()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading…
            </p>
          } @else if (user(); as profile) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              <span class="font-medium text-ink dark:text-white">{{
                profile.name
              }}</span>
              · {{ profile.email }}
              @if (profile.country; as country) {
                · {{ country.iso2 }}
              }
              · {{ profile.main_region }} · {{ profile.shipping_type }}
            </p>
            <pre
              class="m-0 max-h-56 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ formatJson(profile) }}</pre>
          } @else {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No user loaded yet — call AuthTokenService.set(access_token) after login, then me().
            </p>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="ModeConfigService"
        hint="Region currency and units — hydrate from startup fetch or reload."
        [code]="modeConfigCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              aies-button
              type="button"
              size="sm"
              [disabled]="modeLoading()"
              (click)="reloadModeConfig()"
            >
              loadConfig()
            </button>
          </div>

          @if (modeError(); as err) {
            <p class="m-0 text-body-sm text-danger" role="alert">{{ err }}</p>
          } @else if (modeLoading()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading mode config…
            </p>
          } @else {
            <div class="grid gap-3 sm:grid-cols-3">
              @for (sample of regionSamples; track sample.code) {
                <div
                  class="rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink"
                >
                  <p
                    class="m-0 font-mono text-caption uppercase tracking-wide text-neutral-500"
                  >
                    {{ sample.code }}
                  </p>
                  @if (regionFor(sample.code); as region) {
                    <p class="m-0 mt-2 text-body font-medium text-ink dark:text-white">
                      {{ region.currency_symbol }} {{ region.currency }}
                    </p>
                    <p class="m-0 mt-1 text-caption text-neutral-600 dark:text-neutral-400">
                      {{ region.mass_unit }} · {{ region.dimension_unit }}
                    </p>
                  } @else {
                    <p class="m-0 mt-2 text-caption text-neutral-500">No config yet</p>
                  }
                </div>
              }
            </div>
            <pre
              class="m-0 max-h-48 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ formatJson(modeConfig()) }}</pre>
          }
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ApiPage implements OnInit {
  private readonly countriesApi = inject(CountryService);
  private readonly methodsApi = inject(ShipmentMethodService);
  private readonly warehousesApi = inject(WarehouseService);
  private readonly zonesApi = inject(ZoneService);
  private readonly usersApi = inject(UserService);
  private readonly modeConfigApi = inject(ModeConfigService);

  protected readonly MODE_CONFIG_PATH = MODE_CONFIG_PATH;
  protected readonly COUNTRY_READ_PATH = COUNTRY_READ_PATH;
  protected readonly SHIPMENT_METHOD_READ_PATH = SHIPMENT_METHOD_READ_PATH;
  protected readonly WAREHOUSE_READ_PATH = WAREHOUSE_READ_PATH;
  protected readonly ZONE_READ_PATH = ZONE_READ_PATH;
  protected readonly USER_PATH = USER_PATH;

  protected readonly overviewCode = API_OVERVIEW;
  protected readonly countryCode = API_COUNTRY;
  protected readonly shipmentMethodCode = API_SHIPMENT_METHOD;
  protected readonly warehouseCode = API_WAREHOUSE;
  protected readonly zoneCode = API_ZONE;
  protected readonly userCode = API_USER;
  protected readonly modeConfigCode = API_MODE_CONFIG;

  protected readonly countries = signal<CountryModel[]>([]);
  protected readonly countriesLoading = signal(false);
  protected readonly countriesError = signal<string | null>(null);

  protected readonly methods = signal<ShipmentMethodModel[]>([]);
  protected readonly methodsLoading = signal(false);
  protected readonly methodsError = signal<string | null>(null);

  protected readonly warehouses = signal<WarehouseModel[]>([]);
  protected readonly warehousesLoading = signal(false);
  protected readonly warehousesError = signal<string | null>(null);

  protected readonly zones = signal<ZoneModel[]>([]);
  protected readonly zonesLoading = signal(false);
  protected readonly zonesError = signal<string | null>(null);

  protected readonly user = signal<UserModel | null>(null);
  protected readonly userLoading = signal(false);
  protected readonly userError = signal<string | null>(null);

  protected readonly modeConfig = signal<ModeConfigDataModel | null>(null);
  protected readonly modeLoading = signal(false);
  protected readonly modeError = signal<string | null>(null);

  protected readonly regionSamples = [
    { code: 'ng' },
    { code: 'us' },
    { code: 'cn' },
  ] as const;

  ngOnInit(): void {
    this.loadCountries('all');
    this.loadMethods('all');
    this.loadWarehouses('all');
    this.loadZones('all');
    this.syncModeFromService();
  }

  protected loadCountries(id: number | 'all'): void {
    this.countriesLoading.set(true);
    this.countriesError.set(null);
    this.countriesApi.read(id).subscribe({
      next: (res) => {
        this.countriesLoading.set(false);
        if (!res.success || res.data === null) {
          this.countriesError.set(res.message ?? 'Could not load countries.');
          return;
        }
        this.countries.set(res.data);
      },
      error: () => {
        this.countriesLoading.set(false);
        this.countriesError.set('Could not load countries.');
      },
    });
  }

  protected loadMethods(id: number | 'all'): void {
    this.methodsLoading.set(true);
    this.methodsError.set(null);
    this.methodsApi.read(id).subscribe({
      next: (res) => {
        this.methodsLoading.set(false);
        if (!res.success || res.data === null) {
          this.methodsError.set(
            res.message ?? 'Could not load shipment methods.',
          );
          return;
        }
        this.methods.set(res.data);
      },
      error: () => {
        this.methodsLoading.set(false);
        this.methodsError.set('Could not load shipment methods.');
      },
    });
  }

  protected loadWarehouses(id: number | 'all'): void {
    this.warehousesLoading.set(true);
    this.warehousesError.set(null);
    this.warehousesApi.read(id).subscribe({
      next: (res) => {
        this.warehousesLoading.set(false);
        if (!res.success || res.data === null) {
          this.warehousesError.set(
            res.message ?? 'Could not load warehouses.',
          );
          return;
        }
        this.warehouses.set(res.data);
      },
      error: () => {
        this.warehousesLoading.set(false);
        this.warehousesError.set('Could not load warehouses.');
      },
    });
  }

  protected loadZones(id: number | 'all'): void {
    this.zonesLoading.set(true);
    this.zonesError.set(null);
    this.zonesApi.read(id).subscribe({
      next: (res) => {
        this.zonesLoading.set(false);
        if (!res.success || res.data === null) {
          this.zonesError.set(res.message ?? 'Could not load zones.');
          return;
        }
        this.zones.set(res.data);
      },
      error: () => {
        this.zonesLoading.set(false);
        this.zonesError.set('Could not load zones.');
      },
    });
  }

  protected loadUser(): void {
    this.userLoading.set(true);
    this.userError.set(null);
    this.usersApi.me().subscribe({
      next: (res) => {
        this.userLoading.set(false);
        if (!res.success || res.data === null) {
          this.userError.set(res.message ?? 'Could not load user.');
          return;
        }
        this.user.set(res.data);
      },
      error: () => {
        this.userLoading.set(false);
        this.userError.set(
          'Could not load user — call AuthTokenService.set(access_token) after login.',
        );
      },
    });
  }

  protected reloadModeConfig(): void {
    this.modeLoading.set(true);
    this.modeError.set(null);
    this.modeConfigApi.loadConfig().subscribe({
      next: (res) => {
        this.modeLoading.set(false);
        if (!res.success || res.data === null) {
          this.modeError.set(res.message ?? 'Could not load mode config.');
          return;
        }
        this.syncModeFromService();
      },
      error: () => {
        this.modeLoading.set(false);
        this.modeError.set('Could not load mode config.');
      },
    });
  }

  protected regionFor(code: string): ModeRegionConfigModel | null {
    return this.modeConfigApi.getRegionConfig(code);
  }

  protected formatJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  private syncModeFromService(): void {
    this.modeConfig.set(this.modeConfigApi.config());
  }
}
