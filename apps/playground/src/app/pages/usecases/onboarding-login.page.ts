import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent, TextInputComponent } from '@aies/aies-ui';

import { PageHeaderComponent } from '../../shared/page-header.component';

/**
 * Product `/onboarding/login` — Forgot Password? goes to forgot-password.
 * Sign-in itself is demo-only here (host apps own the login POST).
 */
@Component({
  selector: 'app-onboarding-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent,
    TextInputComponent,
    PageHeaderComponent,
  ],
  template: `
    <div class="pg-page-enter mx-auto flex w-full max-w-lg flex-col gap-8">
      <app-page-header
        eyebrow="Use cases"
        title="Login"
        description="Product path /onboarding/login. Forgot Password? is email-only — it never opens a new-password form for the emailed link."
      />

      <form
        class="flex flex-col gap-4 rounded-xl border border-border bg-white p-6 dark:border-white/10 dark:bg-ink"
        (submit)="$event.preventDefault()"
      >
        <aies-text-input
          type="email"
          label="Email"
          autocomplete="email"
          [(value)]="email"
        />
        <aies-text-input
          type="password"
          label="Password"
          autocomplete="current-password"
          [(value)]="password"
        />
        <div class="flex justify-end">
          <a
            routerLink="/usecases/onboarding/forgot-password"
            class="cursor-pointer text-body-sm font-medium text-ink underline-offset-2 hover:underline dark:text-white"
          >
            Forgot Password?
          </a>
        </div>
        <button aies-button type="submit" variant="primary">Sign in</button>
        <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
          After a real login, if
          <code class="font-mono">user.default_password</code>
          is set, send the user to
          <a
            routerLink="/usecases/onboarding/reset-password"
            class="cursor-pointer font-medium text-ink underline-offset-2 hover:underline dark:text-white"
            >/onboarding/reset-password</a
          >
          to change current → new password. That is not this forgot-password flow.
        </p>
      </form>
    </div>
  `,
})
export class OnboardingLoginPage {
  protected readonly email = signal('');
  protected readonly password = signal('');
}
