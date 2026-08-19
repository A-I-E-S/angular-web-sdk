import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';

import type { IconName } from '@aies/aies-icons';
import { AiesIconComponent } from '@aies/aies-icons';

/** Corner treatment for {@link ImageComponent}. */
export type ImageShape = 'circle' | 'rounded' | 'square';

/** How the image fills its frame. */
export type ImageFit = 'cover' | 'contain';

/**
 * Image with a shaped loading frame and fallback while the asset fetches or if
 * it fails to render.
 *
 * @example
 * ```html
 * <aies-image
 *   [src]="photoUrl"
 *   alt="Passport photo"
 *   frameClass="h-40 w-40"
 *   shape="rounded"
 * />
 *
 * <aies-image
 *   [src]="avatarUrl"
 *   frameClass="h-16 w-16"
 *   shape="circle"
 *   [fallback]="initials"
 *   placeholderIcon="user"
 * />
 * ```
 */
@Component({
  selector: 'aies-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent],
  host: {
    class: 'inline-block',
  },
  template: `
    <div
      class="relative overflow-hidden"
      [class]="frameShellClass()"
    >
      @if (src(); as url) {
        <img
          #img
          [src]="url"
          [alt]="alt()"
          class="block size-full transition-opacity duration-200"
          [class]="fitClass()"
          [class.opacity-0]="pending()"
          [class.opacity-100]="loaded()"
          (load)="onLoad()"
          (error)="onError()"
        />
      }

      @if (showPlaceholder()) {
        <div
          class="absolute inset-0 flex items-center justify-center bg-neutral-200 text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
          [class.animate-pulse]="pending()"
          aria-hidden="true"
        >
          @if (pending()) {
            <aies-icon
              name="spinner"
              [size]="iconSize()"
              class="animate-spin"
            />
          } @else if (fallback(); as label) {
            <span
              class="px-2 text-center font-semibold text-neutral-600 dark:text-neutral-300"
              [class]="fallbackClass()"
            >
              {{ label }}
            </span>
          } @else {
            <aies-icon [name]="placeholderIcon()" [size]="iconSize()" />
          }
        </div>
      }
    </div>
  `,
})
export class ImageComponent {
  private readonly imgRef = viewChild<ElementRef<HTMLImageElement>>('img');

  /** Image URL. When empty, the fallback or placeholder icon is shown. */
  readonly src = input<string | null>(null);

  readonly alt = input('');

  /** Frame size and layout classes, e.g. `h-16 w-16 shrink-0`. */
  readonly frameClass = input('h-40 w-40');

  readonly shape = input<ImageShape>('rounded');

  readonly fit = input<ImageFit>('cover');

  /** Short fallback label — initials, file type, etc. */
  readonly fallback = input<string | undefined>(undefined);

  readonly fallbackClass = input('text-body-sm');

  readonly placeholderIcon = input<IconName>('picture');

  readonly iconSize = input(20, { transform: numberAttribute });

  protected readonly loaded = signal(false);
  protected readonly failed = signal(false);

  protected readonly pending = computed(() => {
    const url = this.src()?.trim();
    if (!url) {
      return false;
    }
    return !this.loaded() && !this.failed();
  });

  protected readonly showPlaceholder = computed(() => {
    const url = this.src()?.trim();
    if (!url) {
      return true;
    }
    return this.pending() || this.failed();
  });

  protected readonly frameShellClass = computed(() => {
    const shape = this.shape();
    const rounded =
      shape === 'circle'
        ? 'rounded-full'
        : shape === 'rounded'
          ? 'rounded-lg'
          : '';
    return `${this.frameClass()} ${rounded}`.trim();
  });

  protected readonly fitClass = computed(() =>
    this.fit() === 'contain' ? 'object-contain' : 'object-cover',
  );

  constructor() {
    effect(() => {
      this.src();
      this.loaded.set(false);
      this.failed.set(false);
      queueMicrotask(() => this.syncIfAlreadyLoaded());
    });
  }

  protected onLoad(): void {
    this.loaded.set(true);
    this.failed.set(false);
  }

  protected onError(): void {
    this.failed.set(true);
    this.loaded.set(false);
  }

  private syncIfAlreadyLoaded(): void {
    const el = this.imgRef()?.nativeElement;
    if (el?.complete && el.naturalWidth > 0) {
      this.onLoad();
    }
  }
}
