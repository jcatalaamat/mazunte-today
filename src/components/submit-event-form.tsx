"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { submitEvent, type SubmitEventState } from "@/actions/submit";
import { extractEventInfo, type ExtractedEvent } from "@/actions/extract";
import { uploadImage } from "@/actions/upload";
import Image from "next/image";
import { PlacesAutocomplete, type PlaceResult } from "./places-autocomplete";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";

const categoryKeys = ["yoga", "music", "ceremony", "food", "wellness", "community", "market", "family", "other"];
const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const initialState: SubmitEventState = {
  success: false,
  message: "",
};

const MAX_IMAGES = 5;

type Phase = "paste" | "confirm";

export function SubmitEventForm() {
  const [state, formAction, pending] = useActionState(submitEvent, initialState);
  const [phase, setPhase] = useState<Phase>("paste");

  // Paste phase state
  const [pasteText, setPasteText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Image state (shared between phases)
  const [images, setImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm phase state (pre-filled from AI, controlled to persist across re-renders)
  const [extractedData, setExtractedData] = useState<ExtractedEvent | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [checkedDays, setCheckedDays] = useState<string[]>([]);

  // Controlled form field values (prevents loss on failed submission re-render)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactInstagram, setContactInstagram] = useState("");
  const [contactLink, setContactLink] = useState("");
  const [recurrenceUntil, setRecurrenceUntil] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("submit");
  const tc = useTranslations("categories");
  const td = useTranslations("days");

  // Image upload handler (reused in both phases)
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setImageError(t("maxImages", { max: MAX_IMAGES }));
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setImageUploading(true);
    setImageError(null);

    const uploadedUrls: string[] = [];
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      if ("error" in result) {
        setImageError(result.error);
        break;
      } else {
        uploadedUrls.push(result.url);
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setImageUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  }

  // Extract event info from pasted text
  async function handleExtract() {
    if (!pasteText.trim()) {
      setExtractError(t("pasteRequired"));
      return;
    }

    setExtracting(true);
    setExtractError(null);

    const result = await extractEventInfo(pasteText, images);

    if ("error" in result) {
      setExtractError(result.error);
      setExtracting(false);
      return;
    }

    setExtractedData(result.data);
    setIsRecurring(result.data.isRecurring);
    setCheckedDays(result.data.recurrenceDays);

    // Populate controlled form fields from extracted data
    setTitle(result.data.title || "");
    setCategory(result.data.category || "");
    setDescription(result.data.description || "");
    setDate(result.data.date || "");
    setStartTime(result.data.startTime || "");
    setEndTime(result.data.endTime || "");
    setOrganizerName(result.data.organizerName || "");
    setContactWhatsapp(result.data.contactWhatsapp || "");
    setContactInstagram(result.data.contactInstagram || "");
    setContactLink(result.data.contactLink || "");

    // Set up place data if resolved
    if (result.data.placeId && result.data.venueName) {
      setSelectedPlace({
        placeId: result.data.placeId,
        name: result.data.venueName,
        address: result.data.venueAddress || "",
        mapsUrl: result.data.mapsUrl || "",
      });
    }

    setExtracting(false);
    setPhase("confirm");
    posthog.capture("event_extracted");
  }

  function handleDayToggle(day: string) {
    setCheckedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  useEffect(() => {
    if (state.success) {
      posthog.capture("event_submitted");
    }
    // Scroll to error summary when validation fails
    if (state.message && !state.success && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.success, state.message]);

  // Success screen
  if (state.success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-serif text-2xl mb-2">{t("submitted")}</h2>
        <p className="text-text-soft">{state.message}</p>
      </div>
    );
  }

  // ── PHASE 1: PASTE ──────────────────────────────────────
  if (phase === "paste") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        {/* Paste text */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            {t("pasteLabel")}
          </label>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none"
            placeholder={t("pastePlaceholder")}
          />
          <p className="text-xs text-text-lighter mt-1">
            {t("pasteHint")}
          </p>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            {t("images", { max: MAX_IMAGES })}
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {images.map((url, index) => (
                <div key={url} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-cream">
                  <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-sm"
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 text-[0.6rem] font-semibold uppercase bg-black/50 text-white px-2 py-0.5 rounded">
                      {t("coverLabel")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_IMAGES && (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-ocean/50 transition-colors bg-cream/50">
              <div className="flex flex-col items-center justify-center py-4">
                {imageUploading ? (
                  <p className="text-sm text-text-soft">{t("uploading")}</p>
                ) : (
                  <>
                    <p className="mb-1 text-sm text-text-soft">
                      <span className="font-medium text-ocean">{t("clickToUpload")}</span> {t("dragAndDrop")}
                    </p>
                    <p className="text-xs text-text-lighter">
                      {t("imageFormats", { current: images.length, max: MAX_IMAGES })}
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleImageChange}
                disabled={imageUploading}
                multiple
                className="hidden"
              />
            </label>
          )}

          {imageError && <p className="text-coral text-xs mt-1">{imageError}</p>}
        </div>

        {extractError && (
          <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3">
            {extractError}
          </div>
        )}

        {/* Extract button */}
        <button
          type="button"
          onClick={handleExtract}
          disabled={extracting || imageUploading}
          className="w-full py-3.5 rounded-xl bg-ocean text-white font-semibold text-[0.88rem] hover:bg-ocean-light transition-colors disabled:opacity-50 cursor-pointer"
        >
          {extracting ? t("extracting") : t("extractButton")}
        </button>

        <p className="text-xs text-text-lighter text-center">
          {t("extractHint")}
        </p>
      </div>
    );
  }

  // ── PHASE 2: CONFIRM & EDIT ─────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back button + header */}
      <div>
        <button
          type="button"
          onClick={() => setPhase("paste")}
          className="text-sm text-ocean hover:text-ocean-light transition-colors mb-3 cursor-pointer"
        >
          ← {t("backButton")}
        </button>
        <p className="text-sm text-text-soft">
          {t("confirmDescription")}
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-6">
        {state.message && !state.success && (
          <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3">
            <p className="font-medium">{state.message}</p>
            {state.errors && (
              <ul className="mt-2 space-y-0.5 text-xs list-disc list-inside">
                {Object.values(state.errors).flat().map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("eventTitle")}</label>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-[1.5px] bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors ${state.errors?.title ? "border-coral" : "border-black/10"}`}
            placeholder={t("titlePlaceholder")}
          />
          {state.errors?.title && (
            <p className="text-coral text-xs mt-1">{state.errors.title[0]}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("category")}</label>
          <select
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-[1.5px] bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors ${state.errors?.category ? "border-coral" : "border-black/10"}`}
          >
            <option value="">{t("selectCategory")}</option>
            {categoryKeys.map((key) => (
              <option key={key} value={key}>{tc(key)}</option>
            ))}
          </select>
          {state.errors?.category && (
            <p className="text-coral text-xs mt-1">{state.errors.category[0]}</p>
          )}
        </div>

        {/* Venue - Places Autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("where")}</label>
          <PlacesAutocomplete
            onPlaceSelect={setSelectedPlace}
            defaultValue={selectedPlace?.name || extractedData?.venueName || ""}
            placeholder={t("searchPlace")}
            required
          />
          <input type="hidden" name="venueName" value={selectedPlace?.name || extractedData?.venueName || ""} />
          <input type="hidden" name="placeId" value={selectedPlace?.placeId || ""} />
          <input type="hidden" name="mapsUrl" value={selectedPlace?.mapsUrl || ""} />
          {selectedPlace && (
            <p className="text-xs text-text-lighter mt-1.5">{selectedPlace.address}</p>
          )}
          {state.errors?.venueName && (
            <p className="text-coral text-xs mt-1">{state.errors.venueName[0]}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("description")}</label>
          <textarea
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none"
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center gap-3">
          <input type="hidden" name="isRecurring" value={isRecurring ? "true" : "false"} />
          <button
            type="button"
            onClick={() => setIsRecurring(!isRecurring)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isRecurring ? "bg-ocean" : "bg-black/15"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isRecurring ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm">{t("recurring")}</span>
        </div>

        {/* Date or Recurrence */}
        {isRecurring ? (
          <div className="space-y-4 p-4 bg-ocean-pale/30 rounded-xl">
            <div>
              <label className="block text-sm font-medium mb-2">{t("daysOfWeek")}</label>
              <div className="flex flex-wrap gap-2">
                {dayKeys.map((key) => (
                  <label
                    key={key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                      checkedDays.includes(key)
                        ? "bg-ocean text-white border-ocean"
                        : "bg-cream border-black/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="recurrenceDays"
                      value={key}
                      checked={checkedDays.includes(key)}
                      onChange={() => handleDayToggle(key)}
                      className="sr-only"
                    />
                    {td(key)}
                  </label>
                ))}
              </div>
              {state.errors?.recurrenceDays && (
                <p className="text-coral text-xs mt-1">{state.errors.recurrenceDays[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("until")}</label>
              <input
                name="recurrenceUntil"
                type="date"
                value={recurrenceUntil}
                onChange={(e) => setRecurrenceUntil(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("date")}</label>
            <input
              name="date"
              type="date"
              required={!isRecurring}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-[1.5px] bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors ${state.errors?.date ? "border-coral" : "border-black/10"}`}
            />
            {state.errors?.date && (
              <p className="text-coral text-xs mt-1">{state.errors.date[0]}</p>
            )}
          </div>
        )}

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("startTime")}</label>
            <input
              name="startTime"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-[1.5px] bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors ${state.errors?.startTime ? "border-coral" : "border-black/10"}`}
            />
            {state.errors?.startTime && (
              <p className="text-coral text-xs mt-1">{state.errors.startTime[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("endTime")}</label>
            <input
              name="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            />
            {state.errors?.endTime && (
              <p className="text-coral text-xs mt-1">{state.errors.endTime[0]}</p>
            )}
          </div>
        </div>

        {/* Organizer */}
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("organizerName")}</label>
          <input
            name="organizerName"
            required
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-[1.5px] bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors ${state.errors?.organizerName ? "border-coral" : "border-black/10"}`}
            placeholder={t("organizerPlaceholder")}
          />
          {state.errors?.organizerName && (
            <p className="text-coral text-xs mt-1">{state.errors.organizerName[0]}</p>
          )}
        </div>

        {/* Images (already uploaded in phase 1) */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            {t("images", { max: MAX_IMAGES })}
          </label>

          {images.map((url) => (
            <input key={url} type="hidden" name="images" value={url} />
          ))}

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {images.map((url, index) => (
                <div key={url} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-cream">
                  <Image src={url} alt={`Event image ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-sm"
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 text-[0.6rem] font-semibold uppercase bg-black/50 text-white px-2 py-0.5 rounded">
                      {t("coverLabel")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_IMAGES && (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-ocean/50 transition-colors bg-cream/50">
              <div className="flex flex-col items-center justify-center py-4">
                {imageUploading ? (
                  <p className="text-sm text-text-soft">{t("uploading")}</p>
                ) : (
                  <>
                    <p className="mb-1 text-sm text-text-soft">
                      <span className="font-medium text-ocean">{t("clickToUpload")}</span> {t("dragAndDrop")}
                    </p>
                    <p className="text-xs text-text-lighter">
                      {t("imageFormats", { current: images.length, max: MAX_IMAGES })}
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleImageChange}
                disabled={imageUploading}
                multiple
                className="hidden"
              />
            </label>
          )}

          {imageError && <p className="text-coral text-xs mt-1">{imageError}</p>}
          <p className="text-xs text-text-lighter mt-1">{t("coverHint")}</p>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <p className="text-sm font-medium">{t("contact")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                name="contactWhatsapp"
                type="tel"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
                placeholder={t("whatsappPlaceholder")}
              />
              <p className="text-xs text-text-lighter mt-1">{t("whatsappHint")}</p>
            </div>
            <input
              name="contactInstagram"
              value={contactInstagram}
              onChange={(e) => setContactInstagram(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              placeholder={t("instagramPlaceholder")}
            />
          </div>
          <input
            name="contactLink"
            type="url"
            value={contactLink}
            onChange={(e) => setContactLink(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            placeholder={t("linkPlaceholder")}
          />
          {state.errors?.contactLink && (
            <p className="text-coral text-xs mt-1">{state.errors.contactLink[0]}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 rounded-xl bg-ocean text-white font-semibold text-[0.88rem] hover:bg-ocean-light transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? t("submitting") : t("submitButton")}
        </button>

        <p className="text-xs text-text-lighter text-center">
          {t("reviewNotice")}
        </p>
      </form>
    </div>
  );
}
