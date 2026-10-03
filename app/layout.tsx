import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google'
import './globals.css'
import { AppProvider } from '@/src/provider/AppProvider'
import ThemeToggle from '@/src/components/ThemeToggle'
import Toaster from '@/src/components/Toaster'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SantiBet — Predict. Win. Repeat.',
  description:
    'Every day until launch, one YES or NO bet decides your rank, your rewards, and your shot at ₦1,000,000.',
}

// GTM only loads when the container ID is set, so local dev and preview
// builds without it don't send analytics. GA4 is configured inside GTM.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

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
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${outfit.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* GTM's no-JavaScript fallback; GoogleTagManager only injects the script. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height='0'
              width='0'
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <AppProvider>
          <ThemeToggle />
          <Toaster />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
