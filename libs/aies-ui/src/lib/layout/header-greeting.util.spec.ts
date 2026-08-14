import {
  headerGreetingFirstName,
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

describe('pickHeaderGreeting', () => {
  it('returns null without a name', () => {
    expect(pickHeaderGreeting(null)).toBeNull();
  });

  it('puts the given name on its own field', () => {
    const greeting = pickHeaderGreeting(
      'Busola Omosipe',
      new Date('2026-08-14T08:15:00'),
    );
    expect(greeting?.name).toBe('Busola');
    expect(greeting?.kicker).toBeTruthy();
    expect(greeting?.kicker).not.toMatch(/Good afternoon|Good evening/);
  });

  it('includes an emoji in the kicker', () => {
    const greeting = pickHeaderGreeting(
      'Ada',
      new Date('2026-08-14T08:15:00'),
    );
    expect(greeting?.kicker).toMatch(/\p{Extended_Pictographic}/u);
  });

  it('is stable for the same name and day', () => {
    const morning = new Date('2026-08-14T09:00:00');
    const later = new Date('2026-08-14T09:45:00');
    expect(pickHeaderGreeting('Ada', morning)).toEqual(
      pickHeaderGreeting('Ada', later),
    );
  });
});
