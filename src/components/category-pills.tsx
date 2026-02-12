"use client";

import { useState } from "react";
import { categoryConfig } from "@/lib/utils";
import { type EventWithOccurrence } from "@/actions/events";
import { Timeline } from "./timeline";

const categories = ["all", "yoga", "music", "ceremony", "food", "wellness", "community", "market"];

export function CategoryFilter({ events }: { events: EventWithOccurrence[] }) {
  const [active, setActive] = useState("all");

  const filtered = active === "all"
    ? events
    : events.filter((e) => e.category === active);

  return (
    <>
      <div className="flex gap-2 px-6 pb-7 overflow-x-auto hide-scrollbar sm:px-10">
        {categories.map((cat) => {
          const isActive = active === cat;
          const config = categoryConfig[cat];
          const label = cat === "all" ? "All" : `${config?.emoji} ${config?.label}`;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[0.78rem] font-medium cursor-pointer transition-all border-[1.5px] whitespace-nowrap ${
                isActive
                  ? "bg-ocean text-white border-ocean"
                  : "bg-cream text-text-soft border-black/10 hover:border-ocean hover:text-ocean"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <Timeline events={filtered} />
    </>
  );
}
