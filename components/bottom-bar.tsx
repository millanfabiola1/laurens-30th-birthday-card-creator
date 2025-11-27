"use client"

import type React from "react"
import { useState } from "react"
import Countdown from "./countdown"
import { playSound } from "@/lib/sound-manager"
import { MacWindow, MacButton } from "./mac-ui"
import type { FabricCanvasRef } from "./canvas-area"

interface BottomBarProps {
  canvasRef: React.RefObject<FabricCanvasRef | null>
}

export default function BottomBar({ canvasRef }: BottomBarProps) {
  const [isExporting, setIsExporting] = useState(false)

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

  const handleRandomChaos = () => {
    playSound("chaos")

    const confettiCount = 40
    const confettiColors = ["#ff1493", "#a855f7", "#00e5ff", "#ffd700", "#7fff00", "#ff6ec7", "#ff69b4"]
    const confettiShapes = ["*", "+", "o", "x"]

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div")
        confetti.className = "confetti"
        confetti.textContent = confettiShapes[Math.floor(Math.random() * confettiShapes.length)]
        confetti.style.left = Math.random() * 100 + "%"
        confetti.style.fontSize = Math.random() * 20 + 14 + "px"
        confetti.style.color = confettiColors[Math.floor(Math.random() * confettiColors.length)]
        document.body.appendChild(confetti)

        setTimeout(() => confetti.remove(), 2000)
      }, i * 30)
    }
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

  return (
    <MacWindow className="m-2 p-2 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex gap-2 flex-wrap justify-center">
        <MacButton onClick={handleNewCard}>New</MacButton>
        <MacButton secondary onClick={handleRandomChaos}>
          Chaos!
        </MacButton>
        <MacButton primary onClick={handleSaveScreenshot} disabled={isExporting}>
          {isExporting ? "Saving..." : "Save"}
        </MacButton>
      </div>
      <Countdown targetDate="2025-12-21" timezone="America/Denver" />
    </MacWindow>
  )
}
