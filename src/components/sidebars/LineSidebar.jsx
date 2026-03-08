"use client"

import useSketchStore, { TOOLS } from '@/store/useSketchStore'
import ShapeSidebar, { ToolbarButton, Divider } from './ShapeSidebar'
import { useState } from 'react'

const STROKE_COLORS = ['#fff', '#FF8383', '#3A994C', '#56A2E8', '#FFD700', '#FF69B4', '#A855F7']

function ColorGrid({ colors, selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {colors.map((c) => (
        <button key={c} onClick={() => onSelect(c)}
          className={`w-7 h-7 rounded-md border-[1.5px] transition-all duration-100 ${selected === c ? 'border-[#5B57D1] scale-110' : 'border-white/[0.08] hover:border-white/20'}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

export default function LineSidebar() {
  const activeTool = useSketchStore((s) => s.activeTool)
  const [strokeColor, setStrokeColor] = useState('#fff')
  const [thickness, setThickness] = useState(2)
  const [lineStyle, setLineStyle] = useState('solid')
  const [sloppiness, setSloppiness] = useState(0)
  const [edge, setEdge] = useState('smooth')

  return (
    <ShapeSidebar visible={activeTool === TOOLS.LINE}>
      <ToolbarButton tooltip="Stroke color"
        preview={<span className="w-4 h-4 rounded-md border border-white/20" style={{ backgroundColor: strokeColor }} />}
      >
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Stroke</p>
        <ColorGrid colors={STROKE_COLORS} selected={strokeColor} onSelect={setStrokeColor} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-edit-alt" tooltip="Stroke width">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Width</p>
        <div className="flex items-center gap-1">
          {[1, 2, 4, 7].map((w) => (
            <button key={w} onClick={() => setThickness(w)}
              className={`w-9 h-8 flex items-center justify-center rounded-lg transition-all duration-100 ${thickness === w ? 'bg-[#5B57D1]/20 text-[#5B57D1]' : 'text-[#888] hover:bg-white/[0.06]'}`}
            >
              <div className="w-5 rounded-full bg-current" style={{ height: Math.max(1, w) }} />
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-minus-circle" tooltip="Stroke style">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Style</p>
        <div className="flex items-center gap-1">
          {[{ v: 'solid', d: '' }, { v: 'dashed', d: '6 4' }, { v: 'dotted', d: '2 3' }].map((s) => (
            <button key={s.v} onClick={() => setLineStyle(s.v)}
              className={`w-11 h-8 flex items-center justify-center rounded-lg transition-all duration-100 ${lineStyle === s.v ? 'bg-[#5B57D1]/20' : 'hover:bg-white/[0.06]'}`}
            >
              <svg width="28" height="4" viewBox="0 0 28 4"><line x1="0" y1="2" x2="28" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray={s.d} strokeLinecap="round" /></svg>
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-shape-polygon" tooltip="Sloppiness">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Sloppiness</p>
        <div className="flex items-center gap-1">
          {[{ v: 0, l: '0' }, { v: 2, l: '2' }, { v: 4, l: '4' }].map((s) => (
            <button key={s.v} onClick={() => setSloppiness(s.v)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] transition-all duration-100 ${sloppiness === s.v ? 'bg-[#5B57D1]/20 text-[#5B57D1]' : 'text-[#888] hover:bg-white/[0.06]'}`}
            >{s.l}</button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-landscape" tooltip="Edge">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Edge</p>
        <div className="flex flex-col gap-0.5">
          {[{ v: 'smooth', i: 'bxs-droplet', l: 'Smooth' }, { v: 'rough', i: 'bxs-bolt', l: 'Rough' }].map((e) => (
            <button key={e.v} onClick={() => setEdge(e.v)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all duration-100 ${edge === e.v ? 'bg-[#5B57D1] text-white' : 'text-[#aaa] hover:bg-white/[0.06]'}`}
            >
              <i className={`bx ${e.i} text-sm`} /> {e.l}
            </button>
          ))}
        </div>
      </ToolbarButton>
    </ShapeSidebar>
  )
}
