"use client";

import { useEffect, useState } from "react";

export function Hero() {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        timeZone: "America/Mexico_City",
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <section className="relative pt-12 pb-8 px-6 text-center sm:pt-16 sm:pb-10 sm:px-10">
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-ocean/6 to-transparent pointer-events-none" />
      <p className="text-[0.8rem] font-medium uppercase tracking-[0.12em] text-text-lighter mb-3">
        {dateStr}
      </p>
      <h1 className="font-serif text-[clamp(2.2rem,6vw,3.5rem)] font-normal leading-[1.1] text-text mb-2">
        What&apos;s happening
        <br />
        <em className="italic text-ocean">right now</em>
      </h1>
      <p className="text-base text-text-soft max-w-[340px] mx-auto leading-relaxed">
        The living pulse of Mazunte. Events, ceremonies, classes, food &
        community — all in one place.
      </p>
    </section>
  );
}
