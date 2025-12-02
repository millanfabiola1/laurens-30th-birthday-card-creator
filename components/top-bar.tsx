"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MacWindow, MacButton, macStyles } from "./mac-ui"
import { playSound } from "@/lib/sound-manager"
import Countdown from "./countdown"
import type { FabricCanvasRef } from "./canvas-area"
import { FabricImage, IText } from "fabric"

interface TopBarProps {
  onHelpClick?: () => void
  canvasRef: React.RefObject<FabricCanvasRef | null>
}

// Design templates for aesthetically pleasing layouts
const designTemplates = [
  { name: "corner-decorations", textPosition: "center" },
  { name: "frame-style", textPosition: "center" },
  { name: "scattered-fun", textPosition: "top" },
  { name: "elegant-minimal", textPosition: "bottom" },
  { name: "party-explosion", textPosition: "center" },
]

// Backgrounds with their complementary text colors for good contrast
const backgroundsWithColors = [
  { url: "/backgrounds/Party.png", textColors: ["#ffffff", "#ffd700", "#00ffff"] },
  { url: "/backgrounds/Pink-Heart-Clouds.png", textColors: ["#4a0080", "#ff1493", "#ffffff"] },
  { url: "/backgrounds/Rainbow-Cloud.png", textColors: ["#ff1493", "#4a0080", "#ffffff"] },
  { url: "/backgrounds/Glam.png", textColors: ["#ffd700", "#ffffff", "#00ffff"] },
  { url: "/backgrounds/Purple.png", textColors: ["#ffd700", "#ffffff", "#ff69b4"] },
  { url: "/backgrounds/Rosey-Wallpaper.png", textColors: ["#4a0080", "#c71585", "#ffffff"] },
  { url: "/backgrounds/rainbow.png", textColors: ["#ffffff", "#ff1493", "#4a0080"] },
  { url: "/backgrounds/barbie.png", textColors: ["#ffffff", "#ffd700", "#ff69b4"] },
]

const balloons = [
  "/images/decorations/balloons.png",
  "/images/decorations/balloons-2.png",
  "/images/decorations/balloons-3.png",
  "/images/decorations/balloons-4.png",
  "/images/decorations/balloons-5.png",
  "/images/decorations/balloons-6.png",
  "/images/decorations/balloons-7.png",
  "/images/decorations/balloons-8.png",
  "/images/decorations/balloons-9.png",
  "/images/decorations/balloons-10.png",
  "/images/decorations/balloons-11.png",
  "/images/decorations/balloons-12.png",
  "/images/decorations/balloons-13.png",
  "/images/decorations/blue-balloon.png",
  "/images/decorations/flower-balloon.png",
]

const decorations = [
  "/images/decorations/party-hat.png",
  "/images/decorations/present.png",
  "/images/decorations/candle.png",
  "/images/decorations/airhorn.png",
  "/images/decorations/bday-cake.png",
]

const characters = [
  "/images/characters/hello-kitty.png",
  "/images/characters/my-melody.png",
  "/images/characters/barbie-1.png",
  "/images/characters/barbie-2.png",
  "/images/characters/barbie-3.png",
  "/images/characters/barbie-4.png",
  "/images/characters/barbie-5.png",
  "/images/characters/barbie-6.png",
  "/images/characters/barbie-7.png",
  "/images/characters/shortcake1.png",
  "/images/characters/shortcake2.png",
  "/images/characters/strawberry-shortcake.png",
  "/images/characters/grimace.png",
  "/images/characters/spongebob.png",
  "/images/characters/patrick.png",
  "/images/characters/shrek.png",
  "/images/characters/fiona.png",
  "/images/characters/donkey.png",
  "/images/characters/puss.png",
  "/images/characters/gummybear.png",
]

const cakes = [
  "/images/cake-food/cake.png",
  "/images/cake-food/cake01.png",
  "/images/cake-food/cake02.png",
  "/images/cake-food/cupcake.png",
  "/images/cake-food/brat-cake.png",
  "/images/cake-food/chocolate-cake.png",
  "/images/cake-food/flan.png",
  "/images/cake-food/pancake.png",
]

