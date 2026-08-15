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
  DestroyRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { Subject, timer } from 'rxjs';
import { debounce, switchMap } from 'rxjs/operators';

import {
  FORM_AFFIX_CLASS,
  FORM_CONTROL_INNER_CLASS,
  FORM_DISABLED_CLASS,
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';
import type {
  AddressPlace,
  AddressPrediction,
} from './address-input.types';
import { GooglePlacesService } from './google-places.service';

let nextAddressInputId = 0;

/** Preferred panel placement — flips upward when there is no room below. */
const ADDRESS_PANEL_POSITIONS: ConnectedPosition[] = [
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

/**
 * Google Places address field with suggestion dropdown.
 *
 * Requires {@link provideGooglePlaces} at bootstrap for live predictions.
 * Form value is a structured {@link AddressPlace} (or `null`). Selecting a
 * suggestion also emits {@link placeSelected}.
 *
 * @example
 * ```html
 * <aies-address-input
 *   label="Pickup address"
 *   [countries]="['ng', 'gh']"
 *   [(value)]="pickup"
 *   (placeSelected)="onPlace($event)"
 * >
 *   <aies-icon prefix name="map-marker" [size]="16" />
 * </aies-address-input>
 * ```
 */
@Component({
  selector: 'aies-address-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkOverlayOrigin, CdkConnectedOverlay],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressInputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'relative block',
  },
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>
    <div
      cdkOverlayOrigin
      #triggerOrigin="cdkOverlayOrigin"
      [class]="shellClass()"
    >
      <span [class]="affixClass" data-slot="prefix">
        <ng-content select="[prefix]" />
      </span>
      <input
        [id]="controlId"
        type="text"
        role="combobox"
        autocomplete="off"
        [class]="innerClass"
        [value]="query()"
        [disabled]="disabled()"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId"
        [attr.aria-autocomplete]="'list'"
        [attr.aria-activedescendant]="activeOptionId()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
        (blur)="onBlur()"
      />
      <span [class]="affixClass" data-slot="suffix">
        <ng-content select="[suffix]" />
      </span>
    </div>

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
        [id]="listboxId"
        class="w-full rounded-md border border-border bg-white shadow-lg dark:border-white/15 dark:bg-ink-950 max-h-64 overflow-auto"
        role="listbox"
        tabindex="-1"
      >
        @if (loading()) {
          <div
            class="px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400"
          >
            Searching…
          </div>
        } @else if (predictions().length === 0) {
          <div
            class="px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400"
          >
            No matches
          </div>
        } @else {
          @for (prediction of predictions(); track prediction.placeId; let i = $index) {
            <button
              type="button"
              [id]="optionId(i)"
              role="option"
              class="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-body text-ink outline-none cursor-pointer hover:bg-background-welcome focus-visible:bg-background-welcome dark:text-white dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
              [class.bg-background-welcome]="activeIndex() === i"
              [class.dark:bg-white/5]="activeIndex() === i"
              [attr.aria-selected]="activeIndex() === i"
              (mousedown)="$event.preventDefault()"
              (click)="selectPrediction(prediction)"
              (mouseenter)="activeIndex.set(i)"
            >
              <span class="min-w-0 truncate font-medium">
                {{ prediction.mainText || prediction.description }}
              </span>
              @if (prediction.secondaryText; as secondary) {
                <span
                  class="min-w-0 truncate text-caption text-neutral-600 dark:text-neutral-400"
                >
                  {{ secondary }}
                </span>
              }
            </button>
          }
        }
      </div>
    </ng-template>

    @if (error(); as err) {
      <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
    } @else if (hint(); as h) {
      <p [id]="hintId" [class]="hintClass">{{ h }}</p>
    }
  `,
})
export class AddressInputComponent implements ControlValueAccessor {
  private readonly places = inject(GooglePlacesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controlId = `aies-address-input-${++nextAddressInputId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly listboxId = `${this.controlId}-listbox`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly innerClass = FORM_CONTROL_INNER_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;
  protected readonly panelPositions = ADDRESS_PANEL_POSITIONS;
  protected readonly minPanelWidth = 224;

  private readonly triggerOrigin = viewChild(CdkOverlayOrigin);

  private readonly querySubject = new Subject<string>();

  /**
   * Visible field label.
   */
  readonly label = input('');

  /**
   * Helper copy under the field. Hidden while {@link error} is set.
   */
  readonly hint = input<string | undefined>(undefined);

  /**
   * Field-level validation message.
   */
  readonly error = input<string | null>(null);

  /**
   * Native placeholder when the query is empty.
   */
  readonly placeholder = input('');

  /**
   * ISO-3166-1 alpha-2 country codes to restrict predictions (e.g. `['ng']`).
   */
  readonly countries = input<string[] | undefined>(undefined);

  /**
   * Debounce for prediction requests (ms).
   */
  readonly debounceMs = input(300, { transform: numberAttribute });

  /**
   * Selected place. Supports `[(value)]` and Reactive Forms via CVA.
   */
  readonly value = model<AddressPlace | null>(null);

  /**
   * Emits when the user picks a suggestion (after place details resolve).
   */
  readonly placeSelected = output<AddressPlace>();

  /**
   * Optional host disable (in addition to CVA `setDisabledState`).
   */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly loading = signal(false);
  protected readonly predictions = signal<AddressPrediction[]>([]);
  protected readonly activeIndex = signal(-1);
  protected readonly panelWidth = signal(this.minPanelWidth);

  protected readonly shellClass = computed(() => {
    let classes = FORM_FIELD_CLASS;
    if (this.error()) {
      classes += ` ${FORM_FIELD_ERROR_CLASS}`;
    }
    if (this.disabled()) {
      classes += ` ${FORM_DISABLED_CLASS}`;
    }
    return classes;
  });

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.hint()) {
      return this.hintId;
    }
    return null;
  });

  protected readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    if (index < 0 || !this.open()) {
      return null;
    }
    return this.optionId(index);
  });

  private onChange: (value: AddressPlace | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    this.querySubject
      .pipe(
        debounce(() => timer(Math.max(0, Number(this.debounceMs()) || 0))),
        switchMap(async (text) => {
          const trimmed = text.trim();
          if (!trimmed) {
            this.predictions.set([]);
            this.loading.set(false);
            this.open.set(false);
            return [] as AddressPrediction[];
          }
          this.loading.set(true);
          this.open.set(true);
          try {
            return await this.places.getPredictions(trimmed, this.countries());
          } finally {
            this.loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.predictions.set(results);
        this.activeIndex.set(results.length ? 0 : -1);
        if (this.query().trim().length > 0) {
          this.open.set(true);
        }
      });
  }

  /**
   * @param value - Form model value.
   */
  writeValue(value: AddressPlace | null): void {
    this.value.set(value);
    this.query.set(value?.formattedAddress ?? '');
  }

  /**
   * @param fn - Called when the selected place changes.
   */
  registerOnChange(fn: (value: AddressPlace | null) => void): void {
    this.onChange = fn;
  }

  /**
   * @param fn - Called on blur.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * @param isDisabled - When true, blocks editing.
   */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected optionId(index: number): string {
    return `${this.controlId}-option-${index}`;
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.query.set(next);

    if (this.value() !== null) {
      this.value.set(null);
      this.onChange(null);
    }

    this.syncPanelWidth();
    this.querySubject.next(next);
  }

  protected onFocus(): void {
    this.syncPanelWidth();
    if (this.query().trim() && this.predictions().length) {
      this.open.set(true);
    }
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      if (this.predictions().length) {
        this.open.set(true);
        event.preventDefault();
      }
      return;
    }

    if (!this.open()) {
      if (event.key === 'Escape') {
        (event.target as HTMLInputElement).blur();
      }
      return;
    }

    const count = this.predictions().length;
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!count) {
          return;
        }
        this.activeIndex.set((this.activeIndex() + 1) % count);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!count) {
          return;
        }
        this.activeIndex.set((this.activeIndex() - 1 + count) % count);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const index = this.activeIndex();
        const prediction = this.predictions()[index];
        if (prediction) {
          void this.selectPrediction(prediction);
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.closePanel();
        break;
      }
      default:
        break;
    }
  }

  protected async selectPrediction(prediction: AddressPrediction): Promise<void> {
    this.loading.set(true);
    try {
      const place = await this.places.getPlaceDetails(prediction.placeId);
      if (!place) {
        return;
      }
      this.query.set(place.formattedAddress);
      this.value.set(place);
      this.onChange(place);
      this.placeSelected.emit(place);
      this.closePanel();
      this.predictions.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected closePanel(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  protected onOutsideClick(event: MouseEvent): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement as
      | HTMLElement
      | undefined;
    if (origin?.contains(event.target as Node)) {
      return;
    }
    this.closePanel();
  }

  protected onOverlayDetach(): void {
    this.open.set(false);
  }

  private syncPanelWidth(): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement as
      | HTMLElement
      | undefined;
    const width = origin?.getBoundingClientRect().width ?? this.minPanelWidth;
    this.panelWidth.set(Math.max(width, this.minPanelWidth));
  }
}
