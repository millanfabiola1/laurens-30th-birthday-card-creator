"use client"

import type React from "react"
import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, useState, useMemo } from "react"
import { Canvas, PencilBrush, CircleBrush, Circle, Rect, Triangle, Polygon, IText, FabricImage, FabricObject, Pattern, Gradient } from "fabric"
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
  currentImageStamp: string
  imageStampSize: number
  onCanvasInteraction?: () => void
}

export interface FabricCanvasRef {
  canvas: Canvas | null
  toDataURL: () => string
  clear: () => void
  getObjects: () => FabricObject[]
  fillCanvas?: (color: string, pattern: string) => void
  setImageBackground?: (imageUrl: string) => void
  setGradientBackground?: (gradientCss: string) => void
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
      currentImageStamp,
      imageStampSize,
      onCanvasInteraction,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [stampCursorUrl, setStampCursorUrl] = useState<string>('')
    const [showStartFreshButton, setShowStartFreshButton] = useState(true)
    
    // Store default stamps for easy removal when background changes
    const defaultStampsRef = useRef<FabricObject[]>([])
    
    // Flag to stop adding default stamps after user interaction
    const stopAddingDefaultStampsRef = useRef(false)
    
    // Flag to track if this is the first background change (should clear like "New Design")
    const isFirstBackgroundChangeRef = useRef(true)
    
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
    const currentImageStampRef = useRef(currentImageStamp)
    const imageStampSizeRef = useRef(imageStampSize)
    const onCanvasInteractionRef = useRef(onCanvasInteraction)
    
    useEffect(() => {
      onCanvasInteractionRef.current = onCanvasInteraction
    }, [onCanvasInteraction])
    
