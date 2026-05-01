'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import useSketchStore from '@/store/useSketchStore'

const STORAGE_KEY = 'lixsketch-split-ratio'
const MIN_RATIO = 0.35
const MAX_RATIO = 0.65

export default function SplitLayout({ canvas, docs }) {
  const layoutMode = useSketchStore((s) => s.layoutMode)
  const [ratio, setRatio] = useState(0.5)
  const containerRef = useRef(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    try {
      const saved = parseFloat(localStorage.getItem(STORAGE_KEY))
      if (saved >= MIN_RATIO && saved <= MAX_RATIO) setRatio(saved)
    } catch {}
  }, [])

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      let r = (e.clientX - rect.left) / rect.width
      if (r < MIN_RATIO) r = MIN_RATIO
      if (r > MAX_RATIO) r = MAX_RATIO
      setRatio(r)
    }
    const onUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      try { localStorage.setItem(STORAGE_KEY, String(ratio)) } catch {}
      window.dispatchEvent(new Event('resize'))
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [ratio])

  // Whenever layout flips, fire a resize so canvas re-measures viewport.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
    return () => cancelAnimationFrame(id)
  }, [layoutMode])

  if (layoutMode === 'canvas') {
    return <div className="absolute inset-0">{canvas}</div>
  }
  if (layoutMode === 'docs') {
    return <div className="absolute inset-0 pt-12">{docs}</div>
  }

  // split
  const leftPct = `${ratio * 100}%`
  const rightPct = `${(1 - ratio) * 100}%`
  return (
    <div ref={containerRef} className="absolute inset-0 pt-12 flex">
      <div style={{ width: leftPct }} className="relative h-full overflow-hidden">
        {canvas}
      </div>
      <div
        onMouseDown={onMouseDown}
        className="w-[6px] h-full bg-border-light hover:bg-accent-blue/40 cursor-col-resize shrink-0 transition-colors"
        title="Drag to resize"
      />
      <div style={{ width: rightPct }} className="relative h-full overflow-hidden border-l border-border-light">
        {docs}
      </div>
    </div>
  )
}
