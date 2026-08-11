import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import type {
  FilterParams,
  FilterState,
  ModuleFilterConfig,
} from '@aies/aies-models';
import {
  emptyFilterState,
  FILTER_CONFIGS,
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
  FILTERS_LEGACY,
  FILTERS_NAMED,
  FILTERS_OVERVIEW,
} from '../snippets';

interface DemoModule {
  id: string;
  label: string;
  config: ModuleFilterConfig;
  optionLists?: Record<string, { value: string; label: string }[]>;
}

/**
 * Schema-driven list filters — drawer from ModuleFilterConfig + serialize helpers.
 */
@Component({
  selector: 'app-filters-page',
  standalone: true,
  imports: [
    ButtonComponent,
    DemoSectionComponent,
    PageHeaderComponent,
    JsonPipe,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Filters"
        description="Uniform list filters: ModuleFilterConfig per module, shared drawer, FilterState map → legacy CSV or named query params."
      />

      <app-demo-section
        title="Open filter drawer"
        hint="Pick a seed config, apply filters, inspect the serialized params bag."
        [code]="overviewCode"
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
              toFilterParams(state, config)
            </div>
            <pre
              class="m-0 max-h-64 overflow-auto p-4 font-mono text-caption leading-relaxed text-white/90"
            >{{ lastParams() | json }}</pre>
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="legacy-parallel"
        hint="filterColumn + filterValue comma strings — current Laravel list contract."
        [code]="legacyCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Only fields with values are included. Prefer an internal
          <span class="pg-code">values</span> map; flatten at the boundary.
        </p>
      </app-demo-section>

      <app-demo-section
        title="named transport"
        hint="Newer modules (e.g. shipment-tracking-item) use direct query keys."
        [code]="namedCode"
      >
        <button
          aies-button
          type="button"
          variant="secondary"
          size="sm"
          (click)="openNamed()"
        >
          Open named-transport demo
        </button>
      </app-demo-section>

      <app-demo-section
        title="Async option lists"
        hint="Host resolves warehouses / carriers and passes optionLists into the drawer."
        [code]="asyncCode"
      >
        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Update shipments seed config uses
          <span class="pg-code">optionsSource</span> — playground supplies mock
          warehouses and methods when you open that module above.
        </p>
      </app-demo-section>
    </div>
  `,
})
export class FiltersPage {
  private readonly filterDrawer = inject(FilterDrawerService);

  protected readonly overviewCode = FILTERS_OVERVIEW;
  protected readonly legacyCode = FILTERS_LEGACY;
  protected readonly namedCode = FILTERS_NAMED;
  protected readonly asyncCode = FILTERS_ASYNC_OPTIONS;

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
          { value: '2', label: 'Abuja Depot' },
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

  protected openNamed(): void {
    this.filterDrawer
      .open({
        config: shipmentTrackingItemFilterConfig,
        state: emptyFilterState(),
        title: 'Tracking items',
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

  protected reset(): void {
    this.state.set(emptyFilterState());
    this.lastParams.set(toFilterParams(this.state(), this.activeConfig()));
  }
}
