import type { ModeConfigDataModel } from '@aies/aies-models';

import {
  mapModeConfigData,
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
      dimensionUnit: 'cm',
      massUnit: 'KG',
      currency: 'USD',
      currencySymbol: '$',
    });
    expect(config.sfn.ng.currencySymbol).toBe('₦');
  });

  it('resolves STN country regions from saved record', () => {
    expect(resolveModeRegionConfig(config, 'stn', 'us').massUnit).toBe('LBS');
    expect(resolveModeRegionConfig(config, 'stn', 'cn').dimensionUnit).toBe('cm');
    expect(resolveModeRegionConfig(config, 'stn', 'gb').currency).toBe('USD');
  });

  it('falls back to mode default for unknown country codes', () => {
    expect(resolveModeRegionConfig(config, 'stn', 'fr').massUnit).toBe('LBS');
    expect(resolveModeRegionConfig(config, 'sfn', 'us').currency).toBe('NGN');
  });

  it('uses default when country code is empty', () => {
    expect(resolveModeRegionConfig(config, 'stn', null).currencySymbol).toBe('$');
  });
});
