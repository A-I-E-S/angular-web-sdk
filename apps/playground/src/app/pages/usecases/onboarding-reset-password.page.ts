import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { AuthTokenService, UserService } from '@africanies/africanies-core';
import {
  AlertComponent,
  ButtonComponent,
  TextInputComponent,
} from '@africanies/africanies-ui';

import { PageHeaderComponent } from '../../shared/page-header.component';
import { playgroundErrorMessage } from '../../shared/playground-notify';

/**
 * Product `/onboarding/reset-password` — first login with a default password.
 * Not the email-link forgot-password flow (no token in this route).
 */
@Component({
  selector: 'app-onboarding-reset-password-page',
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    TextInputComponent,
    PageHeaderComponent,
  ],
  template: `
    <div class="pg-page-enter mx-auto flex w-full max-w-lg flex-col gap-8">
      <app-page-header
        eyebrow="Use cases"
        title="Change default password"
        description="Product path /onboarding/reset-password. After login, if user.default_password is set, change current → new via POST /user/change/password, then go to the dashboard. This is not the emailed reset-link flow."
      />

      <form
        class="flex flex-col gap-4 rounded-xl border border-border bg-white p-6 dark:border-white/10 dark:bg-ink-950"
        (submit)="$event.preventDefault(); save()"
      >
        @if (errorMessage(); as err) {
          <africanies-alert variant="danger" [message]="err" [dismissible]="false" />
        }
        @if (successMessage(); as ok) {
          <africanies-alert variant="success" [message]="ok" [dismissible]="false" />
        }

        @if (!hasToken()) {
          <africanies-alert
            variant="warning"
            message="This call needs a bearer token. Paste one in API token, then retry."
            [dismissible]="false"
          />
        }

        <africanies-text-input
          type="password"
          label="Current password"
          autocomplete="current-password"
          [(value)]="currentPassword"
        />
        <africanies-text-input
          type="password"
          label="New password"
          autocomplete="new-password"
          [(value)]="password"
        />
        <africanies-text-input
          type="password"
          label="Confirm new password"
          autocomplete="new-password"
          [error]="confirmError()"
          [(value)]="confirmation"
        />
        <button
          africanies-button
          type="submit"
          variant="primary"
          [loading]="saving()"
          [disabled]="!canSubmit()"
        >
          Update password
        </button>
        <a
          routerLink="/usecases/onboarding/login"
          class="cursor-pointer text-center text-body-sm font-medium text-ink underline-offset-2 hover:underline dark:text-white"
        >
          Back to login
        </a>
      </form>
    </div>
  `,
})
export class OnboardingResetPasswordPage {
  private readonly users = inject(UserService);
  private readonly auth = inject(AuthTokenService);

  protected readonly currentPassword = signal('');
  protected readonly password = signal('');
  protected readonly confirmation = signal('');
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly hasToken = computed(() => this.auth.token() != null);

  protected readonly confirmError = computed(() => {
    const next = this.password();
    const confirm = this.confirmation();
    if (!confirm || next === confirm) {
      return null;
    }
    return 'Passwords do not match.';
  });

  protected readonly canSubmit = computed(() => {
    const current = this.currentPassword().trim();
    const next = this.password().trim();
    const confirm = this.confirmation().trim();
    return (
      this.hasToken() &&
      !this.saving() &&
      current !== '' &&
      next !== '' &&
      next === confirm
    );
  });

  protected async save(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    try {
      const res = await firstValueFrom(
        this.users.changePassword({
          current_password: this.currentPassword(),
          password: this.password(),
          password_confirmation: this.confirmation(),
        }),
      );
      if (res.success) {
        this.successMessage.set(
          res.message?.trim() || 'Password updated. Continue to the dashboard.',
        );
        return;
      }
      this.errorMessage.set(res.message?.trim() || 'Could not update password.');
    } catch (err) {
      this.errorMessage.set(
        playgroundErrorMessage(err, { suggestApiToken: true }),
      );
    } finally {
      this.saving.set(false);
    }
  }
}
