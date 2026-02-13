"use server";

import { extractEventInfo, type ExtractedEvent } from "./extract";
import { isAdminAuthenticated } from "./admin";

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
