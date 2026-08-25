/**
 * Playground snippets — form controls (@africanies/africanies-ui).
 */

export /**
 *
 */
const FORMS_TEXT = `
// Text fields: label + optional hint/error. Bind with [(value)].
// Prefix/suffix slots use attribute selectors (prefix, suffix).

import { Component, signal } from '@angular/core';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import { TextInputComponent } from '@africanies/africanies-ui';

@Component({
  selector: 'app-shipment-reference-form',
  standalone: true,
  imports: [TextInputComponent, AfricaniesIconComponent],
  template: \`
    <div class="grid gap-5 md:grid-cols-2">
      <africanies-text-input
        label="Tracking number"
        hint="As printed on the airway bill"
        placeholder="e.g. AWB-12345"
        [(value)]="tracking"
      />

      <africanies-text-input label="Reference" placeholder="Optional internal ref" [(value)]="reference">
        <africanies-icon prefix name="anchor" [size]="16" />
      </africanies-text-input>

      <africanies-text-input
        label="Consignee email"
        error="Enter a valid email address"
        [(value)]="email"
      />

      <africanies-text-input label="Locked field" [disabled]="true" [(value)]="locked" />
    </div>
  \`,
})
export class ShipmentReferenceFormComponent {
  protected readonly tracking = signal('');
  protected readonly reference = signal('');
  protected readonly email = signal('not-an-email');
  protected readonly locked = signal('WH-LOCKED-01');
}
`;

export /**
 *
 */
const FORMS_TEXTAREA = `
// Same label / hint / error pattern as text inputs, just multi-line.

import { Component, signal } from '@angular/core';
import { TextareaComponent } from '@africanies/africanies-ui';

@Component({
  selector: 'app-shipment-instructions-form',
  standalone: true,
  imports: [TextareaComponent],
  template: \`
    <div class="grid gap-5 md:grid-cols-2">
      <africanies-textarea
        label="Special instructions"
        hint="Visible to warehouse staff"
        placeholder="Fragile — keep upright"
        [(value)]="instructions"
      />

      <africanies-textarea
        label="Notes"
        error="Notes cannot exceed 500 characters"
        [(value)]="notesError"
      />
    </div>
  \`,
})
export class ShipmentInstructionsFormComponent {
  protected readonly instructions = signal('');
  protected readonly notesError = signal('');
}
`;

export /**
 *
 */
const FORMS_NUMBER = `
// Bound value is number | null. Prefix/suffix are display chrome only —
// commas in the UI are cosmetic; send the numeric value to the API.

import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NumberInputComponent } from '@africanies/africanies-ui';

@Component({
  selector: 'app-shipment-value-form',
  standalone: true,
  imports: [DecimalPipe, NumberInputComponent],
  template: \`
    <div class="grid gap-5 md:grid-cols-2">
      <africanies-number-input label="Declared value (USD)" [(value)]="amount">
        <span prefix>$</span>
      </africanies-number-input>

      <africanies-number-input label="Weight" hint="Kilograms" [(value)]="weight">
        <span suffix>kg</span>
      </africanies-number-input>
    </div>

    <p class="text-body-sm">
      Stored amount:
      {{ amount() == null ? '—' : (amount()! | number: '1.0-6') }}
    </p>
  \`,
})
export class ShipmentValueFormComponent {
  protected readonly amount = signal<number | null>(12500);
  protected readonly weight = signal<number | null>(24.5);
}
`;

export /**
 *
 */
