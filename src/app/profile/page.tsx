import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth");

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Профиль</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ты вошёл как: <span className="font-medium">{data.user.email}</span>
          </p>
        </div>
        <LogoutButton />
      </div>
    </main>
  );
}