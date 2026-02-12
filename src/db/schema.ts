import {
  pgTable,
  text,
  boolean,
  date,
  time,
  jsonb,
  timestamp,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", [
  "yoga",
  "music",
  "ceremony",
  "food",
  "wellness",
  "community",
  "market",
  "other",
]);

// ── Venues ──────────────────────────────────────────────
export const venues = pgTable(
  "venues",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    address: text("address"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    website: text("website"),
    instagram: text("instagram"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    unique("venues_slug_unique").on(table.slug),
  ]
);

// ── Events ──────────────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    category: categoryEnum("category").notNull().default("other"),
    venueId: text("venue_id").references(() => venues.id),
    venueName: text("venue_name"),
    organizerName: text("organizer_name"),
    organizerContact: text("organizer_contact"),
    date: date("date", { mode: "string" }),
    startTime: time("start_time").notNull(),
    endTime: time("end_time"),
    isRecurring: boolean("is_recurring").notNull().default(false),
    recurrencePattern: jsonb("recurrence_pattern").$type<{
      days: string[];
      until: string;
    }>(),
    isFeatured: boolean("is_featured").notNull().default(false),
    boostedUntil: timestamp("boosted_until", { mode: "string" }),
    isApproved: boolean("is_approved").notNull().default(false),
    contactWhatsapp: text("contact_whatsapp"),
    contactInstagram: text("contact_instagram"),
    contactLink: text("contact_link"),
    images: jsonb("images").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    unique("events_slug_unique").on(table.slug),
    index("events_category_idx").on(table.category),
    index("events_date_idx").on(table.date),
    index("events_is_approved_idx").on(table.isApproved),
    index("events_is_featured_idx").on(table.isFeatured),
    index("events_start_time_idx").on(table.startTime),
  ]
);

// ── Event Occurrences ───────────────────────────────────
export const eventOccurrences = pgTable(
  "event_occurrences",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time"),
    isCancelled: boolean("is_cancelled").notNull().default(false),
  },
  (table) => [
    index("occurrences_date_idx").on(table.date),
    index("occurrences_event_id_idx").on(table.eventId),
    index("occurrences_date_cancelled_idx").on(table.date, table.isCancelled),
  ]
);

// ── Subscribers ─────────────────────────────────────────
export const subscribers = pgTable(
  "subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    unique("subscribers_email_unique").on(table.email),
  ]
);
