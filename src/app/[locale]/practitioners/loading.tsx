export default function Loading() {
  return (
    <div className="min-h-[60vh] px-6 py-12 sm:px-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-sand-dark rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-sand-dark rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-cream rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
