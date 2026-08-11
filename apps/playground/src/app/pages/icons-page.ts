import { Component, computed, signal } from '@angular/core';
import { AiesIconComponent, ICON_NAMES, type IconName } from '@aies/aies-icons';

import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-icons-page',
  standalone: true,
  imports: [AiesIconComponent, PageHeaderComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-8">
      <app-page-header
        eyebrow="Foundation"
        title="Icons"
        description="SVG sprite registry — click any tile to copy its IconName for autocomplete-safe usage."
      >
        <div actions class="flex flex-col items-stretch gap-2 sm:items-end">
          <p class="m-0 text-caption text-neutral-600">
            {{ filtered().length }} of {{ ICON_NAMES.length }} shown
          </p>
        </div>
      </app-page-header>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          class="w-full max-w-md rounded-xl border border-border bg-white px-4 py-2.5 text-body text-ink outline-none ring-export/30 transition focus:ring-2 dark:border-white/15 dark:bg-ink dark:text-white"
          placeholder="Filter by name…"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        @if (copied()) {
          <p
            class="m-0 rounded-lg bg-export-subtle px-3 py-1.5 text-caption font-medium text-export"
            role="status"
          >
            Copied “{{ copied() }}”
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
            class="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white px-2 py-3.5 text-ink transition duration-150 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-sm dark:border-white/10 dark:bg-ink dark:text-white dark:hover:border-white/25"
            (click)="copyName(name)"
          >
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background-welcome text-ink transition group-hover:scale-105 dark:bg-ink-950 dark:text-white"
            >
              <aies-icon [name]="name" [size]="22" />
            </span>
            <span class="w-full truncate text-center text-caption">{{ name }}</span>
          </button>
        }
      </div>

      @if (!filtered().length) {
        <p class="m-0 text-body text-neutral-600">No icons match “{{ query() }}”.</p>
      }
    </div>
  `,
})
export class IconsPage {
  protected readonly ICON_NAMES = ICON_NAMES;
  protected readonly query = signal('');
  protected readonly copied = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return ICON_NAMES as readonly IconName[];
    }
    return ICON_NAMES.filter((n) => n.includes(q));
  });

  protected async copyName(name: IconName): Promise<void> {
    try {
      await navigator.clipboard.writeText(name);
      this.copied.set(name);
      window.setTimeout(() => {
        if (this.copied() === name) {
          this.copied.set(null);
        }
      }, 1600);
    } catch {
      this.copied.set(null);
    }
  }
}
