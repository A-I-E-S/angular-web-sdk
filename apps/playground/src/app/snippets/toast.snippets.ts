/**
 * Playground snippets — Toast.
 */

export /**
 *
 */
const TOAST_VARIANTS = `
// Fire a toast from anywhere you can inject ToastService.
// Error (danger) stays until the user closes it. Warning runs longer (~8s).
// Info / success auto-dismiss (~4.5s). Hover pauses the timer.

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
// Identical toasts collapse into one with ×N.
// X peels the outermost copy. Expand shows every copy; Close all clears the group.
// When any stack exists, the host also offers Expand all / Close all.

this.toast.error('Warehouse offline');
this.toast.error('Warehouse offline'); // ×2
`;

export /**
 *
 */
const TOAST_HTTP = `
// Tag HttpClient calls with withToast(). Defaults: success + error both on.
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
