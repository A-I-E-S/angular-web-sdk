import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { AiesIconComponent, type IconName } from '@aies/aies-icons';

import { ButtonComponent } from '../../button/button.component';
import { ModalService } from '../../overlay/modal.service';
import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';
import { CameraCaptureDialogComponent } from './camera-capture.dialog';
import {
  acceptLabels,
  fileExtensionLabel,
  fileMatchesAccept,
} from './file-accept';
import { FilePreviewDialogComponent } from './file-preview.dialog';

/**
 * Visual layout for {@link FileUploadComponent}.
 *
 * - `dropzone` — large drag target with icon, copy, and accept chips (default)
 * - `button` — compact trigger buttons inside a bordered panel
 * - `compact` — single-row inline control for dense forms
 */
export type FileUploadVariant = 'dropzone' | 'button' | 'compact';

/**
 * One selected file with optional image preview metadata.
 */
export interface FileUploadResult {
  /** Original {@link File} from the picker / camera / drop. */
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
 * File / camera / drag-and-drop picker following the shared AIES form field pattern.
 *
 * **Prefix/suffix slots are N/A** — drop zone / trigger set, not a text field.
 *
 * Allowed types come from the native `accept` attribute (e.g. `image/*,.pdf`).
 * Invalid picks are skipped and a short reject message is shown. Object URLs
 * are revoked in `ngOnDestroy` and when items are removed. Each added file
 * has an underlined **View** action that opens a larger preview.
 *
 * **Camera** opens a live `getUserMedia` modal when overlays are registered;
 * otherwise falls back to `<input capture="environment">`.
 *
 * @example
 * ```html
 * <aies-file-upload
 *   variant="dropzone"
 *   label="Identity document"
 *   accept="image/*,.pdf"
 *   [allowCamera]="true"
 *   [multiple]="true"
 *   (filesSelected)="onFiles($event)"
 * />
 * ```
 */
@Component({
  selector: 'aies-file-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, ButtonComponent, NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  host: {
    class: 'block',
  },
  template: `
    <div class="flex flex-col gap-2">
      @if (label()) {
        <span [class]="labelClass">{{ label() }}</span>
      }

      @switch (variant()) {
        @case ('button') {
          <div
            [class]="panelClass()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy()"
            (dragenter)="onDragEnter($event)"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <div class="flex flex-wrap items-center gap-2">
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
                  {{ chooseLabel() }}
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
              @if (acceptChips().length) {
                <div class="flex flex-wrap gap-1.5">
                  @for (chip of acceptChips(); track chip) {
                    <span [class]="chipClass">{{ chip }}</span>
                  }
                </div>
              }
            </div>
            <p class="m-0 mt-2 text-caption text-neutral-600 dark:text-neutral-400">
              {{ dropHint() }}
            </p>
            <ng-container [ngTemplateOutlet]="fileList" />
          </div>
        }
        @case ('compact') {
          <div
            [class]="compactClass()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy()"
            (dragenter)="onDragEnter($event)"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <aies-icon
              name="cloud-upload"
              [size]="20"
              class="shrink-0 text-neutral-600 dark:text-neutral-400"
            />
            <div class="min-w-0 flex-1">
              <p class="m-0 text-body-sm text-ink dark:text-white">
                {{ dropTitle() }}
              </p>
              @if (acceptChips().length) {
                <div class="mt-1 flex flex-wrap gap-1">
                  @for (chip of acceptChips(); track chip) {
                    <span [class]="chipClass">{{ chip }}</span>
                  }
                </div>
              }
            </div>
            <div class="flex shrink-0 flex-wrap gap-1.5">
              @if (allowFileSelect()) {
                <button
                  aies-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="disabled()"
                  (click)="openFilePicker()"
                >
                  Browse
                </button>
              }
              @if (allowCamera()) {
                <button
                  aies-button
                  type="button"
                  variant="ghost"
                  size="sm"
                  [disabled]="disabled()"
                  (click)="openCamera()"
                >
                  <aies-icon name="camera" [size]="16" />
                </button>
              }
            </div>
          </div>
          <ng-container [ngTemplateOutlet]="fileList" />
        }
        @default {
          <div
            [class]="dropzoneClass()"
            role="button"
            tabindex="0"
            [attr.aria-disabled]="disabled() ? true : null"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy()"
            (click)="onDropzoneActivate($event)"
            (keydown.enter)="onDropzoneActivate($event)"
            (keydown.space)="onDropzoneActivate($event)"
            (dragenter)="onDragEnter($event)"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            <div
              class="pointer-events-none flex flex-col items-center gap-3 text-center"
            >
              <span
                class="inline-flex size-12 items-center justify-center rounded-full bg-background-welcome text-ink shadow-sm ring-1 ring-border dark:bg-white/10 dark:text-white dark:ring-white/15"
              >
                <aies-icon name="cloud-upload" [size]="24" />
              </span>
              <div class="flex flex-col gap-1">
                <p class="m-0 text-body font-medium text-ink dark:text-white">
                  {{ dropTitle() }}
                </p>
                <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
                  {{ dropHint() }}
                </p>
              </div>
              @if (acceptChips().length) {
                <div class="flex flex-wrap justify-center gap-1.5">
                  @for (chip of acceptChips(); track chip) {
                    <span [class]="chipClass">{{ chip }}</span>
                  }
                </div>
              }
            </div>
            <div class="pointer-events-auto mt-4 flex flex-wrap justify-center gap-2">
              @if (allowFileSelect()) {
                <button
                  aies-button
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="disabled()"
                  (click)="openFilePicker(); $event.stopPropagation()"
                >
                  <aies-icon name="upload" [size]="16" />
                  {{ chooseLabel() }}
                </button>
              }
              @if (allowCamera()) {
                <button
                  aies-button
                  type="button"
                  variant="ghost"
                  size="sm"
                  [disabled]="disabled()"
                  (click)="openCamera(); $event.stopPropagation()"
                >
                  <aies-icon name="camera" [size]="16" />
                  Camera
                </button>
              }
            </div>
          </div>
          <ng-container [ngTemplateOutlet]="fileList" />
        }
      }

      @if (rejectMessage(); as reject) {
        <p class="m-0 text-body-sm text-danger" role="status">{{ reject }}</p>
      }
      @if (error(); as err) {
        <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
      } @else if (hint(); as h) {
        <p [id]="hintId" [class]="hintClass">{{ h }}</p>
      }
    </div>

    <ng-template #fileList>
      @if (results().length) {
        <ul
          class="m-0 flex list-none flex-col gap-2 p-0"
          [class.mt-3]="variant() !== 'compact'"
          [class.mt-2]="variant() === 'compact'"
        >
          @for (item of results(); track trackResult(item); let i = $index) {
            <li [class]="fileRowClass()">
              @if (item.isImage && item.previewUrl) {
                <img
                  [src]="item.previewUrl"
                  [alt]="item.file.name"
                  class="size-12 shrink-0 rounded-md object-cover ring-1 ring-border dark:ring-white/15"
                />
              } @else {
                <div
                  class="relative flex size-12 shrink-0 items-center justify-center rounded-md bg-background-welcome text-neutral-600 ring-1 ring-border dark:bg-white/10 dark:text-neutral-300 dark:ring-white/15"
                >
                  <aies-icon [name]="nonImageIcon(item.file)" [size]="22" />
                  @if (extensionOf(item.file); as ext) {
                    <span
                      class="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-ink px-1 py-px text-[10px] font-semibold uppercase leading-none tracking-wide text-white dark:bg-white/20 dark:text-white"
                    >
                      {{ ext }}
                    </span>
                  }
                </div>
              }
              <div class="min-w-0 flex-1">
                <p class="m-0 truncate text-body-sm font-medium text-ink dark:text-white">
                  {{ item.file.name }}
                </p>
                <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
                  {{ formatSize(item.file.size) }}
                  @if (!item.isImage) {
                    <span> · {{ kindLabel(item.file) }}</span>
                  }
                  <span> · </span>
                  <button
                    type="button"
                    class="bg-transparent p-0 text-caption font-medium text-ink underline underline-offset-2 hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-white dark:hover:text-neutral-200"
                    (click)="openPreview(item); $event.stopPropagation()"
                  >
                    View
                  </button>
                </p>
              </div>
              <button
                aies-button
                type="button"
                variant="ghost"
                size="sm"
                class="!px-2"
                [disabled]="disabled()"
                [attr.aria-label]="'Remove ' + item.file.name"
                (click)="removeAt(i)"
              >
                <aies-icon name="close" [size]="16" />
              </button>
            </li>
          }
        </ul>
      }
    </ng-template>

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
  private readonly destroyRef = inject(DestroyRef);
  /** Optional so the control still works when overlays are not registered. */
  private readonly modal = inject(ModalService, { optional: true });

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
  protected readonly chipClass =
    'inline-flex items-center rounded-full border border-neutral-300 bg-background-welcome px-2 py-0.5 text-caption font-medium text-neutral-600 dark:border-white/20 dark:bg-white/10 dark:text-neutral-300';

  /** Visible field label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /**
   * Layout variant. Defaults to `dropzone`.
   */
  readonly variant = input<FileUploadVariant>('dropzone');

  /**
   * Passed to the native file input `accept` (e.g. `image/*,.pdf`).
   * Also drives accept chips and drop/picker filtering.
   */
  readonly accept = input('');

  /** Show the file-picker trigger. Defaults to true. */
  readonly allowFileSelect = input(true, { transform: booleanAttribute });

  /**
   * Show a camera trigger. Opens a live `getUserMedia` modal when
   * {@link ModalService} is available; otherwise falls back to a hidden
   * `<input type="file" capture="environment">`. Defaults to true.
   */
  readonly allowCamera = input(true, { transform: booleanAttribute });

  /** Allow selecting more than one file. Defaults to false. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * Emitted whenever the selection changes (after object URLs are created for
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
  protected readonly dragDepth = signal(0);
  protected readonly rejectMessage = signal<string | null>(null);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );
  protected readonly dragging = computed(() => this.dragDepth() > 0);

  protected readonly acceptChips = computed(() => acceptLabels(this.accept()));

  protected readonly chooseLabel = computed(() =>
    this.multiple() ? 'Choose files' : 'Choose file',
  );

  protected readonly dropTitle = computed(() =>
    this.multiple()
      ? 'Drag & drop files here'
      : 'Drag & drop a file here',
  );

  protected readonly dropHint = computed(() =>
    this.multiple()
      ? 'or click to browse — multiple files allowed'
      : 'or click to browse — one file only',
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

  protected readonly panelClass = computed(() => {
    let classes =
      'rounded-md border border-dashed border-neutral-400 bg-background-welcome p-4 transition-colors dark:border-white/20 dark:bg-white/[0.03]';
    if (this.dragging()) {
      classes +=
        ' border-ink bg-white dark:border-white dark:bg-white/10 ring-2 ring-ink/10 dark:ring-white/20';
    }
    if (this.error()) {
      classes += ' !border-danger dark:!border-danger';
    }
    if (this.disabled()) {
      classes += ' cursor-not-allowed opacity-50';
    }
    return classes;
  });

  protected readonly dropzoneClass = computed(() => {
    let classes =
      'rounded-lg border-2 border-dashed border-neutral-400 bg-background-welcome px-4 py-8 transition-colors dark:border-white/20 dark:bg-white/[0.03]';
    if (!this.disabled()) {
      classes += ' cursor-pointer hover:border-neutral-600 dark:hover:border-white/40';
    }
    if (this.dragging()) {
      classes +=
        ' border-ink bg-white dark:border-white dark:bg-white/10 ring-2 ring-ink/10 dark:ring-white/20';
    }
    if (this.error()) {
      classes += ' !border-danger dark:!border-danger';
    }
    if (this.disabled()) {
      classes += ' cursor-not-allowed opacity-50';
    }
    return classes;
  });

  protected readonly compactClass = computed(() => {
    let classes =
      'flex items-center gap-3 rounded-md border border-dashed border-neutral-400 bg-background-welcome px-3 py-2.5 transition-colors dark:border-white/20 dark:bg-white/[0.03]';
    if (this.dragging()) {
      classes +=
        ' border-ink bg-white dark:border-white dark:bg-white/10 ring-2 ring-ink/10 dark:ring-white/20';
    }
    if (this.error()) {
      classes += ' !border-danger dark:!border-danger';
    }
    if (this.disabled()) {
      classes += ' cursor-not-allowed opacity-50';
    }
    return classes;
  });

  protected readonly fileRowClass = computed(
    () =>
      'flex items-center gap-3 rounded-md border border-border bg-white p-2 dark:border-white/15 dark:bg-white/[0.04]',
  );

  private onChange: (value: FileUploadResult[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private rejectClearTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearRejectTimer());
  }

  /**
   * Revokes any outstanding image object URLs to avoid leaks when this control
   * handles many files over its lifetime.
   */
  ngOnDestroy(): void {
    this.revokeAll(this.results());
    this.clearRejectTimer();
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

    const canUseLiveCamera =
      !!this.modal &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia;

    if (!canUseLiveCamera || !this.modal) {
      this.cameraInput()?.nativeElement.click();
      return;
    }

    this.modal
      .open<void, File>(CameraCaptureDialogComponent, { dismissible: true })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((file) => {
        if (file) {
          this.commitFiles([file]);
        }
      });
  }

  protected onDropzoneActivate(event: Event): void {
    if (this.disabled() || !this.allowFileSelect()) {
      return;
    }
    event.preventDefault();
    this.openFilePicker();
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.disabled() || !this.hasFilePayload(event)) {
      return;
    }
    event.preventDefault();
    this.dragDepth.update((n) => n + 1);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled() || !this.hasFilePayload(event)) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  protected onDragLeave(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragDepth.update((n) => Math.max(0, n - 1));
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth.set(0);
    if (this.disabled()) {
      return;
    }
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (!files.length) {
      return;
    }
    this.commitFiles(files);
  }

