"use client"

import { useMemo } from "react"

interface PixelEmojiProps {
  emoji: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

/**
 * Renders an emoji with an 8-bit pixelated look
 * Uses canvas to re-render the emoji at low resolution then scale up
 */
export function PixelEmoji({ emoji, size = "md", className = "" }: PixelEmojiProps) {
  const sizeConfig = {
    sm: { container: 20, render: 8, scale: 2.5 },
    md: { container: 28, render: 10, scale: 2.8 },
    lg: { container: 36, render: 12, scale: 3 },
    xl: { container: 48, render: 14, scale: 3.4 },
  }

  const config = sizeConfig[size]

  const pixelatedDataUrl = useMemo(() => {
    if (typeof window === "undefined") return null

    // Create a small canvas to render emoji at low res
    const canvas = document.createElement("canvas")
    const pixelSize = config.render
    canvas.width = pixelSize
    canvas.height = pixelSize
    const ctx = canvas.getContext("2d")

    if (!ctx) return null

    // Disable smoothing for crispy pixels
    ctx.imageSmoothingEnabled = false

    // Draw emoji at small size
    ctx.font = `${pixelSize - 2}px serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(emoji, pixelSize / 2, pixelSize / 2 + 1)

    return canvas.toDataURL()
  }, [emoji, config.render])

  // Fallback for SSR or if canvas fails
  if (!pixelatedDataUrl) {
    return (
      <span
        className={`inline-flex items-center justify-center blocky-emoji ${className}`}
        style={{
          width: config.container,
          height: config.container,
          fontSize: config.container * 0.7,
        }}
      >
        {emoji}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: config.container,
        height: config.container,
      }}
    >
      <img
        src={pixelatedDataUrl}
        alt={emoji}
        style={{
          width: config.container,
          height: config.container,
          imageRendering: "pixelated",
        }}
        draggable={false}
      />
    </span>
  )
}

/**
 * Simple CSS-only pixelated emoji (lighter weight, less accurate)
 */
export function BlockyEmoji({ 
  emoji, 
  size = "md",
  className = "" 
}: PixelEmojiProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <span 
      className={`blocky-emoji ${sizes[size]} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {emoji}
    </span>
  )
}

export default PixelEmoji

