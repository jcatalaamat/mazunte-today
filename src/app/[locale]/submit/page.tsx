import { Header } from "@/components/header";
import { SubmitEventForm } from "@/components/submit-event-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("submitTitle"),
    description: t("submitDescription"),
  };
}

export default async function SubmitPage() {
  const t = await getTranslations("submit");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-lg mx-auto text-center mb-10">
          <h1 className="font-serif text-[clamp(1.8rem,5vw,2.5rem)] font-normal leading-tight mb-2">
            {t("pageTitle")}
          </h1>
          <p className="text-text-soft text-[0.9rem]">
            {t("pageDescription")}
          </p>
        </div>
        <SubmitEventForm />
      </section>
    </main>
  );
}
