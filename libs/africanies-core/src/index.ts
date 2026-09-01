// Config
export {
  AFRICANIES_SDK_CONFIG,
  type AfricaniesSdkConfig,
  type AfricaniesSdkHttpToasts,
} from './lib/config/africanies-sdk.config';
export { provideAfricaniesSdk } from './lib/config/provide-africanies-sdk';

// Auth
export {
  AUTH_FORGOT_PASSWORD_PATH,
  AuthService,
  AuthTokenService,
  isValidEmail,
} from './lib/auth';

// Shipping mode
export { shipmentModeInterceptor } from './lib/shipping/shipment-mode.interceptor';
export {
  asShippingMode,
  SHIPPING_MODE_OVERRIDE,
  withShippingMode,
} from './lib/shipping/shipping-mode.context';
export { type ShippingModeChangeGuard,ShippingModeService } from './lib/shipping/shipping-mode.service';

// HTTP
export { ApiClient, type ApiRequestOptions } from './lib/http/api-client';
export { formatApiErrorMessage } from './lib/http/api-error-message';
export { authInterceptor } from './lib/http/auth.interceptor';
export { HttpResponseCache } from './lib/http/http-cache';
export { httpToastInterceptor } from './lib/http/http-toast.interceptor';
export { mapApiJsonList, mapApiJsonValue } from './lib/http/map-api-json';
export { normalize, normalizePagination, unwrapLaravelPaginator } from './lib/http/normalize';
export {
  type AfricaniesHttpClientOptions,
  provideAfricaniesHttpClient,
} from './lib/http/provide-africanies-http-client';
export {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  resourceCacheTtlMs,
  type ResourceQueryParams,
} from './lib/http/resource-path';
export {
  AFRICANIES_HTTP_TOAST,
  type AfricaniesHttpToastHandler,
  TOAST_HTTP_OPTIONS,
  type ToastHttpOptions,
  withToast,
} from './lib/http/toast-http.context';
export {
  fieldErrorsMap,
  isLaravelValidationBag,
  joinApiErrorMessages,
  mapLaravelValidationBag,
} from './lib/http/validation-bag';
export {
  asArray,
  asBoolean,
  asNullableBoolean,
  asNullableFlag01,
  asNullableNumber,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
  toFlag01,
} from './lib/http/wire';

// Query defaults (plain object — no @tanstack dependency)
export {
  type ListFetchKind,
  listFetchKind,
  type ListFetchReason,
} from './lib/query/list-fetch-kind';
export {
  type AfricaniesQueryClientDefaults,
  createAfricaniesQueryClientDefaults,
  provideAfricaniesQueryDefaults,
} from './lib/query/provide-africanies-query-defaults';

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
  COUNTRY_FLAG_CDN_BASE,
  COUNTRY_READ_PATH,
  type CountryFlagFormat,
  countryFlagUrl,
  type CountryFlagUrlOptions,
  type CountrySelectOption,
  CountryService,
  mapCountry,
  mapCountryList,
  mapCountrySelectOptions,
  mapCountryState,
} from './lib/country';

// Public document catalog
export {
  DOCUMENT_READ_PATH,
  DocumentService,
  mapDocument,
  mapDocumentList,
} from './lib/document';

// Public plan catalog
export {
  mapPlan,
  mapPlanList,
  mapPlanPackage,
  PLAN_READ_PATH,
  PlanService,
} from './lib/plan';

// Public service catalog
export {
  mapService,
  mapServiceList,
  SERVICE_READ_PATH,
  ServiceService,
} from './lib/service';

// Currencies
export {
  CURRENCY_CREATE_PATH,
  CURRENCY_DELETE_PATH,
  CURRENCY_READ_PATH,
  CURRENCY_UPDATE_PATH,
  CurrencyService,
  mapCurrency,
  mapCurrencyList,
  mapCurrencyPaymentMethod,
  mapCurrencyPaymentMethodPivot,
  toCurrencyCreateBody,
  toCurrencyDeleteBody,
  toCurrencyFlag01,
  toCurrencyUpdateBody,
} from './lib/currency';

// Payment methods (checkout processors)
export {
  mapPaymentMethod,
  mapPaymentMethodCurrency,
  mapPaymentMethodList,
  PAYMENT_METHOD_READ_PATH,
  PAYMENT_METHOD_UPDATE_PATH,
  PaymentMethodService,
  toPaymentMethodFlag01,
  toPaymentMethodUpdateBody,
} from './lib/payment-method';

// Shipment methods / carriers
export {
  mapShipmentMethod,
  mapShipmentMethodList,
  mapShipmentMethodZoneLink,
  mapShipmentMethodZonePage,
  mapShipmentZone,
  SHIPMENT_METHOD_READ_PATH,
  ShipmentMethodService,
} from './lib/shipment-method';

// Warehouses
export {
  mapWarehouse,
  mapWarehouseCountry,
  mapWarehouseList,
  mapWarehouseState,
  WAREHOUSE_READ_PATH,
  WarehouseService,
} from './lib/warehouse';

// Zones
export {
  mapZone,
  mapZoneList,
  ZONE_READ_PATH,
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
  USER_CHANGE_PASSWORD_PATH,
  USER_LOGOUT_FROM_ALL_SESSIONS_PATH,
  USER_PATH,
  UserService,
} from './lib/user';

// User notifications (auth required)
export {
  mapNotification,
  mapNotificationInboxItem,
  isNotificationExternalLink,
  mapNotificationList,
  mapNotificationPayload,
  NOTIFICATION_READ_PATH,
  NOTIFICATION_UPDATE_PATH,
  NotificationService,
  resolveNotificationLinkForMode,
} from './lib/notification';

// File reads (POST /file/read — may require auth)
export {
  FILE_READ_MULTIPLE_PARAM,
  FILE_READ_PATH,
  FileService,
  mapFileRead,
  mapFileReadList,
} from './lib/file';

// Products
export {
  mapProduct,
  mapProductList,
  PRODUCT_READ_PATH,
  ProductService,
} from './lib/product';

// Filter select options (SDK catalog → drawer optionLists)
export {
  collectFilterOptionsSources,
  collectResolvableSelectFields,
  type FilterOptionLists,
  FilterOptionsResolver,
  type FilterSelectOption,
  mapShipmentMethodFilterOptions,
  mapWarehouseFilterOptions,
  mergeFilterOptionLists,
} from './lib/filters';

// Route-driven overlays (openers provided by africanies-ui)
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
export {
  csvCell,
  type CsvCellValue,
  downloadCsv,
  type DownloadCsvOptions,
  toCsvString,
} from './lib/browser';
