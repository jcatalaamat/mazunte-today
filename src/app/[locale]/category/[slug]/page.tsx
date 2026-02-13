import { Header } from "@/components/header";
import { getEventsByCategory, type EventWithOccurrence } from "@/actions/events";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { categoryConfig, isValidCategory, formatTime, formatDate } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const config = categoryConfig[slug];

  if (!config) return { title: "Not Found" };

  const tc = await getTranslations({ locale, namespace: "categories" });
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: `${config.emoji} ${tc(slug)} · Mazunte Connect`,
    description: t("categoriesDescription"),
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidCategory(slug)) {
    notFound();
  }

  const eventsData = await getEventsByCategory(slug);
  const t = await getTranslations("categoryPage");
  const tc = await getTranslations("categories");
  const tp = await getTranslations("places");
  const config = categoryConfig[slug];

  // Group events by date
  const eventsByDate = eventsData.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    },
    {} as Record<string, EventWithOccurrence[]>
  );

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/category"
            className="inline-flex items-center gap-2 text-sm text-text-soft mb-6 hover:text-text transition-colors"
          >
            {t("allCategories")}
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${config.bgClass}`}
            >
              {config.emoji}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl">{tc(slug)}</h1>
          </div>

          <p className="text-text-soft mb-10">
            {t("eventCount", { count: eventsData.length })}
          </p>

          {eventsData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-lighter">{t("noEvents")}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(eventsByDate).map(([date, events]) => (
                <div key={date}>
                  <h2 className="font-medium text-text-soft mb-4 pb-2 border-b border-black/10">
                    {formatDate(date)}
                  </h2>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/event/${event.slug}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white border border-black/5 hover:shadow-sm transition-shadow"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${config.bgClass}`}
                        >
                          {config.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-sm text-text-soft">
                            {formatTime(event.startTime)}
                            {event.endTime && ` – ${formatTime(event.endTime)}`}
                          </p>
                          {event.venueName && (
                            <p className="text-xs text-text-lighter mt-0.5">
                              📍 {event.venueName}
                            </p>
                          )}
                          {event.organizerName && (
                            <p className="text-xs text-text-lighter mt-0.5">
                              {tp("by", { name: event.organizerName })}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
