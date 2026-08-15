// Overlay service copy-paste examples.

export /**
 *
 */
const OVERLAY_MODAL = `// Centered modal via ModalService. Needs provideAiesUiOverlays() in app.config.
// Built on Angular CDK Overlay (panels attach to body — not clipped by overflow).
// Inject OVERLAY_DATA in the panel, close with AiesOverlayRef.close(result).
// dismissible defaults to false — backdrop/Escape only work when you opt in.

// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAiesUiOverlays } from '@aies/aies-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAiesUiOverlays(),
  ],
};

// --- Hosted panel ---
import { Component, inject } from '@angular/core';
import {
  AiesOverlayRef,
  ButtonComponent,
  OVERLAY_DATA,
} from '@aies/aies-ui';

export interface EditShipmentData {
  shipmentRef: string;
}

export interface EditShipmentResult {
  saved: boolean;
  note: string;
}

@Component({
  selector: 'app-edit-shipment-modal',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <div class="flex flex-col gap-5">
      <h2 class="m-0 text-heading-3 text-ink dark:text-white">
        Edit {{ data.shipmentRef }}
      </h2>

      <label class="flex flex-col gap-1.5">
        <span class="text-caption font-medium text-neutral-600">Note</span>
        <input
          class="rounded-md border border-border px-3 py-2 text-body"
          type="text"
          [value]="note"
          (input)="note = $any($event.target).value"
        />
      </label>

      <div class="flex justify-end gap-2">
        <button aies-button type="button" variant="ghost" (click)="ref.close()">
          Cancel
        </button>
        <button
          aies-button
          type="button"
          variant="primary"
          (click)="ref.close({ saved: true, note })"
        >
          Save
        </button>
      </div>
    </div>
  \`,
})
export class EditShipmentModalComponent {
  protected readonly data = inject<EditShipmentData>(OVERLAY_DATA);
  protected readonly ref = inject(AiesOverlayRef<EditShipmentResult>);
  protected note = '';
}

// --- Caller ---
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent, ModalService } from '@aies/aies-ui';

@Component({
  selector: 'app-open-modal-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <button aies-button type="button" variant="primary" (click)="openLocked()">
      Edit shipment
    </button>
    <button aies-button type="button" variant="secondary" (click)="openDismissible()">
      Quick look
    </button>
  \`,
})
export class OpenModalDemoComponent {
  private readonly modal = inject(ModalService);

  protected openLocked(): void {
    this.modal
      .open<EditShipmentData, EditShipmentResult>(EditShipmentModalComponent, {
        data: { shipmentRef: 'SFN-1042' },
        // dismissible defaults to false — backdrop / Escape do nothing.
      })
      .afterClosed()
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        if (result?.saved) {
          // Apply note locally or invalidate list query — no second GET needed.
        }
      });
  }

  protected openDismissible(): void {
    this.modal
      .open<EditShipmentData, EditShipmentResult>(EditShipmentModalComponent, {
        data: { shipmentRef: 'SFN-1042' },
        dismissible: true,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        // result undefined when dismissed via backdrop / Escape / Cancel without save.
      });
  }
}`;

export /**
 *
 */
