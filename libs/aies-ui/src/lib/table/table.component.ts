import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  numberAttribute,
  output,
  TemplateRef,
} from '@angular/core';

import type { PaginationMeta } from '@aies/aies-models';
import { AiesIconComponent } from '@aies/aies-icons';

import { ButtonComponent } from '../button/button.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { CellDefDirective } from './cell-def.directive';
import { TableColumn, TableSortChange } from './table-column';

/**
 * Presentational data table with template-based cells.
 *
 * Columns come from the `columns` input; cell bodies come from projected
 * `<ng-template aiesCellDef="key">` templates. Columns without a matching
 * template fall back to rendering `row[key]` as plain text.
 *
 * Optional toolbar: top-left **Refresh** (`showRefresh` → {@link refreshClick});
 * top-right **Filters** then **Export** (`showFilter` / `showExport`). The table
 * does not own fetch, filter, or export logic — the host handles those events.
 *
 * Optional footer pager: pass {@link meta} to embed {@link PaginationComponent};
 * the host still owns refetch via {@link pageChange}. Rows are never sliced
 * client-side.
 *
 * WHY no loading / error / empty UI: those branches belong on
 * {@link AsyncStateComponent}. This component only renders whatever `rows`
 * it is given so list screens share one async pattern.
 *
 * Sorting is server-driven — sortable headers emit {@link TableSortChange}
 * and never reorder local rows.
 *
 * @typeParam T - Row record shape.
 *
 * @example
 * ```html
 * <aies-table
 *   [columns]="columns"
 *   [rows]="state().data!"
 *   [meta]="meta()"
 *   [showRefresh]="true"
 *   [showFilter]="true"
 *   [showExport]="true"
 *   [filterCount]="activeFilterCount()"
 *   (refreshClick)="refetch()"
 *   (filterClick)="openFilters()"
 *   (exportClick)="exportCsv()"
 *   (pageChange)="onPageChange($event)"
 *   [sort]="sort()"
 *   (sortChange)="onSort($event)"
 * >
 *   <ng-template aiesCellDef="status" let-row>…</ng-template>
 * </aies-table>
 * ```
 *
 * Full prop tables and patterns: `src/lib/table/docs.md`.
 */
@Component({
  selector: 'aies-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    AiesIconComponent,
    PaginationComponent,
  ],
  template: `
    <div class="flex w-full flex-col gap-3">
      @if (showRefresh() || showFilter() || showExport()) {
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            @if (showRefresh()) {
              <button
                aies-button
                type="button"
                variant="secondary"
                size="sm"
                [attr.aria-label]="refreshLabel()"
                (click)="refreshClick.emit()"
              >
                <aies-icon name="refresh" [size]="16" />
                {{ refreshLabel() }}
              </button>
            }
          </div>
          <div class="flex items-center gap-2">
            @if (showFilter()) {
              <button
                aies-button
                type="button"
                variant="secondary"
                size="sm"
                [attr.aria-label]="filterLabel()"
                (click)="filterClick.emit()"
              >
                <aies-icon name="filter" [size]="16" />
                {{ filterLabel() }}
                @if (filterCount() > 0) {
                  <span
                    class="inline-flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 py-0.5 text-caption font-semibold tabular-nums text-white dark:bg-white dark:text-ink"
                  >
                    {{ filterCount() }}
                  </span>
                }
              </button>
            }
            @if (showExport()) {
              <button
                aies-button
                type="button"
                variant="secondary"
                size="sm"
                [attr.aria-label]="exportLabel()"
                (click)="exportClick.emit()"
              >
                <aies-icon name="download" [size]="16" />
                {{ exportLabel() }}
              </button>
            }
          </div>
        </div>
      }

      <div
        class="w-full overflow-x-auto rounded-md border border-border dark:border-white/10"
      >
        <table
          class="w-full border-collapse text-left text-body text-ink dark:text-white"
        >
          <thead
            class="border-b border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
          >
            <tr>
              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  class="whitespace-nowrap px-3 py-2.5 font-medium text-neutral-600 dark:text-neutral-400"
                  [style.width]="col.width ?? null"
                >
                  @if (col.sortable) {
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-sm font-medium text-neutral-600 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:text-white"
                      (click)="onSortHeaderClick(col.key)"
                    >
                      <span>{{ col.header }}</span>
                      <span
                        class="text-caption text-neutral-400"
                        aria-hidden="true"
                      >
                        {{ sortIndicator(col.key) }}
                      </span>
                    </button>
                  } @else {
                    {{ col.header }}
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track $index) {
              <tr
                class="border-b border-border last:border-b-0 hover:bg-background-welcome/60 dark:border-white/10 dark:hover:bg-white/5"
              >
                @for (col of columns(); track col.key) {
                  <td
                    class="px-3 py-2.5 align-middle"
                    [style.width]="col.width ?? null"
                  >
                    @if (templateFor(col.key); as tpl) {
                      <ng-container
                        [ngTemplateOutlet]="tpl"
                        [ngTemplateOutletContext]="cellContext(row)"
                      />
                    } @else {
                      {{ defaultCellText(row, col.key) }}
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (meta(); as pager) {
        <aies-pagination
          [meta]="pager"
          (pageChange)="pageChange.emit($event)"
        />
      }
    </div>
  `,
})
export class TableComponent<T = unknown> {
  /** Column definitions (header chrome + keys). */
  readonly columns = input.required<TableColumn<T>[]>();

