import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white/80 p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-500">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Возможно, ссылка устарела или была перемещена.</p>
      <Link href="/" className="mt-6 inline-flex">
        <Button>На главную</Button>
      </Link>
    </div>
  );
}
