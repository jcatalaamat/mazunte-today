"use client";

import { useState } from "react";
import { categoryConfig } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { PractitionerCard } from "./practitioner-card";
import { type PractitionerCard as PractitionerCardType } from "@/actions/practitioners";

const allCategories = Object.keys(categoryConfig);

export function PractitionerCategoryFilter({
  practitioners,
}: {
  practitioners: PractitionerCardType[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const t = useTranslations("practitioners");

  const filtered = selected
    ? practitioners.filter((p) => p.categories.includes(selected))
    : practitioners;

  return (
    <>
      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelected(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            selected === null
              ? "bg-ocean text-white"
              : "bg-cream border border-black/10 text-text-soft hover:border-ocean/30"
          }`}
        >
          {t("allCategories")}
        </button>
        {allCategories.map((cat) => {
          const config = categoryConfig[cat];
          const count = practitioners.filter((p) => p.categories.includes(cat)).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelected(selected === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selected === cat
                  ? "bg-ocean text-white"
                  : "bg-cream border border-black/10 text-text-soft hover:border-ocean/30"
              }`}
            >
              {config.emoji} {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-lighter">
          <p>{t("noPractitioners")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PractitionerCard key={p.id} practitioner={p} />
          ))}
        </div>
      )}
    </>
  );
}
