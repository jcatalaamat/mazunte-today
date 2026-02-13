import { Header } from "@/components/header";
import { getVenuesWithEvents } from "@/actions/events";
import { Link } from "@/i18n/navigation";
import { categoryConfig, formatTime, getDayOfWeek } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("placesTitle"),
    description: t("placesDescription"),
  };
}

export default async function PlacesPage() {
  const venues = await getVenuesWithEvents();
  const t = await getTranslations("places");
  const tc = await getTranslations("categories");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl mb-3">{t("title")}</h1>
          <p className="text-text-soft mb-6">
            {t("description")}
          </p>

          {/* Area map */}
          <div className="mb-10 rounded-2xl overflow-hidden border border-black/10">
            <iframe
              width="100%"
              height="280"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=venues+in+Mazunte+Oaxaca&center=15.665,-96.55&zoom=14`}
              className="w-full"
              title="Mazunte area map"
            />
          </div>

          {venues.length === 0 ? (
            <p className="text-text-soft">{t("noVenues")}</p>
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
                        {t("upcomingEvents", { count: venue.eventCount })}
                      </p>
                    </div>
                    {venue.mapsUrl && (
                      <a
                        href={venue.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-black/5 text-sm font-medium hover:bg-black/10 transition-colors"
                      >
                        {t("directions")}
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
                      {t("viewAll", { count: venue.eventCount })}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-16 bg-ocean/5 rounded-2xl p-8 text-center">
            <h2 className="font-serif text-xl mb-2">{t("venueCta")}</h2>
            <p className="text-text-soft text-sm mb-5">{t("venueCtaDescription")}</p>
            <a
              href="https://wa.me/529581169947?text=Hola!%20Tengo%20un%20lugar%20en%20Mazunte%20y%20quiero%20compartir%20mi%20calendario%20de%20eventos%20en%20Mazunte%20Today."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t("venueCtaButton")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
