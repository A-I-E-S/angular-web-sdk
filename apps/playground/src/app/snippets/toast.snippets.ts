/**
 * Playground snippets — Toast.
 */

export /**
 *
 */
const TOAST_VARIANTS = `
// Inject ToastService and fire away.
// Error stays until closed; warning ~8s; info/success ~4.5s. Hover pauses.

import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@aies/aies-ui';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <button aies-button type="button" (click)="ok()">Saved</button>
    <button aies-button type="button" variant="secondary" (click)="warn()">Warn</button>
    <button aies-button type="button" variant="danger" (click)="fail()">Error</button>
  \`,
})
export class ToastDemoComponent {
  private readonly toast = inject(ToastService);

  protected ok(): void {
    this.toast.success('Shipment saved', 'Done');
  }

  protected warn(): void {
    this.toast.warning('Rates may be outdated. Refresh before quoting.');
  }

  protected fail(): void {
    this.toast.error('Could not reach the carrier API.', 'Request failed');
  }
}
`;

export /**
 *
 */
const TOAST_STACK = `
// Same message twice? They collapse into one with ×N.
// X peels one copy; Expand shows all; Close all clears the group.

this.toast.error('Warehouse offline');
this.toast.error('Warehouse offline'); // ×2
`;

export /**
 *
 */
const TOAST_HTTP = `
// Wrap HttpClient calls with withToast(). Success + error on by default.
// Needs provideAiesHttpClient() + provideAiesToasts() in app.config.

import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { withToast } from '@aies/aies-core';

const http = inject(HttpClient);

// Success toast + persistent error toast
http.post('/shipments', body, { context: withToast() }).subscribe();

// Errors only
http.post('/shipments', body, {
  context: withToast({ success: false }),
}).subscribe();

// Custom copy
http.post('/shipments', body, {
  context: withToast({
    successMessage: 'Shipment created',
    errorMessage: 'Could not create shipment',
  }),
}).subscribe();
`;
