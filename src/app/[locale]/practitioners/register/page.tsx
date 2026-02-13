import { Header } from "@/components/header";
import { RegisterPractitionerForm } from "@/components/register-practitioner-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return {
    title: t("registerPractitionerTitle"),
    description: t("registerPractitionerDescription"),
  };
}

export default async function RegisterPractitionerPage() {
  const t = await getTranslations("registerPractitioner");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl mb-2">{t("pageTitle")}</h1>
          <p className="text-text-soft text-sm sm:text-base mb-8">
            {t("pageDescription")}
          </p>
          <RegisterPractitionerForm />
        </div>
      </section>
    </main>
  );
}
