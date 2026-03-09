"use client"

import useSketchStore, { TOOLS } from '@/store/useSketchStore'
import ShapeSidebar, { ToolbarButton, Divider } from './ShapeSidebar'
import { useState, useCallback, useEffect } from 'react'

export default function FrameSidebar() {
  const activeTool = useSketchStore((s) => s.activeTool)
  const selectedShapeSidebar = useSketchStore((s) => s.selectedShapeSidebar)
  const [frameName, setFrameName] = useState('Frame 1')

  // Sync name from the actual selected frame when sidebar opens
  useEffect(() => {
    if (selectedShapeSidebar === 'frame' || activeTool === TOOLS.FRAME) {
      const shape = window.currentShape
      if (shape && shape.shapeName === 'frame' && shape.frameName) {
        setFrameName(shape.frameName)
      }
    }
  }, [selectedShapeSidebar, activeTool])

  const updateName = useCallback((e) => {
    const name = e.target.value
    setFrameName(name)
    // Update the actual selected frame
    const shape = window.currentShape
    if (shape && shape.shapeName === 'frame') {
      shape.frameName = name
      shape.draw()
    }
  }, [])

  const resizeToFit = useCallback(() => {
    const shape = window.currentShape
    if (shape && shape.shapeName === 'frame' && typeof shape.resizeToFitContents === 'function') {
      shape.resizeToFitContents()
    }
  }, [])

  return (
    <ShapeSidebar visible={activeTool === TOOLS.FRAME || selectedShapeSidebar === 'frame'}>
      <ToolbarButton icon="bxs-rename" tooltip="Frame name">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Name</p>
        <input
          type="text"
          value={frameName}
          onChange={updateName}
          className="w-32 px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-xs outline-none focus:border-[#5B57D1]/50 transition-all duration-150 font-[lixFont]"
          spellCheck={false}
        />
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-expand" tooltip="Actions">
        <button onClick={resizeToFit} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-secondary text-xs hover:bg-white/[0.06] hover:text-white transition-all duration-100">
          <i className="bx bxs-expand text-sm" />
          Resize to Fit
        </button>
      </ToolbarButton>
    </ShapeSidebar>
  )
}
