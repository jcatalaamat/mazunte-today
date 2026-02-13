"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl mb-2">Something went wrong</h2>
        <p className="text-text-soft text-sm mb-6">
          An error occurred in the admin panel. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-light transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
