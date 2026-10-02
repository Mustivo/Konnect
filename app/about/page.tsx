import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f0] text-[#1b241c] antialiased dark:bg-[#0b0d0b] dark:text-[#f4f4f0]">
      <Navbar />
      <main>
        <section className="bg-[#e8efe2] px-5 py-20 dark:bg-[#20351d] md:py-28">
          <div className="mx-auto max-w-[820px] text-center">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#60764f] dark:text-[#b6cda5]">About Konnect</p>
            <h1 className="mt-6 text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.06em] md:text-6xl">Make live learning feel close, clear, and worth showing up for.</h1>
            <p className="mx-auto mt-5 max-w-[560px] text-xs leading-5 text-[#596955] dark:text-[#c2d0bb]">Small cohorts, thoughtful educators, and practical work that stays with you long after class ends.</p>
          </div>
        </section>

        <section className="bg-[#f7f6f0] px-5 py-16 dark:bg-[#0d100e] md:py-20">
          <div className="mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-[1fr_0.9fr]">
            <img className="h-[240px] w-full rounded-md object-cover md:h-[300px]" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=85" alt="Learners collaborating around a table" />
            <div><p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#60764f] dark:text-[#9ab978]">Why we exist</p><h2 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-4xl">Built after one too many lonely online courses.</h2><p className="mt-4 text-xs leading-5 text-[#5c675c] dark:text-[#aeb8aa]">We believe learning works best when it feels human: a small group, a real teacher, and space to ask the question you were almost too shy to ask.</p></div>
          </div>
        </section>

        <section className="bg-[#f7f6f0] px-5 pb-20 dark:bg-[#0d100e]">
          <div className="mx-auto max-w-[1100px] text-center"><p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#60764f] dark:text-[#9ab978]">Our point of view</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Principles we can practice.</h2><p className="mt-3 text-xs text-[#687267] dark:text-[#aeb8aa]">The small choices that make learning feel different.</p><div className="mt-8 grid gap-3 text-left md:grid-cols-3">{["Clarity over clutter", "People before platforms", "Trust designed in"].map((title) => <article key={title} className="border border-[#dce3d7] p-5 dark:border-white/10"><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-[0.68rem] leading-5 text-[#687267] dark:text-[#aeb8aa]">Every session has a clear purpose, a real human connection, and a next step you can trust.</p></article>)}</div></div>
        </section>

        <section className="bg-[#263d21] px-5 py-8 text-[#f4f5ee]"><div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-8 text-center md:grid-cols-4"><div><strong className="text-2xl">12k+</strong><span className="mt-1 block text-[0.55rem] uppercase tracking-[0.16em] text-[#c2d1b8]">verified learners</span></div><div><strong className="text-2xl">92%</strong><span className="mt-1 block text-[0.55rem] uppercase tracking-[0.16em] text-[#c2d1b8]">completion rate</span></div><div><strong className="text-2xl">42</strong><span className="mt-1 block text-[0.55rem] uppercase tracking-[0.16em] text-[#c2d1b8]">active educators</span></div><div><strong className="text-2xl">18</strong><span className="mt-1 block text-[0.55rem] uppercase tracking-[0.16em] text-[#c2d1b8]">course pathways</span></div></div></section>

        <section className="bg-[#f7f6f0] px-5 py-20 text-[#1b241c] dark:bg-[#151a16] dark:text-[#f4f4f0]"><div className="mx-auto max-w-[1100px] text-center"><p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#60764f] dark:text-[#9ab978]">The Konnect difference</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] md:text-4xl">Live. Small. Applied.</h2><p className="mx-auto mt-3 max-w-[480px] text-xs text-[#687267] dark:text-[#aeb8aa]">A simple model designed around attention, action, and useful feedback.</p><div className="mt-10 grid gap-8 text-left md:grid-cols-3">{["Meet live", "Practice between sessions", "Reflect with feedback"].map((title) => <div key={title} className="border-t border-[#d8dfd3] pt-4 dark:border-white/10"><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-[0.68rem] leading-5 text-[#687267] dark:text-[#aeb8aa]">Make progress visible through focused work and conversations that move you forward.</p></div>)}</div></div></section>

        <section className="bg-[#f7f6f0] px-5 pb-20 text-[#1b241c] dark:bg-[#151a16] dark:text-[#f4f4f0]"><div className="mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-[0.9fr_1fr]"><div><p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#60764f] dark:text-[#9ab978]">Learning worth returning to</p><h2 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.05em]">Built with educators, not just for them.</h2><p className="mt-4 max-w-[430px] text-xs leading-5 text-[#687267] dark:text-[#aeb8aa]">Our teachers shape the room, the rhythm, and the work. That is how a course becomes a practice.</p></div><img className="h-[250px] w-full rounded-md object-cover" src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1100&q=85" alt="Educator leading a collaborative class" /></div></section>

        <section className="bg-[#e8efe2] px-5 py-8 text-[#1b241c] dark:bg-[#263d21] dark:text-[#f4f5ee]"><div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-lg font-bold">Learning works better together.</h2><p className="mt-1 text-xs text-[#596955] dark:text-[#c5d6bc]">Find your next live class and show up for it.</p></div><Link href="/courses" className="border border-[#7c9270] px-4 py-2 text-xs font-semibold transition hover:bg-white/50">Browse courses</Link></div></section>
      </main>
      <Footer />
    </div>
  );
}