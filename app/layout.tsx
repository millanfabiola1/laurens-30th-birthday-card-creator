import type React from "react"
import type { Metadata } from "next"
import { Pixelify_Sans, Bagel_Fat_One, Imperial_Script, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CursorEnforcer } from "@/components/cursor-enforcer"
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
  description: "Design a custom card for our Birthday Queen Lauren!",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "64x64",
      },
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: [
      {
        url: "/favicon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Lauren's 30th Birthday Card Creator",
    description: "Design a custom card for our Birthday Queen Lauren!",
    images: [
      {
        url: "/thumbnail2.png",
        width: 1200,
        height: 630,
        alt: "Lauren's 30th Birthday Card Creator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lauren's 30th Birthday Card Creator",
    description: "Design a custom card for our Birthday Queen Lauren!",
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
        <CursorEnforcer />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
