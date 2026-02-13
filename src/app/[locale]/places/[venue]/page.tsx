import { Header } from "@/components/header";
import { getEventsByVenue } from "@/actions/events";
import { getPractitionersByVenue } from "@/actions/practitioners";
import { PractitionerCard } from "@/components/practitioner-card";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { categoryConfig, formatTime, getDayOfWeek, formatDate } from "@/lib/utils";
import { ShareEvent } from "@/components/share-event";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string; locale: string }>;
}) {
  const { venue, locale } = await params;
  const decodedVenue = decodeURIComponent(venue);
  const result = await getEventsByVenue(decodedVenue);
  const t = await getTranslations({ locale, namespace: "metadata" });

  if (!result) return { title: t("eventNotFound") };

  return {
    title: `${result.venueName} · Mazunte Today`,
    description: `${t("venueDescription", { venue: result.venueName })}`,
    openGraph: {
      title: result.venueName,
      description: `${t("venueDescription", { venue: result.venueName })}`,
      type: "place",
    },
  };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ venue: string; locale: string }>;
}) {
  const { venue, locale } = await params;
  const decodedVenue = decodeURIComponent(venue);
  const result = await getEventsByVenue(decodedVenue);

  if (!result) {
    notFound();
  }

  const venuePractitioners = await getPractitionersByVenue(result.venueName);
  const t = await getTranslations("places");
  const tc = await getTranslations("categories");

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
            {t("allPlaces")}
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl mb-3">{result.venueName}</h1>

          {result.placeId && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-black/10">
              <iframe
                width="100%"
                height="250"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${result.placeId}&zoom=16`}
                className="w-full"
                title={result.venueName}
              />
            </div>
          )}

          {result.mapsUrl && (
            <a
              href={result.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-text font-medium text-sm hover:bg-black/10 transition-colors mb-8"
            >
              {t("directions")}
            </a>
          )}

          <p className="text-text-soft mb-6">
            {t("upcomingEvents", { count: result.events.length })}
          </p>

          <div className="mb-10">
            <ShareEvent
              title={`${result.venueName} — Mazunte Today`}
              url={`https://mazunte.today/${locale}/places/${encodeURIComponent(result.venueName)}`}
            />
          </div>

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
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${cat.bgClass}`}
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
                              {t("by", { name: event.organizerName })}
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

          {venuePractitioners.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-xl mb-4">{t("practitioners")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {venuePractitioners.map((p) => (
                  <PractitionerCard key={p.id} practitioner={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
