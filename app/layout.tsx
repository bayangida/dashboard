import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bayangida Admin Dashboard",
  description:
    "Administrative dashboard for the Bayangida agricultural platform. Manage farmers, drivers, transactions, and produce listings.",
  keywords: "Bayangida, agriculture, admin, dashboard, farmers, Nigeria, produce, marketplace",
  authors: [{ name: "Bayangida Team" }],
  creator: "Bayangida",
  publisher: "Bayangida",
  openGraph: {
    title: "Bayangida Admin Dashboard",
    description: "Administrative dashboard for the Bayangida agricultural platform",
    siteName: "Bayangida Admin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bayangida Admin Dashboard",
    description: "Administrative dashboard for the Bayangida agricultural platform",
  },
  robots: {
    index: false, // Admin dashboard should not be indexed
    follow: false,
  },
    generator: 'bayangida'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/placeholder.svg?height=32&width=32" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
