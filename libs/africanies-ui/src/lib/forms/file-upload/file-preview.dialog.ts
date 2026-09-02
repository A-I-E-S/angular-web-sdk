import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import { ButtonComponent } from '../../button/button.component';
import { AfricaniesOverlayRef } from '../../overlay/africanies-overlay-ref';
import { OVERLAY_DATA } from '../../overlay/overlay-data.token';

/** Payload for {@link FilePreviewDialogComponent}. */
export interface FilePreviewData {
  file: File;
  previewUrl: string | null;
  isImage: boolean;
}

type PreviewKind = 'image' | 'unavailable';

/**
 * Large-file preview modal for {@link FileUploadComponent}.
 *
 * Local image picks render inline. Other local file types (PDF, etc.) show a
 * clear “can’t view” message — server-hosted previews use other modals.
 * Object URLs created here are revoked on destroy; the list’s image
 * `previewUrl` is left alone.
 */
@Component({
  selector: 'africanies-file-preview-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, ButtonComponent],
  host: {
    class: 'flex min-h-0 w-full flex-col overflow-hidden',
  },
  template: `
    <div
      class="flex min-h-0 w-full flex-1 flex-col"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
    >
      <div class="flex shrink-0 items-start justify-between gap-3 pb-4">
        <div class="min-w-0">
          <h2
            [id]="titleId"
            class="m-0 truncate text-heading-3 font-semibold text-ink dark:text-white"
          >
            {{ data.file.name }}
          </h2>
          <p class="m-0 mt-1 text-body-sm text-neutral-600 dark:text-neutral-400">
            {{ sizeLabel() }}
            @if (data.file.type) {
              <span> · {{ data.file.type }}</span>
            }
          </p>
        </div>
        <button
          africanies-button
          type="button"
          variant="ghost"
          size="sm"
          class="!px-2"
          aria-label="Close preview"
          (click)="close()"
        >
          <africanies-icon name="close" [size]="16" />
        </button>
      </div>

      <div class="africanies-overlay-scroll min-h-0 flex-1 overflow-y-auto">
        @if (kind() === 'image') {
          <img
            [src]="src()"
            [alt]="data.file.name"
            class="max-h-[min(70vh,40rem)] w-full rounded-md object-contain bg-background-welcome ring-1 ring-border dark:bg-ink-950 dark:ring-white/15"
          />
        } @else {
          <div
            class="flex flex-col items-center gap-3 rounded-md bg-background-welcome px-6 py-10 text-center ring-1 ring-border dark:bg-white/5 dark:ring-white/15"
          >
            <africanies-icon name="eye-slash" [size]="32" class="text-neutral-500" />
            <p class="m-0 text-body font-medium text-ink dark:text-white">
              Preview not available
            </p>
            <p class="m-0 max-w-sm text-body-sm text-neutral-600 dark:text-neutral-400">
              You can’t view this file here. Only images can be previewed before
              upload.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class FilePreviewDialogComponent {
  protected readonly data = inject<FilePreviewData>(OVERLAY_DATA);
  private readonly ref = inject(AfricaniesOverlayRef<void>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly titleId = `africanies-file-preview-${Math.random().toString(36).slice(2, 10)}`;

  private readonly ownedUrl: string | null;

  constructor() {
    this.ownedUrl =
      this.data.isImage && !this.data.previewUrl
        ? URL.createObjectURL(this.data.file)
        : null;
    this.destroyRef.onDestroy(() => {
      if (this.ownedUrl) {
        URL.revokeObjectURL(this.ownedUrl);
      }
    });
  }

  protected readonly src = computed(
    () => this.data.previewUrl ?? this.ownedUrl ?? '',
  );

  protected readonly kind = computed((): PreviewKind => {
    const type = (this.data.file.type || '').toLowerCase();
    if (this.data.isImage || type.startsWith('image/')) {
      return 'image';
    }
    return 'unavailable';
  });

  protected sizeLabel(): string {
    const bytes = this.data.file.size;
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected close(): void {
    this.ref.close();
  }
}
