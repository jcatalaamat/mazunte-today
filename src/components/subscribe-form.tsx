"use client";

import { useState } from "react";
import { subscribe } from "@/actions/subscribe";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    const result = await subscribe(email);

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong");
    }
  }

  return (
    <section className="py-10 px-6 text-center border-t border-black/6 sm:py-12 sm:px-10">
      <h3 className="font-serif text-[1.4rem] mb-1.5">Never miss a moment</h3>
      <p className="text-[0.82rem] text-text-soft mb-5">
        Get the weekly Mazunte Today digest every Monday morning.
      </p>
      {submitted ? (
        <p className="text-ocean font-medium">You&apos;re in! See you Monday.</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2.5 max-w-[320px] mx-auto mb-5"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="px-4 py-3.5 rounded-xl border-[1.5px] border-black/10 bg-cream font-sans text-[0.88rem] outline-none focus:border-ocean transition-colors"
          />
          {error && (
            <p className="text-sunset text-[0.82rem]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3.5 rounded-xl border-none bg-ocean text-white font-sans text-[0.88rem] font-semibold cursor-pointer hover:bg-ocean-light transition-colors disabled:opacity-50"
          >
            {loading ? "Subscribing..." : "Subscribe — it's free"}
          </button>
        </form>
      )}
    </section>
  );
}
