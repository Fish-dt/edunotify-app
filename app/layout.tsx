import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EduNotify App',
  description: 'Educational notification platform',
  generator: 'edunotify.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
