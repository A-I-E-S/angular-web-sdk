import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { isObservable, type Observable, take } from 'rxjs';

import { FilterOptionsResolver } from '@aies/aies-core';
import { AiesIconComponent } from '@aies/aies-icons';
import type {
  FilterFieldModel,
  FilterOptionModel,
  FilterStateModel,
} from '@aies/aies-models';
import {
  cloneFilterState,
  resetFilterState,
  resolveFilterTransport,
  toFilterParams,
} from '@aies/aies-models';

import { ButtonComponent } from '../button/button.component';
import { DatePickerComponent } from '../forms/date-picker/date-picker.component';
import {
  RadioComponent,
  type RadioOption,
} from '../forms/radio/radio.component';
import { SelectComponent } from '../forms/select/select.component';
import type { SelectOption } from '../forms/select/select.types';
import { TextInputComponent } from '../forms/text-input/text-input.component';
import { AiesOverlayRef } from '../overlay/aies-overlay-ref';
import { OVERLAY_DATA } from '../overlay/overlay-data.token';
import type {
  FilterDrawerData,
  FilterDrawerResult,
} from './filter-drawer.types';
import { FilterQueryService } from './filter-query.service';

/**
 * Schema-driven filter drawer body.
 *
 * Opened via {@link FilterDrawerService} (or {@link DrawerService} with this
 * component). Edits a cloned {@link FilterStateModel}; Apply serializes with
 * {@link toFilterParams}. When {@link FilterDrawerData.onApply} is set, the
 * drawer stays open until that call succeeds, then closes with
 * {@link FilterDrawerResult}. Successful Apply also writes the query bag to
 * the browser URL via {@link FilterQueryService} (page resets to 1).
 */
