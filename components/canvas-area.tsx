"use client"

import type React from "react"
import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, useState, useMemo } from "react"
import { Canvas, PencilBrush, CircleBrush, Circle, Rect, Triangle, Polygon, IText, FabricImage, FabricObject, Pattern } from "fabric"
import { playSound, preloadSounds } from "@/lib/sound-manager"
import { MacWindow, macStyles } from "./mac-ui"
import type { CanvasElement } from "@/app/page"
import type { FillPattern, WackyEffect } from "./tool-sidebar"

export type BrushShape = "round" | "square" | "spray"

interface CanvasAreaProps {
  currentTool: string
  currentColor: string
  currentPattern: FillPattern
  brushSize: number
  brushShape: BrushShape
  eraserSize: number
  eraserShape: BrushShape
  stampSize: number
  wackyEffect: WackyEffect
  currentFont: string
  canvasElements: CanvasElement[]
  setCanvasElements: (elements: CanvasElement[]) => void
  currentStamp: string
  currentShape: string
  saveToHistory: () => void
  selectedElementId: string | null
  setSelectedElementId: (id: string | null) => void
}

export interface FabricCanvasRef {
  canvas: Canvas | null
  toDataURL: () => string
  clear: () => void
  getObjects: () => FabricObject[]
}

const CanvasArea = forwardRef<FabricCanvasRef, CanvasAreaProps>(
  (
    {
      currentTool,
      currentColor,
      currentPattern,
      brushSize,
      brushShape,
      eraserSize,
      eraserShape,
      stampSize,
      wackyEffect,
      currentFont,
      canvasElements,
      setCanvasElements,
      currentStamp,
      currentShape,
      saveToHistory,
      selectedElementId,
      setSelectedElementId,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [stampCursorUrl, setStampCursorUrl] = useState<string>('')
    
    // Use refs to always have latest values in Fabric.js event handlers
    const saveToHistoryRef = useRef(saveToHistory)
    const currentToolRef = useRef(currentTool)
    const currentColorRef = useRef(currentColor)
    const currentPatternRef = useRef(currentPattern)
    const currentStampRef = useRef(currentStamp)
    const currentShapeRef = useRef(currentShape)
    const brushSizeRef = useRef(brushSize)
    const stampSizeRef = useRef(stampSize)
    const wackyEffectRef = useRef(wackyEffect)
    const rainbowHueRef = useRef(0)
    
    useEffect(() => {
      saveToHistoryRef.current = saveToHistory
    }, [saveToHistory])
    
    useEffect(() => {
      currentToolRef.current = currentTool
      currentColorRef.current = currentColor
      currentPatternRef.current = currentPattern
      currentStampRef.current = currentStamp
      currentShapeRef.current = currentShape
      brushSizeRef.current = brushSize
      stampSizeRef.current = stampSize
      wackyEffectRef.current = wackyEffect
    }, [currentTool, currentColor, currentPattern, currentStamp, currentShape, brushSize, stampSize, wackyEffect])

    // Generate cursor image for stamp tool
    useEffect(() => {
      if (currentTool !== 'stamp' || !currentStamp.startsWith('/stamps/')) {
        setStampCursorUrl('')
        return
      }

      // Create a small canvas to resize the stamp for cursor use
      const cursorSize = 32 // Browser cursor size limit
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = cursorSize
        canvas.height = cursorSize
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Draw the stamp image scaled to cursor size
          ctx.drawImage(img, 0, 0, cursorSize, cursorSize)
          setStampCursorUrl(canvas.toDataURL('image/png'))
        }
      }
      
      img.onerror = () => {
        setStampCursorUrl('')
      }
      
      img.src = currentStamp
    }, [currentTool, currentStamp])

    useImperativeHandle(ref, () => ({
      canvas: fabricRef.current,
      toDataURL: () => {
        if (fabricRef.current) {
          return fabricRef.current.toDataURL({ format: 'png', multiplier: 2 })
        }
        return ''
      },
      clear: () => {
        if (fabricRef.current) {
          fabricRef.current.clear()
          fabricRef.current.backgroundColor = '#ffffff'
          fabricRef.current.renderAll()
        }
      },
      getObjects: () => {
        if (fabricRef.current) {
          return fabricRef.current.getObjects()
        }
        return []
      }
    }), [isReady])

    // Initialize Fabric canvas
    useEffect(() => {
      if (!canvasElRef.current || !containerRef.current) return
      if (fabricRef.current) return // Already initialized

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      // Don't initialize if container has no size yet
      if (rect.width === 0 || rect.height === 0) return

      const canvas = new Canvas(canvasElRef.current, {
        width: rect.width,
        height: rect.height,
        backgroundColor: '#ffffff',
        isDrawingMode: true,
        selection: true,
      })

      // Set up free drawing brush
      canvas.freeDrawingBrush = new PencilBrush(canvas)
      canvas.freeDrawingBrush.color = currentColor
      canvas.freeDrawingBrush.width = brushSize

      fabricRef.current = canvas
      setIsReady(true)
      
      // Preload KidPix sounds
      preloadSounds()

      // Handle resize
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (canvas && width > 0 && height > 0) {
            canvas.setDimensions({ width, height })
            canvas.renderAll()
          }
        }
      })

      resizeObserver.observe(container)

      // Event listeners
      canvas.on('mouse:down', (opt) => {
        if (canvas.isDrawingMode) {
          playSound('draw')
          return
        }
        
        // Handle tool clicks when not in drawing mode
        const pointer = canvas.getPointer(opt.e)
        const tool = currentToolRef.current
        
        if (tool === 'fill') {
          // Fill canvas with pattern
          const color = currentColorRef.current
          const patternType = currentPatternRef.current
          
          // Remove any existing background rect
          const existingBgRect = canvas.getObjects().find((obj: any) => obj.isBackgroundRect)
          if (existingBgRect) {
            canvas.remove(existingBgRect)
          }

          if (patternType === 'solid') {
            canvas.backgroundColor = color
          } else {
            // Create pattern canvas
            const size = 24
            const patternCanvas = document.createElement('canvas')
            patternCanvas.width = size
            patternCanvas.height = size
            const ctx = patternCanvas.getContext('2d')
            if (ctx) {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, size, size)
              ctx.fillStyle = color
              ctx.strokeStyle = color
              ctx.lineWidth = 3

              switch (patternType) {
                case 'stripes-h':
                  for (let y = 2; y < size; y += 8) ctx.fillRect(0, y, size, 4)
                  break
                case 'stripes-v':
                  for (let x = 2; x < size; x += 8) ctx.fillRect(x, 0, 4, size)
                  break
                case 'stripes-d':
                  ctx.lineWidth = 4
                  for (let i = -size; i < size * 2; i += 8) {
                    ctx.beginPath()
                    ctx.moveTo(i, 0)
                    ctx.lineTo(i + size, size)
                    ctx.stroke()
                  }
                  break
                case 'dots':
                  [[6, 6], [18, 6], [12, 12], [6, 18], [18, 18]].forEach(([x, y]) => {
                    ctx.beginPath()
                    ctx.arc(x, y, 3, 0, Math.PI * 2)
                    ctx.fill()
                  })
                  break
                case 'checkerboard':
                  for (let x = 0; x < size; x += 8) {
                    for (let y = 0; y < size; y += 8) {
                      if ((x / 8 + y / 8) % 2 === 0) ctx.fillRect(x, y, 8, 8)
                    }
                  }
                  break
                case 'hearts':
                  ctx.font = '12px serif'
                  ctx.fillText('💖', 2, 14)
                  ctx.fillText('💖', 14, 22)
                  break
                case 'stars':
                  ctx.font = '12px serif'
                  ctx.fillText('⭐', 2, 14)
                  ctx.fillText('⭐', 14, 22)
                  break
                case 'zigzag':
                  ctx.lineWidth = 3
                  ctx.beginPath()
                  ctx.moveTo(0, 8)
                  for (let x = 0; x < size; x += 6) {
                    ctx.lineTo(x + 3, 4)
                    ctx.lineTo(x + 6, 8)
                  }
                  ctx.stroke()
                  ctx.beginPath()
                  ctx.moveTo(0, 20)
                  for (let x = 0; x < size; x += 6) {
                    ctx.lineTo(x + 3, 16)
                    ctx.lineTo(x + 6, 20)
                  }
                  ctx.stroke()
                  break
                case 'confetti':
                  const confettiColors = [color, '#ff69b4', '#a855f7', '#00e5ff', '#ffd700', '#7fff00']
                  ;[[4, 4], [16, 3], [10, 12], [4, 18], [18, 16]].forEach(([x, y], i) => {
                    ctx.save()
                    ctx.translate(x, y)
                    ctx.rotate((i * 30 * Math.PI) / 180)
                    ctx.fillStyle = confettiColors[i % confettiColors.length]
                    ctx.fillRect(-2, -2, 5, 5)
                    ctx.restore()
                  })
                  break
              }
              
              canvas.backgroundColor = '#ffffff'
              const pattern = new Pattern({
                source: patternCanvas,
                repeat: 'repeat',
              })
              
              const bgRect = new Rect({
                left: 0,
                top: 0,
                width: canvas.width || 800,
                height: canvas.height || 600,
                fill: pattern,
                selectable: false,
                evented: false,
              })
              ;(bgRect as any).isBackgroundRect = true
              
              canvas.add(bgRect)
              canvas.sendObjectToBack(bgRect)
            }
          }
          
          canvas.renderAll()
          saveToHistoryRef.current()
          playSound('click')
        } else if (tool === 'stamp') {
          // Add stamp at click position
          const stamp = currentStampRef.current
          const size = stampSizeRef.current
          
          // Check if it's an image stamp
          if (stamp.startsWith('/stamps/')) {
            FabricImage.fromURL(stamp, { crossOrigin: 'anonymous' }).then((fabricImg) => {
              if (!fabricImg || !canvas) return
              
              const scale = size / Math.max(fabricImg.width || 50, fabricImg.height || 50)
              
              fabricImg.set({
                left: pointer.x,
                top: pointer.y,
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false,
                hasControls: true,
                hasBorders: true,
                cornerColor: '#ff1493',
                cornerStyle: 'circle',
                cornerSize: 12,
                borderColor: '#ff1493',
                transparentCorners: false,
                lockUniScaling: false,
                minScaleLimit: 0.1,
              })
              
              ;(fabricImg as any).customId = `stamp-${Date.now()}`
              ;(fabricImg as any).objectType = 'stamp'

              canvas.add(fabricImg)
              canvas.bringObjectToFront(fabricImg)
              canvas.renderAll()
              saveToHistoryRef.current()
              playSound('stamp')
            }).catch((err) => {
              console.error('Error loading stamp image:', stamp, err)
            })
          } else {
            // Emoji stamp fallback
            const text = new IText(stamp, {
              left: pointer.x,
              top: pointer.y,
              fontSize: size,
              originX: 'center',
              originY: 'center',
              selectable: false,
              evented: false,
              hasControls: true,
              hasBorders: true,
              cornerColor: '#ff1493',
              cornerStyle: 'circle',
              cornerSize: 12,
              borderColor: '#ff1493',
              transparentCorners: false,
              lockUniScaling: false,
              minScaleLimit: 0.1,
            })
            ;(text as any).customId = `stamp-${Date.now()}`
            ;(text as any).objectType = 'stamp'
            
            canvas.add(text)
            canvas.bringObjectToFront(text)
            canvas.renderAll()
            saveToHistoryRef.current()
            playSound('stamp')
          }
        } else if (tool === 'shapes') {
          // Add shape at click position
          const shapeType = currentShapeRef.current
          const color = currentColorRef.current
          const size = brushSizeRef.current * 4
          
          const shapeOptions = {
            left: pointer.x,
            top: pointer.y,
            fill: color,
            originX: 'center' as const,
            originY: 'center' as const,
            selectable: false,
            evented: false,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#ff1493',
            cornerStyle: 'circle' as const,
            cornerSize: 12,
            borderColor: '#ff1493',
            transparentCorners: false,
            lockUniScaling: false,
            minScaleLimit: 0.1,
          }
          
          let shape: FabricObject | null = null
          
          switch (shapeType) {
            case 'heart':
              const heartPath = `M 0 ${-size/4} 
                C 0 ${-size/2}, ${-size/2} ${-size/2}, ${-size/2} ${-size/4}
                C ${-size/2} ${size/4}, 0 ${size/2}, 0 ${size*0.6}
                C 0 ${size/2}, ${size/2} ${size/4}, ${size/2} ${-size/4}
                C ${size/2} ${-size/2}, 0 ${-size/2}, 0 ${-size/4} Z`
              const { Path } = require('fabric')
              shape = new Path(heartPath, {
                ...shapeOptions,
                stroke: color,
                strokeWidth: 1,
              })
              break
            case 'star':
              const points = []
              const outerRadius = size / 2
              const innerRadius = size / 4
              for (let i = 0; i < 10; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius
                const angle = (Math.PI / 5) * i - Math.PI / 2
                points.push({
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius,
                })
              }
              shape = new Polygon(points, shapeOptions)
              break
            case 'circle':
              shape = new Circle({
                ...shapeOptions,
                radius: size / 2,
              })
              break
            case 'square':
              shape = new Rect({
                ...shapeOptions,
                width: size,
                height: size,
              })
              break
            case 'triangle':
              shape = new Triangle({
                ...shapeOptions,
                width: size,
                height: size,
              })
              break
            case 'diamond':
              const diamondPoints = [
                { x: 0, y: -size / 2 },
                { x: size / 2, y: 0 },
                { x: 0, y: size / 2 },
                { x: -size / 2, y: 0 },
              ]
              shape = new Polygon(diamondPoints, shapeOptions)
              break
          }
          
          if (shape) {
            ;(shape as any).customId = `shape-${Date.now()}`
            ;(shape as any).objectType = 'shape'
            canvas.add(shape)
            canvas.bringObjectToFront(shape)
            canvas.renderAll()
            playSound('stamp')
          }
        } else if (tool === 'wacky') {
          const effect = wackyEffectRef.current
          
          // Apply instant effects on click
          if (effect === 'mirror') {
            // Mirror the entire canvas horizontally
            const objects = canvas.getObjects().filter((obj: any) => !obj.isBackgroundRect)
            const canvasWidth = canvas.width || 800
            objects.forEach((obj) => {
              obj.set({
                left: canvasWidth - (obj.left || 0) - (obj.width || 0) * (obj.scaleX || 1),
                flipX: !obj.flipX,
              })
              obj.setCoords()
            })
            canvas.renderAll()
            saveToHistoryRef.current()
            playSound('wacky')
          } else if (effect === 'scramble') {
            // Randomly reposition objects
            const objects = canvas.getObjects().filter((obj: any) => !obj.isBackgroundRect)
            const canvasWidth = canvas.width || 800
            const canvasHeight = canvas.height || 600
            objects.forEach((obj) => {
              obj.set({
                left: Math.random() * (canvasWidth - 100) + 50,
                top: Math.random() * (canvasHeight - 100) + 50,
                angle: Math.random() * 360,
              })
              obj.setCoords()
            })
            canvas.renderAll()
            saveToHistoryRef.current()
            playSound('wacky')
          } else if (effect === 'pixelate') {
            // Add a pixelated circle at click position
            const pixelSize = 20
            const gridSize = 5
            for (let i = 0; i < gridSize; i++) {
              for (let j = 0; j < gridSize; j++) {
                const colors = ['#ff1493', '#ff69b4', '#a855f7', '#00e5ff', '#ffd700', '#7fff00']
                const rect = new Rect({
                  left: pointer.x - (gridSize * pixelSize) / 2 + i * pixelSize,
                  top: pointer.y - (gridSize * pixelSize) / 2 + j * pixelSize,
                  width: pixelSize - 2,
                  height: pixelSize - 2,
                  fill: colors[Math.floor(Math.random() * colors.length)],
                  selectable: false,
                  evented: false,
                })
                ;(rect as any).customId = `pixel-${Date.now()}-${i}-${j}`
                canvas.add(rect)
                canvas.bringObjectToFront(rect)
              }
            }
            canvas.renderAll()
            saveToHistoryRef.current()
            playSound('wacky')
          }
        }
      })

      // Handle wacky effects that need mouse:move (smear, rainbow)
      let isWackyDragging = false
      let lastWackyPos = { x: 0, y: 0 }

      canvas.on('mouse:down', (opt) => {
        const tool = currentToolRef.current
        if (tool === 'wacky') {
          const effect = wackyEffectRef.current
          if (effect === 'smear' || effect === 'rainbow') {
            isWackyDragging = true
            const pointer = canvas.getPointer(opt.e)
            lastWackyPos = { x: pointer.x, y: pointer.y }
          }
        }
      })

      canvas.on('mouse:move', (opt) => {
        if (!isWackyDragging) return
        
        const tool = currentToolRef.current
        if (tool !== 'wacky') {
          isWackyDragging = false
          return
        }

        const effect = wackyEffectRef.current
        const pointer = canvas.getPointer(opt.e)
        
        if (effect === 'rainbow') {
          // Draw with rainbow colors
          rainbowHueRef.current = (rainbowHueRef.current + 5) % 360
          const color = `hsl(${rainbowHueRef.current}, 100%, 50%)`
          
          const circle = new Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 15,
            fill: color,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
          })
          ;(circle as any).customId = `rainbow-${Date.now()}`
          canvas.add(circle)
          canvas.bringObjectToFront(circle)
          canvas.renderAll()
        } else if (effect === 'smear') {
          // Create a smear/trail effect
          const dx = pointer.x - lastWackyPos.x
          const dy = pointer.y - lastWackyPos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 5) {
            // Create elongated ellipse in direction of movement
            const angle = Math.atan2(dy, dx) * (180 / Math.PI)
            const colors = ['#ff1493', '#ff69b4', '#ffb6d9', '#ffc0e0']
            const ellipse = new Circle({
              left: pointer.x,
              top: pointer.y,
              radius: 20,
              fill: colors[Math.floor(Math.random() * colors.length)],
              opacity: 0.6,
              originX: 'center',
              originY: 'center',
              scaleX: 1.5,
              angle: angle,
              selectable: false,
              evented: false,
            })
            ;(ellipse as any).customId = `smear-${Date.now()}`
            canvas.add(ellipse)
            canvas.bringObjectToFront(ellipse)
            canvas.renderAll()
            
            lastWackyPos = { x: pointer.x, y: pointer.y }
          }
        }
      })

      canvas.on('mouse:up', () => {
        if (isWackyDragging) {
          isWackyDragging = false
          saveToHistoryRef.current()
        }
      })

      // Use ref to always call latest saveToHistory
      canvas.on('path:created', () => {
        saveToHistoryRef.current()
      })

      canvas.on('object:added', (e) => {
        // Don't double-save for paths (handled by path:created)
        if (e.target?.type === 'path') return
        saveToHistoryRef.current()
      })

      canvas.on('object:modified', () => {
        saveToHistoryRef.current()
      })

      canvas.on('selection:created', (e) => {
        const selected = e.selected?.[0]
        if (selected && (selected as any).customId) {
          setSelectedElementId((selected as any).customId)
        }
      })

      canvas.on('selection:cleared', () => {
        setSelectedElementId(null)
      })

      return () => {
        resizeObserver.disconnect()
        canvas.dispose()
        fabricRef.current = null
        setIsReady(false)
      }
    }, [])

    // Create brush based on shape
    const createBrush = useCallback((canvas: Canvas, shape: BrushShape, color: string, size: number) => {
      let brush
      if (shape === 'spray') {
        brush = new CircleBrush(canvas)
        brush.width = size * 3
      } else {
        brush = new PencilBrush(canvas)
        brush.width = size
        // For square brush, increase the stroke width and use different line cap
        if (shape === 'square') {
          ;(brush as any).strokeLineCap = 'square'
          ;(brush as any).strokeLineJoin = 'miter'
        } else {
          ;(brush as any).strokeLineCap = 'round'
          ;(brush as any).strokeLineJoin = 'round'
        }
      }
      brush.color = color
      return brush
    }, [])

    // Update brush settings when tool/color/size/shape changes
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return

      if (currentTool === 'brush') {
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = createBrush(canvas, brushShape, currentColor, brushSize)
      } else if (currentTool === 'eraser') {
        canvas.isDrawingMode = true
        // Get background color for eraser
        const bgColor = (canvas.backgroundColor as string) || '#ffffff'
        canvas.freeDrawingBrush = createBrush(canvas, eraserShape, bgColor, eraserSize)
      } else {
        canvas.isDrawingMode = false
      }

      // Enable/disable selection based on tool
      if (currentTool === 'move') {
        canvas.selection = true
        canvas.forEachObject((obj) => {
          obj.selectable = true
          obj.evented = true
        })
      } else if (currentTool !== 'brush' && currentTool !== 'eraser') {
        canvas.selection = false
        canvas.forEachObject((obj) => {
          obj.selectable = false
          obj.evented = false
        })
      }
    }, [currentTool, currentColor, brushSize, brushShape, eraserSize, eraserShape, createBrush])

    // Handle image upload event
    useEffect(() => {
      const handleImageUpload = async (e: CustomEvent) => {
        const canvas = fabricRef.current
        if (!canvas) return

        const dataUrl = e.detail as string
        
        try {
          const img = await FabricImage.fromURL(dataUrl)
          const maxSize = 200
          const scale = Math.min(maxSize / (img.width || 200), maxSize / (img.height || 200))
          
          img.scale(scale)
          img.set({
            left: 100,
            top: 100,
            // Enable scaling controls
            hasControls: true,
            hasBorders: true,
            cornerColor: '#ff1493',
            cornerStyle: 'circle',
            cornerSize: 12,
            borderColor: '#ff1493',
            transparentCorners: false,
            lockUniScaling: false,
            minScaleLimit: 0.1,
          })
          ;(img as any).customId = `image-${Date.now()}`
          ;(img as any).objectType = 'image'
          
          canvas.add(img)
          canvas.bringObjectToFront(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
          playSound('stamp')
        } catch (err) {
          console.error('Failed to load image:', err)
        }
      }

      window.addEventListener('imageUpload', handleImageUpload as EventListener)
      return () => window.removeEventListener('imageUpload', handleImageUpload as EventListener)
    }, [])

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

    const addStamp = useCallback((x: number, y: number) => {
      const canvas = fabricRef.current
      if (!canvas) return

      const stamp = currentStampRef.current
      const size = stampSizeRef.current

      // Check if it's an image stamp (path starting with /stamps/)
      if (stamp.startsWith('/stamps/')) {
        // Use FabricImage.fromURL for all image types (works with SVG too)
        FabricImage.fromURL(stamp, { crossOrigin: 'anonymous' }).then((fabricImg) => {
          if (!fabricImg || !canvas) return
          
          const scale = size / Math.max(fabricImg.width || 50, fabricImg.height || 50)
          
          fabricImg.set({
            left: x,
            top: y,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
            selectable: currentToolRef.current === 'move',
            evented: currentToolRef.current === 'move',
            hasControls: true,
            hasBorders: true,
            cornerColor: '#ff1493',
            cornerStyle: 'circle',
            cornerSize: 12,
            borderColor: '#ff1493',
            transparentCorners: false,
            lockUniScaling: false,
            minScaleLimit: 0.1,
          })
          
          ;(fabricImg as any).customId = `stamp-${Date.now()}`
          ;(fabricImg as any).objectType = 'stamp'

          canvas.add(fabricImg)
          canvas.bringObjectToFront(fabricImg)
          canvas.renderAll()
          playSound('stamp')
        }).catch((err) => {
          console.error('Error loading stamp image:', stamp, err)
        })
      } else {
        // Emoji stamp (legacy fallback)
        const text = new IText(stamp, {
          left: x,
          top: y,
          fontSize: size,
          originX: 'center',
          originY: 'center',
          selectable: currentToolRef.current === 'move',
          evented: currentToolRef.current === 'move',
          hasControls: true,
          hasBorders: true,
          cornerColor: '#ff1493',
          cornerStyle: 'circle',
          cornerSize: 12,
          borderColor: '#ff1493',
          transparentCorners: false,
          lockUniScaling: false,
          minScaleLimit: 0.1,
        })
        ;(text as any).customId = `stamp-${Date.now()}`
        ;(text as any).objectType = 'stamp'

        canvas.add(text)
        canvas.bringObjectToFront(text)
        canvas.renderAll()
        playSound('stamp')
      }
    }, [])

    const addShape = useCallback((x: number, y: number) => {
      const canvas = fabricRef.current
      if (!canvas) return

      const size = brushSize * 4
      let shape: FabricObject | null = null

      const shapeOptions = {
        left: x,
        top: y,
        fill: currentColor,
        originX: 'center' as const,
        originY: 'center' as const,
        selectable: currentTool === 'move',
        evented: currentTool === 'move',
        // Enable scaling controls
        hasControls: true,
        hasBorders: true,
        cornerColor: '#ff1493',
        cornerStyle: 'circle' as const,
        cornerSize: 12,
        borderColor: '#ff1493',
        transparentCorners: false,
        lockUniScaling: false,
        minScaleLimit: 0.1,
      }

      switch (currentShape) {
        case 'heart':
          // Create heart using path
          const heartPath = `M 0 ${-size/4} 
            C 0 ${-size/2}, ${-size/2} ${-size/2}, ${-size/2} ${-size/4}
            C ${-size/2} ${size/4}, 0 ${size/2}, 0 ${size*0.6}
            C 0 ${size/2}, ${size/2} ${size/4}, ${size/2} ${-size/4}
            C ${size/2} ${-size/2}, 0 ${-size/2}, 0 ${-size/4} Z`
          const { Path } = require('fabric')
          shape = new Path(heartPath, {
            ...shapeOptions,
            stroke: currentColor,
            strokeWidth: 1,
          })
          break
        case 'star':
          const points = []
          const outerRadius = size / 2
          const innerRadius = size / 4
          for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI / 5) * i - Math.PI / 2
            points.push({
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            })
          }
          shape = new Polygon(points, shapeOptions)
          break
        case 'circle':
          shape = new Circle({
            ...shapeOptions,
            radius: size / 2,
          })
          break
        case 'square':
          shape = new Rect({
            ...shapeOptions,
            width: size,
            height: size,
          })
          break
        case 'triangle':
          shape = new Triangle({
            ...shapeOptions,
            width: size,
            height: size,
          })
          break
        case 'diamond':
          const diamondPoints = [
            { x: 0, y: -size / 2 },
            { x: size / 2, y: 0 },
            { x: 0, y: size / 2 },
            { x: -size / 2, y: 0 },
          ]
          shape = new Polygon(diamondPoints, shapeOptions)
          break
      }

      if (shape) {
        ;(shape as any).customId = `shape-${Date.now()}`
        ;(shape as any).objectType = 'shape'
        canvas.add(shape)
        canvas.bringObjectToFront(shape)
        canvas.renderAll()
        playSound('stamp')
      }
    }, [currentShape, currentColor, brushSize, currentTool])

    const addText = useCallback((x: number, y: number) => {
      const canvas = fabricRef.current
      if (!canvas) return

      const text = prompt('Enter text:')
      if (!text) return

      const itext = new IText(text, {
        left: x,
        top: y,
        fontSize: brushSize * 4,
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
        // Corner styling for visual consistency
        cornerColor: '#ff1493',
        cornerStyle: 'circle',
        cornerSize: 12,
        borderColor: '#ff1493',
        borderScaleFactor: 2,
        transparentCorners: false,
        // Enable uniform scaling with shift key, but allow non-uniform too
        lockUniScaling: false,
        centeredScaling: false,
        // Minimum scale
        minScaleLimit: 0.1,
      })
      ;(itext as any).customId = `text-${Date.now()}`
      ;(itext as any).objectType = 'text'

      canvas.add(itext)
      canvas.bringObjectToFront(itext)
      canvas.setActiveObject(itext)
      canvas.renderAll()
      playSound('click')
    }, [currentColor, brushSize, currentFont])

    // Generate pattern canvas for fill
    const createPatternCanvas = useCallback((color: string, patternType: FillPattern): HTMLCanvasElement | null => {
      if (patternType === 'solid') {
        return null
      }

      const size = 24
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = size
      patternCanvas.height = size
      const ctx = patternCanvas.getContext('2d')
      if (!ctx) return null

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineWidth = 3

      switch (patternType) {
        case 'stripes-h':
          for (let y = 2; y < size; y += 8) {
            ctx.fillRect(0, y, size, 4)
          }
          break
        case 'stripes-v':
          for (let x = 2; x < size; x += 8) {
            ctx.fillRect(x, 0, 4, size)
          }
          break
        case 'stripes-d':
          ctx.lineWidth = 4
          for (let i = -size; i < size * 2; i += 8) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i + size, size)
            ctx.stroke()
          }
          break
        case 'dots':
          const dotPositions = [[6, 6], [18, 6], [12, 12], [6, 18], [18, 18]]
          dotPositions.forEach(([x, y]) => {
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fill()
          })
          break
        case 'checkerboard':
          for (let x = 0; x < size; x += 8) {
            for (let y = 0; y < size; y += 8) {
              if ((x / 8 + y / 8) % 2 === 0) {
                ctx.fillRect(x, y, 8, 8)
              }
            }
          }
          break
        case 'hearts':
          ctx.font = '12px serif'
          ctx.fillText('💖', 2, 14)
          ctx.fillText('💖', 14, 22)
          break
        case 'stars':
          ctx.font = '12px serif'
          ctx.fillText('⭐', 2, 14)
          ctx.fillText('⭐', 14, 22)
          break
        case 'zigzag':
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(0, 8)
          for (let x = 0; x < size; x += 6) {
            ctx.lineTo(x + 3, 4)
            ctx.lineTo(x + 6, 8)
          }
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, 20)
          for (let x = 0; x < size; x += 6) {
            ctx.lineTo(x + 3, 16)
            ctx.lineTo(x + 6, 20)
          }
          ctx.stroke()
          break
        case 'confetti':
          const confettiColors = [color, '#ff69b4', '#a855f7', '#00e5ff', '#ffd700', '#7fff00']
          const confettiPositions = [[4, 4], [16, 3], [10, 12], [4, 18], [18, 16]]
          confettiPositions.forEach(([x, y], i) => {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate((i * 30 * Math.PI) / 180)
            ctx.fillStyle = confettiColors[i % confettiColors.length]
            ctx.fillRect(-2, -2, 5, 5)
            ctx.restore()
          })
          break
      }

      return patternCanvas
    }, [])

    const fillCanvas = useCallback((color: string, patternType: FillPattern) => {
      const canvas = fabricRef.current
      if (!canvas) return

      // Remove any existing background rect
      const existingBgRect = canvas.getObjects().find((obj: any) => obj.isBackgroundRect)
      if (existingBgRect) {
        canvas.remove(existingBgRect)
      }

      if (patternType === 'solid') {
        canvas.backgroundColor = color
      } else {
        // For patterns, create a rect with the pattern and place it at the back
        canvas.backgroundColor = '#ffffff'
        
        const patternCanvas = createPatternCanvas(color, patternType)
        if (patternCanvas) {
          const pattern = new Pattern({
            source: patternCanvas,
            repeat: 'repeat',
          })
          
          const bgRect = new Rect({
            left: 0,
            top: 0,
            width: canvas.width || 800,
            height: canvas.height || 600,
            fill: pattern,
            selectable: false,
            evented: false,
            excludeFromExport: false,
          })
          ;(bgRect as any).isBackgroundRect = true
          
          canvas.add(bgRect)
          canvas.sendObjectToBack(bgRect)
        }
      }
      
      canvas.renderAll()
      saveToHistoryRef.current()
      playSound('fill')
    }, [createPatternCanvas])

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = fabricRef.current
      if (!canvas) return

      // Only handle clicks for specific tools when not in drawing mode
      if (canvas.isDrawingMode) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      switch (currentTool) {
        case 'stamp':
          addStamp(x, y)
          break
        case 'shapes':
          addShape(x, y)
          break
        case 'text':
          addText(x, y)
          break
        case 'fill':
          fillCanvas(currentColor, currentPattern)
          break
      }
    }, [currentTool, currentColor, currentPattern, addStamp, addShape, addText, fillCanvas])

    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false)
    const [currentBackground, setCurrentBackground] = useState('#ffffff')
    const backgroundPickerRef = useRef<HTMLDivElement>(null)

    const backgrounds = useMemo(() => [
      { id: 'white', value: '#ffffff', label: 'White', type: 'color' as const },
      { id: 'cream', value: '#f5f5dc', label: 'Cream', type: 'color' as const },
      { id: 'lavender', value: '#e6e6fa', label: 'Lavender', type: 'color' as const },
      { id: 'mint', value: '#f0fff0', label: 'Mint', type: 'color' as const },
      { id: 'blush', value: '#fff0f5', label: 'Blush', type: 'color' as const },
      { id: 'peach', value: '#ffecd2', label: 'Peach', type: 'color' as const },
      { id: 'sky', value: '#e0f7ff', label: 'Sky', type: 'color' as const },
      { id: 'rose', value: '#ffe4ec', label: 'Rose', type: 'color' as const },
      // Future image backgrounds will go here with type: 'image'
    ], [])

    // Close background picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (backgroundPickerRef.current && !backgroundPickerRef.current.contains(e.target as Node)) {
          setShowBackgroundPicker(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleBackgroundSelect = (bg: typeof backgrounds[0]) => {
      setCurrentBackground(bg.value)
      fillCanvas(bg.value, 'solid')
      setShowBackgroundPicker(false)
      playSound('click')
    }

    const currentBg = backgrounds.find(bg => bg.value === currentBackground) || backgrounds[0]

    return (
      <MacWindow ref={containerRef} className="flex-1 relative overflow-hidden h-full">
        <div className="absolute top-1 right-1 z-40" ref={backgroundPickerRef}>
          <button
            onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
            className="flex items-center gap-1.5 text-xs pixel-text cursor-pointer px-2 py-1"
            style={{
              ...macStyles.button,
              background: 'linear-gradient(180deg, #fff 0%, #f0f0f0 100%)',
            }}
          >
            <div 
              className="w-4 h-4 border border-gray-400 rounded-sm"
              style={{ backgroundColor: currentBackground }}
            />
            <span>Background</span>
            <span className="text-[10px]">{showBackgroundPicker ? '▲' : '▼'}</span>
          </button>

          {showBackgroundPicker && (
            <div 
              className="absolute top-full right-0 mt-1 p-2 border-2 shadow-lg min-w-[160px]"
              style={{
                background: 'linear-gradient(180deg, #fff 0%, #f8f8f8 100%)',
                borderColor: '#ff69b4',
              }}
            >
              <div className="text-[10px] font-bold pixel-text mb-2 text-center" style={{ color: '#c71585' }}>
                Choose Background
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => handleBackgroundSelect(bg)}
                    className={`group flex flex-col items-center gap-0.5 p-1 rounded transition-all hover:scale-105 ${
                      currentBackground === bg.value ? 'ring-2 ring-pink-500 bg-pink-100' : 'hover:bg-pink-50'
                    }`}
                    title={bg.label}
                  >
                    <div 
                      className="w-7 h-7 border-2 rounded-sm"
                      style={{ 
                        backgroundColor: bg.type === 'color' ? bg.value : undefined,
                        backgroundImage: bg.type === 'image' ? `url(${bg.value})` : undefined,
                        backgroundSize: 'cover',
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
          )}
        </div>
        <canvas
          ref={canvasElRef}
          onClick={handleCanvasClick}
          className="w-full h-full touch-none"
          style={{ 
            touchAction: 'none',
            cursor: currentTool === 'stamp' && stampCursorUrl
              ? `url(${stampCursorUrl}) 16 16, crosshair`
              : currentTool === 'stamp' 
                ? 'crosshair' 
                : currentTool === 'brush' || currentTool === 'eraser'
                  ? 'crosshair'
                  : currentTool === 'fill'
                    ? 'crosshair'
                    : 'default'
          }}
        />
      </MacWindow>
    )
  },
)

CanvasArea.displayName = 'CanvasArea'

export default CanvasArea
