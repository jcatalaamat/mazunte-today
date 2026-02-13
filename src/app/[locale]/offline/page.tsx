"use client";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">🌊</p>
        <h1 className="font-serif text-2xl mb-3">You&apos;re offline</h1>
        <p className="text-text-soft mb-6">
          It looks like you&apos;re not connected to the internet. Check your
          connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
