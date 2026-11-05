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
  forwardRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import { DatePickerComponent } from '../date-picker';
import {
  FORM_DISABLED_CLASS,
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';
import {
  buildDateRangePresets,
  type DateRangePreset,
} from './date-range.presets';

/** Inclusive calendar range. Dates are `YYYY-MM-DD` or `null`. */
export interface AfricaniesDateRangeValue {
  start: string | null;
  end: string | null;
}

let nextDateRangeId = 0;

const PANEL_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -4,
  },
];

const PANEL_CLASS =
  'flex w-full min-w-72 flex-col gap-3 rounded-control border border-border bg-white p-3 shadow-lg dark:border-white/15 dark:bg-ink-950';

/**
 * One field for a start and end date.
 *
 * The closed control shows the range. Opening it reveals two
 * {@link DatePickerComponent}s and shortcuts for the last 7 days, this month,
 * and this year. Values stay ISO dates (`YYYY-MM-DD`).
 *
 * @example
 * ```html
 * <africanies-date-range
 *   label="Period"
 *   [(start)]="start"
 *   [(end)]="end"
 * />
 * ```
 */
@Component({
  selector: 'africanies-date-range',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AfricaniesIconComponent,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    DatePickerComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangeComponent),
      multi: true,
    },
  ],
  host: {
    class: 'block min-w-0',
  },
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>
    <div cdkOverlayOrigin #triggerOrigin="cdkOverlayOrigin">
      <button
        type="button"
        [id]="controlId"
        [class]="shellClass()"
        [disabled]="disabled()"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-busy]="loading() ? true : null"
        (click)="toggleOpen()"
      >
        <span
          class="min-w-0 flex-1 truncate px-3 text-left text-body-sm"
          [class.text-neutral-500]="!display()"
        >
          {{ display() || placeholder() }}
        </span>
        <span class="inline-flex shrink-0 items-center pr-2.5">
          @if (loading()) {
            <africanies-icon
              name="spinner"
              [size]="16"
              class="animate-spin text-neutral-600 dark:text-neutral-400"
            />
          } @else {
            <africanies-icon
              name="calendar"
              [size]="16"
              class="text-neutral-600 dark:text-neutral-400"
            />
          }
        </span>
      </button>
    </div>
    @if (error(); as err) {
      <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
    } @else if (hint(); as hintText) {
      <p [id]="hintId" [class]="hintClass">{{ hintText }}</p>
    }

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="triggerOrigin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="panelPositions"
      [cdkConnectedOverlayWidth]="panelWidth()"
      [cdkConnectedOverlayMinWidth]="panelWidth()"
      [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="closePanel()"
      (overlayOutsideClick)="onOutsideClick($event)"
      (detach)="onOverlayDetach()"
    >
      <div
        [class]="panelClass"
        role="dialog"
        [attr.aria-label]="label() || placeholder()"
        (keydown.escape)="closePanel()"
      >
        <div class="flex flex-wrap gap-1.5" role="group" [attr.aria-label]="presetsLabel()">
          @for (preset of presets(); track preset.id) {
            <button
              type="button"
              class="cursor-pointer rounded-md border px-2 py-1 text-caption font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
              [class.border-ink]="isActivePreset(preset)"
              [class.bg-background-welcome]="isActivePreset(preset)"
              [class.dark:border-white]="isActivePreset(preset)"
              [class.dark:bg-white/10]="isActivePreset(preset)"
              [class.border-border]="!isActivePreset(preset)"
              [class.dark:border-white/15]="!isActivePreset(preset)"
              [attr.aria-pressed]="isActivePreset(preset)"
              [disabled]="disabled() || preset.disabled"
              (click)="applyPreset(preset)"
            >
              {{ preset.label }}
            </button>
          }
        </div>
        <africanies-date-picker
          [label]="startLabel()"
          [value]="start()"
          [min]="min()"
          [max]="startMax()"
          [disabled]="disabled()"
          (valueChange)="onStart($event)"
        />
        <africanies-date-picker
          [label]="endLabel()"
          [value]="end()"
          [min]="endMin()"
          [max]="max()"
          [disabled]="disabled()"
          (valueChange)="onEnd($event)"
        />
      </div>
    </ng-template>
  `,
})
export class DateRangeComponent implements ControlValueAccessor {
  protected readonly controlId = `africanies-date-range-${++nextDateRangeId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;
  protected readonly panelClass = PANEL_CLASS;
  protected readonly panelPositions = PANEL_POSITIONS;

  private readonly triggerOrigin = viewChild(CdkOverlayOrigin);

  /** Visible field label. Hidden when empty. */
  readonly label = input('');

  /** Copy shown in the closed field when either date is missing. */
  readonly placeholder = input('Select dates');

  /** Label for the start date inside the open panel. */
  readonly startLabel = input('Start');

  /** Label for the end date inside the open panel. */
  readonly endLabel = input('End');

  /** Accessible name for the shortcut row. */
  readonly presetsLabel = input('Quick ranges');

  /** Shortcut that ends today and starts six days earlier. */
  readonly last7DaysLabel = input('Last 7 days');

  /** Shortcut for the first through the last day of the current month. */
  readonly thisMonthLabel = input('This month');

  /** Shortcut for 1 January through 31 December of the current year. */
  readonly thisYearLabel = input('This year');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. */
  readonly error = input<string | null>(null);

  /** Optional lower bound (`YYYY-MM-DD`) for the start date. */
  readonly min = input<string | undefined>(undefined);

  /** Optional upper bound (`YYYY-MM-DD`) for the end date. */
  readonly max = input<string | undefined>(undefined);

  /** ISO start date (`[(start)]`). */
  readonly start = model<string | null>(null);

  /** ISO end date (`[(end)]`). */
  readonly end = model<string | null>(null);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  /** Shows a spinner in the closed field. */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly cvaDisabled = signal(false);
  protected readonly open = signal(false);
  protected readonly panelWidth = signal(288);

  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly display = computed(() =>
    formatRange(this.start(), this.end()),
  );

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.hint()) {
      return this.hintId;
    }
    return null;
  });

  /** End date cannot be chosen before the start date. */
  protected readonly endMin = computed(() => this.start() || this.min());

  /** Start date cannot be chosen after the end date. */
  protected readonly startMax = computed(() => this.end() || this.max());

  protected readonly presets = computed(() =>
    buildDateRangePresets(new Date(), {
      last7Days: this.last7DaysLabel(),
      thisMonth: this.thisMonthLabel(),
      thisYear: this.thisYearLabel(),
    }, {
      min: this.min(),
      max: this.max(),
    }),
  );

  protected readonly shellClass = computed(() => {
    let classes = `${FORM_FIELD_CLASS} text-left`;
    if (this.error()) {
      classes += ` ${FORM_FIELD_ERROR_CLASS}`;
    }
    if (this.disabled()) {
      classes += ` ${FORM_DISABLED_CLASS}`;
    } else {
      classes += ' cursor-pointer';
    }
    return classes;
  });

  private onChange: (value: AfricaniesDateRangeValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private closingFromApi = false;

  /** @param value - Both dates, or `null` to clear. */
  writeValue(value: AfricaniesDateRangeValue | null): void {
    this.start.set(value?.start ?? null);
    this.end.set(value?.end ?? null);
  }

  /** @param fn - User edit callback. */
  registerOnChange(fn: (value: AfricaniesDateRangeValue) => void): void {
    this.onChange = fn;
  }

  /** @param fn - Blur callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @param isDisabled - Blocks editing when true. */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  protected toggleOpen(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.closePanel();
      return;
    }
    this.openPanel();
  }

  protected closePanel(): void {
    if (!this.open()) {
      return;
    }
    this.closingFromApi = true;
    this.open.set(false);
    this.onTouched();
    queueMicrotask(() => {
      this.closingFromApi = false;
    });
  }

  protected onOutsideClick(event: MouseEvent): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement;
    const target = event.target;
    if (origin && target instanceof Node && origin.contains(target)) {
      return;
    }
    this.closePanel();
  }

  protected onOverlayDetach(): void {
    if (this.closingFromApi) {
      return;
    }
    if (this.open()) {
      this.open.set(false);
      this.onTouched();
    }
  }

  protected onStart(value: string | null): void {
    if (value === this.start()) {
      return;
    }
    this.start.set(value);
    this.emitChange();
  }

  protected onEnd(value: string | null): void {
    if (value === this.end()) {
      return;
    }
    this.end.set(value);
    this.emitChange();
  }

  protected isActivePreset(preset: DateRangePreset): boolean {
    return preset.start === this.start() && preset.end === this.end();
  }

  protected applyPreset(preset: DateRangePreset): void {
    if (this.disabled() || preset.disabled) {
      return;
    }
    const startChanged = preset.start !== this.start();
    const endChanged = preset.end !== this.end();
    if (startChanged) {
      this.start.set(preset.start);
    }
    if (endChanged) {
      this.end.set(preset.end);
    }
    if (startChanged || endChanged) {
      this.emitChange();
    }
    this.closePanel();
  }

  private openPanel(): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement;
    const triggerWidth = origin?.getBoundingClientRect().width ?? 0;
    this.panelWidth.set(Math.max(triggerWidth, 288));
    this.open.set(true);
  }

  private emitChange(): void {
    this.onChange({ start: this.start(), end: this.end() });
  }
}

/**
 * A full calendar month reads as that month. Any other span stays two dates.
 * @param start - Inclusive ISO start.
 * @param end - Inclusive ISO end.
 * @returns The closed-field label, or an empty string when a date is missing.
 */
function formatRange(start: string | null, end: string | null): string {
  if (start && end && isCalendarMonth(start, end)) {
    const year = Number(start.slice(0, 4));
    const month = Number(start.slice(5, 7));
    return new Date(year, month - 1, 1).toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }
  const startLabel = formatIsoDate(start);
  const endLabel = formatIsoDate(end);
  if (startLabel && endLabel) {
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }
  return startLabel || endLabel;
}

function isCalendarMonth(start: string, end: string): boolean {
  if (!/^\d{4}-\d{2}-01$/.test(start)) {
    return false;
  }
  const year = Number(start.slice(0, 4));
  const month = Number(start.slice(5, 7));
  const last = new Date(year, month, 0).getDate();
  return end === `${start.slice(0, 8)}${String(last).padStart(2, '0')}`;
}

function formatIsoDate(iso: string | null): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return '';
  }
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
