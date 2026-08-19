import {
  headerGreetingFirstName,
  headerGreetingPeriod,
  headerGreetingPool,
  pickHeaderGreeting,
} from './header-greeting.util';

describe('headerGreetingFirstName', () => {
  it('returns the first token', () => {
    expect(headerGreetingFirstName('Busola Omosipe')).toBe('Busola');
  });

  it('returns empty when missing', () => {
    expect(headerGreetingFirstName(null)).toBe('');
    expect(headerGreetingFirstName('  ')).toBe('');
  });
});

describe('headerGreetingPeriod', () => {
  it('maps local hours to finer windows', () => {
    expect(headerGreetingPeriod(atHour(2))).toBe('wee-hours');
    expect(headerGreetingPeriod(atHour(5))).toBe('dawn');
    expect(headerGreetingPeriod(atHour(7))).toBe('early-morning');
    expect(headerGreetingPeriod(atHour(10))).toBe('morning');
    expect(headerGreetingPeriod(atHour(12))).toBe('midday');
    expect(headerGreetingPeriod(atHour(15))).toBe('afternoon');
    expect(headerGreetingPeriod(atHour(17))).toBe('dusk');
    expect(headerGreetingPeriod(atHour(20))).toBe('evening');
    expect(headerGreetingPeriod(atHour(23))).toBe('late-night');
  });
});

describe('pickHeaderGreeting', () => {
  it('returns null without a name', () => {
    expect(pickHeaderGreeting(null)).toBeNull();
  });

  it('puts the given name on its own field', () => {
    const greeting = pickHeaderGreeting('Busola Omosipe', atHour(8));
    expect(greeting?.name).toBe('Busola');
    expect(greeting?.kicker).toBeTruthy();
  });

  it('picks from the period pool', () => {
    const wee = pickHeaderGreeting('Ada', atHour(2));
    expect(headerGreetingPool('wee-hours')).toContain(wee?.kicker);

    const dusk = pickHeaderGreeting('Ada', atHour(18));
    expect(headerGreetingPool('dusk')).toContain(dusk?.kicker);
  });

  it('is stable within a period on the same day', () => {
    expect(pickHeaderGreeting('Ada', atHour(9, 0))).toEqual(
      pickHeaderGreeting('Ada', atHour(9, 45)),
    );
  });

  it('can change when the period changes', () => {
    const night = pickHeaderGreeting('Ada', atHour(2));
    const afternoon = pickHeaderGreeting('Ada', atHour(15));
    expect(night?.kicker).not.toBe(afternoon?.kicker);
  });

  it('mixes weather lines into the pool when a forecast is present', () => {
    const rain = { kind: 'rain' as const };
    const pool = headerGreetingPool('afternoon', rain);
    expect(pool).toEqual(
      expect.arrayContaining(['Rainy round?', 'Afternoon stretch.']),
    );

    const greeting = pickHeaderGreeting('Ada', atHour(15), rain);
    expect(pool).toContain(greeting?.kicker);
  });
});

function atHour(hour: number, minute = 0): Date {
  return new Date(2026, 7, 14, hour, minute, 0);
}
