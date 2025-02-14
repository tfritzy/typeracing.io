export function getWeek(date: Date): number {
  const target = new Date(date.valueOf());

  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 1);
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay() + 7) % 7));
  }

  const weekNumber =
    1 +
    Math.ceil(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000)
    );

  return weekNumber;
}
