import { Route } from '@angular/router';

export /**
 *
 */
const appRoutes: Route[] = [
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
    path: 'components/alert',
    loadComponent: () =>
      import('./pages/alert-page').then((m) => m.AlertPage),
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
