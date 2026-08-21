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
  signal,
  TemplateRef,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';
import type { PaginationMetaModel } from '@aies/aies-models';

import { ButtonComponent } from '../button/button.component';
import { EmptyStateComponent } from '../feedback/empty-state.component';
import { ErrorIndicatorComponent } from '../feedback/error-indicator.component';
import { ErrorStateComponent } from '../feedback/error-state.component';
import { LoadingStateComponent } from '../feedback/loading-state.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { CellDefDirective } from './cell-def.directive';
import { HeaderCellDefDirective } from './header-cell-def.directive';
import { RowDetailDefDirective } from './row-detail-def.directive';
import { TableColumn, TableSortChange } from './table-column';

/**
 * Presentational data table with template-based cells.
 *
 * Columns come from the `columns` input; cell bodies come from projected
 * `<ng-template aiesCellDef="key">` templates. Columns without a matching
 * template fall back to rendering `row[key]` as plain text.
 *
 * Optional toolbar: top-left **Refresh** (`showRefresh` → {@link refreshClick}).
 * Hidden while the body shows empty or error — those states expose Retry instead.
 * While {@link refreshing} is true the rows stay on screen — the refresh icon
 * spins (do not swap to a blocking loader). Use {@link loading} when the page
 * of data is changing (pagination / size): rows stay on screen and the built-in
 * pager shows a circular spinner beside the page controls; the body loader
 * appears only when there are no rows yet (first load) or the host cleared
 * rows for a shipping-mode switch (STN ↔ SFN). Toolbar and column headers stay
 * mounted.
 * top-right **Filters** then **Export** (`showFilter` / `showExport`). The table
 * does not own fetch, filter, or export logic — the host handles those events.
 *
 * Optional footer pager: pass {@link meta} to embed {@link PaginationComponent};
 * the host still owns refetch via {@link pageChange} / {@link sizeChange}. The
 * pager also writes `page` / `size` to the URL (same keys as filters). Rows
 * are never sliced client-side. While {@link loading} or {@link refreshing} is
 * true and rows are on screen, the pager shows a circular spinner and is
 * disabled — so a page change is visible when the toolbar is scrolled away.
 *
 * **Async body:** first load, empty results, and hard errors render inside the
 * grid (headers + toolbar stay). Bind {@link loading}, {@link error}, and
 * {@link emptyMessage}. Empty/error Retry emits {@link refreshClick}. A stale
 * error (rows still on screen) shows {@link ErrorIndicatorComponent} over the
 * grid. Do not wrap list tables in {@link AsyncStateComponent} — that tears
 * down Filters / Export / pager.
 *
 * Sorting is server-driven — sortable headers emit {@link TableSortChange}
 * and never reorder local rows.
 *
 * **Expandable rows:** project `<ng-template aiesRowDetail="Label" let-row>`
 * templates. A leading chevron column appears; the expanded panel renders each
 * label with its template value in a responsive grid.
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
 *   [refreshing]="softFetching()"
 *   [loading]="pageLoading()"
 *   [error]="listError()"
 *   emptyMessage="No shipments match these filters."
 *   [showFilter]="true"
 *   [showExport]="true"
 *   [filterCount]="activeFilterCount()"
 *   (refreshClick)="refetch()"
 *   (filterClick)="openFilters()"
 *   (exportClick)="exportCsv()"
 *   (pageChange)="onPageChange($event)"
 *   (sizeChange)="onSizeChange($event)"
 *   [sort]="sort()"
 *   (sortChange)="onSort($event)"
 * >
 *   <ng-template aiesCellDef="status" let-row>…</ng-template>
 *   <ng-template aiesRowDetail="Carrier" let-row>…</ng-template>
 * </aies-table>
 * ```
 *
 * **Sticky columns:** a column with `key: 'actions'` stays pinned to the
 * right while the grid scrolls horizontally. The expand trigger column pins
 * to the left when rows are expandable. Override with
 * {@link TableColumn.sticky}.
 */
