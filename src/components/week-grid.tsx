import { type EventWithOccurrence } from "@/actions/events";
import { categoryConfig, formatTime, getDayOfWeek } from "@/lib/utils";
import { SectionLabel } from "./section-label";
import Link from "next/link";
import Image from "next/image";

export function WeekGrid({ events }: { events: EventWithOccurrence[] }) {
  if (events.length === 0) return null;

  return (
    <>
      <SectionLabel title="Coming This Week" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-6 pb-10 sm:px-10">
        {events.map((event, i) => {
          const cat = categoryConfig[event.category] || categoryConfig.other;
          const dayName = getDayOfWeek(event.date);
          const hasImage = event.images.length > 0;

          return (
            <Link
              key={event.id}
              href={`/event/${event.slug}`}
              className="bg-cream rounded-[14px] overflow-hidden border border-black/5 hover:-translate-y-0.5 hover:shadow-lg transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {hasImage ? (
                <div className="relative h-24 sm:h-28">
                  <Image
                    src={event.images[0]}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className={`h-24 sm:h-28 ${cat.gradClass} flex items-center justify-center`}>
                  <span className="text-3xl opacity-30">{cat.emoji}</span>
                </div>
              )}
              <div className="p-[14px]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-text-lighter mb-1.5">
                  {dayName}
                </p>
                <h4 className="font-serif text-base leading-tight mb-1.5 line-clamp-2">
                  {event.title}
                </h4>
                <p className="text-[0.72rem] text-text-soft">
                  {formatTime(event.startTime)}
                  {event.venueName && ` · ${event.venueName}`}
                </p>
                <span className={`inline-block mt-2 text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cat.bgClass}`}>
                  {cat.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
