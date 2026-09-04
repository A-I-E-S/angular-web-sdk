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
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import { ButtonComponent } from '../button/button.component';
import {
  isModifiedClick,
  navigateNavItem,
  navItemHref,
} from '../navigation/navigate-nav-item';
import { ActionMenuTriggerDirective } from './action-menu-trigger.directive';
import type { AfricaniesMenuItem } from './menu-item';

/** Preferred panel placement — end-aligned under the trigger, then flip. */
const MENU_PANEL_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -4,
  },
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
  },
];

/**
 * Compact overflow menu for row and toolbar actions.
 *
 * Opens a CDK connected overlay (same pattern as select) so the panel is not
 * clipped by table `overflow`. Default trigger is a ghost ellipsis button;
 * project a custom control with {@link ActionMenuTriggerDirective}.
 *
 * Items with {@link AfricaniesMenuItem.routerLink} render as anchors so users
 * can right-click / modified-click to open in a new tab.
 *
 * @example
 * ```html
 * <!-- Default icon trigger (table row) -->
 * <africanies-action-menu [items]="rowActions(row)" />
 *
 * <!-- Custom trigger -->
 * <africanies-action-menu [items]="toolbarActions">
 *   <button type="button" africanies-button africaniesActionMenuTrigger variant="secondary" size="sm">
 *     Actions
 *   </button>
 * </africanies-action-menu>
 * ```
 * ```ts
 * rowActions(row: Shipment): AfricaniesMenuItem[] {
 *   return [
 *     {
 *       label: 'Open',
 *       icon: 'eye',
 *       routerLink: ['/shipments', row.id],
 *       onClick: () => this.open(row),
 *     },
 *     { label: 'Edit', icon: 'edit', onClick: () => this.edit(row) },
 *     {
 *       label: 'Delete',
 *       icon: 'trash',
 *       danger: true,
 *       dividerBefore: true,
 *       onClick: () => this.delete(row),
 *     },
 *   ];
 * }
 * ```
 */
@Component({
  selector: 'africanies-action-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AfricaniesIconComponent,
    ButtonComponent,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
  ],
  template: `
    <span
      class="inline-flex"
      cdkOverlayOrigin
      #triggerOrigin="cdkOverlayOrigin"
    >
      <!--
        Always project so Angular registers the trigger directive.
        Key/click bubble from the projected control — that child owns focus.
      -->
      <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
      <span
        class="inline-flex"
        [class.hidden]="!hasCustomTrigger()"
        (click)="onTriggerClick($event)"
        (keydown)="onTriggerKeydown($event)"
      >
        <ng-content select="[africaniesActionMenuTrigger]" />
      </span>

      @if (!hasCustomTrigger()) {
        <button
          africanies-button
          type="button"
          variant="ghost"
          size="sm"
          [disabled]="disabled()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-haspopup]="'menu'"
          [attr.aria-expanded]="open()"
          (click)="onTriggerClick($event)"
          (keydown)="onTriggerKeydown($event)"
        >
          <africanies-icon name="ellipsis-v" [size]="16" />
        </button>
      }
    </span>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="triggerOrigin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="panelPositions"
      [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()"
      (overlayOutsideClick)="onOutsideClick($event)"
      (detach)="onOverlayDetach()"
    >
      <div
        #panel
        class="min-w-44 rounded-md border border-border bg-white py-1 shadow-lg outline-none dark:border-white/15 dark:bg-ink-950"
        role="menu"
        tabindex="-1"
        [attr.aria-label]="ariaLabel()"
        (keydown)="onPanelKeydown($event)"
      >
        @for (item of items(); track $index; let i = $index) {
          @if (item.dividerBefore) {
            <div
              class="my-1 border-t border-border dark:border-white/10"
              role="separator"
            ></div>
          }
          @if (item.routerLink !== null && item.routerLink !== undefined) {
            <a
              role="menuitem"
              [id]="itemDomId(i)"
              [class]="itemClass(item, i)"
              [attr.href]="item.disabled ? null : hrefFor(item)"
              [attr.aria-disabled]="item.disabled ? true : null"
              (click)="onRoutedItemClick($event, item)"
              (mouseenter)="activeIndex.set(i)"
            >
              @if (item.icon; as icon) {
                <africanies-icon [name]="icon" [size]="16" class="shrink-0" />
              }
              <span class="min-w-0 flex-1 truncate text-left">{{
                item.label
              }}</span>
            </a>
          } @else {
            <button
              type="button"
              role="menuitem"
              [id]="itemDomId(i)"
              [class]="itemClass(item, i)"
              [disabled]="!!item.disabled"
              (click)="selectItem(item)"
              (mouseenter)="activeIndex.set(i)"
            >
              @if (item.icon; as icon) {
                <africanies-icon [name]="icon" [size]="16" class="shrink-0" />
              }
              <span class="min-w-0 flex-1 truncate text-left">{{
                item.label
              }}</span>
            </button>
          }
        }
      </div>
    </ng-template>
  `,
})
export class ActionMenuComponent {
  private readonly router = inject(Router);