const FORMS_SELECT = `
// Single/multi select binds [(selected)]. [searchable] for long lists.
// allowFreeText = inline tags; [create] opens a modal (needs provideAfricaniesUiOverlays()).

import { Component, signal } from '@angular/core';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import {
  SelectComponent,
  type SelectCreateConfig,
  type SelectOption,
} from '@africanies/africanies-ui';

// Example modal close payload — your modal component returns this shape.
interface WarehouseCreateResult {
  id: string;
  name: string;
}

@Component({
  selector: 'app-shipment-routing-form',
  standalone: true,
  imports: [SelectComponent, AfricaniesIconComponent],
  template: \`
    <div class="grid gap-5 md:grid-cols-2">
      <africanies-select
        label="Warehouse"
        [options]="warehouses()"
        [searchable]="true"
        [(selected)]="selectedWarehouse"
      >
        <africanies-icon prefix name="warehouse" [size]="16" />
      </africanies-select>

      <africanies-select
        label="Tags"
        [searchable]="true"
        [allowFreeText]="true"
        [multiple]="true"
        [maxSelected]="4"
        [(options)]="tags"
        [(selected)]="selectedTags"
      />

      <africanies-select
        label="Incoterm"
        hint="Plain list — searchable off"
        [options]="incoterms"
        [(selected)]="selectedIncoterm"
      />

      <africanies-select
        label="Carrier"
        hint="Create opens a modal — requires provideAfricaniesUiOverlays()"
        [options]="carriers()"
        [searchable]="true"
        [create]="warehouseCreate"
        [(options)]="carriers"
        [(selected)]="selectedCarrier"
      >
        <africanies-icon prefix name="airplane" [size]="16" />
      </africanies-select>
    </div>
  \`,
})
export class ShipmentRoutingFormComponent {
  protected readonly warehouses = signal<SelectOption<string>[]>([
    { label: 'Lagos Hub', value: 'los', prefix: 'warehouse', suffix: 'globe' },
    { label: 'Accra Depot', value: 'acc', prefix: 'warehouse' },
  ]);

  protected readonly selectedWarehouse = signal<SelectOption<string> | null>(null);

  protected readonly tags = signal<SelectOption<string>[]>([
    { label: 'Fragile', value: 'fragile', prefix: 'warning' },
    { label: 'Priority', value: 'priority', prefix: 'alarm' },
  ]);
  protected readonly selectedTags = signal<SelectOption<string>[]>([]);

  protected readonly incoterms: SelectOption<string>[] = [
    { label: 'DDP', value: 'ddp' },
    { label: 'DAP', value: 'dap' },
    { label: 'EXW', value: 'exw' },
  ];
  protected readonly selectedIncoterm = signal<SelectOption<string> | null>(null);

  protected readonly carriers = signal<SelectOption<string>[]>([
    { label: 'DHL Express', value: 'dhl', prefix: 'airplane' },
    { label: 'FedEx', value: 'fedex', prefix: 'airplane' },
  ]);
  protected readonly selectedCarrier = signal<SelectOption<string> | null>(null);

  // Modal-backed create — component is your standalone creation form.
  protected readonly warehouseCreate: SelectCreateConfig<WarehouseCreateResult, string> = {
    label: 'Add warehouse',
    component: WarehouseCreateModalComponent,
    data: { region: 'west-africa' },
    mapResult: (result) => ({
      label: result.name,
      value: result.id,
      prefix: 'warehouse',
    }),
  };
}

// Stub — replace with your real modal panel opened via ModalService.
@Component({ selector: 'app-warehouse-create-modal', standalone: true, template: '' })
export class WarehouseCreateModalComponent {}

// app.config.ts — required once per app when any select uses [create]:
//
// import { provideAfricaniesUiOverlays } from '@africanies/africanies-ui';
//
// export const appConfig: ApplicationConfig = {
//   providers: [provideAfricaniesUiOverlays(), /* … */],
// };
`;

export /**
 *
 */
