"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";

export function LogoutButton() {
  const supabase = createSupabaseBrowser();

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/auth";
      }}
      className="rounded-xl border px-4 py-2 font-medium hover:bg-muted transition"
    >
      Выйти
    </button>
  );
}