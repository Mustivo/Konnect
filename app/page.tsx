import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyKonnect from "@/components/WhyKonnect";
import Verified from "@/components/Verified";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="stack">
        <Hero />
        <WhyKonnect />
        <Verified />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
