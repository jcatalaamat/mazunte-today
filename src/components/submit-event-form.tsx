"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { submitEvent, type SubmitEventState } from "@/actions/submit";
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

export function SubmitEventForm() {
  const [state, formAction, pending] = useActionState(submitEvent, initialState);
  const [isRecurring, setIsRecurring] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("submit");
  const tc = useTranslations("categories");
  const td = useTranslations("days");

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

  useEffect(() => {
    if (state.success) {
      posthog.capture("event_submitted");
    }
  }, [state.success]);

  if (state.success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-serif text-2xl mb-2">{t("submitted")}</h2>
        <p className="text-text-soft">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-lg mx-auto space-y-6">
      {state.message && !state.success && (
        <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3">
          {state.message}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("eventTitle")}</label>
        <input
          name="title"
          required
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
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
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
        >
          <option value="">{t("selectCategory")}</option>
          {categoryKeys.map((key) => (
            <option key={key} value={key}>
              {tc(key)}
            </option>
          ))}
        </select>
      </div>

      {/* Venue - Places Autocomplete */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("where")}</label>
        <PlacesAutocomplete
          onPlaceSelect={setSelectedPlace}
          placeholder={t("searchPlace")}
          required
        />
        {/* Hidden inputs to submit place data */}
        <input type="hidden" name="venueName" value={selectedPlace?.name || ""} />
        <input type="hidden" name="placeId" value={selectedPlace?.placeId || ""} />
        <input type="hidden" name="mapsUrl" value={selectedPlace?.mapsUrl || ""} />
        {selectedPlace && (
          <p className="text-xs text-text-lighter mt-1.5">
            {selectedPlace.address}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("description")}</label>
        <textarea
          name="description"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      {/* Recurring toggle */}
      <div className="flex items-center gap-3">
        <input
          type="hidden"
          name="isRecurring"
          value={isRecurring ? "true" : "false"}
        />
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-lg border border-black/10 cursor-pointer text-sm has-checked:bg-ocean has-checked:text-white has-checked:border-ocean transition-colors"
                >
                  <input
                    type="checkbox"
                    name="recurrenceDays"
                    value={key}
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
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
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
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("endTime")}</label>
          <input
            name="endTime"
            type="time"
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
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
          placeholder={t("organizerPlaceholder")}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          {t("images", { max: MAX_IMAGES })}
        </label>

        {/* Hidden inputs for form submission */}
        {images.map((url) => (
          <input key={url} type="hidden" name="images" value={url} />
        ))}

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {images.map((url, index) => (
              <div key={url} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-cream">
                <Image
                  src={url}
                  alt={`Event image ${index + 1}`}
                  fill
                  className="object-cover"
                />
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

        {/* Upload button */}
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
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={imageUploading}
              multiple
              className="hidden"
            />
          </label>
        )}

        {imageError && (
          <p className="text-coral text-xs mt-1">{imageError}</p>
        )}
        <p className="text-xs text-text-lighter mt-1">
          {t("coverHint")}
        </p>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("contact")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              name="contactWhatsapp"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              placeholder={t("whatsappPlaceholder")}
            />
            <p className="text-xs text-text-lighter mt-1">{t("whatsappHint")}</p>
          </div>
          <input
            name="contactInstagram"
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            placeholder={t("instagramPlaceholder")}
          />
        </div>
        <input
          name="contactLink"
          type="url"
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
  );
}
