import { JsonPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import {
  COUNTRY_READ_PATH,
  CountryService,
  MODE_CONFIG_PATH,
  ModeConfigService,
} from '@aies/aies-core';
import type { CountryModel, ModeConfigDataModel, ModeRegionConfigModel } from '@aies/aies-models';
import { ButtonComponent } from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  API_COUNTRY,
  API_MODE_CONFIG,
  API_OVERVIEW,
} from '../snippets';

/**
 * Live catalog of HTTP calls owned by `@aies/aies-core` services.
 */
@Component({
  selector: 'app-api-page',
  standalone: true,
  imports: [
    JsonPipe,
    ButtonComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Foundation"
        title="SDK API"
        description="HTTP endpoints the SDK calls for you — CountryService, ModeConfigService, and more as utilities land. Paths and snake→camel mapping live in @aies/aies-core; shapes come from @aies/aies-models."
      />

      <app-demo-section
        title="Bootstrap"
        hint="provideAiesSdk + provideAiesHttpClient — ApiClient resolves relative paths against baseUrl."
        [code]="overviewCode"
      >
        <dl class="m-0 grid gap-3 text-body-sm sm:grid-cols-2">
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
            >{{ first | json }}</pre>
          } @else {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No countries returned.
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
                      {{ region.currencySymbol }} {{ region.currency }}
                    </p>
                    <p class="m-0 mt-1 text-caption text-neutral-600 dark:text-neutral-400">
                      {{ region.massUnit }} · {{ region.dimensionUnit }}
                    </p>
                  } @else {
                    <p class="m-0 mt-2 text-caption text-neutral-500">No config yet</p>
                  }
                </div>
              }
            </div>
            <pre
              class="m-0 max-h-48 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
            >{{ modeConfig() | json }}</pre>
          }
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ApiPage implements OnInit {
  private readonly countriesApi = inject(CountryService);
  private readonly modeConfigApi = inject(ModeConfigService);

  protected readonly MODE_CONFIG_PATH = MODE_CONFIG_PATH;
  protected readonly COUNTRY_READ_PATH = COUNTRY_READ_PATH;

  protected readonly overviewCode = API_OVERVIEW;
  protected readonly countryCode = API_COUNTRY;
  protected readonly modeConfigCode = API_MODE_CONFIG;

  protected readonly countries = signal<CountryModel[]>([]);
  protected readonly countriesLoading = signal(false);
  protected readonly countriesError = signal<string | null>(null);

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

  private syncModeFromService(): void {
    this.modeConfig.set(this.modeConfigApi.config());
  }
}
