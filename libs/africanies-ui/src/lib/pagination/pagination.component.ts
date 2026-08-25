import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import {
  DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
  type PaginationMetaModel,
  type PaginationPageSize,
} from '@africanies/africanies-models';
import { ModeColorService } from '@africanies/africanies-theme';

import { ButtonComponent } from '../button/button.component';
import { FilterQueryService } from '../filters/filter-query.service';
import { SelectComponent, type SelectOption } from '../forms/select';

/** Page number or a gap marker for windowed pagination. */
type PageItem = number | 'ellipsis';

/**
 * Page-size select, numbered pager, and prev/next — driven by
 * {@link PaginationMetaModel} from the API envelope.
 *
 * WHY reuse `PaginationMetaModel` instead of a UI-specific type: list endpoints
 * already return this shape on {@link ApiResponseModel.pagination}, so the
 * component wires straight to `response().pagination` with no mapping layer.
 *
 * Prev/next disable via `has_previous_page` / `has_next_page` rather than
 * recomputing bounds from `current_page` / `total_pages`. Page number buttons
 * use a windowed list (first / last / current ±1 with ellipsis) so long lists
 * stay compact.
 *
 * Size options are {@link PAGINATION_PAGE_SIZES} (`5`, `15`, `30`). Changing
 * size emits {@link sizeChange}; the host should refetch at page 1.
 *
 * When Angular Router is present, page / size also sync to the URL (`page`,
 * `size`) via {@link FilterQueryService} — same keys the filter drawer writes.
 *
 * @example
 * ```ts
 * readonly page = signal(1);
 * readonly size = signal(DEFAULT_PAGE_SIZE);
 * readonly response = signal<ApiResponseModel<Shipment[]> | null>(null);
 *
 * load(page: number, size = this.size()): void {
 *   this.api
 *     .getResource<Shipment>('shipments', null, { page, size })
 *     .subscribe((res) => {
 *       this.page.set(page);
 *       this.size.set(size);
 *       this.response.set(res);
 *     });
 * }
 *
 * onPageChange(next: number): void {
 *   this.load(next);
 * }
 *
 * onSizeChange(next: number): void {
 *   this.load(1, next);
 * }
 * ```
 * ```html
 * @if (response(); as res) {
 *   <africanies-table [columns]="columns" [rows]="res.data ?? []" />
 *   @if (res.pagination; as meta) {
 *     <africanies-pagination
 *       [meta]="meta"
 *       (pageChange)="onPageChange($event)"
 *       (sizeChange)="onSizeChange($event)"
 *     />
 *   }
 * }
 * ```
 *
 * Page controls for server-style lists (bind to {@link PaginationMetaModel}).
 */
@Component({
  selector: 'africanies-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, ButtonComponent, SelectComponent],
  template: `
    <nav
      class="flex flex-wrap items-center justify-between gap-3 py-2 text-body text-ink dark:text-white"
      aria-label="Pagination"
      [attr.aria-busy]="controlsDisabled() || null"
    >
      <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
        Page {{ meta().current_page }} of {{ meta().total_pages }}
        <span class="text-neutral-400 dark:text-neutral-500">
          ({{ meta().total_items }} items)
        </span>
      </p>
      <div class="inline-flex flex-wrap items-center gap-2">
        @if (loading()) {
          <span
            class="inline-flex size-8 shrink-0 items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <africanies-icon
              name="spinner"
              [size]="20"
              [class]="'animate-spin ' + modeColor.classes().text"
              aria-hidden="true"
            />
            <span class="sr-only">Loading page</span>
          </span>
        }
        <africanies-select
          class="w-20 [&_button[aria-haspopup]]:min-w-0"
          size="sm"
          [showTriggerIcon]="false"
          [disabled]="controlsDisabled()"
          [options]="sizeOptions()"
          [selected]="selectedSizeOption()"
          (selectedChange)="onSizeSelect($event)"
        >
          <africanies-icon
            suffix
            name="chevron-down"
            [size]="16"
            aria-hidden="true"
          />
        </africanies-select>
        <button
          africanies-button
          type="button"
          variant="secondary"
          size="sm"
          [disabled]="controlsDisabled() || !meta().has_previous_page"
          (click)="emitPage(meta().current_page - 1)"
        >
          Previous
        </button>
        @for (item of pageItems(); track trackPageItem(item, $index)) {
          @if (item === 'ellipsis') {
            <span
              class="inline-flex min-w-8 items-center justify-center text-body-sm text-neutral-500 dark:text-neutral-400"
              aria-hidden="true"
            >
              …
            </span>
          } @else {
            <button
              africanies-button
              type="button"
              size="sm"
              class="min-w-8"
              [variant]="item === meta().current_page ? 'primary' : 'secondary'"
              [disabled]="controlsDisabled()"
              [attr.aria-label]="'Page ' + item"
              [attr.aria-current]="
                item === meta().current_page ? 'page' : null
              "
              (click)="emitPage(item)"
            >
              {{ item }}
            </button>
          }
        }
        <button
          africanies-button
          type="button"
          variant="secondary"
          size="sm"
          [disabled]="controlsDisabled() || !meta().has_next_page"
          (click)="emitPage(meta().current_page + 1)"
        >
          Next
        </button>
      </div>
    </nav>
  `,
})
export class PaginationComponent {
  private readonly filterQuery = inject(FilterQueryService);
  protected readonly modeColor = inject(ModeColorService);
  /**
   * Pagination slice from the latest list response.
   *
   * Prefer binding `response().pagination` directly when non-null.
   */
  readonly meta = input.required<PaginationMetaModel>();

