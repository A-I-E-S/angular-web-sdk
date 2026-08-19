/** Daily header greeting: a short kicker plus the given name. */
export interface HeaderGreeting {
  /** Time-of-day or weather line, shown above the name. */
  kicker: string;
  /** Given name — the visual focus of the header. */
  name: string;
}

/** Local-hour slices, finer than morning / afternoon / evening. */
export type HeaderGreetingPeriod =
  | 'wee-hours'
  | 'dawn'
  | 'early-morning'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'dusk'
  | 'evening'
  | 'late-night';

/** Coarse weather used to flavour the kicker when a forecast is available. */
export type HeaderWeatherKind =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm';

/** Optional forecast snapshot for {@link pickHeaderGreeting}. */
export interface HeaderWeather {
  kind: HeaderWeatherKind;
  /** Celsius, when the forecast includes it. */
  temperatureC?: number;
  /** City from IP geolocation, when known. */
  city?: string;
}

const PERIOD_KICKERS: Record<HeaderGreetingPeriod, readonly string[]> = {
  'wee-hours': [
    'Moonlit chat?',
    'Still here?',
    'Quiet hours.',
    'Night-owl desk.',
    "The city's asleep.",
    'Burning the midnight oil?',
    'Late-night glow.',
    'Stars are out.',
    'Hushed shift.',
    'After midnight.',
    'Just us and the dark.',
    'Owl hours.',
  ],
  dawn: [
    'First light.',
    'Dawn patrol.',
    'Before the rush.',
    "The sky's waking up.",
    'Early bird.',
    'Sunrise shift.',
    "Coffee's brewing.",
    'Soft morning.',
    'Ahead of the day.',
    'Pale gold hour.',
    'World still yawning.',
    'Catch the quiet.',
  ],
  'early-morning': [
    'Rise and shine.',
    "Let's ease in.",
    'Bright and early.',
    'Warm-up lap.',
    "Day's just starting.",
    'Stretch and go.',
    'Morning pages.',
    'Good hour to begin.',
    'Easy does it.',
    'First coffee?',
    'Laces tied.',
    'Fresh notebook energy.',
  ],
  morning: [
    'Morning momentum.',
    'Ready to ship?',
    "Let's make it count.",
    'Onward.',
    'Full steam.',
    "Let's clear the decks.",
    'Good hour for it.',
    'Inbox awaits.',
    "Let's get into it.",
    'Lights are on.',
    'Plotting the day?',
    'Open the windows.',
  ],
  midday: [
    'Midday check-in.',
    "Sun's high.",
    'Halfway there.',
    'Peak hours.',
    'Lunch-adjacent.',
    'Keep the pace.',
    'Quick reset?',
    'Still rolling.',
    'High noon.',
    'Midday desk.',
    'Second act.',
    'Refill and resume.',
  ],
  afternoon: [
    'Afternoon stretch.',
    'Second wind?',
    'Back at it.',
    'Steady on.',
    'Still plenty of day.',
    'Carry it forward.',
    'Afternoon light.',
    'Keep going.',
    'Golden grind.',
    'Long-shadow hours.',
    'Push the next tile.',
    'Not done yet.',
  ],
  dusk: [
    'Golden hour.',
    'Evening glow.',
    'Last daylight.',
    'Wrapping the day?',
    'Soft landing.',
    'Dusk desk.',
    'Sunset shift.',
    'Almost there.',
    "Light's going gold.",
    'Close of play?',
    'Sky on fire.',
    'Blue hour soon.',
  ],
  evening: [
    'Evening session.',
    "Night's coming in.",
    'After hours?',
    'Evening quiet.',
    'One more round?',
    'Lights are low.',
    'Evening desk.',
    'Unwind or push?',
    'Settling in.',
    'Lamp-light hours.',
    'City lights on.',
    'Slow the tempo?',
  ],
  'late-night': [
    'Moonlit chat?',
    'Late shift.',
    'Quiet tonight.',
    'Still glowing?',
    'Night desk.',
    'Hushed hours.',
    'Wrap it gently?',
    'Starside.',
    'Last lap?',
    'Soft landing tonight.',
    'The moon is clocked in.',
    'Dim the noise.',
  ],
};

