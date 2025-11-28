"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MacWindow, MacButton } from "./mac-ui"
import { playSound } from "@/lib/sound-manager"

interface TourStep {
  title: string
  description: string
  emoji: string
  selector?: string // CSS selector for the element to highlight
  tooltipPosition: "right" | "left" | "bottom" | "top" | "center"
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome! 🎉",
    description: "Let's take a quick tour to help you create the perfect birthday card for Lauren's 30th!",
    emoji: "👋",
    tooltipPosition: "center",
  },
  {
    title: "Brush Tool",
    description: "Draw freely on the canvas! Pick colors and adjust brush size to create your masterpiece.",
    emoji: "🖌️",
    selector: '[title="Brush"]',
    tooltipPosition: "right",
  },
  {
    title: "Eraser",
    description: "Made a mistake? No worries! Remove any strokes you don't want.",
    emoji: "🧹",
    selector: '[title="Eraser"]',
    tooltipPosition: "right",
  },
  {
    title: "Fill Tool",
    description: "Quickly fill areas with color. Great for backgrounds!",
    emoji: "🪣",
    selector: '[title="Fill"]',
    tooltipPosition: "right",
  },
  {
    title: "Fun Stamps",
    description: "Add cute KidPix-style stamps! Click anywhere on the canvas to place them.",
    emoji: "⭐",
    selector: '[title="Stamps"]',
    tooltipPosition: "right",
  },
  {
    title: "Add Text",
    description: "Write birthday messages! Pick fun fonts and colors to make your message pop.",
    emoji: "🔤",
    selector: '[title="Text"]',
    tooltipPosition: "right",
  },
  {
    title: "Images Gallery",
    description: "Characters, cakes, decorations and more! Click to place and resize them.",
    emoji: "🖼️",
    selector: '[title="Images"]',
    tooltipPosition: "right",
  },
  {
    title: "Shapes",
    description: "Add hearts, stars, and other shapes to decorate your card!",
    emoji: "💜",
    selector: '[title="Shapes"]',
    tooltipPosition: "right",
  },
  {
    title: "Wacky Effects",
    description: "Fun special effects and patterns for your creation!",
    emoji: "🌀",
    selector: '[title="Wacky"]',
    tooltipPosition: "right",
  },
  {
    title: "Undo & Redo",
    description: "Fix mistakes or bring back something you removed.",
    emoji: "↩️",
    selector: '[title="Undo"]',
    tooltipPosition: "right",
  },
  {
    title: "Backgrounds",
    description: "Choose from beautiful pre-made backgrounds for your card!",
    emoji: "🎨",
    selector: 'button:has-text("Background")',
    tooltipPosition: "left",
  },
  {
    title: "Start Fresh",
    description: "Clear the canvas and start a brand new card.",
    emoji: "✨",
    selector: 'button:has-text("New")',
    tooltipPosition: "top",
  },
  {
    title: "Random Design",
    description: "Generate a fun random card design instantly!",
    emoji: "🔀",
    selector: 'button:has-text("Random")',
    tooltipPosition: "top",
  },
  {
    title: "Save Your Card",
    description: "Download your creation as an image when you're done!",
    emoji: "💾",
    selector: 'button:has-text("Save")',
    tooltipPosition: "top",
  },
  {
    title: "You're Ready! 🎂",
    description: "That's it! Now go create an amazing birthday card for Lauren. She's going to love it! 💕",
    emoji: "🎉",
    tooltipPosition: "center",
  },
]

