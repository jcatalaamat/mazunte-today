import { Header } from "@/components/header";
import { getSubscribers, isAdminAuthenticated, deleteSubscriber } from "@/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "../logout-button";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Subscribers · Mazunte Connect",
};

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const subs = await getSubscribers();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteSubscriber(id);
    revalidatePath("/admin/subscribers");
  }

  // Build CSV string for copy
  const emailList = subs.map((s) => s.email).join(", ");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-2xl mb-1">Subscribers</h1>
              <p className="text-text-soft text-sm">
                {subs.length} subscriber{subs.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-ocean hover:text-ocean/80 transition-colors"
              >
                ← Admin
              </Link>
              <LogoutButton />
            </div>
          </div>

          {subs.length === 0 ? (
            <div className="text-center py-16 text-text-lighter">
              <p className="text-lg mb-1">No subscribers yet</p>
              <p className="text-sm">People who subscribe will appear here.</p>
            </div>
          ) : (
            <>
              {/* Copy all emails */}
              <div className="mb-6 p-4 bg-cream rounded-xl border border-black/5">
                <p className="text-xs font-medium text-text-soft mb-2">All emails (copy-paste ready)</p>
                <p className="text-sm text-text break-all select-all">{emailList}</p>
              </div>

              {/* Subscriber list */}
              <div className="space-y-2">
                {subs.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-4 p-4 bg-cream rounded-xl border border-black/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sub.email}</p>
                      <p className="text-xs text-text-lighter">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={sub.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
