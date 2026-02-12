"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Header() {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-sand/85 backdrop-blur-xl border-b border-black/6">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-serif text-[1.4rem] sm:text-[1.6rem] text-text tracking-tight">
            Mazunte
          </span>
          <span className="font-sans text-[0.6rem] sm:text-xs font-semibold uppercase tracking-[0.15em] text-ocean bg-ocean-pale px-1.5 sm:px-2 py-0.5 rounded">
            Connect
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/places"
            className="text-xs font-medium text-text-lighter hover:text-text-soft transition-colors"
          >
            Places
          </Link>
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
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-soft">
            <div className="w-2 h-2 bg-jungle-light rounded-full animate-pulse-dot" />
            <span>{time}</span>
          </div>
        </div>

        {/* Mobile: time + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-soft">
            <div className="w-2 h-2 bg-jungle-light rounded-full animate-pulse-dot" />
            <span>{time}</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
            aria-label="Menu"
          >
            <span className={`block w-5 h-[1.5px] bg-text transition-all ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-text transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-text transition-all ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-black/6 bg-sand/95 backdrop-blur-xl">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/places"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-text-soft hover:text-text transition-colors"
            >
              Places
            </Link>
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-text-soft hover:text-text transition-colors"
            >
              Search
            </Link>
            <Link
              href="/submit"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-semibold text-ocean hover:text-ocean/80 transition-colors"
            >
              + Add Event
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
