/**
 * Playground code snippets — Models (@aies/aies-models).
 */

export const MODELS_IMPORT = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Share API and UI state shapes across features without Angular runtime.
// Prerequisites: @aies/aies-models package; type-only imports (no providers).
// Do:            Use AsyncQueryState with aies-async-state; PaginationMeta with
//                aies-pagination; ShippingMode with ShippingModeService toggles.
// Don't:        Duplicate these interfaces in feature code — import from aies-models.
// ───────────────────────────────────────────────────────────────────────

import type {
  AsyncQueryState,
  ApiResponseModel,
  PaginationMeta,
  PaginationQueryParams,
  ResourceId,
  ShippingMode,
  ModeConfigData,
} from '@aies/aies-models';

// Types only — safe to import from services, components, and plain TS modules.
// No NgModule / provider setup required for this package.
`;

export const MODELS_API_RESPONSE = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Handle the canonical API envelope from ApiClient (wrapped mode).
// Prerequisites: @aies/aies-models (ApiResponseModel, ApiErrorDetail);
//                @aies/aies-core ApiClient.
// Do:            Null-check every envelope field — all are T | null, never undefined.
//                Map res.errors to form field messages when present.
// Don't:        Assume pagination exists on single-resource responses.
//                Treat res.success === false as failure even when HTTP status is 200.
// ───────────────────────────────────────────────────────────────────────

import { inject } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type { ApiErrorDetail, ApiResponseModel } from '@aies/aies-models';
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

  private applyFieldErrors(errors: ApiErrorDetail[] | null): void {
    if (!errors?.length) {
      return;
    }
    for (const err of errors) {
      // err.field → form control; err.message → validation copy; err.code → i18n key
    }
  }
}
`;

export const MODELS_PAGINATION = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       List fetches with ResourceId + PaginationQueryParams → PaginationMeta.
// Prerequisites: @aies/aies-models; @aies/aies-core ApiClient.getResource;
//                aies-pagination for UI.
// Do:            Pass null id for paginated lists; 'all' for unpaginated exports;
//                number id for detail. Bind res.pagination to aies-pagination [meta].
// Don't:        Client-slice a full dataset when the API supports page/size.
//                Send pagination query params on single-record GETs.
// ───────────────────────────────────────────────────────────────────────

import { Component, inject, signal } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type {
  ApiResponseModel,
  PaginationMeta,
  PaginationQueryParams,
  ResourceId,
} from '@aies/aies-models';
import { PaginationComponent } from '@aies/aies-ui';
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
      <aies-pagination [meta]="pager" (pageChange)="onPageChange($event)" />
    }
  \`,
})
export class ShipmentListComponent {
  private readonly api = inject(ApiClient);

  protected readonly meta = signal<PaginationMeta | null>(null);
  protected readonly rows = signal<Shipment[]>([]);

  protected readonly page = signal(1);

  async loadPage(): Promise<void> {
    const listId: ResourceId = null;
    const query: PaginationQueryParams = {
      page: this.page(),
      size: 20,
      order: '-createdAt',
    };

    const res: ApiResponseModel<Shipment[]> = await firstValueFrom(
      this.api.getResource<Shipment>('shipments', listId, query),
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

  // Unpaginated export: getResource('shipments', 'all')
  // Single record:       getResource('shipments', 42)
}
`;

export const MODELS_ASYNC_STATE = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Map fetch signals into AsyncQueryState for aies-async-state.
// Prerequisites: @aies/aies-models AsyncQueryState; @aies/aies-ui AsyncStateComponent.
// Do:            Distinguish isLoading (first paint) from isFetching (background refresh).
//                Keep error as string | null — map query errors to human copy.
//                Wire (retry) on AsyncState to the same refetch entry point.
// Don't:        Set data to null on refetch — use undefined until first success.
//                Show ErrorState inside the table — wrap the list boundary.
// ───────────────────────────────────────────────────────────────────────

import { Component, computed, inject, signal } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type { AsyncQueryState } from '@aies/aies-models';
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
    (): AsyncQueryState<Shipment[]> => ({
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
        this.api.getResource<Shipment[]>('shipments', null, { page: 1, size: 20 }),
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

export const MODELS_SHIPPING_MODE = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Type-safe STN / SFN mode literals across theme and HTTP layers.
// Prerequisites: @aies/aies-models ShippingMode; @aies/aies-core ShippingModeService.
// Do:            Read active mode from ShippingModeService in UI; persist user choice
//                via the service API. Align feature flags and copy with 'stn' | 'sfn'.
// Don't:        Hard-code accent colors — ModeColorService follows active mode.
//                Send arbitrary strings on x-shipment-mode — use the literal union.
// ───────────────────────────────────────────────────────────────────────

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

export const MODELS_MODE_CONFIG = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Resolve region units and currency from the public mode-config payload.
// Prerequisites: @aies/aies-models ModeConfigData, ModeRegionConfig, ShippingMode.
// Do:            Pick sfn vs stn branch first, then country key with default fallback.
//                Treat SFN (ng) and STN (us/cn/gb) key sets as intentionally different.
// Don't:        Assume every mode exposes the same country keys.
//                Parse snake_case in feature code — normalize once at the API boundary.
// ───────────────────────────────────────────────────────────────────────

import type {
  ModeConfigData,
  ModeRegionConfig,
  ShippingMode,
} from '@aies/aies-models';

export function resolveRegionConfig(
  config: ModeConfigData,
  mode: ShippingMode,
  countryCode: string,
): ModeRegionConfig {
  const branch = mode === 'sfn' ? config.sfn : config.stn;
  const key = countryCode.toLowerCase() as keyof typeof branch;

  if (key in branch && key !== 'default') {
    return branch[key as Exclude<keyof typeof branch, 'default'>];
  }

  return branch.default;
}

// Example: format weight for the active region
export function formatWeight(
  config: ModeConfigData,
  mode: ShippingMode,
  country: string,
  kg: number,
): string {
  const region = resolveRegionConfig(config, mode, country);
  if (region.massUnit === 'LBS') {
    const lbs = kg * 2.20462;
    return \`\${lbs.toFixed(1)} \${region.massUnit}\`;
  }
  return \`\${kg.toFixed(1)} \${region.massUnit}\`;
}

// Wire payload from GET /public/mode/config → ApiResponseModel<ModeConfigData>
`;
