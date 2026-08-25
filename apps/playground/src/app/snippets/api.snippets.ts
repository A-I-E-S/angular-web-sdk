/**
 * Playground snippets — SDK HTTP services (@africanies/africanies-core).
 */

export /**
 *
 */
const API_OVERVIEW = `// Domain services in @africanies/africanies-core own paths and mapping.
// Apps call inject(CountryService) / CurrencyService / PaymentMethodService / ProductService / … — or ApiClient for custom routes.
//
// List GET convention (ResourceId) — built-in services AND custom calls:
//   null  → paginated page   GET {base}           (+ page/size/order)
//   'all' → full dump        GET {base}/all
//   42    → single record    GET {base}/42
//
// Custom endpoints — IDE helpers on ApiClient:
//   api.getResourcePage<T>('shipments', { page: 1 })
//   api.getResourceAll<T>('shipments')
//   api.getResourceById<T>('shipments', 42)
//   // or overloads: getResource(base, null | 'all' | number, query?, options?)
//   // Per-request mode override (tab mode unchanged):
//   api.post('/claim', body, { shippingMode: 'stn' })
//   // path helper:  buildResourcePath('/my/read', id)

import { ApplicationConfig } from '@angular/core';
import {
  provideAfricaniesSdk,
  provideAfricaniesHttpClient,
} from '@africanies/africanies-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAfricaniesSdk({
      baseUrl: 'https://test-api-export.africaniestest.com/api',
      // loadModeConfig: true by default → GET /public/mode/config on startup
    }),
    provideAfricaniesHttpClient(),
  ],
};
`;

export /**
 *
 */
const API_COUNTRY = `// GET /public/country/read/{id?} — ResourceId: null | 'all' | number.
// Flag images: countryFlagUrl(iso2) or mapCountrySelectOptions(rows) → prefixImageUrl

import { Component, inject, signal } from '@angular/core';
import { CountryService, mapCountrySelectOptions } from '@africanies/africanies-core';
import type { SelectOption } from '@africanies/africanies-ui';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-country-loader',
  standalone: true,
  template: \`
    <africanies-select
      label="Destination country"
      [options]="countryOptions()"
      searchable
    />
  \`,
})
export class CountryLoaderComponent {
  private readonly countriesApi = inject(CountryService);
  protected readonly countryOptions = signal<SelectOption<number>[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.countriesApi.readAll());
    if (res.success && res.data) {
      this.countryOptions.set(
        mapCountrySelectOptions(res.data, { width: 40 }).map((row) => ({
          label: row.label,
          value: row.value,
          prefixImageUrl: row.prefixImageUrl,
        })),
      );
    }
  }
}
`;

export /**
 *
 */
const API_SERVICE = `// GET /public/service/read/{id?} — ResourceId: null | 'all' | number.
// Public catalog — no auth required. App Settings Services / Plans boards.
// readPage({ page, order, search, size, from, to }) → ServiceModel[]

import { Component, inject, signal } from '@angular/core';
import { ServiceService } from '@africanies/africanies-core';
import type { ServiceModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-service-loader',
  standalone: true,
  template: \`
    <p>{{ services().length }} services</p>
    @if (services()[0]; as first) {
      <p>{{ first.name }}</p>
    }
  \`,
})
export class ServiceLoaderComponent {
  private readonly servicesApi = inject(ServiceService);
  protected readonly services = signal<ServiceModel[]>([]);

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(
      this.servicesApi.readPage({ page: 1, order: 'desc' }),
    );
    if (res.success && res.data) {
      this.services.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const API_DOCUMENT = `// GET /public/document/read/{id?} — catalog preview by document id.
// readById(n) → bind doc.file_ref.base_64 in <img> / PDF viewer.
// For raw file_ref on shipments/KYC/waybills → FileService.read(ref).

