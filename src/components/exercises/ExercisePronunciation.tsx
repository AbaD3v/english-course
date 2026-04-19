'use client'

import { useState } from 'react'
import { Mic, MicOff, RotateCcw } from 'lucide-react'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { scorePronunciation, type PronunciationResult } from '@/lib/pronunciationScore'
import { PronunciationResultDisplay } from './PronunciationResult'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function ExercisePronunciation({
  prompt,
  phrase,
  onResult,
}: {
  prompt: string       // "Произнеси вслух:"
  phrase: string       // эталонная фраза
  onResult?: (correct: boolean) => void
}) {
  const [result, setResult] = useState<PronunciationResult | null>(null)
  const [attempts, setAttempts] = useState(0)

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    language: 'en-US',
    onResult: (transcript) => {
      const r = scorePronunciation(transcript, phrase)
      setResult(r)
      setAttempts((a) => a + 1)
      // Считаем верным если score >= 80
      onResult?.(r.score >= 80)
    },
  })

  function reset() {
    setResult(null)
    onResult?.(false)
  }

  if (!isSupported) {
    return (
      <Card className="rounded-2xl border border-app bg-card p-5">
        <p className="text-sm text-secondary">
          Твой браузер не поддерживает голосовой ввод. Попробуй Chrome или Edge.
        </p>
      </Card>
    )
  }

  return (
    <Card className="noise rounded-2xl border border-app bg-card p-0 backdrop-blur-sm">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Badge variant="muted">Exercise</Badge>
          <Badge variant="muted">Speaking</Badge>
          {attempts > 0 && (
            <Badge variant="muted">Попытка {attempts}</Badge>
          )}
        </div>

        {/* Prompt */}
        <div className="text-sm text-secondary">{prompt}</div>

        {/* Эталонная фраза */}
        <div className="rounded-2xl border border-app bg-soft px-5 py-4">
          <div className="text-xl font-semibold tracking-tight text-primary">
            {phrase}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={isListening ? stopListening : startListening}
            className="gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 text-red-500" />
                Остановить
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                {result ? 'Попробовать снова' : 'Говорить'}
              </>
            )}
          </Button>

          {result && (
            <Button
              type="button"
              variant="secondary"
              onClick={reset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Сброс
            </Button>
          )}

          {isListening && (
            <span className="flex items-center gap-1.5 text-sm text-red-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Слушаю…
            </span>
          )}
        </div>

        {/* Результат */}
        {result && <PronunciationResultDisplay result={result} />}
      </div>
    </Card>
  )
}
