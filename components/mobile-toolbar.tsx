"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { MacButton } from "./mac-ui"
import type { BrushShape } from "./canvas-area"
import type { FillPattern, WackyEffect } from "./tool-sidebar"

type MobilePanel = 
  | "none" 
  | "draw" 
  | "stamps" 
  | "images"
  | "text"
  | "backgrounds"
  | "more"
  | "brushOptions" 
  | "eraserOptions"
  | "stampSize"
  | "imageSize"

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
  stampSize: number
  setStampSize: (size: number) => void
  currentShape: string
  setCurrentShape: (shape: string) => void
  currentImageStamp: string
  setCurrentImageStamp: (stamp: string) => void
  imageStampSize: number
  setImageStampSize: (size: number) => void
  currentPattern: FillPattern
  setCurrentPattern: (pattern: FillPattern) => void
  wackyEffect: WackyEffect
  setWackyEffect: (effect: WackyEffect) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  colors: string[]
  currentFont: string
  setCurrentFont: (font: string) => void
  addSpecialText: (text: string) => void
  addCustomText: (text: string, font: string, color: string) => void
  onSelectBackground: (bg: { type: 'color' | 'gradient' | 'image'; value: string }) => void
  onNewCard: () => void
  onSave: () => void
  onHelp: () => void
  onGenerateRandomStamps?: () => void
  onGenerateRandomImages?: () => void
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
  stampSize,
  setStampSize,
  currentShape,
  setCurrentShape,
  currentImageStamp,
  setCurrentImageStamp,
  imageStampSize,
  setImageStampSize,
  currentPattern,
  setCurrentPattern,
  wackyEffect,
  setWackyEffect,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  colors,
  currentFont,
  setCurrentFont,
  addSpecialText,
  addCustomText,
  onSelectBackground,
  onNewCard,
  onSave,
  onHelp,
  onGenerateRandomStamps,
  onGenerateRandomImages,
}: MobileToolbarProps) {
  const [imageCategory, setImageCategory] = useState("cake-food")
  const [customText, setCustomText] = useState("")

  // Stamps - KidPix image stamps
  const tamagotchiStamps = [
    `/stamps/LCD Handhelds - Tamagotchi Smart - Emoji - Anniversary Party Friends 2.png`,
    `/stamps/LCD Handhelds - Tamagotchi Smart - Emoji - Anniversary Party Friends 3.png`,
    `/stamps/LCD Handhelds - Tamagotchi Smart - Emoji - Anniversary Party Friends 4.png`,
  ]
  
  const kidpixStampNumbers = [
    ...Array.from({ length: 18 }, (_, i) => i + 1),
    ...Array.from({ length: 89 }, (_, i) => i + 21),
  ]
  
  const kidpixStamps = kidpixStampNumbers.map(n => `/stamps/kidpix-spritesheet-0-${n}.png`)
  const allStamps = [...tamagotchiStamps, ...kidpixStamps]

  const shapes = [
    { id: "heart", label: "💜" },
    { id: "star", label: "⭐" },
    { id: "circle", label: "⚫" },
    { id: "square", label: "⬛" },
    { id: "triangle", label: "🔺" },
    { id: "diamond", label: "🔷" },
  ]

  const brushSizes = [2, 5, 10, 15, 20, 30, 40, 50]
  const stampSizes = [20, 32, 48, 64, 80]
  const imageSizes = [40, 60, 80, 100, 150, 200]

  const fonts = [
    { id: "pixel", name: "Pixel", style: '"Doto", sans-serif' },
    { id: "bubble", name: "Bubble", style: '"DynaPuff", cursive' },
    { id: "script", name: "Script", style: '"Imperial Script", cursive' },
    { id: "narrow", name: "Narrow", style: '"Instrument Serif", serif' },
    { id: "sans-serif", name: "Sans", style: '"Geist", sans-serif' },
  ]

  const brushShapes: { id: BrushShape; label: string; icon: string }[] = [
    { id: "round", label: "Round", icon: "⚫" },
    { id: "square", label: "Square", icon: "⬛" },
    { id: "spray", label: "Spray", icon: "💨" },
  ]

  const patterns: { id: FillPattern; label: string }[] = [
    { id: "solid", label: "Solid" },
    { id: "stripes-h", label: "═" },
    { id: "stripes-v", label: "║" },
    { id: "dots", label: "Dots" },
    { id: "checkerboard", label: "▦" },
    { id: "hearts", label: "♥" },
    { id: "stars", label: "★" },
    { id: "confetti", label: "🎊" },
  ]

  const wackyEffects: { id: WackyEffect; label: string; icon: string }[] = [
    { id: "smear", label: "Smear", icon: "🌊" },
    { id: "rainbow", label: "Rainbow", icon: "🌈" },
    { id: "mirror", label: "Mirror", icon: "🪞" },
  ]

  // Image categories
  const imageCategories = [
    {
      id: "cake-food",
      label: "🍰 Food",
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
      label: "👸 Characters",
      images: [
        "barbie-1.png", "barbie-2.png", "barbie-3.png", "barbie-4.png", "barbie-5.png",
        "barbie-6.png", "barbie-7.png", "bear.png", "bunny.png", "chester.png",
        "chloe.png", "donkey.png", "fiona-2.png", "fiona.png", "gary.png",
        "gingie.png", "grimace.png", "gummybear.png", "hello-kitty.png", "jade.png",
        "lizzie.png", "mcqueen.png", "my-melody.png", "patrick.png", "pbj-time.png",
        "pinoccio.png", "puss.png", "ronald.png", "sasha.png", "shortcake-4.png",
        "shortcake1.png", "shortcake2.png", "shrek-question.png", "shrek.png",
        "spongebob.png", "strawberry-shortcake.png", "yasmin.png"
      ]
    },
    {
      id: "decorations",
      label: "🎈 Party",
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
      label: "🐱 Junior",
      images: [
        "curious.png", "face.png", "junior box.png", "kitty.png", 
        "lazy.png", "look.png", "lounge.png", "stare.png", "stretch.png"
      ]
    },
    {
      id: "twilight",
      label: "🌙 Twilight",
      images: [
        "01-73.png", "02-1.png", "Twilight-Logo.png",
        "6918e9a8f58845bfba46684f78f0e1bd-1.png", 
        "e7204ac52980c9d84e63b2ac604d3fc4-1.png", "image-1229.png",
        "11676fb764d8a176f7b11beea551a840-1.png", "20210730233536696405-cakeify-1.png",
        "214c9ddd2b5ef07f80b02cba9697de43-1.png", "3485ed3f0a45212e1a0b0d1efd74094f-1.png",
        "3c2fa95db9a14aaa20e10b9e1a931f3b-1.png", "a8c4dea2f211254babb1ebad7edbd90d-1.png",
        "c68145d2793baa2c0c0366607d472d45-1.png"
      ]
    }
  ]

  // Background options
  const backgroundColors = [
    { id: 'white', value: '#ffffff', label: 'White' },
    { id: 'cream', value: '#fff8dc', label: 'Cream' },
    { id: 'lavender', value: '#d8b4fe', label: 'Lavender' },
    { id: 'mint', value: '#a7f3d0', label: 'Mint' },
    { id: 'peach', value: '#fcd5ce', label: 'Peach' },
    { id: 'sky', value: '#bae6fd', label: 'Sky' },
    { id: 'bubblegum', value: '#f9a8d4', label: 'Bubblegum' },
    { id: 'lemon', value: '#fef08a', label: 'Lemon' },
    { id: 'coral', value: '#fca5a5', label: 'Coral' },
    { id: 'lilac', value: '#c4b5fd', label: 'Lilac' },
  ]

  const backgroundGradients = [
    { id: 'sunset', value: 'linear-gradient(180deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', label: 'Sunset' },
    { id: 'ocean', value: 'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)', label: 'Ocean' },
    { id: 'aurora', value: 'linear-gradient(180deg, #a18cd1 0%, #fbc2eb 100%)', label: 'Aurora' },
    { id: 'candy', value: 'linear-gradient(180deg, #ff9a9e 0%, #fad0c4 100%)', label: 'Candy' },
    { id: 'princess', value: 'linear-gradient(180deg, #fbb6ce 0%, #fda4af 50%, #d8b4fe 100%)', label: 'Princess' },
    { id: 'dreamy', value: 'linear-gradient(180deg, #c4b5fd 0%, #fbb6ce 100%)', label: 'Dreamy' },
  ]

  const backgroundImages = [
    { id: 'party', value: '/backgrounds/Party.png', label: 'Party' },
    { id: 'rainbow', value: '/backgrounds/rainbow.png', label: 'Rainbow' },
    { id: 'salon', value: '/backgrounds/Salon.png', label: 'Salon' },
    { id: 'twilight', value: '/backgrounds/Twilight.png', label: 'Twilight' },
    { id: 'aquarium', value: '/backgrounds/Aquarium.png', label: 'Aquarium' },
    { id: 'castle', value: '/backgrounds/castle.png', label: 'Castle' },
    { id: 'living-room', value: '/backgrounds/Living-Room.png', label: 'Living Room' },
    { id: 'cake-maker', value: '/backgrounds/Cake-Maker.png', label: 'Cake Maker' },
    { id: 'barbie', value: '/backgrounds/barbie.png', label: 'Barbie' },
    { id: 'glam', value: '/backgrounds/Glam.png', label: 'Glam' },
    { id: 'hearts', value: '/backgrounds/Pink-Heart-Clouds.png', label: 'Hearts' },
    { id: 'rosey', value: '/backgrounds/Rosey-Wallpaper.png', label: 'Rosey' },
    { id: 'chromatic', value: '/backgrounds/chromatic.png', label: 'Chromatic' },
    { id: 'pink-aquarium', value: '/backgrounds/pink-aquarium.png', label: 'Pink Aquarium' },
    { id: 'sunset-orange', value: '/backgrounds/sunset-orange.png', label: 'Sunset Orange' },
    { id: 'ethereal-blue', value: '/backgrounds/ethereal-blue.png', label: 'Ethereal Blue' },
    { id: 'blue-stars', value: '/backgrounds/blue-stars.jpg', label: 'Blue Stars' },
    { id: 'tropical-beach', value: '/backgrounds/tropical-beach.jpg', label: 'Tropical Beach' },
    { id: 'tropical', value: '/backgrounds/tropical.jpg', label: 'Tropical' },
    { id: 'pink-bubbles', value: '/backgrounds/pink-bubbles.jpg', label: 'Pink Bubbles' },
  ]

  const laurenSpecials = [
    "Happy 30th Lauren!",
    "Dirty 30!",
    "Forever 21 + 9",
    "I love you Lauren",
    "Slaaaaaay!",
  ]

  // Touch handling for swipe-to-close
  const panelRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchCurrentY = useRef<number>(0)
  const [panelTranslateY, setPanelTranslateY] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  
  const closePanel = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setMobilePanel("none")
      setIsClosing(false)
      setPanelTranslateY(0)
    }, 150)
  }, [setMobilePanel])

  // Handle touch start for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchCurrentY.current = e.touches[0].clientY
  }

  // Handle touch move for swipe gesture
  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY
    const deltaY = touchCurrentY.current - touchStartY.current
    
    // Only allow downward swipe (positive deltaY)
    if (deltaY > 0) {
      setPanelTranslateY(Math.min(deltaY, 300))
    }
  }

  // Handle touch end - close if swiped far enough
  const handleTouchEnd = () => {
    const deltaY = touchCurrentY.current - touchStartY.current
    if (deltaY > 80) {
      closePanel()
    } else {
      setPanelTranslateY(0)
    }
  }

  // Reset panel translate when panel changes
  useEffect(() => {
    setPanelTranslateY(0)
    setIsClosing(false)
  }, [mobilePanel])

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

  const currentCategory = imageCategories.find(c => c.id === imageCategory) || imageCategories[0]

  // Section title component with consistent styling
  // Section title matching desktop SectionHeader styling with full gradient background
  const SectionTitle = ({ children, gradient = "linear-gradient(90deg, #ff1493 0%, #a855f7 100%)" }: { children: React.ReactNode; gradient?: string }) => (
    <h4 
      className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 pixel-text text-white px-2 sm:px-3 py-1.5 sm:py-2"
      style={{ 
        background: gradient,
        textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </h4>
  )

  // Consistent button component for touch-friendly interactions - matches desktop Mac UI styling
  const TouchButton = ({ 
    children, 
    isActive = false, 
    onClick, 
    style = {},
    className = "",
    activeColor = "#ff1493",
  }: { 
    children: React.ReactNode
    isActive?: boolean
    onClick: () => void
    style?: React.CSSProperties
    className?: string
    activeColor?: string
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center transition-all active:scale-95 ${className}`}
      style={{
        minWidth: "44px",
        minHeight: "44px",
        background: isActive
          ? `linear-gradient(180deg, ${activeColor}80 0%, ${activeColor} 100%)`
          : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
        border: `2px solid ${isActive ? activeColor : "#c71585"}`,
        boxShadow: isActive 
          ? `inset 2px 2px 0 0 ${activeColor}, inset -2px -2px 0 0 #ffffff` 
          : "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
        ...style,
      }}
    >
      {children}
    </button>
  )

  return (
    <>
      {/* Backdrop - covers the entire screen behind the panel */}
      {mobilePanel !== "none" && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={closePanel}
        />
      )}

      {/* Panel Content - fixed position, slides up from bottom - matches desktop Mac UI styling */}
      {mobilePanel !== "none" && (
        <div
          ref={panelRef}
          className={`fixed left-0 right-0 z-50 ${isClosing ? 'animate-out slide-out-to-bottom duration-150' : 'animate-in slide-in-from-bottom duration-200'}`}
          style={{
            bottom: "0",
            paddingBottom: "max(env(safe-area-inset-bottom, 8px) + 140px, 148px)",
            background: "linear-gradient(180deg, #fff0f7 0%, #ffc0e0 100%)",
            borderTop: "3px solid #c71585",
            maxHeight: "75vh",
            boxShadow: "0 -3px 0 0 #c71585, inset -2px -2px 0 0 #ffc0e0, inset 2px 2px 0 0 #ffffff",
            transform: `translateY(${panelTranslateY}px)`,
            transition: panelTranslateY === 0 ? 'transform 0.2s ease-out' : 'none',
            overflow: "visible",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle - larger for easier touch */}
          <div 
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" 
            onClick={closePanel}
          >
            <div
              className="w-12 sm:w-14 md:w-16 h-1"
              style={{ background: "linear-gradient(90deg, #ff1493, #a855f7)", border: "1px solid #c71585" }}
            />
          </div>

          {/* Panel content - improved scrolling */}
          <div 
            className="px-3 sm:px-5 md:px-8 lg:px-10 pb-8 overflow-y-auto overscroll-contain"
            style={{
              maxHeight: "calc(75vh - 80px)",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "thin",
              scrollbarColor: "#ff69b4 #ffc0e0",
            }}
          >
            
            {/* DRAW PANEL */}
            {mobilePanel === "draw" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold pixel-text text-center" style={{ color: "#c71585" }}>
                  🖌️ Drawing Tools
                </h3>
                
                {/* Tool Selection - Larger touch targets */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { id: "brush", icon: "🖌️", name: "Brush" },
                    { id: "eraser", icon: "🧹", name: "Eraser" },
                    { id: "fill", icon: "🪣", name: "Fill" },
                    { id: "wacky", icon: "✨", name: "Wacky" },
                    { id: "move", icon: "✋", name: "Move" },
                  ].map((tool) => (
                    <TouchButton
                      key={tool.id}
                      isActive={currentTool === tool.id}
                      onClick={() => {
                        handleToolSelect(tool.id)
                        if (tool.id === "move" || tool.id === "fill") {
                          closePanel()
                        }
                      }}
                      className="flex-col gap-1 p-2 sm:p-3"
                      style={{ minHeight: "64px" }}
                    >
                      <span className="text-xl sm:text-2xl">{tool.icon}</span>
                      <span 
                        className="text-[9px] sm:text-[10px] pixel-text font-medium" 
                        style={{ color: currentTool === tool.id ? "white" : "#4a0033" }}
                      >
                        {tool.name}
                      </span>
                    </TouchButton>
                  ))}
                </div>

                {/* Color Palette */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">🎨 Colors</SectionTitle>
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-16 gap-1.5 sm:gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCurrentColor(color)}
                        className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 transition-all active:scale-110"
                        style={{
                          backgroundColor: color,
                          border: currentColor === color ? "3px solid #00e5ff" : "2px solid #c71585",
                          boxShadow: currentColor === color 
                            ? "0 0 8px #00e5ff, inset -1px -1px 0 #00000033, inset 1px 1px 0 #ffffff66" 
                            : "inset -1px -1px 0 #00000033, inset 1px 1px 0 #ffffff66",
                          transform: currentColor === color ? "scale(1.1)" : "scale(1)",
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Brush/Eraser Size */}
                {(currentTool === "brush" || currentTool === "eraser") && (
                  <div>
                    <SectionTitle gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)">📏 Brush Size</SectionTitle>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      {brushSizes.map((size) => (
                        <TouchButton
                          key={size}
                          isActive={(currentTool === "brush" ? brushSize : eraserSize) === size}
                          onClick={() => currentTool === "brush" ? setBrushSize(size) : setEraserSize(size)}
                          style={{ minWidth: "48px", padding: "8px 12px" }}
                        >
                          <span 
                            className="pixel-text font-bold text-sm"
                            style={{ color: (currentTool === "brush" ? brushSize : eraserSize) === size ? "white" : "#4a0033" }}
                          >
                            {size}
                          </span>
                        </TouchButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brush Shape */}
                {(currentTool === "brush" || currentTool === "eraser") && (
                  <div>
                    <SectionTitle gradient="linear-gradient(90deg, #00e5ff 0%, #7fff00 100%)">🔵 Brush Shape</SectionTitle>
                    <div className="flex gap-2 sm:gap-3">
                      {brushShapes.map((shape) => (
                        <TouchButton
                          key={shape.id}
                          isActive={(currentTool === "brush" ? brushShape : eraserShape) === shape.id}
                          onClick={() => currentTool === "brush" ? setBrushShape(shape.id) : setEraserShape(shape.id)}
                          className="flex-1 flex-col gap-1 p-3 sm:p-4"
                          style={{ minHeight: "64px" }}
                        >
                          <span className="text-xl sm:text-2xl">{shape.icon}</span>
                          <span 
                            className="text-[10px] sm:text-xs pixel-text font-medium" 
                            style={{ color: (currentTool === "brush" ? brushShape : eraserShape) === shape.id ? "white" : "#4a0033" }}
                          >
                            {shape.label}
                          </span>
                        </TouchButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill Pattern */}
                {currentTool === "fill" && (
                  <div>
                    <SectionTitle gradient="linear-gradient(90deg, #ffd700 0%, #ff6b6b 100%)">🎨 Fill Pattern</SectionTitle>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
                      {patterns.map((pattern) => (
                        <TouchButton
                          key={pattern.id}
                          isActive={currentPattern === pattern.id}
                          onClick={() => setCurrentPattern(pattern.id)}
                          style={{ padding: "10px 8px" }}
                        >
                          <span 
                            className="pixel-text text-xs sm:text-sm font-medium" 
                            style={{ color: currentPattern === pattern.id ? "white" : "#4a0033" }}
                          >
                            {pattern.label}
                          </span>
                        </TouchButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wacky Effects */}
                {currentTool === "wacky" && (
                  <div>
                    <SectionTitle gradient="linear-gradient(90deg, #ff6b6b 0%, #ffd700 50%, #7fff00 100%)">✨ Wacky Effect</SectionTitle>
                    <div className="flex gap-2 sm:gap-3">
                      {wackyEffects.map((effect) => (
                        <TouchButton
                          key={effect.id}
                          isActive={wackyEffect === effect.id}
                          onClick={() => setWackyEffect(effect.id)}
                          activeColor="#a855f7"
                          className="flex-1 flex-col gap-1 p-3 sm:p-4"
                          style={{ minHeight: "64px" }}
                        >
                          <span className="text-xl sm:text-2xl">{effect.icon}</span>
                          <span 
                            className="text-[10px] sm:text-xs pixel-text font-medium" 
                            style={{ color: wackyEffect === effect.id ? "white" : "#4a0033" }}
                          >
                            {effect.label}
                          </span>
                        </TouchButton>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAMPS PANEL */}
            {mobilePanel === "stamps" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold pixel-text text-center" style={{ color: "#ff1493" }}>
                  ⭐ Stamps
                </h3>

                {/* Size Selection */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #ffd700 0%, #ff6b6b 100%)">📏 Stamp Size</SectionTitle>
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    {stampSizes.map((size) => (
                      <TouchButton
                        key={size}
                        isActive={stampSize === size}
                        onClick={() => setStampSize(size)}
                        style={{ minWidth: "52px", padding: "10px 14px" }}
                      >
                        <span 
                          className="pixel-text font-bold text-sm"
                          style={{ color: stampSize === size ? "white" : "#4a0033" }}
                        >
                          {size}
                        </span>
                      </TouchButton>
                    ))}
                  </div>
                </div>

                {/* Random Generator */}
                <MacButton
                  onClick={() => {
                    onGenerateRandomStamps?.()
                    closePanel()
                  }}
                  style={{ width: "100%", padding: "14px 16px", fontSize: "14px" }}
                >
                  🎲 Add Random Stamps
                </MacButton>

                {/* Shapes */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #a855f7 0%, #ec4899 100%)">💜 Shapes</SectionTitle>
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                    {shapes.map((shape) => (
                      <TouchButton
                        key={shape.id}
                        isActive={currentShape === shape.id && currentTool === "shapes"}
                        onClick={() => {
                          setCurrentShape(shape.id)
                          setCurrentTool("shapes")
                          closePanel()
                        }}
                        activeColor="#7c3aed"
                        style={{ padding: "10px" }}
                      >
                        <span className="text-2xl sm:text-3xl">{shape.label}</span>
                      </TouchButton>
                    ))}
                  </div>
                </div>

                {/* Stamp Grid - 2 horizontal rows that scroll together */}
                <div className="pb-2">
                  <SectionTitle gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">⭐ Stamps</SectionTitle>
                  <div 
                    className="overflow-x-auto"
                    style={{ 
                      background: "linear-gradient(180deg, #ffffff 0%, #fff0f7 100%)", 
                      border: "2px solid #c71585",
                      WebkitOverflowScrolling: "touch",
                      minHeight: "116px", /* Fixed height for 2 rows: 2 * 46px + padding + gap */
                    }}
                  >
                    <div className="p-2 min-w-max flex flex-col gap-1.5">
                      {/* Row 1 */}
                      <div className="flex gap-1.5">
                        {allStamps.slice(0, 50).map((stamp, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setCurrentStamp(stamp)
                              setCurrentTool("stamp")
                              closePanel()
                            }}
                            className="p-1 transition-all active:scale-110 flex-shrink-0"
                            style={{
                              width: "46px",
                              height: "46px",
                              background: currentStamp === stamp 
                                ? "linear-gradient(180deg, #ffc0e0 0%, #ff69b4 100%)" 
                                : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                              border: currentStamp === stamp ? "2px solid #ff1493" : "2px solid #ffb6d9",
                              boxShadow: currentStamp === stamp 
                                ? "inset 2px 2px 0 0 #c71585" 
                                : "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff",
                            }}
                          >
                            <img 
                              src={stamp} 
                              alt="stamp"
                              className="w-6 h-6 object-contain mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </button>
                        ))}
                      </div>
                      {/* Row 2 */}
                      <div className="flex gap-1.5">
                        {allStamps.slice(50, 100).map((stamp, i) => (
                          <button
                            key={i + 50}
                            onClick={() => {
                              setCurrentStamp(stamp)
                              setCurrentTool("stamp")
                              closePanel()
                            }}
                            className="p-1 transition-all active:scale-110 flex-shrink-0"
                            style={{
                              width: "46px",
                              height: "46px",
                              background: currentStamp === stamp 
                                ? "linear-gradient(180deg, #ffc0e0 0%, #ff69b4 100%)" 
                                : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                              border: currentStamp === stamp ? "2px solid #ff1493" : "2px solid #ffb6d9",
                              boxShadow: currentStamp === stamp 
                                ? "inset 2px 2px 0 0 #c71585" 
                                : "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff",
                            }}
                          >
                            <img 
                              src={stamp} 
                              alt="stamp"
                              className="w-6 h-6 object-contain mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-[10px] pixel-text text-pink-400 mt-1">
                    ← Swipe to see more →
                  </div>
                </div>
              </div>
            )}

            {/* IMAGES PANEL */}
            {mobilePanel === "images" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold pixel-text text-center" style={{ color: "#a855f7" }}>
                  🖼️ Images
                </h3>

                {/* Upload Button */}
                <MacButton
                  primary
                  onClick={() => {
                    handleToolSelect("upload")
                    closePanel()
                  }}
                  className="w-full"
                  style={{ padding: "14px 16px", fontSize: "15px" }}
                >
                  📤 Upload Your Own
                </MacButton>

                {/* Size Selection */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #ffd700 0%, #ff6b6b 100%)">📏 Image Size</SectionTitle>
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    {imageSizes.map((size) => (
                      <TouchButton
                        key={size}
                        isActive={imageStampSize === size}
                        onClick={() => setImageStampSize(size)}
                        activeColor="#a855f7"
                        style={{ minWidth: "48px", padding: "10px 12px" }}
                      >
                        <span 
                          className="pixel-text font-bold text-sm"
                          style={{ color: imageStampSize === size ? "white" : "#4a0033" }}
                        >
                          {size}
                        </span>
                      </TouchButton>
                    ))}
                  </div>
                </div>

                {/* Random Generator */}
                <MacButton
                  onClick={() => {
                    onGenerateRandomImages?.()
                    closePanel()
                  }}
                  style={{ width: "100%", padding: "14px 16px", fontSize: "14px" }}
                >
                  🎲 Add Random Images
                </MacButton>

                {/* Category Tabs */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)">🗂️ Categories</SectionTitle>
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {imageCategories.map((cat) => (
                      <TouchButton
                        key={cat.id}
                        isActive={imageCategory === cat.id}
                        onClick={() => setImageCategory(cat.id)}
                        activeColor="#a855f7"
                        style={{ padding: "8px 12px", minWidth: "auto" }}
                      >
                        <span 
                          className="pixel-text text-xs sm:text-sm font-medium"
                          style={{ color: imageCategory === cat.id ? "white" : "#4a0033" }}
                        >
                          {cat.label}
                        </span>
                      </TouchButton>
                    ))}
                  </div>

                  {/* Image Grid - Single horizontal scroll row */}
                  <div 
                    className="overflow-x-auto"
                    style={{ 
                      background: "linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%)", 
                      border: "2px solid #7c3aed",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    <div className="flex gap-1.5 p-2 min-w-max">
                      {currentCategory.images.map((img) => (
                        <button
                          key={img}
                          onClick={() => {
                            setCurrentImageStamp(`/images/${currentCategory.id}/${img}`)
                            setCurrentTool("images")
                            closePanel()
                          }}
                          className="p-1.5 transition-all active:scale-110 flex-shrink-0"
                          style={{
                            width: "56px",
                            height: "56px",
                            background: currentImageStamp === `/images/${currentCategory.id}/${img}` 
                              ? "linear-gradient(180deg, #e9d5ff 0%, #a855f7 100%)" 
                              : "linear-gradient(180deg, #ffffff 0%, #e9d5ff 100%)",
                            border: "2px solid #c4b5fd",
                            boxShadow: currentImageStamp === `/images/${currentCategory.id}/${img}` 
                              ? "inset 2px 2px 0 0 #7c3aed" 
                              : "inset -2px -2px 0 0 #7c3aed, inset 2px 2px 0 0 #ffffff",
                          }}
                        >
                          <img 
                            src={`/images/${currentCategory.id}/${img}`}
                            alt={img}
                            className="w-10 h-10 object-contain mx-auto"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-center text-[10px] pixel-text text-purple-400 mt-1">
                    ← Swipe to see more →
                  </div>
                </div>
              </div>
            )}

            {/* TEXT PANEL */}
            {mobilePanel === "text" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold pixel-text text-center" style={{ color: "#0891b2" }}>
                  🔤 Text
                </h3>

                {/* Lauren Specials */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">💖 Lauren Specials</SectionTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {laurenSpecials.map((text, i) => (
                      <MacButton
                        key={text}
                        primary={i === 0}
                        secondary={i === 1}
                        accent={i >= 2}
                        onClick={() => {
                          addSpecialText(text)
                          closePanel()
                        }}
                        style={{ padding: "12px 10px", fontSize: "11px", minHeight: "48px" }}
                      >
                        {text}
                      </MacButton>
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #ffd700 0%, #ff1493 100%)">🔤 Fonts</SectionTitle>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                    {fonts.map((font) => (
                      <TouchButton
                        key={font.id}
                        isActive={currentFont === font.id}
                        onClick={() => setCurrentFont(font.id)}
                        activeColor="#0891b2"
                        style={{ padding: "12px 8px" }}
                      >
                        <span 
                          style={{ 
                            fontFamily: font.style, 
                            fontSize: "13px",
                            color: currentFont === font.id ? "white" : "#4a0033",
                          }}
                        >
                          {font.name}
                        </span>
                      </TouchButton>
                    ))}
                  </div>
                </div>

                {/* Custom Text Input */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #ff1493 0%, #a855f7 100%)">✏️ Type Your Text</SectionTitle>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 sm:py-4 text-base"
                      style={{
                        border: "2px solid #0891b2",
                        outline: "none",
                        fontFamily: fonts.find(f => f.id === currentFont)?.style,
                        fontSize: "16px", // Prevents iOS zoom
                        background: "linear-gradient(180deg, #fff 0%, #e0f7ff 100%)",
                        boxShadow: "inset -2px -2px 0 0 #0891b2, inset 2px 2px 0 0 #ffffff",
                      }}
                      enterKeyHint="done"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customText.trim()) {
                          addCustomText(customText, currentFont, currentColor)
                          setCustomText("")
                          closePanel()
                        }
                      }}
                    />
                    <MacButton
                      primary
                      onClick={() => {
                        if (customText.trim()) {
                          addCustomText(customText, currentFont, currentColor)
                          setCustomText("")
                          closePanel()
                        }
                      }}
                      style={{ padding: "12px 20px", minHeight: "48px" }}
                    >
                      Add
                    </MacButton>
                  </div>
                </div>

                {/* Tap to Add */}
                <MacButton
                  onClick={() => {
                    setCurrentTool("text")
                    closePanel()
                  }}
                  style={{ width: "100%", padding: "14px", fontSize: "14px" }}
                >
                  👆 Tap Canvas to Add Text
                </MacButton>
              </div>
            )}

            {/* BACKGROUNDS PANEL */}
            {mobilePanel === "backgrounds" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold pixel-text text-center" style={{ color: "#ffd700" }}>
                  🎨 Backgrounds
                </h3>

                {/* Solid Colors */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #00e5ff 0%, #a855f7 100%)">🎨 Solid Colors</SectionTitle>
                  {/* Horizontal scroll for colors */}
                  <div 
                    className="overflow-x-auto pb-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="flex gap-1.5 p-1.5 min-w-max">
                      {backgroundColors.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            onSelectBackground({ type: 'color', value: bg.value })
                            closePanel()
                          }}
                          className="w-11 h-11 transition-all active:scale-110 flex-shrink-0"
                          style={{
                            backgroundColor: bg.value,
                            border: "2px solid #c71585",
                            boxShadow: "inset -1px -1px 0 #00000033, inset 1px 1px 0 #ffffff66",
                          }}
                          aria-label={`Select ${bg.label} background`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gradients - Horizontal scroll */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #fbb6ce 0%, #c4b5fd 50%, #7dd3fc 100%)">✨ Gradients</SectionTitle>
                  <div 
                    className="overflow-x-auto pb-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="flex gap-1.5 p-1.5 min-w-max">
                      {backgroundGradients.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            onSelectBackground({ type: 'gradient', value: bg.value })
                            closePanel()
                          }}
                          className="h-12 w-20 transition-all active:scale-105 flex items-center justify-center flex-shrink-0"
                          style={{
                            background: bg.value,
                            border: "2px solid #c71585",
                            boxShadow: "2px 2px 0 0 #c71585",
                          }}
                        >
                          <span className="text-[10px] pixel-text text-white drop-shadow-lg font-medium px-1">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image Backgrounds - Single horizontal scroll row */}
                <div className="pb-4">
                  <SectionTitle gradient="linear-gradient(90deg, #ff1493 0%, #ffd700 100%)">🖼️ Image Backgrounds</SectionTitle>
                  <div 
                    className="overflow-x-auto"
                    style={{ 
                      background: "linear-gradient(180deg, #ffffff 0%, #fff0f7 100%)", 
                      border: "2px solid #c71585",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    <div className="flex gap-2 p-2 min-w-max">
                      {backgroundImages.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            onSelectBackground({ type: 'image', value: bg.value })
                            closePanel()
                          }}
                          className="w-28 h-20 overflow-hidden transition-all active:scale-105 flex items-end justify-center flex-shrink-0"
                          style={{
                            border: "2px solid #c71585",
                            backgroundImage: `url('${bg.value}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: "2px 2px 0 0 #c71585",
                          }}
                        >
                          <span className="text-[9px] pixel-text text-white drop-shadow-lg bg-black/60 px-1 py-0.5 w-full text-center truncate">
                            {bg.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-center text-[10px] pixel-text text-pink-400 mt-1">
                    ← Swipe to see more →
                  </div>
                </div>
              </div>
            )}

            {/* MORE PANEL */}
            {mobilePanel === "more" && (
              <div className="space-y-4 pb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-bold pixel-text text-center" style={{ color: "#4a0033" }}>
                  ⚙️ More Options
                </h3>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <MacButton
                    onClick={() => {
                      onNewCard()
                      closePanel()
                    }}
                    style={{ padding: "16px", fontSize: "14px", minHeight: "56px" }}
                  >
                    🆕 New Card
                  </MacButton>
                  <MacButton
                    primary
                    onClick={() => {
                      onSave()
                      closePanel()
                    }}
                    style={{ padding: "16px", fontSize: "14px", minHeight: "56px" }}
                  >
                    💾 Save
                  </MacButton>
                  <MacButton
                    onClick={() => {
                      onHelp()
                      closePanel()
                    }}
                    style={{ padding: "16px", fontSize: "14px", minHeight: "56px" }}
                  >
                    ❓ Help
                  </MacButton>
                  <MacButton
                    accent
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: "Lauren's Birthday Card", text: "Check out my card!" })
                      }
                      closePanel()
                    }}
                    style={{ padding: "16px", fontSize: "14px", minHeight: "56px" }}
                  >
                    📤 Share
                  </MacButton>
                </div>

                {/* Undo/Redo */}
                <div>
                  <SectionTitle gradient="linear-gradient(90deg, #a855f7 0%, #00e5ff 100%)">↩️ History</SectionTitle>
                  <div className="flex gap-2 sm:gap-3">
                    <MacButton
                      onClick={onUndo}
                      disabled={!canUndo}
                      style={{ 
                        flex: 1, 
                        padding: "14px", 
                        opacity: canUndo ? 1 : 0.4, 
                        minHeight: "52px", 
                        fontSize: "14px" 
                      }}
                    >
                      ↩️ Undo
                    </MacButton>
                    <MacButton
                      onClick={onRedo}
                      disabled={!canRedo}
                      style={{ 
                        flex: 1, 
                        padding: "14px", 
                        opacity: canRedo ? 1 : 0.4, 
                        minHeight: "52px", 
                        fontSize: "14px" 
                      }}
                    >
                      ↪️ Redo
                    </MacButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN TOOLBAR - Fixed bottom navigation - matches desktop Mac UI styling */}
      <div
        className="relative flex-shrink-0 z-50"
        style={{
          background: "linear-gradient(180deg, #fff0f7 0%, #ffc0e0 100%)",
          borderTop: "3px solid #c71585",
          boxShadow: "0 -3px 0 0 #c71585, inset -2px -2px 0 0 #ffc0e0, inset 2px 2px 0 0 #ffffff",
          paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
        }}
      >
        {/* Quick Action Bar - Current tool indicator + color + undo/redo */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-b-2 border-[#c71585]">
          {/* Current Tool + Color */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2"
              style={{
                background: "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)",
                border: "2px solid #c71585",
                boxShadow: "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffb6d9, 2px 2px 0 0 #c71585",
              }}
            >
              <span className="text-lg sm:text-xl">
                {currentTool === "brush" && "🖌️"}
                {currentTool === "eraser" && "🧹"}
                {currentTool === "fill" && "🪣"}
                {currentTool === "stamp" && "⭐"}
                {currentTool === "images" && "🖼️"}
                {currentTool === "text" && "🔤"}
                {currentTool === "shapes" && "💜"}
                {currentTool === "move" && "✋"}
                {currentTool === "wacky" && "✨"}
                {!currentTool && "👆"}
              </span>
              <span className="text-[10px] sm:text-xs text-white pixel-text capitalize font-medium hidden xs:block">
                {currentTool || "Select"}
              </span>
            </div>

            {/* Color Button */}
            <div
              onClick={() => setMobilePanel(mobilePanel === "draw" ? "none" : "draw")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 transition-all active:scale-95 cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                border: "2px solid #c71585",
                boxShadow: "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
              }}
            >
              <div
                className="w-6 h-6 sm:w-7 sm:h-7"
                style={{
                  backgroundColor: currentColor,
                  border: "2px solid #c71585",
                  boxShadow: "inset -1px -1px 0 #00000033, inset 1px 1px 0 #ffffff66",
                }}
              />
              <span className="text-[10px] sm:text-xs pixel-text font-medium" style={{ color: "#c71585" }}>
                Color
              </span>
            </div>
          </div>

          {/* Quick Undo/Redo */}
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-lg sm:text-xl transition-all active:scale-95"
              style={{
                background: canUndo ? "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)" : "#e0e0e0",
                border: "2px solid #c71585",
                opacity: canUndo ? 1 : 0.4,
                boxShadow: canUndo ? "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585" : "none",
              }}
              aria-label="Undo"
            >
              ↩️
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-lg sm:text-xl transition-all active:scale-95"
              style={{
                background: canRedo ? "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)" : "#e0e0e0",
                border: "2px solid #c71585",
                opacity: canRedo ? 1 : 0.4,
                boxShadow: canRedo ? "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585" : "none",
              }}
              aria-label="Redo"
            >
              ↪️
            </button>
          </div>
        </div>

        {/* Main Tab Bar - 6 primary actions - uniform pink like desktop */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5 p-1.5 sm:p-2">
          {[
            { id: "draw", icon: "🖌️", label: "Draw" },
            { id: "stamps", icon: "⭐", label: "Stamps" },
            { id: "images", icon: "🖼️", label: "Images" },
            { id: "text", icon: "🔤", label: "Text" },
            { id: "backgrounds", icon: "🎨", label: "BG" },
            { id: "more", icon: "⚙️", label: "More" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobilePanel(mobilePanel === tab.id ? "none" : tab.id as MobilePanel)}
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 transition-all active:scale-95"
              style={{
                minHeight: "56px",
                background: mobilePanel === tab.id
                  ? "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
                border: "2px solid #c71585",
                boxShadow: mobilePanel === tab.id 
                  ? "inset 2px 2px 0 0 #c71585, inset -2px -2px 0 0 #ffb6d9" 
                  : "inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585",
              }}
              aria-label={tab.label}
              aria-pressed={mobilePanel === tab.id}
            >
              <span className="text-lg sm:text-xl md:text-2xl">{tab.icon}</span>
              <span 
                className="text-[8px] sm:text-[9px] md:text-[10px] pixel-text font-bold" 
                style={{ color: mobilePanel === tab.id ? "white" : "#c71585" }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
