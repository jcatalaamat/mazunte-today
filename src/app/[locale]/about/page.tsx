import { Header } from "@/components/header";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("aboutTitle"),
    description: t("description"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
    { q: t("faq5q"), a: t("faq5a") },
  ];

  return (
    <main className="min-h-screen">
      <Header />
      <section className="px-6 py-12 sm:px-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-4xl mb-3">
            {t("title")}
          </h1>
          <p className="text-text-soft text-lg leading-relaxed mb-12">
            {t("description")}
          </p>

          {/* How it works */}
          <h2 className="font-serif text-xl mb-6">{t("howItWorks")}</h2>
          <div className="space-y-4 mb-14">
            {[t("howStep1"), t("howStep2"), t("howStep3")].map(
              (step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-ocean/10 text-ocean flex items-center justify-center text-sm font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-text-soft pt-1">{step}</p>
                </div>
              )
            )}
          </div>

          {/* FAQ */}
          <h2 className="font-serif text-xl mb-6">{t("faqTitle")}</h2>
          <div className="space-y-6 mb-14">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-medium mb-1">{faq.q}</h3>
                <p className="text-text-soft text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-ocean/5 rounded-2xl p-8 text-center">
            <h2 className="font-serif text-xl mb-2">{t("contactTitle")}</h2>
            <p className="text-text-soft text-sm mb-5">
              {t("contactDescription")}
            </p>
            <a
              href="https://wa.me/529581169947?text=Hola!%20Tengo%20una%20pregunta%20sobre%20Mazunte%20Today."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t("contactButton")}
            </a>
          </div>

          <p className="text-center text-text-lighter text-xs mt-12">
            {t("madeWith")}
          </p>
        </div>
      </section>
    </main>
  );
}