const WEATHER_KICKERS: Record<HeaderWeatherKind, readonly string[]> = {
  clear: ['Clear skies.', "Sun's out.", 'Bright out there.', 'Blue overhead.'],
  cloudy: ['Soft grey day.', 'Cloud cover.', 'Overcast calm.', 'Grey but going.'],
  fog: ['Foggy out.', 'Misty hours.', 'Wrapped in fog.', 'Low and quiet.'],
  drizzle: ['Light drizzle.', 'Soft rain.', 'Grey and gentle.', 'A little wet out.'],
  rain: ['Rainy round?', 'Wet out there.', 'Cozy weather for it.', 'Rain on the glass.'],
  snow: ['Snow in the air.', 'Flurries out.', 'Cold sparkle.', 'Winter at the window.'],
  storm: ['Stormy out.', 'Wild skies.', 'Hold tight.', 'Thunder weather.'],
};

const NOTABLE_WEATHER: ReadonlySet<HeaderWeatherKind> = new Set([
  'rain',
  'snow',
  'storm',
  'fog',
]);

/**
 * First given name from a display name or `first_name` field.
 *
 * @param value - Full name or given name.
 * @returns First token, or empty string when missing.
 */
export function headerGreetingFirstName(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return '';
  }

  return trimmed.split(/\s+/)[0] ?? '';
}

/**
 * Greeting window for a local clock hour.
 *
 * @param now - Clock used to read the hour.
 * @returns Slice of the day used to pick a kicker list.
 */
export function headerGreetingPeriod(now: Date): HeaderGreetingPeriod {
  const hour = now.getHours();
  if (hour < 5) {
    return 'wee-hours';
  }
  if (hour < 7) {
    return 'dawn';
  }
  if (hour < 9) {
    return 'early-morning';
  }
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 14) {
    return 'midday';
  }
  if (hour < 17) {
    return 'afternoon';
  }
  if (hour < 19) {
    return 'dusk';
  }
  if (hour < 22) {
    return 'evening';
  }
  return 'late-night';
}

/**
 * Candidate kickers for a period, with optional weather flavor mixed in.
 *
 * @param period - Time-of-day window.
 * @param weather - Forecast snapshot, when available.
 * @returns Lines the header may show for this moment.
 */
export function headerGreetingPool(
  period: HeaderGreetingPeriod,
  weather: HeaderWeather | null = null,
): readonly string[] {
  const periodLines = PERIOD_KICKERS[period];
  if (!weather) {
    return periodLines;
  }

  const weatherLines = [
    ...WEATHER_KICKERS[weather.kind],
    ...temperatureKickers(weather.temperatureC),
  ];

  if (NOTABLE_WEATHER.has(weather.kind)) {
    return [...weatherLines, ...weatherLines, ...periodLines];
  }

  return [...periodLines, ...weatherLines];
}

/**
 * Claude-style header greeting, stable for a name + calendar day + period.
 *
 * Kickers are drawn from a list for the current slice of the day (dawn, dusk,
 * moonlit hours, and so on). When weather is passed in, a few forecast lines
 * join the pool. The name is always returned separately so the header can set
 * it in larger type.
 *
 * @param name - Given name or full display name.
 * @param now - Clock used for the period and the daily pick.
 * @param weather - Optional forecast; omit when the lookup has not finished.
 * @returns Greeting parts, or `null` when no name is available.
 */
export function pickHeaderGreeting(
  name: string | null | undefined,
  now: Date = new Date(),
  weather: HeaderWeather | null = null,
): HeaderGreeting | null {
  const first = headerGreetingFirstName(name);
  if (!first) {
    return null;
  }

  const period = headerGreetingPeriod(now);
  const pool = headerGreetingPool(period, weather);
  const weatherKey = weather?.kind ?? 'none';
  const key = `${first.toLowerCase()}|${now.getFullYear()}-${now.getMonth()}-${now.getDate()}|${period}|${weatherKey}`;
  const kicker = pool[hashString(key) % pool.length] ?? pool[0];

  return { kicker, name: first };
}

function temperatureKickers(temperatureC: number | undefined): readonly string[] {
  if (temperatureC === undefined || !Number.isFinite(temperatureC)) {
    return [];
  }
  if (temperatureC >= 32) {
    return ["Heat's on.", 'Warm one.'];
  }
  if (temperatureC <= 12) {
    return ['Chilly out.', 'Crisp air.'];
  }
  return [];
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
