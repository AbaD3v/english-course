"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Chrome, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Tab = "password" | "magic" | "google";

export default function AuthPage() {
  const supabase = createSupabaseBrowser();
  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

const redirectTo = `${SITE_URL}/auth/callback`;

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Ошибка валидации", { description: "Пароль должен быть не менее 6 символов." });
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
      toast.error(error.message);
      return;
    }
    toast.success("Готово!", { description: "Проверьте почту для активации аккаунта." });
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Заполните все поля");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/profile";
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

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
    toast.success("Ссылка отправлена");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-[#FBFBFC] dark:bg-[#0C0C0E] overflow-hidden">
      <Toaster position="top-center" richColors />
      
      {/* Subtle Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 dark:bg-zinc-800/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-zinc-200/50 dark:bg-zinc-800/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-[28px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          
          <div className="mb-10 space-y-2 text-center">
            <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              English Course
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              Войдите в личный кабинет
            </p>
          </div>

          {/* SaaS-style Tabs */}
          <div className="flex p-1 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-2xl mb-8">
            {(['password', 'magic', 'google'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSent(false); }}
                className={cn(
                  "relative flex-1 py-2.5 text-[13px] font-medium transition-all duration-300 outline-none",
                  tab === t ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {tab === t && (
                  <motion.div
                    layoutId="active-auth-tab"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 capitalize">
                  {t === 'password' ? 'Пароль' : t === 'magic' ? 'Линк' : 'Google'}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {tab !== "google" && (
              <div className="space-y-2">
                <label className="text-[13px] font-medium ml-1 text-zinc-600 dark:text-zinc-400">Электронная почта</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-200 transition-colors" />
                  <input
                    type="email"
                    className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {tab === "password" && (
                <motion.form
                  key="password"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium ml-1 text-zinc-600 dark:text-zinc-400">Пароль</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-200 transition-colors" />
                      <input
                        type="password"
                        className="w-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={signInWithPassword}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all disabled:opacity-50 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : "Войти"}
                    </button>
                    <button
                      type="button"
                      onClick={signUpWithPassword}
                      disabled={loading}
                      className="flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all disabled:opacity-50"
                    >
                      Регистрация
                    </button>
                  </div>
                </motion.form>
              )}

              {tab === "magic" && (
                <motion.form
                  key="magic"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  onSubmit={signInWithMagicLink}
                  className="space-y-4"
                >
                  <button
                    type="submit"
                    disabled={loading || sent}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-3 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : sent ? <CheckCircle2 className="size-4" /> : "Отправить ссылку"}
                    {!loading && !sent && <ArrowRight className="size-4" />}
                  </button>
                  {sent && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-[12px] text-center text-emerald-600 dark:text-emerald-400 font-medium"
                    >
                      Проверьте почту для входа
                    </motion.p>
                  )}
                </motion.form>
              )}

              {tab === "google" && (
                <motion.div
                  key="google"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Chrome className="size-4" />}
                    Продолжить через Google
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center mt-10 text-[13px] text-zinc-500">
          Возникли трудности? <a href="#" className="text-zinc-900 dark:text-zinc-400 font-medium underline-offset-4 hover:underline transition-all">Связаться с нами</a>
        </p>
      </motion.div>
    </main>
  );
}