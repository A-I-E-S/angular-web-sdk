import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { AuthService, isValidEmail } from '@aies/aies-core';
import {
  AlertComponent,
  ButtonComponent,
  TextInputComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../../shared/demo-section.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { playgroundErrorMessage } from '../../shared/playground-notify';
import { USECASE_ONBOARDING_FORGOT } from '../../snippets';

/**
 * Product `/onboarding/forgot-password` — email only. The emailed link is not
 * handled here (no token in the route).
 */
@Component({
  selector: 'app-onboarding-forgot-password-page',
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    TextInputComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter mx-auto flex w-full max-w-lg flex-col gap-8">
      <app-page-header
        eyebrow="Use cases"
        title="Forgot password"
        description="Product path /onboarding/forgot-password. Submit calls AuthService.forgot() — POST { email } to /auth/forgot/password. This app never shows a new-password form for the emailed link."
      />

      <app-demo-section
        title="Email only"
        hint="Submit is enabled only when the address looks valid. Admins can call the same forgot(email) from user/partner screens."
        [code]="routeCode"
      >
        @if (successMessage(); as ok) {
          <div class="flex flex-col gap-4">
            <aies-alert variant="success" [message]="ok" [dismissible]="false" />
            <a
              routerLink="/usecases/onboarding/login"
              class="cursor-pointer text-body-sm font-medium text-ink underline-offset-2 hover:underline dark:text-white"
            >
              Reset completed? Login here
            </a>
          </div>
        } @else {
          <form
            class="flex flex-col gap-4"
            (submit)="$event.preventDefault(); forgot()"
          >
            @if (errorMessage(); as err) {
              <aies-alert variant="danger" [message]="err" [dismissible]="false" />
            }
            <aies-text-input
              type="email"
              label="Email"
              hint="We will send you a password reset link."
              autocomplete="email"
              [(value)]="email"
            />
            <button
              aies-button
              type="submit"
              variant="primary"
              [loading]="sending()"
              [disabled]="!canSubmit()"
            >
              Send reset link
            </button>
            <a
              routerLink="/usecases/onboarding/login"
              class="cursor-pointer text-center text-body-sm font-medium text-ink underline-offset-2 hover:underline dark:text-white"
            >
              Back to login
            </a>
          </form>
        }
      </app-demo-section>
    </div>
  `,
})
export class OnboardingForgotPasswordPage {
  private readonly authApi = inject(AuthService);

  protected readonly email = signal('');
  protected readonly sending = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly routeCode = USECASE_ONBOARDING_FORGOT;

  protected readonly canSubmit = computed(
    () => isValidEmail(this.email()) && !this.sending(),
  );

  protected async forgot(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    this.sending.set(true);
    this.errorMessage.set(null);
    try {
      const res = await firstValueFrom(this.authApi.forgot(this.email()));
      if (res.success) {
        this.successMessage.set(
          res.message?.trim() || 'We have emailed your reset password.',
        );
        return;
      }
      this.errorMessage.set(
        res.message?.trim() || 'Could not send a reset email.',
      );
    } catch (err) {
      this.errorMessage.set(playgroundErrorMessage(err));
    } finally {
      this.sending.set(false);
    }
  }
}
