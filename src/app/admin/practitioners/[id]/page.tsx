import { Header } from "@/components/header";
import { getPractitionerById, getPractitionerServicesById, isAdminAuthenticated, updatePractitioner, updatePractitionerServices, togglePractitionerFeatured } from "@/actions/admin";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { categoryConfig } from "@/lib/utils";
import { AdminServicesEditor } from "@/components/admin-services-editor";

export const metadata = {
  title: "Edit Practitioner · Mazunte Today",
};

export const dynamic = "force-dynamic";

const allCategories = Object.keys(categoryConfig);

export default async function EditPractitionerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) redirect("/admin");

  const practitioner = await getPractitionerById(id);
  if (!practitioner) notFound();

  const practitionerServices = await getPractitionerServicesById(id);
  const currentCategories = (practitioner.categories as string[]) || [];

  async function handleUpdate(formData: FormData) {
    "use server";
    const data = {
      name: formData.get("name") as string,
      bio: (formData.get("bio") as string) || null,
      shortBio: (formData.get("shortBio") as string) || null,
      categories: formData.getAll("categories") as string[],
      venueName: (formData.get("venueName") as string) || null,
      contactWhatsapp: (formData.get("contactWhatsapp") as string) || null,
      contactInstagram: (formData.get("contactInstagram") as string) || null,
      contactLink: (formData.get("contactLink") as string) || null,
    };

    await updatePractitioner(id, data);

    // Parse services
    const servicesJson = formData.get("servicesJson") as string;
    if (servicesJson) {
      try {
        const servicesList = JSON.parse(servicesJson);
        await updatePractitionerServices(id, servicesList);
      } catch {
        // ignore parse errors
      }
    }

    redirect("/admin/practitioners");
  }

  async function handleToggleFeatured() {
    "use server";
    await togglePractitionerFeatured(id);
  }

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-lg mx-auto">
          <Link
            href="/admin/practitioners"
            className="inline-flex items-center gap-1 text-sm text-text-soft hover:text-text mb-6 transition-colors"
          >
            ← Back to practitioners
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-2xl">Edit Practitioner</h1>
            <form action={handleToggleFeatured}>
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  practitioner.isFeatured
                    ? "bg-sunset/10 text-sunset hover:bg-sunset/20"
                    : "bg-black/5 text-text-soft hover:bg-black/10"
                }`}
              >
                {practitioner.isFeatured ? "Featured ★" : "Feature"}
              </button>
            </form>
          </div>

          <form action={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={practitioner.name}
                required
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Short Bio</label>
              <input
                type="text"
                name="shortBio"
                defaultValue={practitioner.shortBio || ""}
                maxLength={150}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Full Bio</label>
              <textarea
                name="bio"
                defaultValue={practitioner.bio || ""}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Categories</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const config = categoryConfig[cat];
                  return (
                    <label key={cat} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="categories"
                        value={cat}
                        defaultChecked={currentCategories.includes(cat)}
                        className="accent-ocean"
                      />
                      <span className="text-sm">{config.emoji} {config.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input
                type="text"
                name="venueName"
                defaultValue={practitioner.venueName || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">WhatsApp</label>
              <input
                type="text"
                name="contactWhatsapp"
                defaultValue={practitioner.contactWhatsapp || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Instagram</label>
              <input
                type="text"
                name="contactInstagram"
                defaultValue={practitioner.contactInstagram || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Booking Link</label>
              <input
                type="url"
                name="contactLink"
                defaultValue={practitioner.contactLink || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <AdminServicesEditor
              initialServices={practitionerServices.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description || "",
                duration: s.duration || "",
                price: s.price || "",
                category: s.category || "other",
              }))}
            />

            <button
              type="submit"
              className="w-full px-4 py-3.5 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
