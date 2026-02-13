import { Header } from "@/components/header";
import { getPendingEvents, getAdminStats, isAdminAuthenticated, verifyAdminPassword, deleteAllEvents } from "@/actions/admin";
import { AdminEventList } from "./admin-event-list";
import { AdminLogin } from "./admin-login";
import { LogoutButton } from "./logout-button";
import { DeleteAllButton } from "./delete-all-button";
import { AdminNav } from "@/components/admin-nav";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin · Mazunte Today",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    async function handleLogin(password: string): Promise<boolean> {
      "use server";
      const success = await verifyAdminPassword(password);
      if (success) {
        redirect("/admin");
      }
      return false;
    }

    return (
      <main className="min-h-screen">
        <Header />
        <AdminLogin onLogin={handleLogin} />
      </main>
    );
  }

  const [pending, stats] = await Promise.all([
    getPendingEvents(),
    getAdminStats(),
  ]);

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-2xl">Admin</h1>
            <LogoutButton />
          </div>

          <AdminNav />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <div className={`rounded-xl p-3 text-center ${stats.pendingEvents > 0 ? "bg-coral/10" : "bg-cream"}`}>
              <p className={`text-2xl font-semibold ${stats.pendingEvents > 0 ? "text-coral" : "text-text"}`}>
                {stats.pendingEvents}
              </p>
              <p className="text-[0.65rem] text-text-lighter uppercase tracking-wider">Pending Events</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-cream">
              <p className="text-2xl font-semibold text-text">{stats.approvedEvents}</p>
              <p className="text-[0.65rem] text-text-lighter uppercase tracking-wider">Events</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${stats.pendingPractitioners > 0 ? "bg-coral/10" : "bg-cream"}`}>
              <p className={`text-2xl font-semibold ${stats.pendingPractitioners > 0 ? "text-coral" : "text-text"}`}>
                {stats.pendingPractitioners}
              </p>
              <p className="text-[0.65rem] text-text-lighter uppercase tracking-wider">Pending Practitioners</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-cream">
              <p className="text-2xl font-semibold text-text">{stats.approvedPractitioners}</p>
              <p className="text-[0.65rem] text-text-lighter uppercase tracking-wider">Practitioners</p>
            </div>
            <div className="rounded-xl p-3 text-center bg-cream">
              <p className="text-2xl font-semibold text-text">{stats.subscribers}</p>
              <p className="text-[0.65rem] text-text-lighter uppercase tracking-wider">Subscribers</p>
            </div>
          </div>

          {/* Pending Events */}
          <h2 className="font-serif text-lg mb-1">Pending Events</h2>
          <p className="text-text-soft text-sm mb-6">
            {pending.length} event{pending.length !== 1 ? "s" : ""} waiting for approval.
          </p>

          {pending.length === 0 ? (
            <div className="text-center py-16 text-text-lighter">
              <p className="text-lg mb-1">All clear</p>
              <p className="text-sm">No events pending review.</p>
            </div>
          ) : (
            <AdminEventList events={pending} />
          )}

          <div className="mt-16 pt-8 border-t border-black/10">
            <h2 className="font-serif text-lg mb-2 text-red-600">Danger Zone</h2>
            <p className="text-sm text-text-soft mb-4">
              Delete all events and occurrences. This cannot be undone.
            </p>
            <DeleteAllButton onDelete={async () => { "use server"; await deleteAllEvents(); redirect("/admin"); }} />
          </div>
        </div>
      </section>
    </main>
  );
}
