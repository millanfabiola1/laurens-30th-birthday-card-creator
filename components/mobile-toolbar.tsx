"use client"
import { MacButton } from "./mac-ui"
import type { BrushShape } from "./canvas-area"

type MobilePanel = "none" | "tools" | "colors" | "options" | "stamps" | "shapes" | "brushOptions" | "eraserOptions"

interface MobileToolbarProps {
  mobilePanel: MobilePanel
  setMobilePanel: (panel: MobilePanel) => void
  currentTool: string
  setCurrentTool: (tool: string) => void
  currentColor: string
  setCurrentColor: (color: string) => void
  brushSize: number
  setBrushSize: (size: number) => void
  brushShape: BrushShape
  setBrushShape: (shape: BrushShape) => void
  eraserSize: number
  setEraserSize: (size: number) => void
  eraserShape: BrushShape
  setEraserShape: (shape: BrushShape) => void
  currentStamp: string
  setCurrentStamp: (stamp: string) => void
  currentShape: string
  setCurrentShape: (shape: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  colors: string[]
  currentFont: string
  setCurrentFont: (font: string) => void
  addSpecialText: (text: string) => void
}

export default function MobileToolbar({
  mobilePanel,
  setMobilePanel,
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  brushShape,
  setBrushShape,
  eraserSize,
  setEraserSize,
  eraserShape,
  setEraserShape,
  currentStamp,
  setCurrentStamp,
  currentShape,
  setCurrentShape,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  colors,
  currentFont,
  setCurrentFont,
  addSpecialText,
}: MobileToolbarProps) {
  const stamps = ["⭐", "✨", "💖", "🎂", "🎁", "🎈", "🎉", "🦋", "🌸", "🌈", "💎", "👑", "🎀", "💫", "🔥", "💕"]
  const shapes = [
    { id: "heart", label: "💜" },
    { id: "star", label: "⭐" },
    { id: "circle", label: "⚫" },
    { id: "square", label: "⬛" },
    { id: "triangle", label: "🔺" },
    { id: "diamond", label: "🔷" },
  ]
  const sizes = [2, 5, 10, 15, 20]
  const fonts = [
    { id: "pixel", name: "Pixel", style: 'var(--font-pixel), "Doto", sans-serif' },
    { id: "bubble", name: "Bubble", style: 'var(--font-bubble), "Bagel Fat One", cursive' },
    { id: "script", name: "Script", style: 'var(--font-script), "Imperial Script", cursive' },
    { id: "narrow", name: "Narrow", style: 'var(--font-narrow), "Instrument Serif", serif' },
  ]
  const brushShapes: { id: BrushShape; label: string; icon: string }[] = [
    { id: "round", label: "Round", icon: "⚫" },
    { id: "square", label: "Square", icon: "⬛" },
    { id: "spray", label: "Spray", icon: "💨" },
  ]

  const handleToolSelect = (tool: string) => {
    setCurrentTool(tool)
    if (tool === "upload") {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            const event = new CustomEvent("imageUpload", { detail: reader.result })
            window.dispatchEvent(event)
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    }
  }

  const closePanel = () => setMobilePanel("none")

  return (
    <>
      {/* Backdrop for panels - covers everything above toolbar */}
      {mobilePanel !== "none" && (
        <div
          className="absolute inset-0 bg-black/30 z-40"
          style={{ bottom: "auto", height: "100%" }}
          onClick={closePanel}
        />
      )}

      {mobilePanel !== "none" && (
        <div
          className="absolute left-0 right-0 z-50 animate-in slide-in-from-bottom duration-200"
          style={{
            bottom: "100%",
            background: "linear-gradient(180deg, #fff0f7 0%, #ffc0e0 100%)",
            borderTop: "3px solid #c71585",
            borderRadius: "16px 16px 0 0",
            maxHeight: "50vh",
            boxShadow: "0 -4px 20px rgba(199, 21, 133, 0.3)",
          }}
        >
          {/* Drag handle to close */}
          <div className="flex justify-center pt-3 pb-2" onClick={closePanel}>
            <div
              className="w-14 h-2 rounded-full cursor-pointer"
              style={{ background: "linear-gradient(90deg, #ff1493, #a855f7)" }}
            />
          </div>

          {/* Panel content */}
          <div className="p-4 pb-6 overflow-y-auto max-h-[45vh]">
            {mobilePanel === "tools" && (
              <div>
                <h3 className="text-sm font-bold mb-3 pixel-text text-center" style={{ color: "#c71585" }}>
                  Drawing Tools
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: "brush", label: "🖌️", name: "Brush", hasOptions: true },
                    { id: "eraser", label: "🧹", name: "Eraser", hasOptions: true },
                    { id: "fill", label: "🪣", name: "Fill BG" },
                    { id: "move", label: "✋", name: "Move" },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        handleToolSelect(tool.id)
                        if (tool.hasOptions) {
                          setMobilePanel(tool.id === "brush" ? "brushOptions" : "eraserOptions")
                        } else {
                          closePanel()
                        }
                      }}
                      className="flex flex-col items-center gap-1 p-3 rounded-lg transition-transform active:scale-95"
                      style={{
                        background:
                          currentTool === tool.id
                            ? "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                        border: "2px solid #c71585",
                        boxShadow: currentTool === tool.id ? "inset 2px 2px 0 0 #c71585" : "2px 2px 0 0 #c71585",
                      }}
                    >
                      <span className="text-3xl">{tool.label}</span>
                      <span
                        className="text-xs pixel-text"
                        style={{ color: currentTool === tool.id ? "white" : "#4a0033" }}
                      >
                        {tool.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mobilePanel === "brushOptions" && (
              <div>
                <h3 className="text-sm font-bold mb-3 pixel-text text-center" style={{ color: "#c71585" }}>
                  Brush Options
                </h3>
                <div className="mb-4">
                  <h4 className="text-xs font-bold mb-2 pixel-text" style={{ color: "#c71585" }}>Size</h4>
                  <div className="flex justify-center gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setBrushSize(size)}
                        className="w-12 h-12 flex items-center justify-center pixel-text font-bold transition-transform active:scale-95"
                        style={{
                          background:
                            brushSize === size
                              ? "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)"
                              : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                          border: "2px solid #c71585",
                          borderRadius: "8px",
                          color: brushSize === size ? "white" : "#4a0033",
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold mb-2 pixel-text" style={{ color: "#c71585" }}>Shape</h4>
                  <div className="flex justify-center gap-3">
                    {brushShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setBrushShape(shape.id)}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg transition-transform active:scale-95"
                        style={{
                          background:
                            brushShape === shape.id
                              ? "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)"
                              : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                          border: "2px solid #c71585",
                        }}
                      >
                        <span className="text-2xl">{shape.icon}</span>
                        <span
                          className="text-xs pixel-text"
                          style={{ color: brushShape === shape.id ? "white" : "#4a0033" }}
                        >
                          {shape.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mobilePanel === "eraserOptions" && (
              <div>
                <h3 className="text-sm font-bold mb-3 pixel-text text-center" style={{ color: "#0891b2" }}>
                  Eraser Options
                </h3>
                <div className="mb-4">
                  <h4 className="text-xs font-bold mb-2 pixel-text" style={{ color: "#0891b2" }}>Size</h4>
                  <div className="flex justify-center gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setEraserSize(size)}
                        className="w-12 h-12 flex items-center justify-center pixel-text font-bold transition-transform active:scale-95"
                        style={{
                          background:
                            eraserSize === size
                              ? "linear-gradient(180deg, #00e5ff 0%, #0891b2 100%)"
                              : "linear-gradient(180deg, #ffffff 0%, #a5f3fc 100%)",
                          border: "2px solid #0891b2",
                          borderRadius: "8px",
                          color: eraserSize === size ? "white" : "#4a0033",
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold mb-2 pixel-text" style={{ color: "#0891b2" }}>Shape</h4>
                  <div className="flex justify-center gap-3">
                    {brushShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setEraserShape(shape.id)}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg transition-transform active:scale-95"
                        style={{
                          background:
                            eraserShape === shape.id
                              ? "linear-gradient(180deg, #00e5ff 0%, #0891b2 100%)"
                              : "linear-gradient(180deg, #ffffff 0%, #a5f3fc 100%)",
                          border: "2px solid #0891b2",
                        }}
                      >
                        <span className="text-2xl">{shape.icon}</span>
                        <span
                          className="text-xs pixel-text"
                          style={{ color: eraserShape === shape.id ? "white" : "#4a0033" }}
                        >
                          {shape.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mobilePanel === "stamps" && (
              <div>
                <h3 className="text-sm font-bold mb-3 pixel-text text-center" style={{ color: "#c71585" }}>
                  Pick a Stamp
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {stamps.map((stamp) => (
                    <button
                      key={stamp}
                      onClick={() => {
                        setCurrentStamp(stamp)
                        setCurrentTool("stamp")
                        closePanel()
                      }}
                      className="text-2xl p-2 transition-transform active:scale-110"
                      style={{
                        background: currentStamp === stamp ? "#ffb6d9" : "white",
                        border: currentStamp === stamp ? "2px solid #ff1493" : "1px solid #ffb6d9",
                        borderRadius: "8px",
                      }}
                    >
                      {stamp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mobilePanel === "shapes" && (
              <div>
                <h3 className="text-sm font-bold mb-3 pixel-text text-center" style={{ color: "#7c3aed" }}>
                  Pick a Shape
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {shapes.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => {
                        setCurrentShape(shape.id)
                        setCurrentTool("shapes")
                        closePanel()
                      }}
                      className="text-3xl p-3 transition-transform active:scale-110"
                      style={{
                        background: currentShape === shape.id ? "#c4b5fd" : "white",
                        border: currentShape === shape.id ? "2px solid #a855f7" : "1px solid #c4b5fd",
                        borderRadius: "8px",
                      }}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mobilePanel === "colors" && (
              <div>
                <h3 className="text-sm font-bold mb-3 pixel-text text-center" style={{ color: "#c71585" }}>
                  Pick a Color
                </h3>
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setCurrentColor(color)
                        closePanel()
                      }}
                      className="w-10 h-10 transition-transform active:scale-110"
                      style={{
                        backgroundColor: color,
                        border: currentColor === color ? "3px solid #00e5ff" : "2px solid #c71585",
                        borderRadius: "8px",
                        boxShadow: currentColor === color ? "0 0 8px #00e5ff" : "none",
                      }}
                    />
                  ))}
                </div>

                <h3 className="text-sm font-bold mb-2 pixel-text text-center" style={{ color: "#a855f7" }}>
                  Brush Size
                </h3>
                <div className="flex justify-center gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className="w-12 h-12 flex items-center justify-center pixel-text font-bold transition-transform active:scale-95"
                      style={{
                        background:
                          brushSize === size
                            ? "linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #e9d5ff 100%)",
                        border: "2px solid #7c3aed",
                        borderRadius: "8px",
                        color: brushSize === size ? "white" : "#4a0033",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mobilePanel === "options" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold mb-2 pixel-text text-center" style={{ color: "#00e5ff" }}>
                    Lauren Specials
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {["Happy 30th Lauren!", "Dirty 30!", "Forever 21 + 9"].map((text, i) => (
                      <MacButton
                        key={text}
                        primary={i === 0}
                        secondary={i === 1}
                        accent={i === 2}
                        className="w-full py-3"
                        onClick={() => {
                          addSpecialText(text)
                          closePanel()
                        }}
                      >
                        {text}
                      </MacButton>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-2 pixel-text text-center" style={{ color: "#ffd700" }}>
                    Text Font
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setCurrentFont(font.id)}
                        className="p-3 text-base transition-transform active:scale-95"
                        style={{
                          fontFamily: font.style,
                          background:
                            currentFont === font.id
                              ? "linear-gradient(180deg, #ffd700 0%, #ffb700 100%)"
                              : "linear-gradient(180deg, #ffffff 0%, #fff8dc 100%)",
                          border: "2px solid #ffd700",
                          borderRadius: "8px",
                          color: "#4a0033",
                        }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className="relative flex-shrink-0 z-50"
        style={{
          background: "linear-gradient(180deg, #fff0f7 0%, #ffc0e0 100%)",
          borderTop: "3px solid #c71585",
          boxShadow: "0 -4px 20px rgba(199, 21, 133, 0.4)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        {/* Quick action bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-pink-300">
          {/* Current tool indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)",
              border: "2px solid #c71585",
            }}
          >
            <span className="text-xl">
              {currentTool === "brush" && "🖌️"}
              {currentTool === "eraser" && "🧹"}
              {currentTool === "fill" && "🪣"}
              {currentTool === "stamp" && currentStamp}
              {currentTool === "text" && "🔤"}
              {currentTool === "shapes" && "💜"}
              {currentTool === "move" && "✋"}
              {currentTool === "upload" && "🖼️"}
            </span>
            <span className="text-xs text-white pixel-text capitalize">{currentTool}</span>
          </div>

          {/* Current color */}
          <button
            onClick={() => setMobilePanel(mobilePanel === "colors" ? "none" : "colors")}
            className="w-11 h-11 rounded-full transition-transform active:scale-95"
            style={{
              backgroundColor: currentColor,
              border: "3px solid #c71585",
              boxShadow: "inset -2px -2px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.4)",
            }}
          />

          {/* Undo/Redo */}
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="w-11 h-11 flex items-center justify-center text-xl rounded-lg transition-transform active:scale-95"
              style={{
                background: canUndo ? "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)" : "#e0e0e0",
                border: "2px solid #c71585",
                opacity: canUndo ? 1 : 0.4,
              }}
            >
              ↩️
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="w-11 h-11 flex items-center justify-center text-xl rounded-lg transition-transform active:scale-95"
              style={{
                background: canRedo ? "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)" : "#e0e0e0",
                border: "2px solid #c71585",
                opacity: canRedo ? 1 : 0.4,
              }}
            >
              ↪️
            </button>
          </div>
        </div>

        {/* Main navigation tabs */}
        <div className="grid grid-cols-5 gap-2 p-2">
          {/* Draw tools */}
          <button
            onClick={() => setMobilePanel(mobilePanel === "tools" ? "none" : "tools")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-transform active:scale-95"
            style={{
              background:
                mobilePanel === "tools"
                  ? "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
              border: "2px solid #c71585",
            }}
          >
            <span className="text-2xl">🖌️</span>
            <span className="text-[10px] pixel-text" style={{ color: mobilePanel === "tools" ? "white" : "#4a0033" }}>
              Draw
            </span>
          </button>

          {/* Stamps */}
          <button
            onClick={() => setMobilePanel(mobilePanel === "stamps" ? "none" : "stamps")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-transform active:scale-95"
            style={{
              background:
                mobilePanel === "stamps"
                  ? "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
              border: "2px solid #c71585",
            }}
          >
            <span className="text-2xl">⭐</span>
            <span className="text-[10px] pixel-text" style={{ color: mobilePanel === "stamps" ? "white" : "#4a0033" }}>
              Stamps
            </span>
          </button>

          {/* Shapes */}
          <button
            onClick={() => setMobilePanel(mobilePanel === "shapes" ? "none" : "shapes")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-transform active:scale-95"
            style={{
              background:
                mobilePanel === "shapes"
                  ? "linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #e9d5ff 100%)",
              border: "2px solid #7c3aed",
            }}
          >
            <span className="text-2xl">💜</span>
            <span className="text-[10px] pixel-text" style={{ color: mobilePanel === "shapes" ? "white" : "#4a0033" }}>
              Shapes
            </span>
          </button>

          {/* Text */}
          <button
            onClick={() => {
              setCurrentTool("text")
              setMobilePanel("none")
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-transform active:scale-95"
            style={{
              background:
                currentTool === "text"
                  ? "linear-gradient(180deg, #00e5ff 0%, #0891b2 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #a5f3fc 100%)",
              border: "2px solid #0891b2",
            }}
          >
            <span className="text-2xl">🔤</span>
            <span className="text-[10px] pixel-text" style={{ color: currentTool === "text" ? "white" : "#4a0033" }}>
              Text
            </span>
          </button>

          {/* More options */}
          <button
            onClick={() => setMobilePanel(mobilePanel === "options" ? "none" : "options")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-transform active:scale-95"
            style={{
              background:
                mobilePanel === "options"
                  ? "linear-gradient(180deg, #ffd700 0%, #ffb700 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #fff8dc 100%)",
              border: "2px solid #ffd700",
            }}
          >
            <span className="text-2xl">✨</span>
            <span className="text-[10px] pixel-text" style={{ color: "#4a0033" }}>
              More
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