const FORMS_CHOICE = `
// Checkbox / toggle for booleans; radio for exactly-one-of. All use [(value)].

import { Component, signal } from '@angular/core';
import {
  CheckboxComponent,
  RadioComponent,
  ToggleComponent,
  type RadioOption,
} from '@africanies/africanies-ui';

@Component({
  selector: 'app-shipment-options-form',
  standalone: true,
  imports: [CheckboxComponent, ToggleComponent, RadioComponent],
  template: \`
    <div class="grid gap-6 md:grid-cols-2">
      <div class="flex flex-col gap-4">
        <africanies-checkbox label="Require signature on delivery" [(value)]="signature" />

        <africanies-checkbox
          label="Insure this shipment"
          hint="Adds 0.8% of declared value"
          [(value)]="insured"
        />

        <africanies-checkbox
          label="Accept terms"
          error="You must accept the terms"
          [(value)]="terms"
        />

        <africanies-toggle label="Notify consignee by SMS" [(value)]="smsNotify" />
        <africanies-toggle label="Hold at depot" [(value)]="holdAtDepot" />
        <africanies-toggle
          label="Require customs hold"
          hint="Waits for the API — the switch does not flip until the save succeeds."
          [value]="customsHold()"
          [loading]="customsHoldSaving()"
          (valueChange)="saveCustomsHold($event)"
        />
      </div>

      <africanies-radio
        label="Service level"
        [options]="serviceLevels"
        [(value)]="serviceLevel"
      />
    </div>
  \`,
})
export class ShipmentOptionsFormComponent {
  protected readonly signature = signal(true);
  protected readonly insured = signal(false);
  protected readonly terms = signal(false);
  protected readonly smsNotify = signal(true);
  protected readonly holdAtDepot = signal(false);
  protected readonly customsHold = signal(false);
  protected readonly customsHoldSaving = signal(false);

  protected readonly serviceLevels: RadioOption<string>[] = [
    { label: 'Economy', value: 'economy' },
    { label: 'Standard', value: 'standard' },
    { label: 'Express', value: 'express' },
  ];
  protected readonly serviceLevel = signal<string | null>('standard');

  protected saveCustomsHold(next: boolean): void {
    this.customsHoldSaving.set(true);
    window.setTimeout(() => {
      this.customsHold.set(next);
      this.customsHoldSaving.set(false);
    }, 1200);
  }
}
`;

export /**
 *
 */
const FORMS_DATE_FILE = `
// Date picker emits YYYY-MM-DD (string | null). Keep that ISO string as-is.

import { Component, signal } from '@angular/core';
import { DatePickerComponent } from '@africanies/africanies-ui';

@Component({
  selector: 'app-shipment-schedule-form',
  standalone: true,
  imports: [DatePickerComponent],
  template: \`
    <div class="grid gap-5 md:grid-cols-2">
      <africanies-date-picker label="Ready date" hint="Local pickup day" [(value)]="readyDate" />
      <africanies-date-picker
        label="Cutoff"
        error="Cutoff must be after ready date"
        [(value)]="cutoffDate"
      />
    </div>
  \`,
})
export class ShipmentScheduleFormComponent {
  protected readonly readyDate = signal<string | null>('2026-08-15');
  protected readonly cutoffDate = signal<string | null>(null);
}
`;

export /**
 *
 */
const FORMS_ADDRESS = `
// Google Places address field. Bootstrap with provideGooglePlaces({ apiKey }).
// [(value)] is AddressPlace | null; (placeSelected) fires when a suggestion is chosen.

import { Component, signal } from '@angular/core';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import {
  AddressInputComponent,
  type AddressPlace,
  provideGooglePlaces,
} from '@africanies/africanies-ui';

// app.config.ts
export const appConfig = {
  providers: [
    provideGooglePlaces({ apiKey: import.meta.env['NG_APP_GOOGLE_MAPS_KEY'] }),
  ],
};

@Component({
  selector: 'app-pickup-address-form',
  standalone: true,
  imports: [AddressInputComponent, AfricaniesIconComponent],
  template: \`
    <africanies-address-input
      label="Pickup address"
      hint="Start typing — pick a Google suggestion"
      placeholder="Street, city, or landmark"
      [countries]="['ng', 'gh', 'za']"
      [(value)]="pickup"
      (placeSelected)="onPlace($event)"
    >
      <africanies-icon prefix name="map-marker" [size]="16" />
    </africanies-address-input>

    <pre>{{ pickup() | json }}</pre>
  \`,
})
export class PickupAddressFormComponent {
  protected readonly pickup = signal<AddressPlace | null>(null);

  protected onPlace(place: AddressPlace): void {
    console.log('selected', place);
  }
}
`;

export /**
 *
 */