    // Stamp drawing state (for drawing trails of stamps)
    const isStampDrawingRef = useRef(false)
    const lastStampPosRef = useRef<{ x: number; y: number } | null>(null)
    const stampSpacing = 0.7 // Spacing multiplier relative to stamp size
    
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
      currentImageStampRef.current = currentImageStamp
      imageStampSizeRef.current = imageStampSize
    }, [currentTool, currentColor, currentPattern, currentStamp, currentShape, brushSize, stampSize, wackyEffect, currentImageStamp, imageStampSize])

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

    // Update Fabric.js canvas cursor when stamp cursor changes
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return

      if (currentTool === 'stamp' && stampCursorUrl) {
        const cursorStyle = `url(${stampCursorUrl}) 16 16, crosshair`
        canvas.defaultCursor = cursorStyle
        canvas.hoverCursor = cursorStyle
        // Also set on the upper canvas element directly
        const upperCanvas = canvas.upperCanvasEl
        if (upperCanvas) {
          upperCanvas.style.cursor = cursorStyle
        }
      } else if (currentTool === 'stamp' || currentTool === 'images') {
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
      } else if (currentTool === 'brush' || currentTool === 'eraser') {
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
      } else if (currentTool === 'fill') {
        canvas.defaultCursor = 'crosshair'
        canvas.hoverCursor = 'crosshair'
      } else {
        canvas.defaultCursor = 'default'
        canvas.hoverCursor = 'move'
      }
    }, [currentTool, stampCursorUrl, isReady])

    // Update selected text color when currentColor changes
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas || !isReady) return

      // Only update if we're working with text (text tool active or text object selected)
      const activeObject = canvas.getActiveObject()
      if (activeObject && (activeObject as any).objectType === 'text' && activeObject.type === 'i-text') {
        const textObject = activeObject as IText
        if (textObject.fill !== currentColor) {
          textObject.set('fill', currentColor)
          canvas.renderAll()
          saveToHistoryRef.current()
        }
      }
    }, [currentColor, isReady])

    // Helper function to ensure background objects stay locked and at the back
    const ensureBackgroundLockedRef = useRef<() => void>(() => {})
    const ensureBackgroundLocked = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      
      const backgroundObjects = canvas.getObjects().filter((obj: any) => obj.isBackgroundRect)
      backgroundObjects.forEach((bgObj) => {
        // Send to back
        canvas.sendObjectToBack(bgObj)
        // Lock all properties completely
        bgObj.set({
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          lockSkewingX: true,
          lockSkewingY: true,
          hasControls: false,
          hasBorders: false,
          hasRotatingPoint: false,
          hoverCursor: 'default',
          moveCursor: 'default',
        })
        // Force update coords to prevent any movement
        bgObj.setCoords()
      })
    }, [])
    
    useEffect(() => {
      ensureBackgroundLockedRef.current = ensureBackgroundLocked
    }, [ensureBackgroundLocked])

    // Shared function to completely clear the canvas - used by both "New Design" and first background change
    const clearCanvasCompletely = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      
      console.log('=== CLEARING CANVAS COMPLETELY ===')
      
      // Stop any more default stamps from loading
      stopAddingDefaultStampsRef.current = true
      defaultStampsRef.current = []
      
      // Remove all objects one by one
      const allObjects = canvas.getObjects()
      console.log('Objects to remove:', allObjects.length)
      allObjects.forEach((obj: any) => {
        canvas.remove(obj)
      })
      
      // Call Fabric's clear method
      canvas.clear()
      
      // Set white background
      canvas.backgroundColor = '#ffffff'
      canvas.renderAll()
      
      console.log('Canvas cleared, objects now:', canvas.getObjects().length)
    }, [])

    useImperativeHandle(ref, () => ({
      canvas: fabricRef.current,
      toDataURL: () => {
        if (fabricRef.current) {
          return fabricRef.current.toDataURL({ format: 'png', multiplier: 2 })
        }
        return ''
      },
      clear: () => {
        clearCanvasCompletely()
      },
      getObjects: () => {
        if (fabricRef.current) {
          return fabricRef.current.getObjects()
        }
        return []
      },
      fillCanvas: (color: string, pattern: string) => {
        const canvas = fabricRef.current
        if (!canvas) return
        
        // Remove existing background
        const existingBgRect = canvas.getObjects().find((obj: any) => obj.isBackgroundRect)
        if (existingBgRect) {
          canvas.remove(existingBgRect)
        }
        
        // Create background rect with color
        const bgRect = new Rect({
          left: 0,
          top: 0,
          width: canvas.width || 800,
          height: canvas.height || 600,
          fill: color,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
        })
        ;(bgRect as any).isBackgroundRect = true
        canvas.add(bgRect)
        canvas.sendObjectToBack(bgRect)
        canvas.renderAll()
      },
      setImageBackground: (imageUrl: string) => {
        const canvas = fabricRef.current
        if (!canvas) return
        
        FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
          if (!img || !canvas) return
          
          // Remove existing background
          const existingBg = canvas.getObjects().find((obj: any) => obj.isBackgroundRect)
          if (existingBg) {
            canvas.remove(existingBg)
          }

          const canvasWidth = canvas.width || 800
          const canvasHeight = canvas.height || 600
          
          // Scale image to cover entire canvas (cover mode)
          const scaleX = canvasWidth / (img.width || 1)
          const scaleY = canvasHeight / (img.height || 1)
          const scale = Math.max(scaleX, scaleY)
          
          // Center the image on canvas
          const scaledWidth = (img.width || 1) * scale
          const scaledHeight = (img.height || 1) * scale
          const left = (canvasWidth - scaledWidth) / 2
          const top = (canvasHeight - scaledHeight) / 2

          img.set({
            left: left,
            top: top,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false,
            originX: 'left',
            originY: 'top',
          })
          ;(img as any).isBackgroundRect = true
          canvas.add(img)
          canvas.sendObjectToBack(img)
          canvas.renderAll()
        })
      },
      setGradientBackground: (gradientCss: string) => {
        const canvas = fabricRef.current
        if (!canvas) return
        
        // Stop adding any more default stamps
        stopAddingDefaultStampsRef.current = true
        
        // On FIRST background change, clear everything like "New Design" button
        if (isFirstBackgroundChangeRef.current) {
          console.log('First background change (gradient) - using clearCanvasCompletely')
          isFirstBackgroundChangeRef.current = false
          
          // Use the exact same clear function as "New Design" button
          clearCanvasCompletely()
          
          // Schedule repeated cleanups
          const cleanup = () => {
            const c = fabricRef.current
            if (!c) return
            c.getObjects().filter((obj: any) => obj.isDefaultStamp || obj.objectType === 'stamp')
              .forEach((obj: any) => c.remove(obj))
            c.renderAll()
          }
          setTimeout(cleanup, 100)
          setTimeout(cleanup, 500)
          setTimeout(cleanup, 1000)
          setTimeout(cleanup, 2000)
        } else {
          // Subsequent changes - just remove background objects
          canvas.getObjects().filter((obj: any) => obj.isBackgroundRect).forEach((obj: any) => canvas.remove(obj))
        }

        // Parse the CSS gradient to extract colors and direction
        // Format: linear-gradient(135deg, #color1 0%, #color2 50%, #color3 100%)
        const gradientMatch = gradientCss.match(/linear-gradient\((\d+)deg,\s*(.+)\)/)
        if (!gradientMatch) return

        const angle = parseInt(gradientMatch[1])
        const colorStops = gradientMatch[2].split(',').map(stop => {
          const parts = stop.trim().split(/\s+/)
          return {
            color: parts[0],
            offset: parseInt(parts[1]) / 100
          }
        })

        // Convert angle to coordinates
        const angleRad = (angle - 90) * Math.PI / 180
        const canvasWidth = canvas.width || 800
        const canvasHeight = canvas.height || 600

        // Create gradient coordinates based on angle
        const coords = {
          x1: canvasWidth / 2 - Math.cos(angleRad) * canvasWidth / 2,
          y1: canvasHeight / 2 - Math.sin(angleRad) * canvasHeight / 2,
          x2: canvasWidth / 2 + Math.cos(angleRad) * canvasWidth / 2,
          y2: canvasHeight / 2 + Math.sin(angleRad) * canvasHeight / 2,
        }

        // Create background rect with gradient
        const bgRect = new Rect({
          left: 0,
          top: 0,
          width: canvasWidth,
          height: canvasHeight,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
        })

        // Apply gradient
        bgRect.set('fill', new Gradient({
          type: 'linear',
          coords: coords,
          colorStops: colorStops.map(stop => ({
            offset: stop.offset,
            color: stop.color
          }))
        }))

        ;(bgRect as any).isBackgroundRect = true
        canvas.add(bgRect)
        canvas.sendObjectToBack(bgRect)
        canvas.renderAll()
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
            const oldWidth = canvas.width || 800
            const oldHeight = canvas.height || 600
            
            canvas.setDimensions({ width, height })
            
            // Update default background image to auto-fit new canvas size (maintain aspect ratio)
            const defaultBg = canvas.getObjects().find((obj: any) => (obj as any).isDefaultBackground)
            if (defaultBg && defaultBg.type === 'image') {
              const img = defaultBg as any
              const originalWidth = img.originalWidth || img.width || 1
              const originalHeight = img.originalHeight || img.height || 1
              
              if (originalWidth > 0 && originalHeight > 0) {
                // Calculate scale to fit within canvas while maintaining aspect ratio
                const scaleX = width / originalWidth
                const scaleY = height / originalHeight
                const scale = Math.min(scaleX, scaleY) // Use smaller scale to fit within canvas
                
                // Calculate centered position
                const scaledWidth = originalWidth * scale
                const scaledHeight = originalHeight * scale
                const left = (width - scaledWidth) / 2
                const top = (height - scaledHeight) / 2
                
                img.set({
                  left: left,
                  top: top,
                  scaleX: scale,
                  scaleY: scale,
                })
              }
            }
            
            canvas.renderAll()
          }
        }
      })

      resizeObserver.observe(container)

      // Event listeners
      canvas.on('mouse:down', (opt) => {
        const tool = currentToolRef.current
        
        // Prevent any interaction with background objects EXCEPT when using images tool
        // (we need to allow clicks on background to place images)
        if (opt.target && (opt.target as any).isBackgroundRect && tool !== 'images') {
          canvas.discardActiveObject()
          canvas.renderAll()
          return
        }
        
        // Notify parent that canvas was interacted with (to close drawer)
        onCanvasInteractionRef.current?.()
        
        if (canvas.isDrawingMode) {
          playSound('draw')
          return
        }
        
        // Handle tool clicks when not in drawing mode
        const pointer = canvas.getPointer(opt.e)
        
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
                lockMovementX: true,
                lockMovementY: true,
                hasControls: false,
                hasBorders: false,
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
          // If there's an active selection and user clicked on empty space, just deselect first
          if (!opt.target || (opt.target as any).isBackgroundRect) {
            const activeObject = canvas.getActiveObject()
            if (activeObject) {
              canvas.discardActiveObject()
              canvas.renderAll()
              return // Don't add new stamp, just deselect
            }
          }
          
          // Start stamp drawing mode
          isStampDrawingRef.current = true
          lastStampPosRef.current = { x: pointer.x, y: pointer.y }
          
          // Add first stamp at click position
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
        } else if (tool === 'images') {
          // Check if user clicked on an existing object (not background)
          // If so, let Fabric.js handle selection/resizing instead of placing new image
          if (opt.target && !(opt.target as any).isBackgroundRect) {
            // User clicked on existing object - select it for resizing
            canvas.setActiveObject(opt.target)
            canvas.renderAll()
            return
          }
          
          // If clicked on background or empty space, add new image
          // (Background clicks are now allowed for images tool)
          const imageStamp = currentImageStampRef.current
          const size = imageStampSizeRef.current
          
          FabricImage.fromURL(imageStamp, { crossOrigin: 'anonymous' }).then((fabricImg) => {
            if (!fabricImg || !canvas) return
            
            const scale = size / Math.max(fabricImg.width || 100, fabricImg.height || 100)
            
            fabricImg.set({
              left: pointer.x,
              top: pointer.y,
              scaleX: scale,
              scaleY: scale,
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
              lockUniScaling: false,
              minScaleLimit: 0.05,
            })
            
            ;(fabricImg as any).customId = `image-stamp-${Date.now()}`
            ;(fabricImg as any).objectType = 'image-stamp'

            canvas.add(fabricImg)
            // Ensure background stays at back when adding images
            const bgObjects = canvas.getObjects().filter((obj: any) => obj.isBackgroundRect)
            bgObjects.forEach((bg) => canvas.sendObjectToBack(bg))
            canvas.bringObjectToFront(fabricImg)
            canvas.setActiveObject(fabricImg)
            canvas.renderAll()
            saveToHistoryRef.current()
            playSound('stamp')
          }).catch((err) => {
            console.error('Error loading image stamp:', imageStamp, err)
          })
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
        const tool = currentToolRef.current
        const pointer = canvas.getPointer(opt.e)
        
        // Handle stamp drawing (trail of stamps)
        if (tool === 'stamp' && isStampDrawingRef.current && lastStampPosRef.current) {
          const stamp = currentStampRef.current
          const size = stampSizeRef.current
          const minDistance = size * stampSpacing // Minimum distance between stamps
          
          const dx = pointer.x - lastStampPosRef.current.x
          const dy = pointer.y - lastStampPosRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance >= minDistance) {
            // Update last stamp position
            lastStampPosRef.current = { x: pointer.x, y: pointer.y }
            
            // Place a stamp at current position
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
                })
                
                ;(fabricImg as any).customId = `stamp-${Date.now()}`
                ;(fabricImg as any).objectType = 'stamp'

                canvas.add(fabricImg)
                canvas.bringObjectToFront(fabricImg)
                canvas.renderAll()
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
              })
              ;(text as any).customId = `stamp-${Date.now()}`
              ;(text as any).objectType = 'stamp'
              
              canvas.add(text)
              canvas.bringObjectToFront(text)
              canvas.renderAll()
            }
          }
          return
        }
        
        if (!isWackyDragging) return
        
        if (tool !== 'wacky') {
          isWackyDragging = false
          return
        }

        const effect = wackyEffectRef.current
        
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
        // End stamp drawing
        if (isStampDrawingRef.current) {
          isStampDrawingRef.current = false
          lastStampPosRef.current = null
          saveToHistoryRef.current()
        }
        
        if (isWackyDragging) {
          isWackyDragging = false
          saveToHistoryRef.current()
        }
      })

      // Use ref to always call latest saveToHistory
      canvas.on('path:created', (e) => {
        // Mark eraser strokes so we can remove them when backgrounds change
        if (currentToolRef.current === 'eraser' && e.path) {
          ;(e.path as any).isEraserStroke = true
          ;(e.path as any).objectType = 'eraser'
        }
        saveToHistoryRef.current()
      })

      canvas.on('object:added', (e) => {
        // Don't double-save for paths (handled by path:created)
        if (e.target?.type === 'path') return
        // Don't save history for default stamps (they're added automatically)
        if ((e.target as any)?.isDefaultStamp) {
          return
        }
        saveToHistoryRef.current()
      })

      canvas.on('object:modified', (e) => {
        const obj = e.target
        // Prevent background from being modified - reset it if it was changed
        if (obj && (obj as any).isBackgroundRect) {
          const canvas = fabricRef.current
          if (canvas) {
            // Reset background to locked state
            obj.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              lockScalingX: true,
              lockScalingY: true,
              lockSkewingX: true,
              lockSkewingY: true,
              hasControls: false,
              hasBorders: false,
            })
            canvas.sendObjectToBack(obj)
            canvas.renderAll()
            return // Don't save history for background modifications
          }
        }
        saveToHistoryRef.current()
      })

      canvas.on('selection:created', (e) => {
        const selected = e.selected?.[0]
        // Prevent background objects from being selected
        if (selected && (selected as any).isBackgroundRect) {
          canvas.discardActiveObject()
          canvas.renderAll()
          return
        }
        if (selected && (selected as any).customId) {
          setSelectedElementId((selected as any).customId)
        }
      })

      canvas.on('object:selected', (e) => {
        const obj = e.target
        // Prevent background objects from being selected
        if (obj && (obj as any).isBackgroundRect) {
          canvas.discardActiveObject()
          canvas.renderAll()
          return
        }
      })

      canvas.on('selection:cleared', () => {
        setSelectedElementId(null)
      })

      // Ensure background objects stay at the back whenever objects are added
      canvas.on('object:added', () => {
        ensureBackgroundLockedRef.current()
      })

      // Also ensure background stays locked after rendering
      canvas.on('after:render', () => {
        ensureBackgroundLockedRef.current()
      })


      return () => {
        resizeObserver.disconnect()
        canvas.dispose()
        fabricRef.current = null
        setIsReady(false)
      }
    }, [])

    // Set default background image and stamps on each visit (if canvas is empty)
    useEffect(() => {
      if (!isReady) return

      // Add a small delay to ensure canvas is fully initialized
      const timer = setTimeout(() => {
        const canvas = fabricRef.current
        if (!canvas) return
        
        const objects = canvas.getObjects()
        
        // Check if default background already exists
        const hasDefaultBg = objects.some((obj: any) => (obj as any).isDefaultBackground)
        if (hasDefaultBg) return

        // Only load default if canvas is completely empty
        if (objects.length === 0) {
          // Set default background image
          const defaultBgImage = '/backgrounds/lauren-default.png'
          FabricImage.fromURL(defaultBgImage, { crossOrigin: 'anonymous' }).then((img) => {
          if (!img || !canvas) return
          
          const canvasWidth = canvas.width || 800
          const canvasHeight = canvas.height || 600
          
          // Get original image dimensions (try multiple methods for reliability)
          let originalWidth = img.width || 1
          let originalHeight = img.height || 1
          
          // Fallback: try to get dimensions from the underlying HTML image element
          try {
            const imgElement = img.getElement()
            if (imgElement && (imgElement.naturalWidth || imgElement.width)) {
              originalWidth = imgElement.naturalWidth || imgElement.width || originalWidth
              originalHeight = imgElement.naturalHeight || imgElement.height || originalHeight
            }
          } catch (e) {
            // If we can't get element dimensions, use FabricImage dimensions
          }
          
          // Store original dimensions before scaling
          ;(img as any).originalWidth = originalWidth
          ;(img as any).originalHeight = originalHeight
          
          // Scale image to fit within canvas while maintaining aspect ratio (contain mode)
          const scaleX = canvasWidth / originalWidth
          const scaleY = canvasHeight / originalHeight
          const scale = Math.min(scaleX, scaleY) // Use the smaller scale to fit within canvas
          
          // Calculate centered position
          const scaledWidth = originalWidth * scale
          const scaledHeight = originalHeight * scale
          const left = (canvasWidth - scaledWidth) / 2
          const top = (canvasHeight - scaledHeight) / 2
          
          // Auto-fit to canvas while maintaining aspect ratio
          img.set({
            left: left,
            top: top,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false,
            originX: 'left',
            originY: 'top',
          })
          
          ;(img as any).isBackgroundRect = true
          ;(img as any).isDefaultBackground = true // Mark as default background
          
          canvas.backgroundColor = '#ffffff'
          canvas.add(img)
          canvas.sendObjectToBack(img)
          
          // Add 40-70 randomly scattered stamps over the background
          const numStamps = Math.floor(Math.random() * 31) + 40 // Random between 40-70
          
          // Generate list of available kidpix stamps (1-18, 21-109)
          const availableStamps: number[] = [
            ...Array.from({ length: 18 }, (_, i) => i + 1),
            ...Array.from({ length: 89 }, (_, i) => i + 21),
          ]
          
          // Randomly shuffle and select stamps
          const shuffledStamps = availableStamps.sort(() => Math.random() - 0.5)
          const selectedStamps = shuffledStamps.slice(0, numStamps)
          
          // Add stamps with some delay to avoid overwhelming the browser
          selectedStamps.forEach((stampNum, index) => {
            setTimeout(() => {
              // Check BEFORE even starting to load the image
              if (stopAddingDefaultStampsRef.current) {
                return // Don't even start loading if background was changed
              }
              
              const stampPath = `/stamps/kidpix-spritesheet-0-${stampNum}.png`
              const stampSize = 48 // Fixed size for first-time visitor stamps
              
              // Random position on canvas (with some padding from edges)
              const padding = 50
              const x = Math.random() * (canvasWidth - padding * 2) + padding
              const y = Math.random() * (canvasHeight - padding * 2) + padding
              
              FabricImage.fromURL(stampPath, { crossOrigin: 'anonymous' }).then((stampImg) => {
                // Check if we should stop adding default stamps (user changed background)
                if (stopAddingDefaultStampsRef.current) {
                  console.log('Skipping default stamp - background was changed')
                  return
                }
                
                // Use fresh canvas reference, not closure variable
                const currentCanvas = fabricRef.current
                if (!stampImg || !currentCanvas) return
                
                // Double-check flag again (might have changed during image load)
                if (stopAddingDefaultStampsRef.current) {
                  console.log('Skipping default stamp (double-check) - background was changed')
                  return
                }
                
                const scale = stampSize / Math.max(stampImg.width || 50, stampImg.height || 50)
                const rotation = (Math.random() - 0.5) * 30 // Random rotation between -15 and +15 degrees
                
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
                  lockUniScaling: false,
                  minScaleLimit: 0.1,
                })
                
                // FINAL check before adding - this is critical
                if (stopAddingDefaultStampsRef.current) {
                  console.log('Skipping default stamp (final check) - background was changed')
                  return
                }
                
                // Set custom properties directly (Fabric.js requirement for custom properties)
                ;(stampImg as any).customId = `stamp-${Date.now()}-${index}`
                ;(stampImg as any).objectType = 'stamp'
                ;(stampImg as any).isDefaultStamp = true // Mark as default stamp
                
                // Store reference for easy removal later
                defaultStampsRef.current.push(stampImg)
                
                currentCanvas.add(stampImg)
                currentCanvas.renderAll()
              }).catch((err) => {
                console.error('Error loading stamp image:', stampPath, err)
              })
            }, index * 10) // Small delay between each stamp to prevent blocking
          })
          
          canvas.renderAll()
        }).catch((err) => {
          console.error('Error loading default background image:', err)
        })
        }
      }, 200) // Small delay to ensure canvas is ready
      
      return () => clearTimeout(timer)
    }, [isReady])

    // Helper function to remove all default stamps from canvas
    const removeDefaultStamps = useCallback((canvas: Canvas) => {
      // Remove from canvas using stored references
      const stampsToRemove = [...defaultStampsRef.current]
      console.log('Removing default stamps:', stampsToRemove.length)
      
      stampsToRemove.forEach((stamp) => {
        try {
          canvas.remove(stamp)
        } catch (e) {
          // Stamp may already be removed
        }
      })
      
      // Clear the ref
      defaultStampsRef.current = []
      
      // Also scan canvas for any stamps we might have missed (belt and suspenders approach)
      const allObjects = canvas.getObjects()
      allObjects.forEach((obj: any) => {
        if (obj.isDefaultStamp === true) {
          canvas.remove(obj)
        }
      })
      
      canvas.renderAll()
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
      if (currentTool === 'move' || currentTool === 'images') {
        // Allow selection for move tool and images tool (for selecting/resizing existing elements)
        canvas.selection = true
        canvas.forEachObject((obj) => {
          if ((obj as any).isBackgroundRect) {
            // Background should NEVER be selectable or moveable - lock everything
            obj.selectable = false
            obj.evented = false
            obj.lockMovementX = true
            obj.lockMovementY = true
            obj.lockRotation = true
            obj.lockScalingX = true
            obj.lockScalingY = true
            obj.lockSkewingX = true
            obj.lockSkewingY = true
            obj.hasControls = false
            obj.hasBorders = false
            obj.hoverCursor = 'default'
            obj.moveCursor = 'default'
          } else {
            obj.selectable = true
            obj.evented = true
          }
        })
      } else if (currentTool !== 'brush' && currentTool !== 'eraser') {
        // Disable selection for other tools so clicks place new elements
        canvas.selection = false
        canvas.forEachObject((obj) => {
          if ((obj as any).isBackgroundRect) {
            // Keep background locked even when selection is disabled
            obj.selectable = false
            obj.evented = false
            obj.lockMovementX = true
            obj.lockMovementY = true
          } else {
            obj.selectable = false
            obj.evented = false
          }
        })
      }
      
      // Always ensure background is locked (extra safety)
      canvas.forEachObject((obj) => {
        if ((obj as any).isBackgroundRect) {
          obj.selectable = false
          obj.evented = false
          obj.lockMovementX = true
          obj.lockMovementY = true
          obj.lockRotation = true
          obj.lockScalingX = true
          obj.lockScalingY = true
          obj.lockSkewingX = true
          obj.lockSkewingY = true
          obj.hasControls = false
          obj.hasBorders = false
          obj.hoverCursor = 'default'
          obj.moveCursor = 'default'
        }
      })
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

      window.addEventListener('imageUpload', handleImageUpload as unknown as EventListener)
      return () => window.removeEventListener('imageUpload', handleImageUpload as unknown as EventListener)
    }, [])

    // Handle Delete/Backspace key to remove selected objects
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle Delete/Backspace if not typing in an input
        if ((e.key === 'Delete' || e.key === 'Backspace') && 
            document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          const canvas = fabricRef.current
          if (!canvas) return

          const activeObject = canvas.getActiveObject()
          const activeObjects = canvas.getActiveObjects()

          if (activeObject || activeObjects.length > 0) {
            // Don't delete background objects
            const objectsToDelete = activeObjects.length > 0 
              ? activeObjects.filter((obj: any) => !obj.isBackgroundRect)
              : activeObject && !(activeObject as any).isBackgroundRect 
                ? [activeObject] 
                : []

            if (objectsToDelete.length > 0) {
              objectsToDelete.forEach((obj: any) => {
                canvas.remove(obj)
              })
              canvas.discardActiveObject()
              canvas.renderAll()
              saveToHistoryRef.current()
              playSound('click')
            }
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

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
          // Ensure background stays at back
          const bgObjects = canvas.getObjects().filter((obj: any) => obj.isBackgroundRect)
          bgObjects.forEach((bg) => canvas.sendObjectToBack(bg))
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

      // Stop adding any more default stamps
      stopAddingDefaultStampsRef.current = true

      // On FIRST background change, clear everything like "New Design" button
      if (isFirstBackgroundChangeRef.current) {
        console.log('First background change (fill) - using clearCanvasCompletely')
        isFirstBackgroundChangeRef.current = false
        
        // Use the exact same clear function as "New Design" button
        clearCanvasCompletely()
        
        // Schedule repeated cleanups
        const cleanup = () => {
          const c = fabricRef.current
          if (!c) return
          c.getObjects().filter((obj: any) => obj.isDefaultStamp || obj.objectType === 'stamp')
            .forEach((obj: any) => c.remove(obj))
          c.renderAll()
        }
        setTimeout(cleanup, 100)
        setTimeout(cleanup, 500)
        setTimeout(cleanup, 1000)
        setTimeout(cleanup, 2000)
      } else {
        // Subsequent changes - just remove background objects
        canvas.getObjects().filter((obj: any) => obj.isBackgroundRect).forEach((obj: any) => canvas.remove(obj))
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
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false,
            hasBorders: false,
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
      // Solid colors
      { id: 'white', value: '#ffffff', label: 'White', type: 'color' as const },
      { id: 'cream', value: '#f5f5dc', label: 'Cream', type: 'color' as const },
      { id: 'lavender', value: '#e6e6fa', label: 'Lavender', type: 'color' as const },
      { id: 'mint', value: '#f0fff0', label: 'Mint', type: 'color' as const },
      { id: 'blush', value: '#fff0f5', label: 'Blush', type: 'color' as const },
      { id: 'peach', value: '#ffecd2', label: 'Peach', type: 'color' as const },
      { id: 'sky', value: '#e0f7ff', label: 'Sky', type: 'color' as const },
      { id: 'rose', value: '#ffe4ec', label: 'Rose', type: 'color' as const },
      // Image backgrounds
      { id: 'chromatic', value: '/backgrounds/chromatic.png', label: 'Chromatic', type: 'image' as const },
      { id: 'pink-aquarium', value: '/backgrounds/pink-aquarium.png', label: 'Pink Aquarium', type: 'image' as const },
      { id: 'sunset-orange', value: '/backgrounds/sunset-orange.png', label: 'Sunset Orange', type: 'image' as const },
      { id: 'ethereal-blue', value: '/backgrounds/ethereal-blue.png', label: 'Ethereal Blue', type: 'image' as const },
      { id: 'blue-stars', value: '/backgrounds/blue-stars.jpg', label: 'Blue Stars', type: 'image' as const },
      { id: 'tropical-beach', value: '/backgrounds/tropical-beach.jpg', label: 'Tropical Beach', type: 'image' as const },
      { id: 'tropical', value: '/backgrounds/tropical.jpg', label: 'Tropical', type: 'image' as const },
      { id: 'pink-bubbles', value: '/backgrounds/pink-bubbles.jpg', label: 'Pink Bubbles', type: 'image' as const },
      { id: 'party', value: '/backgrounds/Party.png', label: 'Party', type: 'image' as const },
      { id: 'rainbow', value: '/backgrounds/rainbow.png', label: 'Rainbow', type: 'image' as const },
      { id: 'salon', value: '/backgrounds/Salon.png', label: 'Salon', type: 'image' as const },
      { id: 'twilight', value: '/backgrounds/Twilight.png', label: 'Twilight', type: 'image' as const },
      { id: 'aquarium', value: '/backgrounds/Aquarium.png', label: 'Aquarium', type: 'image' as const },
      { id: 'castle', value: '/backgrounds/castle.png', label: 'Castle', type: 'image' as const },
      { id: 'living-room', value: '/backgrounds/Living-Room.png', label: 'Living Room', type: 'image' as const },
      { id: 'cake-maker', value: '/backgrounds/Cake-Maker.png', label: 'Cake Maker', type: 'image' as const },
      { id: 'barbie', value: '/backgrounds/barbie.png', label: 'Barbie', type: 'image' as const },
      { id: 'checkered', value: '/backgrounds/Checkered.png', label: 'Checkered', type: 'image' as const },
      { id: 'glam', value: '/backgrounds/Glam.png', label: 'Glam', type: 'image' as const },
      { id: 'hello-kitty-story', value: '/backgrounds/PC-_-Computer---Hello-Kitty-Big-Fun-Deluxe---Activities---Big-Fun-Storymaking-(Mode-Select)-1.png', label: 'Hello Kitty', type: 'image' as const },
      { id: 'hello-kitty-elements', value: '/backgrounds/PC-_-Computer---Hello-Kitty-Big-Fun-Deluxe---Miscellaneous---Shared-Elements-1.png', label: 'HK Elements', type: 'image' as const },
      { id: 'pick-heart', value: '/backgrounds/Pick-Heart.png', label: 'Pick Heart', type: 'image' as const },
      { id: 'pink-heart-clouds', value: '/backgrounds/Pink-Heart-Clouds.png', label: 'Heart Clouds', type: 'image' as const },
      { id: 'purple', value: '/backgrounds/Purple.png', label: 'Purple', type: 'image' as const },
      { id: 'rainbow-cloud', value: '/backgrounds/Rainbow-Cloud.png', label: 'Rainbow Cloud', type: 'image' as const },
      { id: 'rosey-wallpaper', value: '/backgrounds/Rosey-Wallpaper.png', label: 'Rosey', type: 'image' as const },
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
      if (bg.type === 'image') {
        setImageBackground(bg.value)
      } else {
        fillCanvas(bg.value, 'solid')
      }
      setShowBackgroundPicker(false)
      playSound('click')
    }
    
    const setImageBackground = useCallback((imageUrl: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      
      // Stop adding any more default stamps
      stopAddingDefaultStampsRef.current = true
      
      // On FIRST background change, clear everything like "New Design" button
      if (isFirstBackgroundChangeRef.current) {
        console.log('First background change (image) - using clearCanvasCompletely')
        isFirstBackgroundChangeRef.current = false
        
        // Use the exact same clear function as "New Design" button
        clearCanvasCompletely()
        
        // Schedule repeated cleanups to catch any async stamps that slip through
        const cleanup = () => {
          const c = fabricRef.current
          if (!c) return
          c.getObjects().filter((obj: any) => obj.isDefaultStamp || obj.objectType === 'stamp')
            .forEach((obj: any) => c.remove(obj))
          c.renderAll()
        }
        setTimeout(cleanup, 100)
        setTimeout(cleanup, 500)
        setTimeout(cleanup, 1000)
        setTimeout(cleanup, 2000)
      } else {
        // Subsequent changes - just remove background objects
        canvas.getObjects().filter((obj: any) => obj.isBackgroundRect).forEach((obj: any) => canvas.remove(obj))
      }
      
      // Load the image and set it as background
      FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
        // Get fresh canvas reference in case it changed
        const currentCanvas = fabricRef.current
        if (!img || !currentCanvas) return
        
        // Double-check and remove any remaining default stamps (stamps may have loaded async)
        const cleanupStamps = () => {
          const canvasNow = fabricRef.current
          if (!canvasNow) return
          
          // Clear ref first
          defaultStampsRef.current.forEach((stamp) => {
            try { canvasNow.remove(stamp) } catch (e) { /* ignore */ }
          })
          defaultStampsRef.current = []
          
          // Also remove any marked stamps
          const remainingObjects = canvasNow.getObjects()
          remainingObjects.forEach((obj: any) => {
            if (obj.isDefaultStamp === true) {
              canvasNow.remove(obj)
            }
          })
          canvasNow.renderAll()
        }
        
        // Clean up now
        cleanupStamps()
        
        // And clean up again after a delay to catch late-loading stamps
        setTimeout(cleanupStamps, 500)
        setTimeout(cleanupStamps, 1000)
        
        const canvasWidth = currentCanvas.width || 800
        const canvasHeight = currentCanvas.height || 600
        
        // Scale image to cover entire canvas (cover mode)
        const scaleX = canvasWidth / (img.width || 1)
        const scaleY = canvasHeight / (img.height || 1)
        const scale = Math.max(scaleX, scaleY)
        
        // Center the image on canvas
        const scaledWidth = (img.width || 1) * scale
        const scaledHeight = (img.height || 1) * scale
        const left = (canvasWidth - scaledWidth) / 2
        const top = (canvasHeight - scaledHeight) / 2
        
        img.set({
          left: left,
          top: top,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          lockSkewingX: true,
          lockSkewingY: true,
          hasControls: false,
          hasBorders: false,
          hasRotatingPoint: false,
          excludeFromExport: false,
          originX: 'left',
          originY: 'top',
          // Make it completely non-interactive
          hoverCursor: 'default',
          moveCursor: 'default',
        })
        
        ;(img as any).isBackgroundRect = true
        ;(img as any).excludeFromExport = false
        
        currentCanvas.backgroundColor = '#ffffff'
        currentCanvas.add(img)
        currentCanvas.sendObjectToBack(img)
        
        // Immediately lock it again after adding
        ensureBackgroundLockedRef.current()
        
        currentCanvas.renderAll()
        saveToHistoryRef.current()
      }).catch((err) => {
        console.error('Error loading background image:', imageUrl, err)
      })
    }, [])

    const currentBg = backgrounds.find(bg => bg.value === currentBackground) || backgrounds[0]

    return (
      <MacWindow className="flex-1 relative overflow-hidden h-full rounded-lg sm:rounded-xl">
        <div 
          ref={containerRef} 
          className="relative w-full h-full"
          style={{
            // Ensure proper touch handling
            WebkitUserSelect: 'none',
            userSelect: 'none',
            WebkitTouchCallout: 'none',
          }}
        >
        <canvas
          ref={canvasElRef}
          onClick={handleCanvasClick}
          className="w-full h-full touch-none"
          style={{ 
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            cursor: currentTool === 'stamp' && stampCursorUrl
              ? `url(${stampCursorUrl}) 16 16, crosshair`
              : currentTool === 'stamp' || currentTool === 'images'
                ? 'crosshair' 
                : currentTool === 'brush' || currentTool === 'eraser'
                  ? 'crosshair'
                  : currentTool === 'fill'
                    ? 'crosshair'
                    : 'default'
          }}
        />
        
        {/* Clear Canvas button - shown on default load screen */}
        {showStartFreshButton && isReady && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2" style={{ zIndex: 10 }}>
            <button
              onClick={() => {
                clearCanvasCompletely()
                setShowStartFreshButton(false)
                isFirstBackgroundChangeRef.current = false
                playSound('click')
              }}
              className="pixel-text"
              style={{
                ...macStyles.button,
                padding: '8px 18px',
                fontSize: '11px',
                animation: 'pulse-glow 1.2s ease-in-out infinite',
              }}
            >
              ✨ Clear Canvas
            </button>
            <style jsx>{`
              @keyframes pulse-glow {
                0%, 100% {
                  box-shadow: inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585, 0 0 8px rgba(255, 105, 180, 0.4);
                  transform: scale(1);
                }
                50% {
                  box-shadow: inset -2px -2px 0 0 #c71585, inset 2px 2px 0 0 #ffffff, 2px 2px 0 0 #c71585, 0 0 25px rgba(255, 105, 180, 0.9);
                  transform: scale(1.08);
                }
              }
              button {
                transition: all 0.2s ease;
              }
              button:hover {
                background: linear-gradient(180deg, #ffffff 0%, #ffb6d9 50%, #ff69b4 100%);
              }
              button:active {
                transform: scale(0.98);
              }
            `}</style>
          </div>
        )}
        </div>
      </MacWindow>
    )
  },
)

CanvasArea.displayName = 'CanvasArea'

export default CanvasArea
