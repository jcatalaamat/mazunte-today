import { Header } from "@/components/header";
import { isAdminAuthenticated } from "@/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImportFlow } from "./import-flow";

export const metadata = {
  title: "Import Events · Admin · Mazunte Today",
};

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) redirect("/admin");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/admin"
            className="text-sm text-ocean hover:text-ocean/80 transition-colors mb-6 inline-block"
          >
            ← Back to Admin
          </Link>

          <h1 className="font-serif text-2xl mb-2">Import Events</h1>
          <p className="text-text-soft text-sm mb-8">
            Upload a WhatsApp chat export or paste multiple event texts. Select messages, combine if needed, and extract event data with AI.
          </p>

          <ImportFlow />
        </div>
      </section>
    </main>
  );
}
