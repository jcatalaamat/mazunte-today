"use client";

import { approvePractitioner, rejectPractitioner } from "@/actions/admin";
import { type practitioners } from "@/db/schema";
import { categoryConfig } from "@/lib/utils";
import { useTransition } from "react";

type Practitioner = typeof practitioners.$inferSelect;

export function AdminPractitionerList({ practitioners: list }: { practitioners: Practitioner[] }) {
  return (
    <div className="space-y-4">
      {list.map((p) => (
        <AdminPractitionerCard key={p.id} practitioner={p} />
      ))}
    </div>
  );
}

function AdminPractitionerCard({ practitioner }: { practitioner: Practitioner }) {
  const [isPending, startTransition] = useTransition();
  const categories = (practitioner.categories as string[]) || [];

  function handleApprove() {
    startTransition(async () => {
      await approvePractitioner(practitioner.id);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectPractitioner(practitioner.id);
    });
  }

  return (
    <div className={`bg-cream rounded-xl p-5 border border-black/5 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {practitioner.profileImage ? (
              <img
                src={practitioner.profileImage}
                alt={practitioner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sand-dark flex items-center justify-center text-sm font-medium text-text-soft">
                {practitioner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-serif text-lg leading-tight">{practitioner.name}</h3>
              {practitioner.shortBio && (
                <p className="text-sm text-text-soft line-clamp-1">{practitioner.shortBio}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {categories.map((cat) => {
              const config = categoryConfig[cat] || categoryConfig.other;
              return (
                <span
                  key={cat}
                  className={`inline-block text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${config.bgClass}`}
                >
                  {config.label}
                </span>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-text-lighter">
            {practitioner.venueName && <span>📍 {practitioner.venueName}</span>}
            {practitioner.contactWhatsapp && <span>📱 {practitioner.contactWhatsapp}</span>}
            {practitioner.contactInstagram && <span>📸 {practitioner.contactInstagram}</span>}
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
