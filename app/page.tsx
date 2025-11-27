"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import TopBar from "@/components/top-bar"
import ToolSidebar, { FillPattern, WackyEffect } from "@/components/tool-sidebar"
import CanvasArea, { FabricCanvasRef, BrushShape } from "@/components/canvas-area"
import BottomBar from "@/components/bottom-bar"
import MobileToolbar from "@/components/mobile-toolbar"
import { IText } from "fabric"
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
  const [currentTool, setCurrentTool] = useState<string>("brush")
  const [currentColor, setCurrentColor] = useState<string>("#ff1493")
  const [brushSize, setBrushSize] = useState<number>(5)
  const [brushShape, setBrushShape] = useState<BrushShape>("round")
  const [eraserSize, setEraserSize] = useState<number>(10)
  const [eraserShape, setEraserShape] = useState<BrushShape>("round")
  const [currentFont, setCurrentFont] = useState<string>("pixel")
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [mobilePanel, setMobilePanel] = useState<"none" | "tools" | "colors" | "options" | "stamps" | "shapes" | "brushOptions" | "eraserOptions">("none")
  const [currentStamp, setCurrentStamp] = useState<string>("/stamps/kidpix-spritesheet-0-1.svg")
  const [stampSize, setStampSize] = useState<number>(48)
  const [currentShape, setCurrentShape] = useState<string>("heart")
  const [currentPattern, setCurrentPattern] = useState<FillPattern>("solid")
  const [wackyEffect, setWackyEffect] = useState<WackyEffect>("smear")
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
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
        return 'Bagel Fat One, cursive'
      case 'script':
        return 'Imperial Script, cursive'
      case 'narrow':
        return 'Instrument Serif, serif'
      case 'pixel':
      default:
        return 'Pixelify Sans, monospace'
    }
  }

  const addSpecialText = useCallback(
    (text: string) => {
      const canvas = canvasRef.current?.canvas
      if (!canvas) return

      const itext = new IText(text, {
        left: 150 + Math.random() * 100,
        top: 150 + Math.random() * 100,
        fontSize: 32,
        fontFamily: getFontFamily(currentFont),
        fill: currentColor,
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

  return (
    <div className="flex flex-col h-dvh mac-desktop overflow-hidden">
      <TopBar />

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 gap-2 p-2 overflow-hidden">
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
        />
      </div>

      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        {/* Canvas container - takes all remaining space above toolbar */}
        <div className="flex-1 p-2 overflow-hidden min-h-0">
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
          currentShape={currentShape}
          setCurrentShape={setCurrentShape}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          colors={colors}
          currentFont={currentFont}
          setCurrentFont={setCurrentFont}
          addSpecialText={addSpecialText}
        />
      </div>

      <div className="hidden md:block">
        <BottomBar canvasRef={canvasRef} />
      </div>
    </div>
  )
}
