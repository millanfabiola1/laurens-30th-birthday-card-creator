"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import TopBar from "@/components/top-bar"
import ToolSidebar, { FillPattern, WackyEffect } from "@/components/tool-sidebar"
import CanvasArea, { FabricCanvasRef, BrushShape } from "@/components/canvas-area"
import MobileToolbar from "@/components/mobile-toolbar"
import GuidedTour from "@/components/guided-tour"
import { MobileDisclaimer } from "@/components/mobile-disclaimer"
import { IText, FabricImage } from "fabric"
import { playSound } from "@/lib/sound-manager"

export interface CanvasElement {
  id: string
  type: "text" | "stamp" | "image"
  x: number
  y: number
  content: string
  color: string
  size: number
  font?: string
}

export interface HistoryState {
  json: string
}

export default function Home() {
  const [currentTool, setCurrentTool] = useState<string>("")
  const [currentColor, setCurrentColor] = useState<string>("#ff1493")
  const [brushSize, setBrushSize] = useState<number>(5)
  const [brushShape, setBrushShape] = useState<BrushShape>("round")
  const [eraserSize, setEraserSize] = useState<number>(10)
  const [eraserShape, setEraserShape] = useState<BrushShape>("round")
  const [currentFont, setCurrentFont] = useState<string>("pixel")
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [mobilePanel, setMobilePanel] = useState<"none" | "draw" | "stamps" | "images" | "text" | "backgrounds" | "more" | "brushOptions" | "eraserOptions" | "stampSize" | "imageSize">("none")
  const [currentStamp, setCurrentStamp] = useState<string>("/stamps/kidpix-spritesheet-0-1.png")
  const [stampSize, setStampSize] = useState<number>(48)
  const [currentShape, setCurrentShape] = useState<string>("heart")
  const [currentImageStamp, setCurrentImageStamp] = useState<string>("/images/cake-food/cake.png")
  const [imageStampSize, setImageStampSize] = useState<number>(80)
  const [currentPattern, setCurrentPattern] = useState<FillPattern>("solid")
  const [wackyEffect, setWackyEffect] = useState<WackyEffect>("smear")
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false)
  const [currentBackground, setCurrentBackground] = useState<string>("#ffffff")
  const [shouldCloseDrawer, setShouldCloseDrawer] = useState<boolean>(false)
  const canvasRef = useRef<FabricCanvasRef | null>(null)
  const isRestoringRef = useRef<boolean>(false)

  const colors = [
    "#ff1493", // deep pink
    "#ff69b4", // hot pink
    "#ff6ec7", // neon pink
    "#ffb6d9", // light pink
    "#a855f7", // purple
    "#c4b5fd", // lavender
    "#00e5ff", // cyan
    "#7fffd4", // aquamarine
    "#7fff00", // chartreuse
    "#ffd700", // gold
    "#ff6b6b", // coral
    "#ffffff", // white
    "#000000", // black
    "#4a0033", // dark magenta
    "#0891b2", // teal
    "#c71585", // medium violet red
  ]

  const saveToHistory = useCallback(() => {
    // Don't save if we're restoring from history
    if (isRestoringRef.current) return
    
    const canvas = canvasRef.current?.canvas
    if (!canvas) return

    try {
      const json = JSON.stringify(canvas.toJSON())
      const newState: HistoryState = { json }

      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newState)
      if (newHistory.length > 50) newHistory.shift()

      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    } catch (e) {
      // Ignore history save errors
    }
  }, [history, historyIndex])

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current?.canvas
    if (!canvas) return

    const newIndex = historyIndex - 1
    const state = history[newIndex]

    if (state) {
      try {
        isRestoringRef.current = true
        playSound('undo')
        canvas.loadFromJSON(state.json).then(() => {
          canvas.renderAll()
          setHistoryIndex(newIndex)
          isRestoringRef.current = false
        }).catch(() => {
          isRestoringRef.current = false
        })
      } catch (e) {
        isRestoringRef.current = false
      }
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return

    const canvas = canvasRef.current?.canvas
    if (!canvas) return

    const newIndex = historyIndex + 1
    const state = history[newIndex]

    if (state) {
      try {
        isRestoringRef.current = true
        playSound('undo')  // Same sound for redo
        canvas.loadFromJSON(state.json).then(() => {
          canvas.renderAll()
          setHistoryIndex(newIndex)
          isRestoringRef.current = false
        }).catch(() => {
          isRestoringRef.current = false
        })
      } catch (e) {
        isRestoringRef.current = false
      }
    }
  }, [history, historyIndex])

  // Save initial canvas state when canvas is ready
  useEffect(() => {
    const checkAndSaveInitial = () => {
      const canvas = canvasRef.current?.canvas
      if (canvas && history.length === 0) {
        try {
          const json = JSON.stringify(canvas.toJSON())
          setHistory([{ json }])
          setHistoryIndex(0)
        } catch (e) {
          // Ignore errors
        }
      }
    }
    
    // Check after a short delay to ensure canvas is initialized
    const timer = setTimeout(checkAndSaveInitial, 500)
    return () => clearTimeout(timer)
  }, [history.length])

  const getFontFamily = (font: string) => {
    switch (font) {
      case 'bubble':
        return 'DynaPuff, cursive'
      case 'script':
        return 'Imperial Script, cursive'
      case 'narrow':
        return 'Instrument Serif, serif'
      case 'sans-serif':
        return 'Geist, sans-serif'
      case 'pixel':
      default:
        return 'Doto, sans-serif'
    }
  }

  const addSpecialText = useCallback(
    (text: string) => {
      const canvas = canvasRef.current?.canvas
      if (!canvas) return

      // Center the text on the canvas
      const canvasWidth = canvas.width || 800
      const canvasHeight = canvas.height || 600
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2

      const itext = new IText(text, {
        left: centerX,
        top: centerY,
        fontSize: 96, // Very large text
        fontFamily: getFontFamily(currentFont),
        fill: currentColor,
        charSpacing: currentFont === 'pixel' ? 0 : -2, // No spacing for pixel font, -2 for others
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        // Enable all controls including scaling
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: false,
        cornerColor: '#ff1493',
        cornerStyle: 'circle',
        cornerSize: 12,
        borderColor: '#ff1493',
        borderScaleFactor: 2,
        transparentCorners: false,
        lockUniScaling: false,
        centeredScaling: false,
        minScaleLimit: 0.1,
      })
      ;(itext as any).customId = `text-${Date.now()}`
      ;(itext as any).objectType = 'text'

      canvas.add(itext)
      canvas.bringObjectToFront(itext)
      canvas.setActiveObject(itext)
      canvas.renderAll()
      setSelectedElementId((itext as any).customId)
    },
    [currentColor, currentFont],
  )

  const addCustomText = useCallback(
    (text: string) => {
      const canvas = canvasRef.current?.canvas
      if (!canvas) return

      const itext = new IText(text, {
        left: (canvas.width || 400) / 2,
        top: (canvas.height || 300) / 2,
        fontSize: 36,
        fontFamily: getFontFamily(currentFont),
        fill: currentColor,
        charSpacing: currentFont === 'pixel' ? 0 : -2, // No spacing for pixel font, -2 for others
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: false,
        cornerColor: '#ff1493',
        cornerStyle: 'circle',
        cornerSize: 12,
        borderColor: '#ff1493',
        borderScaleFactor: 2,
        transparentCorners: false,
        lockUniScaling: false,
        centeredScaling: false,
        minScaleLimit: 0.1,
      })
      ;(itext as any).customId = `text-${Date.now()}`
      ;(itext as any).objectType = 'text'

      canvas.add(itext)
      canvas.bringObjectToFront(itext)
      canvas.setActiveObject(itext)
      canvas.renderAll()
      setSelectedElementId((itext as any).customId)
    },
    [currentColor, currentFont],
  )

  const handleSelectBackground = useCallback((bg: { value: string; type: 'color' | 'image' | 'gradient' }) => {
    setCurrentBackground(bg.value)
    const canvas = canvasRef.current
    if (!canvas) return
    
    if (bg.type === 'image') {
      canvas.setImageBackground?.(bg.value)
    } else if (bg.type === 'gradient') {
      canvas.setGradientBackground?.(bg.value)
    } else {
      canvas.fillCanvas?.(bg.value, 'solid')
    }
  }, [])

  const generateRandomStamps = useCallback(() => {
    const fabricCanvas = canvasRef.current?.canvas
    if (!fabricCanvas) return
    
    const canvasWidth = fabricCanvas.width || 800
    const canvasHeight = fabricCanvas.height || 600
    
    // Generate 40-70 random stamps
    const numStamps = Math.floor(Math.random() * 31) + 40
    
    // Available KidPix stamps (1-18, 21-109)
    const availableStamps: number[] = [
      ...Array.from({ length: 18 }, (_, i) => i + 1),
      ...Array.from({ length: 89 }, (_, i) => i + 21),
    ]
    
    // Randomly shuffle and select
    const shuffledStamps = availableStamps.sort(() => Math.random() - 0.5)
    const selectedStamps = shuffledStamps.slice(0, numStamps)
    
    // Add stamps with slight delays
    selectedStamps.forEach((stampNum, index) => {
      setTimeout(() => {
        const stampPath = `/stamps/kidpix-spritesheet-0-${stampNum}.png`
        const stampSize = 48
        const padding = 50
        const x = Math.random() * (canvasWidth - padding * 2) + padding
        const y = Math.random() * (canvasHeight - padding * 2) + padding
        
        FabricImage.fromURL(stampPath, { crossOrigin: 'anonymous' }).then((stampImg) => {
          const currentCanvas = canvasRef.current?.canvas
          if (!stampImg || !currentCanvas) return
          
          const scale = stampSize / Math.max(stampImg.width || 50, stampImg.height || 50)
          const rotation = (Math.random() - 0.5) * 30
          
          stampImg.set({
            left: x,
            top: y,
            scaleX: scale,
            scaleY: scale,
            angle: rotation,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#ff1493',
            cornerStyle: 'circle',
            cornerSize: 12,
            borderColor: '#ff1493',
            transparentCorners: false,
          })
          
          ;(stampImg as any).customId = `stamp-${Date.now()}-${index}`
          ;(stampImg as any).objectType = 'stamp'
          
          currentCanvas.add(stampImg)
          currentCanvas.renderAll()
        }).catch((err) => {
          console.error('Error loading stamp:', err)
        })
      }, index * 10)
    })
    
    playSound('click')
  }, [])

  const generateRandomImages = useCallback(() => {
    const fabricCanvas = canvasRef.current?.canvas
    if (!fabricCanvas) return
    
    const canvasWidth = fabricCanvas.width || 800
    const canvasHeight = fabricCanvas.height || 600
    
    // All image categories with their paths
    const allImages: string[] = [
      // Cake+Food
      ...["brat-cake.png", "burger.png", "cake.png", "cake01.png", "cake02.png",
        "candy.png", "chocolate-cake.png", "chocolate-slice.png", "chocolate.png",
        "cupcake.png", "flan.png", "fries.png", "happymeal.png", "icecream.png",
        "jelly-cake.png", "lollipop.png", "pancake.png", "pizza.png", "pretzel.png",
        "red-velvet.png", "slice.png", "soda.png", "sorbet.png"].map(img => `/images/cake-food/${img}`),
      // Characters
      ...["barbie-1.png", "barbie-2.png", "barbie-3.png", "barbie-4.png", "barbie-5.png",
        "barbie-6.png", "barbie-7.png", "bear.png", "bunny.png", "chester.png",
        "chloe.png", "donkey.png", "fiona-2.png", "fiona.png", "gary.png",
        "gingie.png", "grimace.png", "gummybear.png", "hello-kitty.png", "jade.png",
        "lizzie.png", "mcqueen.png", "my-melody.png", "patrick.png", "pbj-time.png",
        "pinoccio.png", "puss.png", "ronald.png", "sasha.png", "shortcake-4.png",
        "shortcake1.png", "shortcake2.png", "shrek-question.png", "shrek.png",
        "spongebob.png", "strawberry-shortcake.png", "yasmin.png"].map(img => `/images/characters/${img}`),
      // Decorations
      ...["airhorn.png", "balloons-10.png", "balloons-11.png", "balloons-12.png",
        "balloons-13.png", "balloons-2.png", "balloons-3.png", "balloons-4.png",
        "balloons-5.png", "balloons-6.png", "balloons-7.png", "balloons-8.png",
        "balloons-9.png", "balloons.png", "bday-cake.png", "blue-balloon.png",
        "candle.png", "flower-balloon.png", "party-hat.png", "present.png"].map(img => `/images/decorations/${img}`),
      // Junior
      ...["curious.png", "face.png", "junior box.png", "kitty.png", 
        "lazy.png", "look.png", "lounge.png", "stare.png", "stretch.png"].map(img => `/images/junior/${img}`),
      // Twilight
      ...["01-73.png", "02-1.png", "11676fb764d8a176f7b11beea551a840-1.png",
        "20210730233536696405-cakeify-1.png", "214c9ddd2b5ef07f80b02cba9697de43-1.png",
        "3485ed3f0a45212e1a0b0d1efd74094f-1.png", "3c2fa95db9a14aaa20e10b9e1a931f3b-1.png",
        "6918e9a8f58845bfba46684f78f0e1bd-1.png", "Twilight-Logo.png",
        "a8c4dea2f211254babb1ebad7edbd90d-1.png", "c68145d2793baa2c0c0366607d472d45-1.png",
        "e7204ac52980c9d84e63b2ac604d3fc4-1.png", "image-1229.png"].map(img => `/images/twilight/${img}`),
    ]
    
    // Generate 10-30 random images
    const numImages = Math.floor(Math.random() * 21) + 10
    
    // Randomly shuffle and select
    const shuffledImages = allImages.sort(() => Math.random() - 0.5)
    const selectedImages = shuffledImages.slice(0, numImages)
    
    // Add images with slight delays
    selectedImages.forEach((imagePath, index) => {
      setTimeout(() => {
        const imageSize = 80
        const padding = 60
        const x = Math.random() * (canvasWidth - padding * 2) + padding
        const y = Math.random() * (canvasHeight - padding * 2) + padding
        
        FabricImage.fromURL(imagePath, { crossOrigin: 'anonymous' }).then((img) => {
          const currentCanvas = canvasRef.current?.canvas
          if (!img || !currentCanvas) return
          
          const scale = imageSize / Math.max(img.width || 80, img.height || 80)
          const rotation = (Math.random() - 0.5) * 20
          
          img.set({
            left: x,
            top: y,
            scaleX: scale,
            scaleY: scale,
            angle: rotation,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#ff1493',
            cornerStyle: 'circle',
            cornerSize: 12,
            borderColor: '#ff1493',
            transparentCorners: false,
          })
          
          ;(img as any).customId = `image-${Date.now()}-${index}`
          ;(img as any).objectType = 'image'
          
          currentCanvas.add(img)
          currentCanvas.renderAll()
        }).catch((err) => {
          console.error('Error loading image:', err)
        })
      }, index * 15)
    })
    
    playSound('click')
  }, [])

  const handleNewCard = useCallback(() => {
    if (confirm("Start a fresh new sparkly card?")) {
      const fabricCanvas = canvasRef.current
      if (fabricCanvas) {
        fabricCanvas.clear()
      }
      playSound("click")
    }
  }, [])

  const handleSave = useCallback(async () => {
    const fabricCanvas = canvasRef.current
    if (!fabricCanvas) return

    playSound("success")

    try {
      const dataUrl = fabricCanvas.toDataURL()
      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Failed to generate image")
      }

      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `lauren-30th-birthday-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert("Card saved! Lauren is going to LOVE it!")
    } catch (error) {
      console.error("Error saving screenshot:", error)
      alert("Sorry, there was an error saving the card. Please try again!")
    }
  }, [])

  return (
    <div className="flex flex-col h-dvh mac-desktop overflow-hidden">
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-3 md:px-4 lg:px-8 xl:px-12 flex flex-col flex-1 overflow-hidden">
        {/* TopBar - Responsive browser window look for all screen sizes */}
        <TopBar onHelpClick={() => setIsTourOpen(true)} canvasRef={canvasRef} />
        
        <GuidedTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
        
        {/* Mobile/Tablet Disclaimer Popup */}
        <MobileDisclaimer />

        {/* Desktop layout - 1024px+ */}
        <div className="hidden lg:flex flex-1 gap-2 p-2 overflow-hidden">
        <ToolSidebar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          currentStamp={currentStamp}
          setCurrentStamp={setCurrentStamp}
          stampSize={stampSize}
          setStampSize={setStampSize}
          currentShape={currentShape}
          setCurrentShape={setCurrentShape}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushShape={brushShape}
          setBrushShape={setBrushShape}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          eraserShape={eraserShape}
          setEraserShape={setEraserShape}
          colors={colors}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          currentPattern={currentPattern}
          setCurrentPattern={setCurrentPattern}
          currentFont={currentFont}
          setCurrentFont={setCurrentFont}
          wackyEffect={wackyEffect}
          setWackyEffect={setWackyEffect}
          addSpecialText={addSpecialText}
          addCustomText={addCustomText}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          currentImageStamp={currentImageStamp}
          setCurrentImageStamp={setCurrentImageStamp}
          imageStampSize={imageStampSize}
          setImageStampSize={setImageStampSize}
          currentBackground={currentBackground}
          onSelectBackground={handleSelectBackground}
          closeDrawer={shouldCloseDrawer}
          onDrawerClosed={() => setShouldCloseDrawer(false)}
          onGenerateRandomStamps={generateRandomStamps}
          onGenerateRandomImages={generateRandomImages}
        />
        <CanvasArea
          ref={canvasRef}
          currentTool={currentTool}
          currentColor={currentColor}
          currentPattern={currentPattern}
          brushSize={brushSize}
          brushShape={brushShape}
          eraserSize={eraserSize}
          eraserShape={eraserShape}
          stampSize={stampSize}
          wackyEffect={wackyEffect}
          currentFont={currentFont}
          canvasElements={canvasElements}
          setCanvasElements={setCanvasElements}
          currentStamp={currentStamp}
          currentShape={currentShape}
          saveToHistory={saveToHistory}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          currentImageStamp={currentImageStamp}
          imageStampSize={imageStampSize}
          onCanvasInteraction={() => setShouldCloseDrawer(true)}
        />
      </div>

      {/* Mobile & Tablet layout - up to 1024px */}
      <div className="flex lg:hidden flex-col flex-1 overflow-hidden relative">
        {/* Canvas container - optimized for mobile/tablet with proper padding and touch handling */}
        <div 
          className="flex-1 p-1 sm:p-1.5 md:p-2 overflow-hidden min-h-0 canvas-container"
          style={{
            // Ensure canvas area doesn't shrink too much
            minHeight: "200px",
          }}
        >
          <CanvasArea
            ref={canvasRef}
            currentTool={currentTool}
            currentColor={currentColor}
            currentPattern={currentPattern}
            brushSize={brushSize}
            brushShape={brushShape}
            eraserSize={eraserSize}
            eraserShape={eraserShape}
            stampSize={stampSize}
            wackyEffect={wackyEffect}
            currentFont={currentFont}
            canvasElements={canvasElements}
            setCanvasElements={setCanvasElements}
            currentStamp={currentStamp}
            currentShape={currentShape}
            saveToHistory={saveToHistory}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            currentImageStamp={currentImageStamp}
            imageStampSize={imageStampSize}
            onCanvasInteraction={() => setMobilePanel("none")}
          />
        </div>

        <MobileToolbar
          mobilePanel={mobilePanel}
          setMobilePanel={setMobilePanel}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushShape={brushShape}
          setBrushShape={setBrushShape}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          eraserShape={eraserShape}
          setEraserShape={setEraserShape}
          currentStamp={currentStamp}
          setCurrentStamp={setCurrentStamp}
          stampSize={stampSize}
          setStampSize={setStampSize}
          currentShape={currentShape}
          setCurrentShape={setCurrentShape}
          currentImageStamp={currentImageStamp}
          setCurrentImageStamp={setCurrentImageStamp}
          imageStampSize={imageStampSize}
          setImageStampSize={setImageStampSize}
          currentPattern={currentPattern}
          setCurrentPattern={setCurrentPattern}
          wackyEffect={wackyEffect}
          setWackyEffect={setWackyEffect}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          colors={colors}
          currentFont={currentFont}
          setCurrentFont={setCurrentFont}
          addSpecialText={addSpecialText}
          addCustomText={addCustomText}
          onSelectBackground={handleSelectBackground}
          onNewCard={handleNewCard}
          onSave={handleSave}
          onHelp={() => setIsTourOpen(true)}
          onGenerateRandomStamps={generateRandomStamps}
          onGenerateRandomImages={generateRandomImages}
        />
        </div>
      </div>
    </div>
  )
}
