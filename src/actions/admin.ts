"use server";

import { db } from "@/db";
import { events, eventOccurrences } from "@/db/schema";
import { eq } from "drizzle-orm";
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

export async function updateEvent(
  eventId: string,
  data: {
    title?: string;
    description?: string;
    category?: string;
    venueName?: string;
    organizerName?: string;
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