const OVERLAY_DRAWER = `// Right-edge drawer — same OVERLAY_DATA / AiesOverlayRef contract as modals.
// Good for filters and detail chrome. Default is locked; set dismissible: true for abandonable panels.

import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AiesOverlayRef,
  ButtonComponent,
  DrawerService,
  OVERLAY_DATA,
} from '@aies/aies-ui';

export interface FiltersDrawerData {
  facet: string;
}

export interface FiltersDrawerResult {
  applied: boolean;
}

@Component({
  selector: 'app-filters-drawer',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <div class="flex h-full flex-col gap-5">
      <h2 class="m-0 text-heading-3 text-ink dark:text-white">
        Filters — {{ data.facet }}
      </h2>

      <ul class="m-0 flex list-none flex-col gap-2 p-0">
        @for (opt of options; track opt) {
          <li>
            <label class="flex items-center gap-2 rounded-md border border-border px-3 py-2">
              <input type="checkbox" />
              {{ opt }}
            </label>
          </li>
        }
      </ul>

      <div class="mt-auto flex justify-end gap-2 pt-4">
        <button aies-button type="button" variant="ghost" (click)="ref.close()">
          Cancel
        </button>
        <button
          aies-button
          type="button"
          variant="primary"
          (click)="ref.close({ applied: true })"
        >
          Apply
        </button>
      </div>
    </div>
  \`,
})
export class FiltersDrawerComponent {
  protected readonly data = inject<FiltersDrawerData>(OVERLAY_DATA);
  protected readonly ref = inject(AiesOverlayRef<FiltersDrawerResult>);
  protected readonly options = ['In transit', 'Delivered', 'Pending', 'Exception'] as const;
}

@Component({
  selector: 'app-open-drawer-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <button aies-button type="button" variant="secondary" (click)="open(false)">
      Open (locked)
    </button>
    <button aies-button type="button" variant="primary" (click)="open(true)">
      Open (dismissible)
    </button>
  \`,
})
export class OpenDrawerDemoComponent {
  private readonly drawer = inject(DrawerService);

  protected open(dismissible: boolean): void {
    this.drawer
      .open<FiltersDrawerData, FiltersDrawerResult>(FiltersDrawerComponent, {
        data: { facet: 'Status' },
        dismissible,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        if (result?.applied) {
          // Push facet selections into list query params → refetch.
        }
      });
  }
}`;

export /**
 *
 */
const OVERLAY_CONFIRM = `// One-liner confirm via ConfirmService — returns Observable<boolean>.
// Set danger: true for delete/void. Don't open ConfirmDialogComponent yourself.

import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent, ConfirmService } from '@aies/aies-ui';

@Component({
  selector: 'app-confirm-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <button aies-button type="button" variant="secondary" (click)="confirmNeutral()">
      Mark delivered
    </button>

    <button aies-button type="button" variant="danger" (click)="confirmDestructive()">
      Delete shipment
    </button>

    <button aies-button type="button" variant="ghost" (click)="confirmDismissible()">
      Dismissible confirm
    </button>
  \`,
})
export class ConfirmDemoComponent {
  private readonly confirm = inject(ConfirmService);

  protected confirmNeutral(): void {
    this.confirm
      .confirm({
        title: 'Mark as delivered?',
        message: 'The consignee will be notified that the shipment is complete.',
        confirmLabel: 'Mark delivered',
        cancelLabel: 'Cancel',
        danger: false,
      })
      .pipe(takeUntilDestroyed())
      .subscribe((ok) => {
        if (ok) {
          this.markDelivered();
        }
      });
  }

  protected confirmDestructive(): void {
    this.confirm
      .confirm({
        title: 'Delete shipment?',
        message: 'This cannot be undone. Related documents stay in archive.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true,
        // Optional: keep the dialog open with a loading Confirm until this
        // settles. Errors leave it open so the user can retry or cancel.
        // onConfirm: () => this.shipments.delete(id),
      })
      .pipe(takeUntilDestroyed())
      .subscribe((ok) => {
        if (ok) {
          this.deleteShipment();
        }
      });
  }

  protected confirmDismissible(): void {
    this.confirm
      .confirm({
        title: 'Discard unsaved changes?',
        message: 'Your draft note will be lost.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
        danger: true,
        dismissible: true,
        // backdrop / Escape → false (same as Cancel) via ConfirmService map.
      })
      .pipe(takeUntilDestroyed())
      .subscribe((ok) => {
        if (ok) {
          this.discardDraft();
        }
      });
  }

  private markDelivered(): void {
    // mutation.mutate({ id, status: 'Delivered' })
  }

  private deleteShipment(): void {
    // mutation.mutate({ id })
  }

  private discardDraft(): void {
    // navigate away or ref.close() on parent overlay
  }
}`;
