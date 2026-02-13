"use client";

import { type EventWithOccurrence } from "@/actions/events";
import { categoryConfig, formatTimeparts } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";

const categoryColors: Record<string, { dot: string; line: string; bg: string }> = {
  yoga: { dot: "border-ocean", line: "bg-ocean", bg: "bg-ocean-pale" },
  music: { dot: "border-sunset", line: "bg-sunset", bg: "bg-[#FDE8DB]" },
  ceremony: { dot: "border-plum", line: "bg-plum", bg: "bg-[#F0E0ED]" },
  food: { dot: "border-coral", line: "bg-coral", bg: "bg-[#FDE8E0]" },
  wellness: { dot: "border-jungle", line: "bg-jungle", bg: "bg-[#E0F0E4]" },
  community: { dot: "border-ocean-light", line: "bg-ocean-light", bg: "bg-ocean-pale" },
  market: { dot: "border-sunset-light", line: "bg-sunset-light", bg: "bg-[#FDF0DB]" },
  other: { dot: "border-text-lighter", line: "bg-text-lighter", bg: "bg-sand-dark" },
};

export function Timeline({ events }: { events: EventWithOccurrence[] }) {
  const t = useTranslations("timeline");
  const tc = useTranslations("categories");

  if (events.length === 0) {
    return (
      <div className="px-6 pb-10 sm:px-10">
        <p className="text-center text-text-lighter py-8">
          {t("noEvents")}
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-10 sm:px-10">
      {events.map((event, i) => {
        const cat = categoryConfig[event.category] || categoryConfig.other;
        const colors = categoryColors[event.category] || categoryColors.other;
        const time = formatTimeparts(event.startTime);
        const isLast = i === events.length - 1;
        const hasImage = event.images.length > 0;

        return (
          <Link
            key={event.id}
            href={`/event/${event.slug}`}
            className="flex gap-4 py-5 border-b border-black/6 last:border-0 hover:opacity-80 transition-opacity animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Time */}
            <div className="flex-none w-14 text-right pt-0.5">
              <div className="text-[0.95rem] font-semibold text-text leading-tight">
                {time.hour}
              </div>
              <div className="text-[0.65rem] font-medium text-text-lighter uppercase tracking-wider">
                {time.period}
              </div>
            </div>
            {/* Dot + Line */}
            <div className="flex flex-col items-center pt-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${colors.dot} ${colors.bg}`}
              />
              {!isLast && (
                <div className={`w-[1.5px] flex-1 mt-1 opacity-20 ${colors.line}`} />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 flex gap-4">
              <div className="flex-1 min-w-0">
                <p className={`text-[0.62rem] font-semibold uppercase tracking-wider mb-0.5 ${cat.colorClass}`}>
                  {tc(event.category)}
                </p>
                <h4 className="font-serif text-[1.08rem] leading-tight mb-1">
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-[0.78rem] text-text-soft leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.venueName && (
                  <span className="inline-flex items-center gap-1 text-[0.72rem] text-text-lighter mt-1.5">
                    📍 {event.venueName}
                  </span>
                )}
              </div>
              {/* Thumbnail */}
              {hasImage && (
                <div className="flex-none w-16 h-16 sm:w-20 sm:h-20 relative rounded-lg overflow-hidden">
                  <Image
                    src={event.images[0]}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
