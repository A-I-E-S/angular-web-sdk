import { Route } from '@angular/router';

export /**
 *
 */
const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePage),
  },
  {
    path: 'components/button',
    loadComponent: () =>
      import('./pages/button-page').then((m) => m.ButtonPage),
  },
  {
    path: 'components/alert',
    loadComponent: () =>
      import('./pages/alert-page').then((m) => m.AlertPage),
  },
  {
    path: 'components/chip',
    loadComponent: () =>
      import('./pages/chip-page').then((m) => m.ChipPage),
  },
  {
    path: 'components/action-menu',
    loadComponent: () =>
      import('./pages/action-menu-page').then((m) => m.ActionMenuPage),
  },
  {
    path: 'components/feedback',
    loadComponent: () =>
      import('./pages/feedback-page').then((m) => m.FeedbackPage),
  },
  {
    path: 'components/overlays',
    loadComponent: () =>
      import('./pages/overlay-page').then((m) => m.OverlayPage),
  },
  {
    path: 'components/forms',
    loadComponent: () =>
      import('./pages/forms-page').then((m) => m.FormsPage),
  },
  {
    path: 'components/filters',
    loadComponent: () =>
      import('./pages/filters-page').then((m) => m.FiltersPage),
  },
  {
    path: 'components/tooltip',
    loadComponent: () =>
      import('./pages/tooltip-page').then((m) => m.TooltipPage),
  },
  {
    path: 'components/toast',
    loadComponent: () =>
      import('./pages/toast-page').then((m) => m.ToastPage),
  },
  {
    path: 'components/table',
    loadComponent: () =>
      import('./pages/table-page').then((m) => m.TablePage),
  },
  {
    path: 'components/stepper',
    loadComponent: () =>
      import('./pages/stepper-page').then((m) => m.StepperPage),
  },
  {
    path: 'components/navigation',
    loadComponent: () =>
      import('./pages/navigation-page').then((m) => m.NavigationPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/nav-route-panels').then((m) => m.NavOverviewPanel),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/nav-route-panels').then((m) => m.NavDocumentsPanel),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/nav-route-panels').then((m) => m.NavEventsPanel),
      },
    ],
  },
  {
    path: 'usecases/shipment',
    loadComponent: () =>
      import('./pages/usecases/shipment-usecase.page').then(
        (m) => m.ShipmentUsecasePage,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/usecases/shipment-list.page').then(
            (m) => m.ShipmentListPage,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/usecases/shipment-detail.page').then(
            (m) => m.ShipmentDetailPage,
          ),
      },
    ],
  },
  {
    path: 'usecases/onboarding',
    loadComponent: () =>
      import('./pages/usecases/onboarding-usecase.page').then(
        (m) => m.OnboardingUsecasePage,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/usecases/onboarding-login.page').then(
            (m) => m.OnboardingLoginPage,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/usecases/onboarding-forgot-password.page').then(
            (m) => m.OnboardingForgotPasswordPage,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/usecases/onboarding-reset-password.page').then(
            (m) => m.OnboardingResetPasswordPage,
          ),
      },
    ],
  },
  {
    path: 'lecture',
    loadComponent: () =>
      import('./pages/lecture-page').then((m) => m.LecturePage),
  },
  {
    path: 'icons',
    loadComponent: () =>
      import('./pages/icons-page').then((m) => m.IconsPage),
  },
  {
    path: 'tokens',
    loadComponent: () =>
      import('./pages/tokens-page').then((m) => m.TokensPage),
  },
  // Temporarily blocked — restore loadComponent routes when re-enabling.
  {
    path: 'models',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'api',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  // {
  //   path: 'models',
  //   loadComponent: () =>
  //     import('./pages/models-page').then((m) => m.ModelsPage),
  // },
  // {
  //   path: 'api',
  //   loadComponent: () =>
  //     import('./pages/api-page').then((m) => m.ApiPage),
  // },
];
