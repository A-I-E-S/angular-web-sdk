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
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';

import { ModalService } from '../../overlay/modal.service';
import {
  FORM_AFFIX_CLASS,
  FORM_DISABLED_CLASS,
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';
import type { SelectCreateConfig, SelectOption, SelectSize } from './select.types';

let nextSelectId = 0;

/** Preferred panel placement — flips upward when there is no room below. */
const SELECT_PANEL_POSITIONS: ConnectedPosition[] = [
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
 * Option select following the shared AIES form field pattern.
 *
 * ## Single vs multiple (`selectedChange` shape)
 *
 * - **`multiple=false` (default):** `selected` / CVA / `selectedChange` use
 *   `SelectOption<T> | null` — selecting replaces the previous value.
 * - **`multiple=true`:** `selected` / CVA / `selectedChange` use
 *   `SelectOption<T>[]` — every change emits the **full** selection array.
 *   Switching modes is a breaking type change for consumers; do not assume one
 *   output shape works for both.
 *
 * ## Create paths
 *
 * - **`allowFreeText`** (requires `searchable`): inline “Add \<query\>” when the
 *   search text does not exactly match an option label — for string-only options
 *   with no backing entity.
 * - **`create`**: modal via {@link ModalService} + {@link OVERLAY_DATA} — for
 *   entities that need a real creation flow. Independent of free-text; both may
 *   be enabled together.
 *
 * The dropdown panel is a **CDK overlay** (attached to `body`) so it is not
 * clipped by parent `overflow: hidden` / transform containing blocks.
 * Click-outside (transparent backdrop + `overlayOutsideClick`) and Escape
 * dismiss the panel.
 *
 * ## Prefix / suffix
 *
 * - **Control slots** — project into the shell with `[prefix]` / `[suffix]`
 *   (same pattern as TextInput). Used as the empty-state affixes. Set
 *   `[showTriggerIcon]="false"` when the suffix replaces the built-in caret.
 * - **Option slots** — set `prefix` / `suffix` on each {@link SelectOption} to
 *   an `IconName`. In the list/chips always; in **single-select**, when an
 *   option is selected its icons replace the shell prefix/suffix slots.
 *
 * @typeParam T - Option value type.
 *
 * @example
 * ```html
 * <aies-select
 *   label="Warehouse"
 *   [options]="warehouses()"
 *   [searchable]="true"
 *   [(selected)]="selectedWarehouse"
 *   [error]="loadError()"
 *   [loading]="loading()"
 *   [retrying]="loading()"
 *   [showRetry]="true"
 *   (retry)="loadWarehouses()"
 * >
 *   <aies-icon prefix name="warehouse" [size]="16" />
 * </aies-select>
 * ```
 * ```ts
 * warehouses = signal<SelectOption[]>([
 *   { label: 'Lagos Hub', value: 'los', prefix: 'warehouse', suffix: 'globe' },
 * ]);
 * ```
 */
@Component({
  selector: 'aies-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, CdkOverlayOrigin, CdkConnectedOverlay],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  host: {
    class: 'relative block',
  },
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>
    <!--
      WHY click on the non-focusable shell: prefix/suffix sit outside the
      listbox trigger button. Keyboard users still tab to that inner button.
      This only expands the pointer hit target.
    -->
    <!-- eslint-disable @angular-eslint/template/click-events-have-key-events -->
    <!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->
    <div
      cdkOverlayOrigin
      #triggerOrigin="cdkOverlayOrigin"
      [class]="shellClass()"
      (click)="onShellClick()"
    >
      @if (shellPrefix(); as prefixIcon) {
        <span [class]="affixClass" data-slot="prefix">
          <aies-icon [name]="prefixIcon" [size]="16" class="shrink-0" />
        </span>
      }
      <!--
        Keep ng-content always mounted so projection is not dropped by @if/@else.
        When the selected option owns the affix, hide this slot; otherwise
        empty:hidden collapses unused gutters.
      -->
      <span
        [class]="affixClass"
        data-slot="prefix"
        [class.hidden]="!!shellPrefix()"
      >
        <ng-content select="[prefix]" />
      </span>
      <div
        class="flex h-full min-h-0 min-w-0 flex-1 flex-wrap items-center gap-1.5 py-0"
        [class.px-3]="size() !== 'sm'"
        [class.px-2]="size() === 'sm'"
      >
        @if (multiple() && selectedList().length) {
          @for (chip of selectedList(); track trackOption(chip)) {
            <span
              class="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-background-welcome dark:border-white/20 dark:bg-ink text-body-sm text-ink dark:text-white px-2 py-0.5"
            >
              @if (chip.prefix; as prefixIcon) {
                <aies-icon [name]="prefixIcon" [size]="14" class="shrink-0" />
              }
              {{ chip.label }}
              @if (chip.suffix; as suffixIcon) {
                <aies-icon [name]="suffixIcon" [size]="14" class="shrink-0" />
              }
              <button
                type="button"
                class="inline-flex cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-ink dark:hover:text-white disabled:cursor-not-allowed"
                [attr.aria-label]="'Remove ' + chip.label"
                [disabled]="disabled()"
                (click)="removeChip(chip, $event)"
              >
                <aies-icon name="close-small" [size]="12" />
              </button>
            </span>
          }
        }
        <button
          [id]="controlId"
          type="button"
          class="flex flex-1 cursor-pointer items-center justify-between gap-2 min-w-[6rem] text-left bg-transparent border-0 outline-none disabled:cursor-not-allowed"
          [class.text-body]="size() !== 'sm'"
          [class.text-body-sm]="size() === 'sm'"
          [disabled]="triggerDisabled()"
          [attr.aria-expanded]="open()"
          [attr.aria-haspopup]="'listbox'"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-busy]="loading() ? true : null"
          [attr.aria-describedby]="describedBy()"
          (click)="onTriggerClick($event)"
          (keydown)="onTriggerKeydown($event)"
          (blur)="onBlur()"
        >
          <span
            class="min-w-0 truncate"
            [class.text-neutral-400]="
              !loading() && !displayLabel() && !hasMultiSelection()
            "
          >
            @if (loading() && !displayLabel() && !hasMultiSelection()) {
              {{ loadingLabel() }}
            } @else {
              {{ displayLabel() || triggerText() }}
            }
          </span>
          @if (loading()) {
            <aies-icon
              name="spinner"
              [size]="16"
              [class]="'shrink-0 animate-spin ' + modeColor.classes().text"
              aria-hidden="true"
            />
          } @else if (showTriggerIcon()) {
            <aies-icon
              name="angle-down"
              [size]="16"
              class="shrink-0 text-neutral-600 dark:text-neutral-400"
            />
          }
        </button>
      </div>
      @if (shellSuffix(); as suffixIcon) {
        <span [class]="affixClass" data-slot="suffix">
          <aies-icon [name]="suffixIcon" [size]="16" class="shrink-0" />
        </span>
      }
      <span
        [class]="affixClass"
        data-slot="suffix"
        [class.hidden]="!!shellSuffix()"
      >
        <ng-content select="[suffix]" />
      </span>
    </div>
    <!-- eslint-enable @angular-eslint/template/click-events-have-key-events -->
    <!-- eslint-enable @angular-eslint/template/interactive-supports-focus -->

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
        class="w-full rounded-md border border-border dark:border-white/15 bg-white dark:bg-ink-950 shadow-lg max-h-64 overflow-auto"
        role="listbox"
        tabindex="-1"
        [attr.aria-multiselectable]="multiple() || null"
        (keydown)="onPanelKeydown($event)"
      >
        @if (searchable()) {
          <div
            class="sticky top-0 z-[1] bg-white dark:bg-ink-950 border-b border-border dark:border-white/10 p-2"
          >
            <input
              #searchInput
              type="search"
              class="w-full rounded-md border border-neutral-300 dark:border-white/25 bg-transparent text-body text-ink dark:text-white px-2.5 py-1.5 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              [value]="searchQuery()"
              placeholder="Search…"
              (input)="onSearchInput($event)"
              (keydown)="onPanelKeydown($event)"
            />
          </div>
        }

        @if (loading()) {
          <div
            class="flex items-center gap-2 px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400"
            role="status"
            aria-live="polite"
          >
            <aies-icon
              name="spinner"
              [size]="16"
              [class]="'shrink-0 animate-spin ' + modeColor.classes().text"
            />
            {{ loadingLabel() }}
          </div>
        } @else if (showFreeTextRow()) {
          <button
            type="button"
            [class]="freeTextClass()"
            role="option"
            [attr.aria-selected]="false"
            (click)="commitFreeText()"
            (mouseenter)="activeIndex.set(freeTextIndex())"
          >
            Add "{{ searchQuery().trim() }}"
          </button>
        }

        @if (filteredOptions().length === 0 && !showFreeTextRow() && !loading()) {
          <div class="px-3 py-2 text-body-sm text-neutral-600 dark:text-neutral-400">
            No matches
          </div>
        }

        @for (opt of filteredOptions(); track trackOption(opt); let i = $index) {
          <button
            type="button"
            [class]="optionClass(i)"
            [disabled]="isOptionDisabled(opt)"
            role="option"
            [attr.aria-selected]="isSelected(opt)"
            (click)="selectOption(opt)"
            (mouseenter)="activeIndex.set(optionIndex(i))"
          >
            @if (multiple()) {
              <span [class]="multiCheckClass(opt)">
                @if (isSelected(opt)) {
                  <aies-icon name="check" [size]="12" />
                }
              </span>
            }
            @if (opt.prefix; as prefixIcon) {
              <aies-icon [name]="prefixIcon" [size]="16" class="shrink-0" />
            }
            <span class="min-w-0 flex-1 truncate text-left">{{ opt.label }}</span>
            @if (opt.suffix; as suffixIcon) {
              <aies-icon [name]="suffixIcon" [size]="16" class="shrink-0" />
            }
          </button>
        }

        @if (multiple() && maxSelected() !== null && maxSelected() !== undefined) {
          <div
            class="px-3 py-1.5 text-caption text-neutral-600 dark:text-neutral-400 border-t border-border dark:border-white/10"
          >
            Up to {{ maxSelected() }} selected
          </div>
        }

        @if (create(); as createCfg) {
          <button
            type="button"
            [class]="createRowClass()"
            (click)="openCreateModal()"
            (mouseenter)="activeIndex.set(createIndex())"
          >
            <aies-icon name="file-add" [size]="16" />
            {{ createCfg.label }}
          </button>
        }
      </div>
    </ng-template>

    @if (error(); as err) {
      <p
        [id]="errorId"
        [class]="errorClass"
        class="flex flex-wrap items-center gap-x-1"
        role="alert"
      >
        <span>{{ err }}</span>
        @if (showRetry()) {
          <button
            type="button"
            class="inline cursor-pointer underline font-medium text-danger hover:text-danger/80 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
            [disabled]="disabled() || retrying()"
            (click)="onRetry($event)"
          >
            {{ retrying() ? retryingLabel() : retryLabel() }}
          </button>
        }
      </p>
    } @else if (loading()) {
      <p [id]="hintId" [class]="hintClass" role="status" aria-live="polite">
        <span class="inline-flex items-center gap-1.5">
          <aies-icon
            name="spinner"
            [size]="14"
            [class]="'shrink-0 animate-spin ' + modeColor.classes().text"
          />
          {{ loadingLabel() }}
        </span>
      </p>
    } @else if (hint(); as h) {
      <p [id]="hintId" [class]="hintClass">{{ h }}</p>
    }
  `,
})
export class SelectComponent<T = string> implements ControlValueAccessor {
  private readonly modal = inject(ModalService, { optional: true });
  protected readonly modeColor = inject(ModeColorService);

  protected readonly controlId = `aies-select-${++nextSelectId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;
  protected readonly panelPositions = SELECT_PANEL_POSITIONS;

  /** Floor width for the overlay panel when the trigger width is unknown. */
  protected readonly minPanelWidth = 224;

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly triggerOrigin = viewChild(CdkOverlayOrigin);

  /** Visible field label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation or load message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /**
   * When true, shows an inline Retry control next to {@link error}.
   * Use for async option load failures with `(retry)`. Leave false for
   * validation messages (e.g. “Type is required.”).
   */
  readonly showRetry = input(false, { transform: booleanAttribute });

  /** Retry link label when {@link showRetry} is true. */
  readonly retryLabel = input('Retry');

  /** Retry link copy while {@link retrying} is true. */
  readonly retryingLabel = input('Retrying…');

  /**
   * When true, the inline retry control is disabled and shows {@link retryingLabel}.
   */
  readonly retrying = input(false, { transform: booleanAttribute });

  /**
   * Emitted when the user activates the inline retry control.
   * Pair with {@link showRetry} for async option load failures.
   */
  readonly retry = output<void>();

  /**
   * When true, options are loading — spinner on the trigger, panel, and hint row.
   * Blocks opening the panel until loading completes.
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Copy shown while {@link loading} is true. */
  readonly loadingLabel = input('Loading…');

  /** Placeholder when nothing is selected. */
  readonly placeholder = input('');

  /**
   * Full option list (`[(options)]` / `(optionsChange)`). Parent usually owns
   * the canonical list — listen to `optionsChange` after create/free-text.
   */
  readonly options = model<SelectOption<T>[]>([]);

  /**
   * Current selection (`[(selected)]` / `(selectedChange)`).
   *
   * **Shape depends on {@link multiple}:**
   * - single → `SelectOption<T> | null`
   * - multiple → `SelectOption<T>[]` (full array on every change)
   *
   * Switching modes is a breaking type change for consumers.
   */
  readonly selected = model<SelectOption<T> | SelectOption<T>[] | null>(null);

  /**
   * When true, show a search field that filters options by label
   * (case-insensitive substring). Required for {@link allowFreeText}.
   */
  readonly searchable = input(false, { transform: booleanAttribute });

  /**
   * When true (and {@link searchable}), show an inline “Add \<query\>” row when
   * the query does not exactly match an existing label. Independent of
   * {@link create}.
   */
  readonly allowFreeText = input(false, { transform: booleanAttribute });

  /**
   * When true, selection is `SelectOption[]` with chips + checkboxes; the
   * panel stays open after each pick.
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * Optional cap in multiple mode. Remaining unselected options disable when
   * reached (clicks are not silently ignored without UI feedback).
   */
  readonly maxSelected = input<number | null, unknown>(null, {
    transform: (v) => {
      if (v === null || v === undefined || v === '') {
        return null;
      }
      return numberAttribute(v);
    },
  });

  /**
   * Modal-create config. Opens via {@link ModalService}; result is mapped with
   * `mapResult`, appended to options, then selected.
   */
  readonly create = input<SelectCreateConfig<unknown, T> | null>(null);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  /**
   * When false, hides the built-in `angle-down` on the trigger so callers can
   * supply a chevron via the `[suffix]` slot (e.g. compact page-size selects).
   * Loading still shows the spinner on the trigger.
   */
  readonly showTriggerIcon = input(true, { transform: booleanAttribute });

  /**
   * Control height. Defaults to `md` (`h-10`). Use `sm` (`h-8`) next to
   * sm `aies-button` (pagination size picker).
   */
  readonly size = input<SelectSize>('md');

  protected readonly open = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly cvaDisabled = signal(false);
  protected readonly panelWidth = signal<number | string>('auto');

  /** Suppresses re-entrant close when CDK emits `detach` after we already closed. */
  private closingFromApi = false;

  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  /** True while async options are loading or a retry is in flight. */
  protected readonly isBusy = computed(
    () => this.loading() || this.retrying(),
  );

  /** Trigger is not interactive while disabled or loading. */
  protected readonly triggerDisabled = computed(
    () => this.disabled() || this.isBusy(),
  );

  protected readonly shellClass = computed(() => {
    let classes = FORM_FIELD_CLASS;
    if (this.error()) {
      classes += ` ${FORM_FIELD_ERROR_CLASS}`;
    }
    if (this.size() === 'sm') {
      classes += ' !h-8';
    }
    if (this.multiple() && this.selectedList().length) {
      classes += ' !h-auto min-h-10 items-stretch py-1.5';
    }
    if (this.disabled()) {
      classes += ` ${FORM_DISABLED_CLASS}`;
    } else if (this.loading()) {
      classes += ' cursor-wait';
    } else {
      // Whole shell is the hit target (prefix/suffix affixes sit outside the
      // trigger button); pointer cues that.
      classes += ' cursor-pointer';
    }
    return classes;
  });

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.loading()) {
      return this.hintId;
    }
    if (this.hint()) {
      return this.hintId;
    }
    return null;
  });

  protected readonly selectedList = computed((): SelectOption<T>[] => {
    const sel = this.selected();
    if (this.multiple()) {
      return Array.isArray(sel) ? sel : [];
    }
    return sel && !Array.isArray(sel) ? [sel] : [];
  });

  protected readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const opts = this.options();
    if (!this.searchable() || !q) {
      return opts;
    }
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  });

  protected readonly showFreeTextRow = computed(() => {
    if (!this.allowFreeText() || !this.searchable()) {
      return false;
    }
    const q = this.searchQuery().trim();
    if (!q) {
      return false;
    }
    return !this.options().some(
      (o) => o.label.toLowerCase() === q.toLowerCase(),
    );
  });

  protected readonly freeTextIndex = computed(() =>
    this.showFreeTextRow() ? 0 : -1,
  );

  protected readonly createIndex = computed(() => {
    if (!this.create()) {
      return -1;
    }
    const free = this.showFreeTextRow() ? 1 : 0;
    return free + this.filteredOptions().length;
  });

  protected readonly navigableCount = computed(() => {
    const free = this.showFreeTextRow() ? 1 : 0;
    const create = this.create() ? 1 : 0;
    return free + this.filteredOptions().length + create;
  });

  protected readonly displayLabel = computed(() => {
    // Multiple mode shows chips; keep the trigger text empty so chips own the labels.
    if (this.multiple()) {
      return '';
    }
    const sel = this.selected();
    return sel && !Array.isArray(sel) ? sel.label : '';
  });

  /** True when multiple mode has at least one chip selected. */
  protected readonly hasMultiSelection = computed(
    () => this.multiple() && this.selectedList().length > 0,
  );

  /**
   * Placeholder for the trigger — hidden in multiple mode once chips exist.
   */
  protected readonly triggerText = computed(() => {
    if (this.hasMultiSelection()) {
      return '';
    }
    return this.placeholder() || 'Select…';
  });

  /**
   * Single-select current option (for shell prefix/suffix icons).
   * `null` in multiple mode or when nothing is selected.
   */
  protected readonly singleSelected = computed((): SelectOption<T> | null => {
    if (this.multiple()) {
      return null;
    }
    const sel = this.selected();
    return sel && !Array.isArray(sel) ? sel : null;
  });

  /** Selected option prefix → shell prefix slot (single-select only). */
  protected readonly shellPrefix = computed(
    () => this.singleSelected()?.prefix ?? null,
  );

  /** Selected option suffix → shell suffix slot (single-select only). */
  protected readonly shellSuffix = computed(
    () => this.singleSelected()?.suffix ?? null,
  );

  private onChange: (
    value: SelectOption<T> | SelectOption<T>[] | null,
  ) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /**
   * Active/hover option classes — soft mode accent (not near-white
   * `background-welcome`, which made light text illegible in dark mode).
   *
   * @param filteredIndex - Index within {@link filteredOptions}.
   * @returns Tailwind class string for the option button.
   */
  protected optionClass(filteredIndex: number): string {
    const active = this.activeIndex() === this.optionIndex(filteredIndex);
    const colors = this.modeColor.classes();
    const base =
      'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-body text-ink dark:text-white disabled:opacity-50 disabled:cursor-not-allowed';
    return active
      ? `${base} ${colors.soft}`
      : `${base} ${colors.softHover}`;
  }

  /** @returns Classes for the free-text create row. */
  protected freeTextClass(): string {
    const active = this.activeIndex() === this.freeTextIndex();
    const colors = this.modeColor.classes();
    const base = `flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-body ${colors.text}`;
    return active
      ? `${base} ${colors.soft}`
      : `${base} ${colors.softHover}`;
  }

  /** @returns Classes for the modal-create trigger row. */
  protected createRowClass(): string {
    const active = this.activeIndex() === this.createIndex();
    const colors = this.modeColor.classes();
    const base = `flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-body ${colors.text} border-t border-border dark:border-white/10`;
    return active
      ? `${base} ${colors.soft}`
      : `${base} ${colors.softHover}`;
  }

  /**
   * Multi-select checkbox chrome for a list option.
   * @param opt - Option whose selection state drives the mark.
   * @returns Tailwind class string for the checkbox glyph.
   */
  protected multiCheckClass(opt: SelectOption<T>): string {
    const base =
      'inline-flex size-4 items-center justify-center rounded border shrink-0 text-white dark:border-white/20';
    if (!this.isSelected(opt)) {
      return `${base} border-neutral-400`;
    }
    const c = this.modeColor.classes();
    return `${base} ${c.bg} ${c.border}`;
  }

  /**
   * @param value - Selection; shape must match {@link multiple}.
   */
  writeValue(value: SelectOption<T> | SelectOption<T>[] | null): void {
    this.selected.set(value);
  }

  /**
   * @param fn - Selection change for Reactive Forms.
   */
  registerOnChange(
    fn: (value: SelectOption<T> | SelectOption<T>[] | null) => void,
  ): void {
    this.onChange = fn;
  }

  /** @param fn - Touched callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @param isDisabled - Blocks interaction when true. */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected trackOption(opt: SelectOption<T>): string {
    return `${opt.label}:${String(opt.value)}`;
  }

  protected optionIndex(filteredIndex: number): number {
    return (this.showFreeTextRow() ? 1 : 0) + filteredIndex;
  }

  protected isSelected(opt: SelectOption<T>): boolean {
    return this.selectedList().some((s) => Object.is(s.value, opt.value));
  }

  protected isOptionDisabled(opt: SelectOption<T>): boolean {
    if (opt.disabled || this.disabled() || this.loading()) {
      return true;
    }
    if (!this.multiple()) {
      return false;
    }
    const max = this.maxSelected();
    if (max == null) {
      return false;
    }
    if (this.isSelected(opt)) {
      return false;
    }
    return this.selectedList().length >= max;
  }

  /**
   * Opens/closes when the user clicks the shell chrome (prefix/suffix slots
   * sit outside the trigger button).
   */
  protected onShellClick(): void {
    this.toggleOpen();
  }

  /**
   * Trigger button path — stop bubbling so {@link onShellClick} does not
   * double-toggle.
   * @param event - Pointer event from the listbox trigger.
   */
  protected onTriggerClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleOpen();
  }

  protected toggleOpen(): void {
    if (this.triggerDisabled()) {
      return;
    }
    if (this.open()) {
      this.closePanel();
      return;
    }
    this.openPanel();
  }

  /** Sync panel width to the trigger shell (exact match when measurable). */
  protected openPanel(): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement as
      | HTMLElement
      | undefined;
    const triggerWidth = origin?.getBoundingClientRect().width ?? 0;
    this.panelWidth.set(
      triggerWidth > 0 ? triggerWidth : this.minPanelWidth,
    );
    this.open.set(true);
    this.activeIndex.set(0);
    queueMicrotask(() => this.searchInput()?.nativeElement.focus());
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

  /**
   * Dismiss when the user clicks outside the panel.
   * Clicks on the trigger are ignored so {@link toggleOpen} owns that path
   * (avoids close-then-reopen when the transparent backdrop is not covering).
   * @param event
   */
  protected onOutsideClick(event: MouseEvent): void {
    const origin = this.triggerOrigin()?.elementRef.nativeElement as
      | HTMLElement
      | undefined;
    const target = event.target as Node | null;
    if (origin && target && origin.contains(target)) {
      return;
    }
    this.closePanel();
  }

  /** CDK detach (e.g. scroll strategy) — keep `open` in sync without double-touch. */
  protected onOverlayDetach(): void {
    if (this.closingFromApi) {
      return;
    }
    if (this.open()) {
      this.open.set(false);
      this.onTouched();
    }
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      if (!this.open()) {
        this.openPanel();
      } else if (event.key === 'Enter' || event.key === ' ') {
        this.activateCurrent();
      } else {
        this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
      }
    } else if (event.key === 'Escape') {
      this.closePanel();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActive(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.activateCurrent();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closePanel();
    }
  }

  protected moveActive(delta: number): void {
    const count = this.navigableCount();
    if (count === 0) {
      return;
    }
    const next = (this.activeIndex() + delta + count) % count;
    this.activeIndex.set(next);
  }

  protected activateCurrent(): void {
    const idx = this.activeIndex();
    if (this.showFreeTextRow() && idx === this.freeTextIndex()) {
      this.commitFreeText();
      return;
    }
    if (this.create() && idx === this.createIndex()) {
      this.openCreateModal();
      return;
    }
    const optIdx = idx - (this.showFreeTextRow() ? 1 : 0);
    const opt = this.filteredOptions()[optIdx];
    if (opt) {
      this.selectOption(opt);
    }
  }

  protected selectOption(opt: SelectOption<T>): void {
    if (this.isOptionDisabled(opt)) {
      return;
    }
    if (this.multiple()) {
      const current = [...this.selectedList()];
      const existing = current.findIndex((s) => Object.is(s.value, opt.value));
      if (existing >= 0) {
        current.splice(existing, 1);
      } else {
        current.push(opt);
      }
      this.commitSelection(current);
      // Stay open so the user can pick several without reopening.
      return;
    }
    this.commitSelection(opt);
    this.closePanel();
    this.searchQuery.set('');
  }

  protected removeChip(opt: SelectOption<T>, event: Event): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    const next = this.selectedList().filter(
      (s) => !Object.is(s.value, opt.value),
    );
    this.commitSelection(next);
  }

  protected commitFreeText(): void {
    const label = this.searchQuery().trim();
    if (!label) {
      return;
    }
    const option = {
      label,
      value: label as T,
    } as SelectOption<T>;
    this.appendCreatedOption(option);
  }

  protected openCreateModal(): void {
    const cfg = this.create();
    if (!cfg) {
      return;
    }
    if (!this.modal) {
      // WHY console error: create requires provideAiesUiOverlays() / ModalService.
      console.error(
        '[aies-select] create requires ModalService — call provideAiesUiOverlays() at bootstrap.',
      );
      return;
    }
    const handle = this.modal.open(cfg.component, { data: cfg.data });
    handle.afterClosed().subscribe((result) => {
      if (result === undefined || result === null) {
        return;
      }
      const option = cfg.mapResult(result);
      this.appendCreatedOption(option);
    });
  }

  private appendCreatedOption(option: SelectOption<T>): void {
    // model() emits optionsChange for parents that persist the canonical list.
    this.options.set([...this.options(), option]);

    if (this.multiple()) {
      const max = this.maxSelected();
      const list = [...this.selectedList()];
      if (!list.some((s) => Object.is(s.value, option.value))) {
        if (max == null || list.length < max) {
          list.push(option);
        }
      }
      this.commitSelection(list);
      this.searchQuery.set('');
      return;
    }

    this.commitSelection(option);
    this.searchQuery.set('');
    this.closePanel();
  }

  private commitSelection(
    next: SelectOption<T> | SelectOption<T>[] | null,
  ): void {
    // model() emits selectedChange; CVA still needs onChange for form controls.
    this.selected.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onRetry(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled() || this.retrying()) {
      return;
    }
    this.retry.emit();
  }
}
