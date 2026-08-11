// Config
export { AIES_SDK_CONFIG, type AiesSdkConfig } from './lib/config/aies-sdk.config';
export { provideAiesSdk } from './lib/config/provide-aies-sdk';

// Shipping mode
export { ShippingModeService } from './lib/shipping/shipping-mode.service';
export { shipmentModeInterceptor } from './lib/shipping/shipment-mode.interceptor';

// HTTP
export { ApiClient, type ApiRequestOptions } from './lib/http/api-client';
export { normalize } from './lib/http/normalize';
export { HttpResponseCache } from './lib/http/http-cache';
export {
  AUTH_TOKEN_PROVIDER,
  authInterceptor,
  type AuthTokenProvider,
} from './lib/http/auth.interceptor';

// Query defaults (plain object — no @tanstack dependency)
export {
  createAiesQueryClientDefaults,
  provideAiesQueryDefaults,
  type AiesQueryClientDefaults,
} from './lib/query/provide-aies-query-defaults';

// Mode config
export { ModeConfigService } from './lib/mode/mode-config.service';
export {
  mapModeConfigData,
  resolveModeRegionConfig,
  MODE_CONFIG_PATH,
} from './lib/mode/mode-config.mapper';
export { provideModeConfig } from './lib/mode/provide-mode-config';

// Route-driven overlays (openers provided by aies-ui)
export type {
  OverlayRouteConfig,
  OverlayRouteEntry,
} from './lib/overlay/overlay-route.types';
export {
  DRAWER_SERVICE,
  MODAL_SERVICE,
  OVERLAY_ROUTE_CONFIGS,
  type OverlayHandle,
  type OverlayOpener,
} from './lib/overlay/overlay-tokens';
export { provideOverlayRoutes } from './lib/overlay/provide-overlay-routes';
export { RouteOverlayService } from './lib/overlay/route-overlay.service';