const FORMS_FILE_UPLOAD = `
// Browse, drag-drop, or camera. You get FileUploadResult[] on (filesSelected) —
// upload them yourself. accept filters client-side; mismatches are skipped.
// Added files include an underlined View action for a larger preview.

import { Component, signal } from '@angular/core';
import {
  FileUploadComponent,
  type FileUploadResult,
} from '@africanies/africanies-ui';

@Component({
  selector: 'app-kyc-upload-form',
  standalone: true,
  imports: [FileUploadComponent],
  template: \`
    <africanies-file-upload
      variant="dropzone"
      label="Identity document"
      accept="image/*,.pdf"
      [allowCamera]="true"
      [multiple]="true"
      (filesSelected)="onFiles($event)"
    />
  \`,
})
export class KycUploadFormComponent {
  protected readonly files = signal<FileUploadResult[]>([]);

  protected onFiles(next: FileUploadResult[]): void {
    this.files.set(next);
  }
}
`;

export /**
 *
 */
const FORMS_OTP = `
// OTP is one string, not an array. (resend) is your cue to call the API —
// the control only runs the cooldown UI. (completed) fires when all digits are in.
// variant="masked" hides each digit (PIN-style); the model is still the real code.

import { Component, signal } from '@angular/core';
import { OtpInputComponent } from '@africanies/africanies-ui';

@Component({
  selector: 'app-verify-otp-form',
  standalone: true,
  imports: [OtpInputComponent],
  template: \`
    <africanies-otp-input
      label="Verification code"
      hint="Enter the 6-digit code we sent"
      [resendCooldown]="60"
      [(value)]="code"
      (completed)="verify($event)"
      (resend)="sendAgain()"
    />

    <africanies-otp-input
      label="Transaction PIN"
      variant="masked"
      [length]="4"
      [showResend]="false"
      [(value)]="pin"
      (completed)="confirmPin($event)"
    />
  \`,
})
export class VerifyOtpFormComponent {
  protected readonly code = signal('');
  protected readonly pin = signal('');

  protected verify(code: string): void {
    // POST /auth/verify { code }
    console.log('OTP complete', code);
  }

  protected confirmPin(pin: string): void {
    // POST /wallet/confirm { pin }
    console.log('PIN complete', pin);
  }

  protected sendAgain(): void {
    // POST /auth/resend-otp
    console.log('Resend OTP');
  }
}
`;

export /**
 *
 */
const FORMS_LIVE_VALUES = `
// Same signals you bound with [(value)] / [(selected)] — read them anywhere.
// Call them as functions: tracking(), amount(). Don't forget the ().

import { DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { type FileUploadResult, type SelectOption } from '@africanies/africanies-ui';

@Component({
  selector: 'app-shipment-summary',
  standalone: true,
  imports: [DecimalPipe],
  template: \`
    <dl class="m-0 grid gap-2 text-body-sm sm:grid-cols-2">
      <div>
        <dt class="text-neutral-600">Tracking</dt>
        <dd class="m-0 font-medium">{{ tracking() || '—' }}</dd>
      </div>

      <div>
        <dt class="text-neutral-600">Amount</dt>
        <dd class="m-0 font-medium">
          {{ amount() == null ? '—' : (amount()! | number: '1.0-6') }}
        </dd>
      </div>

      <div>
        <dt class="text-neutral-600">Warehouse</dt>
        <dd class="m-0 font-medium">{{ selectedWarehouse()?.label ?? '—' }}</dd>
      </div>

      <div>
        <dt class="text-neutral-600">Tags</dt>
        <dd class="m-0 font-medium">{{ tagSummary() }}</dd>
      </div>

      <div>
        <dt class="text-neutral-600">Service</dt>
        <dd class="m-0 font-medium">{{ serviceLevel() ?? '—' }}</dd>
      </div>

      <div>
        <dt class="text-neutral-600">Files</dt>
        <dd class="m-0 font-medium">
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
  \`,
})
export class ShipmentSummaryComponent {
  // These signals are the same instances bound in sibling form controls.
  protected readonly tracking = signal('');
  protected readonly amount = signal<number | null>(12500);
  protected readonly selectedWarehouse = signal<SelectOption<string> | null>(null);
  protected readonly selectedTags = signal<SelectOption<string>[]>([]);
  protected readonly serviceLevel = signal<string | null>('standard');
  protected readonly files = signal<FileUploadResult[]>([]);

  protected tagSummary(): string {
    const selected = this.selectedTags();
    if (!selected.length) {
      return '—';
    }
    return selected.map((t) => t.label).join(', ');
  }
}
`;
