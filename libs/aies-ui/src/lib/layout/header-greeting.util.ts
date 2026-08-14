/** Daily header greeting: a short kicker plus the given name. */
export interface HeaderGreeting {
  /** Time-of-day or welcome line, shown above the name. */
  kicker: string;
  /** Given name — the visual focus of the header. */
  name: string;
}

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
 * Claude-style header greeting, stable for a given name and calendar day.
 *
 * The kicker rotates (time of day + welcome-backs). The name is always
 * returned separately so the header can set it in larger type.
 *
 * @param name - Given name or full display name.
 * @param now - Clock used for time-of-day and the daily pick.
 * @returns Greeting parts, or `null` when no name is available.
 */
export function pickHeaderGreeting(
  name: string | null | undefined,
  now: Date = new Date(),
): HeaderGreeting | null {
  const first = headerGreetingFirstName(name);
  if (!first) {
    return null;
  }

  const pool = [
    timeOfDayKicker(now),
    'Welcome back ✨',
    'Nice to see you 👋',
    'Ready when you are 🚀',
    "Let's get to it 💪",
  ];

  const key = `${first.toLowerCase()}|${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const kicker = pool[hashString(key) % pool.length] ?? pool[0];

  return { kicker, name: first };
}

function timeOfDayKicker(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) {
    return 'Good morning ☀️';
  }
  if (hour < 17) {
    return 'Good afternoon 🌤️';
  }
  return 'Good evening 🌙';
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
