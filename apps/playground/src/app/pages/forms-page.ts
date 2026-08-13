import { DecimalPipe, JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';
import {
  AddressInputComponent,
  type AddressPlace,
  CheckboxComponent,
  DatePickerComponent,
  FileUploadComponent,
  type FileUploadResult,
  NumberInputComponent,
  OtpInputComponent,
  RadioComponent,
  type RadioOption,
  SelectComponent,
  type SelectOption,
  TextareaComponent,
  TextInputComponent,
  ToggleComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  FORMS_ADDRESS,
  FORMS_CHOICE,
  FORMS_DATE_FILE,
  FORMS_FILE_UPLOAD,
  FORMS_LIVE_VALUES,
  FORMS_NUMBER,
  FORMS_OTP,
  FORMS_SELECT,
  FORMS_TEXT,
  FORMS_TEXTAREA,
} from '../snippets';

/**
 *
 */
@Component({
  selector: 'app-forms-page',
  standalone: true,
  imports: [
    DecimalPipe,
    JsonPipe,
    TextInputComponent,
    TextareaComponent,
    SelectComponent,
    AddressInputComponent,
    NumberInputComponent,
    OtpInputComponent,
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

      <app-demo-section
        title="Text input"
        hint="Plain field, with an icon, with an error, and disabled."
        [code]="textCode"
      >
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

      <app-demo-section title="Textarea" [code]="textareaCode">
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

      <app-demo-section
        title="Number input"
        hint="Commas are display-only; the bound value stays a number."
        [code]="numberCode"
      >
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
        hint="Search, creatable, and multi-select."
        badge="3 modes"
        [code]="selectCode"
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

      <app-demo-section
        title="Address input"
        hint="Google Places suggestions. Set localStorage key aies.googlePlacesApiKey then reload for live results."
        [code]="addressCode"
      >
        <div class="flex flex-col gap-4">
          <aies-address-input
            label="Pickup address"
            hint="Start typing — pick a suggestion to fill structured place details"
            placeholder="Street, city, or landmark"
            [countries]="['ng', 'gh', 'za', 'ke']"
            [(value)]="pickupAddress"
            (placeSelected)="onPlaceSelected($event)"
          >
            <aies-icon prefix name="map-marker" [size]="16" />
          </aies-address-input>
          <pre
            class="m-0 max-h-48 overflow-auto rounded-lg border border-border bg-background-welcome p-3 font-mono text-caption dark:border-white/10 dark:bg-ink-950"
          >{{ pickupAddress() | json }}</pre>
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Last placeSelected:
            <span class="font-mono text-ink dark:text-white">{{
              lastPlaceSelected()?.formattedAddress || '—'
            }}</span>
          </p>
        </div>
      </app-demo-section>

      <app-demo-section title="Choice controls" [code]="choiceCode">
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

      <app-demo-section
        title="OTP input"
        hint="One digit per cell. Paste works. completed fires when the code is full."
        subtext="value is one string (digits only). Resend runs a cooldown — listen to (resend) for your API, or hide it with showResend=false."
        [code]="otpCode"
      >
        <div class="flex flex-col gap-6">
          <aies-otp-input
            label="Verification code"
            hint="Enter the 6-digit code we sent"
            [resendCooldown]="10"
            [(value)]="otpCodeValue"
            (completed)="onOtpCompleted($event)"
            (resend)="onOtpResend()"
          />
          <aies-otp-input
            label="4-digit PIN"
            [length]="4"
            [showResend]="false"
            [(value)]="otpPin"
          />
          <aies-otp-input
            label="Code with error"
            error="Invalid or expired code"
            [resendCooldown]="0"
            [(value)]="otpError"
            (resend)="onOtpResend()"
          />
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Last completed:
            <span class="font-mono text-ink dark:text-white">{{
              lastOtpCompleted() || '—'
            }}</span>
            · Resend clicks:
            <span class="font-mono text-ink dark:text-white">{{
              otpResendCount()
            }}</span>
          </p>
        </div>
      </app-demo-section>

      <app-demo-section title="Date" [code]="dateFileCode">
        <div class="grid gap-5 md:grid-cols-2">
          <aies-date-picker label="Ready date" hint="Local pickup day" [(value)]="readyDate" />
          <aies-date-picker
            label="Cutoff"
            error="Cutoff must be after ready date"
            [(value)]="cutoffDate"
          />
        </div>
      </app-demo-section>

      <app-demo-section
        title="File upload"
        [code]="fileUploadCode"
        subtext="dropzone, button, or compact. Drag files onto any of them. accept filters types and labels the chips. Images preview; other files get an icon + extension."
      >
        <div class="flex flex-col gap-8">
          <aies-file-upload
            label="Dropzone · multi · images & PDF"
            hint="Drag files here, or use Camera"
            accept="image/*,.pdf"
            variant="dropzone"
            [allowCamera]="true"
            [multiple]="true"
            (filesSelected)="onFiles($event)"
          />
          <div class="grid gap-6 md:grid-cols-2">
            <aies-file-upload
              label="Button · single image"
              accept="image/*"
              variant="button"
              [allowCamera]="true"
              [multiple]="false"
              (filesSelected)="onButtonFiles($event)"
            />
            <aies-file-upload
              label="Compact · docs"
              accept=".pdf,.doc,.docx,.xlsx"
              variant="compact"
              [allowCamera]="false"
              [multiple]="true"
              (filesSelected)="onCompactFiles($event)"
            />
          </div>
        </div>
      </app-demo-section>

      <app-demo-section title="Live values" muted [code]="liveValuesCode">
        <dl class="m-0 grid gap-2 text-body-sm sm:grid-cols-2">
          <div>
            <dt class="text-neutral-600">Tracking</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">{{ tracking() || '—' }}</dd>
          </div>
          <div>
            <dt class="text-neutral-600">Amount</dt>
            <dd class="m-0 font-medium text-ink dark:text-white">
              {{
                amount() === null || amount() === undefined
                  ? '—'
                  : (amount() | number: '1.0-6')
              }}
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
  protected readonly pickupAddress = signal<AddressPlace | null>(null);
  protected readonly lastPlaceSelected = signal<AddressPlace | null>(null);
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
  protected readonly buttonFiles = signal<FileUploadResult[]>([]);
  protected readonly compactFiles = signal<FileUploadResult[]>([]);
  protected readonly otpCodeValue = signal('');
  protected readonly otpPin = signal('');
  protected readonly otpError = signal('0000');
  protected readonly lastOtpCompleted = signal('');
  protected readonly otpResendCount = signal(0);

  protected readonly textCode = FORMS_TEXT;
  protected readonly textareaCode = FORMS_TEXTAREA;
  protected readonly numberCode = FORMS_NUMBER;
  protected readonly selectCode = FORMS_SELECT;
  protected readonly addressCode = FORMS_ADDRESS;
  protected readonly choiceCode = FORMS_CHOICE;
  protected readonly otpCode = FORMS_OTP;
  protected readonly dateFileCode = FORMS_DATE_FILE;
  protected readonly fileUploadCode = FORMS_FILE_UPLOAD;
  protected readonly liveValuesCode = FORMS_LIVE_VALUES;

  protected onPlaceSelected(place: AddressPlace): void {
    this.lastPlaceSelected.set(place);
  }

  protected onFiles(next: FileUploadResult[]): void {
    this.files.set(next);
  }

  protected onButtonFiles(next: FileUploadResult[]): void {
    this.buttonFiles.set(next);
  }

  protected onCompactFiles(next: FileUploadResult[]): void {
    this.compactFiles.set(next);
  }

  protected onOtpCompleted(code: string): void {
    this.lastOtpCompleted.set(code);
  }

  protected onOtpResend(): void {
    this.otpResendCount.update((n) => n + 1);
  }

  protected tagSummary(): string {
    const selected = this.selectedTags();
    if (!selected.length) {
      return '—';
    }
    return selected.map((t) => t.label).join(', ');
  }
}
