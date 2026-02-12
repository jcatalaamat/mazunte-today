import { Header } from "@/components/header";
import { getEventBySlug } from "@/actions/events";
import { notFound } from "next/navigation";
import { categoryConfig, formatTime, getDayOfWeek } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { AddToCalendar } from "@/components/add-to-calendar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getEventBySlug(slug);
  if (!result) return { title: "Event Not Found · Mazunte Now" };

  return {
    title: `${result.event.title} · Mazunte Now`,
    description: result.event.description || `${result.event.title} in Mazunte`,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getEventBySlug(slug);

  if (!result) {
    notFound();
  }

  const { event, upcomingOccurrences } = result;
  const cat = categoryConfig[event.category] || categoryConfig.other;

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-text-soft hover:text-text mb-6 transition-colors"
          >
            ← Back to events
          </Link>

          {event.images && (event.images as string[]).length > 0 && (
            <div className="mb-6">
              {/* Main cover image */}
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden">
                <Image
                  src={(event.images as string[])[0]}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Additional images grid */}
              {(event.images as string[]).length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(event.images as string[]).slice(1).map((img, index) => (
                    <div key={img} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`${event.title} - image ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded mb-4 ${cat.bgClass}`}>
            {cat.emoji} {cat.label}
          </span>

          <h1 className="font-serif text-[clamp(1.8rem,5vw,2.8rem)] leading-tight mb-4">
            {event.title}
          </h1>

          {event.description && (
            <p className="text-text-soft text-lg leading-relaxed mb-8">
              {event.description}
            </p>
          )}

          <div className="space-y-3 mb-10">
            {event.venueName && (
              <div className="flex items-center gap-3 text-text">
                <span className="text-lg">📍</span>
                <span>{event.venueName}</span>
              </div>
            )}
            {event.organizerName && (
              <div className="flex items-center gap-3 text-text">
                <span className="text-lg">👤</span>
                <span>{event.organizerName}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-text">
              <span className="text-lg">⏰</span>
              <span>
                {formatTime(event.startTime)}
                {event.endTime && ` – ${formatTime(event.endTime)}`}
              </span>
            </div>
            {event.isRecurring && (
              <div className="flex items-center gap-3 text-text">
                <span className="text-lg">🔄</span>
                <span>Recurring event</span>
              </div>
            )}
          </div>

          {/* Maps link */}
          {event.mapsUrl && (
            <div className="mb-10">
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-text font-medium text-sm hover:bg-black/10 transition-colors"
              >
                📍 Get directions
              </a>
            </div>
          )}

          {(event.contactWhatsapp || event.contactInstagram || event.contactLink) && (
            <div className="flex flex-wrap gap-3 mb-10">
              {event.contactWhatsapp && (
                <a
                  href={`https://wa.me/${event.contactWhatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  WhatsApp
                </a>
              )}
              {event.contactInstagram && (
                <a
                  href={`https://instagram.com/${event.contactInstagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Instagram
                </a>
              )}
              {event.contactLink && (
                <a
                  href={event.contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Book / More Info
                </a>
              )}
            </div>
          )}

          {upcomingOccurrences.length > 0 && (
            <div>
              <h2 className="font-serif text-xl mb-4">Upcoming Dates</h2>
              <div className="space-y-3">
                {upcomingOccurrences.map((occ) => (
                  <div
                    key={occ.id}
                    className="px-4 py-4 bg-cream rounded-xl"
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <span className="font-medium">{getDayOfWeek(occ.date)}</span>
                        <span className="text-text-soft mx-2">·</span>
                        <span className="text-text-soft">{occ.date}</span>
                      </div>
                      <div className="text-sm text-text-soft">
                        {formatTime(occ.startTime)}
                        {occ.endTime && ` – ${formatTime(occ.endTime)}`}
                      </div>
                    </div>
                    <AddToCalendar
                      event={{
                        title: event.title,
                        description: event.description,
                        date: occ.date,
                        startTime: occ.startTime,
                        endTime: occ.endTime,
                        venueName: event.venueName,
                        slug: event.slug,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
