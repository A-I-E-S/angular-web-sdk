import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePage),
  },
  {
    path: 'components/button',
    loadComponent: () =>
      import('./pages/button-page').then((m) => m.ButtonPage),
  },
  {
    path: 'components/feedback',
    loadComponent: () =>
      import('./pages/feedback-page').then((m) => m.FeedbackPage),
  },
  {
    path: 'components/forms',
    loadComponent: () =>
      import('./pages/forms-page').then((m) => m.FormsPage),
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
    path: 'icons',
    loadComponent: () =>
      import('./pages/icons-page').then((m) => m.IconsPage),
  },
  {
    path: 'tokens',
    loadComponent: () =>
      import('./pages/tokens-page').then((m) => m.TokensPage),
  },
  {
    path: 'models',
    loadComponent: () =>
      import('./pages/models-page').then((m) => m.ModelsPage),
  },
];
