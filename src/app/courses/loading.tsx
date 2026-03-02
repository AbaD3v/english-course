export default function CoursesLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />
      ))}
    </div>
  );
}
