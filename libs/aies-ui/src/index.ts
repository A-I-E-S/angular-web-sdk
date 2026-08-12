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
  ErrorStateComponent,
  LoadingStateComponent,
  type LoadingStateMode,
} from './lib/feedback';

// Alert (inline banners — distinct from ErrorState / Toast)
export { AlertComponent, type AlertVariant } from './lib/alert';

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
export type { AsyncQueryState } from '@aies/aies-models';

/**
 * Filter schema / serialize helpers — re-exported so UI consumers can wire
 * drawers without a separate models import for the common path.
 */
export {
  clearFilterField,
  cloneFilterState,
  emptyFilterState,
  FILTER_CONFIGS,
  type FilterConfigId,
  type FilterField,
  type FilterFieldType,
  type FilterOption,
  type FilterOptionsSource,
  type FilterParams,
  type FilterState,
  fromFilterParams,
  type ModuleFilterConfig,
  resetFilterState,
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

// Form controls (see libs/aies-ui/docs/form-controls.md)
export {
  acceptLabels,
  CheckboxComponent,
  DatePickerComponent,
  fileExtensionLabel,
  fileMatchesAccept,
  FileUploadComponent,
  type FileUploadResult,
  type FileUploadVariant,
  NumberInputComponent,
  OtpInputComponent,
  RadioComponent,
  type RadioOption,
  SelectComponent,
  type SelectCreateConfig,
  type SelectOption,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
} from './lib/forms';

// Navigation (breadcrumb, tabs, segment — optional RouterLink on items)
export {
  type AiesNavItem,
  BreadcrumbComponent,
  isNavItemActive,
  navItemUrlTree,
  SegmentComponent,
  type TabDefContext,
  TabDefDirective,
  TabsComponent,
} from './lib/navigation';

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
export type { PaginationMeta } from '@aies/aies-models';

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
