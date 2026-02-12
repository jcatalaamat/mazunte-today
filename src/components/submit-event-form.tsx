"use client";

import { useActionState, useState, useRef } from "react";
import { submitEvent, type SubmitEventState } from "@/actions/submit";
import { uploadImage } from "@/actions/upload";
import Image from "next/image";
import { PlacesAutocomplete, type PlaceResult } from "./places-autocomplete";

const categories = [
  { value: "yoga", label: "Yoga" },
  { value: "music", label: "Music" },
  { value: "ceremony", label: "Ceremony" },
  { value: "food", label: "Food" },
  { value: "wellness", label: "Wellness" },
  { value: "community", label: "Community" },
  { value: "market", label: "Market" },
  { value: "other", label: "Other" },
];

const days = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed`);
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

  if (state.success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-serif text-2xl mb-2">Submitted!</h2>
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
        <label className="block text-sm font-medium mb-1.5">Event Title *</label>
        <input
          name="title"
          required
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
          placeholder="e.g. Morning Vinyasa Flow"
        />
        {state.errors?.title && (
          <p className="text-coral text-xs mt-1">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Category *</label>
        <select
          name="category"
          required
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Venue - Places Autocomplete */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Where? *</label>
        <PlacesAutocomplete
          onPlaceSelect={setSelectedPlace}
          placeholder="Search for a place in Mazunte..."
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
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          name="description"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none"
          placeholder="What's this event about?"
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
        <span className="text-sm">This is a recurring event</span>
      </div>

      {/* Date or Recurrence */}
      {isRecurring ? (
        <div className="space-y-4 p-4 bg-ocean-pale/30 rounded-xl">
          <div>
            <label className="block text-sm font-medium mb-2">Days of the week *</label>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-lg border border-black/10 cursor-pointer text-sm has-checked:bg-ocean has-checked:text-white has-checked:border-ocean transition-colors"
                >
                  <input
                    type="checkbox"
                    name="recurrenceDays"
                    value={d.value}
                    className="sr-only"
                  />
                  {d.label}
                </label>
              ))}
            </div>
            {state.errors?.recurrenceDays && (
              <p className="text-coral text-xs mt-1">{state.errors.recurrenceDays[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Until</label>
            <input
              name="recurrenceUntil"
              type="date"
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-1.5">Date *</label>
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
          <label className="block text-sm font-medium mb-1.5">Start Time *</label>
          <input
            name="startTime"
            type="time"
            required
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">End Time</label>
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
        <label className="block text-sm font-medium mb-1.5">Your Name / Studio *</label>
        <input
          name="organizerName"
          required
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
          placeholder="e.g. Sofia, Hridaya Yoga"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Event Images (optional, up to {MAX_IMAGES})
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
                    Cover
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
                <p className="text-sm text-text-soft">Uploading...</p>
              ) : (
                <>
                  <p className="mb-1 text-sm text-text-soft">
                    <span className="font-medium text-ocean">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-text-lighter">
                    PNG, JPG, WebP or GIF (max 4MB each) · {images.length}/{MAX_IMAGES} uploaded
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
          First image will be used as the cover photo
        </p>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <p className="text-sm font-medium">Contact (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              name="contactWhatsapp"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
              placeholder="+52 123 456 7890"
            />
            <p className="text-xs text-text-lighter mt-1">Include country code (e.g. +52 for Mexico)</p>
          </div>
          <input
            name="contactInstagram"
            className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
            placeholder="@instagram"
          />
        </div>
        <input
          name="contactLink"
          type="url"
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
          placeholder="https://website.com or booking link"
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
        {pending ? "Submitting..." : "Submit Event"}
      </button>

      <p className="text-xs text-text-lighter text-center">
        Events are reviewed before appearing on Mazunte Today.
      </p>
    </form>
  );
}
