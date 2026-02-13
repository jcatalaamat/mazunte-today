import { db } from "@/db";
import { practitioners, services, events, eventOccurrences } from "@/db/schema";
import { eq, and, gte, sql, ilike, or, desc } from "drizzle-orm";
import { getMazunteToday } from "@/lib/utils";

export type PractitionerCard = {
  id: string;
  name: string;
  slug: string;
  shortBio: string | null;
  categories: string[];
  profileImage: string | null;
  isFeatured: boolean;
  serviceCount: number;
};

export type PractitionerDetail = {
  practitioner: typeof practitioners.$inferSelect;
  services: (typeof services.$inferSelect)[];
  upcomingEvents: {
    id: string;
    eventId: string;
    title: string;
    slug: string;
    category: string;
    venueName: string | null;
    date: string;
    startTime: string;
    endTime: string | null;
  }[];
};

/** Get all approved practitioners for listing page */
export async function getApprovedPractitioners(): Promise<PractitionerCard[]> {
  const rows = await db
    .select()
    .from(practitioners)
    .where(eq(practitioners.isApproved, true))
    .orderBy(desc(practitioners.isFeatured), practitioners.name);

  // Get service counts
  const practitionerIds = rows.map((r) => r.id);
  if (practitionerIds.length === 0) return [];

  const serviceCounts = await db
    .select({
      practitionerId: services.practitionerId,
      count: sql<number>`count(*)::int`,
    })
    .from(services)
    .where(sql`${services.practitionerId} IN (${sql.join(practitionerIds.map((id) => sql`${id}`), sql`, `)})`)
    .groupBy(services.practitionerId);

  const countMap = new Map(serviceCounts.map((s) => [s.practitionerId, s.count]));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortBio: r.shortBio,
    categories: (r.categories as string[]) || [],
    profileImage: r.profileImage,
    isFeatured: r.isFeatured,
    serviceCount: countMap.get(r.id) || 0,
  }));
}

/** Get practitioners filtered by category */
export async function getPractitionersByCategory(
  category: string
): Promise<PractitionerCard[]> {
  const all = await getApprovedPractitioners();
  return all.filter((p) => p.categories.includes(category));
}

/** Get a single practitioner by slug with services and upcoming events */
export async function getPractitionerBySlug(
  slug: string
): Promise<PractitionerDetail | null> {
  const [practitioner] = await db
    .select()
    .from(practitioners)
    .where(and(eq(practitioners.slug, slug), eq(practitioners.isApproved, true)))
    .limit(1);

  if (!practitioner) return null;

  const practitionerServices = await db
    .select()
    .from(services)
    .where(eq(services.practitionerId, practitioner.id))
    .orderBy(services.sortOrder, services.createdAt);

  const today = getMazunteToday();
  const eventRows = await db
    .select({ occurrence: eventOccurrences, event: events })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .where(
      and(
        eq(events.practitionerId, practitioner.id),
        eq(events.isApproved, true),
        eq(eventOccurrences.isCancelled, false),
        gte(eventOccurrences.date, today)
      )
    )
    .orderBy(eventOccurrences.date, eventOccurrences.startTime)
    .limit(20);

  const upcomingEvents = eventRows.map((row) => ({
    id: row.occurrence.id,
    eventId: row.event.id,
    title: row.event.title,
    slug: row.event.slug,
    category: row.event.category,
    venueName: row.event.venueName,
    date: row.occurrence.date,
    startTime: row.occurrence.startTime,
    endTime: row.occurrence.endTime,
  }));

  return { practitioner, services: practitionerServices, upcomingEvents };
}

/** Get practitioner name/slug for event detail page */
export async function getPractitionerForEvent(
  practitionerId: string | null
): Promise<{ name: string; slug: string } | null> {
  if (!practitionerId) return null;

  const [p] = await db
    .select({ name: practitioners.name, slug: practitioners.slug })
    .from(practitioners)
    .where(and(eq(practitioners.id, practitionerId), eq(practitioners.isApproved, true)))
    .limit(1);

  return p || null;
}

/** Search practitioners by name or bio */
export async function searchPractitioners(
  query: string
): Promise<PractitionerCard[]> {
  if (!query || query.length < 2) return [];

  const searchPattern = `%${query}%`;

  const rows = await db
    .select()
    .from(practitioners)
    .where(
      and(
        eq(practitioners.isApproved, true),
        or(
          ilike(practitioners.name, searchPattern),
          ilike(practitioners.bio, searchPattern),
          ilike(practitioners.shortBio, searchPattern)
        )
      )
    )
    .orderBy(practitioners.name)
    .limit(20);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortBio: r.shortBio,
    categories: (r.categories as string[]) || [],
    profileImage: r.profileImage,
    isFeatured: r.isFeatured,
    serviceCount: 0, // Not critical for search results
  }));
}
