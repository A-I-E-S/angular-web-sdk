// @aies/aies-models copy-paste examples.

export /**
 *
 */
const MODELS_IMPORT = `// Shared API/UI shapes — type-only, no providers. Import from here instead of reinventing.

import type {
  AsyncQueryStateModel,
  ApiResponseModel,
  CountryModel,
  CurrencyModel,
  PaginationMetaModel,
  PaginationQueryParamsModel,
  PaymentMethodModel,
  ResourceId,
  ShippingMode,
  ModeConfigDataModel,
} from '@aies/aies-models';
`;

export /**
 *
 */
const MODELS_API_RESPONSE = `// Canonical ApiClient envelope. Fields are T | null — null-check before use.
// res.success === false is a failure even on HTTP 200; pagination may be null on detail GETs.

import { inject } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type { ApiErrorDetailModel, ApiResponseModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

interface Shipment {
  id: number;
  reference: string;
}

export class ShipmentApi {
  private readonly api = inject(ApiClient);

  async load(id: number): Promise<Shipment | null> {
    const res: ApiResponseModel<Shipment> = await firstValueFrom(
      this.api.get<Shipment>(\`/shipments/\${id}\`),
    );

    if (!res.success || res.data === null) {
      this.applyFieldErrors(res.errors);
      throw new Error(res.message ?? 'Could not load shipment.');
    }

    return res.data;
  }

  private applyFieldErrors(errors: ApiErrorDetailModel[] | null): void {
    if (!errors?.length) {
      return;
    }
    for (const err of errors) {
      // err.field → form control; err.message → validation copy; err.code → i18n key
    }
  }
}
`;

export /**
 *
 */
const MODELS_PAGINATION = `// ResourceId list GET convention (all list-style endpoints):
//   null  → paginated   api.getResourcePage('shipments', { page, size })
//   'all' → full dump   api.getResourceAll('shipments')
//   42    → one record  api.getResourceById('shipments', 42)
// Bind res.pagination to aies-pagination [meta] on paginated calls.

import { Component, inject, signal } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type {
  ApiResponseModel,
  PaginationMetaModel,
  PaginationQueryParamsModel,
  ResourceId,
} from '@aies/aies-models';
import {
  DEFAULT_PAGE_SIZE,
  PaginationComponent,
} from '@aies/aies-ui';
import { firstValueFrom } from 'rxjs';

interface Shipment {
  reference: string;
}

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [PaginationComponent],
  template: \`
    @if (meta(); as pager) {
      <aies-pagination
        [meta]="pager"
        (pageChange)="onPageChange($event)"
        (sizeChange)="onSizeChange($event)"
      />
    }
  \`,
})
export class ShipmentListComponent {
  private readonly api = inject(ApiClient);

  protected readonly meta = signal<PaginationMetaModel | null>(null);
  protected readonly rows = signal<Shipment[]>([]);

  protected readonly page = signal(1);
  protected readonly size = signal(DEFAULT_PAGE_SIZE);

  async loadPage(): Promise<void> {
    const listId: ResourceId = null;
    const query: PaginationQueryParamsModel = {
      page: this.page(),
      size: this.size(),
      order: '-createdAt',
    };

    const res: ApiResponseModel<Shipment[]> = await firstValueFrom(
      this.api.getResource<Shipment>('shipments', listId, query),
      // or: this.api.getResourcePage<Shipment>('shipments', query)
    );

    if (!res.success || res.data === null) {
      throw new Error(res.message ?? 'List fetch failed.');
    }

    this.rows.set(res.data);
    this.meta.set(res.pagination);
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
    void this.loadPage();
  }

  protected onSizeChange(next: number): void {
    this.size.set(next);
    this.page.set(1);
    void this.loadPage();
  }
}
`;

export /**
 *
 */
