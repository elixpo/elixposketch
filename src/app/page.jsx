'use client'

import Script from 'next/script'
import SketchCanvas from '../components/SketchCanvas'

export default function Home() {
  return (
    <>
      {/* CDN libraries loaded first */}
      <Script src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" type="module" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" noModule strategy="beforeInteractive" />
      <Script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/konva@9/konva.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.18/paper-full.min.js" strategy="beforeInteractive" />

      <SketchCanvas />

      {/* App scripts — order matters */}
      <Script src="/JS/imports.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/sketchGeneric.js" strategy="afterInteractive" />
      <Script src="/JS/eventListeners.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/drawCircle.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/drawSquare.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/imageTool.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/lineTool.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/canvasStroke.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/writeText.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/writeCode.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/drawArrow.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/frameHolder.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/icons.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/undoAndRedo.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/copyAndPaste.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/zoomFunction.js" strategy="afterInteractive" />
      <Script src="/JS/selection.js" type="module" strategy="afterInteractive" />
      <Script src="/JS/laserTool.js" strategy="afterInteractive" />
      <Script src="/JS/eraserTrail.js" strategy="afterInteractive" />
      <Script src="/JS/eraserTool.js" strategy="afterInteractive" />
    </>
  )
}
