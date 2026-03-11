'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all duration-200 cursor-pointer ${
        copied
          ? 'bg-green-500/20 text-green-400'
          : 'bg-white/5 text-[#444480] hover:text-white hover:bg-white/10'
      }`}
    >
      <i className={`bx ${copied ? 'bx-check' : 'bx-copy'} text-xs`} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ── RoughJS heading underline (drawn on a canvas element) ─────────────────────
function RoughHeadingLine({ width = 200, color = '#5B57D1', roughness = 2 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let mounted = true

    async function draw() {
      const rough = (await import('roughjs')).default
      if (!mounted) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = 6 * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = '6px'

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      const rc = rough.canvas(canvas)
      rc.line(0, 3, width, 3, {
        stroke: color,
        strokeWidth: 1.2,
        roughness,
        bowing: 1,
      })
    }

    draw()
    return () => { mounted = false }
  }, [width, color, roughness])

  return <canvas ref={canvasRef} className="block mt-1.5 mb-3" />
}

function RoughBlockquote({ children }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let mounted = true

    async function draw() {
      const rough = (await import('roughjs')).default
      if (!mounted) return

      const h = container.offsetHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = 8 * dpr
      canvas.height = h * dpr
      canvas.style.width = '8px'
      canvas.style.height = h + 'px'

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      const rc = rough.canvas(canvas)
      rc.line(4, 2, 4, h - 2, {
        stroke: '#5B57D1',
        strokeWidth: 2,
        roughness: 1.8,
        bowing: 0.5,
      })
    }

    const timer = setTimeout(draw, 30)
    return () => { mounted = false; clearTimeout(timer) }
  }, [])

  return (
    <div ref={containerRef} className="relative flex items-start my-5">
      <canvas ref={canvasRef} className="flex-shrink-0 mr-4" />
      <div className="text-[#a0a0b0] text-sm leading-relaxed italic font-[lixFont]">
        {children}
      </div>
    </div>
  )
}

// ── RoughJS list bullet ───────────────────────────────────────────────────────
function RoughBullet() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let mounted = true

    async function draw() {
      const rough = (await import('roughjs')).default
      if (!mounted) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = 10 * dpr
      canvas.height = 10 * dpr
      canvas.style.width = '10px'
      canvas.style.height = '10px'

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      const rc = rough.canvas(canvas)
      rc.circle(5, 5, 6, {
        stroke: '#5B57D1',
        strokeWidth: 1,
        roughness: 2,
        fill: '#5B57D1',
        fillStyle: 'solid',
      })
    }

    draw()
    return () => { mounted = false }
  }, [])

  return <canvas ref={canvasRef} className="flex-shrink-0 mt-1.5" />
}

function LixScriptBlock({ code }) {
  const [tab, setTab] = useState('preview')
  const [svgMarkup, setSvgMarkup] = useState(null)
  const [parseError, setParseError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const { parseLixScript, previewLixScript } = await import('@/engine/core/LixScriptParser')
        const parsed = parseLixScript(code)
        if (cancelled) return

        if (parsed.errors && parsed.errors.length > 0) {
          setParseError(true)
          return
        }

        const svg = previewLixScript(parsed)
        if (!cancelled && svg) {
          setSvgMarkup(svg)
        }
      } catch {
        if (!cancelled) setParseError(true)
      }
    }

    render()
    return () => { cancelled = true }
  }, [code])

  const showPreview = tab === 'preview' && svgMarkup && !parseError

  return (
    <div className="my-6 rounded-xl border border-[#5B57D1]/25 overflow-hidden bg-[#0d1117]">
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#5B57D1]/5 border-b border-[#5B57D1]/15">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer font-[lixFont] ${
              tab === 'preview'
                ? 'bg-[#8B88E8]/15 text-[#8B88E8]'
                : 'text-[#444480] hover:text-[#a0a0b0]'
            }`}
          >
            <i className="bx bx-show text-sm" />
            Preview
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer font-[lixFont] ${
              tab === 'code'
                ? 'bg-[#8B88E8]/15 text-[#8B88E8]'
                : 'text-[#444480] hover:text-[#a0a0b0]'
            }`}
          >
            <i className="bx bx-code-alt text-sm" />
            Code
          </button>
        </div>
        <CopyButton text={code} />
      </div>

      {showPreview && (
        <div
          className="bg-[#0a0a12] p-6 flex items-center justify-center min-h-48 overflow-auto"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      )}

      {tab === 'preview' && !svgMarkup && !parseError && (
        <div className="bg-[#0a0a12] p-8 flex items-center justify-center min-h-48">
          <div className="flex items-center gap-2 text-[#444480] text-xs font-[lixFont]">
            <div className="w-4 h-4 border border-[#5B57D1]/40 border-t-transparent rounded-full animate-spin" />
            Rendering diagram...
          </div>
        </div>
      )}

      {tab === 'preview' && parseError && (
        <div className="bg-[#0a0a12] p-8 flex items-center justify-center min-h-48">
          <div className="text-center text-[#444480] text-xs font-[lixFont]">
            <i className="bx bx-shape-square text-2xl text-[#5B57D1]/30 mb-2" />
            <p>Preview unavailable — switch to Code tab to view the LixScript source.</p>
          </div>
        </div>
      )}

      {tab === 'code' && (
        <pre className="p-4 overflow-x-auto bg-[#0d0d14] max-h-96 overflow-y-auto docs-scroll select-text">
          <code className="text-[#c9d1d9] text-sm font-[lixCode] leading-relaxed">{code}</code>
        </pre>
      )}
    </div>
  )
}

// ── Canvas-style code block (matches #161b22 bg, #30363d border like real canvas) ─
function CodeFenceBlock({ code, language }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let mounted = true

    async function draw() {
      const rough = (await import('roughjs')).default
      if (!mounted) return

      const dpr = window.devicePixelRatio || 1
      const w = container.offsetWidth
      const h = container.offsetHeight

      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      const rc = rough.canvas(canvas)

      // Hand-drawn border around the code block (like canvas code element)
      rc.rectangle(1, 1, w - 2, h - 2, {
        stroke: '#30363d',
        strokeWidth: 1,
        roughness: 1.2,
        bowing: 0.5,
        fill: '#161b22',
        fillStyle: 'solid',
      })
    }

    const timer = setTimeout(draw, 30)
    return () => { mounted = false; clearTimeout(timer) }
  }, [])

  return (
    <div ref={containerRef} className="relative my-5 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#30363d]/50">
          <span className="text-[#444480] text-[10px] font-[lixCode] uppercase">{language || 'code'}</span>
          <CopyButton text={code} />
        </div>
        <pre className="p-4 overflow-x-auto max-h-96 overflow-y-auto docs-scroll select-text">
          <code className="text-[#c9d1d9] text-sm font-[lixCode] leading-relaxed">{code}</code>
        </pre>
      </div>
    </div>
  )
}

/**
 * Canvas-styled markdown renderer.
 * Text uses lixFont, backgrounds match the canvas dark theme,
 * headings get RoughJS underlines, code blocks look like canvas code elements.
 */
export default function MarkdownRenderer({ content, canvasStyle }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let i = 0
  let skippedTitle = false

  // Use canvas colors when canvasStyle is set
  const textColor = canvasStyle ? 'text-[#c9d1d9]' : 'text-text-muted'
  const headingColor = canvasStyle ? 'text-white' : 'text-text-primary'
  const font = canvasStyle ? 'font-[lixFont]' : ''

  while (i < lines.length) {
    const line = lines[i]

    // Code fence
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```

      const code = codeLines.join('\n')

      if (lang === 'lixscript') {
        elements.push(<LixScriptBlock key={elements.length} code={code} />)
      } else {
        elements.push(<CodeFenceBlock key={elements.length} code={code} language={lang} />)
      }
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      elements.push(
        canvasStyle
          ? <div key={elements.length} className="my-8"><RoughHeadingLine width={600} color="#30363d" roughness={1.5} /></div>
          : <hr key={elements.length} className="border-white/[0.06] my-8" />
      )
      i++
      continue
    }

    // Skip the first H1
    if (line.startsWith('# ') && !skippedTitle) {
      skippedTitle = true
      i++
      continue
    }

    // Headings — with RoughJS underlines in canvas mode
    if (line.startsWith('# ')) {
      elements.push(
        <div key={elements.length} className="mt-10">
          <h1 className={`text-2xl font-semibold ${headingColor} ${font}`}>
            {renderInline(line.slice(2), canvasStyle)}
          </h1>
          {canvasStyle && <RoughHeadingLine width={240} color="#8B88E8" />}
          {!canvasStyle && <div className="mb-4" />}
        </div>
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <div key={elements.length} className="mt-8">
          <h2 className={`text-xl font-semibold ${headingColor} ${font}`}>
            {renderInline(line.slice(3), canvasStyle)}
          </h2>
          {canvasStyle && <RoughHeadingLine width={180} color="#D99BF0" roughness={2.5} />}
          {!canvasStyle && <div className="mb-3" />}
        </div>
      )
      i++
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <div key={elements.length} className="mt-6">
          <h3 className={`text-base font-medium ${headingColor} ${font}`}>
            {renderInline(line.slice(4), canvasStyle)}
          </h3>
          {canvasStyle && <RoughHeadingLine width={120} color="#6B6BA0" roughness={3} />}
          {!canvasStyle && <div className="mb-2" />}
        </div>
      )
      i++
      continue
    }

    // Blockquote — with RoughJS left border
    if (line.startsWith('> ')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      if (canvasStyle) {
        elements.push(
          <RoughBlockquote key={elements.length}>
            {quoteLines.map((ql, qi) => <p key={qi}>{renderInline(ql, canvasStyle)}</p>)}
          </RoughBlockquote>
        )
      } else {
        elements.push(
          <blockquote key={elements.length} className="border-l-2 border-accent-blue/40 pl-4 my-5 text-text-muted text-sm leading-relaxed italic">
            {quoteLines.map((ql, qi) => <p key={qi}>{renderInline(ql, canvasStyle)}</p>)}
          </blockquote>
        )
      }
      continue
    }

    // Unordered list — with RoughJS bullets
    if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={elements.length} className="list-none space-y-2 my-4">
          {items.map((item, ii) => (
            <li key={ii} className={`flex items-start gap-2.5 ${textColor} text-sm leading-relaxed ${font}`}>
              {canvasStyle ? <RoughBullet /> : <span className="text-accent-blue mt-1.5 text-[6px]">&#x25CF;</span>}
              <span>{renderInline(item, canvasStyle)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={elements.length} className="list-none space-y-2 my-4">
          {items.map((item, ii) => (
            <li key={ii} className={`flex items-start gap-2.5 ${textColor} text-sm leading-relaxed ${font}`}>
              <span className="text-[#8B88E8] text-xs font-medium min-w-4 mt-0.5 font-[lixFont]">{ii + 1}.</span>
              <span>{renderInline(item, canvasStyle)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Paragraph — canvas text style
    elements.push(
      <p key={elements.length} className={`${textColor} text-sm leading-relaxed my-3 ${font}`}>
        {renderInline(line, canvasStyle)}
      </p>
    )
    i++
  }

  return <div className="blog-content">{elements}</div>
}

/**
 * Render inline markdown: **bold**, *italic*, `code`, [links](url)
 */
function renderInline(text, canvasStyle) {
  if (!text) return text

  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    let match = remaining.match(/\*\*(.+?)\*\*/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(
        <strong key={key++} className={canvasStyle ? 'text-white font-medium font-[lixFont]' : 'text-text-primary font-medium'}>
          {match[1]}
        </strong>
      )
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // Italic
    match = remaining.match(/\*(.+?)\*/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(
        <em key={key++} className={canvasStyle ? 'text-[#c9d1d9] italic font-[lixFont]' : 'text-text-secondary italic'}>
          {match[1]}
        </em>
      )
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // Inline code — canvas code block mini style
    match = remaining.match(/`(.+?)`/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(
        <code key={key++} className={
          canvasStyle
            ? 'font-[lixCode] text-[#8B88E8] text-xs bg-[#161b22] border border-[#30363d] px-1.5 py-0.5 rounded'
            : 'font-[lixCode] text-accent-blue text-xs bg-accent-blue/10 px-1.5 py-0.5 rounded'
        }>
          {match[1]}
        </code>
      )
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // Link
    match = remaining.match(/\[(.+?)\]\((.+?)\)/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(
        <a key={key++} href={match[2]}
          className={canvasStyle ? 'text-[#8B88E8] hover:underline font-[lixFont]' : 'text-accent-blue hover:underline'}
          target={match[2].startsWith('http') ? '_blank' : undefined}
          rel={match[2].startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {match[1]}
        </a>
      )
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // No more matches
    parts.push(remaining)
    break
  }

  return parts
}
