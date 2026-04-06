"use client";

// src/app/admin/lessons/[id]/LessonEditor.tsx

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  Heading,
  AlignLeft,
  Video,
  BookMarked,
  HelpCircle,
  Keyboard,
  ChevronUp,
  ChevronDown,
  Eye,
  Loader2,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────── */
type BlockType =
  | "heading"
  | "paragraph"
  | "video"
  | "vocab"
  | "exercise_mcq"
  | "exercise_input";

type HeadingBlock = {
  type: "heading";
  text: string;
};

type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

type VideoBlock = {
  type: "video";
  url: string;
  title: string;
  provider?: "youtube";
};

type VocabItem = {
  word: string;
  translation: string;
  example: string;
};

type VocabBlock = {
  type: "vocab";
  items: VocabItem[];
};

type MCQBlock = {
  type: "exercise_mcq";
  question: string;
  options: string[];
  answerIndex: number;
};

type InputBlock = {
  type: "exercise_input";
  prompt: string;
  answer: string;
  accept: string[];
};

type Block =
  | HeadingBlock
  | ParagraphBlock
  | VideoBlock
  | VocabBlock
  | MCQBlock
  | InputBlock;

interface LessonMeta {
  id: string | null;
  courseId: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
}

interface Props {
  initialMeta: LessonMeta;
  initialBlocks: Block[];
  courses: { id: string; title: string }[];
}

/* ─── helpers ────────────────────────────────────────── */
function makeBlock(type: BlockType): Block {
  switch (type) {
    case "heading":
      return { type, text: "" };
    case "paragraph":
      return { type, text: "" };
    case "video":
      return { type, url: "", title: "", provider: "youtube" };
    case "vocab":
      return {
        type,
        items: [{ word: "", translation: "", example: "" }],
      };
    case "exercise_mcq":
      return {
        type,
        question: "",
        options: ["", "", "", ""],
        answerIndex: 0,
      };
    case "exercise_input":
      return {
        type,
        prompt: "",
        answer: "",
        accept: [],
      };
  }
}

function normalizeBlock(block: Block): Block {
  if (block.type === "exercise_input") {
    const rawBlock = block as unknown as {
      type: "exercise_input";
      prompt: string;
      answer: string;
      accept?: unknown;
    };

    return {
      ...block,
      accept: Array.isArray(rawBlock.accept)
        ? rawBlock.accept.filter((v): v is string => typeof v === "string")
        : typeof rawBlock.accept === "string"
          ? rawBlock.accept
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
    };
  }

  if (block.type === "video") {
    return {
      ...block,
      provider: block.provider ?? "youtube",
    };
  }

  return block;
}

const BLOCK_LABELS: Record<
  BlockType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  heading: {
    label: "Заголовок",
    icon: <Heading className="w-4 h-4" />,
    color: "text-violet-400",
  },
  paragraph: {
    label: "Текст",
    icon: <AlignLeft className="w-4 h-4" />,
    color: "text-zinc-400",
  },
  video: {
    label: "Видео",
    icon: <Video className="w-4 h-4" />,
    color: "text-red-400",
  },
  vocab: {
    label: "Словарик",
    icon: <BookMarked className="w-4 h-4" />,
    color: "text-amber-400",
  },
  exercise_mcq: {
    label: "MCQ",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "text-emerald-400",
  },
  exercise_input: {
    label: "Input",
    icon: <Keyboard className="w-4 h-4" />,
    color: "text-sky-400",
  },
};

