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
  effect,
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

import { AiesIconComponent } from '@aies/aies-icons';
import { Subject, of, timer } from 'rxjs';
import {
  catchError,
  debounce,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';

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
import { ChipComponent } from '../../chip/chip.component';
import type {
  SearchComboboxBadgeFn,
  SearchComboboxLabelFn,
  SearchComboboxMarkFn,
  SearchComboboxSearchFn,
  SearchComboboxSubtitleFn,
  SearchComboboxTrackFn,
} from './search-combobox.types';
import {
  TooltipComponent,
  TooltipTriggerDirective,
} from '../../tooltip';

let nextSearchComboboxId = 0;

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
 * Generic type-as-you-search combobox with a debounced async lookup and
 * overlay result list.
 *
 * Pass {@link search} plus {@link optionLabel} (and optional
 * {@link optionSubtitle}) so the same control works for customers, staff,
 * partners, etc. Emits the selected entity via `[(selected)]` / CVA.
 *
 * @typeParam T - Entity type returned by {@link search} and held in
 *   {@link selected}.
 *
 * @example
 * ```html
 * <aies-search-combobox
 *   label="Customer"
 *   [search]="searchCustomers"
 *   [optionLabel]="customerLabel"
 *   [optionSubtitle]="customerSubtitle"
 *   [(selected)]="customer"
 * />
 * ```
 */
@Component({
  selector: 'aies-search-combobox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AiesIconComponent,
    ChipComponent,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    TooltipComponent,
    TooltipTriggerDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComboboxComponent),
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
        @if (loading()) {
          <aies-icon name="spinner" [size]="16" class="animate-spin" />
        } @else if (selectedMark()) {
          <aies-tooltip [text]="markTooltip()" placement="top">
            <span
              aiesTooltipTrigger
              class="inline-flex h-5 w-5 items-center justify-center"
              role="img"
              [attr.aria-label]="markTooltip()"
            >
              <aies-icon name="star" [size]="14" class="text-[#D4AF37]" />
            </span>
          </aies-tooltip>
        } @else {
          <ng-content select="[suffix]" />
        }
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
        class="aies-overlay-scroll max-h-64 w-full overflow-auto rounded-md border border-border bg-white shadow-lg dark:border-white/15 dark:bg-ink-950"
        role="listbox"
        tabindex="-1"
      >
        @if (loading()) {
          <div
            class="px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400"
          >
            Searching…
          </div>
        } @else if (searchError(); as err) {
          <div
            class="px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400"
          >
            {{ err }}
          </div>
        } @else if (options().length === 0) {
          <div
            class="px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400"
          >
            {{ emptyMessage() }}
          </div>
        } @else {
          @for (item of options(); track trackKey(item); let i = $index) {
            <button
              type="button"
              [id]="optionId(i)"
              role="option"
              class="flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2 text-left text-body text-ink outline-none hover:bg-background-welcome focus-visible:bg-background-welcome dark:text-white dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
              [class.bg-background-welcome]="activeIndex() === i"
              [class.dark:bg-white/5]="activeIndex() === i"
              [attr.aria-selected]="activeIndex() === i"
              (mousedown)="$event.preventDefault()"
              (click)="selectItem(item)"
              (mouseenter)="activeIndex.set(i)"
            >
              <div class="flex min-w-0 items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-1.5">
                  @if (markFor(item)) {
                    <aies-icon
                      name="star"
                      [size]="14"
                      class="shrink-0 text-[#D4AF37]"
                      [title]="markTooltip()"
                    />
                  }
                  <span class="min-w-0 truncate font-medium">
                    {{ optionLabel()(item) }}
                  </span>
                </div>
                @if (badgeFor(item); as badge) {
                  <aies-chip
                    class="shrink-0"
                    [variant]="badge.variant ?? 'neutral'"
                    [icon]="badge.icon"
                  >
                    {{ badge.label }}
                  </aies-chip>
                }
              </div>
              @if (subtitleFor(item); as subtitle) {
                <span
                  class="min-w-0 truncate text-caption text-neutral-600 dark:text-neutral-400"
                >
                  {{ subtitle }}
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
export class SearchComboboxComponent<T> implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controlId = `aies-search-combobox-${++nextSearchComboboxId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly listboxId = `${this.controlId}-listbox`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly innerClass = FORM_CONTROL_INNER_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;
  protected readonly panelPositions = PANEL_POSITIONS;
  protected readonly minPanelWidth = 224;

  private readonly triggerOrigin = viewChild(CdkOverlayOrigin);
  private readonly querySubject = new Subject<string>();
  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Visible field label. */
  readonly label = input('');

  /** Helper copy under the field. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. */
  readonly error = input<string | null>(null);

  readonly placeholder = input('');

  /** Debounce before calling {@link search} (ms). Default 500. */
  readonly debounceMs = input(500, { transform: numberAttribute });

  /** Minimum trimmed query length before search runs. Default 2. */
  readonly minQueryLength = input(2, { transform: numberAttribute });

  readonly emptyMessage = input('No matches');

  /** Async lookup — parent owns HTTP / filtering. */
  readonly search = input.required<SearchComboboxSearchFn<T>>();

  readonly optionLabel = input.required<SearchComboboxLabelFn<T>>();

  readonly optionSubtitle = input<SearchComboboxSubtitleFn<T> | undefined>(
    undefined,
  );

  readonly optionBadge = input<SearchComboboxBadgeFn<T> | undefined>(
    undefined,
  );

  readonly optionMark = input<SearchComboboxMarkFn<T> | undefined>(undefined);

  readonly markTooltip = input('Professional Business Plan');

  readonly trackBy = input<SearchComboboxTrackFn<T>>(
    (item: T) => this.optionLabel()(item),
  );

  readonly selected = model<T | null>(null);

  readonly queryChange = output<string>();

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
  protected readonly options = signal<T[]>([]);
  protected readonly searchError = signal<string | null>(null);
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

  protected readonly selectedMark = computed(() => {
    const sel = this.selected();
    const fn = this.optionMark();
    return !!sel && !!fn && fn(sel);
  });

  constructor() {
    effect(() => {
      const sel = this.selected();
      const labelFn = this.optionLabel();
      if (sel) {
        this.query.set(labelFn(sel));
      }
    });

    this.querySubject
      .pipe(
        debounce(() => timer(Math.max(0, Number(this.debounceMs()) || 0))),
        distinctUntilChanged(),
        switchMap((text) => {
          const trimmed = text.trim();
          const min = Math.max(0, Number(this.minQueryLength()) || 0);
          if (trimmed.length < min) {
            this.options.set([]);
            this.searchError.set(null);
            this.loading.set(false);
            this.open.set(false);
            return of([] as T[]);
          }
          this.loading.set(true);
          this.open.set(true);
          return this.search()(trimmed).pipe(
            tap(() => this.searchError.set(null)),
            catchError((err) => {
              this.searchError.set(
                err instanceof Error
                  ? err.message
                  : 'Could not load results.',
              );
              return of([] as T[]);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.loading.set(false);
        this.options.set(results);
        this.activeIndex.set(results.length ? 0 : -1);
        if (this.query().trim().length > 0) {
          this.open.set(true);
        }
      });
  }

  writeValue(value: T | null): void {
    this.selected.set(value);
    this.query.set(value ? this.optionLabel()(value) : '');
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  /** Clear selection and query text. */
  clear(): void {
    this.query.set('');
    this.commit(null);
    this.options.set([]);
    this.open.set(false);
  }

  protected trackKey(item: T): string | number {
    return this.trackBy()(item);
  }

  protected subtitleFor(item: T): string | undefined {
    const fn = this.optionSubtitle();
    return fn ? fn(item)?.trim() || undefined : undefined;
  }

  protected badgeFor(item: T) {
    const fn = this.optionBadge();
    return fn ? fn(item) ?? undefined : undefined;
  }

  protected markFor(item: T): boolean {
    const fn = this.optionMark();
    return fn ? fn(item) : false;
  }

  protected optionId(index: number): string {
    return `${this.controlId}-option-${index}`;
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.query.set(next);
    this.queryChange.emit(next);

    if (this.selected() !== null) {
      this.commit(null);
    }

    this.syncPanelWidth();
    this.querySubject.next(next);
  }

  protected onFocus(): void {
    this.syncPanelWidth();
    if (this.query().trim() && this.options().length) {
      this.open.set(true);
    }
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (
      !this.open() &&
      (event.key === 'ArrowDown' || event.key === 'ArrowUp')
    ) {
      if (this.options().length) {
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

    const count = this.options().length;
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
        const item = this.options()[this.activeIndex()];
        if (item) {
          this.selectItem(item);
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

  protected selectItem(item: T): void {
    this.query.set(this.optionLabel()(item));
    this.commit(item);
    this.closePanel();
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

  private commit(item: T | null): void {
    this.selected.set(item);
    this.onChange(item);
  }

  private syncPanelWidth(): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement as
      | HTMLElement
      | undefined;
    const width = origin?.getBoundingClientRect().width ?? this.minPanelWidth;
    this.panelWidth.set(Math.max(this.minPanelWidth, Math.round(width)));
  }
}
