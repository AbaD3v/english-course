"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Tab = "password" | "magic" | "google";

export default function AuthPage() {
  const supabase = createSupabaseBrowser();
  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const redirectTo = `${SITE_URL}/profile`;

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setLoading(false);
    if (error) alert(error.message);
  }

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);

    if (!email.trim() || password.length < 6) {
      alert("Email обязателен, пароль минимум 6 символов.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Аккаунт создан. Теперь войди (или проверь почту, если включено подтверждение).");
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);

    if (!email.trim() || !password) {
      alert("Введите email и пароль.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // редирект вручную, чтобы было мгновенно
    window.location.href = "/profile";
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);
    setSent(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white/60 backdrop-blur p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold">Вход / Регистрация</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Для разработки удобнее Password. Magic link может лимититься.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            onClick={() => setTab("password")}
            className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
              tab === "password" ? "bg-black text-white" : "hover:bg-muted"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setTab("magic")}
            className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
              tab === "magic" ? "bg-black text-white" : "hover:bg-muted"
            }`}
          >
            Magic link
          </button>
          <button
            onClick={() => setTab("google")}
            className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
              tab === "google" ? "bg-black text-white" : "hover:bg-muted"
            }`}
          >
            Google
          </button>
        </div>

        {/* Shared email */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
          />
        </div>

        {tab === "password" && (
          <form className="space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Пароль</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={signInWithPassword}
                disabled={loading}
                className="rounded-xl bg-black text-white px-4 py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "..." : "Войти"}
              </button>
              <button
                onClick={signUpWithPassword}
                disabled={loading}
                className="rounded-xl border px-4 py-3 font-medium hover:bg-muted transition disabled:opacity-50"
              >
                {loading ? "..." : "Регистрация"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Если в Supabase включено подтверждение email, после регистрации
              может потребоваться подтвердить почту.
            </p>
          </form>
        )}

        {tab === "magic" && (
          <form onSubmit={signInWithMagicLink} className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black text-white px-4 py-3 font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Отправляем..." : "Отправить magic link"}
            </button>

            {sent && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                Ссылка отправлена. Проверь почту (и спам).
              </p>
            )}
          </form>
        )}

        {tab === "google" && (
          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full rounded-xl border px-4 py-3 font-medium hover:bg-muted transition disabled:opacity-50"
            >
              Продолжить с Google
            </button>

            <p className="text-xs text-muted-foreground">
              Если видишь 403 org_internal — в Google Cloud надо переключить
              Consent Screen на External и добавить test users.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}