const MODELS_ASYNC_STATE = `// Map fetch signals into AsyncQueryStateModel for aies-async-state.
// isLoading = first paint; isFetching = background refresh. Keep data undefined until first success.

import { Component, computed, inject, signal } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type { AsyncQueryStateModel } from '@aies/aies-models';
import { AsyncStateComponent } from '@aies/aies-ui';
import { firstValueFrom } from 'rxjs';

interface Shipment {
  reference: string;
}

@Component({
  selector: 'app-shipment-async-list',
  standalone: true,
  imports: [AsyncStateComponent],
  template: \`
    <aies-async-state [state]="listState()" (retry)="refetch()">
      @for (row of listState().data ?? []; track row.reference) {
        <p>{{ row.reference }}</p>
      }
    </aies-async-state>
  \`,
})
export class ShipmentAsyncListComponent {
  private readonly api = inject(ApiClient);

  private readonly rows = signal<Shipment[] | undefined>(undefined);
  private readonly isLoading = signal(false);
  private readonly isFetching = signal(false);
  private readonly isError = signal(false);
  private readonly error = signal<string | null>(null);

  protected readonly listState = computed(
    (): AsyncQueryStateModel<Shipment[]> => ({
      data: this.rows(),
      isLoading: this.isLoading(),
      isFetching: this.isFetching(),
      isError: this.isError(),
      error: this.error(),
    }),
  );

  constructor() {
    void this.refetch();
  }

  protected async refetch(): Promise<void> {
    const hadData = this.rows() !== undefined;
    this.isLoading.set(!hadData);
    this.isFetching.set(true);
    this.isError.set(false);
    this.error.set(null);

    try {
      const res = await firstValueFrom(
        this.api.getResource<Shipment[]>('shipments', null, { page: 1 }),
      );
      if (!res.success || res.data === null) {
        throw new Error(res.message ?? 'Fetch failed.');
      }
      this.rows.set(res.data);
    } catch (err) {
      this.isError.set(true);
      this.error.set(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      this.isLoading.set(false);
      this.isFetching.set(false);
    }
  }

  // With TanStack injectQuery(): map query.data(), query.isLoading(), etc. directly.
}
`;

export /**
 *
 */
const MODELS_SHIPPING_MODE = `// 'stn' | 'sfn' literals for theme + HTTP. Read/set via ShippingModeService —
// ModeColorService and the mode interceptor follow along.

import { Component, inject } from '@angular/core';
import { ShippingModeService } from '@aies/aies-core';
import type { ShippingMode } from '@aies/aies-models';

@Component({
  selector: 'app-mode-switcher',
  standalone: true,
  template: \`
    <button type="button" (click)="setMode('sfn')">SFN — Ship From Nigeria</button>
    <button type="button" (click)="setMode('stn')">STN — Ship To Nigeria</button>
  \`,
})
export class ModeSwitcherComponent {
  private readonly shippingMode = inject(ShippingModeService);

  protected activeMode(): ShippingMode {
    return this.shippingMode.mode();
  }

  protected setMode(mode: ShippingMode): void {
    this.shippingMode.setMode(mode);
    // Interceptor attaches x-shipment-mode; theme accents update via ModeColorService.
  }
}
`;

export /**
 *
 */
const MODELS_MODE_CONFIG = `// Region currency/units from ModeConfigService — loads with provideAiesSdk.
// Call getRegionConfig(countryCode); don't hard-code maps in feature code.

import { Component, inject } from '@angular/core';
import { ModeConfigService, ShippingModeService } from '@aies/aies-core';

@Component({
  selector: 'app-shipment-summary',
  standalone: true,
  template: \`
    @if (region(); as r) {
      <p>Value: {{ r.currency_symbol }}{{ amount }}</p>
      <p>Weight unit: {{ r.mass_unit }}</p>
    }
  \`,
})
export class ShipmentSummaryComponent {
  private readonly modeConfig = inject(ModeConfigService);
  private readonly shipping = inject(ShippingModeService);

  readonly amount = 1250;
  readonly originCountry = 'cn';

  region() {
    // Uses saved /public/mode/config record + active STN/SFN mode.
    return this.modeConfig.getRegionConfig(this.originCountry);
  }
}

// app.config.ts
// provideAiesSdk({
//   baseUrl: 'https://test-api-export.africaniestest.com/api',
//   // loadModeConfig: true by default — GET /public/mode/config on startup
// }),
`;

export /**
 *
 */
const MODELS_COUNTRY = `// Countries — GET /public/country/read/{id?} (ResourceId).
// readPage() → CountryModel[] · readAll() → CountryModel[] · readById(n) → CountryModel

import { Component, inject, signal } from '@angular/core';
import { CountryService } from '@aies/aies-core';
import type { CountryModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-country-picker-setup',
  standalone: true,
  template: \`
    <p>{{ countries().length }} countries loaded</p>
    @if (countries()[0]; as first) {
      <p>{{ first.name }} ({{ first.iso2 }}) — {{ first.states.length }} states</p>
    }
  \`,
})
export class CountryPickerSetupComponent {
  private readonly countriesApi = inject(CountryService);

  protected readonly countries = signal<CountryModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.countriesApi.readAll());
    if (res.success && res.data) {
      this.countries.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_SERVICE = `// Services — GET /public/service/read/{id?} (ResourceId).

