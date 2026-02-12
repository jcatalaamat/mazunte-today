"use server";

import { db } from "@/db";
import { events, eventOccurrences } from "@/db/schema";
import { createId, slugify, getMazunteToday } from "@/lib/utils";
import { z } from "zod";

const submitEventSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["yoga", "music", "ceremony", "food", "wellness", "community", "market", "other"]),
  venueName: z.string().min(1, "Venue name is required"),
  placeId: z.string().optional(),
  mapsUrl: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceDays: z.array(z.string()).optional(),
  recurrenceUntil: z.string().optional(),
  organizerName: z.string().min(1, "Organizer name is required"),
  contactWhatsapp: z.string().optional(),
  contactInstagram: z.string().optional(),
  contactLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
}).refine((data) => {
  // For non-recurring events, date is required
  if (!data.isRecurring && !data.date) {
    return false;
  }
  return true;
}, {
  message: "Date is required for non-recurring events",
  path: ["date"],
}).refine((data) => {
  // Date must not be in the past (for non-recurring events)
  if (!data.isRecurring && data.date) {
    const today = getMazunteToday();
    if (data.date < today) {
      return false;
    }
  }
  return true;
}, {
  message: "Event date cannot be in the past",
  path: ["date"],
}).refine((data) => {
  // End time must be after start time if provided
  if (data.endTime && data.startTime && data.endTime <= data.startTime) {
    return false;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
}).refine((data) => {
  // For recurring events, at least one day must be selected
  if (data.isRecurring && (!data.recurrenceDays || data.recurrenceDays.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Select at least one day for recurring events",
  path: ["recurrenceDays"],
});

export type SubmitEventState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitEvent(
  _prevState: SubmitEventState,
  formData: FormData
): Promise<SubmitEventState> {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    venueName: formData.get("venueName") as string,
    placeId: formData.get("placeId") as string,
    mapsUrl: formData.get("mapsUrl") as string,
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    isRecurring: formData.get("isRecurring") === "true",
    recurrenceDays: formData.getAll("recurrenceDays") as string[],
    recurrenceUntil: formData.get("recurrenceUntil") as string,
    organizerName: formData.get("organizerName") as string,
    contactWhatsapp: formData.get("contactWhatsapp") as string,
    contactInstagram: formData.get("contactInstagram") as string,
    contactLink: formData.get("contactLink") as string,
    images: formData.getAll("images").filter(Boolean) as string[],
  };

  const parsed = submitEventSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const eventId = createId();
  const baseSlug = slugify(data.title);
  const slug = `${baseSlug}-${eventId.slice(0, 6)}`;

  await db.insert(events).values({
    id: eventId,
    title: data.title,
    slug,
    description: data.description || null,
    category: data.category,
    venueName: data.venueName,
    placeId: data.placeId || null,
    mapsUrl: data.mapsUrl || null,
    organizerName: data.organizerName,
    organizerContact: null,
    date: data.isRecurring ? null : data.date || null,
    startTime: data.startTime + ":00",
    endTime: data.endTime ? data.endTime + ":00" : null,
    isRecurring: data.isRecurring,
    recurrencePattern: data.isRecurring && data.recurrenceDays?.length
      ? { days: data.recurrenceDays, until: data.recurrenceUntil || "2026-12-31" }
      : null,
    isFeatured: false,
    isApproved: false,
    contactWhatsapp: data.contactWhatsapp || null,
    contactInstagram: data.contactInstagram || null,
    contactLink: data.contactLink || null,
    images: data.images || [],
    updatedAt: null,
  });

  // For non-recurring events, create the single occurrence (pending approval still)
  if (!data.isRecurring && data.date) {
    await db.insert(eventOccurrences).values({
      id: createId(),
      eventId,
      date: data.date,
      startTime: data.startTime + ":00",
      endTime: data.endTime ? data.endTime + ":00" : null,
      isCancelled: false,
    });
  }

  return {
    success: true,
    message: "Event submitted! It will appear on Mazunte Connect once approved.",
  };
}
