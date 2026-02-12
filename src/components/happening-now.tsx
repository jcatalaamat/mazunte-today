import { type EventWithOccurrence } from "@/actions/events";
import { categoryConfig, formatTime } from "@/lib/utils";
import { SectionLabel } from "./section-label";
import Link from "next/link";
import Image from "next/image";

export function HappeningNow({ events }: { events: EventWithOccurrence[] }) {
  if (events.length === 0) return null;

  return (
    <>
      <SectionLabel title="Happening Now" />
      <div className="flex gap-3.5 px-6 pb-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar sm:px-10">
        {events.map((event, i) => {
          const cat = categoryConfig[event.category] || categoryConfig.other;
          return (
            <Link
              key={event.id}
              href={`/event/${event.slug}`}
              className="flex-none w-[280px] sm:w-[300px] snap-start bg-cream rounded-2xl overflow-hidden border border-black/5 hover:-translate-y-0.5 transition-transform animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-[140px] relative overflow-hidden">
                {event.images.length > 0 ? (
                  <Image
                    src={event.images[0]}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <div className={`w-full h-full ${cat.gradClass}`} />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                      {cat.emoji}
                    </div>
                  </>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-[0.68rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-dot" />
                  Live
                </div>
              </div>
              <div className="p-4">
                <p className={`text-[0.65rem] font-semibold uppercase tracking-wider mb-1.5 ${cat.colorClass}`}>
                  {cat.label}
                </p>
                <h3 className="font-serif text-lg leading-tight mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-3 text-[0.78rem] text-text-soft">
                  <span className="flex items-center gap-1">
                    ☀️ {formatTime(event.startTime)}
                    {event.endTime && ` – ${formatTime(event.endTime)}`}
                  </span>
                  {event.venueName && (
                    <span className="flex items-center gap-1">
                      📍 {event.venueName}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