interface GuidedTourProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = tourSteps[currentStep]

  // Find and highlight the target element
  useEffect(() => {
    if (!isOpen) return

    const findElement = () => {
      if (!step.selector) {
        setHighlightRect(null)
        // Center tooltip
        setTooltipStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        })
        return
      }

      // Try different selector strategies
      let element: Element | null = null
      
      // Handle :has-text pseudo selector (custom)
      if (step.selector.includes(':has-text')) {
        const match = step.selector.match(/(.+):has-text\("(.+)"\)/)
        if (match) {
          const [, baseSelector, text] = match
          const elements = document.querySelectorAll(baseSelector)
          element = Array.from(elements).find(el => el.textContent?.includes(text)) || null
        }
      } else {
        element = document.querySelector(step.selector)
      }

      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightRect(rect)

        // Calculate tooltip position
        const padding = 16
        const tooltipWidth = 320
        const tooltipHeight = 200 // Approximate

        let style: React.CSSProperties = { position: 'fixed' }

        switch (step.tooltipPosition) {
          case 'right':
            style.left = rect.right + padding
            style.top = rect.top + rect.height / 2
            style.transform = 'translateY(-50%)'
            break
          case 'left':
            style.right = window.innerWidth - rect.left + padding
            style.top = rect.top + rect.height / 2
            style.transform = 'translateY(-50%)'
            break
          case 'bottom':
            style.left = rect.left + rect.width / 2
            style.top = rect.bottom + padding
            style.transform = 'translateX(-50%)'
            break
          case 'top':
            style.left = rect.left + rect.width / 2
            style.bottom = window.innerHeight - rect.top + padding
            style.transform = 'translateX(-50%)'
            break
          default:
            style.top = '50%'
            style.left = '50%'
            style.transform = 'translate(-50%, -50%)'
        }

        setTooltipStyle(style)
      } else {
        setHighlightRect(null)
        setTooltipStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        })
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(findElement, 100)
    return () => clearTimeout(timer)
  }, [isOpen, currentStep, step.selector, step.tooltipPosition])

  const handleNext = useCallback(() => {
    playSound("click")
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
      setCurrentStep(0)
    }
  }, [currentStep, onClose])

  const handlePrev = useCallback(() => {
    playSound("click")
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleClose = useCallback(() => {
    playSound("click")
    onClose()
    setCurrentStep(0)
  }, [onClose])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext()
      } else if (e.key === "ArrowLeft") {
        handlePrev()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleNext, handlePrev, handleClose])

  if (!isOpen) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tourSteps.length - 1

  // Calculate spotlight cutout
  const spotlightPadding = 8

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - spotlightPadding}
                  y={highlightRect.top - spotlightPadding}
                  width={highlightRect.width + spotlightPadding * 2}
                  height={highlightRect.height + spotlightPadding * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border around element */}
      {highlightRect && (
        <div
          className="fixed z-[9998] pointer-events-none rounded-lg"
          style={{
            left: highlightRect.left - spotlightPadding,
            top: highlightRect.top - spotlightPadding,
            width: highlightRect.width + spotlightPadding * 2,
            height: highlightRect.height + spotlightPadding * 2,
            border: '3px solid #ff1493',
            boxShadow: '0 0 20px rgba(255, 20, 147, 0.6), 0 0 40px rgba(255, 20, 147, 0.3)',
            animation: 'pulse-border 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Clickable overlay to close */}
      <div 
        className="fixed inset-0 z-[9998]"
        onClick={handleClose}
      />

      {/* Arrow pointer */}
      {highlightRect && step.tooltipPosition !== 'center' && (
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{
            left: step.tooltipPosition === 'right' 
              ? highlightRect.right + 4 
              : step.tooltipPosition === 'left'
              ? highlightRect.left - 24
              : highlightRect.left + highlightRect.width / 2 - 10,
            top: step.tooltipPosition === 'top'
              ? highlightRect.top - 24
              : step.tooltipPosition === 'bottom'
              ? highlightRect.bottom + 4
              : highlightRect.top + highlightRect.height / 2 - 10,
          }}
        >
          <div 
            className="text-2xl"
            style={{
              transform: step.tooltipPosition === 'right' ? 'rotate(0deg)' 
                : step.tooltipPosition === 'left' ? 'rotate(180deg)'
                : step.tooltipPosition === 'top' ? 'rotate(-90deg)'
                : 'rotate(90deg)',
            }}
          >
            👉
          </div>
        </div>
      )}

      {/* Tour tooltip */}
      <div 
        ref={tooltipRef}
        className="z-[10000] w-[320px]"
        style={tooltipStyle}
      >
        <MacWindow className="shadow-2xl animate-bounce-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-white font-bold text-xs pixel-text drop-shadow-md">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>
            <button 
              onClick={handleClose}
              className="text-white hover:text-pink-200 text-lg font-bold transition-colors leading-none"
              title="Close tour (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-3 bg-gradient-to-b from-pink-50 to-purple-50">
            <h3 className="text-base font-bold text-purple-800 mb-1.5 pixel-text">
              {step.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-2">
              <MacButton
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`text-xs ${isFirstStep ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                ← Back
              </MacButton>

              <button
                onClick={handleClose}
                className="text-xs text-gray-500 hover:text-pink-600 underline transition-colors"
              >
                Skip
              </button>

              <MacButton primary onClick={handleNext} className="text-xs">
                {isLastStep ? "Done! 🎉" : "Next →"}
              </MacButton>
            </div>
          </div>
        </MacWindow>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 20, 147, 0.6), 0 0 40px rgba(255, 20, 147, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 20, 147, 0.8), 0 0 60px rgba(255, 20, 147, 0.5);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
