import type { Type } from '@angular/core';

/**
 * Maps a query-param value to a component and overlay surface.
 *
 * Used by {@link RouteOverlayService} when a registered param key's value
 * matches a key in {@link OverlayRouteConfig.routes}.
 */
export interface OverlayRouteEntry {
  /** Standalone component type to open in the overlay. */
  component: Type<unknown>;

  /**
   * Which overlay host to use.
   * `'modal'` → {@link MODAL_SERVICE}; `'drawer'` → {@link DRAWER_SERVICE}.
   */
  overlay: 'modal' | 'drawer';
}

/**
 * One query-param namespace and its value → component map.
 *
 * Multiple configs can coexist (e.g. `modal` and `drawer` param keys) so
 * both surfaces can be driven from the URL at once.
 *
 * @example
 * ```ts
 * const config: OverlayRouteConfig = {
 *   paramKey: 'modal',
 *   routes: {
 *     'edit-shipment': { component: EditShipmentModal, overlay: 'modal' },
 *   },
 * };
 * ```
 */
export interface OverlayRouteConfig {
  /**
   * Query param name that triggers overlays (e.g. `'modal'` or `'drawer'`).
   */
  paramKey: string;

  /**
   * Map of param values to overlay entries.
   * Unknown values are ignored (no open, no error).
   */
  routes: Record<string, OverlayRouteEntry>;
}
