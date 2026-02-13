import { nanoid } from "nanoid";

export function createId() {
  return nanoid();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Get today's date in YYYY-MM-DD format, Mazunte timezone */
export function getMazunteToday(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });
}

/** Get current time in HH:MM:SS format, Mazunte timezone */
export function getMazunteNow(): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Mexico_City",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Get a date N days from today */
export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });
}

/** Day of week abbreviation from date string */
export function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

/** Format date string to display format (e.g. "2026-02-12" → "Wednesday, Feb 12") */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

/** Format time string to display format (e.g. "14:00:00" → "2:00 PM") */
export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

/** Format time to just hour + period (e.g. "14:00" → { hour: "2:00", period: "PM" }) */
export function formatTimeparts(time: string): { hour: string; period: string } {
  const [h, m] = time.split(":");
  const hourNum = parseInt(h);
  const period = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  return { hour: `${displayHour}:${m}`, period };
}

/** Check if an event is currently boosted */
export function isEventBoosted(boostedUntil: string | null): boolean {
  if (!boostedUntil) return false;
  return new Date(boostedUntil) > new Date();
}

/** Generate Google Calendar URL */
export function getGoogleCalendarUrl(event: {
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  endTime?: string | null;
  venueName?: string | null;
}): string {
  // Format: YYYYMMDDTHHMMSS (local time, calendar will handle timezone)
  const startDate = event.date.replace(/-/g, "");
  const startTimeFormatted = event.startTime.replace(/:/g, "").slice(0, 4) + "00";

  let endTimeFormatted: string;
  if (event.endTime) {
    endTimeFormatted = event.endTime.replace(/:/g, "").slice(0, 4) + "00";
  } else {
    // Default to 2 hours later
    const [h, m] = event.startTime.split(":").map(Number);
    const endHour = (h + 2) % 24;
    endTimeFormatted = `${endHour.toString().padStart(2, "0")}${m.toString().padStart(2, "0")}00`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDate}T${startTimeFormatted}/${startDate}T${endTimeFormatted}`,
    ctz: "America/Mexico_City",
  });

  if (event.description) {
    params.set("details", event.description);
  }
  if (event.venueName) {
    params.set("location", `${event.venueName}, Mazunte, Oaxaca, Mexico`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Generate iCal file content */
export function getICalContent(event: {
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  endTime?: string | null;
  venueName?: string | null;
  slug: string;
}): string {
  const startDate = event.date.replace(/-/g, "");
  const startTimeFormatted = event.startTime.replace(/:/g, "").slice(0, 4) + "00";

  let endTimeFormatted: string;
  if (event.endTime) {
    endTimeFormatted = event.endTime.replace(/:/g, "").slice(0, 4) + "00";
  } else {
    const [h, m] = event.startTime.split(":").map(Number);
    const endHour = (h + 2) % 24;
    endTimeFormatted = `${endHour.toString().padStart(2, "0")}${m.toString().padStart(2, "0")}00`;
  }

  const uid = `${event.slug}-${event.date}@mazuntenow.com`;
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mazunte Connect//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=America/Mexico_City:${startDate}T${startTimeFormatted}`,
    `DTEND;TZID=America/Mexico_City:${startDate}T${endTimeFormatted}`,
    `SUMMARY:${event.title}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`);
  }
  if (event.venueName) {
    lines.push(`LOCATION:${event.venueName}, Mazunte, Oaxaca, Mexico`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/** Category display config */
export const categoryConfig: Record<string, { label: string; emoji: string; colorClass: string; bgClass: string; gradClass: string }> = {
  yoga: { label: "Yoga", emoji: "🧘", colorClass: "text-ocean", bgClass: "bg-ocean-pale text-ocean", gradClass: "grad-yoga" },
  music: { label: "Music", emoji: "🎵", colorClass: "text-sunset", bgClass: "bg-[#FDE8DB] text-sunset", gradClass: "grad-music" },
  ceremony: { label: "Ceremony", emoji: "🔮", colorClass: "text-plum", bgClass: "bg-[#F0E0ED] text-plum", gradClass: "grad-ceremony" },
  food: { label: "Food", emoji: "🍽️", colorClass: "text-coral", bgClass: "bg-[#FDE8E0] text-coral", gradClass: "grad-food" },
  wellness: { label: "Wellness", emoji: "💆", colorClass: "text-jungle", bgClass: "bg-[#E0F0E4] text-jungle", gradClass: "grad-wellness" },
  community: { label: "Community", emoji: "🌿", colorClass: "text-ocean-light", bgClass: "bg-ocean-pale text-ocean-light", gradClass: "grad-community" },
  market: { label: "Market", emoji: "🛍️", colorClass: "text-[#C67F2A]", bgClass: "bg-[#FDF0DB] text-[#C67F2A]", gradClass: "grad-market" },
  family: { label: "Family", emoji: "👨‍👩‍👧", colorClass: "text-[#9B6B9E]", bgClass: "bg-[#F3E8F4] text-[#9B6B9E]", gradClass: "grad-community" },
  other: { label: "Other", emoji: "✦", colorClass: "text-text-soft", bgClass: "bg-sand-dark text-text-soft", gradClass: "grad-community" },
};

/** Check if a string is a valid category slug */
export function isValidCategory(slug: string): boolean {
  return slug in categoryConfig;
}
