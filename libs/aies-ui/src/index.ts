/**
 * Public API for `@aies/aies-ui`.
 *
 * Overlay openers, async feedback states, form controls, navigation chrome,
 * table/pagination, stepper, and the button primitive.
 */

// Button
export {
  ButtonComponent,
  type ButtonSize,
  type ButtonVariant,
} from './lib/button';

// Copy to clipboard
export { CopyButtonComponent } from './lib/copy-button';

// Action menu (overflow / row actions)
export {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  type AiesMenuItem,
} from './lib/action-menu';

// Feedback
export {
  AsyncStateComponent,
  EmptyStateComponent,
  ErrorIndicatorComponent,
  ErrorStateComponent,
  LoadingStateComponent,
  type LoadingStateMode,
} from './lib/feedback';

// Alert (inline banners — distinct from ErrorState / Toast)
export { AlertComponent, type AlertVariant } from './lib/alert';

// Chip (compact status labels)
export {
  ChipComponent,
  type ChipSize,
  type ChipVariant,
} from './lib/chip';

// Toast (transient stack — timed / persistent / HTTP-tagged)
export {
  provideAiesToasts,
  TOAST_DURATION_MS,
  TOAST_ICONS,
  toastFingerprint,
  type ToastItem,
  ToastService,
  type ToastShowOptions,
  type ToastVariant,
} from './lib/toast';

// Tooltip (contextual help — default icon or custom trigger)
export {
  TooltipComponent,
  type TooltipPlacement,
  TooltipTriggerDirective,
} from './lib/tooltip';

// Filters (schema-driven list filter drawer)
export {
  type FilterDrawerData,
  FilterDrawerPanel,
  type FilterDrawerResult,
  FilterDrawerService,
} from './lib/filters';

/**
 * Re-export for consumers wiring `<aies-async-state>` without a separate
 * `@aies/aies-models` import for this one type.
 */
export type { AsyncQueryStateModel } from '@aies/aies-models';

/**
 * Filter schema / serialize helpers — re-exported so UI consumers can wire
 * drawers without a separate models import for the common path.
 */
export {
  clearFilterField,
  cloneFilterState,
  DEFAULT_FILTER_TRANSPORT,
  emptyFilterState,
  FILTER_CONFIGS,
  type FilterConfigId,
  type FilterFieldModel,
  type FilterFieldType,
  type FilterOptionModel,
  type FilterOptionsSource,
  type FilterParamsModel,
  type FilterStateModel,
  FilterTransport,
  fromFilterParams,
  type ModuleFilterConfigModel,
  resetFilterState,
  resolveFilterTransport,
  shipmentTrackingItemFilterConfig,
  toFilterParams,
  trackShipmentsFilterConfig,
  updateShipmentsFilterConfig,
  usersFilterConfig,
} from '@aies/aies-models';

// Overlay
export {
  AiesOverlayRef,
  ConfirmDialogComponent,
  type ConfirmOptions,
  ConfirmService,
  DrawerService,
  ModalService,
  OVERLAY_DATA,
  type OverlayOpenConfig,
  provideAiesUiOverlays,
} from './lib/overlay';

// Form controls
export {
  acceptLabels,
  type AddressComponent,
  AddressInputComponent,
  type AddressPlace,
  type AddressPrediction,
  CheckboxComponent,
  DatePickerComponent,
  fileExtensionLabel,
  fileMatchesAccept,
  FileUploadComponent,
  type FileUploadResult,
  type FileUploadVariant,
  GOOGLE_PLACES_CONFIG,
  type GooglePlacesConfig,
  GooglePlacesService,
  NumberInputComponent,
  OtpInputComponent,
  provideGooglePlaces,
  RadioComponent,
  type RadioOption,
  SelectComponent,
  type SelectCreateConfig,
  type SelectOption,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
} from './lib/forms';

// Navigation (breadcrumb, tabs, segment, side-nav — optional RouterLink)
export {
  type AiesNavItem,
  type AiesSideNavItem,
  BreadcrumbComponent,
  buildBreadcrumbsFromSideNav,
  type ContentBackTarget,
  type HeaderBackTarget,
  isCatalogRootRoute,
  isNavItemActive,
  isNestedChildRoute,
  navItemUrlTree,
  normalizeNavPath,
  resolveCatalogRootLink,
  resolveContentBackTarget,
  resolveHeaderBackTarget,
  resolveParentPathFromRootSnapshot,
  SegmentComponent,
  SideNavComponent,
  type TabDefContext,
  TabDefDirective,
  TabsComponent,
} from './lib/navigation';

// Layout (app shell scaffold)
export {
  AppShellComponent,
  AppShellContentHeaderComponent,
  type AppShellContentWidth,
  AppShellHeaderComponent,
  type AppShellHeaderDensity,
  AppShellHeaderEndDirective,
  AppShellHeaderSlotDirective,
  AppShellHeaderStartDirective,
  type AppShellLayoutPreview,
  type HeaderGreeting,
  headerGreetingFirstName,
  pickHeaderGreeting,
} from './lib/layout';

// Brand
export {
  AIES_BRAND_LOGO_MINI_URL,
  AIES_BRAND_LOGO_URL,
  BrandLogoComponent,
  type BrandLogoSize,
} from './lib/brand';

// Avatar
export {
  AvatarComponent,
  AvatarMenuComponent,
  type AvatarSize,
} from './lib/avatar';

// Notifications drawer
export {
  type AiesNotification,
  type NotificationDrawerData,
  NotificationDrawerPanel,
  type NotificationDrawerResult,
  NotificationDrawerService,
  type NotificationPageResult,
} from './lib/notifications';

// Table
export {
  type CellDefContext,
  CellDefDirective,
  type TableColumn,
  TableComponent,
  type TableSortChange,
} from './lib/table';

// Pagination
export { PaginationComponent } from './lib/pagination';

/**
 * Re-export so pagination consumers can type `meta` without a separate
 * `@aies/aies-models` import for this one type.
 */
export type { PaginationMetaModel } from '@aies/aies-models';

// Stepper
export {
  type StepDefContext,
  StepDefDirective,
  type StepDefinition,
  StepperComponent,
} from './lib/stepper';

// Shared NgModules (re-export related standalones)
export {
  AiesActionsModule,
  AiesFeedbackModule,
  AiesFormsModule,
  AiesNavigationModule,
  AiesStepperModule,
  AiesTableModule,
  AiesTooltipModule,
} from './lib/modules';
