import { Header } from "@/components/header";
import { getEventById, isAdminAuthenticated, updateEvent } from "@/actions/admin";
import { getPractitionerDropdownOptions } from "@/actions/practitioners";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { categoryConfig } from "@/lib/utils";

export const metadata = {
  title: "Edit Event · Mazunte Today",
};

export const dynamic = "force-dynamic";

const categories = Object.keys(categoryConfig);

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const [event, practitionerOptions] = await Promise.all([
    getEventById(id),
    getPractitionerDropdownOptions(),
  ]);

  if (!event) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    type Category = "yoga" | "music" | "ceremony" | "food" | "wellness" | "community" | "market" | "family" | "other";
    const practitionerIdValue = formData.get("practitionerId") as string;
    const data = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      category: formData.get("category") as Category,
      venueName: (formData.get("venueName") as string) || null,
      mapsUrl: (formData.get("mapsUrl") as string) || null,
      organizerName: (formData.get("organizerName") as string) || null,
      practitionerId: practitionerIdValue || null,
      startTime: formData.get("startTime") as string,
      endTime: (formData.get("endTime") as string) || null,
      contactWhatsapp: (formData.get("contactWhatsapp") as string) || null,
      contactInstagram: (formData.get("contactInstagram") as string) || null,
      contactLink: (formData.get("contactLink") as string) || null,
    };

    await updateEvent(id, data);
    redirect("/admin/events");
  }

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-lg mx-auto">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1 text-sm text-text-soft hover:text-text mb-6 transition-colors"
          >
            ← Back to events
          </Link>

          <h1 className="font-serif text-2xl mb-8">Edit Event</h1>

          <form action={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={event.title}
                required
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                name="description"
                defaultValue={event.description || ""}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                name="category"
                defaultValue={event.category}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Practitioner</label>
              <select
                name="practitionerId"
                defaultValue={event.practitionerId || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              >
                <option value="">— None —</option>
                {practitionerOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-lighter mt-1">
                Link this event to a practitioner profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Venue</label>
              <input
                type="text"
                name="venueName"
                defaultValue={event.venueName || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Google Maps Link</label>
              <input
                type="url"
                name="mapsUrl"
                defaultValue={event.mapsUrl || ""}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
              <p className="text-xs text-text-lighter mt-1">
                Paste a Google Maps link to show a &quot;Get directions&quot; button
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Organizer</label>
              <input
                type="text"
                name="organizerName"
                defaultValue={event.organizerName || ""}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  defaultValue={event.startTime.slice(0, 5)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  defaultValue={event.endTime?.slice(0, 5) || ""}
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">WhatsApp</label>
              <input
                type="text"
                name="contactWhatsapp"
                defaultValue={event.contactWhatsapp || ""}
                placeholder="+52 123 456 7890"
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Instagram</label>
              <input
                type="text"
                name="contactInstagram"
                defaultValue={event.contactInstagram || ""}
                placeholder="@username"
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Booking Link</label>
              <input
                type="url"
                name="contactLink"
                defaultValue={event.contactLink || ""}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.9rem] outline-none focus:border-ocean transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3.5 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors"
            >
              Save Changes
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
