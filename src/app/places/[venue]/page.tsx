import { Header } from "@/components/header";
import { getEventsByVenue } from "@/actions/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categoryConfig, formatTime, getDayOfWeek, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ venue: string }> }) {
  const { venue } = await params;
  const decodedVenue = decodeURIComponent(venue);
  const result = await getEventsByVenue(decodedVenue);

  if (!result) return { title: "Venue Not Found · Mazunte Today" };

  return {
    title: `${result.venueName} · Mazunte Today`,
    description: `Events at ${result.venueName} in Mazunte`,
  };
}

export default async function VenuePage({ params }: { params: Promise<{ venue: string }> }) {
  const { venue } = await params;
  const decodedVenue = decodeURIComponent(venue);
  const result = await getEventsByVenue(decodedVenue);

  if (!result) {
    notFound();
  }

  // Group events by date
  const eventsByDate = result.events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, typeof result.events>);

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/places"
            className="inline-flex items-center gap-2 text-sm text-text-soft mb-6 hover:text-text transition-colors"
          >
            ← All places
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl mb-3">{result.venueName}</h1>

          {result.mapsUrl && (
            <a
              href={result.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-text font-medium text-sm hover:bg-black/10 transition-colors mb-8"
            >
              Get directions
            </a>
          )}

          <p className="text-text-soft mb-10">
            {result.events.length} upcoming event{result.events.length !== 1 ? "s" : ""}
          </p>

          <div className="space-y-8">
            {Object.entries(eventsByDate).map(([date, events]) => (
              <div key={date}>
                <h2 className="font-medium text-text-soft mb-4 pb-2 border-b border-black/10">
                  {formatDate(date)}
                </h2>
                <div className="space-y-3">
                  {events.map((event) => {
                    const cat = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
                    return (
                      <Link
                        key={event.id}
                        href={`/event/${event.slug}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white border border-black/5 hover:shadow-sm transition-shadow"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: cat.bg }}
                        >
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-sm text-text-soft">
                            {formatTime(event.startTime)}
                            {event.endTime && ` – ${formatTime(event.endTime)}`}
                          </p>
                          {event.organizerName && (
                            <p className="text-xs text-text-lighter mt-0.5">
                              by {event.organizerName}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
