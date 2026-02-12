import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { createId, slugify } from "../lib/utils";
import { expandRecurrence } from "../lib/recurrence";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding Mazunte Connect...");

  // ── Today's date + helpers ────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];

  // ── One-off Events (today + this week) ────────────
  const oneOffEvents = [
    {
      title: "Morning Vinyasa Flow",
      category: "yoga" as const,
      venueName: "Akasha",
      date: today,
      startTime: "08:00:00",
      endTime: "09:30:00",
      description: "Start your day with a flowing vinyasa practice. All levels welcome.",
      organizerName: "Sofia",
    },
    {
      title: "Breathwork & Ice Bath",
      category: "wellness" as const,
      venueName: "Playa Mermejita",
      date: today,
      startTime: "08:30:00",
      endTime: "10:00:00",
      description: "Wim Hof style breathwork followed by ocean ice bath. Bring a towel.",
      organizerName: "Marco",
    },
    {
      title: "Organic Farmers Market",
      category: "food" as const,
      venueName: "Main Plaza",
      date: today,
      startTime: "07:00:00",
      endTime: "13:00:00",
      description: "Fresh local produce, organic bread, handmade tortillas, and more.",
      organizerName: "Mazunte Community",
    },
    {
      title: "Pilates with Sofie",
      category: "yoga" as const,
      venueName: "Akasha",
      date: today,
      startTime: "10:00:00",
      endTime: "11:00:00",
      description: "Certified Pilates class. Bring your own mat. All levels welcome.",
      organizerName: "Sofie",
    },
    {
      title: "Somatic Release Session",
      category: "wellness" as const,
      venueName: "La Cosmica",
      date: today,
      startTime: "11:00:00",
      endTime: "12:30:00",
      description: "Gentle nervous system therapy. Releasing stored tension through deep body listening.",
      organizerName: "Ana",
    },
    {
      title: "Cacao Ceremony & Sound Healing",
      category: "ceremony" as const,
      venueName: "Temascal Ocelotl",
      date: today,
      startTime: "16:00:00",
      endTime: "18:00:00",
      description: "Heart-opening cacao journey with crystal bowls and live mantra. Bring intention.",
      organizerName: "Daniela",
    },
    {
      title: "Sunset Yin Yoga",
      category: "yoga" as const,
      venueName: "Hridaya Yoga Center",
      date: today,
      startTime: "17:30:00",
      endTime: "19:00:00",
      description: "Slow, deep stretches as the sun goes down. Calming and restorative.",
      organizerName: "Hridaya",
    },
    {
      title: "Choripan Night",
      category: "food" as const,
      venueName: "La Choripaneria",
      date: today,
      startTime: "19:00:00",
      endTime: "22:00:00",
      description: "Argentine choripan, natural wine, and good vibes under the stars.",
      organizerName: "La Choripaneria",
    },
    {
      title: "Live Acoustic Session",
      category: "music" as const,
      venueName: "Playa Mermejita",
      date: today,
      startTime: "20:30:00",
      endTime: "23:00:00",
      description: "Local musicians jamming on the beach. Fire pit, stars, good music.",
      organizerName: "Mazunte Musicians Collective",
    },
    // This week events
    {
      title: "Ecstatic Dance",
      category: "music" as const,
      venueName: "La Cosmica",
      date: tomorrow,
      startTime: "18:00:00",
      endTime: "20:30:00",
      description: "Free-form dance journey with live DJ. No shoes, no talking on the dance floor.",
      organizerName: "La Cosmica",
    },
    {
      title: "Temascal Ceremony",
      category: "ceremony" as const,
      venueName: "Temascal Ocelotl",
      date: dayAfter,
      startTime: "16:00:00",
      endTime: "18:30:00",
      description: "Traditional Oaxacan sweat lodge ceremony for purification and healing.",
      organizerName: "Don Miguel",
    },
    {
      title: "Self-Love Portrait Session",
      category: "wellness" as const,
      venueName: "Posada del Arquitecto",
      date: dayAfter,
      startTime: "10:00:00",
      endTime: "12:00:00",
      description: "Guided self-portrait photography session for self-expression and confidence.",
      organizerName: "Luna",
    },
    {
      title: "Community Potluck",
      category: "community" as const,
      venueName: "Main Plaza",
      date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      startTime: "18:30:00",
      endTime: "21:00:00",
      description: "Bring a dish, meet your neighbors. Everyone welcome.",
      organizerName: "Mazunte Community",
    },
    {
      title: "Artisan Market",
      category: "market" as const,
      venueName: "Main Plaza",
      date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      startTime: "09:00:00",
      endTime: "14:00:00",
      description: "Local artisans, handmade jewelry, textiles, and crafts.",
      organizerName: "Mazunte Artisans",
    },
    {
      title: "Sunset DJ Set",
      category: "music" as const,
      venueName: "Punta Cometa",
      date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      startTime: "17:00:00",
      endTime: "20:00:00",
      description: "Electronic beats on the sacred hilltop as the sun sets over the Pacific.",
      organizerName: "DJ Luna",
    },
    {
      title: "Acroyoga Workshop",
      category: "yoga" as const,
      venueName: "Playa Mermejita",
      date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      startTime: "09:00:00",
      endTime: "11:00:00",
      description: "Partner yoga on the beach. Beginners welcome. Come with or without a partner.",
      organizerName: "Alex & Maya",
    },
    {
      title: "Vegan Brunch Pop-up",
      category: "food" as const,
      venueName: "Cocomiel",
      date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      startTime: "11:00:00",
      endTime: "14:00:00",
      description: "Special vegan brunch menu. Reservations recommended.",
      organizerName: "Cocomiel",
    },
  ];

  // Featured event
  const featuredEvent = {
    title: "Full Moon Ceremony & Ecstatic Dance",
    category: "ceremony" as const,
    venueName: "Punta Cometa",
    date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    startTime: "19:00:00",
    endTime: "23:00:00",
    description: "A night of movement, fire, live music, and connection under the Mazunte sky. Open to all.",
    organizerName: "Mazunte Collective",
    isFeatured: true,
  };

  const allEvents = [...oneOffEvents, featuredEvent];

  const eventRows = allEvents.map((e) => ({
    id: createId(),
    title: e.title,
    slug: slugify(e.title),
    description: e.description || null,
    category: e.category,
    venueName: e.venueName,
    placeId: null,
    mapsUrl: null,
    organizerName: e.organizerName || null,
    organizerContact: null,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime || null,
    isRecurring: false,
    recurrencePattern: null,
    isFeatured: "isFeatured" in e ? (e as typeof featuredEvent).isFeatured : false,
    isApproved: true,
    contactWhatsapp: null,
    contactInstagram: null,
    contactLink: null,
    updatedAt: null,
  }));

  await db.insert(schema.events).values(eventRows);
  console.log(`  Inserted ${eventRows.length} events`);

  // ── Create occurrences for one-off events ─────────
  const occurrences = eventRows.map((e) => ({
    id: createId(),
    eventId: e.id,
    date: e.date!,
    startTime: e.startTime,
    endTime: e.endTime,
    isCancelled: false,
  }));

  await db.insert(schema.eventOccurrences).values(occurrences);
  console.log(`  Inserted ${occurrences.length} occurrences`);

  // ── Recurring event example ───────────────────────
  const recurringId = createId();
  const recurringEvent = {
    id: recurringId,
    title: "Morning Meditation",
    slug: slugify("Morning Meditation"),
    description: "Silent meditation practice. All traditions welcome. Donation based.",
    category: "yoga" as const,
    venueName: "Rancho Cerro Largo",
    placeId: null,
    mapsUrl: null,
    organizerName: "Rancho Cerro Largo",
    organizerContact: null,
    date: null,
    startTime: "06:30:00",
    endTime: "07:30:00",
    isRecurring: true,
    recurrencePattern: { days: ["mon", "tue", "wed", "thu", "fri", "sat"], until: "2026-06-01" },
    isFeatured: false,
    isApproved: true,
    contactWhatsapp: null,
    contactInstagram: null,
    contactLink: null,
    updatedAt: null,
  };

  await db.insert(schema.events).values(recurringEvent);
  console.log("  Inserted 1 recurring event");

  // Expand recurring occurrences for next 30 days
  const recurringOccurrences = expandRecurrence(
    recurringId,
    recurringEvent.recurrencePattern,
    recurringEvent.startTime,
    recurringEvent.endTime,
    today
  ).slice(0, 30); // limit to 30 for seed

  if (recurringOccurrences.length > 0) {
    await db.insert(schema.eventOccurrences).values(
      recurringOccurrences.map((o) => ({ ...o, isCancelled: false }))
    );
    console.log(`  Inserted ${recurringOccurrences.length} recurring occurrences`);
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
