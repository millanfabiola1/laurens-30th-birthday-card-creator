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
      el.style.setProperty('cursor', cursorStyle, 'important')
    }

    // Apply cursor to html and body
    const applyCursor = () => {
      forceCursorOnElement(document.documentElement)
      forceCursorOnElement(document.body)
      
      // Force on canvas elements specifically (Fabric.js creates these)
      const canvases = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas')
      canvases.forEach(canvas => {
        forceCursorOnElement(canvas as HTMLElement)
      })
    }

    // Apply immediately
    applyCursor()

    // Continuously enforce cursor - override any dynamic changes
    const interval = setInterval(() => {
      applyCursor()
    }, 50) // Check every 50ms

    // Also enforce on mouse movement
    const handleMouseMove = () => {
      applyCursor()
    }
    document.addEventListener('mousemove', handleMouseMove, true)

    // Watch for style changes on elements (Fabric.js might be setting inline styles)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          if (target) {
            forceCursorOnElement(target)
          }
        }
        // Also check added nodes
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              forceCursorOnElement(node as HTMLElement)
              // Also check children
              const children = (node as HTMLElement).querySelectorAll('*')
              children.forEach(child => {
                forceCursorOnElement(child as HTMLElement)
              })
            }
          })
        }
      })
      applyCursor()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      subtree: true,
    })

    // Intercept style.cursor assignments
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty
    CSSStyleDeclaration.prototype.setProperty = function(property: string, value: string | null, priority?: string) {
      if (property === 'cursor' && value && !value.includes('pink-cursor.png')) {
        // Override cursor changes that don't use our cursor
        originalSetProperty.call(this, 'cursor', cursorStyle, 'important')
      } else {
        originalSetProperty.call(this, property, value, priority)
      }
    }

    // Intercept direct cursor assignments
    const styleDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style') || 
                            Object.getOwnPropertyDescriptor(Element.prototype, 'style')
    
    if (styleDescriptor && styleDescriptor.set) {
      const originalStyleSetter = styleDescriptor.set
      // Note: This is a more aggressive approach but might not work in all browsers
    }

    return () => {
      clearInterval(interval)
      observer.disconnect()
      document.removeEventListener('mousemove', handleMouseMove, true)
      // Restore original setProperty
      CSSStyleDeclaration.prototype.setProperty = originalSetProperty
    }
  }, [])

  return null
}

