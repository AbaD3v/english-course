// src/components/lesson/LessonVideo.tsx
"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

function extractYouTubeId(url: string) {
  const reg =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(reg);
  return match?.[1] ?? null;
}

export function LessonVideo({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  const videoId = extractYouTubeId(url);

  if (!videoId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {title && (
        <div className="flex items-center gap-2 text-lg font-semibold">
          <PlayCircle className="w-5 h-5 text-red-500" />
          {title}
        </div>
      )}

      <div className="relative w-full overflow-hidden rounded-3xl border border-black/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="relative pt-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title ?? "Lesson video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    </motion.div>
  );
}