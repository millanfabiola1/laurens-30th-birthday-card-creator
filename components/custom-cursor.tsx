'use client'

import { useEffect } from 'react'

export function CustomCursor() {
  useEffect(() => {
    // Create a custom cursor element that follows the mouse
    const cursor = document.createElement('div')
    cursor.id = 'custom-cursor'
    cursor.style.cssText = `
      position: fixed;
      width: 32px;
      height: 32px;
      background-image: url('/pink-cursor.png');
      background-size: contain;
      background-repeat: no-repeat;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-16px, -16px);
      will-change: transform;
    `
    document.body.appendChild(cursor)

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const updateCursor = () => {
      const dx = mouseX - cursorX
      const dy = mouseY - cursorY
      cursorX += dx * 0.1
      cursorY += dy * 0.1
      cursor.style.left = cursorX + 'px'
      cursor.style.top = cursorY + 'px'
      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Aggressively hide default cursor everywhere
    const hideAllCursors = () => {
      // Set on html and body
      document.body.style.setProperty('cursor', 'none', 'important')
      document.documentElement.style.setProperty('cursor', 'none', 'important')
      
      // Set on all canvas elements
      const canvases = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas, .canvas-container')
      canvases.forEach((canvas) => {
        const canvasEl = canvas as HTMLElement
        canvasEl.style.setProperty('cursor', 'none', 'important')
      })
    }
    
    // Apply immediately
    hideAllCursors()
    
    // Use a more aggressive interval to constantly hide cursors
    const cursorInterval = setInterval(() => {
      hideAllCursors()
    }, 100)
    
    // Watch for style attribute changes and immediately hide cursor
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          if (target && target.style && target.style.cursor && target.style.cursor !== 'none') {
            target.style.setProperty('cursor', 'none', 'important')
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              const el = node as HTMLElement
              if (el.style) {
                el.style.setProperty('cursor', 'none', 'important')
              }
              // Check children too
              const children = el.querySelectorAll('*')
              children.forEach(child => {
                (child as HTMLElement).style.setProperty('cursor', 'none', 'important')
              })
            }
          })
        }
      })
      hideAllCursors()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      subtree: true,
    })
    
    // Intercept cursor style changes
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty
    CSSStyleDeclaration.prototype.setProperty = function(property: string, value: string | null, priority?: string) {
      if (property === 'cursor' && value && value !== 'none') {
        return originalSetProperty.call(this, 'cursor', 'none', 'important')
      }
      return originalSetProperty.call(this, property, value, priority)
    }

    // Start cursor animation
    updateCursor()
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      clearInterval(cursorInterval)
      observer.disconnect()
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor)
      }
      document.body.style.cursor = ''
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove', handleMouseMove)
      // Restore original setProperty
      CSSStyleDeclaration.prototype.setProperty = originalSetProperty
    }
  }, [])

  return null
}

