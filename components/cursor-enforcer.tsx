'use client'

import { useEffect } from 'react'

const CURSOR_URL = '/pink-cursor.png'
const CURSOR_STYLE = `url('${CURSOR_URL}') 16 16, auto`

export function CursorEnforcer() {
  useEffect(() => {
    // Function to force cursor on all elements
    const forceCursor = () => {
      // Force cursor on document body and html
      if (document.documentElement) {
        document.documentElement.style.cursor = CURSOR_STYLE
      }
      if (document.body) {
        document.body.style.cursor = CURSOR_STYLE
      }

      // Force cursor on all elements, including dynamically added ones
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        if (htmlEl.style) {
          htmlEl.style.cursor = CURSOR_STYLE
        }
      })

      // Specifically target canvas elements and Fabric.js upper/lower canvas
      const canvases = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas, .canvas-container')
      canvases.forEach((canvas) => {
        const canvasEl = canvas as HTMLElement
        canvasEl.style.cursor = CURSOR_STYLE
        // Also set on hover state via CSS
        canvasEl.style.setProperty('cursor', CURSOR_STYLE, 'important')
      })
    }

    // Apply immediately
    forceCursor()

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      forceCursor()
    })

    // Observe changes to the entire document
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    // Also force cursor periodically as a backup
    const interval = setInterval(forceCursor, 100)

    // Watch for mouse events to reapply cursor
    const mouseHandler = () => {
      forceCursor()
    }

    document.addEventListener('mousemove', mouseHandler, true)
    document.addEventListener('mouseenter', mouseHandler, true)
    document.addEventListener('mouseleave', mouseHandler, true)
    document.addEventListener('mouseover', mouseHandler, true)

    return () => {
      observer.disconnect()
      clearInterval(interval)
      document.removeEventListener('mousemove', mouseHandler, true)
      document.removeEventListener('mouseenter', mouseHandler, true)
      document.removeEventListener('mouseleave', mouseHandler, true)
      document.removeEventListener('mouseover', mouseHandler, true)
    }
  }, [])

  return null
}

