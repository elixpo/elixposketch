"use client"

import { useRef, useState, useEffect, useCallback } from 'react'
import useSketchStore, { TOOLS } from '@/store/useSketchStore'
import useSketchEngine from '@/hooks/useSketchEngine'

export default function SVGCanvas() {
  const [svgReady, setSvgReady] = useState(false)
  const svgRef = useRef(null)
  const canvasBackground = useSketchStore((s) => s.canvasBackground)
  const getCursor = useSketchStore((s) => s.getCursor)
  const cursor = getCursor()

  const [viewBox, setViewBox] = useState('0 0 1920 1080')

  useEffect(() => {
    setViewBox(`0 0 ${window.innerWidth} ${window.innerHeight}`)
    setSvgReady(true)

    const onResize = () => {
      setViewBox(`0 0 ${window.innerWidth} ${window.innerHeight}`)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close icon sidebar when clicking on canvas
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleCanvasClick = () => {
      const activeTool = useSketchStore.getState().activeTool
      if (activeTool === TOOLS.ICON) {
        useSketchStore.getState().setActiveTool(TOOLS.SELECT)
      }
    }

    svg.addEventListener('mousedown', handleCanvasClick)
    return () => svg.removeEventListener('mousedown', handleCanvasClick)
  }, [svgReady])

  // Initialize the imperative sketch engine on this SVG element
  useSketchEngine(svgRef, svgReady)

  return (
    <svg
      id="freehand-canvas"
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background: canvasBackground,
        cursor,
      }}
      viewBox={viewBox}
      suppressHydrationWarning
    />
  )
}
