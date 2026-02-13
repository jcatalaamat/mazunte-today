"use client";

import { getGoogleCalendarUrl, getICalContent } from "@/lib/utils";
import { useTranslations } from "next-intl";

type CalendarEvent = {
  title: string;
  description?: string | null;
  date: string;
  startTime: string;
  endTime?: string | null;
  venueName?: string | null;
  slug: string;
};

export function AddToCalendar({ event }: { event: CalendarEvent }) {
  const googleUrl = getGoogleCalendarUrl(event);
  const t = useTranslations("calendar");

  const handleDownloadIcal = () => {
    const icalContent = getICalContent(event);
    const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug}-${event.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-text font-medium text-sm hover:bg-black/10 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5zm.75-3.75a.75.75 0 01-1.5 0V9a.75.75 0 011.5 0v6zM18 7.5H6V6h12v1.5z"/>
        </svg>
        {t("googleCalendar")}
      </a>
      <button
        onClick={handleDownloadIcal}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 text-text font-medium text-sm hover:bg-black/10 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        {t("downloadIcs")}
      </button>
    </div>
  );
}
