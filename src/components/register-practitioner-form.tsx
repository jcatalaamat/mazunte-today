"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitPractitioner, type SubmitPractitionerState } from "@/actions/submit-practitioner";
import { uploadImage } from "@/actions/upload";
import { PlacesAutocomplete, type PlaceResult } from "./places-autocomplete";
import { categoryConfig } from "@/lib/utils";

const allCategories = Object.keys(categoryConfig);

type ServiceEntry = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  category: string;
};

export function RegisterPractitionerForm() {
  const t = useTranslations("registerPractitioner");
  const tCat = useTranslations("categories");
  const [state, formAction, isPending] = useActionState(submitPractitioner, {
    success: false,
    message: "",
  });

  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shortBioLength, setShortBioLength] = useState(0);
  const [services, setServices] = useState<ServiceEntry[]>([]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImage(formData);
    setUploading(false);

    if ("url" in result) {
      setProfileImage(result.url);
    }
  }

  function addService() {
    setServices([
      ...services,
      {
        id: `svc-${Date.now()}`,
        name: "",
        description: "",
        duration: "",
        price: "",
        category: "other",
      },
    ]);
  }

  function removeService(id: string) {
    setServices(services.filter((s) => s.id !== id));
  }

  function updateService(id: string, field: keyof ServiceEntry, value: string) {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  // Success state
  if (state.success) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-4xl">✅</p>
        <h2 className="font-serif text-xl">{t("submitted")}</h2>
        <p className="text-sm text-text-soft">{t("submittedMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Error summary */}
      {state.message && !state.success && (
        <div className="bg-coral/10 text-coral text-sm rounded-xl px-4 py-3">
          {state.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("name")}</label>
        <input
          name="name"
          required
          placeholder={t("namePlaceholder")}
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
        />
        {state.errors?.name && (
          <p className="text-xs text-coral mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Short Bio */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("shortBio")}</label>
        <input
          name="shortBio"
          maxLength={150}
          placeholder={t("shortBioPlaceholder")}
          onChange={(e) => setShortBioLength(e.target.value.length)}
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
        />
        <p className="text-xs text-text-lighter mt-1">
          {t("shortBioCount", { count: shortBioLength })}
        </p>
      </div>

      {/* Full Bio */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("bio")}</label>
        <textarea
          name="bio"
          rows={4}
          placeholder={t("bioPlaceholder")}
          className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors resize-none"
        />
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("categories")}</label>
        <p className="text-xs text-text-lighter mb-2">{t("categoriesHint")}</p>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => {
            const config = categoryConfig[cat];
            return (
              <label key={cat} className="cursor-pointer">
                <input type="checkbox" name="categories" value={cat} className="peer sr-only" />
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-black/10 text-sm peer-checked:border-ocean peer-checked:bg-ocean/5 transition-colors">
                  {config.emoji} {tCat(cat)}
                </span>
              </label>
            );
          })}
        </div>
        {state.errors?.categories && (
          <p className="text-xs text-coral mt-1">{state.errors.categories[0]}</p>
        )}
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("profilePhoto")}</label>
        {profileImage ? (
          <div className="flex items-center gap-4">
            <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            <button
              type="button"
              onClick={() => setProfileImage(null)}
              className="text-xs text-coral hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-ocean/50 transition-colors bg-cream/50">
            <p className="text-sm text-text-lighter">
              {uploading ? t("submitting") : "Click to upload"}
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
        <input type="hidden" name="profileImage" value={profileImage || ""} />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("location")}</label>
        <p className="text-xs text-text-lighter mb-2">{t("locationHint")}</p>
        <PlacesAutocomplete
          onPlaceSelect={setSelectedPlace}
          placeholder={t("locationHint")}
        />
        <input type="hidden" name="venueName" value={selectedPlace?.name || ""} />
        <input type="hidden" name="placeId" value={selectedPlace?.placeId || ""} />
        <input type="hidden" name="mapsUrl" value={selectedPlace?.mapsUrl || ""} />
        {selectedPlace && (
          <p className="text-xs text-text-lighter mt-1.5">{selectedPlace.address}</p>
        )}
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("services")}</label>
        <p className="text-xs text-text-lighter mb-3">{t("servicesHint")}</p>

        {services.length > 0 && (
          <div className="space-y-4 mb-4">
            {services.map((svc) => (
              <div key={svc.id} className="bg-cream rounded-xl p-4 border border-black/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-lighter">Service</span>
                  <button
                    type="button"
                    onClick={() => removeService(svc.id)}
                    className="text-xs text-coral hover:underline cursor-pointer"
                  >
                    {t("removeService")}
                  </button>
                </div>
                <input
                  value={svc.name}
                  onChange={(e) => updateService(svc.id, "name", e.target.value)}
                  placeholder={t("serviceNamePlaceholder")}
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                />
                <input
                  value={svc.description}
                  onChange={(e) => updateService(svc.id, "description", e.target.value)}
                  placeholder={t("serviceDescriptionPlaceholder")}
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={svc.duration}
                    onChange={(e) => updateService(svc.id, "duration", e.target.value)}
                    placeholder={t("serviceDurationPlaceholder")}
                    className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                  />
                  <input
                    value={svc.price}
                    onChange={(e) => updateService(svc.id, "price", e.target.value)}
                    placeholder={t("servicePricePlaceholder")}
                    className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                  />
                </div>
                <select
                  value={svc.category}
                  onChange={(e) => updateService(svc.id, "category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-white text-[0.85rem] outline-none focus:border-ocean transition-colors"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].emoji} {tCat(cat)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addService}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-black/15 text-sm text-text-soft hover:border-ocean/30 transition-colors cursor-pointer"
        >
          {t("addService")}
        </button>

        {/* Serialize services as JSON */}
        <input
          type="hidden"
          name="servicesJson"
          value={JSON.stringify(
            services.filter((s) => s.name.trim()).map((s) => ({
              name: s.name,
              description: s.description || undefined,
              duration: s.duration || undefined,
              price: s.price || undefined,
              category: s.category,
            }))
          )}
        />
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{t("contact")}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-lighter mb-1">WhatsApp</label>
            <input
              name="contactWhatsapp"
              type="tel"
              placeholder="+52 123 456 7890"
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.82rem] outline-none focus:border-ocean transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-lighter mb-1">Instagram</label>
            <input
              name="contactInstagram"
              placeholder="@instagram"
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.82rem] outline-none focus:border-ocean transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-lighter mb-1">Link</label>
            <input
              name="contactLink"
              type="url"
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.82rem] outline-none focus:border-ocean transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Review notice */}
      <p className="text-xs text-text-lighter text-center">
        {t("reviewNotice")}
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-light transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? t("submitting") : t("submitButton")}
      </button>
    </form>
  );
}
