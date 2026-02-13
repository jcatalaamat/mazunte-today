"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: "en" | "es") {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-0.5 text-[0.68rem] font-semibold">
      <button
        onClick={() => switchLocale("en")}
        className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
          locale === "en"
            ? "text-ocean bg-ocean-pale"
            : "text-text-lighter hover:text-text-soft"
        }`}
      >
        EN
      </button>
      <span className="text-black/20">|</span>
      <button
        onClick={() => switchLocale("es")}
        className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
          locale === "es"
            ? "text-ocean bg-ocean-pale"
            : "text-text-lighter hover:text-text-soft"
        }`}
      >
        ES
      </button>
    </div>
  );
}
