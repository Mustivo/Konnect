import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CourseShowcase from "@/components/CourseShowcase";
import WhyKonnect from "@/components/WhyKonnect";
import Verified from "@/components/Verified";
import HowItWorks from "@/components/HowItWorks";
import LearnerProof from "@/components/LearnerProof";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f6f0] text-[#1b241c] antialiased transition-colors dark:bg-[#0b0d0b] dark:text-[#f4f4f0]">
      <Navbar />
      <main>
        <Hero />
        <CourseShowcase />
        <WhyKonnect />
        <Verified />
        <HowItWorks />
        <LearnerProof />
      </main>
      <Footer />
    </div>
  );
}