const stamps = [
  "/stamps/kidpix-spritesheet-0-1.png",
  "/stamps/kidpix-spritesheet-0-2.png",
  "/stamps/kidpix-spritesheet-0-3.png",
  "/stamps/kidpix-spritesheet-0-4.png",
  "/stamps/kidpix-spritesheet-0-5.png",
  "/stamps/kidpix-spritesheet-0-6.png",
  "/stamps/kidpix-spritesheet-0-7.png",
  "/stamps/kidpix-spritesheet-0-8.png",
  "/stamps/kidpix-spritesheet-0-9.png",
  "/stamps/kidpix-spritesheet-0-10.png",
  "/stamps/kidpix-spritesheet-0-11.png",
  "/stamps/kidpix-spritesheet-0-12.png",
  "/stamps/kidpix-spritesheet-0-13.png",
  "/stamps/kidpix-spritesheet-0-14.png",
  "/stamps/kidpix-spritesheet-0-15.png",
  "/stamps/kidpix-spritesheet-0-21.png",
  "/stamps/kidpix-spritesheet-0-22.png",
  "/stamps/kidpix-spritesheet-0-23.png",
  "/stamps/kidpix-spritesheet-0-24.png",
  "/stamps/kidpix-spritesheet-0-25.png",
  "/stamps/kidpix-spritesheet-0-30.png",
  "/stamps/kidpix-spritesheet-0-31.png",
  "/stamps/kidpix-spritesheet-0-32.png",
  "/stamps/kidpix-spritesheet-0-40.png",
  "/stamps/kidpix-spritesheet-0-50.png",
  "/stamps/kidpix-spritesheet-0-60.png",
  "/stamps/kidpix-spritesheet-0-70.png",
  "/stamps/kidpix-spritesheet-0-80.png",
  "/stamps/kidpix-spritesheet-0-90.png",
  "/stamps/kidpix-spritesheet-0-100.png",
]

const birthdayTexts = [
  "Happy 30th Lauren!",
  "Happy Birthday Lauren!",
  "Dirty 30!",
  "30 & Fabulous!",
  "Cheers to 30!",
  "Lauren turns 30!",
]

const fonts = [
  "DynaPuff, cursive",
  "Doto, sans-serif",
  "Imperial Script, cursive",
]

