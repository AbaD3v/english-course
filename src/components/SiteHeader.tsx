// src/components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface SiteHeaderProps {
  userEmail: string | null;
  isAdmin?: boolean;
}

export function SiteHeader({ userEmail, isAdmin = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/70">
      <Container className="py-3 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-900 grid place-items-center text-sm font-semibold transition group-hover:bg-zinc-200 dark:border-white/20 dark:bg-white/10 dark:text-white dark:group-hover:bg-white/20">
            EC
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-semibold text-zinc-900 tracking-tight dark:text-white">EnglishCourse</div>
            <div className="text-xs text-zinc-500 -mt-0.5 dark:text-white/55">Structured learning with modern UX</div>
          </div>
        </Link>

        {/* Search — desktop */}
        <div className="hidden md:block flex-1">
          <div className="mx-auto max-w-xl">
            <SearchBar />
          </div>
        </div>

        {/* Nav — desktop */}
        <nav className="ml-auto hidden md:flex items-center gap-2">
          <ThemeToggle />

          <Link href="/courses">
            <Button variant="ghost">Курсы</Button>
          </Link>

          {/* Админ-ссылка — только для admin */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-400/10"
              >
                <ShieldCheck className="h-4 w-4" />
                Админ
              </Button>
            </Link>
          )}

          {userEmail ? (
            <>
              <Badge className="hidden sm:inline-flex border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-white/75">
                {userEmail}
              </Badge>
              <Link href="/profile">
                <Button variant="secondary">Профиль</Button>
              </Link>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="secondary">Войти</Button>
            </Link>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </Container>

      {/* Mobile menu */}
      <Container className="md:hidden pb-3 space-y-3">
        <SearchBar />
        {menuOpen && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid gap-2">
              <Link href="/courses" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Курсы
                </Button>
              </Link>

              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-400/10"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Панель админа
                  </Button>
                </Link>
              )}

              <Link
                href={userEmail ? "/profile" : "/auth"}
                onClick={() => setMenuOpen(false)}
              >
                <Button className="w-full justify-start">
                  {userEmail ? "Профиль" : "Войти"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
