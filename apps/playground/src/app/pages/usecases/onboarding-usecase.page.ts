import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Parent route for onboarding auth screens (login, forgot password, first-login
 * password change).
 */
@Component({
  selector: 'app-onboarding-usecase-page',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class OnboardingUsecasePage {}
