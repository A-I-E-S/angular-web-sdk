import type {
  FilterFieldModel,
  FilterOptionsSource,
  ModuleFilterConfigModel,
} from '@aies/aies-models';
import type { ShipmentMethodModel, WarehouseModel } from '@aies/aies-models';

import { asArray } from '../http/wire';

/** One select row for filter drawer `optionLists` (wire value + label). */
export interface FilterSelectOption {
  value: string;
  label: string;
}

/** Host bag keyed by {@link FilterFieldModel.key}. */
export type FilterOptionLists = Record<string, FilterSelectOption[]>;

/** Select field with a required, non-static {@link FilterOptionsSource}. */
export type ResolvableSelectField = Omit<FilterFieldModel, 'optionsSource' | 'type'> & {
  type: 'select';
  optionsSource: Exclude<FilterOptionsSource, 'static'>;
};

/**
 * Select fields that declare a non-static {@link FilterOptionsSource}.
 *
 * @param config - Module filter schema.
 * @returns Fields that need async option resolution.
 */
export function collectResolvableSelectFields(
  config: ModuleFilterConfigModel | null | undefined,
): ResolvableSelectField[] {
  return asArray<FilterFieldModel>(config?.fields).filter(
    (field): field is ResolvableSelectField =>
      field.type === 'select' &&
      field.optionsSource != null &&
      field.optionsSource !== 'static',
  );
}

/**
 * Unique {@link FilterOptionsSource} values referenced by a config (excluding static).
 *
 * @param config - Module filter schema.
 */
export function collectFilterOptionsSources(
  config: ModuleFilterConfigModel,
): FilterOptionsSource[] {
  const sources = new Set<FilterOptionsSource>();
  for (const field of collectResolvableSelectFields(config)) {
    sources.add(field.optionsSource);
  }
  return [...sources];
}

/**
 * Map {@link WarehouseModel}[] into filter select options (`value` = id string).
 *
 * @param rows - Warehouses from {@link WarehouseService.readAll}.
 */
export function mapWarehouseFilterOptions(
  rows: WarehouseModel[] | null | undefined,
): FilterSelectOption[] {
  if (!rows?.length) {
    return [];
  }
  return rows.map((row) => ({
    value: String(row.id),
    label: row.name,
  }));
}

/**
 * Map {@link ShipmentMethodModel}[] into filter select options.
 *
 * @param rows - Methods from {@link ShipmentMethodService.readAll}.
 */
export function mapShipmentMethodFilterOptions(
  rows: ShipmentMethodModel[] | null | undefined,
): FilterSelectOption[] {
  if (!rows?.length) {
    return [];
  }
  return rows.map((row) => ({
    value: String(row.id),
    label: row.name,
  }));
}

/**
 * Merge SDK-resolved lists with host overrides (host wins per field key).
 *
 * @param resolved - Output from {@link FilterOptionsResolver.resolve}.
 * @param overrides - Host catalogs (e.g. manifests without a built-in service).
 */
export function mergeFilterOptionLists(
  resolved: FilterOptionLists,
  overrides?: FilterOptionLists | null,
): FilterOptionLists {
  if (!overrides) {
    return { ...resolved };
  }
  return { ...resolved, ...overrides };
}
