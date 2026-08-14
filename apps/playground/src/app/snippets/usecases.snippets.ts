export /**
 *
 */
const USECASE_SHIPMENT_BACK = `// No Back button or breadcrumbs to build. aies-app-shell shows both in the
// content chrome. Back appears only on child routes (and still does after a
// pasted / reloaded URL). Nested children under a parent is all the app needs:

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
`;
