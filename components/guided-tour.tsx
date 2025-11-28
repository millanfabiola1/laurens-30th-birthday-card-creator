"use client"

import { useState, useEffect, useCallback } from "react"
import { MacWindow, MacButton } from "./mac-ui"
import { playSound } from "@/lib/sound-manager"

interface TourStep {
  title: string
  description: string
  emoji: string
  highlight?: string // CSS selector or position hint
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Lauren's Birthday Card Creator! 🎉",
    description: "Let's take a quick tour to help you create the perfect birthday card for Lauren's 30th!",
    emoji: "👋",
    position: "center",
  },
  {
    title: "Drawing Tools",
    description: "Use the Brush 🖌️ to draw freely on the canvas. Pick colors and adjust brush size to create your masterpiece!",
    emoji: "🖌️",
    position: "top-left",
  },
  {
    title: "Eraser",
    description: "Made a mistake? No worries! The Eraser 🧹 lets you remove any strokes you don't want.",
    emoji: "🧹",
    position: "top-left",
  },
  {
    title: "Fill Tool",
    description: "Use the Fill 🪣 tool to quickly fill areas with color. Great for backgrounds!",
    emoji: "🪣",
    position: "top-left",
  },
  {
    title: "Fun Stamps",
    description: "Add cute stamps ⭐ to your card! Choose from KidPix-style stamps and click anywhere on the canvas to place them.",
    emoji: "⭐",
    position: "top-left",
  },
  {
    title: "Add Text",
    description: "Write birthday messages with the Text 🔤 tool. Pick fun fonts and colors to make your message pop!",
    emoji: "🔤",
    position: "top-left",
  },
  {
    title: "Images Gallery",
    description: "The Images 🖼️ tab has characters, cakes, decorations and more! Click to place them on your card and resize as needed.",
    emoji: "🖼️",
    position: "top-left",
  },
  {
    title: "Shapes",
    description: "Add hearts 💜, stars, and other shapes to decorate your card!",
    emoji: "💜",
    position: "top-left",
  },
  {
    title: "Wacky Effects",
    description: "The Wacky 🌀 tool adds fun special effects and patterns to your creation!",
    emoji: "🌀",
    position: "top-left",
  },
  {
    title: "Undo & Redo",
    description: "Use ↩️ Undo and ↪️ Redo to fix any mistakes or bring back something you removed.",
    emoji: "↩️",
    position: "top-left",
  },
  {
    title: "Backgrounds",
    description: "Click 'Background' to choose from beautiful pre-made backgrounds for your card!",
    emoji: "🎨",
    position: "top-right",
  },
  {
    title: "Start Fresh",
    description: "Click '✨ New' to clear the canvas and start a brand new card.",
    emoji: "✨",
    position: "bottom-left",
  },
  {
    title: "Random Design",
    description: "Feeling creative? Click '🔀 Random Design' to generate a fun random card design instantly!",
    emoji: "🔀",
    position: "bottom-left",
  },
  {
    title: "Save Your Card",
    description: "When you're done, click '💾 Save' to download your creation as an image!",
    emoji: "💾",
    position: "bottom-left",
  },
  {
    title: "You're Ready! 🎂",
    description: "That's it! Now go create an amazing birthday card for Lauren. She's going to love it! 💕",
    emoji: "🎉",
    position: "center",
  },
]

interface GuidedTourProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

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

  const step = tourSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tourSteps.length - 1

  // Position classes based on step
  const getPositionClasses = () => {
    switch (step.position) {
      case "top-left":
        return "top-20 left-20"
      case "top-right":
        return "top-20 right-20"
      case "bottom-left":
        return "bottom-32 left-20"
      case "bottom-right":
        return "bottom-32 right-20"
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Tour Card */}
      <div className={`fixed z-[9999] ${getPositionClasses()}`}>
        <MacWindow className="w-[340px] sm:w-[400px] shadow-2xl animate-bounce-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{step.emoji}</span>
              <span className="text-white font-bold text-sm pixel-text drop-shadow-md">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button 
              onClick={handleClose}
              className="text-white hover:text-pink-200 text-xl font-bold transition-colors"
              title="Close tour (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 bg-gradient-to-b from-pink-50 to-purple-50">
            <h3 className="text-lg font-bold text-purple-800 mb-2 pixel-text">
              {step.title}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mb-4">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-pink-500 scale-125"
                      : index < currentStep
                      ? "bg-purple-400"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <MacButton
                onClick={handlePrev}
                disabled={isFirstStep}
                className={isFirstStep ? "opacity-50 cursor-not-allowed" : ""}
              >
                ← Back
              </MacButton>

              <button
                onClick={handleClose}
                className="text-xs text-gray-500 hover:text-pink-600 underline transition-colors"
              >
                Skip tour
              </button>

              <MacButton primary onClick={handleNext}>
                {isLastStep ? "🎉 Done!" : "Next →"}
              </MacButton>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 text-center border-t">
            Use ← → arrow keys to navigate • Esc to exit
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
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

