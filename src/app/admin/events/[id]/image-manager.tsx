"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/actions/upload";
import Image from "next/image";

const MAX_IMAGES = 5;

export function ImageManager({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      if ("error" in result) {
        setError(result.error);
        break;
      } else {
        uploadedUrls.push(result.url);
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        Images ({images.length}/{MAX_IMAGES})
      </label>

      {/* Hidden inputs to submit image URLs with the form */}
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-cream">
              <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-sm cursor-pointer"
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

      {images.length < MAX_IMAGES && (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-ocean/50 transition-colors bg-cream/50">
          <div className="flex flex-col items-center justify-center py-3">
            {uploading ? (
              <p className="text-sm text-text-soft">Uploading...</p>
            ) : (
              <>
                <p className="text-sm text-text-soft">
                  <span className="font-medium text-ocean">Click to upload</span>
                </p>
                <p className="text-xs text-text-lighter">
                  JPEG, PNG, WebP, GIF (max 4MB)
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
            multiple
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-coral text-xs mt-1">{error}</p>}
    </div>
  );
}
