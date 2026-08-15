export /**
 *
 */
const USECASE_SHIPMENT_BACK = `// No Back button or breadcrumbs to build. aies-app-shell shows both in the
// content chrome. Back appears only on child routes (and still does after a
// pasted / reloaded URL). Nested children under a parent is all the app needs.
//
// List filters + pagination live on the query string (FilterQueryService).
// Open detail with queryParamsHandling: 'preserve' so Back restores page/filters.

import { FilterQueryService, trackShipmentsFilterConfig } from '@aies/aies-ui';

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

// List page — seed from the URL, then let Apply / aies-pagination write back:
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
