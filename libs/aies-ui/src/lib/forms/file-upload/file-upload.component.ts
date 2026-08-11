import { AiesIconComponent } from '@aies/aies-icons';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { ButtonComponent } from '../../button/button.component';
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';

/**
 * One selected file with optional image preview metadata.
 */
export interface FileUploadResult {
  /** Original {@link File} from the picker / camera. */
  file: File;
  /**
   * Object URL for image previews only (`URL.createObjectURL`).
   * Non-images use `null` — revoke on destroy via the component.
   */
  previewUrl: string | null;
  /** True when `file.type` starts with `image/`. */
  isImage: boolean;
}

let nextFileUploadId = 0;

/**
 * File / camera picker following `libs/aies-ui/docs/form-controls.md` where
 * applicable (label, hint, field-level `error`).
 *
 * **Prefix/suffix slots are N/A** — this control is a drop zone / trigger set,
 * not a text field with affixes.
 *
 * Allowed types come from the native `accept` attribute (e.g. `image/*,.pdf`),
 * not a separate SDK enum. Object URLs are revoked in `ngOnDestroy`.
 *
 * @example
 * ```html
 * <!-- KYC: images + PDF, with type-aware preview -->
 * <aies-file-upload
 *   label="Identity document"
 *   accept="image/*,.pdf"
 *   [allowCamera]="true"
 *   [multiple]="false"
 *   (filesSelected)="onFiles($event)"
 * />
 * ```
 * ```ts
 * onFiles(files: FileUploadResult[]): void {
 *   for (const f of files) {
 *     if (f.isImage && f.previewUrl) {
 *       // show <img [src]="f.previewUrl" />
 *     } else {
 *       // show aies-icon + f.file.name / size
 *     }
 *   }
 * }
 * ```
 */
@Component({
  selector: 'aies-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, ButtonComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-2">
      <span [class]="labelClass">{{ label() }}</span>

      <div
        class="rounded-md border border-dashed border-border bg-background-welcome p-4 dark:border-white/15 dark:bg-ink-950"
        [class.!border-danger]="!!error()"
        [class.dark:!border-danger]="!!error()"
        [class.opacity-50]="disabled()"
        [class.cursor-not-allowed]="disabled()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
      >
        <div class="flex flex-wrap gap-2">
          @if (allowFileSelect()) {
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              [disabled]="disabled()"
              (click)="openFilePicker()"
            >
              <aies-icon name="upload" [size]="16" />
              Choose files
            </button>
          }
          @if (allowCamera()) {
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              [disabled]="disabled()"
              (click)="openCamera()"
            >
              <aies-icon name="camera" [size]="16" />
              Camera
            </button>
          }
        </div>

        @if (results().length) {
          <ul class="mt-3 m-0 p-0 list-none flex flex-col gap-2">
            @for (item of results(); track trackResult(item)) {
              <li
                class="flex items-center gap-3 rounded-md bg-white dark:bg-ink-950 border border-border p-2"
              >
                @if (item.isImage && item.previewUrl) {
                  <img
                    [src]="item.previewUrl"
                    [alt]="item.file.name"
                    class="size-12 rounded object-cover shrink-0"
                  />
                } @else {
                  <aies-icon
                    name="file"
                    [size]="28"
                    class="text-neutral-600 shrink-0"
                  />
                }
                <div class="min-w-0 flex-1">
                  <p class="m-0 text-body-sm text-ink dark:text-white truncate">
                    {{ item.file.name }}
                  </p>
                  <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
                    {{ formatSize(item.file.size) }}
                  </p>
                </div>
              </li>
            }
          </ul>
        }
      </div>

      @if (error(); as err) {
        <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
      } @else if (hint(); as h) {
        <p [id]="hintId" [class]="hintClass">{{ h }}</p>
      }
    </div>

    <input
      #fileInput
      class="sr-only"
      type="file"
      [attr.accept]="accept() || null"
      [attr.multiple]="multiple() ? true : null"
      [disabled]="disabled()"
      (change)="onNativeChange($event)"
    />
    <input
      #cameraInput
      class="sr-only"
      type="file"
      accept="image/*"
      capture="environment"
      [disabled]="disabled()"
      (change)="onNativeChange($event)"
    />
  `,
})
export class FileUploadComponent implements ControlValueAccessor, OnDestroy {
  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly cameraInput =
    viewChild<ElementRef<HTMLInputElement>>('cameraInput');

  protected readonly controlId = `aies-file-upload-${++nextFileUploadId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  /** Visible field label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /**
   * Passed to the native file input `accept` (e.g. `image/*,.pdf`).
   */
  readonly accept = input('');

  /** Show the file-picker trigger. Defaults to true. */
  readonly allowFileSelect = input(true, { transform: booleanAttribute });

  /**
   * Show a camera trigger backed by a hidden
   * `<input type="file" capture="environment">` so mobile browsers open the
   * native camera. Defaults to true.
   */
  readonly allowCamera = input(true, { transform: booleanAttribute });

  /** Allow selecting more than one file. Defaults to false. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * Emitted whenever the user picks files (after object URLs are created for
   * images).
   */
  readonly filesSelected = output<FileUploadResult[]>();

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly results = signal<FileUploadResult[]>([]);
  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
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

  private onChange: (value: FileUploadResult[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /**
   * Revokes any outstanding image object URLs to avoid leaks when this control
   * handles many files over its lifetime.
   */
  ngOnDestroy(): void {
    this.revokeAll(this.results());
  }

  /** @param value - Prior results from the form model (URLs should already exist). */
  writeValue(value: FileUploadResult[] | null): void {
    this.revokeAll(this.results());
    this.results.set(value ?? []);
  }

  /** @param fn - Files change callback. */
  registerOnChange(fn: (value: FileUploadResult[]) => void): void {
    this.onChange = fn;
  }

  /** @param fn - Touched callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @param isDisabled - Blocks picking when true. */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected openFilePicker(): void {
    if (this.disabled()) {
      return;
    }
    this.fileInput()?.nativeElement.click();
  }

  protected openCamera(): void {
    if (this.disabled()) {
      return;
    }
    this.cameraInput()?.nativeElement.click();
  }

  protected onNativeChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';
    if (!files.length) {
      return;
    }

    const mapped = files.map((file) => this.toResult(file));
    const next = this.multiple() ? [...this.results(), ...mapped] : mapped;

    if (!this.multiple()) {
      this.revokeAll(this.results());
    }

    this.results.set(next);
    this.filesSelected.emit(next);
    this.onChange(next);
    this.onTouched();
  }

  protected trackResult(item: FileUploadResult): string {
    return `${item.file.name}:${item.file.size}:${item.file.lastModified}`;
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private toResult(file: File): FileUploadResult {
    const isImage = file.type.startsWith('image/');
    return {
      file,
      isImage,
      previewUrl: isImage ? URL.createObjectURL(file) : null,
    };
  }

  private revokeAll(items: FileUploadResult[]): void {
    for (const item of items) {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    }
  }
}
