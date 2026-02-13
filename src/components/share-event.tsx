"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";

export function ShareEvent({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("share");

  const shareText = `${title} — ${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  function trackShare(method: "whatsapp" | "copy_link") {
    posthog.capture("share_clicked", { method, title, url });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    trackShare("copy_link");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare("whatsapp")}
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
