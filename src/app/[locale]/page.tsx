import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HappeningNow } from "@/components/happening-now";
import { CategoryFilter } from "@/components/category-pills";
import { FeaturedEvents } from "@/components/featured-events";
import { WeekGrid } from "@/components/week-grid";
import { SubscribeForm } from "@/components/subscribe-form";
import { FeaturedPractitioners } from "@/components/featured-practitioners";
import { SectionLabel } from "@/components/section-label";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  getHappeningNow,
  getTodayEvents,
  getThisWeekEvents,
  getFeaturedEvents,
} from "@/actions/events";
import { getFeaturedPractitioners } from "@/actions/practitioners";

export const revalidate = 60;

export default async function Home() {
  const [happeningNow, todayEvents, weekEvents, featuredEvents, featuredPractitioners] =
    await Promise.all([
      getHappeningNow(),
      getTodayEvents(),
      getThisWeekEvents(),
      getFeaturedEvents(),
      getFeaturedPractitioners(),
    ]);

  const t = await getTranslations("home");
  const hasNoEvents = todayEvents.length === 0 && weekEvents.length === 0;

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HappeningNow events={happeningNow} />

      {hasNoEvents ? (
        <div className="text-center py-16 px-6">
          <p className="text-5xl mb-4">🌴</p>
          <h2 className="font-serif text-xl mb-2">{t("noEventsYet")}</h2>
          <p className="text-text-soft mb-6">
            {t("beFirst")}
          </p>
          <Link
            href="/submit"
            className="inline-block px-6 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors"
          >
            {t("addAnEvent")}
          </Link>
        </div>
      ) : (
        <>
          <SectionLabel title={t("todaysTimeline")} />
          <CategoryFilter events={todayEvents} />

          <FeaturedEvents events={featuredEvents} />
          <WeekGrid events={weekEvents} />
        </>
      )}

      <FeaturedPractitioners
        practitioners={featuredPractitioners}
        title={t("featuredPractitioners")}
      />

      <SubscribeForm />

      <footer className="px-6 pb-10 text-center">
        <Link
          href="/about"
          className="text-[0.7rem] text-text-lighter hover:text-text-soft transition-colors"
        >
          {t("footer")}
        </Link>
      </footer>
    </main>
  );
}
