import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { AuthService, isValidEmail } from '@aies/aies-core';
import {
  AlertComponent,
  ButtonComponent,
  TextInputComponent,
} from '@aies/aies-ui';

import { playgroundErrorMessage } from './playground-notify';

/**
 * Live {@link AuthService.forgot} try-out for the SDK API page.
 */
@Component({
  selector: 'app-playground-forgot-password',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, TextInputComponent, RouterLink],
  template: `
    <form
      class="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-background-welcome p-4 dark:border-white/10 dark:bg-white/[0.03]"
      (submit)="$event.preventDefault(); forgot()"
    >
      <p class="m-0 text-body-sm font-medium text-ink dark:text-white">
        Try it
      </p>
      <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
        We will send you a password reset link.
      </p>

      @if (successMessage(); as ok) {
        <aies-alert variant="success" [message]="ok" [dismissible]="false" />
        <a
          routerLink="/usecases/onboarding/login"
          class="cursor-pointer text-body-sm font-medium text-ink underline-offset-2 hover:underline dark:text-white"
        >
          Reset completed? Login here
        </a>
      } @else {
        @if (errorMessage(); as err) {
          <aies-alert variant="danger" [message]="err" [dismissible]="false" />
        }
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <aies-text-input
            class="min-w-0 flex-1"
            type="email"
            label="Email"
            autocomplete="email"
            placeholder="you@example.com"
            [(value)]="email"
          />
          <button
            aies-button
            type="submit"
            variant="primary"
            size="sm"
            class="shrink-0"
            [loading]="sending()"
            [disabled]="!canSubmit()"
          >
            Send reset link
          </button>
        </div>
      }
    </form>
  `,
})
export class PlaygroundForgotPasswordComponent {
  private readonly authApi = inject(AuthService);

  protected readonly email = signal('');
  protected readonly sending = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

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
