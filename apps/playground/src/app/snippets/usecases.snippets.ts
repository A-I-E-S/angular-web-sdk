export /**
 *
 */
const USECASE_SHIPMENT_BACK = `// No Back button or breadcrumbs to build. africanies-app-shell shows both in the
// content chrome. Back appears only on child routes (and still does after a
// pasted / reloaded URL). Nested children under a parent is all the app needs.
//
// List filters + pagination live on the query string (FilterQueryService).
// Open detail with queryParamsHandling: 'preserve' so Back restores page/filters.

import { FilterQueryService, trackShipmentsFilterConfig } from '@africanies/africanies-ui';

const routes: Route[] = [
  {
    path: 'usecases/shipment',
    loadComponent: () =>
      import('./shipment-usecase.page').then((m) => m.ShipmentUsecasePage),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./shipment-list.page').then((m) => m.ShipmentListPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./shipment-detail.page').then((m) => m.ShipmentDetailPage),
      },
    ],
  },
];

// List page — seed from the URL, then let Apply / africanies-pagination write back:
const filterQuery = inject(FilterQueryService);
const config = trackShipmentsFilterConfig;
const state = filterQuery.hasParams(config)
  ? filterQuery.read(config)
  : emptyFilterState();

// Detail navigation keeps the list queries on the URL:
this.router.navigate(['/usecases/shipment', row.reference], {
  queryParamsHandling: 'preserve',
});
`;

export /**
 *
 */
const USECASE_ONBOARDING_FORGOT = `// Forgot password is email-only. Login → /onboarding/forgot-password.
// Submit POSTs { email } to /auth/forgot/password. This app does not handle
// the emailed link (no token in the route). /onboarding/reset-password is a
// different flow: first login when user.default_password is set.

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, isValidEmail } from '@africanies/africanies-core';
import { firstValueFrom } from 'rxjs';

const routes: Route[] = [
  { path: 'onboarding/login', loadComponent: () => import('./login.page') },
  {
    path: 'onboarding/forgot-password',
    loadComponent: () => import('./forgot-password.page'),
  },
  // NOT part of forgot-password — first login with a default password:
  {
    path: 'onboarding/reset-password',
    loadComponent: () => import('./reset-password.page'),
  },
];

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  template: \`
    <p>We will send you a password reset link.</p>
    <africanies-text-input type="email" label="Email" [(value)]="email" />
    <button
      africanies-button
      type="button"
      [disabled]="!canSubmit()"
      [loading]="sending()"
      (click)="forgot()"
    >
      Send reset link
    </button>
    @if (message(); as copy) {
      <p>{{ copy }}</p>
      <a routerLink="/onboarding/login">Reset completed? Login here</a>
    }
  \`,
})
export class ForgotPasswordPage {
  private readonly authApi = inject(AuthService);
  protected readonly email = signal('');
  protected readonly sending = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly canSubmit = computed(() => isValidEmail(this.email()));

  protected async forgot(): Promise<void> {
    if (!this.canSubmit()) return;
    this.sending.set(true);
    try {
      const res = await firstValueFrom(this.authApi.forgot(this.email()));
      if (res.success) {
        this.message.set(res.message?.trim() ?? null);
      }
    } finally {
      this.sending.set(false);
    }
  }
}

// After login:
// if (user.default_password) router.navigate(['/onboarding/reset-password']);
// reset-password calls UserService.changePassword({ current_password, password, password_confirmation })
// Admins can also call authApi.forgot(user.email) from user/partner screens.
`;

