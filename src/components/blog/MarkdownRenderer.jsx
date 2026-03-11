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
          : 'bg-white/5 text-text-dim hover:text-text-primary hover:bg-white/10'
      }`}
    >
      <i className={`bx ${copied ? 'bx-check' : 'bx-copy'} text-xs`} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function LixScriptBlock({ code }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // If the sketch engine is loaded, try to render a preview
    // Otherwise, just show the code
    if (typeof window !== 'undefined' && window.__lixscriptPreview) {
      try {
        const svgMarkup = window.__lixscriptPreview(code)
        if (canvasRef.current && svgMarkup) {
          canvasRef.current.innerHTML = svgMarkup
        }
      } catch (e) {
        // Silently fail — just show the code
      }
    }
  }, [code])

  return (
    <div className="my-6 rounded-xl border border-accent-blue/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-accent-blue/5 border-b border-accent-blue/10">
        <div className="flex items-center gap-2">
          <i className="bx bx-shape-square text-accent-blue text-sm" />
          <span className="text-accent-blue text-xs font-medium">LixScript Diagram</span>
        </div>
        <CopyButton text={code} />
      </div>
      <div ref={canvasRef} className="hidden" />
      <pre className="p-4 overflow-x-auto bg-[#0d0d14]">
        <code className="text-text-secondary text-sm font-[lixCode] leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

function CodeFenceBlock({ code, language }) {
  return (
    <div className="my-5 rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="text-text-dim text-[10px] font-[lixCode] uppercase">{language || 'code'}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto bg-[#0d0d14]">
        <code className="text-text-secondary text-sm font-[lixCode] leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

/**
 * Simple markdown-to-JSX renderer.
 * Handles: headings, paragraphs, bold, italic, inline code, code fences (with
 * special LixScript rendering), unordered/ordered lists, blockquotes, links, hrs.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let i = 0

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
      elements.push(<hr key={elements.length} className="border-white/[0.06] my-8" />)
      i++
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={elements.length} className="text-2xl font-semibold text-text-primary mt-10 mb-4 first:mt-0">
          {renderInline(line.slice(2))}
        </h1>
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={elements.length} className="text-xl font-semibold text-text-primary mt-8 mb-3">
          {renderInline(line.slice(3))}
        </h2>
      )
      i++
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={elements.length} className="text-base font-medium text-text-primary mt-6 mb-2">
          {renderInline(line.slice(4))}
        </h3>
      )
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <blockquote key={elements.length} className="border-l-2 border-accent-blue/40 pl-4 my-5 text-text-muted text-sm leading-relaxed italic">
          {quoteLines.map((ql, qi) => <p key={qi}>{renderInline(ql)}</p>)}
        </blockquote>
      )
      continue
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={elements.length} className="list-none space-y-1.5 my-4">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-text-secondary text-sm leading-relaxed">
              <span className="text-accent-blue mt-1.5 text-[6px]">●</span>
              <span>{renderInline(item)}</span>
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
        <ol key={elements.length} className="list-none space-y-1.5 my-4 counter-reset-list">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2.5 text-text-secondary text-sm leading-relaxed">
              <span className="text-accent-blue text-xs font-medium min-w-4 mt-0.5">{ii + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Paragraph
    elements.push(
      <p key={elements.length} className="text-text-secondary text-sm leading-relaxed my-3">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return <div className="blog-content">{elements}</div>
}

/**
 * Render inline markdown: **bold**, *italic*, `code`, [links](url)
 */
function renderInline(text) {
  if (!text) return text

  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    let match = remaining.match(/\*\*(.+?)\*\*/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(<strong key={key++} className="text-text-primary font-medium">{match[1]}</strong>)
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // Italic
    match = remaining.match(/\*(.+?)\*/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(<em key={key++} className="text-text-muted italic">{match[1]}</em>)
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // Inline code
    match = remaining.match(/`(.+?)`/)
    if (match && match.index !== undefined) {
      if (match.index > 0) parts.push(remaining.slice(0, match.index))
      parts.push(
        <code key={key++} className="font-[lixCode] text-accent-blue text-xs bg-accent-blue/10 px-1.5 py-0.5 rounded">
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
        <a key={key++} href={match[2]} className="text-accent-blue hover:underline" target={match[2].startsWith('http') ? '_blank' : undefined} rel={match[2].startsWith('http') ? 'noopener noreferrer' : undefined}>
          {match[1]}
        </a>
      )
      remaining = remaining.slice(match.index + match[0].length)
      continue
    }

    // No more matches — push the rest
    parts.push(remaining)
    break
  }

  return parts
}
