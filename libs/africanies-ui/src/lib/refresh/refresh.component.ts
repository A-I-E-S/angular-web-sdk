import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { ShippingModeService } from '@africanies/africanies-core';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import type { ShippingMode } from '@africanies/africanies-models';

/**
 * Compact list / panel reload control.
 *
 * Icon and label share `--refresh-color`: SFN green by default, STN orange when
 * {@link appType} (or the active {@link ShippingModeService} mode) is `stn`.
 */
@Component({
  selector: 'africanies-refresh',
  imports: [AfricaniesIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (show()) {
    <button
      type="button"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="label()"
      [attr.aria-busy]="loading() || null"
      (click)="requestRefresh()"
    >
      <africanies-icon
        name="refresh"
        [size]="16"
        [class.spinning]="loading()"
      />
      {{ label() }}
    </button>
  }`,
  styleUrl: './refresh.component.css',
  host: {
    class: 'inline-flex shrink-0',
    '[class.is-import]': "mode() === 'stn'",
  },
})
export class RefreshComponent {
  readonly show = input(true);
  readonly loading = input(false);
  readonly disabled = input(false);
  /** Override shipping mode for the accent colour; omit to use the service. */
  readonly appType = input<ShippingMode | undefined>(undefined);
  readonly label = input('Refresh');
  readonly refresh = output<void>();

  private readonly shipping = inject(ShippingModeService);

  protected readonly mode = computed(
    () => this.appType() ?? this.shipping.mode(),
  );

  requestRefresh(): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.refresh.emit();
  }
}
