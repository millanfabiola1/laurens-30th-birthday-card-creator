"use client"

import { useState, useEffect } from "react"

export function MobileDisclaimer() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if user is on mobile/tablet and hasn't dismissed the popup
    const isMobileOrTablet = window.innerWidth < 1024
    const hasSeenDisclaimer = localStorage.getItem("lauren-disclaimer-seen")
    
    if (isMobileOrTablet && !hasSeenDisclaimer) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = (dontShowAgain: boolean) => {
    setIsClosing(true)
    if (dontShowAgain) {
      localStorage.setItem("lauren-disclaimer-seen", "true")
    }
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, 200)
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-300'}`}
      style={{
        background: "rgba(255, 105, 180, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div 
        className={`relative max-w-sm w-full ${isClosing ? 'animate-out zoom-out-95 duration-200' : 'animate-in zoom-in-95 duration-300'}`}
        style={{
          background: "linear-gradient(180deg, #fff0f7 0%, #ffc0e0 100%)",
          border: "4px solid #c71585",
          boxShadow: "8px 8px 0 0 #c71585, inset -3px -3px 0 0 #ff69b4, inset 3px 3px 0 0 #ffffff",
        }}
      >
        {/* Title bar */}
        <div 
          className="flex items-center justify-center px-3 py-2"
          style={{
            background: "linear-gradient(90deg, #ff1493 0%, #c71585 50%, #a855f7 100%)",
            borderBottom: "2px solid #c71585",
          }}
        >
          <span className="text-center text-white font-bold pixel-text text-sm">
            ✨ WELCOME ✨
          </span>
        </div>

        {/* Content */}
        <div className="p-5 text-center space-y-4">
          {/* Cute emoji decoration */}
          <div className="text-4xl">
            💕🎂✨
          </div>
          
          <div className="space-y-2">
            <h2 
              className="text-lg font-bold pixel-text"
              style={{ color: "#c71585" }}
            >
              Quick Note! 📝
            </h2>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: "#8b008b" }}
            >
              This card creator works best on <span className="font-bold">desktop</span> for the full experience! 
              But don&apos;t worry - you can still create something cute on mobile! 💖
            </p>
          </div>

          {/* Cute decorative line */}
          <div className="flex items-center justify-center gap-2">
            <span style={{ color: "#ff69b4" }}>~</span>
            <span>🌸</span>
            <span style={{ color: "#ff69b4" }}>~</span>
            <span>🦋</span>
            <span style={{ color: "#ff69b4" }}>~</span>
            <span>🌸</span>
            <span style={{ color: "#ff69b4" }}>~</span>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleClose(false)}
              className="w-full py-2.5 px-4 font-bold pixel-text text-white text-sm transition-all active:scale-95"
              style={{
                background: "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)",
                border: "3px solid #c71585",
                boxShadow: "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffb6d9, 3px 3px 0 0 #c71585",
              }}
            >
              ✨ Let&apos;s Create! ✨
            </button>
            
            <button
              onClick={() => handleClose(true)}
              className="w-full py-2 px-4 font-bold pixel-text text-xs transition-all active:scale-95"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                border: "2px solid #ffb6d9",
                color: "#c71585",
                boxShadow: "inset -1px -1px 0 0 #ffb6d9, inset 1px 1px 0 0 #ffffff",
              }}
            >
              Don&apos;t show again 🙈
            </button>
          </div>

          {/* Footer decoration */}
          <p className="text-xs" style={{ color: "#ff69b4" }}>
            Happy Birthday Lauren! 🎉💜
          </p>
        </div>

        {/* Corner decorations */}
        <div className="absolute -top-2 -left-2 text-lg">🎀</div>
        <div className="absolute -top-2 -right-2 text-lg">🎀</div>
        <div className="absolute -bottom-2 -left-2 text-lg">💖</div>
        <div className="absolute -bottom-2 -right-2 text-lg">💖</div>
      </div>
    </div>
  )
}

