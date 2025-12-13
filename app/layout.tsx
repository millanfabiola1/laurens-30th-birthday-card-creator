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

// Get base URL from environment variable or use default
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

export const metadata: Metadata = {
  ...(baseUrl && { metadataBase: new URL(baseUrl) }),
  title: "Lauren's 30th Birthday Card Creator",
  description: "Lauren's Bday Card Maker",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
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
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Lauren's 30th Birthday Card Creator",
    description: "Lauren's Bday Card Maker",
    images: [
      {
        url: "/thumbnail2.png",
        alt: "Lauren's Bday Card Maker",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lauren's 30th Birthday Card Creator",
    description: "Lauren's Bday Card Maker",
    images: ["/thumbnail2.png"],
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
