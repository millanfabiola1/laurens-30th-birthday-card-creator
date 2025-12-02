'use client'

import { useEffect } from 'react'

export function CursorTest() {
  useEffect(() => {
    const cursorUrl = '/pink-cursor.png'
    const cursorStyle = `url('${cursorUrl}') 16 16, auto`

    // Preload cursor image
    const img = new Image()
    img.src = cursorUrl
    img.onload = () => {
      console.log('✅ Cursor image loaded')
    }
    img.onerror = () => {
      console.error('❌ Failed to load cursor image:', cursorUrl)
    }

    // Function to force cursor on specific element
    const forceCursorOnElement = (el: HTMLElement | null) => {
      if (!el) return
      // Use setProperty with important flag
      el.style.setProperty('cursor', cursorStyle, 'important')
      // Also try direct assignment as fallback
      if (el.style.cursor && !el.style.cursor.includes('pink-cursor')) {
        el.style.cursor = cursorStyle
      }
    }

    // Apply cursor to html and body
    const applyCursor = () => {
      forceCursorOnElement(document.documentElement)
      forceCursorOnElement(document.body)
      
      // Force on canvas elements specifically (Fabric.js creates these)
      const canvases = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas, .canvas-container')
      canvases.forEach(canvas => {
        forceCursorOnElement(canvas as HTMLElement)
      })

      // Force on all elements that have a style
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        const htmlEl = el as HTMLElement
        if (htmlEl.style && htmlEl.style.cursor && !htmlEl.style.cursor.includes('pink-cursor')) {
          forceCursorOnElement(htmlEl)
        }
      })
    }

    // Apply immediately
    applyCursor()

    // Very frequent interval to catch Fabric.js cursor changes
    const interval = setInterval(() => {
      applyCursor()
    }, 16) // ~60fps - check every frame

    // Intercept ALL mouse events and reapply cursor immediately
    const handleMouseEvent = (e: MouseEvent) => {
      // Use requestAnimationFrame for immediate next frame
      requestAnimationFrame(() => {
        applyCursor()
        // Also force on the target element
        if (e.target) {
          forceCursorOnElement(e.target as HTMLElement)
        }
      })
    }

    // Capture all mouse events at capture phase (before they reach other handlers)
    document.addEventListener('mousemove', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseover', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseenter', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseleave', handleMouseEvent, { capture: true, passive: true })

    // Watch for style changes on elements (Fabric.js might be setting inline styles)
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          if (target && target.style && target.style.cursor) {
            if (!target.style.cursor.includes('pink-cursor')) {
              shouldReapply = true
              forceCursorOnElement(target)
            }
          }
        }
        // Also check added nodes
        if (mutation.type === 'childList') {
          shouldReapply = true
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              forceCursorOnElement(node as HTMLElement)
            }
          })
        }
      })
      if (shouldReapply) {
        requestAnimationFrame(applyCursor)
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      subtree: true,
    })

    // Intercept style.cursor assignments - override immediately
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty
    CSSStyleDeclaration.prototype.setProperty = function(property: string, value: string | null, priority?: string) {
      if (property === 'cursor' && value && !value.includes('pink-cursor.png')) {
        // Immediately override with our cursor
        return originalSetProperty.call(this, 'cursor', cursorStyle, 'important')
      }
      return originalSetProperty.call(this, property, value, priority)
    }

    // Intercept direct style.cursor assignment
    const originalCursorDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cursor')
    if (originalCursorDescriptor) {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'cursor', {
        get() {
          return originalCursorDescriptor.get?.call(this) || ''
        },
        set(value: string) {
          if (value && !value.includes('pink-cursor.png')) {
            return originalCursorDescriptor.set?.call(this, cursorStyle)
          }
          return originalCursorDescriptor.set?.call(this, value)
        },
        enumerable: true,
        configurable: true,
      })
    }

    return () => {
      clearInterval(interval)
      observer.disconnect()
      document.removeEventListener('mousemove', handleMouseEvent, true)
      document.removeEventListener('mouseover', handleMouseEvent, true)
      document.removeEventListener('mouseenter', handleMouseEvent, true)
      document.removeEventListener('mouseleave', handleMouseEvent, true)
      // Restore original methods
      CSSStyleDeclaration.prototype.setProperty = originalSetProperty
      if (originalCursorDescriptor) {
        Object.defineProperty(CSSStyleDeclaration.prototype, 'cursor', originalCursorDescriptor)
      }
    }
  }, [])

  return null
}

