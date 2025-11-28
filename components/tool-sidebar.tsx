"use client"

import React, { useState, useEffect } from "react"
import { playSound } from "@/lib/sound-manager"
import { MacWindow, MacButton, ToolIcon } from "./mac-ui"
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
  currentImageStamp: string
  setCurrentImageStamp: (stamp: string) => void
  imageStampSize: number
  setImageStampSize: (size: number) => void
  currentBackground: string
  onSelectBackground: (bg: { value: string; type: 'color' | 'image' | 'gradient' }) => void
  closeDrawer?: boolean
  onDrawerClosed?: () => void
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
  items: { id: string; label: string; isImage?: boolean }[]
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
            className="flex items-center justify-center p-1 transition-transform hover:scale-110"
            style={{
              background: currentItem === item.id 
                ? "linear-gradient(180deg, #ffc0e0 0%, #ff69b4 100%)"
                : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
              border: "2px solid #c71585",
              boxShadow: currentItem === item.id
                ? "inset 2px 2px 0 0 #c71585, inset -2px -2px 0 0 #ffffff"
                : "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
              minHeight: "44px",
            }}
          >
            {item.isImage || item.label.startsWith('/stamps/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={item.label} 
                alt="stamp" 
                width={32}
                height={32}
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                draggable={false}
              />
            ) : (
              <span className="text-2xl">{item.label}</span>
            )}
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
  currentImageStamp,
  setCurrentImageStamp,
  imageStampSize,
  setImageStampSize,
  currentBackground,
  onSelectBackground,
  closeDrawer,
  onDrawerClosed,
}: ToolSidebarProps) {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)
  
  // Close drawer when requested from parent (e.g., when clicking on canvas)
  useEffect(() => {
    if (closeDrawer && activeDrawer) {
      setActiveDrawer(null)
      onDrawerClosed?.()
    }
  }, [closeDrawer, activeDrawer, onDrawerClosed])
  const [customTextInput, setCustomTextInput] = useState("")
  const [imageCategory, setImageCategory] = useState<string>("cake-food")
  
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
    { id: "background", label: "🎨", tooltip: "Background", hasDrawer: true },
    { id: "fill", label: "🪣", tooltip: "Fill", hasDrawer: true },
    { id: "stamp", label: "⭐", tooltip: "Stamps", hasDrawer: true },
    { id: "text", label: "🔤", tooltip: "Text", hasDrawer: true },
    { id: "images", label: "🖼️", tooltip: "Images", hasDrawer: true },
    { id: "shapes", label: "💜", tooltip: "Shapes", hasDrawer: true },
    { id: "wacky", label: "🌀", tooltip: "Wacky", hasDrawer: true },
  ]

  // Background options
  const backgrounds = [
    // Solid colors - more saturated pastels
    { id: 'white', value: '#ffffff', label: 'White', type: 'color' as const },
    { id: 'cream', value: '#fff8dc', label: 'Cream', type: 'color' as const },
    { id: 'lavender', value: '#d8b4fe', label: 'Lavender', type: 'color' as const },
    { id: 'mint', value: '#a7f3d0', label: 'Mint', type: 'color' as const },
    { id: 'blush', value: '#fda4af', label: 'Blush', type: 'color' as const },
    { id: 'peach', value: '#fed7aa', label: 'Peach', type: 'color' as const },
    { id: 'sky', value: '#7dd3fc', label: 'Sky', type: 'color' as const },
    { id: 'rose', value: '#fbb6ce', label: 'Rose', type: 'color' as const },
    { id: 'coral', value: '#fca5a5', label: 'Coral', type: 'color' as const },
    { id: 'lilac', value: '#c4b5fd', label: 'Lilac', type: 'color' as const },
    { id: 'lemon', value: '#fef08a', label: 'Lemon', type: 'color' as const },
    { id: 'aqua', value: '#67e8f9', label: 'Aqua', type: 'color' as const },
    // Gradients
    { id: 'sunset', value: 'linear-gradient(135deg, #fda4af 0%, #fed7aa 50%, #fef08a 100%)', label: 'Sunset', type: 'gradient' as const },
    { id: 'ocean', value: 'linear-gradient(135deg, #67e8f9 0%, #7dd3fc 50%, #c4b5fd 100%)', label: 'Ocean', type: 'gradient' as const },
    { id: 'candy', value: 'linear-gradient(135deg, #fbb6ce 0%, #d8b4fe 50%, #7dd3fc 100%)', label: 'Candy', type: 'gradient' as const },
    { id: 'aurora', value: 'linear-gradient(135deg, #a7f3d0 0%, #67e8f9 50%, #c4b5fd 100%)', label: 'Aurora', type: 'gradient' as const },
    { id: 'princess', value: 'linear-gradient(180deg, #fbb6ce 0%, #fda4af 50%, #d8b4fe 100%)', label: 'Princess', type: 'gradient' as const },
    { id: 'dreamy', value: 'linear-gradient(180deg, #c4b5fd 0%, #fbb6ce 100%)', label: 'Dreamy', type: 'gradient' as const },
    { id: 'tropical', value: 'linear-gradient(135deg, #fef08a 0%, #a7f3d0 50%, #67e8f9 100%)', label: 'Tropical', type: 'gradient' as const },
    { id: 'bubblegum', value: 'linear-gradient(180deg, #f472b6 0%, #fbb6ce 50%, #fda4af 100%)', label: 'Bubblegum', type: 'gradient' as const },
    // Image backgrounds
    { id: 'aquarium', value: '/backgrounds/Aquarium.png', label: 'Aquarium', type: 'image' as const },
    { id: 'barbie', value: '/backgrounds/barbie.png', label: 'Barbie', type: 'image' as const },
    { id: 'cake-maker', value: '/backgrounds/Cake-Maker.png', label: 'Cake Maker', type: 'image' as const },
    { id: 'castle', value: '/backgrounds/castle.png', label: 'Castle', type: 'image' as const },
    { id: 'checkered', value: '/backgrounds/Checkered.png', label: 'Checkered', type: 'image' as const },
    { id: 'glam', value: '/backgrounds/Glam.png', label: 'Glam', type: 'image' as const },
    { id: 'living-room', value: '/backgrounds/Living-Room.png', label: 'Living Room', type: 'image' as const },
    { id: 'party', value: '/backgrounds/Party.png', label: 'Party', type: 'image' as const },
    { id: 'hello-kitty-story', value: '/backgrounds/PC-_-Computer---Hello-Kitty-Big-Fun-Deluxe---Activities---Big-Fun-Storymaking-(Mode-Select)-1.png', label: 'Hello Kitty', type: 'image' as const },
    { id: 'hello-kitty-elements', value: '/backgrounds/PC-_-Computer---Hello-Kitty-Big-Fun-Deluxe---Miscellaneous---Shared-Elements-1.png', label: 'HK Elements', type: 'image' as const },
    { id: 'pick-heart', value: '/backgrounds/Pick-Heart.png', label: 'Pick Heart', type: 'image' as const },
    { id: 'pink-heart-clouds', value: '/backgrounds/Pink-Heart-Clouds.png', label: 'Heart Clouds', type: 'image' as const },
    { id: 'purple', value: '/backgrounds/Purple.png', label: 'Purple', type: 'image' as const },
    { id: 'rainbow-cloud', value: '/backgrounds/Rainbow-Cloud.png', label: 'Rainbow Cloud', type: 'image' as const },
    { id: 'rainbow', value: '/backgrounds/rainbow.png', label: 'Rainbow', type: 'image' as const },
    { id: 'rosey-wallpaper', value: '/backgrounds/Rosey-Wallpaper.png', label: 'Rosey', type: 'image' as const },
    { id: 'salon', value: '/backgrounds/Salon.png', label: 'Salon', type: 'image' as const },
    { id: 'twilight', value: '/backgrounds/Twilight.png', label: 'Twilight', type: 'image' as const },
  ]

  // Handle custom background upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        onSelectBackground({ value: dataUrl, type: 'image' })
        playSound("click")
      }
      reader.readAsDataURL(file)
    }
  }

  // Image categories with their images
  const imageCategories: { id: string; label: string; images: string[] }[] = [
    {
      id: "cake-food",
      label: "Cake+Food",
      images: [
        "brat-cake.png", "burger.png", "cake.png", "cake01.png", "cake02.png",
        "candy.png", "chocolate-cake.png", "chocolate-slice.png", "chocolate.png",
        "cupcake.png", "flan.png", "fries.png", "happymeal.png", "icecream.png",
        "jelly-cake.png", "lollipop.png", "pancake.png", "pizza.png", "pretzel.png",
        "red-velvet.png", "slice.png", "soda.png", "sorbet.png"
      ]
    },
    {
      id: "characters",
      label: "Characters",
      images: [
        "barbie-1.png", "barbie-2.png", "barbie-3.png", "barbie-4.png", "barbie-5.png",
        "barbie-6.png", "barbie-7.png", "bear.png", "bunny.png", "chester.png",
        "chloe.png", "donkey.png", "fiona-2.png", "fiona.png", "gary.png",
        "gingie.png", "grimace.png", "gummybear.png", "hello-kitty.png", "jade.png",
        "lizzie.png", "mcqueen.png", "my-melody.png", "patrick.png", "pbj-time.png",
        "pinoccio.png", "puss.png", "ronald.png", "sasha.png", "shortcake-4.png",
        "shortcake1.png", "shortcake2.png", "shrek-question.png", "shrek.png",
        "spongebob.png", "strawberry-shortcake.png", "yasmin.png",
        "Wii---Chuck-E.-Cheese's-Party-Games---Games---Counting-1.png",
        "Wii---Chuck-E.-Cheese's-Party-Games---Games---Counting-2.png",
        "Wii---Chuck-E.-Cheese's-Party-Games---Games---Counting-3.png",
        "Wii---Chuck-E.-Cheese's-Party-Games---Games---Counting-4.png",
        "Wii---Chuck-E.-Cheese's-Party-Games---Games---Counting-5.png"
      ]
    },
    {
      id: "decorations",
      label: "Decorations",
      images: [
        "airhorn.png", "balloons-10.png", "balloons-11.png", "balloons-12.png",
        "balloons-13.png", "balloons-2.png", "balloons-3.png", "balloons-4.png",
        "balloons-5.png", "balloons-6.png", "balloons-7.png", "balloons-8.png",
        "balloons-9.png", "balloons.png", "bday-cake.png", "blue-balloon.png",
        "candle.png", "flower-balloon.png", "party-hat.png", "present.png"
      ]
    },
    {
      id: "junior",
      label: "Junior",
      images: []
    },
    {
      id: "twilight",
      label: "Twilight",
      images: [
        "01-73.png", "02-1.png", "11676fb764d8a176f7b11beea551a840-1.png",
        "20210730233536696405-cakeify-1.png", "214c9ddd2b5ef07f80b02cba9697de43-1.png",
        "3485ed3f0a45212e1a0b0d1efd74094f-1.png", "3c2fa95db9a14aaa20e10b9e1a931f3b-1.png",
        "6918e9a8f58845bfba46684f78f0e1bd-1.png", "Twilight-Logo.png",
        "a8c4dea2f211254babb1ebad7edbd90d-1.png", "c68145d2793baa2c0c0366607d472d45-1.png",
        "e7204ac52980c9d84e63b2ac604d3fc4-1.png", "image-1229.png"
      ]
    }
  ]

  const imageStampSizes = [40, 60, 80, 100, 150, 200]

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

  // Generate stamp list from KidPix icons (1-109, skipping 19-20 which don't exist)
  const stamps = [
    ...Array.from({ length: 18 }, (_, i) => i + 1),
    ...Array.from({ length: 89 }, (_, i) => i + 21),
  ].map(n => ({
    id: `/stamps/kidpix-spritesheet-0-${n}.png`,
    label: `/stamps/kidpix-spritesheet-0-${n}.png`,
    isImage: true,
  }))

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
  }

  const handleUploadImage = () => {
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
                    <span className="text-sm">{shape.icon}</span>
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
                    <span className="text-sm">{shape.icon}</span>
                  </MacButton>
                ))}
              </div>
            </div>
          </MacWindow>
        )

      case "background":
        return (
          <MacWindow className="p-3 w-72 max-h-[500px] overflow-y-auto mac-scrollbar">
            {/* Upload Your Own */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #f472b6 0%, #c084fc 100%)">
                📤 Upload Your Own
              </SectionHeader>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleBackgroundUpload(e)
                    setActiveDrawer(null)
                  }}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:bg-pink-50 hover:border-pink-400 transition-all">
                  <span className="text-lg">🖼️</span>
                  <span className="text-xs pixel-text text-pink-600">Choose Image...</span>
                </div>
              </label>
            </div>

            {/* Image Backgrounds */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #ffd700 100%)">
                🖼️ Image Backgrounds
              </SectionHeader>
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto mac-scrollbar">
                {backgrounds.filter(bg => bg.type === 'image').map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      onSelectBackground({ value: bg.value, type: bg.type })
                      playSound("click")
                      setActiveDrawer(null)
                    }}
                    className={`group flex flex-col items-center gap-0.5 p-1 rounded transition-all hover:scale-105 ${
                      currentBackground === bg.value ? 'ring-2 ring-pink-500 bg-pink-100' : 'hover:bg-pink-50'
                    }`}
                    title={bg.label}
                  >
                    <div 
                      className="w-12 h-9 border-2 rounded-sm"
                      style={{ 
                        backgroundImage: `url(${bg.value})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderColor: currentBackground === bg.value ? '#ff1493' : '#ccc',
                      }}
                    />
                    <span className="text-[7px] pixel-text text-gray-600 leading-tight truncate max-w-[50px]">
                      {bg.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gradients */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #fbb6ce 0%, #c4b5fd 50%, #7dd3fc 100%)">
                ✨ Gradients
              </SectionHeader>
              <div className="grid grid-cols-4 gap-1">
                {backgrounds.filter(bg => bg.type === 'gradient').map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      onSelectBackground({ value: bg.value, type: bg.type })
                      playSound("click")
                      setActiveDrawer(null)
                    }}
                    className={`group flex flex-col items-center gap-0.5 p-1 rounded transition-all hover:scale-105 ${
                      currentBackground === bg.value ? 'ring-2 ring-pink-500 bg-pink-100' : 'hover:bg-pink-50'
                    }`}
                    title={bg.label}
                  >
                    <div 
                      className="w-7 h-7 border-2 rounded-sm"
                      style={{ 
                        background: bg.value,
                        borderColor: currentBackground === bg.value ? '#ff1493' : '#ccc',
                      }}
                    />
                    <span className="text-[7px] pixel-text text-gray-600 leading-tight truncate max-w-[32px]">
                      {bg.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solid Colors */}
            <div>
              <SectionHeader gradient="linear-gradient(90deg, #00e5ff 0%, #a855f7 100%)">
                Solid Colors
              </SectionHeader>
              <div className="grid grid-cols-4 gap-1">
                {backgrounds.filter(bg => bg.type === 'color').map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      onSelectBackground({ value: bg.value, type: bg.type })
                      playSound("click")
                      setActiveDrawer(null)
                    }}
                    className={`group flex flex-col items-center gap-0.5 p-1 rounded transition-all hover:scale-105 ${
                      currentBackground === bg.value ? 'ring-2 ring-pink-500 bg-pink-100' : 'hover:bg-pink-50'
                    }`}
                    title={bg.label}
                  >
                    <div 
                      className="w-7 h-7 border-2 rounded-sm"
                      style={{ 
                        backgroundColor: bg.value,
                        borderColor: currentBackground === bg.value ? '#ff1493' : '#ccc',
                      }}
                    />
                    <span className="text-[8px] pixel-text text-gray-600 leading-tight truncate max-w-[32px]">
                      {bg.label}
                    </span>
                  </button>
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
          <MacWindow className="p-3 w-72 max-h-[500px] overflow-y-auto mac-scrollbar">
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

            {/* All Stamps */}
            <div>
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">
                ⭐ Stamps
              </SectionHeader>
              <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto mac-scrollbar">
                {stamps.map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => {
                      setCurrentStamp(stamp.id)
                      playSound("click")
                      setActiveDrawer(null)
                    }}
                    className={`group flex items-center justify-center p-1 rounded transition-all hover:scale-110 ${
                      currentStamp === stamp.id ? 'ring-2 ring-pink-500 bg-pink-100' : 'hover:bg-pink-50'
                    }`}
                    title={`Stamp ${stamp.id}`}
                  >
                    <img 
                      src={stamp.id} 
                      alt="stamp"
                      className="w-8 h-8 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                ))}
              </div>
            </div>
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
                  className="w-full"
                >
                  <span className="mr-2">{effect.icon}</span>
                  {effect.label}
                </MacButton>
              ))}
            </div>
            <p className="text-[9px] pixel-text text-gray-500 mt-2 text-center">
              Click & drag on canvas to apply effect!
            </p>
          </MacWindow>
        )

      case "images":
        const currentCategory = imageCategories.find(c => c.id === imageCategory) || imageCategories[0]
        return (
          <MacWindow className="p-3 w-64">
            {/* Upload your own */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">
                📤 Upload Your Own
              </SectionHeader>
              <MacButton
                primary
                onClick={() => {
                  handleUploadImage()
                  playSound("click")
                }}
                className="w-full"
              >
                Choose Image...
              </MacButton>
            </div>

            {/* Image Size */}
            <div className="mb-3">
              <SectionHeader gradient="linear-gradient(90deg, #ffd700 0%, #ff6b6b 100%)">
                📏 Image Size
              </SectionHeader>
              <div className="flex gap-1 flex-wrap">
                {imageStampSizes.map((size) => (
                  <MacButton
                    key={size}
                    onClick={() => {
                      setImageStampSize(size)
                      playSound("click")
                    }}
                    active={imageStampSize === size}
                    style={{ width: "40px", padding: "4px", fontSize: "11px" }}
                  >
                    {size}
                  </MacButton>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-2">
              <SectionHeader gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)">
                🗂️ Categories
              </SectionHeader>
              <div className="flex flex-wrap gap-1">
                {imageCategories.map((cat) => (
                  <MacButton
                    key={cat.id}
                    onClick={() => {
                      setImageCategory(cat.id)
                      playSound("click")
                    }}
                    active={imageCategory === cat.id}
                    style={{ 
                      padding: "4px 8px", 
                      fontSize: "10px",
                      opacity: cat.images.length === 0 ? 0.5 : 1 
                    }}
                    disabled={cat.images.length === 0}
                  >
                    {cat.label}
                  </MacButton>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="mb-2">
              <SectionHeader gradient="linear-gradient(90deg, #00e5ff 0%, #7fff00 100%)">
                🎨 {currentCategory.label}
              </SectionHeader>
              <div className="max-h-48 overflow-y-auto mac-scrollbar">
                <div className="grid grid-cols-4 gap-1">
                  {currentCategory.images.map((img) => {
                    const imagePath = `/images/${imageCategory}/${img}`
                    return (
                      <button
                        key={img}
                        onClick={() => {
                          setCurrentImageStamp(imagePath)
                          setCurrentTool("images")
                          playSound("click")
                        }}
                        className={`p-1 transition-transform hover:scale-110 ${
                          currentImageStamp === imagePath ? "ring-2 ring-pink-500 scale-110" : ""
                        }`}
                        style={{
                          background: currentImageStamp === imagePath
                            ? "linear-gradient(180deg, #ffc0e0 0%, #ff69b4 100%)"
                            : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                          border: "2px solid #c71585",
                          borderRadius: "4px",
                          minHeight: "44px",
                        }}
                        title={img.replace(/\.png$/, "").replace(/-/g, " ")}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePath}
                          alt={img}
                          width={32}
                          height={32}
                          style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                          draggable={false}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
              {currentCategory.images.length === 0 && (
                <p className="text-[10px] pixel-text text-gray-500 text-center py-4">
                  No images in this category yet!
                </p>
              )}
            </div>

            <p className="text-[9px] pixel-text text-gray-500 mt-2 text-center">
              Click canvas to place • Click placed image to select & resize
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
              <span className="text-lg">{tool.label}</span>
            </ToolIcon>
          ))}
          <ToolIcon
            onClick={() => handleUndoRedo("undo")}
            active={false}
            title="Undo"
            style={{ width: "44px", height: "44px", opacity: canUndo ? 1 : 0.5 }}
          >
            <span className="text-lg">↩️</span>
          </ToolIcon>
          <ToolIcon
            onClick={() => handleUndoRedo("redo")}
            active={false}
            title="Redo"
            style={{ width: "44px", height: "44px", opacity: canRedo ? 1 : 0.5 }}
          >
            <span className="text-lg">↪️</span>
          </ToolIcon>
        </div>
        {activeDrawer && <div className="mt-3">{renderDrawer()}</div>}
      </MacWindow>
    )
  }

  // Helper to render background preview
  const renderBackgroundPreview = () => {
    if (!currentBackground || currentBackground === '#ffffff') {
      // Default - show emoji
      return <span className="text-lg">🎨</span>
    }
    
    // Check if it's an image (starts with / or data:)
    if (currentBackground.startsWith('/') || currentBackground.startsWith('data:')) {
      return (
        <div 
          className="w-8 h-8 rounded border-2 border-white"
          style={{
            backgroundImage: `url(${currentBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )
    }
    
    // Check if it's a gradient
    if (currentBackground.startsWith('linear-gradient')) {
      return (
        <div 
          className="w-8 h-8 rounded border-2 border-white"
          style={{ background: currentBackground }}
        />
      )
    }
    
    // It's a color
    return (
      <div 
        className="w-8 h-8 rounded border-2 border-white"
        style={{ backgroundColor: currentBackground }}
      />
    )
  }

  // Desktop layout with drawer
  return (
    <div className="relative h-full">
      {/* Main toolbar */}
      <MacWindow className="p-2 flex flex-col h-full">
        <div className="flex flex-col justify-between h-full">
          {tools.map((tool) => (
            <div key={tool.id} className="group relative flex flex-col items-center">
              <ToolIcon
                onClick={() => handleToolClick(tool.id, tool.hasDrawer)}
                active={currentTool === tool.id}
                title={tool.tooltip}
              >
                {tool.id === 'background' ? renderBackgroundPreview() : <span className="text-lg">{tool.label}</span>}
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
              <span className="text-lg">↩️</span>
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
              <span className="text-lg">↪️</span>
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
