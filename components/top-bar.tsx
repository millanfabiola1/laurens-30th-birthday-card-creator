"use client"

import { MacWindow, macStyles } from "./mac-ui"
import { playSound } from "@/lib/sound-manager"

interface TopBarProps {
  onHelpClick?: () => void
}

export default function TopBar({ onHelpClick }: TopBarProps) {
  const handleHelpClick = () => {
    playSound("click")
    onHelpClick?.()
  }

  return (
    <MacWindow className="mx-2 mt-2">
      <div style={macStyles.titleBar}>
        <div className="flex gap-1">
          <div style={{ ...macStyles.closeButton, backgroundColor: "#ff6b6b" }} title="Close" />
          <div style={{ ...macStyles.closeButton, backgroundColor: "#ffd93d" }} title="Minimize" />
          <div style={{ ...macStyles.closeButton, backgroundColor: "#6bcb77" }} title="Maximize" />
        </div>
        <div style={macStyles.titleBarStripes} className="hidden sm:block" />
        <h1 className="text-xs sm:text-sm font-bold text-center flex-1 pixel-text truncate px-2 text-white drop-shadow-[1px_1px_0_#c71585]">
          ✨ Lauren's 30th Birthday Card Creator ✨
        </h1>
        <div style={macStyles.titleBarStripes} className="hidden sm:block" />
        <div
          className="flex items-center justify-center text-xs font-bold pixel-text"
          style={{
            width: "26px",
            height: "26px",
            border: "2px solid #c71585",
            background: "linear-gradient(180deg, #00e5ff 0%, #0891b2 100%)",
            color: "white",
            boxShadow: "inset -1px -1px 0 0 #0e7490, inset 1px 1px 0 0 #a5f3fc",
          }}
        >
          L
        </div>
      </div>
      <div
        className="px-3 py-1.5 text-xs font-bold border-b-2 border-primary flex gap-4"
        style={{ background: "linear-gradient(90deg, #fff0f7 0%, #e0b0ff 50%, #b0e0ff 100%)" }}
      >
        <span className="cursor-pointer hover:text-primary transition-colors">📁 File</span>
        <span className="cursor-pointer hover:text-primary transition-colors">✂️ Edit</span>
        <span className="cursor-pointer hover:text-primary transition-colors">🎨 Tools</span>
        <span className="cursor-pointer hover:text-primary transition-colors hidden sm:inline">✨ Special</span>
        <button 
          className="cursor-pointer hover:text-primary transition-colors hidden sm:inline hover:scale-110 active:scale-95 bg-transparent border-none font-bold text-xs"
          onClick={handleHelpClick}
          title="Take a guided tour"
        >
          💕 Help
        </button>
      </div>
    </MacWindow>
  )
}
