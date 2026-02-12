"use server";

import { db } from "@/db";
import { events, eventOccurrences, subscribers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { expandRecurrence } from "@/lib/recurrence";
import { getMazunteToday } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mazunte2024";
const AUTH_COOKIE_NAME = "mazunte_admin_auth";

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return true;
  }
  return false;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === "authenticated";
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function approveEvent(eventId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) throw new Error("Event not found");

  await db
    .update(events)
    .set({ isApproved: true, updatedAt: new Date().toISOString() })
    .where(eq(events.id, eventId));

  // If recurring, expand occurrences
  if (event.isRecurring && event.recurrencePattern) {
    const pattern = event.recurrencePattern as { days: string[]; until: string };
    const occurrences = expandRecurrence(
      eventId,
      pattern,
      event.startTime,
      event.endTime,
      getMazunteToday()
    );

    if (occurrences.length > 0) {
      await db.insert(eventOccurrences).values(
        occurrences.map((o) => ({ ...o, isCancelled: false }))
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function rejectEvent(eventId: string) {
  // Delete occurrences first (cascade should handle, but be explicit)
  await db.delete(eventOccurrences).where(eq(eventOccurrences.eventId, eventId));
  await db.delete(events).where(eq(events.id, eventId));

  revalidatePath("/admin");
}

export async function getPendingEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.isApproved, false))
    .orderBy(events.createdAt);
}

export async function getApprovedEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.isApproved, true))
    .orderBy(events.createdAt);
}

export async function getEventById(eventId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  return event || null;
}

type Category = "yoga" | "music" | "ceremony" | "food" | "wellness" | "community" | "market" | "other";

export async function updateEvent(
  eventId: string,
  data: {
    title?: string;
    description?: string | null;
    category?: Category;
    venueName?: string | null;
    mapsUrl?: string | null;
    organizerName?: string | null;
    startTime?: string;
    endTime?: string | null;
    isFeatured?: boolean;
    contactWhatsapp?: string | null;
    contactInstagram?: string | null;
    contactLink?: string | null;
  }
) {
  await db
    .update(events)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(events.id, eventId));

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleFeatured(eventId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) throw new Error("Event not found");

  await db
    .update(events)
    .set({ isFeatured: !event.isFeatured, updatedAt: new Date().toISOString() })
    .where(eq(events.id, eventId));

  revalidatePath("/");
  revalidatePath("/admin");
}

/** Delete all events and occurrences (wipe seeded data) */
export async function deleteAllEvents() {
  await db.delete(eventOccurrences);
  await db.delete(events);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/places");
}

/** Boost an event for 24 hours (or remove boost) */
export async function boostEvent(eventId: string, hours: number = 24) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) throw new Error("Event not found");

  const now = new Date();
  const isCurrentlyBoosted = event.boostedUntil && new Date(event.boostedUntil) > now;

  let boostedUntil: string | null = null;

  if (!isCurrentlyBoosted) {
    // Boost for specified hours
    const boostEnd = new Date(now.getTime() + hours * 60 * 60 * 1000);
    boostedUntil = boostEnd.toISOString();
  }
  // If already boosted, remove the boost (set to null)

  await db
    .update(events)
    .set({ boostedUntil, updatedAt: new Date().toISOString() })
    .where(eq(events.id, eventId));

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
}

/** Get all subscribers */
export async function getSubscribers() {
  return db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt));
}

/** Delete a subscriber */
export async function deleteSubscriber(id: string) {
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/subscribers");
}
