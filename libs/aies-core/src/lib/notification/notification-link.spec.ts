import { resolveNotificationLinkForMode } from './notification-link';

describe('resolveNotificationLinkForMode', () => {
  const exportLink =
    'https://test-admin-export.africaniestest.com/portal/customer/deliveries?page=1&shipment_app=shipfromnaija';

  it('rewrites export links for STN import mode', () => {
    expect(resolveNotificationLinkForMode(exportLink, 'stn')).toBe(
      'https://test-admin-import.africaniestest.com/portal/customer/deliveries?page=1&shipment_app=shiptonaija',
    );
  });

  it('rewrites import links for SFN export mode', () => {
    const importLink =
      'https://test-customer-import.africaniestest.com/portal/shipment/track-shipment/items/90?shipment_app=shiptonaija';

    expect(resolveNotificationLinkForMode(importLink, 'sfn')).toBe(
      'https://test-customer-export.africaniestest.com/portal/shipment/track-shipment/items/90?shipment_app=shipfromnaija',
    );
  });

  it('leaves SFN export links unchanged when mode is SFN', () => {
    expect(resolveNotificationLinkForMode(exportLink, 'sfn')).toBe(exportLink);
  });
});
