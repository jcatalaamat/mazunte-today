import { PractitionerCard } from "./practitioner-card";
import { SectionLabel } from "./section-label";
import { type PractitionerCard as PractitionerCardType } from "@/actions/practitioners";
import { Link } from "@/i18n/navigation";

export function FeaturedPractitioners({
  practitioners,
  title,
}: {
  practitioners: PractitionerCardType[];
  title: string;
}) {
  if (practitioners.length === 0) return null;

  return (
    <div className="mb-4">
      <SectionLabel title={title} />
      <div className="px-6 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {practitioners.map((p) => (
              <PractitionerCard key={p.id} practitioner={p} />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link
              href="/practitioners"
              className="text-sm text-ocean hover:text-ocean-light transition-colors"
            >
              {title} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
