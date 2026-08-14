import Footer from "@/src/components/Footer";
import FounderProgram from "@/src/components/FounderProgram";
import GrandPrize from "@/src/components/GrandPrize";
import Header from "@/src/components/Header";
import Hero from "@/src/components/Hero";
import HowItWorks from "@/src/components/HowItWorks";
import Leaderboard from "@/src/components/Leaderboard";
import MarketSection from "@/src/components/MarketSection";
import ProofSection from "@/src/components/ProofSection";
import ReferFriend from "@/src/components/ReferFriend";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <HowItWorks />
      <MarketSection />
      <ProofSection />
      <GrandPrize />
      <Leaderboard />
      <FounderProgram />
      <ReferFriend />
      <Footer />
    </>
  );
}
