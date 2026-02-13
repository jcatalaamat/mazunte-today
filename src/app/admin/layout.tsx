import type { ReactNode } from "react";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { PostHogProvider } from "@/components/posthog-provider";
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

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Admin is English-only — load EN messages for shared components (Header)
  const messages = (await import("../../../messages/en.json")).default;

  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} antialiased`}
      >
        <PostHogProvider>
          <NextIntlClientProvider locale="en" messages={messages}>
            {children}
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
