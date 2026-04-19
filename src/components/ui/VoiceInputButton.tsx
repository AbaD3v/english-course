'use client'

import { useVoiceInput } from '@/hooks/useVoiceInput'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  language?: string
  className?: string
}

export function VoiceInputButton({
  onTranscript,
  language = 'en-US',
  className = '',
}: VoiceInputButtonProps) {
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    language,
    onResult: onTranscript,
  })

  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      title={isListening ? 'Stop recording' : 'Speak your answer'}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all
        ${isListening
          ? 'bg-red-100 border-red-400 text-red-600 animate-pulse'
          : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'
        } ${className}`}
    >
      {/* Microphone SVG icon */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6 10a6 6 0 0 1-12 0H4a8 8 0 0 0 16 0h-2zm-6 9v-2a8 8 0 0 0 8-8h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 8 8v2h-3v2h6v-2h-3z"/>
      </svg>
      {isListening && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
    </button>
  )
}