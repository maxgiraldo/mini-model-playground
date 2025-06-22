import { ArrowUpIcon } from '@heroicons/react/20/solid'
import { useEffect, useRef } from 'react'
import ModelSelector from './ModelSelector'

interface Model {
  name: string
  title: string
}

interface ChatInputProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  models: Model[]
  selectedModel: Model | null
  setSelectedModel: (model: Model) => void
  isLoading: boolean
  error: Error | null
}

export default function ChatInput({
  inputValue,
  setInputValue,
  onSubmit,
  isSubmitting,
  models,
  selectedModel,
  setSelectedModel,
  isLoading,
  error,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [inputValue])

  // Focus textarea after submission completes
  useEffect(() => {
    if (!isSubmitting && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isSubmitting])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()

      // Only submit if we have content and a selected model
      if (inputValue.trim() && selectedModel && !isSubmitting) {
        const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as any
        onSubmit(formEvent)
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full" role="form">
      <div className="flex flex-col rounded-lg bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          ref={textareaRef}
          id="message"
          name="message"
          rows={1}
          placeholder="How can I help you today?"
          className="block w-full resize-none border-0 bg-transparent p-3 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm/6"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          autoFocus
        />

        <div className="flex items-center justify-between p-2 border-t border-gray-200">
          <div className="flex-1 pr-2">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="shrink-0">
            <button
              type="submit"
              aria-label="Send message"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              disabled={!inputValue.trim() || !selectedModel || isSubmitting}
            >
              <ArrowUpIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
} 