import { useState, useEffect, useRef, useCallback } from 'react'

// Объявляем типы для Web Speech API, которых нет в стандартных lib.dom.d.ts
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event & { error: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

// ─────────────────────────────────────────────

interface UseVoiceInputOptions {
  language?: string
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useVoiceInput({
  language = 'en-US',
  onResult,
  onError,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    setIsSupported(!!SpeechRecognition)
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript
      setTranscript(result)
      onResult?.(result)
    }

    recognition.onerror = (event: Event & { error: string }) => {
      setIsListening(false)
      onError?.(event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [language])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    setTranscript('')
    recognitionRef.current.start()
    setIsListening(true)
  }, [isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return { isListening, isSupported, transcript, startListening, stopListening, resetTranscript }
}