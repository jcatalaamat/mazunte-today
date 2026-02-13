import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl mb-4">🌊</p>
        <h1 className="font-serif text-3xl mb-2">{t("title")}</h1>
        <p className="text-text-soft mb-6">{t("description")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-ocean text-white font-semibold hover:bg-ocean-light transition-colors"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
