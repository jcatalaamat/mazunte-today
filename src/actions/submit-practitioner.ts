"use server";

import { db } from "@/db";
import { practitioners, services } from "@/db/schema";
import { createId, slugify } from "@/lib/utils";
import { z } from "zod";

const categoryValues = ["yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other"] as const;

const submitPractitionerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  bio: z.string().optional(),
  shortBio: z.string().max(150, "Short bio must be 150 characters or less").optional(),
  categories: z.array(z.enum(categoryValues)).min(1, "Select at least one category"),
  profileImage: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  venueName: z.string().optional(),
  placeId: z.string().optional(),
  mapsUrl: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactInstagram: z.string().optional(),
  contactLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  services: z.array(z.object({
    name: z.string().min(1, "Service name is required"),
    description: z.string().optional(),
    duration: z.string().optional(),
    price: z.string().optional(),
    category: z.enum(categoryValues).optional(),
  })).optional(),
});

export type SubmitPractitionerState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitPractitioner(
  _prevState: SubmitPractitionerState,
  formData: FormData
): Promise<SubmitPractitionerState> {
  // Parse services from JSON hidden input
  let parsedServices: { name: string; description?: string; duration?: string; price?: string; category?: string }[] = [];
  const servicesJson = formData.get("servicesJson") as string;
  if (servicesJson) {
    try {
      parsedServices = JSON.parse(servicesJson);
    } catch {
      // ignore
    }
  }

  const raw = {
    name: formData.get("name") as string,
    bio: formData.get("bio") as string,
    shortBio: formData.get("shortBio") as string,
    categories: formData.getAll("categories") as string[],
    profileImage: formData.get("profileImage") as string,
    images: formData.getAll("images").filter(Boolean) as string[],
    venueName: formData.get("venueName") as string,
    placeId: formData.get("placeId") as string,
    mapsUrl: formData.get("mapsUrl") as string,
    contactWhatsapp: formData.get("contactWhatsapp") as string,
    contactInstagram: formData.get("contactInstagram") as string,
    contactLink: formData.get("contactLink") as string,
    services: parsedServices,
  };

  const parsed = submitPractitionerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const practitionerId = createId();
  const baseSlug = slugify(data.name);
  const slug = `${baseSlug}-${practitionerId.slice(0, 6)}`;

  await db.insert(practitioners).values({
    id: practitionerId,
    name: data.name,
    slug,
    bio: data.bio || null,
    shortBio: data.shortBio || null,
    categories: data.categories,
    profileImage: data.profileImage || null,
    images: data.images || [],
    venueName: data.venueName || null,
    placeId: data.placeId || null,
    mapsUrl: data.mapsUrl || null,
    contactWhatsapp: data.contactWhatsapp || null,
    contactInstagram: data.contactInstagram || null,
    contactLink: data.contactLink || null,
    isApproved: false,
    isFeatured: false,
    updatedAt: null,
  });

  // Insert services
  if (data.services && data.services.length > 0) {
    await db.insert(services).values(
      data.services.map((s, i) => ({
        id: createId(),
        practitionerId,
        name: s.name,
        description: s.description || null,
        duration: s.duration || null,
        price: s.price || null,
        category: (s.category as typeof services.$inferSelect["category"]) || "other",
        sortOrder: String(i),
      }))
    );
  }

  return {
    success: true,
    message: "Profile submitted! It will appear on Mazunte Today once reviewed.",
  };
}
