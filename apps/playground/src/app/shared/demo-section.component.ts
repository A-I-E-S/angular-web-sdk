import { booleanAttribute, Component, computed, input, signal } from '@angular/core';
import { AiesIconComponent } from '@aies/aies-icons';
import { ButtonComponent } from '@aies/aies-ui';

/**
 * Labeled demo canvas for showcasing a component variant group.
 * Optional `code` input reveals a Show code / Hide code toggle with a copyable snippet.
 */
@Component({
  selector: 'app-demo-section',
  standalone: true,
  imports: [ButtonComponent, AiesIconComponent],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex min-w-0 flex-col gap-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="m-0 text-heading-3 text-ink dark:text-white">{{ title() }}</h2>
            @if (badge()) {
              <span
                class="rounded-md bg-border px-2 py-0.5 text-caption text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
              >
                {{ badge() }}
              </span>
            }
          </div>
          @if (hint()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ hint() }}
            </p>
          }
        </div>

        @if (hasCode()) {
          <button
            aies-button
            type="button"
            variant="ghost"
            size="sm"
            class="shrink-0 self-start"
            [attr.aria-expanded]="codeOpen()"
            (click)="toggleCode()"
          >
            <aies-icon [name]="codeOpen() ? 'close' : 'code'" [size]="14" />
            {{ codeOpen() ? 'Hide code' : 'Show code' }}
          </button>
        }
      </div>

      <div [class]="muted() ? 'pg-demo-muted' : 'pg-demo'">
        <ng-content />
      </div>

      @if (hasCode() && codeOpen()) {
        <div
          class="overflow-hidden rounded-xl border border-border bg-ink-950 text-white dark:border-white/10"
        >
          <div
            class="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2"
          >
            <span class="text-caption font-medium uppercase tracking-wide text-white/50">
              Example
            </span>
            <button
              aies-button
              type="button"
              variant="ghost"
              size="sm"
              class="!text-white/80 hover:!bg-white/10 hover:!text-white"
              (click)="copyCode()"
            >
              <aies-icon [name]="copied() ? 'check' : 'copy'" [size]="14" />
              {{ copied() ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <pre
            class="m-0 max-h-[28rem] overflow-auto p-4 font-mono text-caption leading-relaxed text-white/90 whitespace-pre-wrap"
          ><code>{{ code() }}</code></pre>
        </div>
      }
    </section>
  `,
})
export class DemoSectionComponent {
  /** Section heading. */
  readonly title = input.required<string>();
  /** Optional supporting sentence. */
  readonly hint = input<string | null>(null);
  /** Optional meta chip (e.g. "4 variants"). */
  readonly badge = input<string | null>(null);
  /** Use dashed muted canvas instead of solid white. */
  readonly muted = input(false, { transform: booleanAttribute });
  /**
   * Usage snippet shown when the visitor toggles “Show code”.
   * Omit (or pass null/empty) to hide the toggle.
   */
  readonly code = input<string | null>(null);

  protected readonly codeOpen = signal(false);
  protected readonly copied = signal(false);

  protected readonly hasCode = computed(() => {
    const value = this.code();
    return value != null && value.trim().length > 0;
  });

  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  protected toggleCode(): void {
    this.codeOpen.update((open) => !open);
    if (!this.codeOpen()) {
      this.copied.set(false);
    }
  }

  protected async copyCode(): Promise<void> {
    const value = this.code();
    if (value == null || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(true);
      if (this.copyResetTimer) {
        clearTimeout(this.copyResetTimer);
      }
      this.copyResetTimer = setTimeout(() => this.copied.set(false), 1600);
    } catch {
      // Clipboard may be denied in some embedded contexts — leave UI unchanged.
    }
  }
}
