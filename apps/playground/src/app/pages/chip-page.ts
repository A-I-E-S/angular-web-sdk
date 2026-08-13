import { Component, signal } from '@angular/core';

import {
  ChipComponent,
  type ChipSize,
  type ChipVariant,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { CHIP_ICON_REMOVE, CHIP_TABLE, CHIP_VARIANTS } from '../snippets';

/**
 * Chip catalog — status labels with soft fills and dark-safe tones.
 */
@Component({
  selector: 'app-chip-page',
  standalone: true,
  imports: [ChipComponent, PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Chip"
        description="Small labels for status, category, or tags in tables, filters, and toolbars. Soft fills stay readable in light and dark mode."
      />

      <app-demo-section
        title="Variants"
        hint="neutral, success, warning, danger, plus export/import for shipping mode. success and export both use the SFN green family."
        badge="6"
        [code]="variantsCode"
      >
        <div class="flex flex-wrap items-center gap-2">
          @for (v of variants; track v) {
            <aies-chip [variant]="v">{{ labels[v] }}</aies-chip>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="Size, icon, removable"
        hint="sm for dense table cells; md for filter bars. Add an icon for meaning, or removable when the user can clear a tag — parent owns the list."
        [code]="iconRemoveCode"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-2">
            @for (s of sizes; track s) {
              <aies-chip variant="export" [size]="s">Size {{ s }}</aies-chip>
              <aies-chip variant="import" [size]="s">Size {{ s }}</aies-chip>
            }
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <aies-chip variant="warning" icon="clock">Pending review</aies-chip>
            <aies-chip variant="success" icon="check-circle">Verified</aies-chip>
            @for (tag of removableTags(); track tag) {
              <aies-chip
                [variant]="tag.variant"
                [removable]="true"
                (removed)="removeTag(tag.id)"
              >
                {{ tag.label }}
              </aies-chip>
            }
            @if (removableTags().length === 0) {
              <button
                type="button"
                class="text-caption text-neutral-600 underline dark:text-neutral-400"
                (click)="resetTags()"
              >
                Restore tags
              </button>
            }
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="In a table cell"
        hint="Map your domain status to a ChipVariant in the host component; keep the chip itself presentational."
        [code]="tableCode"
      >
        <div class="flex flex-wrap items-center gap-2">
          <aies-chip variant="success">Delivered</aies-chip>
          <aies-chip variant="import">In transit</aies-chip>
          <aies-chip variant="warning">Pending</aies-chip>
          <aies-chip variant="danger">Exception</aies-chip>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ChipPage {
  protected readonly variants: ChipVariant[] = [
    'neutral',
    'success',
    'warning',
    'danger',
    'export',
    'import',
  ];

  protected readonly sizes: ChipSize[] = ['sm', 'md'];

  protected readonly labels: Record<ChipVariant, string> = {
    neutral: 'Neutral',
    success: 'Delivered',
    warning: 'Pending',
    danger: 'Exception',
    export: 'SFN / export',
    import: 'STN / import',
  };

  protected readonly removableTags = signal([
    { id: 1, label: 'Lagos', variant: 'export' as ChipVariant },
    { id: 2, label: 'Exception', variant: 'danger' as ChipVariant },
    { id: 3, label: 'In transit', variant: 'import' as ChipVariant },
  ]);

  protected readonly variantsCode = CHIP_VARIANTS;
  protected readonly iconRemoveCode = CHIP_ICON_REMOVE;
  protected readonly tableCode = CHIP_TABLE;

  protected removeTag(id: number): void {
    this.removableTags.update((tags) => tags.filter((t) => t.id !== id));
  }

  protected resetTags(): void {
    this.removableTags.set([
      { id: 1, label: 'Lagos', variant: 'export' },
      { id: 2, label: 'Exception', variant: 'danger' },
      { id: 3, label: 'In transit', variant: 'import' },
    ]);
  }
}
