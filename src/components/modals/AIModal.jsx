"use client"

import { useState } from 'react'
import useUIStore from '@/store/useUIStore'

export default function AIModal() {
  const aiModalOpen = useUIStore((s) => s.aiModalOpen)
  const toggleAIModal = useUIStore((s) => s.toggleAIModal)

  const [mode, setMode] = useState('describe')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!aiModalOpen) return null

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode: mode === 'describe' ? 'text' : 'mermaid',
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed')
        return
      }

      // Render diagram on canvas
      if (window.__aiRenderer && data.diagram) {
        window.__aiRenderer(data.diagram)
      }

      // Close modal and reset
      setPrompt('')
      setError(null)
      toggleAIModal()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center font-[lixFont]"
      onClick={toggleAIModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface-card border border-border-light rounded-2xl p-6 w-[480px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-primary text-base font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
            AI Diagram
          </h2>
          <button
            onClick={toggleAIModal}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
          >
            <i className="bx bx-x text-xl" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 mb-4 bg-surface-dark rounded-lg p-1">
          <button
            onClick={() => setMode('describe')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs transition-all duration-200 ${
              mode === 'describe'
                ? 'bg-surface-active text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Describe
          </button>
          <button
            onClick={() => setMode('mermaid')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs transition-all duration-200 ${
              mode === 'mermaid'
                ? 'bg-surface-active text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Mermaid
          </button>
        </div>

        {/* Input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'describe'
              ? 'Describe a diagram... e.g. "User authentication flow with login, 2FA, and dashboard"'
              : 'Paste Mermaid syntax... e.g.\ngraph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Action]\n  B -->|No| D[End]'
          }
          className="w-full h-32 bg-surface-dark border border-border rounded-xl px-4 py-3 text-text-primary text-sm resize-none focus:outline-none focus:border-accent-blue placeholder:text-text-dim"
          autoFocus
        />

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-text-dim text-[10px]">Ctrl+Enter to generate</span>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              !prompt.trim() || loading
                ? 'bg-surface-hover text-text-dim cursor-not-allowed'
                : 'bg-accent-blue text-white hover:bg-accent-blue/80'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
