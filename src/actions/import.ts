"use server";

import Anthropic from "@anthropic-ai/sdk";
import { extractEventInfo, type ExtractedEvent } from "./extract";
import { isAdminAuthenticated } from "./admin";
import { getMazunteToday } from "@/lib/utils";

export type ParsedMessage = {
  id: string;
  timestamp: string;
  sender: string;
  text: string;
};

/**
 * Parse a WhatsApp chat export .txt file into individual messages.
 * WhatsApp format: "DD/MM/YYYY, HH:MM - Sender: Message"
 * or: "M/D/YY, H:MM AM - Sender: Message"
 */
export async function parseWhatsAppExport(
  content: string
): Promise<{ messages: ParsedMessage[] } | { error: string }> {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) return { error: "Not authenticated" };

  if (!content.trim()) return { error: "Empty file" };

  // Match common WhatsApp export formats
  // Format 1: "DD/MM/YYYY, HH:MM - Sender: Message"
  // Format 2: "M/D/YY, H:MM AM - Sender: Message"
  // Format 3: "[DD/MM/YYYY, HH:MM:SS] Sender: Message"
  const messageRegex =
    /^(?:\[)?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*[-–]\s*([^:]+?):\s*([\s\S]*?)$/;

  const lines = content.split("\n");
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;
  let messageId = 0;

  for (const line of lines) {
    const match = line.match(messageRegex);

    if (match) {
      // Save previous message
      if (currentMessage && currentMessage.text.trim()) {
        messages.push(currentMessage);
      }

      messageId++;
      currentMessage = {
        id: `msg-${messageId}`,
        timestamp: `${match[1]}, ${match[2]}`,
        sender: match[3].trim(),
        text: match[4].trim(),
      };
    } else if (currentMessage && line.trim()) {
      // Continuation of previous message (multi-line)
      currentMessage.text += "\n" + line.trim();
    }
  }

  // Don't forget the last message
  if (currentMessage && currentMessage.text.trim()) {
    messages.push(currentMessage);
  }

  // Filter out system messages and very short messages
  const filtered = messages.filter((m) => {
    // Skip WhatsApp system messages
    if (m.text.includes("Messages and calls are end-to-end encrypted")) return false;
    if (m.text.includes("Los mensajes y las llamadas están cifrados")) return false;
    if (m.text.includes("changed the group")) return false;
    if (m.text.includes("cambió el asunto")) return false;
    if (m.text.includes("added") && m.text.includes("to the group")) return false;
    if (m.text === "<Media omitted>") return false;
    if (m.text === "<Multimedia omitido>") return false;
    // Skip very short messages (likely not events)
    if (m.text.length < 20) return false;
    return true;
  });

  return { messages: filtered };
}

/**
 * Extract event data from multiple selected messages combined into one text.
 * Reuses the existing extractEventInfo action.
 */
export async function extractFromMessages(
  combinedText: string
): Promise<{ data: ExtractedEvent } | { error: string }> {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) return { error: "Not authenticated" };

  return extractEventInfo(combinedText, []);
}

/**
 * Bulk extract: takes a venue schedule text and returns multiple events.
 * Useful when a venue sends "Monday: yoga 7am, Tuesday: cacao 6pm..."
 */
export async function bulkExtractEvents(
  text: string,
  venueName?: string
): Promise<{ events: ExtractedEvent[] } | { error: string }> {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) return { error: "Not authenticated" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "AI extraction not configured" };

  const client = new Anthropic({ apiKey });
  const today = getMazunteToday();

  const prompt = `You are extracting MULTIPLE events from a venue schedule or message. Today is ${today}.

The text may contain several events — extract ALL of them as a JSON array.

For each event, return:
{
  "title": "string",
  "description": "string or null (keep original voice/text)",
  "category": "yoga|music|ceremony|food|wellness|community|market|family|other",
  "venueName": "${venueName || 'string or null'}",
  "date": "YYYY-MM-DD or null",
  "startTime": "HH:MM or null",
  "endTime": "HH:MM or null",
  "isRecurring": false,
  "recurrenceDays": [],
  "organizerName": "string or null",
  "contactWhatsapp": "string or null",
  "contactInstagram": "string or null",
  "contactLink": "string or null"
}

Return a JSON array of events. No markdown fences, no explanation. Just the array.

Text:
${text}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Failed to extract events" };
    }

    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);
    const arr = Array.isArray(parsed) ? parsed : [parsed];

    const validCategories = ["yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other"];

    const events: ExtractedEvent[] = arr.map((e: Record<string, unknown>) => ({
      title: (e.title as string) || null,
      description: (e.description as string) || null,
      category: validCategories.includes(e.category as string) ? (e.category as string) : null,
      venueName: (e.venueName as string) || venueName || null,
      date: (e.date as string) || null,
      startTime: (e.startTime as string) || null,
      endTime: (e.endTime as string) || null,
      isRecurring: false,
      recurrenceDays: [],
      organizerName: (e.organizerName as string) || null,
      contactWhatsapp: (e.contactWhatsapp as string) || null,
      contactInstagram: (e.contactInstagram as string) || null,
      contactLink: (e.contactLink as string) || null,
      placeId: null,
      mapsUrl: null,
      venueAddress: null,
    }));

    return { events };
  } catch (err) {
    console.error("Bulk extraction failed:", err);
    return { error: "Failed to extract events" };
  }
}
