import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function AppFooter() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/50">
      <Container className="py-8">
        <div className="flex flex-col gap-5 text-sm text-zinc-600 dark:text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">© {new Date().getFullYear()} EnglishCourse</p>
            <p className="text-xs">Modern platform for consistent English learning.</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/courses" className="transition hover:text-zinc-900 dark:hover:text-white">
              Курсы
            </Link>
            <Link href="/search" className="transition hover:text-zinc-900 dark:hover:text-white">
              Поиск
            </Link>
            <Link href="/profile" className="transition hover:text-zinc-900 dark:hover:text-white">
              Профиль
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
