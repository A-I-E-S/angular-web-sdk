import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { delay, type Observable,of, switchMap, throwError } from 'rxjs';

import type {
  FilterParams,
  FilterState,
  ModuleFilterConfig,
} from '@aies/aies-models';
import {
  emptyFilterState,
  FILTER_CONFIGS,
  fromFilterParams,
  shipmentTrackingItemFilterConfig,
  toFilterParams,
  trackShipmentsFilterConfig,
  updateShipmentsFilterConfig,
  usersFilterConfig,
} from '@aies/aies-models';
import { ButtonComponent, FilterDrawerService } from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  FILTERS_ASYNC_OPTIONS,
  FILTERS_AUTHOR_CONFIG,
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
  config: ModuleFilterConfig;
  optionLists?: Record<string, { value: string; label: string }[]>;
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
        description="One ModuleFilterConfig per list module drives a shared drawer. Keep FilterState as a values map; flatten with toFilterParams only at the URL / HTTP edge."
      />

      <app-demo-section
        title="Open drawer + onApply"
        hint="Pick a seed config, open the drawer, Apply. The drawer stays open until the fake list request succeeds, then closes."
        subtext="Pass onApply: ({ params }) => yourHttpCall(params). Errors leave the drawer open with a message. Omit onApply only for sync/local demos."
        [code]="openApplyCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            @for (mod of modules; track mod.id) {
              <button
                aies-button
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
              aies-button
              type="button"
              variant="primary"
              (click)="openFilters()"
            >
              Open filters
            </button>
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              (click)="openFiltersFail()"
            >
              Open (demo Apply error)
            </button>
            <button
              aies-button
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
                activeConfig().transport
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
        title="Author a ModuleFilterConfig"
        hint="Full update-shipments schema: search, date, sort, pagination, enums with colors, static + async selects, booleans."
        subtext="Field type picks the control. transport picks serialize shape. Seed configs live in @aies/aies-models (FILTER_CONFIGS)."
        [code]="authorConfigCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Open the
          <span class="font-medium text-ink dark:text-white">Update shipments</span>
          module above to exercise every field type in the live drawer.
        </p>
      </app-demo-section>

      <app-demo-section
        title="Enum chips + colors"
        hint="Optional color on each option tints the selected chip only. Idle chips use neutral borders."
        subtext="color is never included in toFilterParams — it is a UI hint only."
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
        hint="Choosing fields in “Filter by” reveals their controls. Deselecting a chip removes that section."
        subtext="field.key must stay stable — it becomes the API column name (legacy) or query key (named)."
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
        hint="Date column select + From / To. Clear resets only the date block. To cannot be before From."
        subtext="Serialized as from, to, and date (column name) — not as filterColumn entries."
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
        hint="filterColumn + filterValue CSV pairs aligned by index — current Laravel list contract."
        subtext="Only fields with values are included. Empty strings are omitted. Prefer an internal values map; flatten at the boundary."
        [code]="legacyCode"
      >
        <div class="flex flex-col gap-3">
          <button
            aies-button
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
        hint="Each field key is its own query param (no filterColumn / filterValue)."
        subtext="Same drawer + FilterState — only ModuleFilterConfig.transport changes the wire format."
        [code]="namedCode"
      >
        <button
          aies-button
          type="button"
          variant="primary"
          (click)="openNamed()"
        >
          Open tracking-item filters
        </button>
      </app-demo-section>

      <app-demo-section
        title="Async option lists"
        hint="Host resolves warehouses / carriers / manifests and passes optionLists keyed by field.key."
        subtext="Keys must match field.key (warehouse_id), not optionsSource (warehouses). Static selects use inline options instead."
        [code]="asyncOptionsCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Update shipments already wires mock
          <span class="pg-code">optionLists</span>
          in this playground — open that module and expand the select fields.
        </p>
      </app-demo-section>

      <app-demo-section
        title="Cold load from URL"
        hint="Rebuild FilterState from router queryParams on first paint so shared links restore filters."
        subtext="fromFilterParams zips legacy CSV pairs back into values[key]. Unknown columns are still restored so round-trips survive config drift."
        [code]="hydrateCode"
      >
        <button
          aies-button
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

  protected readonly openApplyCode = FILTERS_OPEN_APPLY;
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
      optionLists: {
        warehouse_id: [
          { value: '1', label: 'Lagos Hub' },
          { value: '2', label: 'Accra Hub' },
        ],
        shipment_method_id: [
          { value: '10', label: 'DHL' },
          { value: '11', label: 'FedEx' },
        ],
        shipment_manifest_id: [
          { value: '100', label: 'Manifest A' },
          { value: '101', label: 'Manifest B' },
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
  protected readonly state = signal<FilterState>(emptyFilterState());
  protected readonly lastParams = signal<FilterParams>(
    toFilterParams(emptyFilterState(), trackShipmentsFilterConfig),
  );

  protected activeConfig(): ModuleFilterConfig {
    return (
      this.modules.find((m) => m.id === this.activeId())?.config ??
      FILTER_CONFIGS['track-shipments']
    );
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
        onApply: ({ params }) => of(params).pipe(delay(500)),
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.applied) {
          return;
        }
        this.activeId.set(shipmentTrackingItemFilterConfig.id);
        this.state.set(result.state);
        this.lastParams.set(result.params);
      });
  }

  protected runLegacyDemo(): void {
    const state: FilterState = {
      search: 'SFN-1042',
      date: 'created_at',
      from: '2026-01-01',
      to: '2026-01-31',
      order: 'desc',
      page: 1,
      size: 20,
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
    this.state.set(emptyFilterState());
    this.lastParams.set(toFilterParams(this.state(), this.activeConfig()));
  }

  private openWithApply(
    onApply: (draft: {
      state: FilterState;
      params: FilterParams;
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
        optionLists: mod.optionLists,
        title: mod.label,
        onApply,
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
