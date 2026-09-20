// Deliberately support an unambiguous, bounded subset of JWT duration syntax.
export function durationSeconds(value: string, maximum = 30 * 86400): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match)
    throw new Error('JWT duration must use positive seconds/minutes/hours/days (e.g. 15m)');
  const seconds = Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2]] || 0);
  if (seconds < 1 || seconds > maximum) throw new Error('JWT duration is out of bounds');
  return seconds;
}
