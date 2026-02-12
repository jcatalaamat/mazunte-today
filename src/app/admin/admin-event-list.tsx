"use client";

import { approveEvent, rejectEvent } from "@/actions/admin";
import { type events } from "@/db/schema";
import { formatTime, categoryConfig } from "@/lib/utils";
import { useTransition } from "react";

type Event = typeof events.$inferSelect;

export function AdminEventList({ events: eventList }: { events: Event[] }) {
  return (
    <div className="space-y-4">
      {eventList.map((event) => (
        <AdminEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function AdminEventCard({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const cat = categoryConfig[event.category] || categoryConfig.other;

  function handleApprove() {
    startTransition(async () => {
      await approveEvent(event.id);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectEvent(event.id);
    });
  }

  return (
    <div className={`bg-cream rounded-xl p-5 border border-black/5 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-2 ${cat.bgClass}`}>
            {cat.label}
          </span>
          <h3 className="font-serif text-lg leading-tight mb-1">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-text-soft mb-2 line-clamp-2">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-text-lighter">
            {event.venueName && <span>📍 {event.venueName}</span>}
            <span>⏰ {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""}</span>
            {event.isRecurring ? (
              <span>🔄 Recurring</span>
            ) : event.date ? (
              <span>📅 {event.date}</span>
            ) : null}
            {event.organizerName && <span>👤 {event.organizerName}</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-jungle text-white text-sm font-medium hover:bg-jungle-light transition-colors disabled:opacity-50 cursor-pointer"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-coral/10 text-coral text-sm font-medium hover:bg-coral/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
