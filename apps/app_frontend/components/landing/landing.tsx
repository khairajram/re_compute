import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import StatsSection from "@/components/landing/StatsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Landing(){
  return (
    <main className="bg-[#020617]  text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <CTASection />
      <Footer />
    </main>
  );
}