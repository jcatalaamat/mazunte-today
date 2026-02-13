"use client";

import { useState, useRef } from "react";
import {
  parseWhatsAppExport,
  extractFromMessages,
  type ParsedMessage,
} from "@/actions/import";
import { submitEvent } from "@/actions/submit";
import { type ExtractedEvent } from "@/actions/extract";
import { PlacesAutocomplete, type PlaceResult } from "@/components/places-autocomplete";

type Step = "upload" | "select" | "review" | "done";

const categoryKeys = [
  "yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other",
];

export function ImportFlow() {
  const [step, setStep] = useState<Step>("upload");

  // Upload step
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Select step
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Review step
  const [extracted, setExtracted] = useState<ExtractedEvent | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  // Created events count
  const [createdCount, setCreatedCount] = useState(0);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseError(null);

    const text = await file.text();
    const result = await parseWhatsAppExport(text);

    if ("error" in result) {
      setParseError(result.error);
      setParsing(false);
      return;
    }

    setMessages(result.messages);
    setParsing(false);
    setStep("select");
  }

  async function handlePasteSubmit() {
    if (!pasteText.trim()) return;

    setParsing(true);
    setParseError(null);

    // Try parsing as WhatsApp export first
    const result = await parseWhatsAppExport(pasteText);

    if ("error" in result || ("messages" in result && result.messages.length === 0)) {
      // Not a WhatsApp export — treat as a single block of text, split by double newlines
      const blocks = pasteText
        .split(/\n\s*\n/)
        .map((b, i) => ({
          id: `paste-${i}`,
          timestamp: "",
          sender: "",
          text: b.trim(),
        }))
        .filter((b) => b.text.length > 10);

      if (blocks.length === 0) {
        setParseError("No event text found.");
        setParsing(false);
        return;
      }

      setMessages(blocks);
    } else {
      setMessages(result.messages);
    }

    setParsing(false);
    setStep("select");
  }

  function toggleMessage(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(messages.map((m) => m.id)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  async function handleExtract() {
    const selected = messages.filter((m) => selectedIds.has(m.id));
    if (selected.length === 0) return;

    setExtracting(true);
    setExtractError(null);
    setSubmitResult(null);

    // Combine selected messages into one text
    const combinedText = selected.map((m) => {
      if (m.sender) return `[${m.sender}]: ${m.text}`;
      return m.text;
    }).join("\n\n");

    const result = await extractFromMessages(combinedText);

    if ("error" in result) {
      setExtractError(result.error);
      setExtracting(false);
      return;
    }

    setExtracted(result.data);

    // Set up place if resolved
    if (result.data.placeId && result.data.venueName) {
      setSelectedPlace({
        placeId: result.data.placeId,
        name: result.data.venueName,
        address: result.data.venueAddress || "",
        mapsUrl: result.data.mapsUrl || "",
      });
    } else {
      setSelectedPlace(null);
    }

    setExtracting(false);
    setStep("review");
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setSubmitResult(null);

    // Add place data from state
    if (selectedPlace) {
      formData.set("venueName", selectedPlace.name);
      formData.set("placeId", selectedPlace.placeId);
      formData.set("mapsUrl", selectedPlace.mapsUrl);
    }

    const result = await submitEvent({ success: false, message: "" }, formData);

    setSubmitting(false);

    if (result.success) {
      setCreatedCount((c) => c + 1);
      setSubmitResult("Event created! Ready for approval.");
      // Clear selection for next import
      setSelectedIds(new Set());
      setExtracted(null);
      setStep("select");
    } else {
      setSubmitResult(`Error: ${result.message}`);
    }
  }

  // ── STEP 1: UPLOAD ──────────────────────────────────────
  if (step === "upload") {
    return (
      <div className="space-y-6">
        {!pasteMode ? (
          <>
            {/* File upload */}
            <div>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-ocean/50 transition-colors bg-cream/50">
                <div className="flex flex-col items-center justify-center py-4">
                  {parsing ? (
                    <p className="text-sm text-text-soft">Parsing...</p>
                  ) : (
                    <>
                      <p className="text-2xl mb-2">📱</p>
                      <p className="mb-1 text-sm text-text-soft">
                        <span className="font-medium text-ocean">Upload WhatsApp export</span>
                      </p>
                      <p className="text-xs text-text-lighter">
                        .txt file from WhatsApp &quot;Export Chat&quot;
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={parsing}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-black/10" />
              <span className="text-xs text-text-lighter">or</span>
              <div className="flex-1 border-t border-black/10" />
            </div>

            <button
              onClick={() => setPasteMode(true)}
              className="w-full py-3.5 rounded-xl border-2 border-black/10 text-sm font-medium hover:border-ocean/30 transition-colors cursor-pointer"
            >
              Paste event texts manually
            </button>
          </>
        ) : (
          <>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none font-mono text-xs"
              placeholder={"Paste WhatsApp export text or multiple event descriptions here...\n\nSeparate events with blank lines."}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPasteMode(false)}
                className="px-4 py-2.5 rounded-xl border border-black/10 text-sm hover:bg-black/5 transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handlePasteSubmit}
                disabled={parsing || !pasteText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-light transition-colors disabled:opacity-50 cursor-pointer"
              >
                {parsing ? "Parsing..." : "Parse Messages →"}
              </button>
            </div>
          </>
        )}

        {parseError && (
          <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3">
            {parseError}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: SELECT MESSAGES ─────────────────────────────
  if (step === "select") {
    return (
      <div className="space-y-4">
        {createdCount > 0 && (
          <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3">
            {createdCount} event{createdCount !== 1 ? "s" : ""} created so far. Select more messages to continue importing.
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-text-soft">
            {messages.length} messages found · {selectedIds.size} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-ocean hover:underline cursor-pointer"
            >
              Select all
            </button>
            <span className="text-text-lighter">·</span>
            <button
              onClick={selectNone}
              className="text-xs text-ocean hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => toggleMessage(msg.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                selectedIds.has(msg.id)
                  ? "border-ocean bg-ocean/5"
                  : "border-black/5 hover:border-black/15"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedIds.has(msg.id)
                      ? "bg-ocean border-ocean text-white"
                      : "border-black/20"
                  }`}
                >
                  {selectedIds.has(msg.id) && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {msg.sender && (
                    <p className="text-xs text-text-lighter mb-1">
                      {msg.sender} · {msg.timestamp}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap line-clamp-4">
                    {msg.text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              setStep("upload");
              setMessages([]);
              setSelectedIds(new Set());
            }}
            className="px-4 py-2.5 rounded-xl border border-black/10 text-sm hover:bg-black/5 transition-colors cursor-pointer"
          >
            ← Start over
          </button>
          <button
            onClick={handleExtract}
            disabled={selectedIds.size === 0 || extracting}
            className="flex-1 py-2.5 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-light transition-colors disabled:opacity-50 cursor-pointer"
          >
            {extracting
              ? "Extracting..."
              : `Extract Event from ${selectedIds.size} message${selectedIds.size !== 1 ? "s" : ""} →`}
          </button>
        </div>

        {extractError && (
          <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3">
            {extractError}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 3: REVIEW & SUBMIT ─────────────────────────────
  if (step === "review" && extracted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep("select")}
            className="text-sm text-ocean hover:text-ocean-light transition-colors cursor-pointer"
          >
            ← Back to messages
          </button>
          {submitResult && (
            <p className={`text-sm ${submitResult.startsWith("Error") ? "text-coral" : "text-green-600"}`}>
              {submitResult}
            </p>
          )}
        </div>

        <form action={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input
              name="title"
              required
              defaultValue={extracted.title || ""}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              name="category"
              required
              defaultValue={extracted.category || ""}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            >
              <option value="">Select</option>
              {categoryKeys.map((key) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Venue *</label>
            <PlacesAutocomplete
              onPlaceSelect={setSelectedPlace}
              defaultValue={selectedPlace?.name || extracted.venueName || ""}
              placeholder="Search for a place..."
              required
            />
            <input type="hidden" name="venueName" value={selectedPlace?.name || extracted.venueName || ""} />
            <input type="hidden" name="placeId" value={selectedPlace?.placeId || ""} />
            <input type="hidden" name="mapsUrl" value={selectedPlace?.mapsUrl || ""} />
            {selectedPlace && (
              <p className="text-xs text-text-lighter mt-1.5">{selectedPlace.address}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={extracted.description || ""}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none"
            />
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Date *</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={extracted.date || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Start *</label>
              <input
                name="startTime"
                type="time"
                required
                defaultValue={extracted.startTime || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End</label>
              <input
                name="endTime"
                type="time"
                defaultValue={extracted.endTime || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
          </div>

          {/* Recurring */}
          <input type="hidden" name="isRecurring" value="false" />

          {/* Organizer */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Organizer *</label>
            <input
              name="organizerName"
              required
              defaultValue={extracted.organizerName || ""}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-lighter mb-1">WhatsApp</label>
              <input
                name="contactWhatsapp"
                type="tel"
                defaultValue={extracted.contactWhatsapp || ""}
                className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.82rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-lighter mb-1">Instagram</label>
              <input
                name="contactInstagram"
                defaultValue={extracted.contactInstagram || ""}
                className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.82rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-lighter mb-1">Link</label>
              <input
                name="contactLink"
                type="url"
                defaultValue={extracted.contactLink || ""}
                className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.82rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-light transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Creating..." : "Create Event (pending approval)"}
          </button>
        </form>
      </div>
    );
  }

  return null;
}
