import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SantiBet — Predict. Win. Repeat.',
  description:
    'Every day until launch, one YES or NO bet decides your rank, your rewards, and your shot at ₦1,000,000.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${sora.variable} antialiased`}>{children}</body>
    </html>
  )
}
