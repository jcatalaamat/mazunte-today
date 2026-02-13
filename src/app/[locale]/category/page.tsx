import { Header } from "@/components/header";
import { getCategoriesWithCounts } from "@/actions/events";
import { Link } from "@/i18n/navigation";
import { categoryConfig } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("categoriesTitle"),
    description: t("categoriesDescription"),
    openGraph: {
      title: t("categoriesTitle"),
      description: t("categoriesDescription"),
    },
  };
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();
  const t = await getTranslations("categoryPage");
  const tc = await getTranslations("categories");

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl mb-3">{t("title")}</h1>
          <p className="text-text-soft mb-10">{t("description")}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const config = categoryConfig[cat.category] || categoryConfig.other;
              return (
                <Link
                  key={cat.category}
                  href={`/category/${cat.category}`}
                  className={`bg-cream rounded-2xl p-5 sm:p-6 border border-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all ${
                    cat.count === 0 ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 ${config.bgClass}`}
                  >
                    {config.emoji}
                  </div>
                  <h2 className="font-serif text-lg mb-1">{tc(cat.category)}</h2>
                  <p className="text-sm text-text-soft">
                    {t("eventCount", { count: cat.count })}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
