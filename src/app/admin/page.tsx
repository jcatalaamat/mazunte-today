import { Header } from "@/components/header";
import { getPendingEvents, isAdminAuthenticated, verifyAdminPassword } from "@/actions/admin";
import { AdminEventList } from "./admin-event-list";
import { AdminLogin } from "./admin-login";
import { LogoutButton } from "./logout-button";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Admin · Mazunte Now",
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

  const pending = await getPendingEvents();

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl mb-1">Pending Events</h1>
              <p className="text-text-soft text-sm">
                {pending.length} event{pending.length !== 1 ? "s" : ""} waiting for
                approval.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/events"
                className="text-sm text-ocean hover:text-ocean/80 transition-colors"
              >
                All Events →
              </Link>
              <LogoutButton />
            </div>
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-16 text-text-lighter">
              <p className="text-lg mb-1">All clear</p>
              <p className="text-sm">No events pending review.</p>
            </div>
          ) : (
            <AdminEventList events={pending} />
          )}
        </div>
      </section>
    </main>
  );
}
