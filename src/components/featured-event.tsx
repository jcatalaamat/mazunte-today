import { type EventWithOccurrence } from "@/actions/events";
import { formatTime, getDayOfWeek } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

function getRelativeLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr + "T00:00:00");
  const diffDays = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return "This Week";
  if (diffDays <= 14) return "Next Week";
  return "Coming Soon";
}

export function FeaturedEvent({ event }: { event: EventWithOccurrence | null }) {
  if (!event) return null;

  const dayName = getDayOfWeek(event.date);
  const relativeLabel = getRelativeLabel(event.date);
  const hasImage = event.images.length > 0;

  return (
    <Link
      href={`/event/${event.slug}`}
      className="block mx-6 mb-10 rounded-2xl text-white relative overflow-hidden animate-fade-up sm:mx-10 hover:scale-[1.01] transition-transform"
    >
      {/* Background image or gradient */}
      {hasImage ? (
        <>
          <Image
            src={event.images[0]}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-night to-night-soft" />
      )}

      {/* Decorative glows */}
      <div className="absolute -top-1/2 -right-[30%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(232,114,74,0.2)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[40%] -left-[20%] w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(43,107,127,0.25)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 p-8">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sunset-light mb-3">
          ✦ {relativeLabel}
        </p>
        <h3 className="font-serif text-[1.6rem] font-normal leading-[1.2] mb-2.5">
          {event.title}
        </h3>
        <p className="text-[0.85rem] leading-relaxed opacity-75 mb-5">
          {event.description}
        </p>
        <div className="inline-flex items-center gap-1.5 bg-white/12 border border-white/20 text-white px-5 py-2.5 rounded-full text-[0.8rem] font-medium hover:bg-white/20 transition-colors">
          {dayName} {formatTime(event.startTime)} · {event.venueName} →
        </div>
      </div>
    </Link>
  );
}
