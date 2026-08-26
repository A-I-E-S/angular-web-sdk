/**
 * Public API for `@africanies/africanies-ui`.
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
  type AfricaniesMenuItem,
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

// Accordion (expandable bordered panels)
export {
  AccordionComponent,
  type AccordionSize,
} from './lib/accordion';

// Alert (inline banners — distinct from ErrorState / Toast)
export { AlertComponent, type AlertVariant } from './lib/alert';

// Chip (compact status labels)
export {
  ChipComponent,
  type ChipSize,
  type ChipVariant,
} from './lib/chip';

// Carrier marks (delivery vendor logos)
export {
  CarrierLogoComponent,
  type CarrierLogoSize,
  type CarrierLogoSlug,
  deliveryVendorOptionsForStoredValue,
  deliveryVendorSelected,
  deliveryVendorSelectOptions,
  normalizeCarrierLogoSlug,
} from './lib/carrier';

// Content stack (title / subtitle / extra line)
export { ContentStackComponent } from './lib/content-stack';

// Toast (transient stack — timed / persistent / HTTP-tagged)
export {
  provideAfricaniesToasts,
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

// Info popover (hover card — optional title + projected body of any kind)
export {
  InfoPopoverComponent,
  InfoPopoverContentDirective,
  type InfoPopoverPlacement,
  InfoPopoverTriggerDirective,
} from './lib/info-popover';

// Filters (schema-driven list filter drawer)
export {
  type FilterDrawerData,
  FilterDrawerPanel,
  type FilterDrawerResult,
  FilterDrawerService,
  FilterQueryService,
} from './lib/filters';

/**
 * Re-export for consumers wiring `<africanies-async-state>` without a separate
 * `@africanies/africanies-models` import for this one type.
 */
export type { AsyncQueryStateModel } from '@africanies/africanies-models';

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
  type FilterQueryBag,
  filterQueryKeys,
  type FilterStateModel,
  FilterTransport,
  fromFilterParams,
  hasFilterParams,
  type ModuleFilterConfigModel,
  resetFilterState,
  resolveFilterTransport,
  shipmentTrackingItemFilterConfig,
  toFilterParams,
  trackShipmentsFilterConfig,
  updateShipmentsFilterConfig,
  usersFilterConfig,
} from '@africanies/africanies-models';

// Overlay
export {
  AfricaniesOverlayRef,
  ConfirmDialogComponent,
  type ConfirmOptions,
  ConfirmService,
  type ConfirmWork,
  DrawerService,
  MODAL_SIZE_PANEL_CLASS,
  type ModalOpenConfig,
  ModalService,
  type ModalSize,
  OVERLAY_DATA,
  OverlayFooterDirective,
  OverlayFrameComponent,
  OverlayHeaderDirective,
  type OverlayOpenConfig,
  provideAfricaniesUiOverlays,
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
  type OtpInputVariant,
  provideGooglePlaces,
  RadioComponent,
  type RadioOption,
  type SearchComboboxBadge,
  type SearchComboboxBadgeFn,
  SearchComboboxComponent,
  type SearchComboboxLabelFn,
  type SearchComboboxMarkFn,
  type SearchComboboxSearchFn,
  type SearchComboboxSubtitleFn,
  type SearchComboboxTrackFn,
  SelectComponent,
  type SelectCreateConfig,
  type SelectOption,
  type SelectSize,
  TextareaComponent,
  TextInputComponent,
  type TextInputType,
  ToggleComponent,
} from './lib/forms';

// Navigation (breadcrumb, tabs, segment, side-nav — optional RouterLink)
export {
  type AfricaniesNavItem,
  type AfricaniesSideNavItem,
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
  ShippingModeSwitchComponent,
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
  type HeaderGreetingPeriod,
  headerGreetingPeriod,
  type HeaderWeather,
  type HeaderWeatherKind,
  PageHeaderComponent,
  pickHeaderGreeting,
} from './lib/layout';

// Brand
export {
  AFRICANIES_BRAND_LOGO_MINI_URL,
  AFRICANIES_BRAND_LOGO_URL,
  BrandLogoComponent,
  type BrandLogoSize,
} from './lib/brand';

// Avatar
export {
  AvatarComponent,
  AvatarMenuComponent,
  type AvatarSize,
} from './lib/avatar';

// Image (loading / fallback frame)
export {
  ImageComponent,
  type ImageFit,
  type ImageShape,
} from './lib/image';

// Notifications drawer
export {
  type AfricaniesNotification,
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
  HeaderCellDefDirective,
  type RowDetailDefContext,
  RowDetailDefDirective,
  type TableColumn,
  TableComponent,
  type TableSortChange,
} from './lib/table';

// Pagination
export {
  DEFAULT_PAGE_SIZE,
  NOTIFICATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
  PaginationComponent,
  type PaginationPageSize,
} from './lib/pagination';

/**
 * Re-export so pagination consumers can type `meta` without a separate
 * `@africanies/africanies-models` import for this one type.
 */
export type { PaginationMetaModel } from '@africanies/africanies-models';

// Stepper
export {
  type StepDefContext,
  StepDefDirective,
  type StepDefinition,
  StepperComponent,
} from './lib/stepper';

// Shared NgModules (re-export related standalones)
export {
  AfricaniesActionsModule,
  AfricaniesFeedbackModule,
  AfricaniesFormsModule,
  AfricaniesInfoPopoverModule,
  AfricaniesNavigationModule,
  AfricaniesStepperModule,
  AfricaniesTableModule,
  AfricaniesTooltipModule,
} from './lib/modules';
