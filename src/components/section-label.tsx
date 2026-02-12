export function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-6 mb-4 sm:px-10">
      <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-text-lighter">
        {title}
      </h2>
      <div className="flex-1 h-px bg-black/8" />
    </div>
  );
}