  /**
   * When true, disables size and page controls (e.g. while the table is
   * loading a new page).
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * When true, shows a circular spinner beside the page controls and disables
   * them. Use while fetching the next page so rows can stay on screen.
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Allowed row counts. Defaults to {@link PAGINATION_PAGE_SIZES}.
   */
  readonly pageSizes = input<readonly PaginationPageSize[]>(PAGINATION_PAGE_SIZES);

  /**
   * Target 1-based page number after a prev/next/number activation.
   *
   * Consumers should call `getResource(..., { page })` again — this component
   * does not fetch.
   */
  readonly pageChange = output<number>();

  /**
   * New page size after the size dropdown changes.
   *
   * Consumers should refetch at page 1 with this `size`.
   */
  readonly sizeChange = output<number>();

  protected readonly controlsDisabled = computed(
    () => this.disabled() || this.loading(),
  );

  protected readonly sizeOptions = computed((): SelectOption<number>[] =>
    this.pageSizes().map((value) => ({ label: String(value), value })),
  );

  protected readonly selectedSize = computed(() => {
    const perPage = this.meta().per_page;
    const sizes = this.pageSizes();
    if (sizes.includes(perPage as PaginationPageSize)) {
      return perPage;
    }
    return DEFAULT_PAGE_SIZE;
  });

  protected readonly selectedSizeOption = computed(
    (): SelectOption<number> | null =>
      this.sizeOptions().find((option) => option.value === this.selectedSize()) ??
      null,
  );

  /**
   * Windowed page list: all pages when `total_pages ≤ 7`, otherwise first /
   * last / current ±1 with ellipsis gaps.
   */
  protected readonly pageItems = computed((): PageItem[] => {
    const total = this.meta().total_pages;
    const current = this.meta().current_page;
    if (total <= 0) {
      return [];
    }
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: PageItem[] = [1];
    const showLeftEllipsis = current > 3;
    const showRightEllipsis = current < total - 2;
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (showLeftEllipsis) {
      items.push('ellipsis');
    }

    for (let page = start; page <= end; page += 1) {
      items.push(page);
    }

    if (showRightEllipsis) {
      items.push('ellipsis');
    }

    items.push(total);
    return items;
  });

  protected trackPageItem(item: PageItem, index: number): string {
    return item === 'ellipsis' ? `ellipsis-${index}` : `page-${item}`;
  }

  /**
   * Emits only when the requested page differs from `current_page`.
   *
   * @param page - Candidate page index (already clamped by disabled buttons
   *   in the common case; still guard against no-ops).
   */
  protected emitPage(page: number): void {
    if (this.controlsDisabled() || page === this.meta().current_page) {
      return;
    }
    void this.filterQuery.setPage(page);
    this.pageChange.emit(page);
  }

  /**
   * @param next - Selection from {@link SelectComponent} (single option).
   */
  protected onSizeSelect(
    next: SelectOption<number> | SelectOption<number>[] | null,
  ): void {
    if (this.controlsDisabled() || next == null || Array.isArray(next)) {
      return;
    }
    if (next.value === this.meta().per_page) {
      return;
    }
    void this.filterQuery.setSize(next.value);
    this.sizeChange.emit(next.value);
  }
}
