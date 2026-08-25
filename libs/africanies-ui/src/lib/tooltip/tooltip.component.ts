import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  signal,
} from '@angular/core';

import { AfricaniesIconComponent, type IconName } from '@africanies/africanies-icons';

import { ButtonComponent } from '../button/button.component';
import { TooltipTriggerDirective } from './tooltip-trigger.directive';

/** Preferred placement for {@link TooltipComponent}. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

let nextTooltipId = 0;

const PLACEMENT_POSITIONS: Record<TooltipPlacement, ConnectedPosition[]> = {
  top: [
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -8,
    },
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: 8,
    },
  ],
  bottom: [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: 8,
    },
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -8,
    },
  ],
  left: [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -8,
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: 8,
    },
  ],
  right: [
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: 8,
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -8,
    },
  ],
};

/**
 * Contextual help tip — default info icon or a custom projected trigger.
 *
 * Opens on hover, keyboard focus, and click/tap so it works on desktop and
 * mobile. Same CDK connected-overlay pattern as select / action-menu (not
 * clipped by parent `overflow`).
 *
 * @example
 * ```html
 * <!-- Default info icon -->
 * <africanies-tooltip text="Paid means the invoice is settled." />
 *
 * <!-- Custom target -->
 * <africanies-tooltip text="Required for insured shipments." placement="bottom">
 *   <button type="button" africanies-button africaniesTooltipTrigger variant="ghost" size="sm">
 *     Why is this required?
 *   </button>
 * </africanies-tooltip>
 * ```
 */
@Component({
  selector: 'africanies-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AfricaniesIconComponent,
    ButtonComponent,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
  ],
  host: {
    class: 'inline-flex max-w-full align-middle',
  },
  template: `
    <!-- Hover is tracked on the origin; focus/click live on the trigger control. -->
     
    <span
      class="inline-flex"
      cdkOverlayOrigin
      #triggerOrigin="cdkOverlayOrigin"
      (pointerenter)="onPointerEnter()"
      (pointerleave)="onPointerLeave()"
      (focusin)="onFocusIn()"
      (focusout)="onFocusOut($event)"
    >
      <!--
        Custom trigger owns keyboard focus; click bubbles for sticky open.
      -->
      <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
      <span
        class="inline-flex"
        [class.hidden]="!hasCustomTrigger()"
        (click)="onTriggerClick($event)"
        (keydown)="onKeydown($event)"
      >
        <ng-content select="[africaniesTooltipTrigger]" />
      </span>

      @if (!hasCustomTrigger()) {
        <button
          africanies-button
          type="button"
          variant="ghost"
          size="sm"
          class="!min-h-0 !px-1.5 !py-1"
          [disabled]="disabled()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-describedby]="open() ? tooltipId : null"
          [attr.aria-expanded]="open()"
          (click)="onTriggerClick($event)"
          (keydown)="onKeydown($event)"
        >
          <africanies-icon [name]="icon()" [size]="16" />
        </button>
      }
    </span>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="triggerOrigin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="panelPositions()"
      [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayHasBackdrop]="sticky()"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (overlayOutsideClick)="onOutsideClick()"
      (detach)="onOverlayDetach()"
    >
      <div
        [id]="tooltipId"
        role="tooltip"
        class="max-w-xs rounded-md border border-border bg-ink px-3 py-2 text-body-sm text-white shadow-lg dark:border-white/15 dark:bg-ink-950"
        (pointerenter)="onPanelEnter()"
        (pointerleave)="onPointerLeave()"
      >
        {{ text() }}
      </div>
    </ng-template>
  `,
})
export class TooltipComponent {
  protected readonly tooltipId = `africanies-tooltip-${++nextTooltipId}`;

  private readonly customTrigger = contentChild(TooltipTriggerDirective);

  /** Tooltip body copy. */
  readonly text = input.required<string>();

  /** Preferred side; flips when there is no room. */
  readonly placement = input<TooltipPlacement>('top');

  /** Icon for the default trigger (ignored when a custom trigger is projected). */
  readonly icon = input<IconName>('info-circle');

  /** Accessible name for the default icon button. */
  readonly ariaLabel = input('More information');

  /** When true, the tip never opens. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  /** Click/tap keeps the tip open until dismiss (backdrop / Escape / outside). */
  protected readonly sticky = signal(false);

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly hasCustomTrigger = computed(
    () => !!this.customTrigger(),
  );

  protected readonly panelPositions = computed(
    () => PLACEMENT_POSITIONS[this.placement()] ?? PLACEMENT_POSITIONS.top,
  );

  protected onPointerEnter(): void {
    if (this.disabled()) {
      return;
    }
    this.clearCloseTimer();
    this.open.set(true);
  }

  protected onPointerLeave(): void {
    if (this.sticky()) {
      return;
    }
    this.scheduleClose();
  }

  protected onPanelEnter(): void {
    this.clearCloseTimer();
  }

  protected onFocusIn(): void {
    if (this.disabled()) {
      return;
    }
    this.clearCloseTimer();
    this.open.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (this.sticky()) {
      return;
    }
    const next = event.relatedTarget as Node | null;
    const host = event.currentTarget as Node | null;
    if (host && next && host.contains(next)) {
      return;
    }
    this.scheduleClose();
  }

  protected onTriggerClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    event.stopPropagation();
    this.clearCloseTimer();
    if (this.open() && this.sticky()) {
      this.close();
      return;
    }
    this.sticky.set(true);
    this.open.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close();
    }
  }

  protected onOutsideClick(): void {
    if (this.sticky()) {
      this.close();
    }
  }

  protected onOverlayDetach(): void {
    this.open.set(false);
    this.sticky.set(false);
  }

  protected close(): void {
    this.clearCloseTimer();
    this.open.set(false);
    this.sticky.set(false);
  }

  private scheduleClose(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      if (!this.sticky()) {
        this.open.set(false);
      }
    }, 120);
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
