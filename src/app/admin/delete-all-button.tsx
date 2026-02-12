"use client";

import { useState, useTransition } from "react";

export function DeleteAllButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
      >
        Delete All Events
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-red-600 font-medium">Are you sure?</span>
      <button
        onClick={() => startTransition(() => onDelete())}
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Yes, delete everything"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-4 py-2 rounded-lg bg-black/5 text-sm font-medium hover:bg-black/10 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
