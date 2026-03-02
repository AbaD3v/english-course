import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";
import { isCurrentUserAdmin } from "@/lib/admin/auth";

export default async function AdminPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return <div className="mx-auto max-w-3xl p-6 text-zinc-200">403 — Admin access required.</div>;
  }

  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - 29);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 text-zinc-100">
      <h1 className="text-3xl font-semibold">Admin reports dashboard</h1>
      <AdminOverviewClient initialFrom={fromDate.toISOString().slice(0, 10)} initialTo={to} />
    </main>
  );
}
