import { Header } from "@/components/header";
import { getApprovedPractitioners } from "@/actions/practitioners";
import { PractitionerCategoryFilter } from "@/components/practitioner-category-filter";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return {
    title: t("practitionersTitle"),
    description: t("practitionersDescription"),
    openGraph: {
      title: t("practitionersTitle"),
      description: t("practitionersDescription"),
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PractitionersPage() {
  const practitioners = await getApprovedPractitioners();
  const t = await getTranslations("practitioners");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl mb-2">{t("title")}</h1>
            <p className="text-text-soft text-sm sm:text-base">
              {t("description")}
            </p>
          </div>

          <PractitionerCategoryFilter practitioners={practitioners} />

          {/* CTA */}
          <div className="mt-16 bg-cream rounded-2xl border border-black/5 p-6 sm:p-8 text-center">
            <h2 className="font-serif text-xl mb-2">{t("registerCta")}</h2>
            <p className="text-sm text-text-soft mb-5 max-w-md mx-auto">
              {t("registerCtaDescription")}
            </p>
            <Link
              href="/practitioners/register"
              className="inline-block px-6 py-3 rounded-xl bg-ocean text-white font-semibold text-sm hover:bg-ocean-light transition-colors"
            >
              {t("registerCtaButton")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