export default function TopBar({ onHelpClick, canvasRef }: TopBarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Setup background music with random start position
  useEffect(() => {
    const audio = new Audio('/lauren-mix.mp3')
    audio.loop = false // We'll handle looping manually to restart from random position
    audio.volume = 0.2 // Low chill volume (20%)
    audio.preload = 'auto'
    audioRef.current = audio

    let hasStarted = false
    let randomStartSet = false
    
    // Try to play immediately (may be blocked by browser autoplay policy)
    const tryImmediatePlay = async () => {
      try {
        await audio.play()
        hasStarted = true
      } catch (err) {
        // Browser blocked autoplay - will retry on user interaction
      }
    }
    tryImmediatePlay()

    // Function to set random start position
    const setRandomStart = () => {
      if (audio.duration) {
        const randomStart = Math.random() * audio.duration * 0.9
        audio.currentTime = randomStart
        randomStartSet = true
        return randomStart
      }
      return 0
    }

    // Error handling
    const handleError = (e: Event) => {
      const error = e.target as HTMLAudioElement
      console.error('Audio loading error:', {
        error: error.error,
        code: error.error?.code,
        message: error.error?.message,
        networkState: error.networkState,
        readyState: error.readyState,
        src: error.src
      })
    }

    // Set random start position when metadata is loaded
    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded, duration:', audio.duration)
      if (audio.duration && !randomStartSet) {
        setRandomStart()
      }
      // Try to play immediately when metadata is ready
      if (!hasStarted && !isMuted && audio.duration) {
        audio.play().then(() => {
          hasStarted = true
        }).catch(() => {
          // Will retry on user interaction
        })
      }
    }

    // Try to play when ready
    const handleCanPlay = () => {
      console.log('Audio can play, duration:', audio.duration)
      if (!hasStarted && !isMuted && audio.duration) {
        if (!randomStartSet) {
          setRandomStart()
        }
        // Try autoplay with multiple strategies
        const tryPlay = async () => {
          try {
            await audio.play()
            hasStarted = true
          } catch (err) {
            console.log('Audio autoplay prevented, trying workaround:', err)
            // Workaround: try to play after a small delay or on any user interaction
            const playOnInteraction = () => {
              audio.play().catch(() => {})
              hasStarted = true
              document.removeEventListener('click', playOnInteraction, true)
              document.removeEventListener('touchstart', playOnInteraction, true)
              document.removeEventListener('keydown', playOnInteraction, true)
            }
            document.addEventListener('click', playOnInteraction, { once: true, capture: true })
            document.addEventListener('touchstart', playOnInteraction, { once: true, capture: true })
            document.addEventListener('keydown', playOnInteraction, { once: true, capture: true })
          }
        }
        tryPlay()
      }
    }

    // Also try to play immediately when metadata loads
    audio.addEventListener('loadedmetadata', () => {
      if (!hasStarted && !isMuted && audio.duration) {
        if (!randomStartSet) {
          setRandomStart()
        }
        audio.play().catch(() => {
          // Will try again on user interaction
        })
      }
    })

    // Handle when track ends - restart from random position
    const handleEnded = () => {
      if (audio.duration) {
        setRandomStart()
        audio.play().catch(console.error)
      }
    }

    audio.addEventListener('error', handleError)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('ended', handleEnded)

    // Load the audio
    audio.load()

    return () => {
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
      // If unmuting and audio hasn't started, try to play
      if (!isMuted && audioRef.current.paused && audioRef.current.duration) {
        if (audioRef.current.currentTime === 0) {
          // Set random start if not already set
          const randomStart = Math.random() * audioRef.current.duration * 0.9
          audioRef.current.currentTime = randomStart
        }
        audioRef.current.play().catch(console.error)
      }
    }
  }, [isMuted])

  // Play audio on first user interaction (required by browsers)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused && !isMuted) {
        if (audioRef.current.duration) {
          if (audioRef.current.currentTime === 0) {
            // Set random start position on first play
            const randomStart = Math.random() * audioRef.current.duration * 0.9
            audioRef.current.currentTime = randomStart
          }
          audioRef.current.play().catch(console.error)
        }
      }
    }

    // Try multiple event types to catch user interaction
    const events = ['click', 'touchstart', 'keydown', 'mousedown']
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }
  }, [isMuted])

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    playSound("click")
  }

  const handleHelpClick = () => {
    playSound("click")
    onHelpClick?.()
  }

  const handleNewCard = () => {
    if (confirm("Start a fresh new sparkly card?")) {
      const fabricCanvas = canvasRef.current
      if (fabricCanvas) {
        fabricCanvas.clear()
      }
      playSound("click")
    }
  }

  const handleSaveScreenshot = async () => {
    const fabricCanvas = canvasRef.current
    if (!fabricCanvas) return

    setIsExporting(true)
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
    } finally {
      setIsExporting(false)
    }
  }

  const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  
  const pickUnique = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, arr.length))
  }
  
  const handleRandomDesign = async () => {
    const fabricCanvas = canvasRef.current?.canvas
    if (!fabricCanvas) return

    setIsGenerating(true)
    playSound("wacky")

    fabricCanvas.clear()
    fabricCanvas.backgroundColor = "#ffffff"

    const canvasWidth = fabricCanvas.width || 800
    const canvasHeight = fabricCanvas.height || 600

    // Calculate scale factor for mobile/tablet - base sizes are for 800x600 canvas
    const baseCanvasWidth = 800
    const baseCanvasHeight = 600
    const isMobileOrTablet = canvasWidth < 1024
    const scaleFactor = isMobileOrTablet 
      ? Math.min(canvasWidth / baseCanvasWidth, canvasHeight / baseCanvasHeight)
      : 1
    
    // Maximum image size as percentage of canvas (smaller on mobile)
    const maxImageSizePercent = isMobileOrTablet ? 0.4 : 0.6
    const maxImageSize = Math.min(canvasWidth, canvasHeight) * maxImageSizePercent

    try {
      const bgChoice = randomPick(backgroundsWithColors)
      const bgUrl = bgChoice.url
      const complementaryTextColors = bgChoice.textColors
      
      const bgImg = await FabricImage.fromURL(bgUrl, { crossOrigin: 'anonymous' })
      const scaleX = canvasWidth / (bgImg.width || 1)
      const scaleY = canvasHeight / (bgImg.height || 1)
      const scale = Math.max(scaleX, scaleY)
      bgImg.set({
        left: 0,
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      })
      ;(bgImg as any).isBackgroundRect = true
      fabricCanvas.add(bgImg)
      fabricCanvas.sendObjectToBack(bgImg)

      const template = randomPick(designTemplates)
      
      const uniqueCharacters = pickUnique(characters, 4)
      let characterIndex = 0
      const getNextCharacter = () => uniqueCharacters[characterIndex++ % uniqueCharacters.length]

      const addImage = async (url: string, x: number, y: number, size: number, angle = 0) => {
        try {
          // Scale the size based on canvas dimensions and limit maximum
          const scaledSize = Math.min(size * scaleFactor, maxImageSize)
          const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
          const imgScale = scaledSize / Math.max(img.width || 100, img.height || 100)
          img.set({
            left: x,
            top: y,
            scaleX: imgScale,
            scaleY: imgScale,
            angle: angle,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#ff1493',
            cornerStyle: 'circle',
            cornerSize: Math.max(8, 12 * scaleFactor), // Scale corner size too
            borderColor: '#ff1493',
          })
          fabricCanvas.add(img)
          return img
        } catch (e) {
          console.error('Failed to load image:', url)
          return null
        }
      }
      
      const addBalloon = async (x: number, y: number, angle = 0) => {
        const baseSize = 100 + Math.random() * 100
        const size = Math.min(baseSize * scaleFactor, maxImageSize)
        await addImage(randomPick(balloons), x, y, size, angle)
      }

      const balloonCount = 10
      const balloonPositions = [
        { x: 0.1, y: 0.2 }, { x: 0.9, y: 0.15 }, { x: 0.15, y: 0.6 },
        { x: 0.85, y: 0.55 }, { x: 0.05, y: 0.85 }, { x: 0.95, y: 0.8 },
        { x: 0.3, y: 0.1 }, { x: 0.7, y: 0.08 }, { x: 0.5, y: 0.9 },
        { x: 0.2, y: 0.45 }, { x: 0.8, y: 0.4 },
      ]
      for (let i = 0; i < balloonCount; i++) {
        const pos = balloonPositions[i % balloonPositions.length]
        const jitterX = (Math.random() - 0.5) * 0.1
        const jitterY = (Math.random() - 0.5) * 0.1
        await addBalloon(
          canvasWidth * (pos.x + jitterX),
          canvasHeight * (pos.y + jitterY),
          Math.random() * 30 - 15
        )
      }

      if (template.name === "corner-decorations") {
        await addImage(randomPick(decorations), canvasWidth * 0.12, canvasHeight * 0.12, 70, -15)
        await addImage(randomPick(decorations), canvasWidth * 0.88, canvasHeight * 0.12, 70, 15)
        await addImage(getNextCharacter(), canvasWidth * 0.15, canvasHeight * 0.55, 120)
        await addImage(getNextCharacter(), canvasWidth * 0.85, canvasHeight * 0.55, 120)
      } else if (template.name === "frame-style") {
        await addImage(randomPick(decorations), canvasWidth * 0.15, canvasHeight * 0.08, 60, -10)
        await addImage(randomPick(decorations), canvasWidth * 0.85, canvasHeight * 0.08, 60, 10)
        await addImage(getNextCharacter(), canvasWidth * 0.12, canvasHeight * 0.5, 110)
        await addImage(getNextCharacter(), canvasWidth * 0.88, canvasHeight * 0.5, 110)
      } else if (template.name === "scattered-fun") {
        await addImage(getNextCharacter(), canvasWidth * 0.15, canvasHeight * 0.45, 100)
        await addImage(getNextCharacter(), canvasWidth * 0.85, canvasHeight * 0.5, 100)
        await addImage(getNextCharacter(), canvasWidth * 0.2, canvasHeight * 0.8, 90)
        await addImage(randomPick(decorations), canvasWidth * 0.1, canvasHeight * 0.15, 60)
        await addImage(randomPick(decorations), canvasWidth * 0.9, canvasHeight * 0.15, 60)
      } else if (template.name === "elegant-minimal") {
        await addImage(getNextCharacter(), canvasWidth * 0.15, canvasHeight * 0.5, 130)
        await addImage(getNextCharacter(), canvasWidth * 0.85, canvasHeight * 0.5, 130)
        await addImage(randomPick(decorations), canvasWidth * 0.1, canvasHeight * 0.1, 50, -10)
        await addImage(randomPick(decorations), canvasWidth * 0.9, canvasHeight * 0.1, 50, 10)
      } else if (template.name === "party-explosion") {
        await addImage(getNextCharacter(), canvasWidth * 0.12, canvasHeight * 0.4, 100)
        await addImage(getNextCharacter(), canvasWidth * 0.88, canvasHeight * 0.4, 100)
        await addImage(getNextCharacter(), canvasWidth * 0.2, canvasHeight * 0.75, 90)
        await addImage(getNextCharacter(), canvasWidth * 0.8, canvasHeight * 0.75, 90)
        await addImage(randomPick(decorations), canvasWidth * 0.1, canvasHeight * 0.1, 55, -15)
        await addImage(randomPick(decorations), canvasWidth * 0.9, canvasHeight * 0.1, 55, 15)
      }

      const stampCount = 8 + Math.floor(Math.random() * 3)
      const usedStamps = pickUnique(stamps, stampCount)
      for (let i = 0; i < stampCount; i++) {
        const x = 0.1 + Math.random() * 0.8
        const y = 0.1 + Math.random() * 0.75
        await addImage(usedStamps[i], canvasWidth * x, canvasHeight * y, 64, Math.random() * 40 - 20)
      }

      const foodY = canvasHeight * 0.62
      // Scale cake size - it's the largest element, so ensure it fits
      const cakeSize = Math.min(500 * scaleFactor, maxImageSize * 1.2) // Allow cake to be slightly larger
      await addImage(randomPick(cakes), canvasWidth * 0.5, foodY, cakeSize)

      const text = randomPick(birthdayTexts)
      const font = randomPick(fonts)
      const textColor = randomPick(complementaryTextColors)
      
      // Scale text position and size for mobile
      const textY = foodY - (280 * scaleFactor)
      const fontSize = Math.max(32, 72 * scaleFactor) // Minimum 32px for readability

      const itext = new IText(text, {
        left: canvasWidth / 2,
        top: textY,
        fontSize: fontSize,
        fontFamily: font,
        fill: textColor,
        textAlign: 'center',
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
        shadow: 'rgba(0,0,0,0.4) 2px 2px 4px',
        stroke: textColor === '#ffffff' ? '#ff1493' : undefined,
        strokeWidth: textColor === '#ffffff' ? 1 : 0,
      })
      fabricCanvas.add(itext)
      fabricCanvas.bringObjectToFront(itext)

      fabricCanvas.renderAll()
      playSound("stamp")

    } catch (error) {
      console.error("Error generating design:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <MacWindow className="mx-1 sm:mx-2 mt-1 sm:mt-2">
      <div style={macStyles.titleBar}>
        <div className="flex gap-0.5 sm:gap-1">
          <div style={{ ...macStyles.closeButton, backgroundColor: "#ff6b6b" }} title="Close" />
          <div style={{ ...macStyles.closeButton, backgroundColor: "#ffd93d" }} title="Minimize" />
          <div style={{ ...macStyles.closeButton, backgroundColor: "#6bcb77" }} title="Maximize" />
        </div>
        <div style={macStyles.titleBarStripes} className="hidden md:block" />
        <h1 className="text-[10px] sm:text-xs md:text-sm font-bold text-center flex-1 pixel-text truncate px-1 sm:px-2 text-white drop-shadow-[1px_1px_0_#c71585]">
          ✨ Lauren&apos;s 30th Birthday Card Creator ✨
        </h1>
        <div style={macStyles.titleBarStripes} className="hidden md:block" />
        <div
          className="flex items-center justify-center text-[10px] sm:text-xs font-bold pixel-text"
          style={{
            width: "22px",
            height: "22px",
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
        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold border-b-2 border-primary flex items-center justify-between gap-1 sm:gap-2"
        style={{ background: "linear-gradient(90deg, #fff0f7 0%, #e0b0ff 50%, #b0e0ff 100%)" }}
      >
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <MacButton accent onClick={handleNewCard} style={{ padding: "4px 8px", fontSize: "10px" }} className="sm:!p-[6px_14px] sm:!text-xs">
            <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>✨</span> New
          </MacButton>
          <MacButton secondary onClick={handleRandomDesign} disabled={isGenerating} style={{ padding: "4px 8px", fontSize: "10px" }} className="sm:!p-[6px_14px] sm:!text-xs">
            {isGenerating ? "✨..." : "🔀 Random Design"}
          </MacButton>
          <MacButton primary onClick={handleSaveScreenshot} disabled={isExporting} style={{ padding: "4px 8px", fontSize: "10px" }} className="sm:!p-[6px_14px] sm:!text-xs">
            {isExporting ? "💾..." : "💾 Save"}
          </MacButton>
          <MacButton onClick={handleHelpClick} style={{ padding: "4px 8px", fontSize: "10px" }} className="sm:!p-[6px_14px] sm:!text-xs">💕 Help</MacButton>
          <MacButton 
            onClick={handleMuteToggle} 
            style={{ 
              padding: "4px 8px", 
              fontSize: "10px",
              opacity: isMuted ? 0.6 : 1
            }} 
            className="sm:!p-[6px_14px] sm:!text-xs"
            title={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? "🔇" : "🔊"}
          </MacButton>
        </div>
        <div className="hidden sm:block">
          <Countdown targetDate="2025-12-21" timezone="America/Denver" />
        </div>
      </div>
    </MacWindow>
  )
}
