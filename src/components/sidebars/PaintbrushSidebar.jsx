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

export default function PaintbrushSidebar() {
  const activeTool = useSketchStore((s) => s.activeTool)
  const [strokeColor, setStrokeColor] = useState('#fff')
  const [thickness, setThickness] = useState(2)
  const [lineStyle, setLineStyle] = useState('solid')
  const [taper, setTaper] = useState('uniform')
  const [roughness, setRoughness] = useState('smooth')
  const [opacity, setOpacity] = useState(1)

  return (
    <ShapeSidebar visible={activeTool === TOOLS.FREEHAND}>
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

      <ToolbarButton icon="bxs-pen" tooltip="Taper">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Taper</p>
        <div className="flex flex-col gap-0.5">
          {[
            { v: 'uniform', i: 'bxs-minus-circle', l: 'Uniform' },
            { v: 'pen', i: 'bxs-pen', l: 'Pen' },
            { v: 'brush', i: 'bxs-brush', l: 'Brush' },
          ].map((t) => (
            <button key={t.v} onClick={() => setTaper(t.v)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all duration-100 ${taper === t.v ? 'bg-[#5B57D1] text-white' : 'text-[#aaa] hover:bg-white/[0.06]'}`}
            >
              <i className={`bx ${t.i} text-sm`} /> {t.l}
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-shape-polygon" tooltip="Roughness">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Roughness</p>
        <div className="flex flex-col gap-0.5">
          {[
            { v: 'smooth', i: 'bxs-droplet', l: 'Smooth' },
            { v: 'medium', i: 'bxs-leaf', l: 'Medium' },
            { v: 'rough', i: 'bxs-bolt', l: 'Rough' },
          ].map((r) => (
            <button key={r.v} onClick={() => setRoughness(r.v)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all duration-100 ${roughness === r.v ? 'bg-[#5B57D1] text-white' : 'text-[#aaa] hover:bg-white/[0.06]'}`}
            >
              <i className={`bx ${r.i} text-sm`} /> {r.l}
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-sun" tooltip="Opacity">
        <p className="text-[10px] text-[#888] uppercase tracking-wider mb-2">Opacity {Math.round(opacity * 100)}%</p>
        <input
          type="range" min="0" max="1" step="0.05" value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-28 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#5B57D1]"
        />
      </ToolbarButton>
    </ShapeSidebar>
  )
}