@Component({
  selector: 'aies-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    AiesIconComponent,
    EmptyStateComponent,
    ErrorIndicatorComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PaginationComponent,
  ],
  host: {
    class: 'block w-full min-w-0',
  },
  styles: `
    /* Full-row hover: sticky action cells use an opaque fill that would
       otherwise mask a <tr> background. Paint every cell the same way. */
    :host tr.aies-table-row:hover > td {
      background-color: #eef2f6;
    }
    :host-context(.dark) tr.aies-table-row:hover > td {
      background-color: #272729;
    }
  `,
  template: `
    <div
      class="flex w-full min-w-0 flex-col gap-3"
      [attr.aria-busy]="loading() || refreshing() || null"
    >
      @if (showRefresh() || showFilter() || showExport()) {
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            @if (showToolbarRefresh()) {
              <button
                aies-button
                type="button"
                variant="secondary"
                size="sm"
                [disabled]="loading() || refreshing()"
                [attr.aria-label]="refreshLabel()"
                (click)="refreshClick.emit()"
              >
                <aies-icon
                  name="refresh"
                  [size]="16"
                  [class]="refreshing() ? 'animate-spin' : ''"
                />
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
        class="relative min-w-0 w-full overflow-x-auto rounded-md border border-border bg-white dark:border-white/10 dark:bg-ink"
      >
        @if (staleError(); as staleMessage) {
          <aies-error-indicator
            class="absolute top-3 right-3 z-10 max-w-[min(100%-1.5rem,20rem)]"
            [error]="staleMessage"
            retryText="Refresh"
            [refreshing]="refreshing()"
            (retry)="refreshClick.emit()"
          />
        }
        <table
          class="w-max min-w-full table-auto border-separate border-spacing-0 bg-inherit text-left text-body text-ink dark:text-white"
        >
          <thead
            class="border-b border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
          >
            <tr>
              @if (isExpandable()) {
                <th
                  scope="col"
                  [class]="expandHeaderClass()"
                >
                  @if (someRowsExpanded()) {
                    <button
                      type="button"
                      class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label="Collapse all"
                      (click)="collapseAllRows()"
                    >
                      <aies-icon name="minus" [size]="16" />
                    </button>
                  } @else {
                    <button
                      type="button"
                      class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label="Expand all"
                      [disabled]="rowList().length === 0"
                      (click)="expandAllRows()"
                    >
                      <aies-icon name="plus" [size]="16" />
                    </button>
                  }
                </th>
              }
              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  [class]="headerCellClass(col)"
                  [style.width]="col.width ?? null"
                >
                  @if (headerTemplateFor(col.key); as headerTpl) {
                    <ng-container
                      [ngTemplateOutlet]="headerTpl"
                    />
                  } @else if (col.sortable) {
                    <button
                      type="button"
                      class="inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium text-neutral-600 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:text-white"
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
            @switch (bodyKind()) {
              @case ('loading') {
                <tr>
                  <td class="px-3 py-6" [attr.colspan]="colSpan()">
                    <aies-loading-state [message]="loadingLabel()" />
                  </td>
                </tr>
              }
              @case ('error') {
                <tr>
                  <td class="px-3 py-6" [attr.colspan]="colSpan()">
                    <aies-error-state
                      [message]="errorMessage()"
                      [refreshing]="refreshing()"
                      (retry)="refreshClick.emit()"
                    />
                  </td>
                </tr>
              }
              @case ('empty') {
                <tr>
                  <td class="px-3 py-6" [attr.colspan]="colSpan()">
                    <aies-empty-state
                      [message]="emptyMessage()"
                      [refreshing]="refreshing()"
                      (retry)="refreshClick.emit()"
                    />
                  </td>
                </tr>
              }
              @default {
            @for (row of rowList(); track rowId(row, $index); let i = $index) {
              <tr [class]="bodyRowClass(row, i)">
                @if (isExpandable()) {
                  <td [class]="expandBodyClass(i)">
                    <button
                      type="button"
                      class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-background-welcome hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                      [attr.aria-label]="
                        isRowExpanded(row, i)
                          ? 'Collapse row details'
                          : 'Expand row details'
                      "
                      [attr.aria-expanded]="isRowExpanded(row, i)"
                      (click)="toggleRowExpanded(row, i)"
                    >
                      <aies-icon
                        [name]="isRowExpanded(row, i) ? 'minus' : 'plus'"
                        [size]="16"
                      />
                    </button>
                  </td>
                }
                @for (col of columns(); track col.key) {
                  <td
                    [class]="bodyCellClass(col, i)"
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
              @if (isExpandable()) {
                <tr
                  class="last:border-b-0"
                  [class.border-b]="isRowExpanded(row, i)"
                  [class.border-border]="isRowExpanded(row, i)"
                  [class.dark:border-white/10]="isRowExpanded(row, i)"
                >
                  <td class="p-0 align-top" [attr.colspan]="columns().length + 1">
                    <div
                      class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                      [style.grid-template-rows]="
                        isRowExpanded(row, i) ? '1fr' : '0fr'
                      "
                      [attr.aria-hidden]="!isRowExpanded(row, i)"
                      [class.pointer-events-none]="!isRowExpanded(row, i)"
                    >
                      <div
                        class="min-h-0 overflow-hidden bg-background-welcome/50 dark:bg-white/[0.03]"
                      >
                        <dl
                          class="m-0 grid gap-x-6 gap-y-3 px-3 py-3 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:grid-cols-2 lg:grid-cols-3"
                          [class.opacity-0]="!isRowExpanded(row, i)"
                          [class.opacity-100]="isRowExpanded(row, i)"
                        >
                          @for (detail of rowDetailDefs(); track detail.label()) {
                            <div class="min-w-0">
                              <dt
                                class="m-0 text-caption font-medium text-neutral-500 dark:text-neutral-400"
                              >
                                {{ detail.label() }}
                              </dt>
                              <dd
                                class="m-0 mt-0.5 text-body-sm text-ink dark:text-white"
                              >
                                <ng-container
                                  [ngTemplateOutlet]="detail.template"
                                  [ngTemplateOutletContext]="cellContext(row)"
                                />
                              </dd>
                            </div>
                          }
                        </dl>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            }
              }
            }
          </tbody>
        </table>
      </div>

      @if (meta(); as pager) {
        <aies-pagination
          [meta]="pager"
          [loading]="paginationLoading()"
          [disabled]="loading() && !paginationLoading()"
          (pageChange)="pageChange.emit($event)"
          (sizeChange)="sizeChange.emit($event)"
        />
      }
    </div>
  `,
})
export class TableComponent<T = unknown> {
  /**
   * When false, hides row expansion even if {@link RowDetailDefDirective}
   * templates are projected. Defaults to true.
   */
  readonly expandable = input(true, { transform: booleanAttribute });

