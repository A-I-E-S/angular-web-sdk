import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  defer,
  from,
  type Observable,
  of,
  type Subscription,
  take,
  throwError,
} from 'rxjs';

import { AfricaniesIconComponent, type IconName } from '@africanies/africanies-icons';

import { ButtonComponent } from '../button/button.component';
import { AfricaniesOverlayRef } from './africanies-overlay-ref';
import type { ConfirmOptions, ConfirmWork } from './confirm-options';
import { OVERLAY_DATA } from './overlay-data.token';

/**
 * Built-in confirm dialog hosted by {@link ConfirmService} / {@link ModalService}.
 *
 * WHY a dedicated component: most apps need the same title/message/two-button
 * pattern; shipping it here avoids every feature reinventing confirm UI while
 * still allowing custom modals via {@link ModalService.open}.
 *
 * When {@link ConfirmOptions.onConfirm} is set, Confirm stays open and the
 * primary button shows {@link ButtonComponent} loading until the work
 * settles. Errors leave the dialog open.
 */
@Component({
  selector: 'africanies-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, ButtonComponent],
  host: {
    class: 'block w-full min-w-0',
  },
  template: `
    <div
      class="flex flex-col gap-5"
      role="alertdialog"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="messageId"
      [attr.aria-busy]="loading() ? true : null"
    >
      <div class="flex flex-col gap-3">
        <div [class]="iconWellClass()" aria-hidden="true">
          <africanies-icon [name]="iconName()" [size]="32" />
        </div>
        <div class="flex min-w-0 flex-col gap-1.5">
          <h2
            [id]="titleId"
            class="m-0 text-heading-3 font-semibold text-ink dark:text-white"
          >
            {{ title() }}
          </h2>
          <p
            [id]="messageId"
            class="m-0 text-body text-neutral-600 dark:text-neutral-400"
          >
            {{ options.message }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap justify-end gap-2">
        @if (emphasizeCancel()) {
          <button
            africanies-button
            type="button"
            variant="ghost"
            [disabled]="loading()"
            (click)="confirm()"
          >
            {{ confirmLabel() }}
          </button>
          <button
            africanies-button
            type="button"
            variant="primary"
            [disabled]="loading()"
            (click)="cancel()"
          >
            {{ cancelLabel() }}
          </button>
        } @else {
          <button
            africanies-button
            type="button"
            variant="ghost"
            [disabled]="loading()"
            (click)="cancel()"
          >
            {{ cancelLabel() }}
          </button>
          <button
            africanies-button
            type="button"
            [variant]="options.danger ? 'danger' : 'primary'"
            [loading]="loading()"
            (click)="confirm()"
          >
            {{ confirmLabel() }}
          </button>
        }
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  /** Stable ids so aria-labelledby / aria-describedby stay unique per instance. */
  protected readonly titleId = `africanies-confirm-title-${cryptoRandom()}`;
  protected readonly messageId = `africanies-confirm-message-${cryptoRandom()}`;

  /** Options injected by {@link ConfirmService}. */
  protected readonly options = inject(OVERLAY_DATA) as ConfirmOptions;

  private readonly ref = inject(AfricaniesOverlayRef<boolean>);
  private readonly destroyRef = inject(DestroyRef);
  private workSub: Subscription | null = null;

  /** True while {@link ConfirmOptions.onConfirm} is in flight. */
  protected readonly loading = signal(false);

  /** Resolved heading with a sensible default when callers omit `title`. */
  protected readonly title = computed(() => this.options.title ?? 'Confirm');

  /** Resolved confirm CTA label. */
  protected readonly confirmLabel = computed(
    () => this.options.confirmLabel ?? 'Confirm',
  );

  /** Resolved cancel CTA label. */
  protected readonly cancelLabel = computed(
    () => this.options.cancelLabel ?? 'Cancel',
  );

  /** When true, cancel is primary and listed after confirm (safe choice last). */
  protected readonly emphasizeCancel = computed(
    () => this.options.emphasizeCancel === true,
  );

  /** Warning for destructive confirms; question mark otherwise. */
  protected readonly iconName = computed(
    (): IconName => (this.options.danger ? 'warning' : 'question'),
  );

  /**
   * Tinted well so the icon reads as a status, not a thin glyph beside the
   * heading. Danger uses the red subtle token; default uses export green.
   */
  protected readonly iconWellClass = computed(() => {
    const well =
      'inline-flex size-14 shrink-0 items-center justify-center rounded-2xl';
    return this.options.danger
      ? `${well} bg-danger-subtle text-danger dark:bg-danger/20 dark:text-danger`
      : `${well} bg-export-subtle text-export dark:bg-export/20 dark:text-export-light`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.workSub?.unsubscribe());
  }

  /**
   * Affirms the action. When `onConfirm` is set, waits for it before closing
   * with `true`; failures keep the dialog open.
   */
  protected confirm(): void {
    if (this.loading()) {
      return;
    }

    const action = this.options.onConfirm;
    if (!action) {
      this.ref.close(true);
      return;
    }

    this.loading.set(true);
    // Let the spinner paint before starting work so a fast request still
    // shows loading, and avoid takeUntilDestroyed in this click handler
    // (it can complete EMPTY and close without subscribing).
    setTimeout(() => this.runConfirmWork(action), 0);
  }

  /** Dismisses without affirming — emits `false`. */
  protected cancel(): void {
    if (this.loading()) {
      return;
    }
    this.ref.close(false);
  }

  /**
   * Subscribe to confirm work after loading is visible.
   *
   * @param action - Callback from {@link ConfirmOptions.onConfirm}.
   */
  private runConfirmWork(action: ConfirmWork): void {
    if (this.destroyRef.destroyed || !this.loading()) {
      return;
    }

    this.workSub?.unsubscribe();
    this.workSub = defer(() => confirmWork(action))
      .pipe(take(1))
      .subscribe({
        next: () => this.ref.close(true),
        error: () => this.loading.set(false),
      });
  }
}

/**
 * Normalize {@link ConfirmWork} into a single-emission Observable.
 *
 * Uses `subscribe` duck-typing so a second RxJS copy still starts the HTTP
 * call (`isObservable` is false across duplicate `rxjs` instances).
 *
 * @param action - Confirm callback from dialog options.
 * @returns Observable that completes on success or errors on failure.
 */
function confirmWork(action: ConfirmWork): Observable<unknown> {
  let result: ReturnType<ConfirmWork>;
  try {
    result = action();
  } catch (err: unknown) {
    return throwError(() =>
      err instanceof Error ? err : new Error('Confirm action failed.'),
    );
  }

  if (result == null) {
    return of(undefined);
  }
  if (typeof (result as { subscribe?: unknown }).subscribe === 'function') {
    return result as Observable<unknown>;
  }
  return from(result);
}

/**
 * Tiny unique suffix without pulling in a uuid dependency.
 *
 * @returns Short alphanumeric id fragment.
 */
function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 10);
}