  protected readonly panelPositions = MENU_PANEL_POSITIONS;

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly projectedTrigger = contentChild(ActionMenuTriggerDirective);

  /** Menu options. */
  readonly items = input.required<AfricaniesMenuItem[]>();

  /** Accessible name for the trigger / menu. */
  readonly ariaLabel = input('Actions');

  /** When true, the default trigger cannot open the menu. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(0);

  private readonly menuId = `africanies-menu-${++nextMenuId}`;

  protected readonly hasCustomTrigger = computed(
    () => this.projectedTrigger() != null,
  );

  protected itemDomId(index: number): string {
    return `${this.menuId}-item-${index}`;
  }

  protected itemClass(item: AfricaniesMenuItem, index: number): string {
    const active = this.activeIndex() === index;
    const base =
      'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-body-sm no-underline transition-colors ' +
      'disabled:cursor-not-allowed disabled:opacity-50 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink';
    if (item.danger) {
      return (
        `${base} text-danger ` +
        (active
          ? 'bg-danger-subtle dark:bg-danger/15'
          : 'hover:bg-danger-subtle dark:hover:bg-danger/15')
      );
    }
    return (
      `${base} text-ink dark:text-white ` +
      (active
        ? 'bg-background-welcome dark:bg-white/10'
        : 'hover:bg-background-welcome dark:hover:bg-white/10')
    );
  }

  protected hrefFor(item: AfricaniesMenuItem): string | null {
    return navItemHref(this.router, item);
  }

  protected onTriggerClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    this.toggle();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openMenu();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const enabled = this.enabledIndexes();
    if (!enabled.length) {
      return;
    }
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1, enabled);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1, enabled);
        break;
      case 'Home': {
        event.preventDefault();
        const first = enabled[0];
        if (first !== undefined) {
          this.activeIndex.set(first);
        }
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = enabled[enabled.length - 1];
        if (last !== undefined) {
          this.activeIndex.set(last);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = this.items()[this.activeIndex()];
        if (item && !item.disabled) {
          this.selectItem(item);
        }
        break;
      }
      default:
        break;
    }
  }

  protected onOutsideClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && this.panelRef()?.nativeElement.contains(target)) {
      return;
    }
    this.close();
  }

  protected onOverlayDetach(): void {
    this.open.set(false);
  }

  /**
   * Primary click on a routed item: in-app activate via {@link onClick} or
   * router. Modified clicks keep native link behaviour (new tab).
   */
  protected onRoutedItemClick(event: MouseEvent, item: AfricaniesMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (isModifiedClick(event)) {
      this.close();
      return;
    }
    event.preventDefault();
    this.activateItem(item);
  }

  protected selectItem(item: AfricaniesMenuItem): void {
    if (item.disabled) {
      return;
    }
    this.activateItem(item);
  }

  private activateItem(item: AfricaniesMenuItem): void {
    if (item.onClick) {
      item.onClick();
    } else if (item.routerLink != null) {
      void navigateNavItem(this.router, item, false);
    }
    this.close();
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openMenu();
    }
  }

  protected openMenu(): void {
    const enabled = this.enabledIndexes();
    this.activeIndex.set(enabled[0] ?? 0);
    this.open.set(true);
    queueMicrotask(() => this.panelRef()?.nativeElement.focus());
  }

  protected close(): void {
    this.open.set(false);
  }

  private enabledIndexes(): number[] {
    return this.items()
      .map((item, i) => (item.disabled ? -1 : i))
      .filter((i) => i >= 0);
  }

  private moveActive(delta: number, enabled: number[]): void {
    if (enabled.length === 0) {
      return;
    }
    const currentPos = enabled.indexOf(this.activeIndex());
    const start = currentPos < 0 ? 0 : currentPos;
    const next = enabled[(start + delta + enabled.length) % enabled.length];
    if (next !== undefined) {
      this.activeIndex.set(next);
    }
  }
}

let nextMenuId = 0;
