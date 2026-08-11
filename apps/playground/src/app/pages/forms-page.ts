import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AiesIconComponent } from '@aies/aies-icons';
import {
  CheckboxComponent,
  DatePickerComponent,
  FileUploadComponent,
  NumberInputComponent,
  RadioComponent,
  SelectComponent,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
  type FileUploadResult,
  type RadioOption,
  type SelectOption,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-forms-page',
  standalone: true,
  imports: [
    DecimalPipe,
    TextInputComponent,
    TextareaComponent,
    SelectComponent,
    NumberInputComponent,
    FileUploadComponent,
    CheckboxComponent,
    RadioComponent,
    ToggleComponent,
    DatePickerComponent,
    AiesIconComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Form controls"
        description="Shared pattern: label, hint, field error, prefix/suffix slots, and ControlValueAccessor."
      />

      <app-demo-section title="Text input" hint="Default, with affixes, error, and disabled.">
        <div class="grid gap-5 md:grid-cols-2">
          <aies-text-input
            label="Tracking number"
            hint="As printed on the airway bill"
            placeholder="e.g. AWB-12345"
            [(value)]="tracking"
          />
          <aies-text-input label="Reference" placeholder="Optional internal ref" [(value)]="reference">
            <aies-icon prefix name="anchor" [size]="16" />
          </aies-text-input>
          <aies-text-input
            label="Consignee email"
            error="Enter a valid email address"
            [(value)]="email"
          />
          <aies-text-input label="Locked field" [disabled]="true" [(value)]="locked" />
        </div>
      </app-demo-section>

      <app-demo-section title="Textarea">
        <div class="grid gap-5 md:grid-cols-2">
          <aies-textarea
            label="Special instructions"
            hint="Visible to warehouse staff"
            placeholder="Fragile — keep upright"
            [(value)]="instructions"
          />
          <aies-textarea
            label="Notes"
            error="Notes cannot exceed 500 characters"
            [(value)]="notesError"
          />
        </div>
      </app-demo-section>

      <app-demo-section title="Number input" hint="Comma formatting is display-only — value stays a number.">
        <div class="grid gap-5 md:grid-cols-2">
          <aies-number-input label="Declared value (USD)" [(value)]="amount">
            <span prefix>$</span>
          </aies-number-input>
          <aies-number-input
            label="Weight"
            hint="Kilograms"
            [(value)]="weight"
          >
            <span suffix>kg</span>
          </aies-number-input>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Select"
        hint="Searchable, free-text, and multi-select modes."
        badge="3 modes"
      >
        <div class="grid gap-5 md:grid-cols-2">
          <aies-select
            label="Warehouse"
            [options]="warehouses()"
            [searchable]="true"
            [(selected)]="selectedWarehouse"
          >
            <aies-icon prefix name="warehouse" [size]="16" />
          </aies-select>
          <aies-select
            label="Tags"
            [searchable]="true"
            [allowFreeText]="true"
            [multiple]="true"
            [maxSelected]="4"
            [(options)]="tags"
            [(selected)]="selectedTags"
          />
          <aies-select
            label="Incoterm"
            hint="Plain list — searchable off"
            [options]="incoterms"
            [(selected)]="selectedIncoterm"
          />
          <aies-select
            label="Carrier (with error)"
            error="Select a carrier to continue"
            [options]="carriers"
            [(selected)]="selectedCarrier"
          >
            <aies-icon prefix name="airplane" [size]="16" />
          </aies-select>
        </div>
      </app-demo-section>

      <app-demo-section title="Choice controls">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="flex flex-col gap-4">
            <aies-checkbox label="Require signature on delivery" [(value)]="signature" />
            <aies-checkbox
              label="Insure this shipment"
              hint="Adds 0.8% of declared value"
              [(value)]="insured"
            />
            <aies-checkbox
              label="Accept terms"
              error="You must accept the terms"
              [(value)]="terms"
            />
            <aies-toggle label="Notify consignee by SMS" [(value)]="smsNotify" />
            <aies-toggle label="Hold at depot" [(value)]="holdAtDepot" />
          </div>
          <aies-radio
            label="Service level"
            [options]="serviceLevels"
            [(value)]="serviceLevel"
          />
        </div>
      </app-demo-section>

      <app-demo-section title="Date & file">
        <div class="grid gap-5 md:grid-cols-2">
          <aies-date-picker label="Ready date" hint="Local pickup day" [(value)]="readyDate" />
          <aies-date-picker
            label="Cutoff"
            error="Cutoff must be after ready date"
            [(value)]="cutoffDate"
          />
          <aies-file-upload
            class="md:col-span-2"
            label="Identity document"
            accept="image/*,.pdf"
            [allowCamera]="true"
            [multiple]="true"
            (filesSelected)="onFiles($event)"
          />
        </div>
      </app-demo-section>

      <app-demo-section title="Live values" muted>
        <dl class="m-0 grid gap-2 text-body-sm sm:grid-cols-2">
          <div>
            <dt class="text-neutral-600">Tracking</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">{{ tracking() || '—' }}</dd>
          </div>
          <div>
            <dt class="text-neutral-600">Amount</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">
              {{ amount() == null ? '—' : (amount()! | number: '1.0-6') }}
            </dd>
          </div>
          <div>
            <dt class="text-neutral-600">Warehouse</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">
              {{ selectedWarehouse()?.label ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-neutral-600">Tags</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">
              {{ tagSummary() }}
            </dd>
          </div>
          <div>
            <dt class="text-neutral-600">Service</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">
              {{ serviceLevel() ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-neutral-600">Files</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">
              {{
                files().length
                  ? files()
                      .map((f) => f.file.name)
                      .join(', ')
                  : '—'
              }}
            </dd>
          </div>
        </dl>
      </app-demo-section>
    </div>
  `,
})
export class FormsPage {
  protected readonly tracking = signal('');
  protected readonly reference = signal('');
  protected readonly email = signal('not-an-email');
  protected readonly locked = signal('WH-LOCKED-01');
  protected readonly instructions = signal('');
  protected readonly notesError = signal('x'.repeat(12));
  protected readonly amount = signal<number | null>(12500);
  protected readonly weight = signal<number | null>(24.5);
  protected readonly warehouses = signal<SelectOption<string>[]>([
    { label: 'Lagos Hub', value: 'los', prefix: 'warehouse', suffix: 'globe' },
    { label: 'Accra Depot', value: 'acc', prefix: 'warehouse' },
    { label: 'Johannesburg FC', value: 'jnb', prefix: 'warehouse', suffix: 'flag' },
    { label: 'Cairo Gateway', value: 'cai', prefix: 'warehouse' },
  ]);
  protected readonly selectedWarehouse = signal<SelectOption<string> | null>(null);
  protected readonly tags = signal<SelectOption<string>[]>([
    { label: 'Fragile', value: 'fragile', prefix: 'warning' },
    { label: 'Priority', value: 'priority', prefix: 'alarm' },
    { label: 'Bonded', value: 'bonded', prefix: 'anchor' },
  ]);
  protected readonly selectedTags = signal<SelectOption<string>[]>([]);
  protected readonly incoterms: SelectOption<string>[] = [
    { label: 'DDP', value: 'ddp' },
    { label: 'DAP', value: 'dap' },
    { label: 'EXW', value: 'exw' },
    { label: 'FOB', value: 'fob' },
  ];
  protected readonly selectedIncoterm = signal<SelectOption<string> | null>(null);
  protected readonly carriers: SelectOption<string>[] = [
    { label: 'DHL Express', value: 'dhl', prefix: 'airplane', suffix: 'check-circle' },
    { label: 'FedEx', value: 'fedex', prefix: 'airplane' },
    { label: 'UPS', value: 'ups', prefix: 'airplane', suffix: 'globe' },
  ];
  protected readonly selectedCarrier = signal<SelectOption<string> | null>(null);
  protected readonly signature = signal(true);
  protected readonly insured = signal(false);
  protected readonly terms = signal(false);
  protected readonly smsNotify = signal(true);
  protected readonly holdAtDepot = signal(false);
  protected readonly serviceLevels: RadioOption<string>[] = [
    { label: 'Economy', value: 'economy' },
    { label: 'Standard', value: 'standard' },
    { label: 'Express', value: 'express' },
  ];
  protected readonly serviceLevel = signal<string | null>('standard');
  protected readonly readyDate = signal<string | null>('2026-08-15');
  protected readonly cutoffDate = signal<string | null>(null);
  protected readonly files = signal<FileUploadResult[]>([]);

  protected onFiles(next: FileUploadResult[]): void {
    this.files.set(next);
  }

  protected tagSummary(): string {
    const selected = this.selectedTags();
    if (!selected.length) {
      return '—';
    }
    return selected.map((t) => t.label).join(', ');
  }
}