/* ─── Component ──────────────────────────────────────── */
export default function LessonEditor({
  initialMeta,
  initialBlocks,
  courses,
}: Props) {
  const router = useRouter();

  const [meta, setMeta] = useState<LessonMeta>(initialMeta);
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.map(normalizeBlock)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const updateMeta = (patch: Partial<LessonMeta>) =>
    setMeta((m) => ({ ...m, ...patch }));

  const addBlock = (type: BlockType) =>
    setBlocks((b) => [...b, makeBlock(type)]);

  const removeBlock = (i: number) =>
    setBlocks((b) => b.filter((_, idx) => idx !== i));

  const moveBlock = (i: number, dir: -1 | 1) => {
    setBlocks((b) => {
      const next = [...b];
      const j = i + dir;

      if (j < 0 || j >= next.length) return next;

      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const updateBlock = useCallback((i: number, patch: Partial<Block>) => {
    setBlocks((b) =>
      b.map((bl, idx) => (idx === i ? normalizeBlock({ ...bl, ...patch } as Block) : bl))
    );
  }, []);

  async function save() {
    setError(null);

    if (!meta.title.trim()) {
      setError("Введи название урока");
      return;
    }

    if (!meta.slug.trim()) {
      setError("Введи slug");
      return;
    }

    if (!meta.courseId) {
      setError("Выбери курс");
      return;
    }

    setSaving(true);

    try {
      const normalizedBlocks = blocks.map((block) => {
        if (block.type === "exercise_input") {
          return {
            ...block,
            accept: Array.isArray(block.accept)
              ? block.accept.map((s: string) => s.trim()).filter(Boolean)
              : [],
          };
        }

        if (block.type === "video") {
          return {
            ...block,
            provider: block.provider ?? "youtube",
          };
        }

        return block;
      });

      const payload = {
  course_id: meta.courseId,
  title: meta.title.trim(),
  slug: meta.slug.trim(),
  order_index: meta.orderIndex,
  content: { blocks: normalizedBlocks },
  // ❌ description УБРАТЬ
};

      const isNew = !meta.id;
      const url = isNew ? "/api/admin/lessons" : `/api/admin/lessons/${meta.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview((p) => !p)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {preview ? "Редактор" : "Превью JSON"}
            </button>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300 disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Сохраняю…" : "Сохранить"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {preview ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="text-xs font-mono text-zinc-500 mb-3">
              content.blocks (JSON)
            </div>
            <pre className="text-xs text-zinc-300 overflow-auto max-h-[60vh] whitespace-pre-wrap">
              {JSON.stringify(blocks, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            {/* Meta */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Мета-данные урока
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs text-zinc-400">Курс *</span>
                  <select
                    value={meta.courseId}
                    onChange={(e) => updateMeta({ courseId: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  >
                    <option value="">— выбери курс —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-zinc-400">
                    Порядок (order_index) *
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={meta.orderIndex}
                    onChange={(e) =>
                      updateMeta({ orderIndex: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-zinc-400">Название *</span>
                  <input
                    value={meta.title}
                    onChange={(e) => updateMeta({ title: e.target.value })}
                    placeholder="Introduce Yourself"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-zinc-400">Slug *</span>
                  <input
                    value={meta.slug}
                    onChange={(e) =>
                      updateMeta({
                        slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }
                    placeholder="introduce-yourself"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-mono text-zinc-100 outline-none focus:border-amber-400"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs text-zinc-400">Описание</span>
                <textarea
                  value={meta.description}
                  onChange={(e) => updateMeta({ description: e.target.value })}
                  rows={2}
                  placeholder="Краткое описание урока…"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400 resize-none"
                />
              </label>
            </div>

            {/* Blocks */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Блоки контента ({blocks.length})
              </div>

              {blocks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-700 py-10 text-center text-sm text-zinc-600">
                  Нет блоков — добавь первый кнопками ниже
                </div>
              )}

              {blocks.map((block, i) => (
                <BlockCard
                  key={i}
                  block={block}
                  index={i}
                  total={blocks.length}
                  onUpdate={updateBlock}
                  onRemove={() => removeBlock(i)}
                  onMove={(dir) => moveBlock(i, dir)}
                />
              ))}
            </div>

            {/* Add block buttons */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-500 mb-3">Добавить блок:</div>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => {
                  const { label, icon, color } = BLOCK_LABELS[type];

                  return (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <span className={color}>{icon}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── BlockCard ──────────────────────────────────────── */
function BlockCard({
  block,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  block: Block;
  index: number;
  total: number;
  onUpdate: (i: number, patch: Partial<Block>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { label, icon, color } = BLOCK_LABELS[block.type];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
        <GripVertical className="w-4 h-4 text-zinc-700" />
        <span className={`${color} flex items-center gap-1.5 text-xs font-medium`}>
          {icon} {label}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="p-1 rounded-lg text-zinc-600 hover:text-zinc-300 disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            onClick={onRemove}
            className="p-1 rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <BlockFields block={block} index={index} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

/* ─── BlockFields ────────────────────────────────────── */
function BlockFields({
  block,
  index,
  onUpdate,
}: {
  block: Block;
  index: number;
  onUpdate: (i: number, patch: Partial<Block>) => void;
}) {
  const upd = (patch: Partial<Block>) => onUpdate(index, patch);

  const inputCls =
    "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400";
  const labelCls = "block space-y-1";
  const labelTextCls = "text-xs text-zinc-500";

  if (block.type === "heading") {
    return (
      <label className={labelCls}>
        <span className={labelTextCls}>Текст заголовка</span>
        <input
          value={block.text}
          onChange={(e) => upd({ text: e.target.value })}
          placeholder="Заголовок раздела…"
          className={inputCls}
        />
      </label>
    );
  }

  if (block.type === "paragraph") {
    return (
      <label className={labelCls}>
        <span className={labelTextCls}>Текст абзаца</span>
        <textarea
          value={block.text}
          onChange={(e) => upd({ text: e.target.value })}
          rows={4}
          placeholder="Содержимое параграфа…"
          className={`${inputCls} resize-none`}
        />
      </label>
    );
  }

  if (block.type === "video") {
    return (
      <div className="space-y-3">
        <label className={labelCls}>
          <span className={labelTextCls}>YouTube URL</span>
          <input
            value={block.url}
            onChange={(e) => upd({ url: e.target.value })}
            placeholder="https://youtu.be/..."
            className={inputCls}
          />
        </label>

        <label className={labelCls}>
          <span className={labelTextCls}>Заголовок видео (опционально)</span>
          <input
            value={block.title}
            onChange={(e) => upd({ title: e.target.value })}
            placeholder="Название видео…"
            className={inputCls}
          />
        </label>
      </div>
    );
  }

  if (block.type === "vocab") {
    const items = block.items;

    const updateItem = (idx: number, patch: Partial<VocabItem>) => {
      const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
      upd({ items: next });
    };

    const addItem = () =>
      upd({
        items: [...items, { word: "", translation: "", example: "" }],
      });

    const removeItem = (idx: number) =>
      upd({
        items: items.filter((_, i) => i !== idx),
      });

    return (
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 space-y-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                value={it.word}
                onChange={(e) => updateItem(idx, { word: e.target.value })}
                placeholder="Слово (EN)"
                className={inputCls}
              />
              <input
                value={it.translation}
                onChange={(e) =>
                  updateItem(idx, { translation: e.target.value })
                }
                placeholder="Перевод (RU)"
                className={inputCls}
              />
            </div>

            <div className="flex gap-2">
              <input
                value={it.example}
                onChange={(e) => updateItem(idx, { example: e.target.value })}
                placeholder="Пример предложения…"
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={() => removeItem(idx)}
                className="px-2 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Добавить слово
        </button>
      </div>
    );
  }

  if (block.type === "exercise_mcq") {
    return (
      <div className="space-y-3">
        <label className={labelCls}>
          <span className={labelTextCls}>Вопрос</span>
          <input
            value={block.question}
            onChange={(e) => upd({ question: e.target.value })}
            placeholder="Выбери правильный вариант…"
            className={inputCls}
          />
        </label>

        <div className="space-y-2">
          <span className={labelTextCls}>
            Варианты ответов (отметь правильный)
          </span>

          {block.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`mcq-answer-${index}`}
                checked={block.answerIndex === oi}
                onChange={() => upd({ answerIndex: oi })}
                className="accent-amber-400 shrink-0"
              />

              <input
                value={opt}
                onChange={(e) => {
                  const next = [...block.options];
                  next[oi] = e.target.value;
                  upd({ options: next });
                }}
                placeholder={`Вариант ${oi + 1}`}
                className={`${inputCls} flex-1`}
              />

              {block.options.length > 2 && (
                <button
                  onClick={() => {
                    const next = block.options.filter((_, i) => i !== oi);

                    let nextAnswerIndex = block.answerIndex;
                    if (oi === block.answerIndex) {
                      nextAnswerIndex = 0;
                    } else if (oi < block.answerIndex) {
                      nextAnswerIndex = block.answerIndex - 1;
                    }

                    upd({
                      options: next,
                      answerIndex: Math.max(
                        0,
                        Math.min(nextAnswerIndex, next.length - 1)
                      ),
                    });
                  }}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {block.options.length < 6 && (
            <button
              onClick={() => upd({ options: [...block.options, ""] })}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors mt-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Добавить вариант
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-500">
          ✓ Правильный:{" "}
          <span className="text-amber-400 font-medium">
            {block.options[block.answerIndex] || "(не выбран)"}
          </span>
        </div>
      </div>
    );
  }

  if (block.type === "exercise_input") {
    return (
      <div className="space-y-3">
        <label className={labelCls}>
          <span className={labelTextCls}>Задание / вопрос</span>
          <input
            value={block.prompt}
            onChange={(e) => upd({ prompt: e.target.value })}
            placeholder="Переведи слово / заполни пропуск…"
            className={inputCls}
          />
        </label>

        <label className={labelCls}>
          <span className={labelTextCls}>Правильный ответ</span>
          <input
            value={block.answer}
            onChange={(e) => upd({ answer: e.target.value })}
            placeholder="Точный ответ"
            className={inputCls}
          />
        </label>

        <label className={labelCls}>
          <span className={labelTextCls}>
            Альтернативные ответы (через запятую)
          </span>
          <input
            value={block.accept.join(", ")}
            onChange={(e) =>
              upd({
                accept: e.target.value
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="I am, I'm"
            className={inputCls}
          />
        </label>
      </div>
    );
  }

  return null;
}