import { Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  ConfirmService,
  DrawerService,
  ModalService,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  OVERLAY_CONFIRM,
  OVERLAY_DRAWER,
  OVERLAY_MODAL,
} from '../snippets';
import {
  DemoDrawerPanel,
  DemoModalPanel,
} from './overlay-demos';

/**
 * Playground demos for ModalService, DrawerService, and ConfirmService.
 * Requires provideAiesUiOverlays() (already in playground app.config).
 */
@Component({
  selector: 'app-overlay-page',
  standalone: true,
  imports: [ButtonComponent, PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Overlays"
        description="Modal, drawer, and confirm — not dismissible by default. Pass dismissible: true for backdrop / Escape close."
      />

      <app-demo-section
        title="Modal"
        hint="Default requires Cancel / Save. Opt in with dismissible: true."
        badge="ModalService"
        [code]="modalCode"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button aies-button type="button" variant="primary" (click)="openModal(false)">
            Open (locked)
          </button>
          <button aies-button type="button" variant="secondary" (click)="openModal(true)">
            Open (dismissible)
          </button>
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Last result:
            <span class="font-medium text-ink dark:text-white">{{
              modalResult() ?? '—'
            }}</span>
          </p>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Drawer"
        hint="Same dismissible contract as modals."
        badge="DrawerService"
        [code]="drawerCode"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button aies-button type="button" variant="secondary" (click)="openDrawer(false)">
            Open (locked)
          </button>
          <button aies-button type="button" (click)="openDrawer(true)">
            Open (dismissible)
          </button>
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Last result:
            <span class="font-medium text-ink dark:text-white">{{
              drawerResult() ?? '—'
            }}</span>
          </p>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Confirm"
        hint="Requires Confirm or Cancel unless dismissible is set."
        badge="ConfirmService"
        [code]="confirmCode"
      >
        <div class="flex flex-wrap gap-3">
          <button aies-button type="button" (click)="openConfirm(false)">
            Neutral confirm
          </button>
          <button aies-button type="button" variant="danger" (click)="openConfirm(true)">
            Destructive confirm
          </button>
          <button
            aies-button
            type="button"
            variant="ghost"
            (click)="openConfirm(false, true)"
          >
            Dismissible confirm
          </button>
        </div>
        <p class="mt-3 m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Last choice:
          <span class="font-medium text-ink dark:text-white">{{
            confirmResult() ?? '—'
          }}</span>
        </p>
      </app-demo-section>
    </div>
  `,
})
export class OverlayPage {
  private readonly modal = inject(ModalService);
  private readonly drawer = inject(DrawerService);
  private readonly confirm = inject(ConfirmService);

  protected readonly modalResult = signal<string | null>(null);
  protected readonly drawerResult = signal<string | null>(null);
  protected readonly confirmResult = signal<string | null>(null);

  protected readonly modalCode = OVERLAY_MODAL;
  protected readonly drawerCode = OVERLAY_DRAWER;
  protected readonly confirmCode = OVERLAY_CONFIRM;

  protected openModal(dismissible: boolean): void {
    this.modal
      .open<
        { shipmentRef: string },
        { saved: boolean; note: string }
      >(DemoModalPanel, {
        data: { shipmentRef: 'SFN-1042' },
        dismissible,
      })
      .afterClosed()
      .subscribe((result) => {
        this.modalResult.set(
          result?.saved
            ? `Saved — “${result.note}”`
            : dismissible
              ? 'Dismissed (backdrop / Escape / Cancel)'
              : 'Closed via Cancel',
        );
      });
  }

  protected openDrawer(dismissible: boolean): void {
    this.drawer
      .open<{ facet: string }, { applied: boolean }>(DemoDrawerPanel, {
        data: { facet: 'Status' },
        dismissible,
      })
      .afterClosed()
      .subscribe((result) => {
        this.drawerResult.set(
          result?.applied
            ? 'Filters applied'
            : dismissible
              ? 'Dismissed (backdrop / Escape / Cancel)'
              : 'Closed via Cancel',
        );
      });
  }

  protected openConfirm(danger: boolean, dismissible = false): void {
    this.confirm
      .confirm({
        title: danger ? 'Delete shipment?' : 'Mark as delivered?',
        message: danger
          ? 'This cannot be undone. Related documents stay in archive.'
          : 'The consignee will be notified that the shipment is complete.',
        confirmLabel: danger ? 'Delete' : 'Mark delivered',
        cancelLabel: 'Cancel',
        danger,
        dismissible,
      })
      .subscribe((ok) => {
        this.confirmResult.set(ok ? 'Confirmed' : 'Cancelled');
      });
  }
}
