import { db } from "@/db";
import { events, eventOccurrences } from "@/db/schema";
import { eq, and, gte, lte, sql, ilike, or, desc } from "drizzle-orm";
import { getMazunteToday, getMazunteNow, getDateOffset } from "@/lib/utils";

export type EventWithOccurrence = {
  id: string;
  eventId: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  venueName: string | null;
  organizerName: string | null;
  date: string;
  startTime: string;
  endTime: string | null;
  isFeatured: boolean;
  isBoosted: boolean;
  contactWhatsapp: string | null;
  contactInstagram: string | null;
  contactLink: string | null;
  images: string[];
};

function mapRow(row: {
  occurrence: typeof eventOccurrences.$inferSelect;
  event: typeof events.$inferSelect;
}): EventWithOccurrence {
  const now = new Date().toISOString();
  const isBoosted = row.event.boostedUntil ? row.event.boostedUntil > now : false;

  return {
    id: row.occurrence.id,
    eventId: row.event.id,
    title: row.event.title,
    slug: row.event.slug,
    description: row.event.description,
    category: row.event.category,
    venueName: row.event.venueName,
    organizerName: row.event.organizerName,
    date: row.occurrence.date,
    startTime: row.occurrence.startTime,
    endTime: row.occurrence.endTime,
    isFeatured: row.event.isFeatured,
    isBoosted,
    contactWhatsapp: row.event.contactWhatsapp,
    contactInstagram: row.event.contactInstagram,
    contactLink: row.event.contactLink,
    images: (row.event.images as string[]) || [],
  };
}

/** Events happening right now (current time is between start and end) */
export async function getHappeningNow(): Promise<EventWithOccurrence[]> {
  const today = getMazunteToday();
  const now = getMazunteNow();

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(eventOccurrences.date, today),
        eq(eventOccurrences.isCancelled, false),
        eq(events.isApproved, true),
        lte(eventOccurrences.startTime, now),
        gte(sql`COALESCE(${eventOccurrences.endTime}, '23:59:59')`, now)
      )
    )
    .orderBy(eventOccurrences.startTime);

  return rows.map(mapRow);
}

/** All events for today, ordered by start time */
export async function getTodayEvents(): Promise<EventWithOccurrence[]> {
  const today = getMazunteToday();

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(eventOccurrences.date, today),
        eq(eventOccurrences.isCancelled, false),
        eq(events.isApproved, true)
      )
    )
    .orderBy(eventOccurrences.startTime);

  return rows.map(mapRow);
}

/** Events for the next 7 days (excluding today) */
export async function getThisWeekEvents(): Promise<EventWithOccurrence[]> {
  const tomorrow = getDateOffset(1);
  const endOfWeek = getDateOffset(7);

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        gte(eventOccurrences.date, tomorrow),
        lte(eventOccurrences.date, endOfWeek),
        eq(eventOccurrences.isCancelled, false),
        eq(events.isApproved, true)
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime);

  return rows.map(mapRow);
}

/** Get featured events - returns all boosted events, or falls back to auto-selection */
export async function getFeaturedEvents(): Promise<EventWithOccurrence[]> {
  const today = getMazunteToday();
  const now = new Date().toISOString();

  // First, try to find all currently boosted events
  const boostedRows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        gte(events.boostedUntil, now),
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today)
      )
    )
    .orderBy(desc(events.boostedUntil), eventOccurrences.date)
    .limit(5);

  if (boostedRows.length > 0) {
    return boostedRows.map(mapRow);
  }

  // Fallback: auto-select the best upcoming event (with image, soonest date)
  const autoRows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today)
      )
    )
    .orderBy(
      // Prioritize events with images
      sql`CASE WHEN jsonb_array_length(COALESCE(${events.images}, '[]'::jsonb)) > 0 THEN 0 ELSE 1 END`,
      eventOccurrences.date,
      eventOccurrences.startTime
    )
    .limit(1);

  return autoRows.map(mapRow);
}

