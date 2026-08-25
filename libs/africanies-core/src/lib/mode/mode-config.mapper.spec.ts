import type { ModeConfigDataModel } from '@africanies/africanies-models';

import {
  mapModeConfigData,
  mapRegionConfig,
  resolveModeRegionConfig,
} from './mode-config.mapper';

/** Sample wire payload from GET /public/mode/config (abbreviated keys). */
const WIRE_SAMPLE = {
  sfn: {
    default: {
      dimension_unit: 'cm',
      mass_unit: 'KG',
      currency: 'NGN',
      currency_symbol: '₦',
    },
    ng: {
      dimension_unit: 'cm',
      mass_unit: 'KG',
      currency: 'NGN',
      currency_symbol: '₦',
    },
  },
  stn: {
    default: {
      dimension_unit: 'inches',
      mass_unit: 'LBS',
      currency: 'USD',
      currency_symbol: '$',
    },
    us: {
      dimension_unit: 'inches',
      mass_unit: 'LBS',
      currency: 'USD',
      currency_symbol: '$',
    },
    cn: {
      dimension_unit: 'cm',
      mass_unit: 'KG',
      currency: 'USD',
      currency_symbol: '$',
    },
    gb: {
      dimension_unit: 'inches',
      mass_unit: 'LBS',
      currency: 'USD',
      currency_symbol: '$',
    },
  },
} as const;

describe('mode-config.mapper', () => {
  let config: ModeConfigDataModel;

  beforeEach(() => {
    config = mapModeConfigData(WIRE_SAMPLE);
  });

  it('maps snake_case wire fields to camelCase ModeConfigDataModel', () => {
    expect(config.stn.cn).toEqual({
      dimension_unit: 'cm',
      mass_unit: 'KG',
      currency: 'USD',
      currency_symbol: '$',
    });
    expect(config.sfn.ng.currency_symbol).toBe('₦');
  });

  it('resolves STN country regions from saved record', () => {
    expect(resolveModeRegionConfig(config, 'stn', 'us').mass_unit).toBe('LBS');
    expect(resolveModeRegionConfig(config, 'stn', 'cn').dimension_unit).toBe('cm');
    expect(resolveModeRegionConfig(config, 'stn', 'gb').currency).toBe('USD');
  });

  it('falls back to mode default for unknown country codes', () => {
    expect(resolveModeRegionConfig(config, 'stn', 'fr').mass_unit).toBe('LBS');
    expect(resolveModeRegionConfig(config, 'sfn', 'us').currency).toBe('NGN');
  });

  it('uses default when country code is empty', () => {
    expect(resolveModeRegionConfig(config, 'stn', null).currency_symbol).toBe('$');
  });

  it('fills missing mode branches with safe defaults (never undefined)', () => {
    const empty = mapModeConfigData({});
    expect(empty.sfn.default).toEqual({
      dimension_unit: 'cm',
      mass_unit: 'KG',
      currency: 'NGN',
      currency_symbol: '',
    });
    expect(empty.sfn.ng).toEqual(empty.sfn.default);
    expect(empty.stn.us.currency).toBe('NGN');
    expect(empty.stn.cn.dimension_unit).toBe('cm');
    expect(empty.stn.gb.mass_unit).toBe('KG');
  });

  it('coerces invalid region unions to defaults', () => {
    const mapped = mapRegionConfig({
      dimension_unit: 'yards',
      mass_unit: 'stones',
      currency: 'EUR',
    });
    expect(mapped.dimension_unit).toBe('cm');
    expect(mapped.mass_unit).toBe('KG');
    expect(mapped.currency).toBe('NGN');
  });
});
