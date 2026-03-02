import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";
import { Mail, UserCircle, Settings } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth");

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Настройки профиля
        </h1>
        <p className="text-zinc-500 mt-2 max-w-xl">
          Управляйте своими данными и безопасностью аккаунта.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <UserCircle className="size-10 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                Ваш аккаунт
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-zinc-600 dark:text-zinc-400">
                <Mail className="size-4" />
                <span className="text-sm font-medium">{data.user.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>
      </div>
      
      {/* Settings Section Placeholder */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Settings className="size-6 text-zinc-500" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                Дополнительные настройки
            </h2>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            Здесь можно будет добавить смену пароля, аватарки или подписку.
        </p>
      </div>
    </main>
  );
}