import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HappeningNow } from "@/components/happening-now";
import { CategoryFilter } from "@/components/category-pills";
import { FeaturedEvent } from "@/components/featured-event";
import { WeekGrid } from "@/components/week-grid";
import { SubscribeForm } from "@/components/subscribe-form";
import { SectionLabel } from "@/components/section-label";
import Link from "next/link";
import {
  getHappeningNow,
  getTodayEvents,
  getThisWeekEvents,
  getFeaturedEvent,
} from "@/actions/events";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const [happeningNow, todayEvents, weekEvents, featured] = await Promise.all([
    getHappeningNow(),
    getTodayEvents(),
    getThisWeekEvents(),
    getFeaturedEvent(),
  ]);

  const hasNoEvents = todayEvents.length === 0 && weekEvents.length === 0;

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HappeningNow events={happeningNow} />

      {hasNoEvents ? (
        <div className="text-center py-16 px-6">
          <p className="text-5xl mb-4">🌴</p>
          <h2 className="font-serif text-xl mb-2">No events yet</h2>
          <p className="text-text-soft mb-6">
            Be the first to share what&apos;s happening in Mazunte!
          </p>
          <Link
            href="/submit"
            className="inline-block px-6 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors"
          >
            + Add an Event
          </Link>
        </div>
      ) : (
        <>
          <SectionLabel title="Today's Timeline" />
          <CategoryFilter events={todayEvents} />

          <FeaturedEvent event={featured} />
          <WeekGrid events={weekEvents} />
        </>
      )}

      <SubscribeForm />

      <p className="text-[0.7rem] text-text-lighter px-6 pb-10 text-center">
        Mazunte Now · Made with love on the Oaxacan coast
      </p>
    </main>
  );
}
