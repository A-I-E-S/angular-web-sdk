/** Daily header greeting: a short kicker plus the given name. */
export interface HeaderGreeting {
  /** Time-of-day or weather line, shown above the name. */
  kicker: string;
  /**
   * Transloco / {@link AfricaniesUiI18n} key for {@link kicker}
   * (`africaniesUi.header.kickers.*`). Hosts translate with `kicker` as fallback.
   */
  kickerKey: string;
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
  /** City from reverse-geocode / IP geolocation, when known. */
  city?: string;
}

interface HeaderKickerLine {
  key: string;
  en: string;
}

const K = (slug: string, en: string): HeaderKickerLine => ({
  key: `africaniesUi.header.kickers.${slug}`,
  en,
});

const PERIOD_KICKERS: Record<HeaderGreetingPeriod, readonly HeaderKickerLine[]> =
  {
    'wee-hours': [
      K('moonlitChat', 'Moonlit chat?'),
      K('stillHere', 'Still here?'),
      K('quietHours', 'Quiet hours.'),
      K('nightOwlDesk', 'Night-owl desk.'),
      K('cityAsleep', "The city's asleep."),
      K('burningMidnightOil', 'Burning the midnight oil?'),
      K('lateNightGlow', 'Late-night glow.'),
      K('starsAreOut', 'Stars are out.'),
      K('hushedShift', 'Hushed shift.'),
      K('afterMidnight', 'After midnight.'),
      K('justUsAndTheDark', 'Just us and the dark.'),
      K('owlHours', 'Owl hours.'),
    ],
    dawn: [
      K('firstLight', 'First light.'),
      K('dawnPatrol', 'Dawn patrol.'),
      K('beforeTheRush', 'Before the rush.'),
      K('skyWakingUp', "The sky's waking up."),
      K('earlyBird', 'Early bird.'),
      K('sunriseShift', 'Sunrise shift.'),
      K('coffeeBrewing', "Coffee's brewing."),
      K('softMorning', 'Soft morning.'),
      K('aheadOfTheDay', 'Ahead of the day.'),
      K('paleGoldHour', 'Pale gold hour.'),
      K('worldStillYawning', 'World still yawning.'),
      K('catchTheQuiet', 'Catch the quiet.'),
    ],
    'early-morning': [
      K('riseAndShine', 'Rise and shine.'),
      K('letsEaseIn', "Let's ease in."),
      K('brightAndEarly', 'Bright and early.'),
      K('warmUpLap', 'Warm-up lap.'),
      K('daysJustStarting', "Day's just starting."),
      K('stretchAndGo', 'Stretch and go.'),
      K('morningPages', 'Morning pages.'),
      K('goodHourToBegin', 'Good hour to begin.'),
      K('easyDoesIt', 'Easy does it.'),
      K('firstCoffee', 'First coffee?'),
      K('lacesTied', 'Laces tied.'),
      K('freshNotebookEnergy', 'Fresh notebook energy.'),
    ],
    morning: [
      K('morningMomentum', 'Morning momentum.'),
      K('readyToShip', 'Ready to ship?'),
      K('letsMakeItCount', "Let's make it count."),
      K('onward', 'Onward.'),
      K('fullSteam', 'Full steam.'),
      K('letsClearTheDecks', "Let's clear the decks."),
      K('goodHourForIt', 'Good hour for it.'),
      K('inboxAwaits', 'Inbox awaits.'),
      K('letsGetIntoIt', "Let's get into it."),
      K('lightsAreOn', 'Lights are on.'),
      K('plottingTheDay', 'Plotting the day?'),
      K('openTheWindows', 'Open the windows.'),
    ],
    midday: [
      K('middayCheckIn', 'Midday check-in.'),
      K('sunsHigh', "Sun's high."),
      K('halfwayThere', 'Halfway there.'),
      K('peakHours', 'Peak hours.'),
      K('lunchAdjacent', 'Lunch-adjacent.'),
      K('keepThePace', 'Keep the pace.'),
      K('quickReset', 'Quick reset?'),
      K('stillRolling', 'Still rolling.'),
      K('highNoon', 'High noon.'),
      K('middayDesk', 'Midday desk.'),
      K('secondAct', 'Second act.'),
      K('refillAndResume', 'Refill and resume.'),
    ],
    afternoon: [
      K('afternoonStretch', 'Afternoon stretch.'),
      K('secondWind', 'Second wind?'),
      K('backAtIt', 'Back at it.'),
      K('steadyOn', 'Steady on.'),
      K('stillPlentyOfDay', 'Still plenty of day.'),
      K('carryItForward', 'Carry it forward.'),
      K('afternoonLight', 'Afternoon light.'),
      K('keepGoing', 'Keep going.'),
      K('goldenGrind', 'Golden grind.'),
      K('longShadowHours', 'Long-shadow hours.'),
      K('pushTheNextTile', 'Push the next tile.'),
      K('notDoneYet', 'Not done yet.'),
    ],
    dusk: [
      K('goldenHour', 'Golden hour.'),
      K('eveningGlow', 'Evening glow.'),
      K('lastDaylight', 'Last daylight.'),
      K('wrappingTheDay', 'Wrapping the day?'),
      K('softLanding', 'Soft landing.'),
      K('duskDesk', 'Dusk desk.'),
      K('sunsetShift', 'Sunset shift.'),
      K('almostThere', 'Almost there.'),
      K('lightsGoingGold', "Light's going gold."),
      K('closeOfPlay', 'Close of play?'),
      K('skyOnFire', 'Sky on fire.'),
      K('blueHourSoon', 'Blue hour soon.'),
    ],
    evening: [
      K('eveningSession', 'Evening session.'),
      K('nightsComingIn', "Night's coming in."),
      K('afterHours', 'After hours?'),
      K('eveningQuiet', 'Evening quiet.'),
      K('oneMoreRound', 'One more round?'),
      K('lightsAreLow', 'Lights are low.'),
      K('eveningDesk', 'Evening desk.'),
      K('unwindOrPush', 'Unwind or push?'),
      K('settlingIn', 'Settling in.'),
      K('lampLightHours', 'Lamp-light hours.'),
      K('cityLightsOn', 'City lights on.'),
      K('slowTheTempo', 'Slow the tempo?'),
    ],
    'late-night': [
      K('moonlitChat', 'Moonlit chat?'),
      K('lateShift', 'Late shift.'),
      K('quietTonight', 'Quiet tonight.'),
      K('stillGlowing', 'Still glowing?'),
      K('nightDesk', 'Night desk.'),
      K('hushedHours', 'Hushed hours.'),
      K('wrapItGently', 'Wrap it gently?'),
      K('starside', 'Starside.'),
      K('lastLap', 'Last lap?'),
      K('softLandingTonight', 'Soft landing tonight.'),
      K('moonIsClockedIn', 'The moon is clocked in.'),
      K('dimTheNoise', 'Dim the noise.'),
    ],
  };

