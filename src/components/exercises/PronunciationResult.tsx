'use client'

import { motion } from 'framer-motion'
import { cn } from '@/components/ui/cn'
import type { PronunciationResult } from '@/lib/pronunciationScore'

export function PronunciationResultDisplay({ result }: { result: PronunciationResult }) {
  const { score, wordResults, perfect } = result

  const scoreColor =
    score >= 90 ? 'text-emerald-600' :
    score >= 70 ? 'text-amber-600' :
                  'text-red-600'

  const scoreBg =
    score >= 90 ? 'bg-emerald-500' :
    score >= 70 ? 'bg-amber-500' :
                  'bg-red-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-app bg-soft p-4 space-y-4"
    >
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className={cn('text-3xl font-semibold tabular-nums', scoreColor)}>
          {score}%
        </div>
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-app overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', scoreBg)}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </div>
          <div className="mt-1 text-xs text-secondary">
            {perfect
              ? 'Отлично! Произношение идеальное.'
              : score >= 90
              ? 'Почти идеально — совсем чуть-чуть не хватает.'
              : score >= 70
              ? 'Хорошо, но есть что подтянуть.'
              : 'Попробуй ещё раз — практика помогает!'}
          </div>
        </div>
      </div>

      {/* Пословный разбор */}
      {!perfect && (
        <div>
          <div className="mb-2 text-xs font-medium text-secondary uppercase tracking-wide">
            Разбор по словам
          </div>
          <div className="flex flex-wrap gap-2">
            {wordResults.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-sm font-medium',
                    w.correct
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'bg-red-500/10 text-red-700'
                  )}
                >
                  {w.word}
                </span>
                {!w.correct && w.spoken && (
                  <span className="text-xs text-secondary">
                    ← "{w.spoken}"
                  </span>
                )}
                {!w.correct && !w.spoken && (
                  <span className="text-xs text-secondary">пропущено</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}