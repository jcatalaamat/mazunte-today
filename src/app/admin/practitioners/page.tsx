import { Header } from "@/components/header";
import { getPendingPractitioners, getApprovedPractitionersList, isAdminAuthenticated } from "@/actions/admin";
import { AdminPractitionerList } from "./admin-practitioner-list";
import { LogoutButton } from "../logout-button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { categoryConfig } from "@/lib/utils";
import { AdminNav } from "@/components/admin-nav";

export const metadata = {
  title: "Manage Practitioners · Mazunte Today",
};

export const dynamic = "force-dynamic";

export default async function AdminPractitionersPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) redirect("/admin");

  const pending = await getPendingPractitioners();
  const approved = await getApprovedPractitionersList();

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-2xl">Practitioners</h1>
            <LogoutButton />
          </div>

          <AdminNav />

          <p className="text-text-soft text-sm mb-6">
            {pending.length} pending · {approved.length} approved
          </p>

          {/* Pending */}
          <div className="mb-12">
            <h2 className="font-serif text-lg mb-4">Pending Review</h2>
            {pending.length === 0 ? (
              <div className="text-center py-8 text-text-lighter">
                <p className="text-sm">No practitioners pending review.</p>
              </div>
            ) : (
              <AdminPractitionerList practitioners={pending} />
            )}
          </div>

          {/* Approved */}
          <div>
            <h2 className="font-serif text-lg mb-4">Approved</h2>
            {approved.length === 0 ? (
              <div className="text-center py-8 text-text-lighter">
                <p className="text-sm">No approved practitioners yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approved.map((p) => {
                  const categories = (p.categories as string[]) || [];
                  return (
                    <div key={p.id} className="bg-cream rounded-xl p-4 border border-black/5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {p.profileImage ? (
                            <img src={p.profileImage} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-sand-dark flex items-center justify-center text-xs font-medium text-text-soft">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm truncate">{p.name}</h3>
                            <div className="flex gap-1 flex-wrap">
                              {categories.slice(0, 3).map((cat) => {
                                const config = categoryConfig[cat] || categoryConfig.other;
                                return (
                                  <span key={cat} className="text-[0.55rem] text-text-lighter">
                                    {config.emoji} {config.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/admin/practitioners/${p.id}`}
                          className="px-3 py-1.5 rounded-lg bg-ocean/10 text-ocean text-sm font-medium hover:bg-ocean/20 transition-colors flex-shrink-0"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
