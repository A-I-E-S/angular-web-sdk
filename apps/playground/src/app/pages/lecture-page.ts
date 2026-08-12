import {
  afterNextRender,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  categoryFragmentId,
  categoryHeading,
  categoryMeta,
  GLOSSARY_CATEGORIES,
  GLOSSARY_ENTRIES,
  type GlossaryCategory,
  glossaryEntriesForCategory,
  type GlossaryEntry,
} from '../lecture/glossary';
import { PageHeaderComponent } from '../shared/page-header.component';

/**
 * Angular & SDK concept guide — definitions for terms linked from code snippets.
 */
@Component({
  selector: 'app-lecture-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Learn"
        title="Lecture"
        description="Plain-language notes on Angular and RxJS patterns you will see in the SDK snippets. Terms highlighted in Show code panels link here."
      />

      <section
        class="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-ink sm:p-6"
      >
        <h2 class="m-0 text-heading-3 text-ink dark:text-white">
          Category abbreviations
        </h2>
        <p class="mt-2 mb-4 text-body-sm text-neutral-600 dark:text-neutral-400">
          Section labels use short names where docs usually do. Expanded forms are
          shown in parentheses.
        </p>
        <dl class="m-0 grid gap-3 sm:grid-cols-2">
          @for (category of GLOSSARY_CATEGORIES; track category) {
            <a
              [routerLink]="['/lecture']"
              [fragment]="categoryFragmentId(category)"
              class="pg-lecture-category-link"
              [class.pg-lecture-category-link--active]="
                activeId() === categoryFragmentId(category)
              "
            >
              <dt class="m-0 font-medium text-ink dark:text-white">
                {{ categoryHeading(category) }}
              </dt>
              <dd
                class="m-0 mt-1 text-body-sm text-neutral-600 dark:text-neutral-400"
              >
                {{ categoryMeta(category).description }}
              </dd>
            </a>
          }
        </dl>
      </section>

      <section
        class="rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-ink sm:p-6"
      >
        <h2 class="m-0 text-heading-3 text-ink dark:text-white">On this page</h2>
        <p class="mt-2 mb-4 text-body-sm text-neutral-600 dark:text-neutral-400">
          {{ GLOSSARY_ENTRIES.length }} entries · click a term in any implementation
          snippet to jump to its definition.
        </p>
        <div class="flex flex-wrap gap-2">
          @for (entry of GLOSSARY_ENTRIES; track entry.id) {
            <a
              [routerLink]="['/lecture']"
              [fragment]="entry.id"
              class="pg-lecture-chip"
            >
              {{ entry.title }}
            </a>
          }
        </div>
      </section>

      @for (category of GLOSSARY_CATEGORIES; track category) {
        <section
          [id]="categoryFragmentId(category)"
          class="scroll-mt-24 flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1">
            <p class="pg-kicker m-0">{{ category }}</p>
            <h2 class="m-0 text-heading-3 text-ink dark:text-white">
              {{ categoryHeading(category) }}
            </h2>
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ categoryMeta(category).description }}
            </p>
          </div>

          <div class="flex flex-col gap-4">
            @for (entry of entriesFor(category); track entry.id) {
              <article
                [id]="entry.id"
                class="scroll-mt-24 rounded-xl border border-border bg-white p-5 dark:border-white/10 dark:bg-ink sm:p-6"
                [class.ring-2]="activeId() === entry.id"
                [class.ring-export]="activeId() === entry.id"
              >
                <header class="flex flex-wrap items-start justify-between gap-3">
                  <div class="flex min-w-0 flex-col gap-1">
                    <h3
                      class="m-0 font-mono text-heading-3 text-ink dark:text-white"
                    >
                      {{ entry.title }}
                    </h3>
                    <p
                      class="m-0 text-body-sm font-medium text-export dark:text-export-light"
                    >
                      {{ entry.summary }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 rounded-md bg-background-welcome px-2 py-0.5 text-caption text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
                    [title]="categoryHeading(entry.category)"
                  >
                    {{ entry.category }}
                  </span>
                </header>

                @for (paragraph of paragraphs(entry.detail); track paragraph) {
                  <p
                    class="mb-0 mt-3 text-body-sm text-neutral-700 dark:text-neutral-300"
                  >
                    {{ paragraph }}
                  </p>
                }

                @if (entry.example) {
                  <pre
                    class="pg-lecture-example mt-4 overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 font-mono text-caption leading-relaxed text-[#d4d4d4]"
                  ><code>{{ entry.example }}</code></pre>
                }

                @if (entry.seeAlso?.length) {
                  <div class="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      class="text-caption font-medium uppercase tracking-wide text-neutral-500"
                    >
                      See also
                    </span>
                    @for (relatedId of entry.seeAlso!; track relatedId) {
                      <a
                        [routerLink]="['/lecture']"
                        [fragment]="relatedId"
                        class="pg-lecture-chip"
                      >
                        {{ titleFor(relatedId) }}
                      </a>
                    }
                  </div>
                }
              </article>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class LecturePage {
  protected readonly GLOSSARY_ENTRIES = GLOSSARY_ENTRIES;
  protected readonly GLOSSARY_CATEGORIES = GLOSSARY_CATEGORIES;
  protected readonly categoryHeading = categoryHeading;
  protected readonly categoryMeta = categoryMeta;
  protected readonly categoryFragmentId = categoryFragmentId;

  private readonly route = inject(ActivatedRoute);

  protected readonly activeId = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      this.route.fragment.subscribe((fragment) => {
        this.activeId.set(fragment);
        if (!fragment) {
          return;
        }
        queueMicrotask(() => {
          document.getElementById(fragment)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      });
    });
  }

  protected entriesFor(category: GlossaryCategory): GlossaryEntry[] {
    return glossaryEntriesForCategory(category);
  }

  protected paragraphs(detail: string): string[] {
    return detail.split(/\n\n+/).filter(Boolean);
  }

  protected titleFor(id: string): string {
    return GLOSSARY_ENTRIES.find((entry) => entry.id === id)?.title ?? id;
  }
}
