/**
 * Sample shipment row for the Back button and Breadcrumbs use case.
 */
export interface UsecaseShipment {
  reference: string;
  origin: string;
  destination: string;
  route: string;
  status: 'In transit' | 'Delivered' | 'Pending' | 'Exception';
  updated: string;
}

/** Demo rows shown on the Back button and Breadcrumbs list. */
export const USECASE_SHIPMENTS: UsecaseShipment[] = [
  {
    reference: 'STN-1042',
    origin: 'Lagos',
    destination: 'London',
    route: 'Lagos → London',
    status: 'In transit',
    updated: '2 hours ago',
  },
  {
    reference: 'SFN-8811',
    origin: 'Accra',
    destination: 'Manchester',
    route: 'Accra → Manchester',
    status: 'Pending',
    updated: 'Yesterday',
  },
  {
    reference: 'STN-2207',
    origin: 'Nairobi',
    destination: 'Dubai',
    route: 'Nairobi → Dubai',
    status: 'Delivered',
    updated: '3 days ago',
  },
  {
    reference: 'SFN-4410',
    origin: 'Cairo',
    destination: 'Berlin',
    route: 'Cairo → Berlin',
    status: 'Exception',
    updated: '5 hours ago',
  },
];

/**
 * Looks up a demo shipment by reference.
 *
 * @param reference - Shipment id from the route.
 * @returns Matching row, or `undefined` when unknown.
 */
export function findUsecaseShipment(
  reference: string,
): UsecaseShipment | undefined {
  return USECASE_SHIPMENTS.find((row) => row.reference === reference);
}
