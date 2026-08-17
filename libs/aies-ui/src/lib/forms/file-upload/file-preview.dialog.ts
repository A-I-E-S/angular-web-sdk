import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';

import { ButtonComponent } from '../../button/button.component';
import { AiesOverlayRef } from '../../overlay/aies-overlay-ref';
import { OVERLAY_DATA } from '../../overlay/overlay-data.token';

/** Payload for {@link FilePreviewDialogComponent}. */
export interface FilePreviewData {
  file: File;
  previewUrl: string | null;
  isImage: boolean;
}

type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'other';

/**
 * Large-file preview modal for {@link FileUploadComponent}.
 *
 * Images, PDFs, and media render inline. Other types show metadata and an
 * open-in-new-tab action. Object URLs created here are revoked on destroy;
 * the list’s image `previewUrl` is left alone.
 */
@Component({
  selector: 'aies-file-preview-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, ButtonComponent],
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
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          class="!px-2"
          aria-label="Close preview"
          (click)="close()"
        >
          <aies-icon name="close" [size]="16" />
        </button>
      </div>

      <div class="aies-overlay-scroll min-h-0 flex-1 overflow-y-auto">
      @switch (kind()) {
        @case ('image') {
          <img
            [src]="src()"
            [alt]="data.file.name"
            class="max-h-[min(70vh,40rem)] w-full rounded-md object-contain bg-background-welcome ring-1 ring-border dark:bg-ink dark:ring-white/15"
          />
        }
        @case ('pdf') {
          <iframe
            [src]="src()"
            [title]="data.file.name"
            class="h-[min(70vh,40rem)] w-full rounded-md bg-white ring-1 ring-border dark:ring-white/15"
          ></iframe>
        }
        @case ('video') {
          <video
            [src]="src()"
            controls
            class="max-h-[min(70vh,40rem)] w-full rounded-md bg-ink-950 ring-1 ring-border dark:ring-white/15"
          ></video>
        }
        @case ('audio') {
          <audio [src]="src()" controls class="w-full"></audio>
        }
        @default {
          <div
            class="flex flex-col items-center gap-3 rounded-md bg-background-welcome px-6 py-10 text-center ring-1 ring-border dark:bg-white/5 dark:ring-white/15"
          >
            <aies-icon name="file" [size]="32" class="text-neutral-500" />
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              No inline preview for this file type.
            </p>
            <a
              aies-button
              variant="secondary"
              size="sm"
              [href]="src()"
              target="_blank"
              rel="noopener"
            >
              <aies-icon name="external-link" [size]="16" />
              Open file
            </a>
          </div>
        }
      }
      </div>
    </div>
  `,
})
export class FilePreviewDialogComponent {
  protected readonly data = inject<FilePreviewData>(OVERLAY_DATA);
  private readonly ref = inject(AiesOverlayRef<void>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly titleId = `aies-file-preview-${Math.random().toString(36).slice(2, 10)}`;

  private readonly ownedUrl: string | null;

  constructor() {
    this.ownedUrl = this.data.previewUrl
      ? null
      : URL.createObjectURL(this.data.file);
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
    const file = this.data.file;
    const type = (file.type || '').toLowerCase();
    const name = file.name.toLowerCase();
    if (this.data.isImage || type.startsWith('image/')) {
      return 'image';
    }
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (type.startsWith('video/')) {
      return 'video';
    }
    if (type.startsWith('audio/')) {
      return 'audio';
    }
    return 'other';
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
