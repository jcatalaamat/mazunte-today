export default function Loading() {
  return (
    <div className="min-h-[60vh] px-6 py-12 sm:px-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-4 w-32 bg-sand-dark rounded animate-pulse" />
        <div className="h-64 bg-cream rounded-2xl animate-pulse" />
        <div className="h-6 w-20 bg-sand-dark rounded animate-pulse" />
        <div className="h-10 w-3/4 bg-sand-dark rounded-lg animate-pulse" />
        <div className="h-4 w-full bg-sand-dark rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-sand-dark rounded animate-pulse" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-cream rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
