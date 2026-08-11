import FounderBenefits from "@/src/components/FounderBenefits";
import FounderLevels from "@/src/components/FounderLevels";
import Footer from "@/src/components/Footer";
import GrandPrize from "@/src/components/GrandPrize";
import Hero from "@/src/components/Hero";
import Journey from "@/src/components/Journey";
import Leaderboard from "@/src/components/Leaderboard";
import LiveActivityFeed from "@/src/components/LiveActivityFeed";
import MarketSection from "@/src/components/MarketSection";
import PreviousResults from "@/src/components/PreviousResults";
import ReferFriend from "@/src/components/ReferFriend";
import Header from "@/src/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <MarketSection />
      <LiveActivityFeed />
      <PreviousResults />
      <Leaderboard />
      <Journey />
      <ReferFriend />
      <GrandPrize />
      <FounderLevels />
      <FounderBenefits />
      <Footer />
    </>
  );
}
