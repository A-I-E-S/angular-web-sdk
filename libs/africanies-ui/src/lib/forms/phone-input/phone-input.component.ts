import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { countryFlagUrl } from '@africanies/africanies-core';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import {
  FORM_DISABLED_CLASS,
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';
import { PHONE_MAX_NATIONAL_DIGITS } from './phone-codes';
import type { PhoneCountryOption, PhoneNumberValue } from './phone-input.types';
import {
  buildPhoneNumberValue,
  dialCodeForIso2,
  filterPhoneCountries,
  normalizePhoneIso2,
  parsePhoneControlValue,
  phoneCountryOptions,
  phoneDigitsOnly,
  phoneToE164,
  removeDialCode,
} from './phone-input.utils';

let nextPhoneInputId = 0;

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

/**
 * International phone field — flag + dial code + national number.
 *
 * Visual / behavioral cousin of classic `africanies-phone-field`
 * (`ngx-intl-tel-input`), rebuilt for Angular 22 + AFRICANIES form chrome
 * (no ngx peer-dep).
 *
 * **Value contract**
 * - `[(value)]` / CVA → **E.164 string** (e.g. `+2348012345678`) so admin
 *   mappers stay `phone: string`.
 * - `phoneValue` model mirrors the structured classic object when you need
 *   `countryCode` / `dialCode` in the parent.
 *
 * @example
 * ```html
 * <africanies-phone-input
 *   label="Phone"
 *   [countryIso2]="countryIso"
 *   [lockCountry]="true"
 *   [error]="phoneError()"
 *   [(value)]="phone"
 * />
 * ```
 */
@Component({
  selector: 'africanies-phone-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, CdkOverlayOrigin, CdkConnectedOverlay],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'relative block',
  },
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>

    <div [class]="shellClass()">
      <button
        cdkOverlayOrigin
        #dialOrigin="cdkOverlayOrigin"
        type="button"
        class="inline-flex h-full shrink-0 items-center gap-1.5 border-0 border-r border-control bg-transparent px-2.5 text-body-sm text-ink dark:border-white/25 dark:text-white disabled:cursor-not-allowed"
        [class.pointer-events-none]="lockCountry()"
        [attr.aria-expanded]="countryOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-label]="'Country dial code'"
        [disabled]="disabled() || lockCountry()"
        (click)="toggleCountryPicker($event)"
      >
        @if (flagUrl(); as src) {
          <img
            [src]="src"
            alt=""
            class="h-4 w-5 rounded-sm object-cover"
            loading="lazy"
            aria-hidden="true"
          />
        }
        <span class="tabular-nums">{{ dialCode() }}</span>
        @if (!lockCountry()) {
          <africanies-icon name="chevron-down" [size]="14" class="shrink-0 opacity-70" />
        }
      </button>

      <input
        [id]="controlId"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        class="min-h-0 h-full min-w-0 flex-1 border-0 bg-transparent px-3 py-0 text-body text-ink outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed dark:text-white"
        [value]="nationalDisplay()"
        [disabled]="disabled()"
        [attr.placeholder]="placeholder() || null"
        [attr.maxlength]="maxLengthAttr()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
        (input)="onNationalInput($event)"
        (blur)="onBlur()"
      />
    </div>

    @if (error(); as err) {
      <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
    } @else if (hint(); as h) {
      <p [id]="hintId" [class]="hintClass">{{ h }}</p>
    }

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="dialOrigin"
      [cdkConnectedOverlayOpen]="countryOpen()"
      [cdkConnectedOverlayPositions]="panelPositions"
      [cdkConnectedOverlayWidth]="320"
      [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="closeCountryPicker()"
      (overlayOutsideClick)="closeCountryPicker()"
    >
      <div
        class="flex w-full flex-col overflow-hidden rounded-md border border-border bg-white shadow-lg dark:border-white/15 dark:bg-ink-950"
        role="listbox"
        [attr.aria-label]="'Select country'"
      >
        <div class="border-b border-border p-2 dark:border-white/15">
          <input
            #countrySearch
            type="search"
            class="h-9 w-full rounded-control border border-control bg-transparent px-3 text-body-sm text-ink outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-focus dark:border-white/25 dark:text-white"
            placeholder="Search country or code"
            [value]="countryQuery()"
            (input)="onCountryQuery($event)"
            (keydown)="$event.stopPropagation()"
          />
        </div>
        <ul class="africanies-overlay-scroll m-0 max-h-56 list-none overflow-auto p-1">
          @for (row of filteredCountries(); track row.iso2) {
            <li>
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-body-sm text-ink hover:bg-neutral-100 dark:text-white dark:hover:bg-white/10"
                [class.bg-neutral-100]="row.iso2 === countryIso2()"
                [class.dark:bg-white/10]="row.iso2 === countryIso2()"
                role="option"
                [attr.aria-selected]="row.iso2 === countryIso2()"
                (click)="selectCountry(row)"
              >
                <img
                  [src]="row.flagUrl"
                  alt=""
                  class="h-4 w-5 shrink-0 rounded-sm object-cover"
                  loading="lazy"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1 truncate">{{ row.name }}</span>
                <span class="shrink-0 tabular-nums text-neutral-600 dark:text-neutral-400">
                  {{ row.dialCode }}
                </span>
              </button>
            </li>
          } @empty {
            <li class="px-3 py-4 text-center text-caption text-neutral-600 dark:text-neutral-400">
              No countries match.
            </li>
          }
        </ul>
      </div>
    </ng-template>
  `,
})
/**
 * International phone field — flag + dial code + national number.
 */
export class PhoneInputComponent implements ControlValueAccessor {
  protected readonly controlId = `africanies-phone-input-${++nextPhoneInputId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;
  protected readonly panelPositions = PANEL_POSITIONS;

  private readonly allCountries = phoneCountryOptions();
  private readonly injector = inject(Injector);
  private readonly countrySearch =
    viewChild<ElementRef<HTMLInputElement>>('countrySearch');

  /** Visible field label. */
  readonly label = input('');

  /** Helper under the field (hidden while {@link error} is set). */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. */
  readonly error = input<string | null>(null);

  /** National-number placeholder. */
  readonly placeholder = input('Phone number');

  /**
   * Selected country ISO2. Parents set this from address/user country.
   * Two-way so picking a country updates the parent.
   */
  readonly countryIso2 = model('US');

  /**
   * When true, the flag/dial segment is not clickable (classic `resetISO`).
   * Use for locked sender-country phones; set `false` for free country pick.
   */
  readonly lockCountry = input(false, { transform: booleanAttribute });

  /**
   * E.164 string for `[(value)]` / reactive forms.
   * Empty string when cleared.
   */
  readonly value = model<string>('');

  /**
   * Structured phone object (classic `PhoneNumberFormat` shape).
   * `null` when the national field is empty.
   */
  readonly phoneValue = model<PhoneNumberValue | null>(null);

  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly countryOpen = signal(false);
  protected readonly countryQuery = signal('');
  /** Digits currently typed in the national field. */
  protected readonly nationalDigits = signal('');

  protected readonly dialCode = computed(() =>
    dialCodeForIso2(this.countryIso2()) || '+1',
  );

  protected readonly flagUrl = computed(() => {
    const iso = normalizePhoneIso2(this.countryIso2());
    return iso ? countryFlagUrl(iso, { width: 40 }) : '';
  });

  protected readonly nationalDisplay = computed(() => this.nationalDigits());

  protected readonly filteredCountries = computed((): PhoneCountryOption[] =>
    filterPhoneCountries(this.allCountries, this.countryQuery()),
  );

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

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  /** True while applying an external `value` so emit does not loop. */
  private syncingFromExternal = false;

  constructor() {
    // Template `[(value)]` / `[value]` updates the model but does not call CVA
    // `writeValue`. Sync national digits whenever the external value or the
    // parent-bound country changes (edit prepopulate + locked country forms).
    effect(() => {
      const external = this.value();
      const iso = this.countryIso2();
      const locked = this.lockCountry();
      untracked(() => this.applyExternalValue(external, iso, locked));
    });
  }

  protected maxLengthAttr(): number {
    return PHONE_MAX_NATIONAL_DIGITS;
  }

  writeValue(value: string | PhoneNumberValue | null): void {
    this.applyExternalValue(value, this.countryIso2(), this.lockCountry());
    const e164 =
      this.phoneValue()?.e164Number ??
      (typeof value === 'string' ? value.trim() : '');
    this.syncingFromExternal = true;
    this.value.set(e164);
    this.syncingFromExternal = false;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected toggleCountryPicker(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled() || this.lockCountry()) {
      return;
    }
    this.countryOpen.update((open) => !open);
    if (this.countryOpen()) {
      this.countryQuery.set('');
      // Overlay attaches on the next render; focus search so typing filters.
      afterNextRender(
        () => this.countrySearch()?.nativeElement.focus(),
        { injector: this.injector },
      );
    }
  }

  protected closeCountryPicker(): void {
    this.countryOpen.set(false);
  }

  protected onCountryQuery(event: Event): void {
    this.countryQuery.set((event.target as HTMLInputElement).value);
  }

  protected selectCountry(row: PhoneCountryOption): void {
    this.countryIso2.set(row.iso2);
    this.closeCountryPicker();
    this.emitFromState();
  }

  protected onNationalInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const digits = phoneDigitsOnly(raw).slice(0, PHONE_MAX_NATIONAL_DIGITS);
    this.nationalDigits.set(digits);
    this.emitFromState();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private applyExternalValue(
    value: string | PhoneNumberValue | null | undefined,
    preferredIso2: string,
    lockCountry: boolean,
  ): void {
    const preferred = normalizePhoneIso2(preferredIso2) || 'US';
    const parsed = parsePhoneControlValue(value, preferred);
    // Locked forms keep the parent country; still strip that dial code from
    // stored E.164 / international strings so the national field prefills.
    const iso2 = lockCountry ? preferred : parsed.iso2;
    const nationalDigits = lockCountry
      ? nationalDigitsForLockedCountry(value, preferred)
      : parsed.nationalDigits;

    if (
      iso2 === normalizePhoneIso2(this.countryIso2()) &&
      nationalDigits === this.nationalDigits()
    ) {
      return;
    }

    this.syncingFromExternal = true;
    if (!lockCountry) {
      this.countryIso2.set(iso2);
    }
    this.nationalDigits.set(nationalDigits);
    this.phoneValue.set(buildPhoneNumberValue(iso2, nationalDigits));
    this.syncingFromExternal = false;
  }

  private emitFromState(): void {
    if (this.syncingFromExternal) {
      return;
    }
    const structured = buildPhoneNumberValue(
      this.countryIso2(),
      this.nationalDigits(),
    );
    const e164 = structured ? phoneToE164(structured) : '';
    this.phoneValue.set(structured);
    this.value.set(e164);
    this.onChange(e164);
  }
}

/** National digits when the dial-code country is fixed by the parent. */
function nationalDigitsForLockedCountry(
  value: string | PhoneNumberValue | null | undefined,
  iso2: string,
): string {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'object') {
    return (
      phoneDigitsOnly(value.number) ||
      phoneDigitsOnly(value.nationalNumber) ||
      removeDialCode(value.e164Number, iso2)
    );
  }
  const stripped = removeDialCode(value, iso2);
  // removeDialCode returns full digits when no dial matched — still fine as national.
  return stripped;
}
