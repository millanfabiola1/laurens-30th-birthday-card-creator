'use client'

import { useEffect } from 'react'

export function CursorTest() {
  useEffect(() => {
    const cursorUrl = '/pink-cursor.png'
    const cursorStyle = `url('${cursorUrl}') 0 0, auto`

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
              this.upperCanvasEl.style.cursor = `url('${cursorUrl}') 0 0, crosshair`
            }
          }

          // Patch renderCursor method
          const originalRenderCursor = fabric.Canvas.prototype.renderCursor
          if (originalRenderCursor) {
            fabric.Canvas.prototype.renderCursor = function() {
              // Just set our cursor instead
              if (this.upperCanvasEl) {
                this.upperCanvasEl.style.cursor = `url('${cursorUrl}') 0 0, crosshair`
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
      if (el.style.cursor && !el.style.cursor.includes('pink-cursor.png')) {
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
        if (htmlEl.style && htmlEl.style.cursor && !htmlEl.style.cursor.includes('pink-cursor.png') && htmlEl.style.cursor !== 'none') {
          htmlEl.style.cursor = `url('${cursorUrl}') 0 0, crosshair`
        }
      })
    }

    // Apply immediately
    applyCursor()

    // Frequent check to catch Fabric.js cursor changes
    const interval = setInterval(() => {
      applyCursor()
    }, 50) // Check every 50ms to catch rapid changes

    // Intercept ALL mouse events and reapply cursor IMMEDIATELY
    const handleMouseEvent = (e: MouseEvent) => {
      // Apply immediately, don't wait for next frame
      applyCursor()
      // Also force on the target element immediately
      if (e.target) {
        const target = e.target as HTMLElement
        forceCursorOnElement(target)
        // Also force on parent elements
        let parent = target.parentElement
        let depth = 0
        while (parent && depth < 2) {
          forceCursorOnElement(parent)
          parent = parent.parentElement
          depth++
        }
      }
    }

    // Capture all mouse events at capture phase (before they reach other handlers)
    document.addEventListener('mousemove', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseover', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseenter', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseleave', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mousedown', handleMouseEvent, { capture: true, passive: true })
    document.addEventListener('mouseup', handleMouseEvent, { capture: true, passive: true })

    // Watch for style changes on elements (Fabric.js might be setting inline styles)
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          if (target && target.style && target.style.cursor) {
            if (!target.style.cursor.includes('pink-cursor.png') && target.style.cursor !== 'none') {
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

    // Aggressively intercept ALL cursor changes - no exceptions
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty
    CSSStyleDeclaration.prototype.setProperty = function(property: string, value: string | null, priority?: string) {
      if (property === 'cursor') {
        // ALWAYS use pink cursor, no matter what
        if (this.parentRule || (this as any).ownerElement) {
          const element = (this as any).ownerElement
          if (element && (element.tagName === 'CANVAS' || element.classList.contains('upper-canvas') || element.classList.contains('lower-canvas'))) {
            return originalSetProperty.call(this, 'cursor', `url('/pink-cursor.png') 0 0, crosshair`, 'important')
          }
        }
        return originalSetProperty.call(this, 'cursor', cursorStyle, 'important')
      }
      return originalSetProperty.call(this, property, value, priority)
    }

    // Intercept direct style.cursor assignment - COMPLETELY block non-pink cursors
    const originalCursorDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cursor')
    if (originalCursorDescriptor) {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'cursor', {
        get() {
          const value = originalCursorDescriptor.get?.call(this) || ''
          // If it's not our cursor, return our cursor instead
          if (value && !value.includes('pink-cursor.png') && value !== 'none') {
            const element = (this as any).ownerElement
            if (element && (element.tagName === 'CANVAS' || element.classList.contains('upper-canvas') || element.classList.contains('lower-canvas'))) {
              return `url('/pink-cursor.png') 0 0, crosshair`
            }
            return cursorStyle
          }
          return value
        },
        set(value: string) {
          // NEVER allow setting non-pink cursors
          const element = (this as any).ownerElement
          if (element && (element.tagName === 'CANVAS' || element.classList.contains('upper-canvas') || element.classList.contains('lower-canvas'))) {
            return originalCursorDescriptor.set?.call(this, `url('/pink-cursor.png') 0 0, crosshair`)
          }
          if (value && !value.includes('pink-cursor.png') && value !== 'none') {
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
      document.removeEventListener('mousedown', handleMouseEvent, true)
      document.removeEventListener('mouseup', handleMouseEvent, true)
      // Restore original methods
      CSSStyleDeclaration.prototype.setProperty = originalSetProperty
      if (originalCursorDescriptor) {
        Object.defineProperty(CSSStyleDeclaration.prototype, 'cursor', originalCursorDescriptor)
      }
    }
  }, [])

  return null
}

