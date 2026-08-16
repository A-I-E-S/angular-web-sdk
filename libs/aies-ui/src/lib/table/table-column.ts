/**
 * Column metadata for {@link TableComponent}.
 *
 * Describes header chrome and identity only — cell *content* is supplied via
 * projected `<ng-template aiesCellDef="…">` templates (or the plain-text
 * fallback when none is registered).
 *
 * @typeParam T - Row record shape; `key` is usually a field of `T`, but may
 * also name a virtual column (e.g. `"actions"`) that exists only in templates.
 */
export interface TableColumn<T = unknown> {
  /**
   * Stable column id. Matches {@link CellDefDirective}'s `aiesCellDef` value
   * and, for the default renderer, indexes `row[key]`.
   */
  key: keyof T & string | (string & {});

  /** Header label shown in the table chrome. */
  header: string;

  /**
   * When true, the header is interactive and emits {@link TableSortChange}
   * via `sortChange`. Sorting is never applied client-side.
   */
  sortable?: boolean;

  /**
   * Optional CSS width (e.g. `'3.5rem'`, `'14rem'`).
   *
   * The table uses `table-layout: auto` and scrolls horizontally when columns
   * exceed the container. `width` is a hint for that column; columns without
   * it size to their content. Pin a narrow column (typical for `actions`)
   * when you do not want it to grow with the rest.
   */
  width?: string;

  /**
   * Pin the column while the table scrolls horizontally.
   *
   * Omit to use the default: `key: 'actions'` sticks to the right. Set
   * `false` to opt out, or `'left'` / `'right'` for any column.
   */
  sticky?: 'left' | 'right' | false;
}

/**
 * Payload emitted by {@link TableComponent.sortChange}.
 *
 * Maps to the API `order` query param (see {@link PaginationQueryParamsModel}) —
 * the table never reorders its `rows` input.
 */
export interface TableSortChange {
  /** Column key the user activated. */
  key: string;

  /** Requested sort direction for that column. */
  direction: 'asc' | 'desc';
}
