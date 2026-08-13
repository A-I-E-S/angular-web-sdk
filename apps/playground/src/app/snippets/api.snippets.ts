/**
 * Playground snippets — SDK HTTP services (@aies/aies-core).
 */

export /**
 *
 */
const API_OVERVIEW = `// Domain services in @aies/aies-core own paths and mapping.
// Apps call inject(CountryService) / ModeConfigService / ShipmentMethodService /
// WarehouseService / ZoneService / UserService — not raw URLs.
// ApiClient normalizes every response to ApiResponseModel<T>
// (including bare GET /user bodies with no success/data wrapper).

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
const API_COUNTRY = `// GET /public/country/read/{id|all} — default id is 'all'.
// CountryService maps into CountryModel[] (snake_case keys, e.g. state_code).

import { Component, inject, signal } from '@angular/core';
import { CountryService } from '@aies/aies-core';
import type { CountryModel } from '@aies/aies-models';
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

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.countriesApi.read());
    if (res.success && res.data) {
      this.countries.set(res.data);
    }

    // Single country (still an array):
    // await firstValueFrom(this.countriesApi.readById(1));
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
const API_SHIPMENT_METHOD = `// GET /shipment_method/read/{id|all} — carriers / shipment methods.
// ShipmentMethodService maps into ShipmentMethodModel[] (snake_case, including zone_values).

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
    const res = await firstValueFrom(this.methodsApi.read());
    if (res.success && res.data) {
      this.methods.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const API_WAREHOUSE = `// GET /warehouse/read/{id|all} — warehouses with nested country + state.
// WarehouseService maps snake_case; nested country reuses the country mapper.

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
    const res = await firstValueFrom(this.warehousesApi.read());
    if (res.success && res.data) {
      this.warehouses.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const API_ZONE = `// GET /zone/read/records/{id|all} — shipping zones.
// ZoneService maps snake_case timestamps; data is always ZoneModel[].

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
    const res = await firstValueFrom(this.zonesApi.read());
    if (res.success && res.data) {
      this.zones.set(res.data);
    }
  }
}
`;

export /**
 *
 */
const API_USER = `// GET /user — bare user object (no { success, data } wrapper).
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
}
`;
