import type { MetadataRoute } from "next";
import { db } from "@/db";
import { events, practitioners } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://mazunte.today";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["en", "es"];
  const routes = ["", "/places", "/category", "/search", "/submit", "/about", "/practitioners"];
  const categories = ["yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other"];

  const entries: MetadataRoute.Sitemap = [];

  // Static routes
  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "hourly" : "daily",
        priority: route === "" ? 1 : 0.8,
      });
    }

    for (const cat of categories) {
      entries.push({
        url: `${BASE_URL}/${locale}/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  // Dynamic event pages
  const approvedEvents = await db
    .select({ slug: events.slug, updatedAt: events.updatedAt })
    .from(events)
    .where(eq(events.isApproved, true));

  for (const event of approvedEvents) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/event/${event.slug}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Dynamic practitioner pages
  const approvedPractitioners = await db
    .select({ slug: practitioners.slug, updatedAt: practitioners.updatedAt })
    .from(practitioners)
    .where(eq(practitioners.isApproved, true));

  for (const practitioner of approvedPractitioners) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/practitioners/${practitioner.slug}`,
        lastModified: practitioner.updatedAt ? new Date(practitioner.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
