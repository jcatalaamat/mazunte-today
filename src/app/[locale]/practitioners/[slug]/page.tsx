import { Header } from "@/components/header";
import { getPractitionerBySlug } from "@/actions/practitioners";
import { notFound } from "next/navigation";
import { categoryConfig, formatTime, getDayOfWeek } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { ShareEvent } from "@/components/share-event";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const result = await getPractitionerBySlug(slug);
  const t = await getTranslations({ locale, namespace: "metadata" });
  if (!result) return { title: t("practitionersTitle") };

  return {
    title: `${result.practitioner.name} · Mazunte Today`,
    description: result.practitioner.shortBio || `${result.practitioner.name} in Mazunte`,
    openGraph: {
      title: result.practitioner.name,
      description: result.practitioner.shortBio || `${result.practitioner.name} in Mazunte`,
      images: result.practitioner.profileImage ? [result.practitioner.profileImage] : [],
      type: "profile",
    },
  };
}

export default async function PractitionerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPractitionerBySlug(slug);
  const t = await getTranslations("practitioners");
  const tEvent = await getTranslations("event");

  if (!result) notFound();

  const { practitioner, services, upcomingEvents } = result;
  const categories = (practitioner.categories as string[]) || [];
  const images = (practitioner.images as string[]) || [];

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/practitioners"
            className="inline-flex items-center gap-1 text-sm text-text-soft hover:text-text mb-8 transition-colors"
          >
            {t("backToPractitioners")}
          </Link>

          {/* Profile header */}
          <div className="flex items-start gap-5 mb-8">
            {practitioner.profileImage ? (
              <img
                src={practitioner.profileImage}
                alt={practitioner.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sand-dark flex items-center justify-center text-2xl font-serif text-text-soft flex-shrink-0">
                {practitioner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl mb-2">{practitioner.name}</h1>
              {practitioner.shortBio && (
                <p className="text-text-soft text-sm sm:text-base mb-3">{practitioner.shortBio}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const config = categoryConfig[cat] || categoryConfig.other;
                  return (
                    <span
                      key={cat}
                      className={`inline-block text-[0.65rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.bgClass}`}
                    >
                      {config.emoji} {config.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bio */}
          {practitioner.bio && (
            <div className="mb-10">
              <p className="text-[0.92rem] leading-relaxed text-text whitespace-pre-wrap">
                {practitioner.bio}
              </p>
            </div>
          )}

          {/* Contact buttons */}
          {(practitioner.contactWhatsapp || practitioner.contactInstagram || practitioner.contactLink) && (
            <div className="flex flex-wrap gap-3 mb-10">
              {practitioner.contactWhatsapp && (
                <a
                  href={`https://wa.me/${practitioner.contactWhatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  {tEvent("whatsapp")}
                </a>
              )}
              {practitioner.contactInstagram && (
                <a
                  href={`https://instagram.com/${practitioner.contactInstagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  {tEvent("instagram")}
                </a>
              )}
              {practitioner.contactLink && (
                <a
                  href={practitioner.contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean text-white font-medium text-sm hover:opacity-90 transition-colors"
                >
                  {tEvent("bookMoreInfo")}
                </a>
              )}
            </div>
          )}

          {/* Location + Map */}
          {practitioner.venueName && (
            <div className="mb-10">
              <div className="flex items-center gap-3 text-text mb-3">
                <span className="text-lg">📍</span>
                <span className="font-medium">{practitioner.venueName}</span>
              </div>
              {practitioner.placeId && (
                <div className="rounded-2xl overflow-hidden border border-black/10 mb-3">
                  <iframe
                    width="100%"
                    height="200"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${practitioner.placeId}&zoom=16`}
                    className="w-full"
                    title={practitioner.venueName}
                  />
                </div>
              )}
              {practitioner.mapsUrl && (
                <a
                  href={practitioner.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ocean hover:text-ocean-light transition-colors"
                >
                  {tEvent("getDirections")} →
                </a>
              )}
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-xl mb-4">{t("services")}</h2>
              <div className="space-y-3">
                {services.map((service) => {
                  const config = categoryConfig[service.category || "other"] || categoryConfig.other;
                  return (
                    <div key={service.id} className="bg-cream rounded-xl p-4 border border-black/5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{config.emoji}</span>
                            <h3 className="font-medium text-[0.92rem]">{service.name}</h3>
                          </div>
                          {service.description && (
                            <p className="text-sm text-text-soft">{service.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {service.price && (
                            <span className="text-sm font-medium text-ocean">{service.price}</span>
                          )}
                          {service.duration && (
                            <span className="text-xs text-text-lighter">{service.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-xl mb-4">{t("upcomingEvents")}</h2>
              <div className="space-y-2">
                {upcomingEvents.map((event) => {
                  const config = categoryConfig[event.category] || categoryConfig.other;
                  return (
                    <Link
                      key={event.id}
                      href={`/event/${event.slug}`}
                      className="flex items-center gap-3 bg-cream rounded-xl p-4 border border-black/5 hover:border-ocean/20 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-sand-dark flex items-center justify-center text-base flex-shrink-0">
                        {config.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-text-lighter">
                          {getDayOfWeek(event.date)}, {event.date} · {formatTime(event.startTime)}
                          {event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
                          {event.venueName ? ` · ${event.venueName}` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: practitioner.name,
                description: practitioner.shortBio || practitioner.bio || undefined,
                image: practitioner.profileImage || undefined,
                url: `https://mazunte.today/en/practitioners/${practitioner.slug}`,
                address: practitioner.venueName
                  ? {
                      "@type": "PostalAddress",
                      addressLocality: "Mazunte",
                      addressRegion: "Oaxaca",
                      addressCountry: "MX",
                    }
                  : undefined,
              }),
            }}
          />

          {/* Gallery */}
          {images.length > 0 && (
            <div className="mb-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${practitioner.name} ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
