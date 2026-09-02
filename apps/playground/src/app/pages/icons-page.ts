import { Component, computed, inject, signal } from '@angular/core';

import { copyToClipboard } from '@africanies/africanies-core';
import { AfricaniesIconComponent, ICON_NAMES, type IconName } from '@africanies/africanies-icons';
import { ToastService } from '@africanies/africanies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ICONS_USAGE } from '../snippets';

/**
 * Icon sprite catalog — click a tile to copy an `<africanies-icon>` usage snippet.
 */
@Component({
  selector: 'app-icons-page',
  standalone: true,
  imports: [AfricaniesIconComponent, PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-8">
      <app-page-header
        eyebrow="Foundation"
        title="Icons"
        description="Browse every icon in the shared SVG sprite. Click a tile to copy an africanies-icon usage snippet. Serve the sprite once in your app, then use typed IconName everywhere."
      >
        <div actions class="flex flex-col items-stretch gap-2 sm:items-end">
          <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
            {{ filtered().length }} of {{ ICON_NAMES.length }} shown
          </p>
        </div>
      </app-page-header>

      <app-demo-section
        title="Usage"
        hint="Register the sprite in your app assets, then place africanies-icon wherever you need a glyph. Prefer typed IconName — never free-string ids."
        [code]="usageCode"
      >
        <div class="flex flex-wrap items-center gap-3 text-ink dark:text-white">
          @for (sample of samples; track sample) {
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-border bg-white p-2.5 transition hover:border-neutral-400 dark:border-white/10 dark:bg-ink-950 dark:hover:border-white/25"
              [attr.aria-label]="'Copy snippet for ' + sample"
              [title]="'Copy <africanies-icon name=&quot;' + sample + '&quot; />'"
              (click)="copySnippet(sample)"
            >
              <africanies-icon [name]="sample" [size]="24" />
            </button>
          }
          <span class="text-body-sm text-neutral-600 dark:text-neutral-400">
            Prefer typed IconName — never free-string icon ids.
          </span>
        </div>
      </app-demo-section>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          class="w-full max-w-md rounded-xl border border-border bg-white px-4 py-2.5 text-body text-ink outline-none ring-export/30 transition focus:ring-2 dark:border-white/15 dark:bg-ink-950 dark:text-white"
          placeholder="Filter by name…"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        @if (copied()) {
          <p
            class="m-0 max-w-full truncate rounded-lg bg-export-subtle px-3 py-1.5 font-mono text-caption font-medium text-export dark:bg-export/15 dark:text-export-light"
            role="status"
          >
            Copied {{ copied() }}
          </p>
        }
      </div>

      <div
        class="grid gap-2"
        style="grid-template-columns: repeat(auto-fill, minmax(7.25rem, 1fr));"
      >
        @for (name of filtered(); track name) {
          <button
            type="button"
            class="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white px-2 py-3.5 text-ink transition duration-150 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-sm dark:border-white/10 dark:bg-ink-950 dark:text-white dark:hover:border-white/25"
            [attr.aria-label]="'Copy snippet for ' + name"
            [title]="'Copy <africanies-icon name=&quot;' + name + '&quot; />'"
            (click)="copySnippet(name)"
          >
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background-welcome text-ink transition group-hover:scale-105 dark:bg-ink-950 dark:text-white"
            >
              <africanies-icon [name]="name" [size]="22" />
            </span>
            <span class="w-full truncate text-center text-caption">{{ name }}</span>
          </button>
        }
      </div>

      @if (!filtered().length) {
        <p class="m-0 text-body text-neutral-600 dark:text-neutral-400">
          No icons match “{{ query() }}”.
        </p>
      }
    </div>
  `,
})
export class IconsPage {
  private readonly toast = inject(ToastService);

  protected readonly ICON_NAMES = ICON_NAMES;
  protected readonly query = signal('');
  protected readonly copied = signal<string | null>(null);

  protected readonly samples: IconName[] = ['airplane', 'warehouse', 'warning'];

  protected readonly usageCode = ICONS_USAGE;

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return ICON_NAMES as readonly IconName[];
    }
    return ICON_NAMES.filter((n) => n.includes(q));
  });

  /**
   * Build a paste-ready `<africanies-icon>` usage line for the given registry id.
   * @param name - Icon slug.
   * @returns HTML snippet string.
   */
  protected iconSnippet(name: IconName): string {
    return `<africanies-icon name="${name}" />`;
  }

  /**
   * Copy the icon usage snippet to the clipboard and confirm via toast.
   * @param name - Registry id to embed in the snippet.
   */
  protected async copySnippet(name: IconName): Promise<void> {
    const snippet = this.iconSnippet(name);
    const ok = await copyToClipboard(snippet);
    if (!ok) {
      this.toast.error('Could not copy to the clipboard.');
      this.copied.set(null);
      return;
    }
    this.copied.set(snippet);
    this.toast.success(`Copied ${snippet}`);
    window.setTimeout(() => {
      if (this.copied() === snippet) {
        this.copied.set(null);
      }
    }, 1600);
  }
}
