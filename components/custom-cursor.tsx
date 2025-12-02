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

    // Hide default cursor on all elements
    const hideDefaultCursor = () => {
      document.body.style.cursor = 'none'
      document.documentElement.style.cursor = 'none'
      
      // Hide cursor on all existing elements
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        if (htmlEl.style) {
          htmlEl.style.cursor = 'none'
        }
      })
      
      // Specifically target canvas elements
      const canvases = document.querySelectorAll('canvas, .upper-canvas, .lower-canvas')
      canvases.forEach((canvas) => {
        const canvasEl = canvas as HTMLElement
        canvasEl.style.cursor = 'none'
        canvasEl.style.setProperty('cursor', 'none', 'important')
      })
    }
    
    hideDefaultCursor()
    
    // Watch for new elements and hide cursor on them too
    const observer = new MutationObserver(() => {
      hideDefaultCursor()
    })
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })

    // Start cursor animation
    updateCursor()
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor)
      }
      observer.disconnect()
      document.body.style.cursor = ''
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return null
}

