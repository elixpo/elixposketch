"use client"

import useSketchStore, { TOOLS } from '@/store/useSketchStore'
import ShapeSidebar, { ToolbarButton, Divider } from './ShapeSidebar'
import { useState } from 'react'

const STROKE_COLORS = ['#fff', '#FF8383', '#3A994C', '#56A2E8', '#FFD700', '#FF69B4', '#A855F7']

const HEAD_STYLES = [
  { value: 'default', svg: '<svg width="22" height="12" viewBox="0 0 24 14"><line x1="2" y1="7" x2="16" y2="7" stroke="#fff" stroke-width="2"/><polyline points="13,2 19,7 13,12" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' },
  { value: 'square', svg: '<svg width="22" height="12" viewBox="0 0 24 14"><line x1="2" y1="7" x2="14" y2="7" stroke="#fff" stroke-width="2"/><rect x="14" y="3" width="6" height="8" fill="none" stroke="#fff" stroke-width="1.5"/></svg>' },
  { value: 'outline', svg: '<svg width="22" height="12" viewBox="0 0 24 14"><line x1="2" y1="7" x2="13" y2="7" stroke="#fff" stroke-width="2"/><polygon points="13,2 21,7 13,12" fill="none" stroke="#fff" stroke-width="1.5"/></svg>' },
  { value: 'solid', svg: '<svg width="22" height="12" viewBox="0 0 24 14"><line x1="2" y1="7" x2="13" y2="7" stroke="#fff" stroke-width="2"/><polygon points="13,2 21,7 13,12" fill="#fff"/></svg>' },
]

function SvgIcon({ svg }) {
  return <span dangerouslySetInnerHTML={{ __html: svg }} />
}

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

export default function ArrowSidebar() {
  const activeTool = useSketchStore((s) => s.activeTool)
  const [headStyle, setHeadStyle] = useState('default')
  const [strokeColor, setStrokeColor] = useState('#fff')
  const [thickness, setThickness] = useState(2)
  const [outlineStyle, setOutlineStyle] = useState('solid')
  const [arrowType, setArrowType] = useState('straight')
  const [curvature, setCurvature] = useState(8)

  return (
    <ShapeSidebar visible={activeTool === TOOLS.ARROW}>
      {/* Head style */}
      <ToolbarButton icon="bxs-right-arrow" tooltip="Arrow head">
        <p className="text-[10px] text-[#ccc] uppercase tracking-wider mb-2">Head</p>
        <div className="flex items-center gap-1">
          {HEAD_STYLES.map((h) => (
            <button key={h.value} onClick={() => setHeadStyle(h.value)}
              className={`w-10 h-8 flex items-center justify-center rounded-lg transition-all duration-100 ${headStyle === h.value ? 'bg-[#5B57D1]/20 text-[#5B57D1]' : 'text-[#ccc] hover:bg-white/[0.06]'}`}
            >
              <SvgIcon svg={h.svg} />
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton tooltip="Stroke color"
        preview={<span className="w-4 h-4 rounded-md border border-white/20" style={{ backgroundColor: strokeColor }} />}
      >
        <p className="text-[10px] text-[#ccc] uppercase tracking-wider mb-2">Stroke</p>
        <ColorGrid colors={STROKE_COLORS} selected={strokeColor} onSelect={setStrokeColor} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-edit-alt" tooltip="Stroke width">
        <p className="text-[10px] text-[#ccc] uppercase tracking-wider mb-2">Width</p>
        <div className="flex items-center gap-1">
          {[1, 2, 4, 7].map((w) => (
            <button key={w} onClick={() => setThickness(w)}
              className={`w-9 h-8 flex items-center justify-center rounded-lg transition-all duration-100 ${thickness === w ? 'bg-[#5B57D1]/20 text-[#5B57D1]' : 'text-[#ccc] hover:bg-white/[0.06]'}`}
            >
              <div className="w-5 rounded-full bg-current" style={{ height: Math.max(1, w) }} />
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      <ToolbarButton icon="bxs-minus-circle" tooltip="Stroke style">
        <p className="text-[10px] text-[#ccc] uppercase tracking-wider mb-2">Style</p>
        <div className="flex items-center gap-1">
          {[{ v: 'solid', d: '' }, { v: 'dashed', d: '6 4' }, { v: 'dotted', d: '2 3' }].map((s) => (
            <button key={s.v} onClick={() => setOutlineStyle(s.v)}
              className={`w-11 h-8 flex items-center justify-center rounded-lg transition-all duration-100 ${outlineStyle === s.v ? 'bg-[#5B57D1]/20' : 'hover:bg-white/[0.06]'}`}
            >
              <svg width="28" height="4" viewBox="0 0 28 4"><line x1="0" y1="2" x2="28" y2="2" stroke="currentColor" strokeWidth="2" strokeDasharray={s.d} strokeLinecap="round" /></svg>
            </button>
          ))}
        </div>
      </ToolbarButton>

      <Divider />

      {/* Arrow type */}
      <ToolbarButton icon="bxs-share-alt" tooltip="Arrow type">
        <p className="text-[10px] text-[#ccc] uppercase tracking-wider mb-2">Type</p>
        <div className="flex flex-col gap-0.5">
          {[
            { v: 'straight', i: 'bxs-right-arrow-alt', l: 'Straight' },
            { v: 'curved', i: 'bxs-analyse', l: 'Curved' },
            { v: 'elbow', i: 'bxs-network-chart', l: 'Elbow' },
          ].map((a) => (
            <button key={a.v} onClick={() => setArrowType(a.v)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all duration-100 ${arrowType === a.v ? 'bg-[#5B57D1] text-white' : 'text-[#aaa] hover:bg-white/[0.06]'}`}
            >
              <i className={`bx ${a.i} text-sm`} /> {a.l}
            </button>
          ))}
          {arrowType === 'curved' && (
            <>
              <div className="w-full h-px bg-white/[0.08] my-1" />
              <p className="text-[9px] text-[#666] uppercase tracking-wider mb-1">Curvature</p>
              <div className="flex items-center gap-1">
                {[{ v: 8, l: 'Lo' }, { v: 20, l: 'Md' }, { v: 40, l: 'Hi' }].map((c) => (
                  <button key={c.v} onClick={() => setCurvature(c.v)}
                    className={`flex-1 py-1 rounded-md text-[10px] text-center transition-all duration-100 ${curvature === c.v ? 'bg-[#5B57D1]/20 text-[#5B57D1]' : 'text-[#ccc] hover:bg-white/[0.06]'}`}
                  >{c.l}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </ToolbarButton>
    </ShapeSidebar>
  )
}