import { Component, inject, signal } from '@angular/core';
import { ServiceService } from '@aies/aies-core';
import type { ServiceModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-service-setup',
  standalone: true,
  template: \`
    <p>{{ services().length }} services</p>
    @if (services()[0]; as first) {
      <p>{{ first.name }}</p>
    }
  \`,
})
export class ServiceSetupComponent {
  private readonly servicesApi = inject(ServiceService);
  protected readonly services = signal<ServiceModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.servicesApi.readPage({ page: 1 }));
    if (res.success && res.data) {
      this.services.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_DOCUMENT = `// Documents — GET /public/document/read/{id?} (ResourceId).

import { Component, inject, signal } from '@angular/core';
import { DocumentService } from '@aies/aies-core';
import type { DocumentModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-document-setup',
  standalone: true,
  template: \`
    @if (doc(); as d) {
      <p>{{ d.name }}</p>
    }
  \`,
})
export class DocumentSetupComponent {
  private readonly documentsApi = inject(DocumentService);
  protected readonly doc = signal<DocumentModel | null>(null);

  async load(id: number): Promise<void> {
    const res = await firstValueFrom(this.documentsApi.readById(id));
    if (res.success && res.data) {
      this.doc.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_PLAN = `// Plans — GET /public/plan/read/{id?} (ResourceId).

import { Component, inject, signal } from '@angular/core';
import { PlanService } from '@aies/aies-core';
import type { PlanModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-plan-setup',
  standalone: true,
  template: \`
    <p>{{ plans().length }} plans</p>
    @if (plans()[0]; as first) {
      <p>{{ first.name }} — {{ first.packages.length }} packages</p>
    }
  \`,
})
export class PlanSetupComponent {
  private readonly plansApi = inject(PlanService);
  protected readonly plans = signal<PlanModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.plansApi.readPage({ page: 1 }));
    if (res.success && res.data) {
      this.plans.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_CURRENCY = `// Currencies — GET /currency/read/{id?} (ResourceId).
// readPage() → CurrencyModel[] · create / update / remove → envelope
// Flags on GET are boolean; create/update accept boolean or "1"/"0".

import { Component, inject, signal } from '@angular/core';
import { CurrencyService } from '@aies/aies-core';
import type { CurrencyModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-currency-setup',
  standalone: true,
  template: \`
    <p>{{ currencies().length }} currencies loaded</p>
    @if (currencies()[0]; as first) {
      <p>{{ first.name }} ({{ first.short_code }}) — {{ first.payment_methods.length }} methods</p>
    }
  \`,
})
export class CurrencySetupComponent {
  private readonly currenciesApi = inject(CurrencyService);

  protected readonly currencies = signal<CurrencyModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(
      this.currenciesApi.readPage({ page: 1, order: 'desc' }),
    );
    if (res.success && res.data) {
      this.currencies.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_PAYMENT_METHOD = `// Payment methods — GET /payment_method/read/{id?} (ResourceId).
// PUT /payment_method/update — active toggle; resend name + model from the row.
// No create/delete. After update: toast message + patch updated_at (do not reload).
// readPage({ page, order, search, from, to }) → PaymentMethodModel[]
// readAll() → PaymentMethodModel[] · readById(n) → PaymentMethodModel

import { Component, inject, signal } from '@angular/core';
import { PaymentMethodService } from '@aies/aies-core';
import type {
  PaymentMethodModel,
  PaymentMethodUpdateRequestModel,
} from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment-method-setup',
  standalone: true,
  template: \`
    <p>{{ methods().length }} payment methods loaded</p>
    @if (methods()[0]; as first) {
      <p>{{ first.name }} — {{ first.currencies.length }} currencies</p>
    }
  \`,
})
export class PaymentMethodSetupComponent {
  private readonly methodsApi = inject(PaymentMethodService);

  protected readonly methods = signal<PaymentMethodModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(
      this.methodsApi.readPage({ page: 1, order: 'desc' }),
    );
    if (res.success && res.data) {
      this.methods.set(res.data);
    }
  }

  async setActive(row: PaymentMethodModel, active: boolean): Promise<void> {
    const body: PaymentMethodUpdateRequestModel = {
      id: row.id,
      name: row.name,
      model: row.model,
      active,
    };
    const res = await firstValueFrom(this.methodsApi.update(body));
    if (res.success) {
      // toast res.message; patch row locally — do not readPage()
    }
  }
}
`;

export /**
 *
 */
const MODELS_SHIPMENT_METHOD = `// Carriers — GET /shipment_method/read/{id?} (ResourceId).
// readPage() · readAll() · readById(n) → single ShipmentMethodModel

import { Component, inject, signal } from '@angular/core';
import { ShipmentMethodService } from '@aies/aies-core';
import type { ShipmentMethodModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrier-setup',
  standalone: true,
  template: \`
    <p>{{ methods().length }} methods</p>
    @if (methods()[0]; as first) {
      <p>{{ first.name }} ({{ first.mode }}) — {{ first.zone_values.total }} zones</p>
    }
  \`,
})
export class CarrierSetupComponent {
  private readonly methodsApi = inject(ShipmentMethodService);
  protected readonly methods = signal<ShipmentMethodModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.methodsApi.readAll());
    if (res.success && res.data) {
      this.methods.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_WAREHOUSE = `// Warehouses — GET /warehouse/read/{id?} (ResourceId). Nested country reuses CountryModel.

import { Component, inject, signal } from '@angular/core';
import { WarehouseService } from '@aies/aies-core';
import type { WarehouseModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-warehouse-setup',
  standalone: true,
  template: \`
    <p>{{ warehouses().length }} warehouses</p>
    @if (warehouses()[0]; as first) {
      <p>{{ first.name }} — {{ first.city }}, {{ first.country?.iso2 }}</p>
    }
  \`,
})
export class WarehouseSetupComponent {
  private readonly warehousesApi = inject(WarehouseService);
  protected readonly warehouses = signal<WarehouseModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.warehousesApi.readAll());
    if (res.success && res.data) {
      this.warehouses.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_ZONE = `// Zones — GET /zone/read/records/{id?} (ResourceId).

import { Component, inject, signal } from '@angular/core';
import { ZoneService } from '@aies/aies-core';
import type { ZoneModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-zone-setup',
  standalone: true,
  template: \`
    <p>{{ zones().length }} zones</p>
    @if (zones()[0]; as first) {
      <p>{{ first.name }} ({{ first.type }})</p>
    }
  \`,
})
export class ZoneSetupComponent {
  private readonly zonesApi = inject(ZoneService);
  protected readonly zones = signal<ZoneModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.zonesApi.readAll());
    if (res.success && res.data) {
      this.zones.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_USER = `// Current user — bare GET /user (no envelope). UserService.me() → UserModel (snake_case).

import { Component, inject, signal } from '@angular/core';
import { UserService } from '@aies/aies-core';
import type { UserModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-setup',
  standalone: true,
  template: \`
    @if (user(); as u) {
      <p>{{ u.first_name }} {{ u.last_name }} · {{ u.email }}</p>
    }
  \`,
})
export class UserSetupComponent {
  private readonly users = inject(UserService);
  protected readonly user = signal<UserModel | null>(null);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.users.me());
    if (res.success && res.data) {
      this.user.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_PRODUCT = `// Products — GET /product/read/{id?} (ResourceId).

import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '@aies/aies-core';
import type { ProductModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-setup',
  standalone: true,
  template: \`
    <p>{{ products().length }} products</p>
    @if (products()[0]; as first) {
      <p>{{ first.name }} — {{ first.hs_code }}</p>
    }
  \`,
})
export class ProductSetupComponent implements OnInit {
  private readonly productsApi = inject(ProductService);
  protected readonly products = signal<ProductModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.productsApi.readAll());
    if (res.success && res.data) {
      this.products.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const MODELS_FILE = `// File read — POST /file/read with { ref }.
// data is a single FileReadModel (not a list / not paginated).

import { Component, inject, signal } from '@angular/core';
import { FileService } from '@aies/aies-core';
import type { FileReadModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-file-setup',
  standalone: true,
  template: \`
    @if (file(); as f) {
      <p>{{ f.mime_type }}</p>
      <a [href]="f.url" target="_blank" rel="noopener">Download</a>
    }
  \`,
})
export class FileSetupComponent {
  private readonly filesApi = inject(FileService);
  protected readonly file = signal<FileReadModel | null>(null);

  async load(ref: string): Promise<void> {
    const res = await firstValueFrom(this.filesApi.read(ref));
    if (res.success && res.data) {
      this.file.set(res.data);
    }
  }
}
`;
