import {
  mapUser,
  mapUserCountry,
  mapUserStateLabel,
  USER_PATH,
} from './user.mapper';

const WIRE_USER = {
  id: 48,
  central_id: '50fb183b-af87-4e4d-9384-c960d8a1b852',
  name: 'Oladotun Adedeji',
  first_name: 'Oladotun',
  middle_name: null,
  last_name: 'Adedeji',
  email: 'oladotun.a@africanies.com',
  phone: '08092010507',
  unit_number: 'oladotun.a@africanies.com',
  referral_code: 'PLEQP2WK',
  old_unit_number: null,
  account_email: null,
  two_factor: false,
  default_pin: true,
  model: 'App\\Models\\Admin',
  country: {
    id: 163,
    name: 'Nigeria',
    iso3: 'NGA',
    iso2: 'NG',
    states: [{ name: 'Lagos State', state_code: 'LA' }],
  },
  state: null,
  email_verified_at: '2024-12-17T12:05:47.000000Z',
  phone_verified_at: '2024-12-17T12:05:47.000000Z',
  kyc_verified_at: null,
  passport_verified_at: null,
  suspended_at: null,
  deactivated_at: null,
  active: true,
  default_password: false,
  type: 'individual',
  deleted_at: null,
  created_at: null,
  updated_at: '2026-08-13T14:05:42.000000Z',
  last_login_at: '2026-08-13 15:05:42',
  socialite_signup: 0,
  form_signup: 0,
  main_region: 'ng',
  shipping_type: 'consolidation',
  accounts: [],
  business_account: {
    id: 10,
    user_id: 48,
    name: 'Acme',
    type: 'business',
    plan_type: 'monthly',
    days_left: 12,
    plan: {
      id: 1,
      name: 'Starter',
      packages: [{ id: 2, name: 'Box', discount: '10%' }],
    },
    subscription: {
      id: 3,
      currency: 'NGN',
      payment_payload: '{"url":"https://pay.example"}',
      plan_type: 'monthly',
    },
  },
  account_manager: {
    id: 5,
    name: 'Ada',
    email: 'ada@africanies.com',
  },
};

describe('user.mapper', () => {
  it('exposes the user path', () => {
    expect(USER_PATH).toBe('/user');
  });

  it('maps bare snake_case user payloads without renaming keys', () => {
    const mapped = mapUser(WIRE_USER);
    expect(mapped.id).toBe(48);
    expect(mapped.central_id).toBe('50fb183b-af87-4e4d-9384-c960d8a1b852');
    expect(mapped.first_name).toBe('Oladotun');
    expect(mapped.last_name).toBe('Adedeji');
    expect(mapped.middle_name).toBeNull();
    expect(mapped.two_factor).toBe(false);
    expect(mapped.default_pin).toBe(true);
    expect(mapped.socialite_signup).toBe(0);
    expect(mapped.form_signup).toBe(0);
    expect(mapped.main_region).toBe('ng');
    expect(mapped.shipping_type).toBe('consolidation');
    expect(mapped.state).toBeNull();
    expect(mapped.country?.iso2).toBe('NG');
    expect(mapped.country?.states?.[0]?.state_code).toBe('LA');
    expect(mapped.last_login_at).toBe('2026-08-13 15:05:42');
    expect(mapped.business_account?.name).toBe('Acme');
    expect(mapped.business_account?.plan?.packages?.[0]?.name).toBe('Box');
    expect(mapped.business_account?.subscription?.currency).toBe('NGN');
    expect(mapped.account_manager?.email).toBe('ada@africanies.com');
    expect(mapped.accounts).toEqual([]);
  });

  it('mapUserCountry returns null for non-objects', () => {
    expect(mapUserCountry(null)).toBeNull();
  });

  it('mapUserStateLabel accepts string or object name', () => {
    expect(mapUserStateLabel(null)).toBeNull();
    expect(mapUserStateLabel('Lagos')).toBe('Lagos');
    expect(mapUserStateLabel({ name: 'Lagos State' })).toBe('Lagos State');
  });
});
