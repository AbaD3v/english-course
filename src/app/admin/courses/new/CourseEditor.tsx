"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseEditor() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);

    if (!title.trim()) {
      setError("Введи название курса");
      return;
    }

    if (!slug.trim()) {
      setError("Введи slug");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          order_index: orderIndex,
          published,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ошибка сохранения");
        setSaving(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4 text-white">
      <h1 className="text-xl font-semibold">Новый курс</h1>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название курса"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
      />

      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
        placeholder="english-starter"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание курса"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
        rows={4}
      />

      <input
        type="number"
        min={1}
        value={orderIndex}
        onChange={(e) => setOrderIndex(Number(e.target.value))}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Опубликовать
      </label>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-zinc-950"
      >
        {saving ? "Сохраняю..." : "Создать курс"}
      </button>
    </div>
  );
}