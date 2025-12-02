'use client'

import { useEffect } from 'react'

export function CursorTest() {
  useEffect(() => {
    const cursorUrl = '/cursor.png'
    const cursorStyle = `url('${cursorUrl}') 16 16, auto`

    // Patch Fabric.js canvas methods that set cursors
    const patchFabricCanvas = () => {
      // Wait for Fabric to be available
      if (typeof window !== 'undefined' && (window as any).fabric) {
        const fabric = (window as any).fabric
        if (fabric.Canvas) {
          const originalSetCursor = fabric.Canvas.prototype.setCursor
          fabric.Canvas.prototype.setCursor = function(cursor: string) {
            // Override any cursor setting with our custom cursor
            if (originalSetCursor) {
              originalSetCursor.call(this, cursorStyle)
            } else if (this.upperCanvasEl) {
              this.upperCanvasEl.style.cursor = cursorStyle
            }
          }

          // Patch renderCursor method
          const originalRenderCursor = fabric.Canvas.prototype.renderCursor
          if (originalRenderCursor) {
            fabric.Canvas.prototype.renderCursor = function() {
              // Just set our cursor instead
              if (this.upperCanvasEl) {
                this.upperCanvasEl.style.cursor = cursorStyle
              }
            }
          }
        }
      }
    }

    // Try to patch immediately
    patchFabricCanvas()

    // Also try after a delay in case Fabric loads later
    setTimeout(patchFabricCanvas, 1000)
    setTimeout(patchFabricCanvas, 3000)

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
      const canvasElements = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas, .canvas-container')
      canvasElements.forEach(canvas => {
        forceCursorOnElement(canvas as HTMLElement)
        // Check if cursor was overridden
        const htmlEl = canvas as HTMLElement
        if (htmlEl.style && htmlEl.style.cursor && !htmlEl.style.cursor.includes('cursor.png') && htmlEl.style.cursor !== 'none') {
          forceCursorOnElement(htmlEl)
        }
      })
    }

    // Apply immediately
    applyCursor()

    // Periodic check to catch Fabric.js cursor changes (less frequent)
    const interval = setInterval(() => {
      applyCursor()
    }, 200) // Check every 200ms

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
            if (!target.style.cursor.includes('cursor.png') && target.style.cursor !== 'none') {
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
      if (property === 'cursor' && value && !value.includes('cursor.png') && value !== 'none') {
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
          if (value && !value.includes('cursor.png') && value !== 'none') {
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

