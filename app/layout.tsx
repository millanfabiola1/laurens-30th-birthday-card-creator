import type React from "react"
import type { Metadata } from "next"
import { Pixelify_Sans, Bagel_Fat_One, Imperial_Script, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  weight: ["400", "500", "600", "700"],
})

const bagelFatOne = Bagel_Fat_One({
  subsets: ["latin"],
  variable: "--font-bubble",
  weight: "400",
})

const imperialScript = Imperial_Script({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-narrow",
  weight: "400",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Lauren's 30th Birthday Card Creator",
  description: "Design a custom birthday card in retro 90s/2000s style",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelifySans.variable} ${bagelFatOne.variable} ${imperialScript.variable} ${instrumentSerif.variable} font-sans antialiased overflow-hidden`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
