import Footer from '@/src/components/Footer'
import Header from '@/src/components/Header'
import Hero from '@/src/components/Hero'
import LaunchCountdown from '@/src/components/LaunchCountdown'
import LiveActivityToasts from '@/src/components/LiveActivityToasts'
import MarketCard from '@/src/components/MarketCard'
import SideMenu from '@/src/components/SideMenu'
import { PanelProvider } from '@/src/components/PanelContext'
import PlayerCard from '@/src/components/PlayerCard'
import QuickLeaderboardLink from '@/src/components/QuickLeaderboardLink'
import Ticker from '@/src/components/Ticker'

export default function Home() {
  return (
    <PanelProvider>
      <LiveActivityToasts />
      <SideMenu />

      {/* App shell: header, ticker and footer stay put; only <main> scrolls. */}
      <div className='flex h-dvh flex-col overflow-hidden'>
        <Header />

        <main id={'main-scroll'} className='min-h-0 flex-1 overflow-y-auto'>
          <div className='mx-auto grid min-h-full w-full max-w-300 grid-cols-1 content-center items-start gap-4 lg:items-stretch px-4 pt-4 pb-16 lg:grid-cols-[1fr_1.2fr] lg:gap-5 lg:py-6'>
            {/* Stretches to the question column's height on desktop; Hero fills the rest. */}
            <div className='flex flex-col gap-4'>
              <LaunchCountdown />
              <Hero />
            </div>

            <div className='flex flex-col gap-4'>
              <MarketCard />
              <QuickLeaderboardLink />
              <PlayerCard />
            </div>
          </div>
        </main>
        <Ticker />

        <Footer />
      </div>
    </PanelProvider>
  )
}
