"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getMazunteToday } from "@/lib/utils";

export type ExtractedEvent = {
  title: string | null;
  description: string | null;
  category: string | null;
  venueName: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  isRecurring: boolean;
  recurrenceDays: string[];
  organizerName: string | null;
  contactWhatsapp: string | null;
  contactInstagram: string | null;
  contactLink: string | null;
  // Google Places data (resolved server-side)
  placeId: string | null;
  mapsUrl: string | null;
  venueAddress: string | null;
};

const CATEGORIES = ["yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other"] as const;

const SYSTEM_PROMPT = `You are an event data extractor for a community events board in Mazunte, Oaxaca, Mexico. Extract structured event information from user-provided text (WhatsApp messages, Instagram captions, flyers, etc.).

Rules:
- The text may be in English or Spanish — handle both
- Return a JSON object with the extracted fields
- Use null for any field you cannot confidently extract
- For category, pick the BEST match from: yoga, music, ceremony, food, wellness, community, market, family, other
- For dates, convert to YYYY-MM-DD format. Today is {today}. Handle relative dates like "mañana", "este viernes", "next Saturday"
- For times, convert to HH:MM (24-hour) format. Handle "7am", "7 de la mañana", "19:00", "7pm" etc.
- For recurring events, set isRecurring to true and recurrenceDays to an array of day abbreviations: mon, tue, wed, thu, fri, sat, sun
- For WhatsApp numbers, include country code if visible (e.g. "+52 958 116 9947")
- For Instagram, extract just the handle without @ (e.g. "mazuntetoday")
- For URLs/links, extract any booking or registration links
- For description, write a clean 1-2 sentence summary of the event (not the raw text)
- For organizerName, extract the person or studio/business name hosting the event

Respond ONLY with valid JSON, no markdown fences, no explanation.`;

const JSON_SCHEMA = `{
  "title": "string or null",
  "description": "string or null",
  "category": "one of: yoga, music, ceremony, food, wellness, community, market, family, other — or null",
  "venueName": "string or null (the place/venue name)",
  "date": "YYYY-MM-DD or null",
  "startTime": "HH:MM or null",
  "endTime": "HH:MM or null",
  "isRecurring": "boolean",
  "recurrenceDays": "array of: mon, tue, wed, thu, fri, sat, sun",
  "organizerName": "string or null",
  "contactWhatsapp": "string or null",
  "contactInstagram": "string or null (handle without @)",
  "contactLink": "string or null (URL)"
}`;

async function searchPlace(venueName: string): Promise<{
  placeId: string;
  name: string;
  address: string;
  mapsUrl: string;
} | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
      `query=${encodeURIComponent(venueName + " Mazunte Oaxaca")}` +
      `&location=15.665,-96.55&radius=5000` +
      `&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const place = data.results[0];
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address || "",
        mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      };
    }
  } catch {
    // Silently fail — user can still pick venue manually
  }

  return null;
}

export async function extractEventInfo(
  text: string,
  imageUrls: string[]
): Promise<{ data: ExtractedEvent } | { error: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "AI extraction is not configured." };
  }

  if (!text.trim()) {
    return { error: "Please paste some event text." };
  }

  const client = new Anthropic({ apiKey });
  const today = getMazunteToday();

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "text" as const,
      text: `Extract event data from the following text. Today's date is ${today}.\n\nReturn JSON matching this schema:\n${JSON_SCHEMA}\n\nText:\n${text}`,
    },
  ];

  // Add images for vision extraction if provided
  for (const url of imageUrls.slice(0, 3)) {
    content.push({
      type: "image" as const,
      source: { type: "url" as const, url },
    });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT.replace("{today}", today),
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Failed to extract event information." };
    }

    let parsed;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return { error: "Failed to parse extracted data." };
    }

    // Validate category
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;

    // Validate recurrence days
    const validDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const recurrenceDays = Array.isArray(parsed.recurrenceDays)
      ? parsed.recurrenceDays.filter((d: string) => validDays.includes(d))
      : [];

    const extracted: ExtractedEvent = {
      title: parsed.title || null,
      description: parsed.description || null,
      category,
      venueName: parsed.venueName || null,
      date: parsed.date || null,
      startTime: parsed.startTime || null,
      endTime: parsed.endTime || null,
      isRecurring: parsed.isRecurring === true,
      recurrenceDays,
      organizerName: parsed.organizerName || null,
      contactWhatsapp: parsed.contactWhatsapp || null,
      contactInstagram: parsed.contactInstagram || null,
      contactLink: parsed.contactLink || null,
      placeId: null,
      mapsUrl: null,
      venueAddress: null,
    };

    // Try to resolve venue via Google Places
    if (extracted.venueName) {
      const place = await searchPlace(extracted.venueName);
      if (place) {
        extracted.placeId = place.placeId;
        extracted.mapsUrl = place.mapsUrl;
        extracted.venueAddress = place.address;
        extracted.venueName = place.name; // Use the canonical name from Google
      }
    }

    return { data: extracted };
  } catch (err) {
    console.error("Event extraction failed:", err);
    return { error: "Failed to extract event information. Please try again." };
  }
}
