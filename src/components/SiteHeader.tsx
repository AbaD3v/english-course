import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/SearchBar";

export function SiteHeader({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <Container className="py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl border border-white/20 bg-white/10 text-white grid place-items-center text-sm font-semibold transition group-hover:bg-white/20">
            EC
          </div>

          <div className="leading-tight">
            <div className="font-semibold text-white tracking-tight">EnglishCourse</div>
            <div className="text-xs text-white/55 -mt-0.5">Structured learning with modern UX</div>
          </div>
        </Link>

        <div className="hidden md:block flex-1">
          <div className="mx-auto max-w-xl">
            <SearchBar />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          <Link href="/courses">
            <Button variant="ghost">Курсы</Button>
          </Link>

          {userEmail ? (
            <>
              <Badge className="hidden sm:inline-flex border-white/15 bg-white/10 text-white/75">
                {userEmail}
              </Badge>
              <Link href="/profile">
                <Button variant="secondary">Профиль</Button>
              </Link>
            </>
          ) : (
            <Link href="/auth">
              <Button>Войти</Button>
            </Link>
          )}
        </nav>
      </Container>

      <Container className="md:hidden pb-3">
        <SearchBar />
      </Container>
    </header>
  );
}
