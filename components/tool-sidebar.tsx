"use client"

import { useState } from "react"
import { playSound } from "@/lib/sound-manager"
import { MacWindow, MacButton, ToolIcon } from "./mac-ui"
import { PixelEmoji } from "./pixel-emoji"
import type { BrushShape } from "./canvas-area"

export type FillPattern = 
  | "solid" 
  | "stripes-h" 
  | "stripes-v" 
  | "stripes-d" 
  | "dots" 
  | "checkerboard" 
  | "hearts" 
  | "stars" 
  | "zigzag"
  | "confetti"

export type WackyEffect = "smear" | "mirror" | "pixelate" | "rainbow" | "scramble"

interface ToolSidebarProps {
  currentTool: string
  setCurrentTool: (tool: string) => void
  currentStamp: string
  setCurrentStamp: (stamp: string) => void
  stampSize: number
  setStampSize: (size: number) => void
  currentShape: string
  setCurrentShape: (shape: string) => void
  brushSize: number
  setBrushSize: (size: number) => void
  brushShape: BrushShape
  setBrushShape: (shape: BrushShape) => void
  eraserSize: number
  setEraserSize: (size: number) => void
  eraserShape: BrushShape
  setEraserShape: (shape: BrushShape) => void
  colors: string[]
  currentColor: string
  setCurrentColor: (color: string) => void
  currentPattern: FillPattern
  setCurrentPattern: (pattern: FillPattern) => void
  currentFont: string
  setCurrentFont: (font: string) => void
  wackyEffect: WackyEffect
  setWackyEffect: (effect: WackyEffect) => void
  addSpecialText: (text: string) => void
  addCustomText: (text: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  isMobile?: boolean
  onClose?: () => void
}

// Section header component
function SectionHeader({ children, gradient }: { children: React.ReactNode; gradient: string }) {
  return (
    <h3
      className="text-xs font-bold mb-2 pixel-text text-white px-2 py-1"
      style={{ background: gradient }}
    >
      {children}
    </h3>
  )
}

// Pattern preview component
function PatternPreview({ pattern, color }: { pattern: FillPattern; color: string }) {
  const size = 24
  const bgColor = "#ffffff"
  
  const getPatternSVG = () => {
    switch (pattern) {
      case "solid":
        return `<rect width="${size}" height="${size}" fill="${color}"/>`
      case "stripes-h":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <line x1="0" y1="4" x2="${size}" y2="4" stroke="${color}" stroke-width="4"/>
          <line x1="0" y1="12" x2="${size}" y2="12" stroke="${color}" stroke-width="4"/>
          <line x1="0" y1="20" x2="${size}" y2="20" stroke="${color}" stroke-width="4"/>`
      case "stripes-v":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <line x1="4" y1="0" x2="4" y2="${size}" stroke="${color}" stroke-width="4"/>
          <line x1="12" y1="0" x2="12" y2="${size}" stroke="${color}" stroke-width="4"/>
          <line x1="20" y1="0" x2="20" y2="${size}" stroke="${color}" stroke-width="4"/>`
      case "stripes-d":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${color}" stroke-width="3"/>
          <line x1="-8" y1="8" x2="16" y2="32" stroke="${color}" stroke-width="3"/>
          <line x1="8" y1="-8" x2="32" y2="16" stroke="${color}" stroke-width="3"/>`
      case "dots":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <circle cx="6" cy="6" r="3" fill="${color}"/>
          <circle cx="18" cy="6" r="3" fill="${color}"/>
          <circle cx="6" cy="18" r="3" fill="${color}"/>
          <circle cx="18" cy="18" r="3" fill="${color}"/>
          <circle cx="12" cy="12" r="3" fill="${color}"/>`
      case "checkerboard":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <rect x="0" y="0" width="8" height="8" fill="${color}"/>
          <rect x="16" y="0" width="8" height="8" fill="${color}"/>
          <rect x="8" y="8" width="8" height="8" fill="${color}"/>
          <rect x="0" y="16" width="8" height="8" fill="${color}"/>
          <rect x="16" y="16" width="8" height="8" fill="${color}"/>`
      case "hearts":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <text x="4" y="14" font-size="10">💖</text>`
      case "stars":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <text x="4" y="14" font-size="10">⭐</text>`
      case "zigzag":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <polyline points="0,8 6,2 12,8 18,2 24,8" fill="none" stroke="${color}" stroke-width="3"/>
          <polyline points="0,18 6,12 12,18 18,12 24,18" fill="none" stroke="${color}" stroke-width="3"/>`
      case "confetti":
        return `<rect width="${size}" height="${size}" fill="${bgColor}"/>
          <rect x="2" y="3" width="4" height="4" fill="${color}" transform="rotate(15 4 5)"/>
          <rect x="14" y="2" width="4" height="4" fill="#ff69b4" transform="rotate(-20 16 4)"/>
          <rect x="8" y="10" width="4" height="4" fill="#a855f7" transform="rotate(30 10 12)"/>
          <rect x="3" y="16" width="4" height="4" fill="#00e5ff" transform="rotate(-10 5 18)"/>
          <rect x="16" y="14" width="4" height="4" fill="#ffd700" transform="rotate(25 18 16)"/>`
      default:
        return `<rect width="${size}" height="${size}" fill="${color}"/>`
    }
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${getPatternSVG()}</svg>`
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`
  
  return (
    <div 
      className="w-6 h-6 border border-gray-400"
      style={{ 
        backgroundImage: `url("${dataUrl}")`,
        backgroundSize: 'cover',
      }}
    />
  )
}

// Pattern picker component
function PatternPicker({
  patterns,
  currentPattern,
  currentColor,
  onSelect,
}: {
  patterns: { id: FillPattern; label: string }[]
  currentPattern: FillPattern
  currentColor: string
  onSelect: (pattern: FillPattern) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {patterns.map((pattern) => (
        <button
          key={pattern.id}
          onClick={() => {
            onSelect(pattern.id)
            playSound("click")
          }}
          className={`p-1 transition-transform hover:scale-110 ${
            currentPattern === pattern.id ? "ring-2 ring-accent ring-offset-1 scale-110" : ""
          }`}
          style={{
            border: currentPattern === pattern.id ? "2px solid #ff1493" : "2px solid #c71585",
            background: "white",
          }}
          title={pattern.label}
        >
          <PatternPreview pattern={pattern.id} color={currentColor} />
        </button>
      ))}
    </div>
  )
}

// Color picker component matching the old style
function ColorPicker({
  colors,
  currentColor,
  onSelect,
}: {
  colors: string[]
  currentColor: string
  onSelect: (color: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => {
            onSelect(color)
            playSound("click")
          }}
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
  )
}

// Drawer content component with pagination for stamps/shapes
function PaginatedPicker({
  title,
  items,
  currentItem,
  onSelect,
  itemsPerPage = 8,
  columns = 4,
  gradient,
}: {
  title: string
  items: { id: string; label: string }[]
  currentItem: string
  onSelect: (id: string) => void
  itemsPerPage?: number
  columns?: number
  gradient: string
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = page * itemsPerPage
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage)

  const goNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1)
      playSound("click")
    }
  }

  const goPrev = () => {
    if (page > 0) {
      setPage(page - 1)
      playSound("click")
    }
  }

  return (
    <div>
      <SectionHeader gradient={gradient}>{title}</SectionHeader>
      
      <div className={`grid gap-1.5 mb-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSelect(item.id)
              playSound("click")
            }}
            className="flex items-center justify-center p-2 transition-transform hover:scale-110"
            style={{
              background: currentItem === item.id 
                ? "linear-gradient(180deg, #ffc0e0 0%, #ff69b4 100%)"
                : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
              border: "2px solid #c71585",
              boxShadow: currentItem === item.id
                ? "inset 2px 2px 0 0 #c71585, inset -2px -2px 0 0 #ffffff"
                : "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
            }}
          >
            <PixelEmoji emoji={item.label} size="lg" />
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <MacButton
            onClick={goPrev}
            disabled={page === 0}
            style={{ padding: "4px 12px", opacity: page === 0 ? 0.5 : 1 }}
          >
            ◀
          </MacButton>
          <span className="text-xs pixel-text" style={{ color: "#c71585" }}>
            {page + 1} / {totalPages}
          </span>
          <MacButton
            onClick={goNext}
            disabled={page >= totalPages - 1}
            style={{ padding: "4px 12px", opacity: page >= totalPages - 1 ? 0.5 : 1 }}
          >
            ▶
          </MacButton>
        </div>
      )}
    </div>
  )
}

export default function ToolSidebar({
  currentTool,
  setCurrentTool,
  currentStamp,
  setCurrentStamp,
  stampSize,
  setStampSize,
  currentShape,
  setCurrentShape,
  brushSize,
  setBrushSize,
  brushShape,
  setBrushShape,
  eraserSize,
  setEraserSize,
  eraserShape,
  setEraserShape,
  colors,
  currentColor,
  setCurrentColor,
  currentPattern,
  setCurrentPattern,
  currentFont,
  setCurrentFont,
  wackyEffect,
  setWackyEffect,
  addSpecialText,
  addCustomText,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isMobile,
  onClose,
}: ToolSidebarProps) {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)
  const [customTextInput, setCustomTextInput] = useState("")
  
  const patterns: { id: FillPattern; label: string }[] = [
    { id: "solid", label: "Solid" },
    { id: "stripes-h", label: "Horizontal Stripes" },
    { id: "stripes-v", label: "Vertical Stripes" },
    { id: "stripes-d", label: "Diagonal Stripes" },
    { id: "dots", label: "Polka Dots" },
    { id: "checkerboard", label: "Checkerboard" },
    { id: "hearts", label: "Hearts" },
    { id: "stars", label: "Stars" },
    { id: "zigzag", label: "Zigzag" },
    { id: "confetti", label: "Confetti" },
  ]

  const wackyEffects: { id: WackyEffect; label: string; icon: string }[] = [
    { id: "smear", label: "Smear", icon: "👆" },
    { id: "mirror", label: "Mirror", icon: "🪞" },
    { id: "pixelate", label: "Pixelate", icon: "🔲" },
    { id: "rainbow", label: "Rainbow", icon: "🌈" },
    { id: "scramble", label: "Scramble", icon: "🌀" },
  ]

  const tools = [
    { id: "brush", label: "🖌️", tooltip: "Brush", hasDrawer: true },
    { id: "eraser", label: "🧹", tooltip: "Eraser", hasDrawer: true },
    { id: "fill", label: "🪣", tooltip: "Fill", hasDrawer: true },
    { id: "stamp", label: "⭐", tooltip: "Stamps", hasDrawer: true },
    { id: "text", label: "🔤", tooltip: "Text", hasDrawer: true },
    { id: "upload", label: "🖼️", tooltip: "Image" },
    { id: "shapes", label: "💜", tooltip: "Shapes", hasDrawer: true },
    { id: "wacky", label: "🌀", tooltip: "Wacky", hasDrawer: true },
  ]

  const sizes = [2, 5, 10, 15, 20]
  const stampSizes = [20, 32, 48, 64, 80]
  const brushShapes: { id: BrushShape; label: string; icon: string }[] = [
    { id: "round", label: "Round", icon: "⚫" },
    { id: "square", label: "Square", icon: "⬛" },
    { id: "spray", label: "Spray", icon: "💨" },
  ]

  const fonts = [
    { id: "pixel", name: "Pixel", style: 'var(--font-pixel), "Pixelify Sans", monospace' },
    { id: "bubble", name: "Bubble", style: 'var(--font-bubble), "Bagel Fat One", cursive' },
    { id: "script", name: "Script", style: 'var(--font-script), "Imperial Script", cursive' },
    { id: "narrow", name: "Narrow", style: 'var(--font-narrow), "Instrument Serif", serif' },
  ]

  const laurenSpecials = [
    { text: "Happy 30th Lauren!", style: "primary" as const },
    { text: "Dirty 30!", style: "secondary" as const },
    { text: "Forever 21 + 9", style: "accent" as const },
  ]

  const stamps = [
    "⭐", "✨", "💖", "🎂", "🎁", "🎈", "🎉", "🦋", 
    "🌸", "🌈", "💎", "👑", "🎀", "💫", "🔥", "💕",
    "🍰", "🧁", "🎊", "🥳", "💝", "🌟", "🎵", "🎶",
    "🦄", "🌺", "🍬", "🍭", "💐", "🥂", "🎤", "💃",
  ].map(s => ({ id: s, label: s }))

  const shapes = [
    { id: "heart", label: "💜" },
    { id: "star", label: "⭐" },
    { id: "circle", label: "⚫" },
    { id: "square", label: "⬛" },
    { id: "triangle", label: "🔺" },
    { id: "diamond", label: "🔷" },
  ]

  const handleToolClick = (toolId: string, hasDrawer?: boolean) => {
    setCurrentTool(toolId)
    playSound("click")

    if (hasDrawer) {
      setActiveDrawer(activeDrawer === toolId ? null : toolId)
    } else {
      setActiveDrawer(null)
      if (isMobile && onClose) {
        onClose()
      }
    }

    if (toolId === "upload") {
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

  const handleUndoRedo = (action: "undo" | "redo") => {
    playSound("click")
    if (action === "undo") onUndo()
    else onRedo()
  }

  const handleSpecialTextClick = (text: string) => {
    addSpecialText(text)
    playSound("stamp")
  }

  const renderDrawer = () => {
    switch (activeDrawer) {
      case "brush":
        return (
          <MacWindow className="p-3 w-52">
            {/* Colors */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">
                Colors
              </SectionHeader>
              <ColorPicker colors={colors} currentColor={currentColor} onSelect={setCurrentColor} />
            </div>

            {/* Brush Options */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)">
                Brush
              </SectionHeader>
              
              <span className="text-xs pixel-text text-pink-700 mb-1 block">Size</span>
              <div className="flex gap-1 flex-wrap mb-2">
                {sizes.map((size) => (
                  <MacButton
                    key={size}
                    onClick={() => {
                      setBrushSize(size)
                      playSound("click")
                    }}
                    active={brushSize === size}
                    style={{ width: "36px", padding: "4px" }}
                  >
                    {size}
                  </MacButton>
                ))}
              </div>

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
                    <PixelEmoji emoji={shape.icon} size="sm" />
                  </MacButton>
                ))}
              </div>
            </div>
          </MacWindow>
        )

      case "eraser":
        return (
          <MacWindow className="p-3 w-52">
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #00e5ff 0%, #7fff00 100%)">
                Eraser
              </SectionHeader>
              
              <span className="text-xs pixel-text text-teal-700 mb-1 block">Size</span>
              <div className="flex gap-1 flex-wrap mb-2">
                {sizes.map((size) => (
                  <MacButton
                    key={size}
                    onClick={() => {
                      setEraserSize(size)
                      playSound("click")
                    }}
                    active={eraserSize === size}
                    style={{ width: "36px", padding: "4px" }}
                  >
                    {size}
                  </MacButton>
                ))}
              </div>

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
                    <PixelEmoji emoji={shape.icon} size="sm" />
                  </MacButton>
                ))}
              </div>
            </div>
          </MacWindow>
        )

      case "fill":
        return (
          <MacWindow className="p-3 w-56">
            {/* Colors */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">
                Fill Color
              </SectionHeader>
              <ColorPicker colors={colors} currentColor={currentColor} onSelect={setCurrentColor} />
            </div>

            {/* Patterns */}
            <div>
              <SectionHeader gradient="linear-gradient(90deg, #ffd700 0%, #ff6b6b 100%)">
                Fill Pattern
              </SectionHeader>
              <PatternPicker 
                patterns={patterns} 
                currentPattern={currentPattern} 
                currentColor={currentColor}
                onSelect={setCurrentPattern} 
              />
            </div>
          </MacWindow>
        )

      case "stamp":
        return (
          <MacWindow className="p-3 w-52">
            {/* Size */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ffd700 0%, #ff6b6b 100%)">
                Stamp Size
              </SectionHeader>
              <div className="flex gap-1 flex-wrap">
                {stampSizes.map((size) => (
                  <MacButton
                    key={size}
                    onClick={() => {
                      setStampSize(size)
                      playSound("click")
                    }}
                    active={stampSize === size}
                    style={{ width: "40px", padding: "4px", fontSize: `${Math.min(size / 4, 16)}px` }}
                  >
                    {size}
                  </MacButton>
                ))}
              </div>
            </div>

            <PaginatedPicker
              title="Stamps"
              items={stamps}
              currentItem={currentStamp}
              onSelect={setCurrentStamp}
              itemsPerPage={8}
              columns={4}
              gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)"
            />
          </MacWindow>
        )

      case "text":
        return (
          <MacWindow className="p-3 w-56">
            {/* Custom Text Input */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">
                Type Your Text
              </SectionHeader>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={customTextInput}
                  onChange={(e) => setCustomTextInput(e.target.value)}
                  placeholder="Enter text..."
                  className="flex-1 px-2 py-1 text-sm border-2 border-pink-400 rounded pixel-text"
                  style={{ 
                    fontFamily: fonts.find(f => f.id === currentFont)?.style,
                    background: 'linear-gradient(180deg, #fff 0%, #ffe4f3 100%)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTextInput.trim()) {
                      addCustomText(customTextInput.trim())
                      setCustomTextInput("")
                      playSound("stamp")
                    }
                  }}
                />
                <MacButton
                  primary
                  onClick={() => {
                    if (customTextInput.trim()) {
                      addCustomText(customTextInput.trim())
                      setCustomTextInput("")
                      playSound("stamp")
                    }
                  }}
                  style={{ padding: "4px 8px" }}
                >
                  Add
                </MacButton>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)">
                Text Color
              </SectionHeader>
              <ColorPicker colors={colors} currentColor={currentColor} onSelect={setCurrentColor} />
            </div>

            {/* Fonts */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ffd700 0%, #ff1493 100%)">
                Fonts
              </SectionHeader>
              <div className="space-y-1.5">
                {fonts.map((font) => (
                  <MacButton
                    key={font.id}
                    onClick={() => {
                      setCurrentFont(font.id)
                      playSound("click")
                    }}
                    active={currentFont === font.id}
                    className="w-full"
                    style={{ fontFamily: font.style }}
                  >
                    {font.name}
                  </MacButton>
                ))}
              </div>
            </div>

            {/* Lauren Specials */}
            <div>
              <SectionHeader gradient="linear-gradient(90deg, #00e5ff 0%, #7fff00 100%)">
                ✨ Lauren Specials
              </SectionHeader>
              <div className="space-y-1.5">
                {laurenSpecials.map((special, i) => (
                  <MacButton
                    key={i}
                    primary={special.style === "primary"}
                    secondary={special.style === "secondary"}
                    accent={special.style === "accent"}
                    className="w-full"
                    onClick={() => handleSpecialTextClick(special.text)}
                  >
                    {special.text}
                  </MacButton>
                ))}
              </div>
            </div>
          </MacWindow>
        )

      case "shapes":
        return (
          <MacWindow className="p-3 w-52">
            {/* Colors */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">
                Colors
              </SectionHeader>
              <ColorPicker colors={colors} currentColor={currentColor} onSelect={setCurrentColor} />
            </div>

            {/* Shapes */}
            <PaginatedPicker
              title="Shapes"
              items={shapes}
              currentItem={currentShape}
              onSelect={setCurrentShape}
              itemsPerPage={6}
              columns={3}
              gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)"
            />
          </MacWindow>
        )

      case "wacky":
        return (
          <MacWindow className="p-3 w-52">
            <SectionHeader gradient="linear-gradient(90deg, #ff6b6b 0%, #ffd700 50%, #7fff00 100%)">
              🌀 Wacky Effects
            </SectionHeader>
            <div className="space-y-1.5">
              {wackyEffects.map((effect) => (
                <MacButton
                  key={effect.id}
                  onClick={() => {
                    setWackyEffect(effect.id)
                    playSound("click")
                  }}
                  active={wackyEffect === effect.id}
                  className="w-full flex items-center"
                >
                  <span className="mr-2"><PixelEmoji emoji={effect.icon} size="sm" /></span>
                  {effect.label}
                </MacButton>
              ))}
            </div>
            <p className="text-[9px] pixel-text text-gray-500 mt-2 text-center">
              Click & drag on canvas to apply effect!
            </p>
          </MacWindow>
        )

      default:
        return null
    }
  }

  // Mobile layout
  if (isMobile) {
    return (
      <MacWindow className="p-2 pb-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-sm font-bold pixel-text text-primary">Tools</span>
          <MacButton primary onClick={onClose}>
            Done
          </MacButton>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {tools.map((tool) => (
            <ToolIcon
              key={tool.id}
              onClick={() => handleToolClick(tool.id, tool.hasDrawer)}
              active={currentTool === tool.id}
              title={tool.tooltip}
              style={{ width: "44px", height: "44px" }}
            >
              <PixelEmoji emoji={tool.label} size="md" />
            </ToolIcon>
          ))}
          <ToolIcon
            onClick={() => handleUndoRedo("undo")}
            active={false}
            title="Undo"
            style={{ width: "44px", height: "44px", opacity: canUndo ? 1 : 0.5 }}
          >
            <PixelEmoji emoji="↩️" size="md" />
          </ToolIcon>
          <ToolIcon
            onClick={() => handleUndoRedo("redo")}
            active={false}
            title="Redo"
            style={{ width: "44px", height: "44px", opacity: canRedo ? 1 : 0.5 }}
          >
            <PixelEmoji emoji="↪️" size="md" />
          </ToolIcon>
        </div>
        {activeDrawer && <div className="mt-3">{renderDrawer()}</div>}
      </MacWindow>
    )
  }

  // Desktop layout with drawer
  return (
    <div className="relative">
      {/* Main toolbar */}
      <MacWindow className="p-2 flex flex-col gap-1 max-h-full overflow-y-auto mac-scrollbar">
        <div className="flex flex-col gap-1">
          {tools.map((tool) => (
            <div key={tool.id} className="group relative flex flex-col items-center">
              <ToolIcon
                onClick={() => handleToolClick(tool.id, tool.hasDrawer)}
                active={currentTool === tool.id}
                title={tool.tooltip}
              >
                <PixelEmoji emoji={tool.label} size="md" />
              </ToolIcon>
              <span 
                className="text-[9px] pixel-text mt-0.5 text-center leading-tight"
                style={{ color: currentTool === tool.id ? "#ff1493" : "#c71585" }}
              >
                {tool.tooltip}
              </span>
            </div>
          ))}

          <div className="group relative flex flex-col items-center">
            <ToolIcon
              onClick={() => handleUndoRedo("undo")}
              active={false}
              title="Undo"
              style={{ opacity: canUndo ? 1 : 0.5 }}
            >
              <PixelEmoji emoji="↩️" size="md" />
            </ToolIcon>
            <span 
              className="text-[9px] pixel-text mt-0.5 text-center leading-tight"
              style={{ color: "#c71585", opacity: canUndo ? 1 : 0.5 }}
            >
              Undo
            </span>
          </div>
          <div className="group relative flex flex-col items-center">
            <ToolIcon
              onClick={() => handleUndoRedo("redo")}
              active={false}
              title="Redo"
              style={{ opacity: canRedo ? 1 : 0.5 }}
            >
              <PixelEmoji emoji="↪️" size="md" />
            </ToolIcon>
            <span 
              className="text-[9px] pixel-text mt-0.5 text-center leading-tight"
              style={{ color: "#c71585", opacity: canRedo ? 1 : 0.5 }}
            >
              Redo
            </span>
          </div>
        </div>
      </MacWindow>

      {/* Drawer that floats to the right (overlay) */}
      {activeDrawer && (
        <div 
          className="absolute left-full top-0 ml-1 z-50 animate-in slide-in-from-left-2 duration-200"
          style={{ animationFillMode: 'forwards' }}
        >
          {renderDrawer()}
        </div>
      )}
    </div>
  )
}