import { Component, inject, signal } from '@angular/core';
import { DocumentService } from '@africanies/africanies-core';
import type { DocumentModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-document-loader',
  standalone: true,
  template: \`
    @if (doc(); as d) {
      <p>{{ d.name }}</p>
      @if (d.file_ref?.base_64) {
        <img [src]="d.file_ref.base_64" alt="" />
      }
    }
  \`,
})
export class DocumentLoaderComponent {
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
const API_PLAN = `// GET /public/plan/read/{id?} — ResourceId: null | 'all' | number.
// Public catalog — no auth required. App Settings Plans / Plan Packages.
// readPage({ page, order, search, size, from, to }) → PlanModel[] (nested packages)

import { Component, inject, signal } from '@angular/core';
import { PlanService } from '@africanies/africanies-core';
import type { PlanModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-plan-loader',
  standalone: true,
  template: \`
    <p>{{ plans().length }} plans</p>
    @if (plans()[0]; as first) {
      <p>{{ first.name }} — {{ first.packages.length }} packages</p>
    }
  \`,
})
export class PlanLoaderComponent {
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
const API_CURRENCY = `// GET /currency/read/{id?} — ResourceId: null | 'all' | number.
// POST /currency/create · PUT /currency/update · DELETE /currency/delete ({ id } body).
// Laravel paginator in data is flattened to data[] + pagination.
// readPage({ page, order, search, from, to }) → CurrencyModel[]
// create / update serialize active + is_naira_greater to "1" / "0".
// After each write: show res.message, then readPage again.

import { Component, inject, signal } from '@angular/core';
import { CurrencyService, PaymentMethodService } from '@africanies/africanies-core';
import type { CurrencyModel, PaginationMetaModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-currency-loader',
  standalone: true,
  template: \`
    <p>{{ currencies().length }} currencies</p>
    @if (currencies()[0]; as first) {
      <p>{{ first.name }} ({{ first.short_code }})</p>
    }
  \`,
})
export class CurrencyLoaderComponent {
  private readonly currenciesApi = inject(CurrencyService);
  private readonly paymentMethodsApi = inject(PaymentMethodService);
  protected readonly currencies = signal<CurrencyModel[]>([]);
  protected readonly meta = signal<PaginationMetaModel | null>(null);

  async ngOnInit(): Promise<void> {
    const methods = await firstValueFrom(
      this.paymentMethodsApi.readPage({ page: 1 }),
    );
    const page = await firstValueFrom(
      this.currenciesApi.readPage({
        page: 1,
        order: 'desc',
        size: 15,
        search: '',
        from: '',
        to: '',
      }),
    );
    if (page.success && page.data) {
      this.currencies.set(page.data);
      this.meta.set(page.pagination);
    }
    void methods;
  }

  async saveUsd(methodIds: number[]): Promise<void> {
    const res = await firstValueFrom(
      this.currenciesApi.create({
        name: 'United States Dollar',
        short_code: 'USD',
        multiplication_rate: '1600',
        division_rate: '1400',
        active: true,
        is_naira_greater: false,
        payment_method_ids: methodIds,
      }),
    );
    if (res.success) {
      // toast res.message, close modal, then readPage again
      await firstValueFrom(
        this.currenciesApi.readPage({ page: 1, order: 'desc', size: 15 }),
      );
    }
  }
}
`;

export /**
 *
 */
const API_PAYMENT_METHOD = `// GET /payment_method/read/{id?} — ResourceId: null | 'all' | number.
// PUT /payment_method/update — active toggle only (resend name + model from the row).
// No create/delete on this board. After update: toast message + patch updated_at locally.
// Laravel paginator in data is flattened to data[] + pagination.
// readPage({ page, size, order, search, from, to }) → PaymentMethodModel[]
// readAll()            → full PaymentMethodModel[]
// readById(4)          → single PaymentMethodModel

import { Component, inject, signal } from '@angular/core';
import { PaymentMethodService } from '@africanies/africanies-core';
import type { PaginationMetaModel, PaymentMethodModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment-method-loader',
  standalone: true,
  template: \`
    <p>{{ methods().length }} payment methods</p>
    @if (methods()[0]; as first) {
      <p>{{ first.name }} — {{ first.currencies.length }} currencies</p>
    }
  \`,
})
export class PaymentMethodLoaderComponent {
  private readonly methodsApi = inject(PaymentMethodService);
  protected readonly methods = signal<PaymentMethodModel[]>([]);
  protected readonly meta = signal<PaginationMetaModel | null>(null);

  async ngOnInit(): Promise<void> {
    const page = await firstValueFrom(
      this.methodsApi.readPage({ page: 1, order: 'desc' }),
    );
    if (page.success && page.data) {
      this.methods.set(page.data);
      this.meta.set(page.pagination);
    }
  }

  async toggleActive(row: PaymentMethodModel, next: boolean): Promise<void> {
    const res = await firstValueFrom(
      this.methodsApi.update({
        id: row.id,
        name: row.name,
        model: row.model,
        active: next,
      }),
    );
    if (res.success) {
      // toast res.message; patch row.active + row.updated_at in place — do not readPage()
      this.methods.update((list) =>
        list.map((m) =>
          m.id === row.id
            ? { ...m, active: next, updated_at: new Date().toISOString() }
            : m,
        ),
      );
    }
  }
}
`;

export /**
 *
 */
const API_MODE_CONFIG = `// GET /public/mode/config — usually loaded at bootstrap via provideAfricaniesSdk.
// ModeConfigService hydrates storage; getRegionConfig(country) reads STN/SFN units.

import { Component, inject } from '@angular/core';
import { ModeConfigService } from '@africanies/africanies-core';

@Component({
  selector: 'app-region-units',
  standalone: true,
  template: \`
    @if (region(); as r) {
      <p>{{ r.currency_symbol }} · {{ r.mass_unit }} · {{ r.dimension_unit }}</p>
    }
  \`,
})
export class RegionUnitsComponent {
  private readonly modeConfig = inject(ModeConfigService);

  region() {
    return this.modeConfig.getRegionConfig('ng');
  }

  reload() {
    this.modeConfig.loadConfig().subscribe();
  }
}
`;

export /**
 *
 */
const API_SHIPMENT_METHOD = `// GET /shipment_method/read/{id?} — ResourceId: null | 'all' | number.
// readPage() → paginated · readAll() → full · readById(n) → single ShipmentMethodModel

import { Component, inject, signal } from '@angular/core';
import { ShipmentMethodService } from '@africanies/africanies-core';
import type { ShipmentMethodModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrier-loader',
  standalone: true,
  template: \`
    <p>{{ methods().length }} methods</p>
    @if (methods()[0]; as first) {
      <p>{{ first.name }} · {{ first.mode }} · {{ first.zone_values.total }} zones</p>
    }
  \`,
})
export class CarrierLoaderComponent {
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
const API_WAREHOUSE = `// GET /warehouse/read/{id?} — ResourceId: null | 'all' | number.
// readPage() → paginated · readAll() → full · readById(n) → single WarehouseModel

import { Component, inject, signal } from '@angular/core';
import { WarehouseService } from '@africanies/africanies-core';
import type { WarehouseModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-warehouse-loader',
  standalone: true,
  template: \`
    <p>{{ warehouses().length }} warehouses</p>
    @if (warehouses()[0]; as first) {
      <p>{{ first.name }} · {{ first.city }} · {{ first.country?.iso2 }}</p>
    }
  \`,
})
export class WarehouseLoaderComponent {
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
const API_ZONE = `// GET /zone/read/records/{id?} — ResourceId: null | 'all' | number.
// readPage() → paginated · readAll() → full · readById(n) → single ZoneModel

import { Component, inject, signal } from '@angular/core';
import { ZoneService } from '@africanies/africanies-core';
import type { ZoneModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-zone-loader',
  standalone: true,
  template: \`
    <p>{{ zones().length }} zones</p>
    @if (zones()[0]; as first) {
      <p>{{ first.name }} · {{ first.type }}</p>
    }
  \`,
})
export class ZoneLoaderComponent {
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
const API_AUTH = `// POST /auth/forgot/password — email-only, unauthenticated. Body { email }.
// The backend emails a reset link. This frontend never shows a new-password
// form for that link (no token in the route).
// /onboarding/reset-password is a different flow (default_password first login).
// Admins can call the same forgot(email) from user/partner screens.

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, isValidEmail } from '@africanies/africanies-core';
import { ButtonComponent, TextInputComponent } from '@africanies/africanies-ui';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ButtonComponent, TextInputComponent, RouterLink],
  template: \`
    <p>We will send you a password reset link.</p>
    <africanies-text-input
      type="email"
      label="Email"
      autocomplete="email"
      [(value)]="email"
    />
    <button
      africanies-button
      type="button"
      variant="primary"
      [loading]="sending()"
      [disabled]="!canSubmit()"
      (click)="forgot()"
    >
      Send reset link
    </button>
    @if (status(); as copy) {
      <p>{{ copy }}</p>
      <a routerLink="/onboarding/login">Reset completed? Login here</a>
    }
  \`,
})
export class ForgotPasswordComponent {
  private readonly authApi = inject(AuthService);

  protected readonly email = signal('');
  protected readonly sending = signal(false);
  protected readonly status = signal<string | null>(null);
  protected readonly canSubmit = computed(() => isValidEmail(this.email()));

  protected async forgot(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    this.sending.set(true);
    this.status.set(null);
    try {
      const res = await firstValueFrom(this.authApi.forgot(this.email()));
      if (res.success) {
        this.status.set(res.message?.trim() || 'We have emailed your reset password.');
      } else {
        this.status.set(res.message?.trim() || 'Could not send a reset email.');
      }
    } finally {
      this.sending.set(false);
    }
  }
}
`;

export /**
 *
 */
const API_USER = `// GET  /user — bare user object (no { success, data } wrapper).
// POST /user/change/password — first-login default password.
// POST /user/logout-from-all-sessions — while the token is still set, then clear().
// After login/register in your app:
//   inject(AuthTokenService).set(access_token);
// UserService.me() then sends Authorization: Bearer …

import { Component, inject, signal } from '@angular/core';
import { AuthTokenService, UserService } from '@africanies/africanies-core';
import type { UserModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: \`
    @if (user(); as u) {
      <p>{{ u.name }} · {{ u.email }} · {{ u.main_region }}</p>
    }
  \`,
})
export class ProfileComponent {
  private readonly users = inject(UserService);
  private readonly auth = inject(AuthTokenService);
  protected readonly user = signal<UserModel | null>(null);

  async ngOnInit(): Promise<void> {
    // typically called right after login elsewhere:
    // this.auth.set(loginResponse.access_token);
    const res = await firstValueFrom(this.users.me());
    if (res.success && res.data) {
      this.user.set(res.data);
    }
  }

  logout(): void {
    this.users.logoutFromAllSessions().subscribe({
      next: () => this.auth.clear(),
      error: () => this.auth.clear(),
    });
  }
}
`;

export /**
 *
 */
const API_NOTIFICATION = `// GET /user/notifications/read/{id?} — auth required (ResourceId + UUID by id).
// PUT  /user/notifications/update — markRead(id) or markRead() for all
//
// Header badge: first page via readPage(). Drawer: infinite scroll via onNotificationLoadPage.

import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  AuthTokenService,
  mapNotificationInboxItem,
  NotificationService,
} from '@africanies/africanies-core';
import type { NotificationModel } from '@africanies/africanies-models';
import { NOTIFICATION_PAGE_SIZE } from '@africanies/africanies-models';
import type { AfricaniesNotification, NotificationPageResult } from '@africanies/africanies-ui';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-header-notifications',
  standalone: true,
  template: \`
    <africanies-app-shell-header
      title="Dashboard"
      [notifications]="notifications()"
      [onNotificationLoadPage]="loadNotificationPage"
      [onNotificationMarkRead]="markNotificationRead"
      [onNotificationMarkAllRead]="markAllNotificationsRead"
    />
  \`,
})
export class HeaderNotificationsComponent {
  private readonly auth = inject(AuthTokenService);
  private readonly notificationsApi = inject(NotificationService);

  protected readonly notifications = signal<AfricaniesNotification[]>([]);

  protected loadNotificationPage = (page: number) =>
    this.notificationsApi
      .readPage({ page, size: NOTIFICATION_PAGE_SIZE, order: 'desc' })
      .pipe(
        map(
          (res): NotificationPageResult => ({
            items:
              res.success && res.data
                ? res.data.map((row) => this.toHeaderItem(row))
                : [],
            pagination: res.pagination ?? null,
          }),
        ),
      );

  protected markNotificationRead = (id: string) =>
    this.notificationsApi.markRead(id).pipe(
      tap(() => this.patchRead(id)),
    );

  protected markAllNotificationsRead = () =>
    this.notificationsApi.markRead().pipe(
      tap(() =>
        this.notifications.update((items) =>
          items.map((item) => ({ ...item, read: true })),
        ),
      ),
    );

  constructor() {
    toObservable(this.auth.token)
      .pipe(
        switchMap((token) => {
          if (!token) {
            return of([] as AfricaniesNotification[]);
          }
          return this.notificationsApi
            .readPage({
              page: 1,
              size: NOTIFICATION_PAGE_SIZE,
              order: 'desc',
            })
            .pipe(
            map((res) =>
              res.success && res.data
                ? res.data.map((row) => this.toHeaderItem(row))
                : [],
            ),
            catchError(() => of([] as AfricaniesNotification[])),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((items) => this.notifications.set(items));
  }

  private patchRead(id: string): void {
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  private toHeaderItem(row: NotificationModel): AfricaniesNotification {
    const item = mapNotificationInboxItem(row);
    return {
      id: item.id,
      title: item.title,
      body: item.body,
      timestamp: item.timestamp,
      read: item.read,
      link: item.link,
      externalLink: item.external_link,
    };
  }
}
`;

export /**
 *
 */
const API_PRODUCT = `// GET /product/read/{id?} — ResourceId: null | 'all' | number.
// readPage() → paginated · readAll() → full · readById(n) → single ProductModel

import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '@africanies/africanies-core';
import type { ProductModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-loader',
  standalone: true,
  template: \`
    <p>{{ products().length }} products</p>
    @if (products()[0]; as first) {
      <p>{{ first.name }} — {{ first.hs_code }}</p>
    }
  \`,
})
export class ProductLoaderComponent implements OnInit {
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
const API_FILE = `// POST /file/read — body { ref } when a record stores file_ref.
// data.mime_type + data.base_64 for preview. Waybills: readMultiple(ref).

import { Component, inject, signal } from '@angular/core';
import { FileService } from '@africanies/africanies-core';
import type { FileReadModel } from '@africanies/africanies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-file-loader',
  standalone: true,
  template: \`
    @if (file(); as f) {
      <p>{{ f.mime_type }}</p>
      @if (f.base_64) {
        <img [src]="f.base_64" alt="" />
      } @else if (f.url) {
        <a [href]="f.url" target="_blank" rel="noopener">Open signed URL</a>
      }
    }
  \`,
})
export class FileLoaderComponent {
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
