import Link from "next/link";
import { GraduationCap, LayoutGrid, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/SearchBar";

export function SiteHeader({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06070b]/80 backdrop-blur-xl">
      <Container className="flex items-center gap-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#7da2ff]/35 bg-[#7da2ff]/15 text-[#c6d5ff] transition group-hover:bg-[#7da2ff]/25">
            <GraduationCap className="h-4 w-4" />
          </div>

          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-white">EnglishCourse</div>
            <div className="-mt-0.5 text-xs text-white/55">Practical English path for consistent progress</div>
          </div>
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="mx-auto max-w-xl">
            <SearchBar />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          <Link href="/courses">
            <Button variant="ghost">
              <LayoutGrid className="h-4 w-4" />
              Курсы
            </Button>
          </Link>

          {userEmail ? (
            <>
              <Badge className="hidden border-white/20 bg-white/10 text-white/80 xl:inline-flex">
                {userEmail}
              </Badge>
              <Link href="/profile">
                <Button variant="secondary">
                  <UserRound className="h-4 w-4" />
                  Профиль
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/auth">
              <Button>Войти</Button>
            </Link>
          )}
        </nav>
      </Container>

      <Container className="pb-3 md:hidden">
        <SearchBar />
      </Container>
    </header>
  );
}