  /**
   * Stable row id for expansion state. Defaults to the row index in `rows`.
   */
  readonly rowTrackBy = input<(row: T, index: number) => string | number>(
    (_row, index) => index,
  );

  /** Emitted when a row is expanded or collapsed. */
  readonly rowExpandChange = output<{ row: T; expanded: boolean }>();

  /** Column definitions (header chrome + keys). */
  readonly columns = input.required<TableColumn<T>[]>();

  /**
   * Row records to render. Empty arrays show {@link EmptyStateComponent} in
   * the body unless {@link loading} or {@link error} is set. Missing `data`
   * during load is treated as `[]`.
   */
  readonly rows = input.required<T[]>();

  /**
   * Optional current sort so header indicators stay in sync with the
   * server-side `order` param. Omitted / null means no column is active.
   */
  readonly sort = input<TableSortChange | null>(null);

  /**
   * Show a Refresh button above the table (top-left) once rows are on screen.
   * Hidden during in-grid empty/error — those use Retry in the body. Host refetches
   * from {@link refreshClick}.
   */
  readonly showRefresh = input(false, { transform: booleanAttribute });

  /** Label on the refresh trigger. Defaults to `Refresh`. */
  readonly refreshLabel = input('Refresh');

  /**
   * Background refetch in flight. Rows stay visible; the refresh icon spins.
   * Bind to a soft refetch flag (e.g. refresh button) — not page changes.
   * Prefer {@link loading} when the page of rows is changing.
   */
  readonly refreshing = input(false, { transform: booleanAttribute });

  /**
   * Page of data is loading (first load, shipping-mode switch, pagination,
   * page size). When rows are already on screen, the pager shows a spinner
   * and rows stay visible; when there are no rows (first load or the host
   * dropped STN/SFN rows after a mode switch), the body shows
   * {@link LoadingStateComponent}. Distinct from {@link refreshing}.
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Copy under the loading spinner. Defaults to `Loading…`. */
  readonly loadingLabel = input('Loading…');

  /**
   * Hard fetch failure. Empty rows → {@link ErrorStateComponent} in the body.
   * Rows still present → {@link ErrorIndicatorComponent} over the grid.
   * Retry emits {@link refreshClick}.
   */
  readonly error = input<string | null>(null);

  /**
   * Copy for the in-grid empty state when there are no rows and no error.
   */
  readonly emptyMessage = input('No results found.');

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
   * owns refetch via {@link pageChange} / {@link sizeChange} — rows are never
   * sliced here.
   */
  readonly meta = input<PaginationMetaModel | null>(null);

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

  /**
   * New page size from the size dropdown. Host should refetch at page 1;
   * this component does not change `rows`.
   */
  readonly sizeChange = output<number>();

  /** Projected cell templates keyed by column. */
  private readonly cellDefs = contentChildren(CellDefDirective);

  /** Projected header cell templates keyed by column. */
  private readonly headerCellDefs = contentChildren(HeaderCellDefDirective);

