import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import type { PaginationMeta } from '@aies/aies-models';

import { ButtonComponent } from '../button/button.component';

/**
 * Prev / next pager driven by {@link PaginationMeta} from the API envelope.
 *
 * WHY reuse `PaginationMeta` instead of a UI-specific type: list endpoints
 * already return this shape on {@link ApiResponseModel.pagination}, so the
 * component wires straight to `response().pagination` with no mapping layer.
 *
 * Prev/next disable via `hasPreviousPage` / `hasNextPage` rather than
 * recomputing bounds from `currentPage` / `totalPages`.
 *
 * @example
 * ```ts
 * readonly page = signal(1);
 * readonly response = signal<ApiResponseModel<Shipment[]> | null>(null);
 *
 * load(page: number): void {
 *   this.api
 *     .getResource<Shipment>('shipments', null, { page, size: 20 })
 *     .subscribe((res) => {
 *       this.page.set(page);
 *       this.response.set(res);
 *     });
 * }
 *
 * onPageChange(next: number): void {
 *   this.load(next);
 * }
 * ```
 * ```html
 * @if (response(); as res) {
 *   <aies-table [columns]="columns" [rows]="res.data ?? []" />
 *   @if (res.pagination; as meta) {
 *     <aies-pagination [meta]="meta" (pageChange)="onPageChange($event)" />
 *   }
 * }
 * ```
 *
 * Page controls for server-style lists (bind to {@link PaginationMeta}).
 */
@Component({
  selector: 'aies-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <nav
      class="flex flex-wrap items-center justify-between gap-3 py-2 text-body text-ink dark:text-white"
      aria-label="Pagination"
    >
      <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
        Page {{ meta().currentPage }} of {{ meta().totalPages }}
        <span class="text-neutral-400 dark:text-neutral-500">
          ({{ meta().totalItems }} items)
        </span>
      </p>
      <div class="inline-flex items-center gap-2">
        <button
          aies-button
          type="button"
          variant="secondary"
          size="sm"
          [disabled]="!meta().hasPreviousPage"
          (click)="emitPage(meta().currentPage - 1)"
        >
          Previous
        </button>
        <button
          aies-button
          type="button"
          variant="secondary"
          size="sm"
          [disabled]="!meta().hasNextPage"
          (click)="emitPage(meta().currentPage + 1)"
        >
          Next
        </button>
      </div>
    </nav>
  `,
})
export class PaginationComponent {
  /**
   * Pagination slice from the latest list response.
   *
   * Prefer binding `response().pagination` directly when non-null.
   */
  readonly meta = input.required<PaginationMeta>();

  /**
   * Target 1-based page number after a prev/next activation.
   *
   * Consumers should call `getResource(..., { page })` again — this component
   * does not fetch.
   */
  readonly pageChange = output<number>();

  /**
   * Emits only when the requested page differs from `currentPage`.
   *
   * @param page - Candidate page index (already clamped by disabled buttons
   *   in the common case; still guard against no-ops).
   */
  protected emitPage(page: number): void {
    if (page === this.meta().currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }
}
