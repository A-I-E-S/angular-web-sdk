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

// Alert (inline banners — distinct from ErrorState)
export { AlertComponent, type AlertVariant } from './lib/alert';

// Filters (schema-driven list filter drawer)
export {
  FilterDrawerPanel,
  FilterDrawerService,
  type FilterDrawerData,
  type FilterDrawerResult,
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
  FILTER_CONFIGS,
  clearFilterField,
  cloneFilterState,
  emptyFilterState,
  fromFilterParams,
  resetFilterState,
  shipmentTrackingItemFilterConfig,
  toFilterParams,
  trackShipmentsFilterConfig,
  updateShipmentsFilterConfig,
  usersFilterConfig,
  type FilterConfigId,
  type FilterField,
  type FilterFieldType,
  type FilterOption,
  type FilterOptionsSource,
  type FilterParams,
  type FilterState,
  type ModuleFilterConfig,
} from '@aies/aies-models';

// Overlay
export {
  AiesOverlayRef,
  ConfirmDialogComponent,
  ConfirmService,
  DrawerService,
  ModalService,
  OVERLAY_DATA,
  provideAiesUiOverlays,
  type ConfirmOptions,
  type OverlayOpenConfig,
} from './lib/overlay';

// Form controls (see libs/aies-ui/docs/form-controls.md)
export {
  CheckboxComponent,
  DatePickerComponent,
  FileUploadComponent,
  NumberInputComponent,
  RadioComponent,
  SelectComponent,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
  type FileUploadResult,
  type RadioOption,
  type SelectCreateConfig,
  type SelectOption,
} from './lib/forms';

// Navigation (breadcrumb, tabs, segment — optional RouterLink on items)
export {
  BreadcrumbComponent,
  SegmentComponent,
  TabDefDirective,
  TabsComponent,
  isNavItemActive,
  navItemUrlTree,
  type AiesNavItem,
  type TabDefContext,
} from './lib/navigation';

// Table
export {
  CellDefDirective,
  TableComponent,
  type CellDefContext,
  type TableColumn,
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
  StepDefDirective,
  StepperComponent,
  type StepDefContext,
  type StepDefinition,
} from './lib/stepper';
