import { Header } from "@/components/header";
import { getVenuesWithEvents } from "@/actions/events";
import Link from "next/link";
import { categoryConfig, formatTime, getDayOfWeek } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Places · Mazunte Connect",
  description: "Discover venues and spaces hosting events in Mazunte",
};

export default async function PlacesPage() {
  const venues = await getVenuesWithEvents();

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl mb-3">Places</h1>
          <p className="text-text-soft mb-10">
            Venues and spaces hosting events in Mazunte
          </p>

          {venues.length === 0 ? (
            <p className="text-text-soft">No venues with upcoming events.</p>
          ) : (
            <div className="space-y-8">
              {venues.map((venue) => (
                <div
                  key={venue.placeId || venue.venueName}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="font-serif text-xl mb-1">{venue.venueName}</h2>
                      <p className="text-sm text-text-soft">
                        {venue.eventCount} upcoming event{venue.eventCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {venue.mapsUrl && (
                      <a
                        href={venue.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-black/5 text-sm font-medium hover:bg-black/10 transition-colors"
                      >
                        Directions
                      </a>
                    )}
                  </div>

                  <div className="space-y-3">
                    {venue.upcomingEvents.map((event) => {
                      const cat = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
                      return (
                        <Link
                          key={event.id}
                          href={`/event/${event.slug}`}
                          className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-black/[0.02] transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cat.bgClass}`}
                          >
                            {cat.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="text-sm text-text-soft">
                              {getDayOfWeek(event.date)} · {formatTime(event.startTime)}
                              {event.endTime && ` – ${formatTime(event.endTime)}`}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {venue.eventCount > 5 && (
                    <Link
                      href={`/places/${encodeURIComponent(venue.placeId || venue.venueName)}`}
                      className="block mt-4 text-sm text-ocean font-medium hover:underline"
                    >
                      View all {venue.eventCount} events
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