const WEATHER_KICKERS: Record<HeaderWeatherKind, readonly HeaderKickerLine[]> = {
  clear: [
    K('clearSkies', 'Clear skies.'),
    K('sunsOut', "Sun's out."),
    K('brightOutThere', 'Bright out there.'),
    K('blueOverhead', 'Blue overhead.'),
  ],
  cloudy: [
    K('softGreyDay', 'Soft grey day.'),
    K('cloudCover', 'Cloud cover.'),
    K('overcastCalm', 'Overcast calm.'),
    K('greyButGoing', 'Grey but going.'),
  ],
  fog: [
    K('foggyOut', 'Foggy out.'),
    K('mistyHours', 'Misty hours.'),
    K('wrappedInFog', 'Wrapped in fog.'),
    K('lowAndQuiet', 'Low and quiet.'),
  ],
  drizzle: [
    K('lightDrizzle', 'Light drizzle.'),
    K('softRain', 'Soft rain.'),
    K('greyAndGentle', 'Grey and gentle.'),
    K('aLittleWetOut', 'A little wet out.'),
  ],
  rain: [
    K('rainyRound', 'Rainy round?'),
    K('wetOutThere', 'Wet out there.'),
    K('cozyWeatherForIt', 'Cozy weather for it.'),
    K('rainOnTheGlass', 'Rain on the glass.'),
  ],
  snow: [
    K('snowInTheAir', 'Snow in the air.'),
    K('flurriesOut', 'Flurries out.'),
    K('coldSparkle', 'Cold sparkle.'),
    K('winterAtTheWindow', 'Winter at the window.'),
  ],
  storm: [
    K('stormyOut', 'Stormy out.'),
    K('wildSkies', 'Wild skies.'),
    K('holdTight', 'Hold tight.'),
    K('thunderWeather', 'Thunder weather.'),
  ],
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
 * @returns Lines the header may show for this moment (English fallbacks).
 */
export function headerGreetingPool(
  period: HeaderGreetingPeriod,
  weather: HeaderWeather | null = null,
): readonly string[] {
  return headerGreetingPoolLines(period, weather).map((line) => line.en);
}

function headerGreetingPoolLines(
  period: HeaderGreetingPeriod,
  weather: HeaderWeather | null = null,
): readonly HeaderKickerLine[] {
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
 * it in larger type. {@link HeaderGreeting.kickerKey} is for host i18n;
 * {@link HeaderGreeting.kicker} remains the English fallback.
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
  const pool = headerGreetingPoolLines(period, weather);
  const weatherKey = weather?.kind ?? 'none';
  const key = `${first.toLowerCase()}|${now.getFullYear()}-${now.getMonth()}-${now.getDate()}|${period}|${weatherKey}`;
  const line = pool[hashString(key) % pool.length] ?? pool[0];

  return { kicker: line.en, kickerKey: line.key, name: first };
}

/** Flat English dictionary for SDK / admin `africaniesUi.header.kickers`. */
export function headerKickerDictionary(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lines of Object.values(PERIOD_KICKERS)) {
    for (const line of lines) {
      out[line.key.replace('africaniesUi.header.kickers.', '')] = line.en;
    }
  }
  for (const lines of Object.values(WEATHER_KICKERS)) {
    for (const line of lines) {
      out[line.key.replace('africaniesUi.header.kickers.', '')] = line.en;
    }
  }
  for (const line of temperatureKickers(40)) {
    out[line.key.replace('africaniesUi.header.kickers.', '')] = line.en;
  }
  for (const line of temperatureKickers(0)) {
    out[line.key.replace('africaniesUi.header.kickers.', '')] = line.en;
  }
  return out;
}

function temperatureKickers(
  temperatureC: number | undefined,
): readonly HeaderKickerLine[] {
  if (temperatureC === undefined || !Number.isFinite(temperatureC)) {
    return [];
  }
  if (temperatureC >= 32) {
    return [K('heatsOn', "Heat's on."), K('warmOne', 'Warm one.')];
  }
  if (temperatureC <= 12) {
    return [K('chillyOut', 'Chilly out.'), K('crispAir', 'Crisp air.')];
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
