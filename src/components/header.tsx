"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Mexico_City",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-sand/85 backdrop-blur-xl border-b border-black/6 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-baseline gap-1.5">
        <span className="font-serif text-[1.6rem] text-text tracking-tight">
          Mazunte
        </span>
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ocean bg-ocean-pale px-2 py-0.5 rounded">
          Now
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/search"
          className="text-xs font-medium text-text-lighter hover:text-text-soft transition-colors"
        >
          Search
        </Link>
        <Link
          href="/submit"
          className="text-xs font-semibold uppercase tracking-wide text-ocean hover:text-ocean/80 transition-colors"
        >
          + Add Event
        </Link>
        <Link
          href="/admin"
          className="text-xs font-medium text-text-lighter hover:text-text-soft transition-colors"
        >
          Admin
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-medium text-text-soft">
          <div className="w-2 h-2 bg-jungle-light rounded-full animate-pulse-dot" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
}
