import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { delay, type Observable, of, switchMap, tap, throwError } from 'rxjs';

import type {
  FilterParamsModel,
  FilterStateModel,
  ModuleFilterConfigModel,
} from '@africanies/africanies-models';
import {
  emptyFilterState,
  FILTER_CONFIGS,
  fromFilterParams,
  resolveFilterTransport,
  shipmentTrackingItemFilterConfig,
  toFilterParams,
  trackShipmentsFilterConfig,
  updateShipmentsFilterConfig,
  usersFilterConfig,
} from '@africanies/africanies-models';
import { ButtonComponent, FilterDrawerService, FilterQueryService, ToastService } from '@africanies/africanies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { playgroundErrorMessage } from '../shared/playground-notify';
import {
  FILTERS_ASYNC_OPTIONS,
  FILTERS_AUTHOR_CONFIG,
  FILTERS_CUSTOM_CONFIG,
  FILTERS_DATE_RANGE,
  FILTERS_ENUM_COLORS,
  FILTERS_FILTER_BY,
  FILTERS_HYDRATE,
  FILTERS_LEGACY,
  FILTERS_NAMED,
  FILTERS_OPEN_APPLY,
} from '../snippets';

interface DemoModule {
  id: string;
  label: string;
  config: ModuleFilterConfigModel;
  /** Host-only optionLists merged after {@link FilterOptionsResolver} (e.g. manifests). */
  optionListOverrides?: Record<string, { value: string; label: string }[]>;
}

/**
 * Schema-driven list filters — full working demos + non-abbreviated snippets.
 */
