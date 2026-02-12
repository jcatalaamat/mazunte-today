"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/actions/upload";
import Image from "next/image";

export function AdminImageUpload({ initialUrl }: { initialUrl: string | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);

    setImageUploading(false);

    if ("error" in result) {
      setImageError(result.error);
    } else {
      setImageUrl(result.url);
    }
  }

  function handleRemoveImage() {
    setImageUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">Event Image</label>
      <input type="hidden" name="imageUrl" value={imageUrl || ""} />

      {imageUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-cream">
            <Image
              src={imageUrl}
              alt="Event preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-ocean/50 transition-colors bg-cream/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {imageUploading ? (
              <p className="text-sm text-text-soft">Uploading...</p>
            ) : (
              <>
                <p className="mb-1 text-sm text-text-soft">
                  <span className="font-medium text-ocean">Click to upload</span>
                </p>
                <p className="text-xs text-text-lighter">PNG, JPG, WebP or GIF (max 4MB)</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            disabled={imageUploading}
            className="hidden"
          />
        </label>
      )}
      {imageError && (
        <p className="text-coral text-xs mt-1">{imageError}</p>
      )}
    </div>
  );
}
