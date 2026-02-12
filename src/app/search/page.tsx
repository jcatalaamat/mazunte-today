import { Header } from "@/components/header";
import { searchEvents } from "@/actions/events";
import { categoryConfig, formatTime, getDayOfWeek } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Search · Mazunte Today",
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;
  const results = query ? await searchEvents(query) : [];

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl mb-6">Search Events</h1>

          <form action="/search" method="GET" className="mb-8">
            <input
              type="text"
              name="q"
              defaultValue={query || ""}
              placeholder="Search by name, venue, or organizer..."
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
            />
          </form>

          {query && (
            <p className="text-text-soft text-sm mb-6">
              {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>
          )}

          {results.length === 0 && query && (
            <div className="text-center py-12 text-text-lighter">
              <p className="text-lg mb-1">No events found</p>
              <p className="text-sm">Try a different search term or browse the homepage.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((event) => {
                const cat = categoryConfig[event.category] || categoryConfig.other;
                const dayName = getDayOfWeek(event.date);

                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.slug}`}
                    className="block bg-cream rounded-xl p-5 border border-black/5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${cat.bgClass}`}>
                          {cat.label}
                        </span>
                        <h3 className="font-serif text-lg leading-tight mb-1">{event.title}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-text-lighter">
                          <span>📅 {dayName}, {event.date}</span>
                          <span>⏰ {formatTime(event.startTime)}</span>
                          {event.venueName && <span>📍 {event.venueName}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
