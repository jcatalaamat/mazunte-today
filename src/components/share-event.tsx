"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ShareEvent({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("share");

  const shareText = `${title} — ${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] font-medium text-sm hover:bg-[#25D366]/20 transition-colors"
      >
        {t("whatsapp")}
      </a>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-text font-medium text-sm hover:bg-black/10 transition-colors"
      >
        {copied ? t("copied") : t("copyLink")}
      </button>
    </div>
  );
}
