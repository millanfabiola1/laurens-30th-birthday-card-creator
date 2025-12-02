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

    // Apply cursor to html and body
    const applyCursor = () => {
      if (document.documentElement) {
        document.documentElement.style.cursor = cursorStyle
        document.documentElement.style.setProperty('cursor', cursorStyle, 'important')
      }
      if (document.body) {
        document.body.style.cursor = cursorStyle
        document.body.style.setProperty('cursor', cursorStyle, 'important')
      }
    }

    // Apply immediately
    applyCursor()

    // Apply on load
    if (document.readyState === 'complete') {
      applyCursor()
    } else {
      window.addEventListener('load', applyCursor)
    }

    // Apply to dynamically added elements
    const observer = new MutationObserver(() => {
      applyCursor()
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      window.removeEventListener('load', applyCursor)
    }
  }, [])

  return null
}

