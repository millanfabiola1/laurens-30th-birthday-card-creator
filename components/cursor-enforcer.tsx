'use client'

import { useEffect } from 'react'

const CURSOR_URL = '/pink-cursor.png'
const CURSOR_STYLE = `url('${CURSOR_URL}') 16 16, auto`

export function CursorEnforcer() {
  useEffect(() => {
    // Track elements we've already processed to avoid unnecessary work
    const processedElements = new WeakSet<HTMLElement>()
    
    // Function to force cursor on specific elements (optimized)
    const forceCursorOnElement = (el: HTMLElement) => {
      if (processedElements.has(el)) return
      
      if (el.style) {
        const currentCursor = el.style.cursor || window.getComputedStyle(el).cursor
        // Only update if it's not already our cursor
        if (!currentCursor.includes('pink-cursor.png')) {
          el.style.setProperty('cursor', CURSOR_STYLE, 'important')
          processedElements.add(el)
        }
      }
    }

    // Optimized function - only target specific elements
    const forceCursor = () => {
      // Force cursor on document body and html
      if (document.documentElement) {
        document.documentElement.style.setProperty('cursor', CURSOR_STYLE, 'important')
      }
      if (document.body) {
        document.body.style.setProperty('cursor', CURSOR_STYLE, 'important')
      }

      // Only target canvas elements and interactive elements (much faster)
      const canvases = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas')
      canvases.forEach((canvas) => {
        forceCursorOnElement(canvas as HTMLElement)
      })

      // Target interactive elements
      const interactive = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]')
      interactive.forEach((el) => {
        forceCursorOnElement(el as HTMLElement)
      })
    }

    // Apply immediately
    forceCursor()

    // Use MutationObserver with throttling
    let observerTimeout: NodeJS.Timeout | null = null
    const observer = new MutationObserver(() => {
      // Throttle observer callbacks
      if (observerTimeout) return
      observerTimeout = setTimeout(() => {
        forceCursor()
        observerTimeout = null
      }, 200)
    })

    // Observe changes but only for added nodes and style changes
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })

    // Less aggressive interval - only every 500ms
    const interval = setInterval(forceCursor, 500)

    // Throttled mouse handler
    let mouseTimeout: NodeJS.Timeout | null = null
    const mouseHandler = (e: MouseEvent) => {
      if (mouseTimeout) return
      mouseTimeout = setTimeout(() => {
        const target = e.target as HTMLElement
        if (target) {
          forceCursorOnElement(target)
          // Also handle parent elements
          let parent = target.parentElement
          let depth = 0
          while (parent && depth < 3) {
            forceCursorOnElement(parent)
            parent = parent.parentElement
            depth++
          }
        }
        mouseTimeout = null
      }, 100)
    }

    document.addEventListener('mousemove', mouseHandler, { passive: true, capture: true })
    document.addEventListener('mouseover', mouseHandler, { passive: true, capture: true })

    return () => {
      observer.disconnect()
      clearInterval(interval)
      if (observerTimeout) clearTimeout(observerTimeout)
      if (mouseTimeout) clearTimeout(mouseTimeout)
      document.removeEventListener('mousemove', mouseHandler, true)
      document.removeEventListener('mouseover', mouseHandler, true)
    }
  }, [])

  return null
}