  /** Projected label / value templates for expanded rows. */
  protected readonly rowDetailDefs = contentChildren(RowDetailDefDirective);

  private readonly expandedRowIds = signal<ReadonlySet<string>>(new Set());

  protected readonly rowList = computed(() => this.rows() ?? []);

  protected readonly isExpandable = computed(
    () => this.expandable() && this.rowDetailDefs().length > 0,
  );

  protected readonly colSpan = computed(
    () => this.columns().length + (this.isExpandable() ? 1 : 0),
  );

  protected readonly errorMessage = computed(
    () => this.error()?.trim() || 'Something went wrong.',
  );

  protected readonly staleError = computed(() => {
    const message = this.error()?.trim();
    if (!message || this.loading() || this.rowList().length === 0) {
      return null;
    }
    return message;
  });

  protected readonly bodyKind = computed(
    (): 'loading' | 'error' | 'empty' | 'rows' => {
      if (this.loading() && this.rowList().length === 0) {
        return 'loading';
      }
      if (this.error()?.trim() && this.rowList().length === 0) {
        return 'error';
      }
      if (this.rowList().length === 0) {
        return 'empty';
      }
      return 'rows';
    },
  );

  protected readonly paginationLoading = computed(
    () =>
      (this.loading() || this.refreshing()) && this.rowList().length > 0,
  );

  /** Top-left Refresh — only when rows are on screen (empty/error use in-body Retry). */
  protected readonly showToolbarRefresh = computed(
    () => this.showRefresh() && this.bodyKind() === 'rows',
  );

  protected readonly visibleRowIds = computed(() =>
    this.rowList().map((row, index) => this.rowId(row, index)),
  );

  protected readonly someRowsExpanded = computed(() => {
    const open = this.expandedRowIds();
    return this.visibleRowIds().some((id) => open.has(id));
  });

