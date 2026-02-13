import { Link } from "@/i18n/navigation";
import { categoryConfig } from "@/lib/utils";
import { type PractitionerCard as PractitionerCardType } from "@/actions/practitioners";

export function PractitionerCard({ practitioner }: { practitioner: PractitionerCardType }) {
  return (
    <Link
      href={`/practitioners/${practitioner.slug}`}
      className="block bg-cream rounded-2xl border border-black/5 p-5 hover:border-ocean/20 transition-colors"
    >
      <div className="flex items-start gap-4">
        {practitioner.profileImage ? (
          <img
            src={practitioner.profileImage}
            alt={practitioner.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-sand-dark flex items-center justify-center text-xl font-serif text-text-soft flex-shrink-0">
            {practitioner.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg leading-tight mb-1">{practitioner.name}</h3>
          {practitioner.shortBio && (
            <p className="text-sm text-text-soft line-clamp-2 mb-2">
              {practitioner.shortBio}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {practitioner.categories.slice(0, 3).map((cat) => {
              const config = categoryConfig[cat] || categoryConfig.other;
              return (
                <span
                  key={cat}
                  className={`inline-block text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${config.bgClass}`}
                >
                  {config.emoji} {config.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
