"use server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image." };
  }

  // Validate file size (max 4MB)
  const maxSize = 4 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "Image too large. Maximum size is 4MB." };
  }

  try {
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `events/${nanoid()}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return { url: blob.url };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload image. Please try again." };
  }
}
