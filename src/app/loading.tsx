function SkeletonBlock() {
  return <div className="h-24 animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70" />;
}

export default function Loading() {
  return (
    <main className="space-y-4">
      <div className="h-12 w-1/2 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70" />
      <SkeletonBlock />
      <SkeletonBlock />
      <SkeletonBlock />
    </main>
  );
}
