/**
 * Playground snippets — SDK HTTP services (@aies/aies-core).
 */

export /**
 *
 */
const API_OVERVIEW = `// Domain services in @aies/aies-core own paths and mapping.
// Apps call inject(CountryService) / inject(ModeConfigService) — not raw URLs.
// ApiClient normalizes every response to ApiResponseModel<T>.

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
// CountryService maps state_code → stateCode; data is always CountryModel[].

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
      <p>{{ r.currencySymbol }} · {{ r.massUnit }} · {{ r.dimensionUnit }}</p>
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