/** Get a single event by slug */
export async function getEventBySlug(slug: string): Promise<{
  event: typeof events.$inferSelect;
  upcomingOccurrences: (typeof eventOccurrences.$inferSelect)[];
} | null> {
  const today = getMazunteToday();

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isApproved, true)))
    .limit(1);

  if (!event) return null;

  const upcomingOccurrences = await db
    .select()
    .from(eventOccurrences)
    .where(
      and(
        eq(eventOccurrences.eventId, event.id),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today)
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime)
    .limit(10);

  return { event, upcomingOccurrences };
}

/** Search events by title, description, venue, or organizer */
export async function searchEvents(query: string): Promise<EventWithOccurrence[]> {
  if (!query || query.length < 2) return [];

  const today = getMazunteToday();
  const searchPattern = `%${query}%`;

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today),
        or(
          ilike(events.title, searchPattern),
          ilike(events.description, searchPattern),
          ilike(events.venueName, searchPattern),
          ilike(events.organizerName, searchPattern)
        )
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime)
    .limit(20);

  return rows.map(mapRow);
}

type Category = typeof events.$inferSelect.category;

/** Get upcoming events for a specific category */
export async function getEventsByCategory(
  category: string
): Promise<EventWithOccurrence[]> {
  const today = getMazunteToday();

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today),
        eq(events.category, category as Category)
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime)
    .limit(50);

  return rows.map(mapRow);
}

export type CategoryWithEvents = {
  category: string;
  count: number;
  previewEvents: EventWithOccurrence[];
};

/** Get all categories with their upcoming event counts */
export async function getCategoriesWithCounts(): Promise<CategoryWithEvents[]> {
  const today = getMazunteToday();

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today)
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime);

  const categoryMap = new Map<string, { count: number; events: EventWithOccurrence[] }>();

  for (const row of rows) {
    const cat = row.event.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { count: 0, events: [] });
    }
    const entry = categoryMap.get(cat)!;
    entry.count++;
    if (entry.events.length < 3) {
      entry.events.push(mapRow(row));
    }
  }

  const allCategories = ["yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other"];

  return allCategories.map((cat) => ({
    category: cat,
    count: categoryMap.get(cat)?.count ?? 0,
    previewEvents: categoryMap.get(cat)?.events ?? [],
  }));
}

export type VenueWithEvents = {
  venueName: string;
  placeId: string | null;
  mapsUrl: string | null;
  eventCount: number;
  upcomingEvents: EventWithOccurrence[];
};

/** Get all venues with their upcoming events */
export async function getVenuesWithEvents(): Promise<VenueWithEvents[]> {
  const today = getMazunteToday();

  // Get all approved events with upcoming occurrences
  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today)
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime);

  // Group by venue (placeId if available, otherwise venueName)
  const venueMap = new Map<string, VenueWithEvents>();

  for (const row of rows) {
    const venueKey = row.event.placeId || row.event.venueName || "Unknown";

    if (!venueMap.has(venueKey)) {
      venueMap.set(venueKey, {
        venueName: row.event.venueName || "Unknown",
        placeId: row.event.placeId,
        mapsUrl: row.event.mapsUrl,
        eventCount: 0,
        upcomingEvents: [],
      });
    }

    const venue = venueMap.get(venueKey)!;
    venue.eventCount++;
    if (venue.upcomingEvents.length < 5) {
      venue.upcomingEvents.push(mapRow(row));
    }
  }

  // Sort by event count (most active venues first)
  return Array.from(venueMap.values()).sort((a, b) => b.eventCount - a.eventCount);
}

/** Get events for a specific venue by placeId or venueName */
export async function getEventsByVenue(venueKey: string): Promise<{
  venueName: string;
  placeId: string | null;
  mapsUrl: string | null;
  events: EventWithOccurrence[];
} | null> {
  const today = getMazunteToday();

  const rows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today),
        or(
          eq(events.placeId, venueKey),
          eq(events.venueName, venueKey)
        )
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime)
    .limit(50);

  if (rows.length === 0) return null;

  return {
    venueName: rows[0].event.venueName || "Unknown",
    placeId: rows[0].event.placeId,
    mapsUrl: rows[0].event.mapsUrl,
    events: rows.map(mapRow),
  };
}
