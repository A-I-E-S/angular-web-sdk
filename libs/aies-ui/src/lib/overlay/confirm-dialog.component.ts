import { AiesIconComponent } from '@aies/aies-icons';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { AiesOverlayRef } from './aies-overlay-ref';
import type { ConfirmOptions } from './confirm-options';
import { OVERLAY_DATA } from './overlay-data.token';

/**
 * Built-in confirm dialog hosted by {@link ConfirmService} / {@link ModalService}.
 *
 * WHY a dedicated component: most apps need the same title/message/two-button
 * pattern; shipping it here avoids every feature reinventing confirm UI while
 * still allowing custom modals via {@link ModalService.open}.
 */
@Component({
  selector: 'aies-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, ButtonComponent],
  template: `
    <div class="flex flex-col gap-4" role="alertdialog" [attr.aria-labelledby]="titleId" [attr.aria-describedby]="messageId">
      <div class="flex items-start gap-3">
        @if (options.danger) {
          <aies-icon name="warning" [size]="24" class="text-danger shrink-0 mt-0.5" />
        }
        <div class="flex flex-col gap-2 min-w-0">
          <h2 [id]="titleId" class="text-heading-3 font-semibold text-ink dark:text-white m-0">
            {{ title() }}
          </h2>
          <p [id]="messageId" class="text-body text-neutral-600 dark:text-neutral-400 m-0">
            {{ options.message }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2 flex-wrap">
        <button
          aies-button
          type="button"
          variant="ghost"
          (click)="cancel()"
        >
          {{ cancelLabel() }}
        </button>
        <button
          aies-button
          type="button"
          [variant]="options.danger ? 'danger' : 'primary'"
          (click)="confirm()"
        >
          {{ confirmLabel() }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  /** Stable ids so aria-labelledby / aria-describedby stay unique per instance. */
  protected readonly titleId = `aies-confirm-title-${cryptoRandom()}`;
  protected readonly messageId = `aies-confirm-message-${cryptoRandom()}`;

  /** Options injected by {@link ConfirmService}. */
  protected readonly options = inject(OVERLAY_DATA) as ConfirmOptions;

  private readonly ref = inject(AiesOverlayRef<boolean>);

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

  /** Affirms the action — emits `true` on the confirm Observable. */
  protected confirm(): void {
    this.ref.close(true);
  }

  /** Dismisses without affirming — emits `false`. */
  protected cancel(): void {
    this.ref.close(false);
  }
}

/** Tiny unique suffix without pulling in a uuid dependency. */
function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 10);
}