@Component({
  selector: 'app-filters-page',
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
        eyebrow="Components"
        title="Filters"
        description="Schema-driven filter drawer for list pages. Author one ModuleFilterConfigModel per module; keep FilterStateModel as a values map in the UI. The drawer hydrates from the browser URL when filter queries are present, and Apply writes that bag back to the URL."
      />

      <app-demo-section
        title="Open drawer + onApply"
        hint="End-to-end flow: pick a module config, open the shared drawer, Apply runs your async work, then the drawer closes."
        subtext="Wire onApply to your list fetch. If the call fails, the drawer stays open with an error. Skip onApply for local-only demos."
        [code]="openApplyCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            @for (mod of modules; track mod.id) {
              <button
                africanies-button
                type="button"
                [variant]="activeId() === mod.id ? 'primary' : 'secondary'"
                size="sm"
                (click)="selectModule(mod)"
              >
                {{ mod.label }}
              </button>
            }
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              africanies-button
              type="button"
              variant="primary"
              (click)="openFilters()"
            >
              Open filters
            </button>
            <button
              africanies-button
              type="button"
              variant="secondary"
              size="sm"
              (click)="openFiltersFail()"
            >
              Open (demo Apply error)
            </button>
            <button
              africanies-button
              type="button"
              variant="ghost"
              size="sm"
              (click)="reset()"
            >
              Reset state
            </button>
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Active:
              <span class="font-medium text-ink dark:text-white">{{
                activeId()
              }}</span>
              · transport
              <span class="font-mono text-caption">{{
                transportLabel()
              }}</span>
            </p>
          </div>

          <div
            class="overflow-hidden rounded-xl border border-border bg-[#1e1e1e] text-white dark:border-white/10"
          >
            <div
              class="border-b border-white/10 px-4 py-2 text-caption font-medium uppercase tracking-wide text-white/50"
            >
              Live host state → toFilterParams(state, config)
            </div>
            <pre
              class="m-0 max-h-64 overflow-auto p-4 font-mono text-caption leading-relaxed text-white/90"
            >{{ lastParams() | json }}</pre>
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Custom ModuleFilterConfigModel"
        hint="Define your own schema per list screen — field keys must match API column / query names. Omit transport for legacy Laravel CSV; use FilterTransport.Named for direct params."
        subtext="Full seed configs (track-shipments, update-shipments, …) live in FILTER_CONFIGS. Expand “Full seed example” below for every field type."
        [code]="customConfigCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Open
          <span class="font-medium text-ink dark:text-white">Update shipments</span>
          above to exercise every field type in the live drawer.
        </p>
      </app-demo-section>

      <app-demo-section
        title="Full seed example (update-shipments)"
        hint="Reference config bundled with the SDK — search, date range, sort, enums, selects, booleans."
        subtext="Field type chooses the control; transport chooses the query shape."
        [code]="authorConfigCode"
      />

      <app-demo-section
        title="Enum chips + colors"
        hint="Status-style options as chips. Optional color highlights only the selected chip — never the wire payload."
        subtext="color stays in the UI — it never goes out in toFilterParams."
        [code]="enumColorsCode"
      >
        <div class="flex flex-wrap gap-2">
          @for (opt of shipmentStatusOptions; track opt.value) {
            <button
              type="button"
              class="rounded-md border px-2.5 py-1.5 text-body-sm transition-colors"
              [style.color]="
                demoEnum() === opt.value ? opt.color : null
              "
              [style.border-color]="
                demoEnum() === opt.value ? opt.color : null
              "
              [style.background-color]="
                demoEnum() === opt.value ? opt.color + '1A' : null
              "
              [class]="
                demoEnum() === opt.value
                  ? 'font-medium'
                  : 'border-neutral-300 text-neutral-600 dark:border-white/15 dark:text-neutral-300'
              "
              (click)="demoEnum.set(opt.value)"
            >
              {{ opt.label }}
            </button>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="Filter by (multi-select)"
        hint="Let users choose which fields appear in the drawer. Add a chip to show a control; remove it to hide that section."
        subtext="Keep field.key stable — it becomes the API column (legacy) or query key (named)."
        [code]="filterByCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Try it in the live drawer: open
          <span class="font-medium text-ink dark:text-white">Update shipments</span>,
          add several Filter by rows, Apply, and inspect the params bag above.
        </p>
      </app-demo-section>

      <app-demo-section
        title="Date range"
        hint="Filter by a date column with From / To. Clear resets only this block; the range fields constrain each other."
        subtext="Goes out as from, to, and date — not as filterColumn pairs."
        [code]="dateRangeCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Open any module that declares
          <span class="pg-code">config.date</span>
          and use Clear after picking a range.
        </p>
      </app-demo-section>

      <app-demo-section
        title="legacy-parallel transport"
        hint="Older APIs that expect filterColumn / filterValue CSV pairs aligned by index. Use this when the backend still speaks that format."
        subtext="Empty values are skipped. Keep a values map inside the app; flatten when you hit the API."
        [code]="legacyCode"
      >
        <div class="flex flex-col gap-3">
          <button
            africanies-button
            type="button"
            variant="secondary"
            size="sm"
            (click)="runLegacyDemo()"
          >
            Run serialize → hydrate round-trip
          </button>
          <pre
            class="m-0 max-h-48 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
          >{{ legacyDemoJson() }}</pre>
        </div>
      </app-demo-section>

      <app-demo-section
        title="named transport"
        hint="Newer APIs where each field key is its own query param (e.g. status=pending). Same drawer UI — only the wire format changes."
        subtext="Same drawer and state — only transport flips the wire format."
        [code]="namedCode"
      >
        <button
          africanies-button
          type="button"
          variant="primary"
          (click)="openNamed()"
        >
          Open tracking-item filters
        </button>
      </app-demo-section>

      <app-demo-section
        title="Async option lists"
        hint="Select fields with optionsSource load lazily when added via Filter by. SDK catalogs toast on HTTP failure; the select shows a field error."
        subtext="Host optionLists cover sources without a built-in service (e.g. manifests)."
        [code]="asyncOptionsCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Open
          <span class="font-medium text-ink dark:text-white">Update shipments</span>
          — add Warehouse or Carrier under Filter by; catalogs load then (paste a token
          via <span class="font-medium text-ink dark:text-white">API token</span>
          in the header). Manifests use playground mocks.
        </p>
      </app-demo-section>

      <app-demo-section
        title="Cold load from URL"
        hint="Restore filters from the query string on first paint so shared list links reopen with the same criteria."
        subtext="FilterQueryService.read() uses fromFilterParams. Apply / pagination keep the URL in sync — try Open filters then check the address bar."
        [code]="hydrateCode"
      >
        <button
          africanies-button
          type="button"
          variant="secondary"
          size="sm"
          (click)="runHydrateDemo()"
        >
          Hydrate from sample query bag
        </button>
        <pre
          class="mt-3 m-0 max-h-48 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
        >{{ hydrateDemoJson() }}</pre>
      </app-demo-section>
    </div>
  `,
})
export class FiltersPage {
  private readonly filterDrawer = inject(FilterDrawerService);
  private readonly filterQuery = inject(FilterQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly openApplyCode = FILTERS_OPEN_APPLY;
  protected readonly customConfigCode = FILTERS_CUSTOM_CONFIG;
  protected readonly authorConfigCode = FILTERS_AUTHOR_CONFIG;
  protected readonly enumColorsCode = FILTERS_ENUM_COLORS;
  protected readonly filterByCode = FILTERS_FILTER_BY;
  protected readonly dateRangeCode = FILTERS_DATE_RANGE;
  protected readonly legacyCode = FILTERS_LEGACY;
  protected readonly namedCode = FILTERS_NAMED;
  protected readonly asyncOptionsCode = FILTERS_ASYNC_OPTIONS;
  protected readonly hydrateCode = FILTERS_HYDRATE;

  protected readonly shipmentStatusOptions = [
    { value: 'pending', label: 'Pending', color: '#DBB316' },
    { value: 'in-process', label: 'In Process', color: '#3B82F6' },
    { value: 'completed', label: 'Completed', color: '#25945c' },
  ];
  protected readonly demoEnum = signal<string | null>('pending');

  protected readonly legacyDemoJson = signal('// Click the button to run');
  protected readonly hydrateDemoJson = signal('// Click the button to run');

  protected readonly modules: DemoModule[] = [
    {
      id: 'track-shipments',
      label: 'Track shipments',
      config: trackShipmentsFilterConfig,
    },
    {
      id: 'update-shipments',
      label: 'Update shipments',
      config: updateShipmentsFilterConfig,
      optionListOverrides: {
        shipment_manifest_id: [
          { value: '100', label: 'Manifest A (playground mock)' },
          { value: '101', label: 'Manifest B (playground mock)' },
        ],
      },
    },
    {
      id: 'users',
      label: 'Users',
      config: usersFilterConfig,
    },
  ];

  protected readonly activeId = signal(
    this.modules[0]?.id ?? 'track-shipments',
  );
  protected readonly state = signal<FilterStateModel>(emptyFilterState());
  protected readonly lastParams = signal<FilterParamsModel>(
    toFilterParams(emptyFilterState(), trackShipmentsFilterConfig),
  );

  constructor() {
    this.hydrateFromUrl(this.activeConfig());
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => {
      this.hydrateFromUrl(this.activeConfig());
    });
  }

  protected activeConfig(): ModuleFilterConfigModel {
    return (
      this.modules.find((m) => m.id === this.activeId())?.config ??
      FILTER_CONFIGS['track-shipments']
    );
  }

  protected transportLabel(): string {
    return resolveFilterTransport(this.activeConfig());
  }

  protected selectModule(mod: DemoModule): void {
    this.activeId.set(mod.id);
    this.state.set(emptyFilterState());
    this.lastParams.set(toFilterParams(this.state(), mod.config));
  }

  protected openFilters(): void {
    this.openWithApply((params) => of(params).pipe(delay(500)));
  }

  /** Same open flow but onApply errors so the drawer stays open. */
  protected openFiltersFail(): void {
    this.openWithApply(() =>
      of(null).pipe(
        delay(400),
        switchMap(() =>
          throwError(() => new Error('List request failed (playground demo)')),
        ),
      ),
    );
  }

  protected openNamed(): void {
    this.filterDrawer
      .open({
        config: shipmentTrackingItemFilterConfig,
        state: emptyFilterState(),
        title: 'Tracking items',
        onApply: ({ params }) =>
          of(params).pipe(
            delay(500),
            tap(() =>
              this.toast.success('Named-transport filters applied.', 'Applied'),
            ),
          ),
      })
      .afterClosed()
      .subscribe({
        next: (result) => {
          if (!result?.applied) {
            return;
          }
          this.activeId.set(shipmentTrackingItemFilterConfig.id);
          this.state.set(result.state);
          this.lastParams.set(result.params);
        },
        error: (err) => {
          this.toast.error(
            playgroundErrorMessage(err),
            'Filters failed',
          );
        },
      });
  }

  protected runLegacyDemo(): void {
    const state: FilterStateModel = {
      search: 'SFN-1042',
      date: 'created_at',
      from: '2026-01-01',
      to: '2026-01-31',
      order: 'desc',
      page: 1,
      size: 15,
      values: {
        payment_status: 'paid',
        shipment_status: 'pending',
        tracking_number: 'TN-9',
      },
    };
    const params = toFilterParams(state, trackShipmentsFilterConfig);
    const restored = fromFilterParams(params, trackShipmentsFilterConfig);
    this.legacyDemoJson.set(
      JSON.stringify({ params, restored }, null, 2),
    );
  }

  protected runHydrateDemo(): void {
    const query = {
      search: 'SFN',
      filterColumn: 'payment_status,shipment_status',
      filterValue: 'unpaid,completed',
      from: '2026-02-01',
      to: '2026-02-28',
      date: 'created_at',
    };
    const restored = fromFilterParams(query, trackShipmentsFilterConfig);
    this.state.set(restored);
    this.lastParams.set(toFilterParams(restored, trackShipmentsFilterConfig));
    this.hydrateDemoJson.set(JSON.stringify(restored, null, 2));
  }

  protected reset(): void {
    const next = emptyFilterState();
    this.state.set(next);
    this.lastParams.set(toFilterParams(next, this.activeConfig()));
    void this.filterQuery.write(next, this.activeConfig());
  }

  private hydrateFromUrl(config: ModuleFilterConfigModel): void {
    if (!this.filterQuery.hasParams(config)) {
      return;
    }
    const restored = this.filterQuery.read(config);
    this.state.set(restored);
    this.lastParams.set(toFilterParams(restored, config));
  }

  private openWithApply(
    onApply: (draft: {
      state: FilterStateModel;
      params: FilterParamsModel;
    }) => Observable<unknown>,
  ): void {
    const mod =
      this.modules.find((m) => m.id === this.activeId()) ?? this.modules[0];
    if (!mod) {
      return;
    }

    this.filterDrawer
      .open({
        config: mod.config,
        state: this.state(),
        optionLists: mod.optionListOverrides,
        title: mod.label,
        onApply: (draft) =>
          onApply(draft).pipe(
            tap({
              next: () =>
                this.toast.success(
                  `${mod.label} filters applied.`,
                  'Applied',
                ),
              error: (err) =>
                this.toast.error(
                  playgroundErrorMessage(err),
                  'Apply failed',
                ),
            }),
          ),
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.applied) {
          return;
        }
        this.state.set(result.state);
        this.lastParams.set(result.params);
      });
  }
}
