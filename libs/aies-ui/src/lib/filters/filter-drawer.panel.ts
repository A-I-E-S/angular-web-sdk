import { AiesIconComponent } from '@aies/aies-icons';
import type {
  FilterField,
  FilterOption,
  FilterState,
} from '@aies/aies-models';
import {
  cloneFilterState,
  resetFilterState,
  toFilterParams,
} from '@aies/aies-models';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

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

/**
 * Schema-driven filter drawer body.
 *
 * Opened via {@link FilterDrawerService} (or {@link DrawerService} with this
 * component). Edits a cloned {@link FilterState}; Apply serializes with
 * {@link toFilterParams} and closes with {@link FilterDrawerResult}.
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
            {{ config.id }} · {{ config.transport }}
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
              [options]="dateFieldOptions()"
              [selected]="selectedDateField()"
              (selectedChange)="onDateFieldChange($event)"
            />
            <div class="grid grid-cols-2 gap-3">
              <aies-date-picker
                label="From"
                [value]="draft().from ?? null"
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
            [searchable]="config.fields.length > 6"
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
                        class="rounded-md border px-2.5 py-1.5 text-body-sm transition-colors"
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
                    [placeholder]="field.placeholder ?? 'Select…'"
                    [options]="selectOptionsFor(field)"
                    [selected]="selectedForField(field)"
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
        class="flex shrink-0 gap-2 border-t border-border bg-white px-6 pt-3 pb-2 dark:border-white/10 dark:bg-ink-950"
      >
        <button
          aies-button
          type="button"
          variant="ghost"
          class="flex-1"
          (click)="onReset()"
        >
          Reset
        </button>
        <button
          aies-button
          type="button"
          variant="primary"
          class="flex-1"
          (click)="onApply()"
        >
          Apply
        </button>
      </div>
    </div>
  `,
})
export class FilterDrawerPanel {
  protected readonly data = inject<FilterDrawerData>(OVERLAY_DATA);
  protected readonly ref = inject(AiesOverlayRef<FilterDrawerResult>);

  protected readonly config = this.data.config;
  protected readonly title = computed(
    () => this.data.title ?? 'Filters',
  );

  /** Local edit buffer — host state only updates on Apply. */
  protected readonly draft = signal<FilterState>(
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
      const to =
        from && s.to && s.to < from ? undefined : s.to;
      return { ...s, from, to };
    });
  }

  protected patchTo(value: string | null): void {
    this.draft.update((s) => ({ ...s, to: value ?? undefined }));
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

  protected selectOptionsFor(field: FilterField): SelectOption<string>[] {
    const fromHost = this.data.optionLists?.[field.key];
    const source: FilterOption[] =
      fromHost ?? field.options ?? [];
    return source.map((o) => ({ label: o.label, value: o.value }));
  }

  protected selectedForField(
    field: FilterField,
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
    options: FilterOption[] | undefined,
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
    const state = this.draft();
    const params = toFilterParams(state, this.config);
    this.ref.close({ applied: true, state, params });
  }
}
