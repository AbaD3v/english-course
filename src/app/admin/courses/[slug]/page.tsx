import { AdminCourseClient } from "@/components/admin/AdminCourseClient";
import { isCurrentUserAdmin } from "@/lib/admin/auth";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminCoursePage({ params }: Props) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return <div className="mx-auto max-w-3xl p-6 text-zinc-200">403 — Admin access required.</div>;
  }

  const { slug } = await params;
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - 29);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 text-zinc-100">
      <h1 className="text-3xl font-semibold">Course report: {slug}</h1>
      <AdminCourseClient slug={slug} initialFrom={fromDate.toISOString().slice(0, 10)} initialTo={to} />
    </main>
  );
}
