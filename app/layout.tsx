import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'
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

// Meta Pixel follows the same rule: no ID, no tracking. Signup events are
// sent from trackEvent in src/utils/constants.ts.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

const META_PIXEL_SCRIPT = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
`

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
        {META_PIXEL_ID && (
          <Script id='meta-pixel' strategy='afterInteractive'>
            {META_PIXEL_SCRIPT}
          </Script>
        )}
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
        {META_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height='1'
              width='1'
              style={{ display: 'none' }}
              alt=''
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
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
