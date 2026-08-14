import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { map } from 'rxjs';

import { ChipComponent, type ChipVariant } from '@aies/aies-ui';

import { findUsecaseShipment } from './shipment-data';

/**
 * Child detail route — Back returns to the shipment list parent.
 */
@Component({
  selector: 'app-shipment-detail-page',
  standalone: true,
  imports: [ChipComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-6">
      @if (shipment(); as row) {
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="m-0 text-caption uppercase tracking-wide text-neutral-500">
              Shipment
            </p>
            <p class="m-0 text-heading-3 text-ink dark:text-white">
              {{ row.reference }}
            </p>
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ row.route }}
            </p>
          </div>
          <aies-chip [variant]="statusVariant(row.status)">
            {{ row.status }}
          </aies-chip>
        </div>

        <dl
          class="grid gap-4 rounded-xl border border-border bg-white px-5 py-4 sm:grid-cols-3 dark:border-white/10 dark:bg-ink"
        >
          <div>
            <dt class="text-caption text-neutral-500">Origin</dt>
            <dd class="m-0 mt-0.5 text-body-sm font-medium text-ink dark:text-white">
              {{ row.origin }}
            </dd>
          </div>
          <div>
            <dt class="text-caption text-neutral-500">Destination</dt>
            <dd class="m-0 mt-0.5 text-body-sm font-medium text-ink dark:text-white">
              {{ row.destination }}
            </dd>
          </div>
          <div>
            <dt class="text-caption text-neutral-500">Updated</dt>
            <dd class="m-0 mt-0.5 text-body-sm font-medium text-ink dark:text-white">
              {{ row.updated }}
            </dd>
          </div>
        </dl>

        <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          The chevron and breadcrumbs above are provided by the SDK — this page
          does not add them. Paste
          <code class="rounded bg-background-welcome px-1 py-0.5 dark:bg-ink-950">
            /usecases/shipment/{{ row.reference }}
          </code>
          in a new tab and it still appears, returning to the list.
        </p>
      } @else {
        <p class="m-0 text-body text-neutral-600 dark:text-neutral-400">
          Unknown shipment.
        </p>
      }
    </div>
  `,
})
export class ShipmentDetailPage {
  private readonly route = inject(ActivatedRoute);

  private readonly reference = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  protected readonly shipment = computed(() =>
    findUsecaseShipment(this.reference()),
  );

  protected statusVariant(status: string): ChipVariant {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Exception':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