@Component({
  selector: 'aies-filter-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  },
  imports: [
    AiesIconComponent,
    ButtonComponent,
    DatePickerComponent,
    RadioComponent,
    SelectComponent,
    TextInputComponent,
  ],
  template: `
    <!--
      Cancel drawer panel padding (-m-6) so the footer can sit flush on the
      bottom edge; scroll only the middle region.
    -->
    <div class="flex h-full min-h-0 flex-col -mx-6">
      <div class="flex shrink-0 items-start justify-between gap-3 px-6 pb-4 pt-6">
        <div class="min-w-0 flex flex-col gap-1">
          <p
            class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400"
          >
            Filters
          </p>
          <h2 class="m-0 text-heading-3 text-ink dark:text-white">
            {{ title() }}
          </h2>
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            {{ config.id }} · {{ transport }}
          </p>
        </div>
        <button
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close"
          (click)="ref.close()"
        >
          <aies-icon name="close" [size]="18" />
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-5">
        @if (config.search; as search) {
          <aies-text-input
            [label]="search.label"
            [placeholder]="search.placeholder ?? ''"
            [value]="draft().search ?? ''"
            (valueChange)="patchSearch($event)"
          />
        }

        @if (config.date; as dateCfg) {
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-2">
              <p class="m-0 text-body-sm font-medium text-ink dark:text-white">
                Date
              </p>
              <button
                aies-button
                type="button"
                variant="ghost"
                size="sm"
                (click)="clearDateSection()"
              >
                Clear
              </button>
            </div>
            <aies-select
              label=""
              [searchable]="true"
              [options]="dateFieldOptions()"
              [selected]="selectedDateField()"
              (selectedChange)="onDateFieldChange($event)"
            />
            <div class="grid grid-cols-2 gap-3">
              <aies-date-picker
                label="From"
                [value]="draft().from ?? null"
                [max]="draft().to || undefined"
                (valueChange)="patchFrom($event)"
              />
              <aies-date-picker
                label="To"
                [value]="draft().to ?? null"
                [min]="draft().from || undefined"
                (valueChange)="patchTo($event)"
              />
            </div>
          </div>
        }

        @if (config.sort; as sortCfg) {
          <aies-select
            label="Sort"
            [searchable]="sortOptions().length > 6"
            [options]="sortOptions()"
            [selected]="selectedSort()"
            (selectedChange)="onSortChange($event)"
          />
        }

        @if (config.fields.length) {
          <aies-select
            label="Filter by"
            placeholder="Select fields…"
            [multiple]="true"
            [searchable]="true"
            [options]="filterByOptions()"
            [selected]="selectedFilterBy()"
            (selectedChange)="onFilterByChange($event)"
          />

          @for (field of activeFields(); track field.key) {
            <div class="flex flex-col gap-2 border-t border-border pt-4 dark:border-white/10">
              <div class="flex items-center justify-between gap-2">
                <p class="m-0 text-body-sm font-medium text-ink dark:text-white">
                  {{ field.label }}
                </p>
                <button
                  aies-button
                  type="button"
                  variant="ghost"
                  size="sm"
                  (click)="clearField(field.key)"
                >
                  Clear
                </button>
              </div>

              @switch (field.type) {
                @case ('enum') {
                  <div class="flex flex-wrap gap-2">
                    @for (opt of field.options ?? []; track opt.value) {
                      <button
                        type="button"
                        class="cursor-pointer rounded-md border px-2.5 py-1.5 text-body-sm transition-colors"
                        [style.color]="
                          draft().values[field.key] === opt.value
                            ? opt.color ?? null
                            : null
                        "
                        [style.border-color]="
                          draft().values[field.key] === opt.value
                            ? opt.color ?? null
                            : null
                        "
                        [style.background-color]="
                          draft().values[field.key] === opt.value && opt.color
                            ? opt.color + '1A'
                            : null
                        "
                        [class]="
                          draft().values[field.key] === opt.value
                            ? 'font-medium'
                            : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-white/15 dark:text-neutral-300'
                        "
                        (click)="setFieldValue(field.key, opt.value)"
                      >
                        {{ opt.label }}
                      </button>
                    }
                  </div>
                }
                @case ('boolean') {
                  <aies-radio
                    label=""
                    [options]="toRadioOptions(field.options)"
                    [value]="draft().values[field.key] ?? null"
                    (valueChange)="onRadioChange(field.key, $event)"
                  />
                }
                @case ('select') {
                  <!-- Label already shown in the section header — avoid double label. -->
                  <aies-select
                    label=""
                    [searchable]="true"
                    [placeholder]="field.placeholder ?? 'Select…'"
                    [options]="selectOptionsFor(field)"
                    [selected]="selectedForField(field)"
                    [error]="optionErrorFor(field.key)"
                    [loading]="optionLoadingFor(field.key)"
                    [retrying]="optionLoadingFor(field.key)"
                    [showRetry]="true"
                    (retry)="retryFieldOptions(field.key)"
                    (selectedChange)="onSelectChange(field.key, $event)"
                  />
                }
                @case ('text') {
                  <aies-text-input
                    label=""
                    [placeholder]="field.placeholder ?? ''"
                    [value]="draft().values[field.key] ?? ''"
                    (valueChange)="setFieldValue(field.key, $event)"
                  />
                }
              }
            </div>
          }
        }
      </div>

      <div
        class="flex shrink-0 flex-col gap-2 border-t border-border bg-white px-6 pt-3 pb-2 dark:border-white/10 dark:bg-ink-950"
      >
        @if (applyError(); as err) {
          <div
            class="flex items-start gap-2.5 rounded-md border border-danger/20 border-l-[3px] border-l-danger bg-danger-subtle/40 px-3 py-2.5 dark:border-danger/25 dark:bg-danger/10"
            role="alert"
            aria-live="polite"
          >
            <aies-icon
              name="warning"
              [size]="16"
              class="mt-0.5 shrink-0 text-danger"
            />
            <div class="min-w-0 flex-1 flex flex-col gap-0.5">
              <p class="m-0 text-caption font-medium text-danger">Apply failed</p>
              <p
                class="m-0 text-caption leading-snug text-neutral-700 dark:text-neutral-300"
              >
                {{ err }}
              </p>
            </div>
            <button
              aies-button
              type="button"
              variant="ghost"
              size="sm"
              class="shrink-0 !min-h-0 self-start !px-1 !py-0 text-neutral-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white"
              aria-label="Dismiss"
              (click)="applyError.set(null)"
            >
              <aies-icon name="close" [size]="14" />
            </button>
          </div>
        }
        <div class="flex gap-2">
          <button
            aies-button
            type="button"
            variant="ghost"
            class="flex-1"
            [disabled]="applying()"
            (click)="onReset()"
          >
            Reset
          </button>
          <button
            aies-button
            type="button"
            variant="primary"
            class="flex-1"
            [disabled]="applying()"
            (click)="onApply()"
          >
            {{ applying() ? 'Applying…' : 'Apply' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class FilterDrawerPanel {
  protected readonly data = inject<FilterDrawerData>(OVERLAY_DATA);
  protected readonly ref = inject(AiesOverlayRef<FilterDrawerResult>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterOptions = inject(FilterOptionsResolver);
  private readonly filterQuery = inject(FilterQueryService);

  protected readonly config = this.data.config;
  protected readonly transport = resolveFilterTransport(this.data.config);
  protected readonly title = computed(
    () => this.data.title ?? 'Filters',
  );

  /** True while {@link FilterDrawerData.onApply} is in flight. */
  protected readonly applying = signal(false);
  /** Last apply failure message (cleared on retry / success). */
  protected readonly applyError = signal<string | null>(null);

  /** Local edit buffer — host state only updates on Apply. */
  protected readonly draft = signal<FilterStateModel>(
    cloneFilterState(this.data.state),
  );

  /**
   * Fields the user has “opened” for value entry.
   * Seeded from keys that already have values so hydrate restores sections.
   */
  protected readonly selectedKeys = signal<string[]>(
    Object.keys(this.data.state?.values ?? {}).filter(
      (k) => !!this.data.state?.values?.[k],
    ),
  );

  /** Loaded async / host option rows keyed by field.key. */
  protected readonly optionLists = signal<
    Record<string, FilterOptionModel[]>
  >(this.seedOptionLists());

  /** Field-level catalog fetch errors (select error slot). */
  protected readonly optionErrors = signal<Record<string, string | null>>({});

  /** Fields currently loading SDK catalogs. */
  protected readonly optionLoading = signal<Record<string, boolean>>({});

  private readonly optionLoadsStarted = new Set<string>();

  constructor() {
    for (const key of this.selectedKeys()) {
      this.ensureFieldOptionsByKey(key);
    }
  }

  protected readonly activeFields = computed(() => {
    const keys = new Set(this.selectedKeys());
    return this.config.fields.filter((f) => keys.has(f.key));
  });

  protected readonly filterByOptions = computed((): SelectOption<string>[] =>
    this.config.fields.map((f) => ({
      label: f.label,
      value: f.key,
    })),
  );

  protected readonly dateFieldOptions = computed((): SelectOption<string>[] =>
    (this.config.date?.fields ?? []).map((o) => ({
      label: o.label,
      value: o.value,
    })),
  );

  protected readonly sortOptions = computed((): SelectOption<string>[] =>
    (this.config.sort?.options ?? []).map((o) => ({
      label: o.label,
      value: o.value,
    })),
  );

  protected selectedFilterBy(): SelectOption<string>[] {
    const keys = new Set(this.selectedKeys());
    return this.filterByOptions().filter((o) => keys.has(o.value));
  }

  protected selectedDateField(): SelectOption<string> | null {
    const value = this.draft().date;
    if (!value) {
      return null;
    }
    return this.dateFieldOptions().find((o) => o.value === value) ?? {
      label: value,
      value,
    };
  }

  protected selectedSort(): SelectOption<string> | null {
    const value = this.draft().order;
    if (!value) {
      return null;
    }
    return this.sortOptions().find((o) => o.value === value) ?? {
      label: value,
      value,
    };
  }

  protected onFilterByChange(
    selected: SelectOption<string> | SelectOption<string>[] | null,
  ): void {
    const next = Array.isArray(selected)
      ? selected.map((o) => o.value)
      : selected
        ? [selected.value]
        : [];
    const prev = new Set(this.selectedKeys());
    const nextSet = new Set(next);

    for (const key of prev) {
      if (!nextSet.has(key)) {
        this.clearField(key);
      }
    }

    this.selectedKeys.set(next);

    for (const key of next) {
      this.ensureFieldOptionsByKey(key);
    }
  }

  protected clearField(key: string): void {
    this.draft.update((s) => {
      const values = { ...s.values };
      delete values[key];
      return { ...s, values };
    });
  }

  protected setFieldValue(key: string, value: string): void {
    this.draft.update((s) => ({
      ...s,
      values: { ...s.values, [key]: value },
    }));
  }

  protected patchSearch(value: string): void {
    this.draft.update((s) => ({ ...s, search: value || undefined }));
  }

  protected patchFrom(value: string | null): void {
    this.draft.update((s) => {
      const from = value ?? undefined;
      // Keep range valid: To cannot precede From.
      const to = from && s.to && s.to < from ? undefined : s.to;
      return { ...s, from, to };
    });
  }

  protected patchTo(value: string | null): void {
    this.draft.update((s) => {
      const to = value ?? undefined;
      // Keep range valid: From cannot follow To.
      const from = to && s.from && s.from > to ? undefined : s.from;
      return { ...s, from, to };
    });
  }

  /** Clears date field + range without touching other filters. */
  protected clearDateSection(): void {
    this.draft.update((s) => ({
      ...s,
      date: undefined,
      from: undefined,
      to: undefined,
    }));
  }

  protected onDateFieldChange(
    selected: SelectOption<string> | SelectOption<string>[] | null,
  ): void {
    const opt = Array.isArray(selected) ? selected[0] : selected;
    this.draft.update((s) => ({ ...s, date: opt?.value }));
  }

  protected onSortChange(
    selected: SelectOption<string> | SelectOption<string>[] | null,
  ): void {
    const opt = Array.isArray(selected) ? selected[0] : selected;
    this.draft.update((s) => ({ ...s, order: opt?.value }));
  }

  protected onRadioChange(key: string, value: string | null): void {
    if (value == null) {
      this.clearField(key);
      return;
    }
    this.setFieldValue(key, value);
  }

  protected onSelectChange(
    key: string,
    selected: SelectOption<string> | SelectOption<string>[] | null,
  ): void {
    const opt = Array.isArray(selected) ? selected[0] : selected;
    if (!opt) {
      this.clearField(key);
      return;
    }
    this.setFieldValue(key, String(opt.value));
  }

  protected selectOptionsFor(field: FilterFieldModel): SelectOption<string>[] {
    const fromLoaded = this.optionLists()[field.key];
    const source: FilterOptionModel[] =
      fromLoaded ?? field.options ?? [];
    return source.map((o) => ({
      label: o.label,
      value: o.value,
      ...(o.prefixText ? { prefixText: o.prefixText } : {}),
      ...(o.prefixImageUrl ? { prefixImageUrl: o.prefixImageUrl } : {}),
    }));
  }

  protected optionErrorFor(key: string): string | null {
    return this.optionErrors()[key] ?? null;
  }

  protected optionLoadingFor(key: string): boolean {
    return this.optionLoading()[key] ?? false;
  }

  protected retryFieldOptions(key: string): void {
    const field = this.config.fields.find((f) => f.key === key);
    if (!field) {
      return;
    }
    this.optionLoadsStarted.delete(key);
    this.optionLists.update((lists) => {
      const next = { ...lists };
      delete next[key];
      return next;
    });
    this.optionErrors.update((errors) => ({ ...errors, [key]: null }));
    this.ensureFieldOptions(field);
  }

  private seedOptionLists(): Record<string, FilterOptionModel[]> {
    const lists: Record<string, FilterOptionModel[]> = {};
    for (const [key, rows] of Object.entries(this.data.optionLists ?? {})) {
      lists[key] = rows.map((row) => ({
        value: row.value,
        label: row.label,
        ...(row.prefixText ? { prefixText: row.prefixText } : {}),
        ...(row.prefixImageUrl ? { prefixImageUrl: row.prefixImageUrl } : {}),
      }));
    }
    return lists;
  }

  private ensureFieldOptionsByKey(key: string): void {
    const field = this.config.fields.find((f) => f.key === key);
    if (!field) {
      return;
    }
    this.ensureFieldOptions(field);
  }

  private ensureFieldOptions(field: FilterFieldModel): void {
    if (field.type !== 'select') {
      return;
    }
    if (field.options?.length) {
      return;
    }
    if (this.data.optionLists?.[field.key] !== undefined) {
      return;
    }
    if (
      field.optionsSource == null ||
      field.optionsSource === 'static' ||
      field.optionsSource === 'shipmentManifests'
    ) {
      return;
    }

    const key = field.key;
    if (this.optionLoadsStarted.has(key)) {
      return;
    }
    if (this.optionLists()[key] !== undefined && !this.optionErrors()[key]) {
      return;
    }

    this.optionLoadsStarted.add(key);
    this.optionLoading.update((m) => ({ ...m, [key]: true }));
    this.optionErrors.update((m) => ({ ...m, [key]: null }));

    this.filterOptions
      .resolveField(field)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          this.optionLists.update((m) => ({
            ...m,
            [key]: options.map((o) => ({
              value: o.value,
              label: o.label,
            })),
          }));
          this.optionLoading.update((m) => ({ ...m, [key]: false }));
        },
        error: (err) => {
          this.optionLoadsStarted.delete(key);
          this.optionErrors.update((m) => ({
            ...m,
            [key]: this.catalogErrorMessage(err),
          }));
          this.optionLoading.update((m) => ({ ...m, [key]: false }));
        },
      });
  }

  private catalogErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: unknown } | string | null;
      if (body && typeof body === 'object' && typeof body.message === 'string') {
        return body.message;
      }
      if (typeof body === 'string' && body.trim()) {
        return body.trim();
      }
      if (err.status === 401 || err.status === 403) {
        return 'Authentication failed. Check your access token.';
      }
    }
    if (typeof err === 'string' && err.trim()) {
      return err.trim();
    }
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg.trim();
      }
    }
    return 'Could not load options. Try again.';
  }

  protected selectedForField(
    field: FilterFieldModel,
  ): SelectOption<string> | null {
    const value = this.draft().values[field.key];
    if (value == null || value === '') {
      return null;
    }
    return (
      this.selectOptionsFor(field).find((o) => o.value === value) ?? {
        label: value,
        value,
      }
    );
  }

  protected toRadioOptions(
    options: FilterOptionModel[] | undefined,
  ): RadioOption<string>[] {
    return (options ?? []).map((o) => ({
      label: o.label,
      value: o.value,
    }));
  }

  protected onReset(): void {
    const next = resetFilterState(true, this.draft());
    this.draft.set(next);
    this.selectedKeys.set([]);
  }

  protected onApply(): void {
    if (this.applying()) {
      return;
    }

    const state = cloneFilterState(this.draft());
    state.page = 1;
    if (state.size == null) {
      state.size = this.filterQuery.read(this.config).size;
    }
    const params = toFilterParams(state, this.config);
    const result: FilterDrawerResult = { applied: true, state, params };
    const hook = this.data.onApply;

    if (!hook) {
      this.commitApply(result);
      return;
    }

    let pending: Observable<unknown> | Promise<unknown> | void;
    try {
      pending = hook({ state, params });
    } catch (err) {
      this.applyError.set(this.errorMessage(err));
      return;
    }

    if (pending == null) {
      this.commitApply(result);
      return;
    }

    this.applying.set(true);
    this.applyError.set(null);

    const succeed = (): void => {
      this.applying.set(false);
      this.commitApply(result);
    };
    const fail = (err: unknown): void => {
      this.applying.set(false);
      this.applyError.set(this.errorMessage(err));
    };

    if (isObservable(pending)) {
      pending.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => succeed(),
        error: fail,
      });
      return;
    }

    void Promise.resolve(pending).then(succeed, fail);
  }

  /**
   * Persist the applied bag to the URL, then close.
   *
   * @param result - Applied state + params.
   */
  private commitApply(result: FilterDrawerResult): void {
    void this.filterQuery.write(result.state, this.config);
    this.ref.close(result);
  }

  private errorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: unknown } | string | null;
      if (body && typeof body === 'object' && typeof body.message === 'string') {
        return body.message;
      }
      if (typeof body === 'string' && body.trim()) {
        return body.trim();
      }
      if (err.status === 0) {
        return 'Network error. Check your connection and try again.';
      }
      if (err.status === 401 || err.status === 403) {
        return 'Authentication failed. Check your access token and try again.';
      }
      if (err.status >= 500) {
        return 'Server error. Try again in a moment.';
      }
      return err.message || `Request failed (${err.status}).`;
    }
    if (typeof err === 'string' && err.trim()) {
      return err.trim();
    }
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg.trim();
      }
    }
    return 'Could not apply filters. Try again.';
  }
}