  /**
   * Row records to render. Empty arrays render an empty `<tbody>` — wrap with
   * {@link AsyncStateComponent} when empty should show EmptyState instead.
   */
  readonly rows = input.required<T[]>();

  /**
   * Optional current sort so header indicators stay in sync with the
   * server-side `order` param. Omitted / null means no column is active.
   */
  readonly sort = input<TableSortChange | null>(null);

  /**
   * Show a Refresh button above the table (top-left). Host should refetch from
   * {@link refreshClick}.
   */
  readonly showRefresh = input(false, { transform: booleanAttribute });

  /** Label on the refresh trigger. Defaults to `Refresh`. */
  readonly refreshLabel = input('Refresh');

  /**
   * Show a Filters button above the table (top-right). Host should open
   * {@link FilterDrawerService} from {@link filterClick}.
   */
  readonly showFilter = input(false, { transform: booleanAttribute });

  /** Label on the filter trigger. Defaults to `Filters`. */
  readonly filterLabel = input('Filters');

  /**
   * Optional badge count on the filter trigger (active filters). Hidden when 0.
   */
  readonly filterCount = input(0, { transform: numberAttribute });

  /**
   * Show an Export button to the right of Filters. Host handles the download
   * from {@link exportClick}.
   */
  readonly showExport = input(false, { transform: booleanAttribute });

  /** Label on the export trigger. Defaults to `Export`. */
  readonly exportLabel = input('Export');

  /**
   * When set, embeds {@link PaginationComponent} under the grid. Host still
   * owns refetch via {@link pageChange} — rows are never sliced here.
   */
  readonly meta = input<PaginationMeta | null>(null);

  /**
   * Emitted when a sortable header is activated. Consumers must refetch;
   * this component never sorts `rows` locally.
   */
  readonly sortChange = output<TableSortChange>();

  /** Emitted when the top-left Refresh control is clicked. */
  readonly refreshClick = output<void>();

  /** Emitted when the top-right Filters control is clicked. */
  readonly filterClick = output<void>();

  /** Emitted when the Export control is clicked. */
  readonly exportClick = output<void>();

  /**
   * Target 1-based page after prev/next. Host should refetch; this component
   * does not change `rows`.
   */
  readonly pageChange = output<number>();

  /** Projected cell templates keyed by column. */
  private readonly cellDefs = contentChildren(CellDefDirective);

  /** Lookup map rebuilt when projected cell defs change. */
  private readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.cellDefs()) {
      map.set(def.aiesCellDef(), def.template);
    }
    return map;
  });

  /**
   * Resolves the projected template for a column key, if any.
   *
   * @param key - {@link TableColumn.key} to look up.
   * @returns Matching template, or `null` for the plain-text fallback.
   */
  protected templateFor(key: string): TemplateRef<unknown> | null {
    return this.cellTemplateMap().get(key) ?? null;
  }

  /**
   * Builds the `let-row` context for a projected cell template.
   *
   * @param row - Current row record.
   * @returns NgTemplateOutlet context with `$implicit` set to `row`.
   */
  protected cellContext(row: T): { $implicit: T } {
    return { $implicit: row };
  }

  /**
   * Default cell text when no `aiesCellDef` template is registered.
   *
   * WHY stringify via `String(...)`: keeps null/undefined visible as empty
   * rather than the literal words "null"/"undefined", while still showing
   * numbers and booleans without forcing consumers to template every column.
   *
   * @param row - Current row.
   * @param key - Column key into the row.
   * @returns Display string for the cell.
   */
  protected defaultCellText(row: T, key: string): string {
    const value = (row as Record<string, unknown>)[key];
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  /**
   * Glyph for the active sort column; empty for inactive sortable headers.
   *
   * @param key - Column key under the header button.
   * @returns Sort direction glyph (`↑` / `↓` / `↕`).
   */
  protected sortIndicator(key: string): string {
    const current = this.sort();
    if (!current || current.key !== key) {
      return '↕';
    }
    return current.direction === 'asc' ? '↑' : '↓';
  }

  /**
   * Toggles or starts sort for a column and emits {@link sortChange}.
   *
   * @param key - Sortable column key that was clicked.
   */
  protected onSortHeaderClick(key: string): void {
    const current = this.sort();
    const direction: TableSortChange['direction'] =
      current?.key === key && current.direction === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key, direction });
  }
}
