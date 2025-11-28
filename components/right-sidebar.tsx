"use client"

import { MacWindow, MacButton } from "./mac-ui"
import { playSound } from "@/lib/sound-manager"
import type { BrushShape } from "./canvas-area"

interface RightSidebarProps {
  colors: string[]
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
  currentTool: string
  currentFont: string
  setCurrentFont: (font: string) => void
  addSpecialText: (text: string) => void
  isMobile?: boolean
  onClose?: () => void
}

export default function RightSidebar({
  colors,
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
  currentTool,
  currentFont,
  setCurrentFont,
  addSpecialText,
  isMobile,
  onClose,
}: RightSidebarProps) {
  const fonts = [
    { id: "pixel", name: "Pixel", style: 'var(--font-pixel), "Doto", sans-serif' },
    { id: "bubble", name: "Bubble", style: 'var(--font-bubble), "DynaPuff", cursive' },
    { id: "script", name: "Script", style: 'var(--font-script), "Imperial Script", cursive' },
    { id: "narrow", name: "Narrow", style: 'var(--font-narrow), "Instrument Serif", serif' },
  ]
  const sizes = [2, 5, 10, 15, 20]
  const brushShapes: { id: BrushShape; label: string; icon: string }[] = [
    { id: "round", label: "Round", icon: "⚫" },
    { id: "square", label: "Square", icon: "⬛" },
    { id: "spray", label: "Spray", icon: "💨" },
  ]

  const handleColorClick = (color: string) => {
    setCurrentColor(color)
    playSound("click")
  }

  const handleSpecialTextClick = (text: string) => {
    addSpecialText(text)
    playSound("stamp")
  }

  return (
    <MacWindow
      className={`p-2 ${isMobile ? "pb-4" : "flex flex-col gap-3 max-h-full overflow-y-auto mac-scrollbar w-48"}`}
    >
      {isMobile && (
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-sm font-bold pixel-text text-primary">Options</span>
          <MacButton primary onClick={onClose}>
            Done
          </MacButton>
        </div>
      )}

      {/* Color Palette */}
      <div className={isMobile ? "mb-3" : ""}>
        <h3
          className="text-xs font-bold mb-2 pixel-text pb-1 text-white px-2 py-1"
          style={{ background: "linear-gradient(90deg, #ff1493 0%, #a855f7 100%)" }}
        >
          Colors
        </h3>
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`w-8 h-8 transition-transform hover:scale-110 ${
                currentColor === color ? "ring-2 ring-accent ring-offset-1 scale-110" : ""
              }`}
              style={{
                backgroundColor: color,
                border: "2px solid #c71585",
                boxShadow:
                  currentColor === color
                    ? "0 0 8px #00e5ff, inset -1px -1px 0 #00000033, inset 1px 1px 0 #ffffff66"
                    : "inset -1px -1px 0 #00000033, inset 1px 1px 0 #ffffff66",
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Brush Options - shown when brush is selected */}
      {currentTool === 'brush' && (
        <div className={isMobile ? "mb-3" : ""}>
          <h3
            className="text-xs font-bold mb-2 pixel-text pb-1 text-white px-2 py-1"
            style={{ background: "linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)" }}
          >
            Brush
          </h3>
          <div className="mb-2">
            <span className="text-xs pixel-text text-pink-700 mb-1 block">Size</span>
            <div className="flex gap-1 flex-wrap">
              {sizes.map((size) => (
                <MacButton
                  key={size}
                  onClick={() => setBrushSize(size)}
                  active={brushSize === size}
                  style={{ width: "36px", padding: "4px" }}
                >
                  {size}
                </MacButton>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs pixel-text text-pink-700 mb-1 block">Shape</span>
            <div className="flex gap-1 flex-wrap">
              {brushShapes.map((shape) => (
                <MacButton
                  key={shape.id}
                  onClick={() => {
                    setBrushShape(shape.id)
                    playSound("click")
                  }}
                  active={brushShape === shape.id}
                  style={{ padding: "4px 8px" }}
                >
                  <span className="text-sm">{shape.icon}</span>
                </MacButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Eraser Options - shown when eraser is selected */}
      {currentTool === 'eraser' && (
        <div className={isMobile ? "mb-3" : ""}>
          <h3
            className="text-xs font-bold mb-2 pixel-text pb-1 text-white px-2 py-1"
            style={{ background: "linear-gradient(90deg, #00e5ff 0%, #7fff00 100%)" }}
          >
            Eraser
          </h3>
          <div className="mb-2">
            <span className="text-xs pixel-text text-teal-700 mb-1 block">Size</span>
            <div className="flex gap-1 flex-wrap">
              {sizes.map((size) => (
                <MacButton
                  key={size}
                  onClick={() => setEraserSize(size)}
                  active={eraserSize === size}
                  style={{ width: "36px", padding: "4px" }}
                >
                  {size}
                </MacButton>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs pixel-text text-teal-700 mb-1 block">Shape</span>
            <div className="flex gap-1 flex-wrap">
              {brushShapes.map((shape) => (
                <MacButton
                  key={shape.id}
                  onClick={() => {
                    setEraserShape(shape.id)
                    playSound("click")
                  }}
                  active={eraserShape === shape.id}
                  style={{ padding: "4px 8px" }}
                >
                  <span className="text-sm">{shape.icon}</span>
                </MacButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Default Size - shown for other tools */}
      {currentTool !== 'brush' && currentTool !== 'eraser' && (
        <div className={isMobile ? "mb-3" : ""}>
          <h3
            className="text-xs font-bold mb-2 pixel-text pb-1 text-white px-2 py-1"
            style={{ background: "linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)" }}
          >
            Size
          </h3>
          <div className="flex gap-1 flex-wrap">
            {sizes.map((size) => (
              <MacButton
                key={size}
                onClick={() => setBrushSize(size)}
                active={brushSize === size}
                style={{ width: "36px", padding: "4px" }}
              >
                {size}
              </MacButton>
            ))}
          </div>
        </div>
      )}

      <div className={isMobile ? "mb-3" : ""}>
        <h3
          className="text-xs font-bold mb-2 pixel-text pb-1 text-white px-2 py-1"
          style={{ background: "linear-gradient(90deg, #00e5ff 0%, #7fff00 100%)" }}
        >
          Lauren Specials
        </h3>
        <div className="space-y-1">
          <MacButton primary className="w-full" onClick={() => handleSpecialTextClick("Happy 30th Lauren!")}>
            Happy 30th Lauren!
          </MacButton>
          <MacButton secondary className="w-full" onClick={() => handleSpecialTextClick("Dirty 30!")}>
            Dirty 30!
          </MacButton>
          <MacButton accent className="w-full" onClick={() => handleSpecialTextClick("Forever 21 + 9")}>
            Forever 21 + 9
          </MacButton>
        </div>
      </div>

      {/* Font Selection - Updated to show font previews */}
      <div>
        <h3
          className="text-xs font-bold mb-2 pixel-text pb-1 text-white px-2 py-1"
          style={{ background: "linear-gradient(90deg, #ffd700 0%, #ff1493 100%)" }}
        >
          Fonts
        </h3>
        <div className="space-y-1">
          {fonts.map((font) => (
            <MacButton
              key={font.id}
              onClick={() => setCurrentFont(font.id)}
              active={currentFont === font.id}
              className="w-full"
              style={{ fontFamily: font.style }}
            >
              {font.name}
            </MacButton>
          ))}
        </div>
      </div>
    </MacWindow>
  )
}
