"use server";

import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { nanoid } from "nanoid";

export async function subscribe(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" };
  }

  try {
    await db.insert(subscribers).values({
      id: nanoid(),
      email: email.toLowerCase().trim(),
    });
    return { success: true };
  } catch (error: unknown) {
    // Handle unique constraint violation (email already exists)
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: true }; // Silently succeed if already subscribed
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
