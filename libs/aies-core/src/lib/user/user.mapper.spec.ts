import { mapUser, mapUserState, USER_PATH } from './user.mapper';

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
  business_account: null,
  account_manager: null,
};

describe('user.mapper', () => {
  it('exposes the user path', () => {
    expect(USER_PATH).toBe('/user');
  });

  it('maps bare snake_case user payloads', () => {
    const mapped = mapUser(WIRE_USER);
    expect(mapped.id).toBe(48);
    expect(mapped.centralId).toBe('50fb183b-af87-4e4d-9384-c960d8a1b852');
    expect(mapped.firstName).toBe('Oladotun');
    expect(mapped.lastName).toBe('Adedeji');
    expect(mapped.middleName).toBeNull();
    expect(mapped.twoFactor).toBe(false);
    expect(mapped.defaultPin).toBe(true);
    expect(mapped.socialiteSignup).toBe(false);
    expect(mapped.formSignup).toBe(false);
    expect(mapped.mainRegion).toBe('ng');
    expect(mapped.shippingType).toBe('consolidation');
    expect(mapped.state).toBeNull();
    expect(mapped.country?.iso2).toBe('NG');
    expect(mapped.country?.states[0]?.stateCode).toBe('LA');
    expect(mapped.lastLoginAt).toBe('2026-08-13 15:05:42');
  });

  it('mapUserState returns null for non-objects', () => {
    expect(mapUserState(null)).toBeNull();
  });
});
