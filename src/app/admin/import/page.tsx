import { Header } from "@/components/header";
import { isAdminAuthenticated } from "@/actions/admin";
import { redirect } from "next/navigation";
import { ImportFlow } from "./import-flow";
import { AdminNav } from "@/components/admin-nav";
import { LogoutButton } from "../logout-button";

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
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-2xl">Import Events</h1>
            <LogoutButton />
          </div>

          <AdminNav />

          <p className="text-text-soft text-sm mb-8">
            Upload a WhatsApp chat export or paste multiple event texts. Select messages, combine if needed, and extract event data with AI.
          </p>

          <ImportFlow />
        </div>
      </section>
    </main>
  );
}
