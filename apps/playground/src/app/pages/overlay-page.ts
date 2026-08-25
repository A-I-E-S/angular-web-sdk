import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ButtonComponent,
  ConfirmService,
  DrawerService,
  ModalService,
} from '@africanies/africanies-ui';

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
 * Requires provideAfricaniesUiOverlays() (already in playground app.config).
 */
@Component({
  selector: 'app-overlay-page',
  standalone: true,
  imports: [
    ButtonComponent,
    PageHeaderComponent,
    DemoSectionComponent,
    RouterLink,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header eyebrow="Components" title="Overlays">
        <p
          description
          class="m-0 text-body text-neutral-600 dark:text-neutral-400"
        >
          Service-driven dialogs for focused tasks: modal (forms), drawer
          (filters/side panels), and confirm (yes/no). Built on
          <a
            routerLink="/lecture"
            fragment="CDK"
            class="pg-glossary-link"
            >CDK</a
          >
          Overlay. Closed only by their actions unless you pass dismissible: true
          for backdrop / Escape.
        </p>
      </app-page-header>

      <app-demo-section
        title="Modal"
        hint="Centered dialog for create/edit flows. Locked by default so users finish or cancel explicitly."
        badge="ModalService"
        [code]="modalCode"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button africanies-button type="button" variant="primary" (click)="openModal(false)">
            Open (locked)
          </button>
          <button africanies-button type="button" variant="secondary" (click)="openModal(true)">
            Open (dismissible)
          </button>
          <button africanies-button type="button" variant="ghost" (click)="openWideModal()">
            Open (size: lg)
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
        hint="Slide-over panel for filters, details, or secondary forms. Same dismissible rules as modal."
        badge="DrawerService"
        [code]="drawerCode"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button africanies-button type="button" variant="secondary" (click)="openDrawer(false)">
            Open (locked)
          </button>
          <button africanies-button type="button" (click)="openDrawer(true)">
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
        hint="Yes/no prompt before destructive or irreversible actions. Prefer this over a custom modal for simple decisions."
        badge="ConfirmService"
        [code]="confirmCode"
      >
        <div class="flex flex-wrap gap-3">
          <button africanies-button type="button" (click)="openConfirm(false)">
            Neutral confirm
          </button>
          <button africanies-button type="button" variant="danger" (click)="openConfirm(true)">
            Destructive confirm
          </button>
          <button
            africanies-button
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

  protected openWideModal(): void {
    this.modal
      .open<
        { shipmentRef: string },
        { saved: boolean; note: string }
      >(DemoModalPanel, {
        data: { shipmentRef: 'SFN-1042' },
        size: 'lg',
        dismissible: true,
      })
      .afterClosed()
      .subscribe((result) => {
        this.modalResult.set(
          result?.saved
            ? `Saved (lg) — “${result.note}”`
            : 'Dismissed wide modal',
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
