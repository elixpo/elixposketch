"use client"

import useSketchStore, { TOOLS } from '@/store/useSketchStore'
import { useState, useEffect, useCallback, useRef } from 'react'

const CATEGORIES = [
  { value: null, label: 'All', icon: 'bxs-grid-alt' },
  { value: 'tech', label: 'Tech', icon: 'bxs-chip' },
  { value: 'devops', label: 'DevOps', icon: 'bxs-server' },
]

export default function IconSidebar() {
  const activeTool = useSketchStore((s) => s.activeTool)
  const visible = activeTool === TOOLS.ICON
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [icons, setIcons] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const fetchIcons = useCallback(async (searchQuery, cat) => {
    setLoading(true)
    try {
      let q = searchQuery || ''
      if (cat && !q) q = cat
      else if (cat && q) q = `${cat} ${q}`

      const url = q ? `/api/icons/search?q=${encodeURIComponent(q)}` : `/api/icons/search?q=general`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setIcons(data.results || [])
      }
    } catch (err) {
      console.error('Icon fetch failed:', err)
    }
    setLoading(false)
  }, [])

  // Load initial icons when visible
  useEffect(() => {
    if (visible) {
      fetchIcons('', category)
    }
  }, [visible, category, fetchIcons])

  // Debounced search
  useEffect(() => {
    if (!visible) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchIcons(query, category)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, visible, category, fetchIcons])

  const handleIconClick = async (iconName) => {
    try {
      const res = await fetch(`/api/icons/serve?name=${encodeURIComponent(iconName)}`)
      if (res.ok) {
        const svgText = await res.text()
        // Set the icon to place via the global that iconTool.js reads
        if (typeof window !== 'undefined') {
          window.iconToPlace = svgText
        }
      }
    } catch (err) {
      console.error('Icon serve failed:', err)
    }
  }

  return (
    <div
      className={`absolute bottom-14 left-1/2 -translate-x-1/2 w-[340px] max-w-[92vw] bg-[#1a1a1a] border border-white/[0.08] rounded-2xl z-[999] font-[lixFont] transition-all duration-200 overflow-hidden ${
        visible
          ? 'opacity-100 pointer-events-auto translate-y-0'
          : 'opacity-0 pointer-events-none translate-y-3'
      }`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-2.5 py-1.5">
          <i className="bx bxs-search text-text-dim text-sm" />
          <input
            id="iconSearchInput"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons..."
            className="flex-1 bg-transparent text-text-secondary text-xs outline-none placeholder:text-text-dim"
            spellCheck={false}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-dim hover:text-text-muted">
              <i className="bx bxs-x-circle text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1 px-3 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value || 'all'}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all duration-150 ${
              category === cat.value
                ? 'bg-white/10 text-white'
                : 'text-text-muted hover:bg-white/[0.05] hover:text-text-primary'
            }`}
          >
            <i className={`bx ${cat.icon} text-xs`} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Icon grid */}
      <div className="px-3 pb-3 max-h-[200px] overflow-y-auto scrollbar-hide" id="iconsContainer">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-text-dim text-xs">
            <i className="bx bxs-hourglass bx-spin text-lg mr-2" />
            Loading...
          </div>
        ) : icons.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-text-dim text-xs">
            No icons found
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {icons.map((icon, i) => (
              <button
                key={icon.filename || i}
                onClick={() => handleIconClick(icon.filename)}
                title={icon.filename?.replace('.svg', '') || ''}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.08] transition-all duration-150 text-white/80 hover:text-white"
              >
                <img
                  src={`/api/icons/serve?name=${encodeURIComponent(icon.filename)}`}
                  alt=""
                  className="w-6 h-6 invert"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
