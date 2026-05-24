/**
 * Year picker options — rolling window around current year.
 *
 * To change the range, edit YEARS_BEHIND / YEARS_AHEAD below.
 * Currently shows: current year - 4 → current year + 1 (6 years total).
 */
const YEARS_BEHIND = 4;
const YEARS_AHEAD = 1;

export function getYearOptions(): number[] {
  const now = new Date().getFullYear();
  const years: number[] = [];
  for (let y = now - YEARS_BEHIND; y <= now + YEARS_AHEAD; y += 1) {
    years.push(y);
  }
  return years;
}
