import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { PostHogProvider } from "@/components/posthog-provider";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "../globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "Mazunte Today",
      locale: locale === "es" ? "es_MX" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      languages: {
        en: "/en",
        es: "/es",
      },
    },
  };
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mazunte Today" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#2B6B7F" />
      </head>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} antialiased`}
      >
        <PostHogProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </PostHogProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
