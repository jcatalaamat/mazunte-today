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

/** Category display config */
export const categoryConfig: Record<string, { label: string; emoji: string; colorClass: string; bgClass: string; gradClass: string }> = {
  yoga: { label: "Yoga", emoji: "🧘", colorClass: "text-ocean", bgClass: "bg-ocean-pale text-ocean", gradClass: "grad-yoga" },
  music: { label: "Music", emoji: "🎵", colorClass: "text-sunset", bgClass: "bg-[#FDE8DB] text-sunset", gradClass: "grad-music" },
  ceremony: { label: "Ceremony", emoji: "🔮", colorClass: "text-plum", bgClass: "bg-[#F0E0ED] text-plum", gradClass: "grad-ceremony" },
  food: { label: "Food", emoji: "🍽️", colorClass: "text-coral", bgClass: "bg-[#FDE8E0] text-coral", gradClass: "grad-food" },
  wellness: { label: "Wellness", emoji: "💆", colorClass: "text-jungle", bgClass: "bg-[#E0F0E4] text-jungle", gradClass: "grad-wellness" },
  community: { label: "Community", emoji: "🌿", colorClass: "text-ocean-light", bgClass: "bg-ocean-pale text-ocean-light", gradClass: "grad-community" },
  market: { label: "Market", emoji: "🛍️", colorClass: "text-[#C67F2A]", bgClass: "bg-[#FDF0DB] text-[#C67F2A]", gradClass: "grad-market" },
  other: { label: "Other", emoji: "✦", colorClass: "text-text-soft", bgClass: "bg-sand-dark text-text-soft", gradClass: "grad-community" },
};
