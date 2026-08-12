import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

/** Control size for {@link AvatarComponent}. */
export type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * Circular avatar with image or initials fallback.
 *
 * @example
 * ```html
 * <aies-avatar name="Jane Doe" src="/avatars/jane.jpg" size="md" />
 * <aies-avatar name="Ops Team" />
 * ```
 */
@Component({
  selector: 'aies-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0',
  },
  template: `
    <span
      [class]="shellClass()"
      [attr.aria-label]="name() || alt() || 'Avatar'"
      role="img"
    >
      @if (src() && !imageFailed()) {
        <img
          [src]="src()"
          [alt]="alt() || name() || ''"
          class="size-full rounded-full object-cover"
          (error)="imageFailed.set(true)"
        />
      } @else {
        <span [class]="initialsClass()">{{ initials() }}</span>
      }
    </span>
  `,
})
export class AvatarComponent {
  /** Display name — used for initials when no image loads. */
  readonly name = input('');

  /** Optional image URL. */
  readonly src = input<string | null>(null);

  /** Image alt text; falls back to {@link name}. */
  readonly alt = input('');

  readonly size = input<AvatarSize>('md');

  protected readonly imageFailed = signal(false);

  protected readonly initials = computed(() => initialsFromName(this.name()));

  protected readonly shellClass = computed(() => {
    const base =
      'inline-flex items-center justify-center overflow-hidden rounded-full ' +
      'bg-background-welcome font-semibold text-ink ring-1 ring-border ' +
      'dark:bg-white/10 dark:text-white dark:ring-white/15';
    switch (this.size()) {
      case 'sm':
        return `${base} size-7 text-caption`;
      case 'lg':
        return `${base} size-10 text-body-sm`;
      default:
        return `${base} size-8 text-caption`;
    }
  });

  protected readonly initialsClass = computed(() => 'uppercase tracking-wide');
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  const first = parts[0] ?? '';
  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const last = parts[parts.length - 1] ?? '';
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}
