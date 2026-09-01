import {
  isNotificationExternalLink,
  resolveNotificationLinkForMode,
} from './notification-link';

describe('resolveNotificationLinkForMode', () => {
  const exportLink =
    'https://test-admin-export.africaniestest.com/portal/customer/deliveries?page=1&shipment_app=shipfromnaija';

  it('preserves shipment_app and strips legacy host to a relative portal path', () => {
    expect(resolveNotificationLinkForMode(exportLink, 'stn')).toBe(
      '/portal/customer/deliveries?page=1&shipment_app=shipfromnaija',
    );
  });

  it('preserves shipment_app on import portal links', () => {
    const importLink =
      'https://test-customer-import.africaniestest.com/portal/shipment/track-shipment/items/90?shipment_app=shiptonaija';

    expect(resolveNotificationLinkForMode(importLink, 'sfn')).toBe(
      '/portal/shipment/track-shipment/items/90?shipment_app=shiptonaija',
    );
  });

  it('leaves relative portal links with shipment_app unchanged', () => {
    expect(resolveNotificationLinkForMode(exportLink, 'sfn')).toBe(
      '/portal/customer/deliveries?page=1&shipment_app=shipfromnaija',
    );
  });

  it('strips shipment_app from S3 export links', () => {
    const url =
      'https://africanies-staging-test.s3.amazonaws.com/var/www/html/storage/tmp/payouts.xlsx?X-Amz-Signature=abc&shipment_app=shipfromnaija';

    expect(resolveNotificationLinkForMode(url, 'sfn')).toBe(
      'https://africanies-staging-test.s3.amazonaws.com/var/www/html/storage/tmp/payouts.xlsx?X-Amz-Signature=abc',
    );
  });

  it('adds shipment_app when missing on absolute portal URLs', () => {
    const link =
      'https://test-admin-export.africaniestest.com/portal/customer/deliveries?page=1';

    expect(resolveNotificationLinkForMode(link, 'stn')).toBe(
      'https://test-admin-import.africaniestest.com/portal/customer/deliveries?page=1&shipment_app=shiptonaija',
    );
  });
});

describe('isNotificationExternalLink', () => {
  it('treats S3 spreadsheet exports as external', () => {
    expect(
      isNotificationExternalLink(
        'https://africanies-staging-test.s3.amazonaws.com/tmp/export.xlsx?X-Amz-Signature=abc',
      ),
    ).toBe(true);
  });
});
