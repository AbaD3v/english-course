// src/app/auth/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Chrome, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Tab = "password" | "magic" | "google";
type Mode = "signin" | "signup";

export default function AuthPage() {
  const supabase = createSupabaseBrowser();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>("password");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Куда редиректить после успешного входа
  const nextPath = searchParams.get("next") ?? "/profile";
  const redirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  // Показываем ошибку из URL если есть (например после неудачного callback)
  const urlError = searchParams.get("error");

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Введите email");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      // --- РЕГИСТРАЦИЯ ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      // Supabase возвращает user даже если нужно подтверждение email
      // Проверяем нужно ли подтверждение
      if (data.user && data.user.identities?.length === 0) {
        // Пользователь уже существует
        toast.error("Аккаунт с таким email уже существует. Войдите.");
        setMode("signin");
        return;
      }

      toast.success("Аккаунт создан!", {
        description: "Проверьте почту и подтвердите email для входа.",
      });
    } else {
      // --- ВХОД ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Неверный email или пароль");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Email не подтверждён", {
            description: "Проверьте почту и перейдите по ссылке активации.",
          });
        } else {
          toast.error(error.message);
        }
        return;
      }

      window.location.href = nextPath;
    }
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Введите email");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Ссылка отправлена", {
      description: "Проверьте почту для входа.",
    });
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-[#FBFBFC] dark:bg-[#0C0C0E] overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* Subtle Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 dark:bg-zinc-800/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 dark:bg-zinc-800/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-[28px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">

          {/* Header */}
          <div className="mb-8 space-y-1.5 text-center">
            <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              English Course
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              {mode === "signin" ? "Войдите в личный кабинет" : "Создайте аккаунт"}
            </p>
          </div>

          {/* URL Error Banner */}
          {urlError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {decodeURIComponent(urlError)}
            </div>
          )}

          {/* Method Tabs */}
          <div className="flex p-1 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-2xl mb-6">
            {(["password", "magic", "google"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSent(false); }}
                className={cn(
                  "relative flex-1 py-2.5 text-[13px] font-medium transition-all duration-300 outline-none",
                  tab === t
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {tab === t && (
                  <motion.div
                    layoutId="active-auth-tab"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">
                  {t === "password" ? "Пароль" : t === "magic" ? "Magic Link" : "Google"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── ПАРОЛЬ ── */}
            {tab === "password" && (
              <motion.form
                key="password"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium ml-1 text-zinc-600 dark:text-zinc-400">
                    Электронная почта
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-200 transition-colors" />
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium ml-1 text-zinc-600 dark:text-zinc-400">
                    Пароль
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-200 transition-colors" />
                    <input
                      type="password"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      required
                      minLength={6}
                      className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : mode === "signin" ? (
                      "Войти"
                    ) : (
                      "Создать аккаунт"
                    )}
                  </button>

                  {/* Toggle Sign In / Sign Up */}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="w-full py-2 text-[13px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium transition-colors"
                  >
                    {mode === "signin"
                      ? "Нет аккаунта? Зарегистрироваться"
                      : "Уже есть аккаунт? Войти"}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── MAGIC LINK ── */}
            {tab === "magic" && (
              <motion.form
                key="magic"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onSubmit={signInWithMagicLink}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium ml-1 text-zinc-600 dark:text-zinc-400">
                    Электронная почта
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-200 transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || sent}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : sent ? (
                    <><CheckCircle2 className="size-4" /> Отправлено</>
                  ) : (
                    <><span>Отправить ссылку</span><ArrowRight className="size-4" /></>
                  )}
                </button>

                {sent && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[12px] text-center text-emerald-600 dark:text-emerald-400 font-medium"
                  >
                    Проверьте почту — ссылка для входа уже там
                  </motion.p>
                )}
              </motion.form>
            )}

            {/* ── GOOGLE ── */}
            {tab === "google" && (
              <motion.div
                key="google"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Chrome className="size-4" />
                  )}
                  Продолжить через Google
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-[13px] text-zinc-500">
          Возникли трудности?{" "}
          <a
            href="#"
            className="text-zinc-900 dark:text-zinc-400 font-medium underline-offset-4 hover:underline transition-all"
          >
            Связаться с нами
          </a>
        </p>
      </motion.div>
    </main>
  );
}
