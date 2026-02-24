import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/SearchBar";

export function SiteHeader({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/70 backdrop-blur-md">
      <div className="shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
        <Container className="py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-semibold shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
              EC
            </div>

            <div className="leading-tight">
              <div className="font-semibold text-black group-hover:opacity-90 transition">
                EnglishCourse
              </div>
              <div className="text-xs text-black/50 -mt-0.5">
                Lessons • Practice • Progress
              </div>
            </div>
          </Link>

          {/* Desktop search */}
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
                <Badge className="hidden sm:inline-flex border-black/10 bg-white/70 text-black/70">
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

        {/* Mobile search */}
        <Container className="md:hidden pb-3">
          <SearchBar />
        </Container>
      </div>
    </header>
  );
}