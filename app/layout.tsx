import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/src/provider/AppProvider'
import ThemeToggle from '@/src/components/ThemeToggle'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SantiBet — Predict. Win. Repeat.',
  description:
    'Every day until launch, one YES or NO bet decides your rank, your rewards, and your shot at ₦1,000,000.',
}

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('santibet-theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='scroll-smooth' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${outfit.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AppProvider>
          <ThemeToggle />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
