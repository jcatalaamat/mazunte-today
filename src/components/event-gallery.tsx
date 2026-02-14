"use client";

import { useState } from "react";
import Image from "next/image";

export function EventGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const single = images.length === 1;

  return (
    <>
      <div className="mb-6">
        {/* Cover image — adapts to aspect ratio */}
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative w-full rounded-2xl overflow-hidden bg-black/5 cursor-pointer group"
        >
          <Image
            src={images[0]}
            alt={title}
            width={800}
            height={500}
            className="w-full h-auto max-h-[28rem] object-contain mx-auto"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </button>

        {/* Thumbnail strip — horizontal scroll */}
        {!single && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 hide-scrollbar">
            {images.map((img, index) => (
              <button
                key={img}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className={`relative flex-none w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden cursor-pointer ring-2 transition-all ${
                  index === 0 ? "ring-ocean" : "ring-transparent hover:ring-ocean/50"
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors text-lg cursor-pointer z-10"
          >
            ✕
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors text-lg cursor-pointer z-10"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % images.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors text-lg cursor-pointer z-10"
              >
                ›
              </button>
            </>
          )}

          {/* Full image */}
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} - ${lightboxIndex + 1}`}
              width={1200}
              height={900}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
            />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
