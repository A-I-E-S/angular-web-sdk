import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import type { OverlayRouteConfig } from './overlay-route.types';
import {
  DRAWER_SERVICE,
  type OverlayHandle,
  MODAL_SERVICE,
  OVERLAY_ROUTE_CONFIGS,
} from './overlay-tokens';

interface OpenOverlayState {
  /** Query param value that opened this overlay. */
  value: string;
  /** Active handle from modal/drawer opener. */
  handle: OverlayHandle;
  /** True while close was triggered by URL (back button) — skip re-navigate. */
  closingFromUrl: boolean;
  /** Subscription to afterClosed for cleanup. */
  afterClosedSub: Subscription;
}

/**
 * Keeps query-param state in sync with modal/drawer overlays.
 *
 * Instantiated eagerly via {@link provideOverlayRoutes}'s `provideAppInitializer`
 * so a hard refresh with `?modal=…` already present reopens the overlay.
 *
 * Bidirectional sync:
 * - Param appears / matches a route → open (passing sibling query params as data)
 * - Param removed (e.g. browser back) → close without navigating again
 * - Overlay closed by UI → strip the trigger param with `queryParamsHandling: 'merge'`
 *
 * Modal/drawer implementations live in `@aies/aies-ui` and are injected through
 * {@link MODAL_SERVICE} / {@link DRAWER_SERVICE} to avoid a circular dependency.
 */
@Injectable()
export class RouteOverlayService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly configs = inject(OVERLAY_ROUTE_CONFIGS);
  private readonly modal = inject(MODAL_SERVICE, { optional: true });
  private readonly drawer = inject(DRAWER_SERVICE, { optional: true });

  private readonly openByKey = new Map<string, OpenOverlayState>();

  constructor() {
    // Start immediately — provideAppInitializer only forces construction.
    this.route.queryParamMap.subscribe((params) => this.onQueryParams(params));
  }

  private onQueryParams(params: ParamMap): void {
    for (const config of this.configs) {
      this.syncConfig(config, params);
    }
  }

  private syncConfig(config: OverlayRouteConfig, params: ParamMap): void {
    const value = params.get(config.paramKey);
    const current = this.openByKey.get(config.paramKey);

    if (value === null || value === '') {
      if (current) {
        current.closingFromUrl = true;
        current.handle.close();
        this.teardown(config.paramKey);
      }
      return;
    }

    const entry = config.routes[value];
    if (!entry) {
      return;
    }

    // Already showing the same route value — leave it alone.
    if (current?.value === value) {
      return;
    }

    if (current) {
      current.closingFromUrl = true;
      current.handle.close();
      this.teardown(config.paramKey);
    }

    const opener = entry.overlay === 'modal' ? this.modal : this.drawer;
    if (!opener) {
      // UI package has not provided the opener yet — skip until it does.
      return;
    }

    // Sibling query params (e.g. id=123) become OVERLAY_DATA in aies-ui.
    const data = this.siblingParams(params, config.paramKey);
    const handle = opener.open(entry.component, { data });

    const state: OpenOverlayState = {
      value,
      handle,
      closingFromUrl: false,
      afterClosedSub: handle.afterClosed().subscribe(() => {
        const open = this.openByKey.get(config.paramKey);
        if (!open || open.handle !== handle) {
          return;
        }
        const fromUrl = open.closingFromUrl;
        this.teardown(config.paramKey);
        if (!fromUrl) {
          // Manual / UI close — drop the trigger param, keep other params.
          void this.router.navigate([], {
            queryParams: { [config.paramKey]: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      }),
    };

    this.openByKey.set(config.paramKey, state);
  }

  private siblingParams(
    params: ParamMap,
    excludeKey: string,
  ): Record<string, string> {
    const data: Record<string, string> = {};
    params.keys.forEach((key) => {
      if (key === excludeKey) {
        return;
      }
      const value = params.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });
    return data;
  }

  private teardown(paramKey: string): void {
    const current = this.openByKey.get(paramKey);
    if (!current) {
      return;
    }
    current.afterClosedSub.unsubscribe();
    this.openByKey.delete(paramKey);
  }
}
