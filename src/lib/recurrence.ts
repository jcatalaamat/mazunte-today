import { createId } from "./utils";

const DAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/**
 * Expand a recurrence pattern into individual occurrence rows.
 * Given days of the week and an end date, returns all dates
 * from `fromDate` to `until` that match the pattern.
 */
export function expandRecurrence(
  eventId: string,
  pattern: { days: string[]; until: string },
  startTime: string,
  endTime: string | null,
  fromDate?: string
): { id: string; eventId: string; date: string; startTime: string; endTime: string | null }[] {
  const targetDays = pattern.days.map((d) => DAY_MAP[d.toLowerCase()]);
  const start = fromDate ? new Date(fromDate + "T00:00:00") : new Date();
  const end = new Date(pattern.until + "T23:59:59");
  const occurrences: { id: string; eventId: string; date: string; startTime: string; endTime: string | null }[] = [];

  const current = new Date(start);
  while (current <= end) {
    if (targetDays.includes(current.getDay())) {
      const dateStr = current.toISOString().split("T")[0];
      occurrences.push({
        id: createId(),
        eventId,
        date: dateStr,
        startTime,
        endTime,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return occurrences;
}
