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
import { InfoPopoverTriggerDirective } from './info-popover-trigger.directive';

/** Preferred placement for {@link InfoPopoverComponent}. */
export type InfoPopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

let nextInfoPopoverId = 0;

const PLACEMENT_POSITIONS: Record<InfoPopoverPlacement, ConnectedPosition[]> = {
  top: [
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -10,
    },
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: 10,
    },
  ],
  bottom: [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: 10,
    },
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -10,
    },
  ],
  left: [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -10,
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: 10,
    },
  ],
  right: [
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: 10,
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -10,
    },
  ],
};

/**
 * Hover / focus / click info panel with a white card, optional title, and
 * fully projected body content (any child component or markup).
 *
 * Use this when the tip needs structured content (lists, actions, custom UI).
 * Prefer {@link TooltipComponent} for short plain-text help.
 *
 * @example
 * ```html
 * <africanies-info-popover title="Zones Available" placement="top">
 *   <ul africaniesInfoPopoverContent class="space-y-1 text-body-sm text-ink">
 *     @for (zone of zones; track zone) {
 *       <li>{{ zone }}</li>
 *     }
 *   </ul>
 * </africanies-info-popover>
 *
 * <!-- Custom trigger + rich body -->
 * <africanies-info-popover title="Details">
 *   <button type="button" africanies-button africaniesInfoPopoverTrigger variant="ghost" size="sm">
 *     More
 *   </button>
 *   <app-zone-list africaniesInfoPopoverContent [zones]="zones" />
 * </africanies-info-popover>
 * ```
 */
@Component({
  selector: 'africanies-info-popover',
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
    <span
      class="inline-flex"
      cdkOverlayOrigin
      #triggerOrigin="cdkOverlayOrigin"
      (pointerenter)="onPointerEnter()"
      (pointerleave)="onPointerLeave()"
      (focusin)="onFocusIn()"
      (focusout)="onFocusOut($event)"
    >
      <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
      <span
        class="inline-flex"
        [class.hidden]="!hasCustomTrigger()"
        (click)="onTriggerClick($event)"
        (keydown)="onKeydown($event)"
      >
        <ng-content select="[africaniesInfoPopoverTrigger]" />
      </span>

      @if (!hasCustomTrigger()) {
        <button
          africanies-button
          type="button"
          variant="ghost-primary"
          size="sm"
          class="!min-h-0 !px-1.5 !py-1"
          [disabled]="disabled()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-controls]="open() ? panelId : null"
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
        [id]="panelId"
        role="dialog"
        [attr.aria-label]="title() || ariaLabel()"
        [class]="panelArrowClass()"
        (pointerenter)="onPanelEnter()"
        (pointerleave)="onPointerLeave()"
      >
        @if (title()) {
          <p class="text-body-sm font-semibold text-ink dark:text-white">
            {{ title() }}
          </p>
          <div
            class="my-2 border-t border-border dark:border-white/15"
            aria-hidden="true"
          ></div>
        }

        <div class="africanies-overlay-scroll max-h-60 overflow-y-auto overscroll-contain">
          <ng-content select="[africaniesInfoPopoverContent]" />
        </div>
      </div>
    </ng-template>
  `,
})
export class InfoPopoverComponent {
  protected readonly panelId = `africanies-info-popover-${++nextInfoPopoverId}`;

  private readonly customTrigger = contentChild(InfoPopoverTriggerDirective);

  /** Optional heading above the projected body (with divider). */
  readonly title = input<string | undefined>(undefined);

  /** Preferred side; flips when there is no room. */
  readonly placement = input<InfoPopoverPlacement>('top');

  /** Icon for the default trigger (ignored when a custom trigger is projected). */
  readonly icon = input<IconName>('info-circle');

  /** Accessible name for the default icon button. */
  readonly ariaLabel = input('More information');

  /** When true, the popover never opens. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  /** Click/tap keeps the panel open until dismiss (backdrop / Escape / outside). */
  protected readonly sticky = signal(false);

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly hasCustomTrigger = computed(
    () => !!this.customTrigger(),
  );

  protected readonly panelPositions = computed(
    () => PLACEMENT_POSITIONS[this.placement()] ?? PLACEMENT_POSITIONS.top,
  );

  /**
   * Full panel class list (static card + CSS triangle toward the trigger).
   * Bound via `[class]` so arrow position tracks preferred placement.
   */
  protected readonly panelArrowClass = computed(() => {
    const card =
      'relative z-10 w-max max-w-xs rounded-lg border border-border bg-white px-4 py-3 text-ink shadow-lg dark:border-white/15 dark:bg-ink-950 dark:text-white';
    const base =
      "before:pointer-events-none before:absolute before:z-0 before:h-2.5 before:w-2.5 before:rotate-45 before:border before:border-border before:bg-white before:content-[''] dark:before:border-white/15 dark:before:bg-ink-950";
    switch (this.placement()) {
      case 'bottom':
        return `${card} ${base} before:left-1/2 before:top-0 before:-translate-x-1/2 before:-translate-y-1/2 before:border-b-0 before:border-r-0`;
      case 'left':
        return `${card} ${base} before:right-0 before:top-1/2 before:translate-x-1/2 before:-translate-y-1/2 before:border-b-0 before:border-l-0`;
      case 'right':
        return `${card} ${base} before:left-0 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:border-r-0 before:border-t-0`;
      case 'top':
      default:
        return `${card} ${base} before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:translate-y-1/2 before:border-l-0 before:border-t-0`;
    }
  });

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