  /** Lookup map rebuilt when projected cell defs change. */
  private readonly cellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.cellDefs()) {
      map.set(def.aiesCellDef(), def.template);
    }
    return map;
  });

  /** Lookup map rebuilt when projected header cell defs change. */
  private readonly headerCellTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.headerCellDefs()) {
      map.set(def.aiesHeaderCellDef(), def.template);
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

  /** Resolves the projected header template for a column key, if any. */
  protected headerTemplateFor(key: string): TemplateRef<unknown> | null {
    return this.headerCellTemplateMap().get(key) ?? null;
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
   * Body row classes — row marker for hover styles, plus hide cell borders on
   * the last / expanded row.
   * @param row - Current row.
   * @param index - Index within {@link rows}.
   * @returns Tailwind class list.
   */
  protected bodyRowClass(row: T, index: number): string {
    if (this.isExpandable() && this.isRowExpanded(row, index)) {
      // Only the bottom edge — keep the top divider so the row still
      // separates from the row above.
      return 'aies-table-row group [&>td]:border-b-0';
    }
    return 'aies-table-row group last:[&>td]:border-b-0';
  }

  /**
   * Horizontal pin edge for a column. `key: 'actions'` sticks right unless
   * {@link TableColumn.sticky} opts out.
   *
   * @param col - Column definition.
   * @returns `'left'` / `'right'`, or `null` when the column scrolls with the grid.
   */
  protected stickyEdge(col: TableColumn<T>): 'left' | 'right' | null {
    if (col.sticky === false) {
      return null;
    }
    if (col.sticky === 'left' || col.sticky === 'right') {
      return col.sticky;
    }
    return col.key === 'actions' ? 'right' : null;
  }

  /**
   * Header classes for the expand/collapse trigger column (pinned left).
   * @returns Header class list.
   */
  protected expandHeaderClass(): string {
    return (
      'w-10 border-b border-border px-2 py-3.5 dark:border-white/10 ' +
      this.stickyPinClass('left', 'head')
    );
  }

  /**
   * Body classes for the expand/collapse trigger column (pinned left).
   * Omits `border-b` like other sticky cells so the opaque fill does not
   * double-paint the row divider.
   * @param index - Index within {@link rows}.
   * @returns Body cell class list.
   */
  protected expandBodyClass(index: number): string {
    const prev = index > 0 ? this.rowList()[index - 1] : undefined;
    const afterExpanded =
      prev !== undefined && this.isRowExpanded(prev, index - 1);
    return (
      'w-10 px-2 py-3.5 align-middle ' +
      this.stickyPinClass('left', 'body', index, afterExpanded)
    );
  }

  /**
   * Header cell classes, including sticky pin when set.
   * @param col - Column definition.
   * @returns Header class list.
   */
  protected headerCellClass(col: TableColumn<T>): string {
    return (
      'border-b border-border whitespace-normal wrap-break-word px-3 py-3.5 font-medium text-neutral-600 dark:border-white/10 dark:text-neutral-400 ' +
      this.stickySurfaceClass(col, 'head')
    );
  }

  /**
   * Body cell classes, including sticky pin when set.
   * Sticky cells omit `border-b`: their opaque fill sits in a higher stacking
   * context, so a bottom border plus the next row's top shadow paint on the
   * same pixel and read brighter (especially in dark mode).
   * @param col - Column definition.
   * @param index - Index within {@link rows}.
   * @returns Body cell class list.
   */
  protected bodyCellClass(col: TableColumn<T>, index: number): string {
    const rowLine = this.stickyEdge(col)
      ? ''
      : 'border-b border-border dark:border-white/10 ';
    const prev = index > 0 ? this.rowList()[index - 1] : undefined;
    const afterExpanded =
      prev !== undefined && this.isRowExpanded(prev, index - 1);
    const wrap =
      col.key === 'actions'
        ? 'whitespace-nowrap '
        : 'whitespace-normal wrap-break-word ';
    return (
      rowLine +
      'px-3 py-3.5 align-middle ' +
      wrap +
      this.stickySurfaceClass(col, 'body', index, afterExpanded)
    );
  }

  /**
   * Sticky pin utilities for a known edge (expand column or data column).
   * @param edge - Left or right pin.
   * @param surface - Header vs body fill tokens.
   * @param index - Body row index; unused for the header.
   * @param afterExpanded - Previous row is expanded — skip the top shadow
   *   divider so the sticky column stays flush under the detail panel.
   * @returns Sticky utilities.
   */
  protected stickyPinClass(
    edge: 'left' | 'right',
    surface: 'head' | 'body',
    index = 0,
    afterExpanded = false,
  ): string {
    // Expand (left) sits above scrolling cells; actions (right) match.
    // Header needs a higher z so it stays above sticky body cells.
    const side =
      edge === 'right' ? 'sticky right-0 z-[1]' : 'sticky left-0 z-[1]';
    if (surface === 'head') {
      return `${side} z-[2] bg-background-welcome dark:bg-ink-950`;
    }
    const rowDivider =
      !afterExpanded && index > 0
        ? 'shadow-[0_-1px_0_0_#c9d5e1] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.1)]'
        : '';
    const fill = 'bg-white dark:bg-ink';
    return `${side} ${fill} ${rowDivider}`;
  }

  /**
   * Sticky pin plus an opaque fill matching the table surface, so scrolled
   * cells do not show through.
   * @param col - Column definition.
   * @param surface - Header vs body fill tokens.
   * @param index - Body row index; unused for the header.
   * @param afterExpanded - Previous row is expanded — skip the top shadow.
   * @returns Sticky utilities, or empty when the column scrolls.
   */
  protected stickySurfaceClass(
    col: TableColumn<T>,
    surface: 'head' | 'body',
    index = 0,
    afterExpanded = false,
  ): string {
    const edge = this.stickyEdge(col);
    if (!edge) {
      return '';
    }
    return this.stickyPinClass(edge, surface, index, afterExpanded);
  }

  /**
   * Stable id for a row — used for expand/collapse state.
   *
   * @param row - Current row.
   * @param index - Index within {@link rows}.
   * @returns String form of {@link rowTrackBy} for this row.
   */
  protected rowId(row: T, index: number): string {
    return String(this.rowTrackBy()(row, index));
  }

  /**
   * Whether a row's detail panel is open.
   * @param row - Current row.
   * @param index - Index within {@link rows}.
   * @returns True when this row's detail panel is expanded.
   */
  protected isRowExpanded(row: T, index: number): boolean {
    return this.expandedRowIds().has(this.rowId(row, index));
  }

  /**
   * Toggle expanded state for a row.
   * @param row
   * @param index
   */
  protected toggleRowExpanded(row: T, index: number): void {
    const id = this.rowId(row, index);
    const expanded = this.expandedRowIds().has(id);
    this.expandedRowIds.update((set) => {
      const next = new Set(set);
      if (expanded) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    this.rowExpandChange.emit({ row, expanded: !expanded });
  }

  /** Expand every visible row. */
  protected expandAllRows(): void {
    this.expandedRowIds.set(new Set(this.visibleRowIds()));
  }

  /** Collapse every visible row. */
  protected collapseAllRows(): void {
    this.expandedRowIds.set(new Set());
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
