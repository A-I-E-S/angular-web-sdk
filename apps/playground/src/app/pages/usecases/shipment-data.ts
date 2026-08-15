/**
 * Sample shipment row for the list → detail use case.
 *
 * `shipmentStatus` / `paymentStatus` match {@link trackShipmentsFilterConfig}
 * field keys so the drawer can filter this fixture.
 */
export interface UsecaseShipment {
  reference: string;
  origin: string;
  destination: string;
  route: string;
  /** Friendly chip label. */
  status: 'In transit' | 'Delivered' | 'Pending' | 'Exception';
  /** `shipment_status` filter value. */
  shipmentStatus: 'pending' | 'in-process' | 'completed';
  /** `payment_status` filter value. */
  paymentStatus: 'paid' | 'unpaid';
  trackingNumber: string;
  updated: string;
}

const ORIGINS = ['Lagos', 'Accra', 'Nairobi', 'Cairo'] as const;
const DESTINATIONS = ['London', 'Manchester', 'Dubai', 'Berlin'] as const;
const STATUSES = [
  {
    status: 'In transit' as const,
    shipmentStatus: 'in-process' as const,
  },
  {
    status: 'Pending' as const,
    shipmentStatus: 'pending' as const,
  },
  {
    status: 'Delivered' as const,
    shipmentStatus: 'completed' as const,
  },
  {
    status: 'Exception' as const,
    shipmentStatus: 'pending' as const,
  },
];

const PINNED: UsecaseShipment[] = [
  {
    reference: 'STN-1042',
    origin: 'Lagos',
    destination: 'London',
    route: 'Lagos → London',
    status: 'In transit',
    shipmentStatus: 'in-process',
    paymentStatus: 'paid',
    trackingNumber: 'TN-8000',
    updated: '2 hours ago',
  },
  {
    reference: 'SFN-8811',
    origin: 'Accra',
    destination: 'Manchester',
    route: 'Accra → Manchester',
    status: 'Pending',
    shipmentStatus: 'pending',
    paymentStatus: 'unpaid',
    trackingNumber: 'TN-8001',
    updated: 'Yesterday',
  },
  {
    reference: 'STN-2207',
    origin: 'Nairobi',
    destination: 'Dubai',
    route: 'Nairobi → Dubai',
    status: 'Delivered',
    shipmentStatus: 'completed',
    paymentStatus: 'paid',
    trackingNumber: 'TN-8002',
    updated: '3 days ago',
  },
  {
    reference: 'SFN-4410',
    origin: 'Cairo',
    destination: 'Berlin',
    route: 'Cairo → Berlin',
    status: 'Exception',
    shipmentStatus: 'pending',
    paymentStatus: 'unpaid',
    trackingNumber: 'TN-8003',
    updated: '5 hours ago',
  },
];

const GENERATED: UsecaseShipment[] = Array.from({ length: 20 }, (_, index) => {
  const n = index + 4;
  const origin = ORIGINS[n % ORIGINS.length] ?? 'Lagos';
  const destination = DESTINATIONS[n % DESTINATIONS.length] ?? 'London';
  const pair = STATUSES[n % STATUSES.length] ?? STATUSES[0];
  const prefix = n % 2 === 0 ? 'STN' : 'SFN';
  return {
    reference: `${prefix}-${3000 + n * 19}`,
    origin,
    destination,
    route: `${origin} → ${destination}`,
    status: pair.status,
    shipmentStatus: pair.shipmentStatus,
    paymentStatus: n % 3 === 0 ? 'unpaid' : 'paid',
    trackingNumber: `TN-${8100 + n}`,
    updated: `${n + 1} hours ago`,
  };
});

/**
 * Demo rows for the list page. Long enough for two pages at the default
 * page size (15). First four ids stay stable for deep links.
 */
export const USECASE_SHIPMENTS: UsecaseShipment[] = [...PINNED, ...GENERATED];

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
