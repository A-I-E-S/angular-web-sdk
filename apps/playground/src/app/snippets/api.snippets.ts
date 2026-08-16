/**
 * Playground snippets — SDK HTTP services (@aies/aies-core).
 */

export /**
 *
 */
const API_OVERVIEW = `// Domain services in @aies/aies-core own paths and mapping.
// Apps call inject(CountryService) / ProductService / … — or ApiClient for custom routes.
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
//   // or overloads: getResource(base, null | 'all' | number, query?)
//   // path helper:  buildResourcePath('/my/read', id)

import { ApplicationConfig } from '@angular/core';
import {
  provideAiesSdk,
  provideAiesHttpClient,
} from '@aies/aies-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAiesSdk({
      baseUrl: 'https://test-api-export.africaniestest.com/api',
      // loadModeConfig: true by default → GET /public/mode/config on startup
    }),
    provideAiesHttpClient(),
  ],
};
`;

export /**
 *
 */
const API_COUNTRY = `// GET /public/country/read/{id?} — ResourceId: null | 'all' | number.
// read() / readPage() → paginated CountryModel[]
// readAll()            → full CountryModel[]
// readById(1)          → single CountryModel

import { Component, inject, signal } from '@angular/core';
import { CountryService } from '@aies/aies-core';
import type { CountryModel, PaginationMetaModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-country-loader',
  standalone: true,
  template: \`
    <p>{{ countries().length }} countries</p>
    @if (countries()[0]; as first) {
      <p>{{ first.name }} ({{ first.iso2 }})</p>
    }
  \`,
})
export class CountryLoaderComponent {
  private readonly countriesApi = inject(CountryService);
  protected readonly countries = signal<CountryModel[]>([]);
  protected readonly meta = signal<PaginationMetaModel | null>(null);

  async ngOnInit(): Promise<void> {
    // Paginated (default):
    const page = await firstValueFrom(this.countriesApi.readPage({ page: 1 }));
    if (page.success && page.data) {
      this.countries.set(page.data);
      this.meta.set(page.pagination);
    }

    // Full dump:  await firstValueFrom(this.countriesApi.readAll());
    // One record: await firstValueFrom(this.countriesApi.readById(1));
  }
}
`;

export /**
 *
 */
const API_MODE_CONFIG = `// GET /public/mode/config — usually loaded at bootstrap via provideAiesSdk.
// ModeConfigService hydrates storage; getRegionConfig(country) reads STN/SFN units.

import { Component, inject } from '@angular/core';
import { ModeConfigService } from '@aies/aies-core';

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
import { ShipmentMethodService } from '@aies/aies-core';
import type { ShipmentMethodModel } from '@aies/aies-models';
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
import { WarehouseService } from '@aies/aies-core';
import type { WarehouseModel } from '@aies/aies-models';
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
import { ZoneService } from '@aies/aies-core';
import type { ZoneModel } from '@aies/aies-models';
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
import { AuthService, isValidEmail } from '@aies/aies-core';
import { ButtonComponent, TextInputComponent } from '@aies/aies-ui';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ButtonComponent, TextInputComponent, RouterLink],
  template: \`
    <p>We will send you a password reset link.</p>
    <aies-text-input
      type="email"
      label="Email"
      autocomplete="email"
      [(value)]="email"
    />
    <button
      aies-button
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
import { AuthTokenService, UserService } from '@aies/aies-core';
import type { UserModel } from '@aies/aies-models';
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
} from '@aies/aies-core';
import type { NotificationModel } from '@aies/aies-models';
import { NOTIFICATION_PAGE_SIZE } from '@aies/aies-models';
import type { AiesNotification, NotificationPageResult } from '@aies/aies-ui';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-header-notifications',
  standalone: true,
  template: \`
    <aies-app-shell-header
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

  protected readonly notifications = signal<AiesNotification[]>([]);

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
            return of([] as AiesNotification[]);
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
            catchError(() => of([] as AiesNotification[])),
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

  private toHeaderItem(row: NotificationModel): AiesNotification {
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
import { ProductService } from '@aies/aies-core';
import type { ProductModel } from '@aies/aies-models';
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
const API_FILE = `// POST /file/read — body { ref }.
// data is a single FileReadModel (not a list). Prefer url for downloads.

import { Component, inject, signal } from '@angular/core';
import { FileService } from '@aies/aies-core';
import type { FileReadModel } from '@aies/aies-models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-file-loader',
  standalone: true,
  template: \`
    @if (file(); as f) {
      <p>{{ f.mime_type }}</p>
      <a [href]="f.url" target="_blank" rel="noopener">Open signed URL</a>
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
