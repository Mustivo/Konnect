import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyKonnect from "@/components/WhyKonnect";
import Verified from "@/components/Verified";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(108deg,#fbfbf7_0%,#f7f8f2_54%,#3c4d24_100%)] text-[#1b241c] antialiased transition-colors dark:bg-[linear-gradient(108deg,#050804_0%,#11190c_54%,#36461e_100%)] dark:text-[#f4f4f0]">
      <Navbar />
      <main>
        <Hero />
        <WhyKonnect />
        <Verified />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
