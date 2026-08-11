import { AiesIconComponent } from '@aies/aies-icons';
import { Component, inject } from '@angular/core';
import {
  AiesOverlayRef,
  ButtonComponent,
  OVERLAY_DATA,
} from '@aies/aies-ui';

/** Payload for the playground sample modal. */
export interface DemoModalData {
  shipmentRef: string;
}

/** Payload for the playground sample drawer. */
export interface DemoDrawerData {
  facet: string;
}

/**
 * Sample modal body — mirrors how consuming apps inject data + close with a result.
 */
@Component({
  selector: 'app-demo-modal-panel',
  standalone: true,
  imports: [ButtonComponent, AiesIconComponent],
  template: `
    <div class="flex flex-col gap-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-1 min-w-0">
          <p class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Modal
          </p>
          <h2 class="m-0 text-heading-3 text-ink dark:text-white">
            Edit {{ data.shipmentRef }}
          </h2>
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Hosted via ModalService.open — inject OVERLAY_DATA and
            AiesOverlayRef to close with a result.
          </p>
        </div>
        <button
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close"
          (click)="ref.close()"
        >
          <aies-icon name="close" [size]="18" />
        </button>
      </div>

      <label class="flex flex-col gap-1.5">
        <span class="text-caption font-medium text-neutral-600 dark:text-neutral-400">
          Note
        </span>
        <input
          class="rounded-md border border-border bg-white px-3 py-2 text-body text-ink outline-none focus:border-neutral-400 dark:border-white/15 dark:bg-ink dark:text-white"
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
  `,
})
export class DemoModalPanel {
  protected readonly data = inject<DemoModalData>(OVERLAY_DATA);
  protected readonly ref = inject(
    AiesOverlayRef<{ saved: boolean; note: string }>,
  );
  protected note = 'Ready for customs clearance';
}

/**
 * Sample drawer body — right-edge panel for filters / detail chrome.
 */
@Component({
  selector: 'app-demo-drawer-panel',
  standalone: true,
  imports: [ButtonComponent, AiesIconComponent],
  template: `
    <div class="flex h-full flex-col gap-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-1 min-w-0">
          <p class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            Drawer
          </p>
          <h2 class="m-0 text-heading-3 text-ink dark:text-white">
            Filters — {{ data.facet }}
          </h2>
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Same OverlayOpener contract as modals; panel docks to the right.
          </p>
        </div>
        <button
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close"
          (click)="ref.close()"
        >
          <aies-icon name="close" [size]="18" />
        </button>
      </div>

      <ul class="m-0 flex list-none flex-col gap-2 p-0">
        @for (opt of options; track opt) {
          <li>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-ink dark:border-white/15 dark:text-white"
            >
              <input type="checkbox" class="accent-current" [checked]="opt === 'In transit'" />
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
  `,
})
export class DemoDrawerPanel {
  protected readonly data = inject<DemoDrawerData>(OVERLAY_DATA);
  protected readonly ref = inject(AiesOverlayRef<{ applied: boolean }>);
  protected readonly options = [
    'In transit',
    'Delivered',
    'Pending',
    'Exception',
  ] as const;
}
