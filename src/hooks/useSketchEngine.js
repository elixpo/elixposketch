"use client"

import { useEffect, useRef } from 'react'
import useSketchStore from '@/store/useSketchStore'

/**
 * Hook that initializes the SketchEngine on the provided SVG element
 * and bridges Zustand activeTool changes to the engine's window flags.
 */
export default function useSketchEngine(svgRef) {
  const engineRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current) return

    let cancelled = false

    async function initEngine() {
      try {
        const { SketchEngine } = await import('@/engine/SketchEngine')
        if (cancelled) return

        const engine = new SketchEngine(svgRef.current)
        await engine.init()
        engineRef.current = engine

        // Sync current tool immediately after init
        const currentTool = useSketchStore.getState().activeTool
        engine.setActiveTool(currentTool)
      } catch (err) {
        console.error('[useSketchEngine] Failed to initialize:', err)
      }
    }

    initEngine()

    return () => {
      cancelled = true
      if (engineRef.current) {
        engineRef.current.cleanup()
        engineRef.current = null
      }
    }
  }, [svgRef])

  // Subscribe to Zustand activeTool changes and bridge to engine
  useEffect(() => {
    const unsub = useSketchStore.subscribe(
      (state, prevState) => {
        if (state.activeTool !== prevState?.activeTool && engineRef.current) {
          engineRef.current.setActiveTool(state.activeTool)
        }
      }
    )
    return unsub
  }, [])

  return engineRef
}
