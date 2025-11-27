"use client"

import { useState, useEffect } from "react"

interface CountdownProps {
  targetDate: string
  timezone: string
}

export default function Countdown({ targetDate, timezone }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const target = new Date("2025-12-21T00:00:00")

      const difference = target.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [timezone])

  const boxStyle = {
    padding: "4px 8px",
    minWidth: "38px",
    fontSize: "11px",
    fontWeight: "bold" as const,
    border: "2px solid #c71585",
    background: "linear-gradient(180deg, #ffffff 0%, #ffc0e0 100%)",
    boxShadow: "inset -1px -1px 0 0 #c71585, inset 1px 1px 0 0 #ffffff, 1px 1px 0 0 #c71585",
    color: "#4a0033",
  }

  const colors = [
    "linear-gradient(180deg, #ff69b4 0%, #ff1493 100%)", // days - pink
    "linear-gradient(180deg, #c4b5fd 0%, #a855f7 100%)", // hours - purple
    "linear-gradient(180deg, #a5f3fc 0%, #00e5ff 100%)", // minutes - cyan
    "linear-gradient(180deg, #fef08a 0%, #fbbf24 100%)", // seconds - yellow
  ]

  return (
    <div className="text-center">
      <div
        className="text-xs font-bold pixel-text mb-1"
        style={{
          background: "linear-gradient(90deg, #ff1493, #a855f7, #00e5ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        ✨ Lauren turns 30 in: ✨
      </div>
      <div className="flex gap-1 justify-center text-xs font-bold font-mono">
        <div style={{ ...boxStyle, background: colors[0], color: "white" }} className="pixel-text">
          {timeLeft.days}d
        </div>
        <div style={{ ...boxStyle, background: colors[1], color: "white" }} className="pixel-text">
          {timeLeft.hours}h
        </div>
        <div style={{ ...boxStyle, background: colors[2], color: "#004050" }} className="pixel-text">
          {timeLeft.minutes}m
        </div>
        <div style={{ ...boxStyle, background: colors[3], color: "#78350f" }} className="pixel-text">
          {timeLeft.seconds}s
        </div>
      </div>
    </div>
  )
}
