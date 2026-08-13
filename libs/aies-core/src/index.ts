// Config
export { AIES_SDK_CONFIG, type AiesSdkConfig } from './lib/config/aies-sdk.config';
export { provideAiesSdk } from './lib/config/provide-aies-sdk';

// Auth
export { AuthTokenService } from './lib/auth';

// Shipping mode
export { shipmentModeInterceptor } from './lib/shipping/shipment-mode.interceptor';
export { ShippingModeService } from './lib/shipping/shipping-mode.service';

// HTTP
export { ApiClient, type ApiRequestOptions } from './lib/http/api-client';
export { authInterceptor } from './lib/http/auth.interceptor';
export { HttpResponseCache } from './lib/http/http-cache';
export { httpToastInterceptor } from './lib/http/http-toast.interceptor';
export { mapApiJsonList, mapApiJsonValue } from './lib/http/map-api-json';
export { normalize } from './lib/http/normalize';
export {
  type AiesHttpClientOptions,
  provideAiesHttpClient,
} from './lib/http/provide-aies-http-client';
export {
  AIES_HTTP_TOAST,
  type AiesHttpToastHandler,
  TOAST_HTTP_OPTIONS,
  type ToastHttpOptions,
  withToast,
} from './lib/http/toast-http.context';

// Query defaults (plain object — no @tanstack dependency)
export {
  type AiesQueryClientDefaults,
  createAiesQueryClientDefaults,
  provideAiesQueryDefaults,
} from './lib/query/provide-aies-query-defaults';

// Mode config
export {
  mapModeConfigData,
  MODE_CONFIG_PATH,
  resolveModeRegionConfig,
} from './lib/mode/mode-config.mapper';
export { ModeConfigService } from './lib/mode/mode-config.service';
export { provideModeConfig } from './lib/mode/provide-mode-config';

// Country utility
export {
  COUNTRY_READ_PATH,
  type CountryReadParams,
  CountryService,
  mapCountry,
  mapCountryList,
  mapCountryState,
} from './lib/country';

// Shipment methods / carriers
export {
  mapShipmentMethod,
  mapShipmentMethodList,
  mapShipmentMethodZoneLink,
  mapShipmentMethodZonePage,
  mapShipmentZone,
  SHIPMENT_METHOD_READ_PATH,
  type ShipmentMethodReadParams,
  ShipmentMethodService,
} from './lib/shipment-method';

// Warehouses
export {
  mapWarehouse,
  mapWarehouseCountry,
  mapWarehouseList,
  mapWarehouseState,
  WAREHOUSE_READ_PATH,
  type WarehouseReadParams,
  WarehouseService,
} from './lib/warehouse';

// Zones
export {
  mapZone,
  mapZoneList,
  ZONE_READ_PATH,
  type ZoneReadParams,
  ZoneService,
} from './lib/zone';

// Current user (bare /user payload — auth required)
export {
  mapUser,
  mapUserAccountManager,
  mapUserBusinessAccount,
  mapUserCountry,
  mapUserCountryState,
  mapUserGatewayPayload,
  mapUserPaymentPayload,
  mapUserPlan,
  mapUserPlanPackage,
  mapUserStateLabel,
  mapUserSubscription,
  USER_PATH,
  UserService,
} from './lib/user';

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

// Browser utilities
export { copyToClipboard } from './lib/browser';
