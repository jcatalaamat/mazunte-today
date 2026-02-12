import { Header } from "@/components/header";
import { getApprovedEvents, isAdminAuthenticated, toggleFeatured } from "@/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { categoryConfig, formatTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { LogoutButton } from "../logout-button";

export const metadata = {
  title: "Manage Events · Mazunte Now",
};

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const approvedEvents = await getApprovedEvents();

  async function handleToggleFeatured(formData: FormData) {
    "use server";
    const eventId = formData.get("eventId") as string;
    await toggleFeatured(eventId);
    revalidatePath("/admin/events");
  }

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl mb-1">Manage Events</h1>
              <p className="text-text-soft text-sm">
                {approvedEvents.length} approved event{approvedEvents.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-ocean hover:text-ocean/80 transition-colors"
              >
                ← Pending Events
              </Link>
              <LogoutButton />
            </div>
          </div>

          {approvedEvents.length === 0 ? (
            <div className="text-center py-16 text-text-lighter">
              <p className="text-lg mb-1">No events yet</p>
              <p className="text-sm">Approved events will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvedEvents.map((event) => {
                const cat = categoryConfig[event.category] || categoryConfig.other;
                return (
                  <div
                    key={event.id}
                    className="bg-cream rounded-xl p-5 border border-black/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cat.bgClass}`}>
                            {cat.label}
                          </span>
                          {event.isFeatured && (
                            <span className="inline-block text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sunset/10 text-sunset">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg leading-tight mb-1">{event.title}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-text-lighter">
                          {event.venueName && <span>📍 {event.venueName}</span>}
                          <span>⏰ {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""}</span>
                          {event.isRecurring && <span>🔄 Recurring</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <form action={handleToggleFeatured}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <button
                            type="submit"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              event.isFeatured
                                ? "bg-sunset/10 text-sunset hover:bg-sunset/20"
                                : "bg-black/5 text-text-soft hover:bg-black/10"
                            }`}
                          >
                            {event.isFeatured ? "Unfeature" : "Feature"}
                          </button>
                        </form>
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="px-3 py-2 rounded-lg bg-ocean/10 text-ocean text-sm font-medium hover:bg-ocean/20 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