  protected onNativeChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';
    if (!files.length) {
      return;
    }
    this.commitFiles(files);
  }

  protected openPreview(item: FileUploadResult): void {
    if (this.modal) {
      this.modal.open(FilePreviewDialogComponent, {
        dismissible: true,
        data: item,
        panelClass: [
          '!max-w-4xl',
          '!w-[min(100vw-2rem,56rem)]',
        ],
      });
      return;
    }

    const url = item.previewUrl ?? URL.createObjectURL(item.file);
    window.open(url, '_blank', 'noopener');
    if (!item.previewUrl) {
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  }

  protected removeAt(index: number): void {
    if (this.disabled()) {
      return;
    }
    const current = this.results();
    const target = current[index];
    if (!target) {
      return;
    }
    if (target.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const next = current.filter((_, i) => i !== index);
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

  protected extensionOf(file: File): string {
    return fileExtensionLabel(file.name);
  }

  protected nonImageIcon(file: File): IconName {
    const type = (file.type || '').toLowerCase();
    const name = file.name.toLowerCase();
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'file-text';
    }
    if (
      type.includes('zip') ||
      name.endsWith('.zip') ||
      name.endsWith('.rar')
    ) {
      return 'file-zip';
    }
    if (type.startsWith('video/') || name.match(/\.(mp4|mov|webm)$/)) {
      return 'file-movie';
    }
    if (type.startsWith('audio/') || name.match(/\.(mp3|wav|ogg)$/)) {
      return 'file-sound';
    }
    if (
      type.includes('sheet') ||
      type.includes('excel') ||
      name.match(/\.(xlsx|xls|csv)$/)
    ) {
      return 'file-table';
    }
    if (type.startsWith('text/') || name.match(/\.(txt|md|csv)$/)) {
      return 'file-text-o';
    }
    if (name.match(/\.(js|ts|json|html|css|xml)$/)) {
      return 'file-code';
    }
    return 'file';
  }

  protected kindLabel(file: File): string {
    const ext = fileExtensionLabel(file.name);
    if (ext) {
      return `${ext} file`;
    }
    if (file.type) {
      return file.type;
    }
    return 'File';
  }

  private commitFiles(files: File[]): void {
    const accept = this.accept();
    const accepted = files.filter((f) => fileMatchesAccept(f, accept));
    const rejectedCount = files.length - accepted.length;

    if (rejectedCount > 0) {
      const chips = acceptLabels(accept);
      const allowed = chips.length ? chips.join(', ') : 'the allowed types';
      this.showReject(
        rejectedCount === 1
          ? `1 file was skipped. Only ${allowed} allowed.`
          : `${rejectedCount} files were skipped. Only ${allowed} allowed.`,
      );
    } else {
      this.rejectMessage.set(null);
    }

    if (!accepted.length) {
      this.onTouched();
      return;
    }

    let incoming = accepted;
    if (!this.multiple()) {
      incoming = accepted.slice(0, 1);
    }

    const mapped = incoming.map((file) => this.toResult(file));
    const next = this.multiple() ? [...this.results(), ...mapped] : mapped;

    if (!this.multiple()) {
      this.revokeAll(this.results());
    }

    this.results.set(next);
    this.filesSelected.emit(next);
    this.onChange(next);
    this.onTouched();
  }

  private showReject(message: string): void {
    this.rejectMessage.set(message);
    this.clearRejectTimer();
    this.rejectClearTimer = setTimeout(() => {
      this.rejectMessage.set(null);
      this.rejectClearTimer = null;
    }, 6000);
  }

  private clearRejectTimer(): void {
    if (this.rejectClearTimer) {
      clearTimeout(this.rejectClearTimer);
      this.rejectClearTimer = null;
    }
  }

  private hasFilePayload(event: DragEvent): boolean {
    const types = event.dataTransfer?.types;
    if (!types) {
      return false;
    }
    return Array.from(types).includes('Files');
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
