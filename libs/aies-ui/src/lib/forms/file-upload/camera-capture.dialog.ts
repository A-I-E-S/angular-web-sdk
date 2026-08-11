import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';

import { ButtonComponent } from '../../button/button.component';
import { AiesOverlayRef } from '../../overlay/aies-overlay-ref';

type CameraFacing = 'environment' | 'user';

/**
 * Live webcam capture dialog for {@link FileUploadComponent}.
 *
 * Uses `navigator.mediaDevices.getUserMedia` so desktop playgrounds and
 * HTTPS apps can take a photo without relying on the mobile-only
 * `<input capture>` attribute. Closes with a JPEG {@link File}, or
 * `undefined` when dismissed.
 *
 * Prefer opening via {@link ModalService} so the stream is owned by this
 * dialog and torn down on close / destroy.
 */
@Component({
  selector: 'aies-camera-capture-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, ButtonComponent],
  template: `
    <div
      class="flex w-full flex-col gap-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="error() ? errorId : hintId"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2
            [id]="titleId"
            class="m-0 text-heading-3 font-semibold text-ink dark:text-white"
          >
            Take a photo
          </h2>
          <p
            [id]="hintId"
            class="m-0 mt-1 text-body-sm text-neutral-600 dark:text-neutral-400"
          >
            Allow camera access, then capture when ready.
          </p>
        </div>
        <button
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          class="!px-2"
          [disabled]="!streamActive()"
          [attr.aria-label]="'Switch camera'"
          (click)="switchFacing()"
        >
          <aies-icon name="refresh" [size]="16" />
        </button>
      </div>

      @if (error(); as err) {
        <p [id]="errorId" class="m-0 text-body-sm text-danger" role="alert">
          {{ err }}
        </p>
      } @else {
        <div
          class="relative aspect-video w-full min-h-[12rem] overflow-hidden rounded-md bg-ink-950 ring-1 ring-border dark:ring-white/15"
        >
          <video
            #preview
            class="size-full object-cover"
            autoplay
            playsinline
            muted
          ></video>
          @if (starting()) {
            <p
              class="absolute inset-0 m-0 flex items-center justify-center bg-ink/50 text-body-sm text-white"
            >
              Starting camera…
            </p>
          }
        </div>
      }

      <div class="flex flex-wrap justify-end gap-2">
        <button aies-button type="button" variant="ghost" (click)="cancel()">
          Cancel
        </button>
        <button
          aies-button
          type="button"
          variant="primary"
          [disabled]="!streamActive() || capturing()"
          (click)="capture()"
        >
          <aies-icon name="camera" [size]="16" />
          Capture
        </button>
      </div>

      <canvas #snapshot class="sr-only" aria-hidden="true"></canvas>
    </div>
  `,
})
export class CameraCaptureDialogComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ref = inject(AiesOverlayRef<File>);

  private readonly preview =
    viewChild<ElementRef<HTMLVideoElement>>('preview');
  private readonly snapshot =
    viewChild<ElementRef<HTMLCanvasElement>>('snapshot');

  protected readonly titleId = `aies-camera-title-${Math.random().toString(36).slice(2, 10)}`;
  protected readonly hintId = `${this.titleId}-hint`;
  protected readonly errorId = `${this.titleId}-error`;

  protected readonly starting = signal(true);
  protected readonly capturing = signal(false);
  protected readonly streamActive = signal(false);
  protected readonly error = signal<string | null>(null);

  private stream: MediaStream | null = null;
  private facing: CameraFacing = 'environment';

  constructor() {
    this.destroyRef.onDestroy(() => this.stopStream());
    afterNextRender(() => {
      void this.startStream();
    });
  }

  /** Dismiss without a file. */
  protected cancel(): void {
    this.stopStream();
    this.ref.close();
  }

  /** Flip between rear and front cameras when the device exposes both. */
  protected switchFacing(): void {
    this.facing = this.facing === 'environment' ? 'user' : 'environment';
    void this.startStream();
  }

  /** Freeze the current frame into a JPEG {@link File} and close. */
  protected capture(): void {
    const video = this.preview()?.nativeElement;
    const canvas = this.snapshot()?.nativeElement;
    if (!video || !canvas || !this.streamActive() || this.capturing()) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      this.error.set('Camera is not ready yet. Try again in a moment.');
      return;
    }

    this.capturing.set(true);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.capturing.set(false);
      this.error.set('Could not capture this frame. Try another browser.');
      return;
    }
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        this.capturing.set(false);
        if (!blob) {
          this.error.set('Could not create the photo. Try again.');
          return;
        }
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        this.stopStream();
        this.ref.close(file);
      },
      'image/jpeg',
      0.92,
    );
  }

  private async startStream(): Promise<void> {
    this.starting.set(true);
    this.error.set(null);
    this.streamActive.set(false);
    this.stopStream();

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      this.starting.set(false);
      this.error.set(
        'Camera capture is not available in this browser. Use Choose files instead.',
      );
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: this.facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      const video = this.preview()?.nativeElement;
      if (!video) {
        this.stopStream();
        this.starting.set(false);
        this.error.set('Camera preview failed to start.');
        return;
      }
      video.srcObject = this.stream;
      await video.play().catch(() => undefined);
      this.streamActive.set(true);
      this.starting.set(false);
    } catch {
      this.starting.set(false);
      this.streamActive.set(false);
      this.error.set(
        'Could not access the camera. Check permissions and try again.',
      );
    }
  }

  private stopStream(): void {
    const video = this.preview()?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }
    this.streamActive.set(false);
  }
}
