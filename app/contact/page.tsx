"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Building2, Clock3, GraduationCap, Send } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const routes = [
  { icon: GraduationCap, title: "Learner support", text: "Course access, schedules, certificates, and progress questions." },
  { icon: BookOpen, title: "Instructor inquiries", text: "Applications, teaching tools, and educator support." },
  { icon: Building2, title: "Schools & teams", text: "Cohort programs, partnerships, and learning plans." },
];

const questions = [
  ["Can I try a class before committing?", "Many instructors offer a free 20-minute course preview. Look for ‘Preview available’ on the course page."],
  ["What happens if I miss a live session?", "Most cohorts include recordings and a concise catch-up route, unless the class relies on private discussion."],
  ["How are instructors verified?", "We review identity, subject credentials, teaching samples, and a live peer interview before approval."],
  ["Do you offer school or team plans?", "Yes. We support private cohorts, custom syllabi, and progress reporting for schools and organizations."],
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f6f0] text-[#1b241c] antialiased dark:bg-[#0b0d0b] dark:text-[#f4f4f0]">
      <Navbar />
      <main>
        <section className="bg-[#f7f6f0] px-6 pb-16 pt-16 dark:bg-[#151a16] md:pb-20 md:pt-24">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#60764f] dark:text-[#9ab978]">Contact Konnect</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.06em] md:text-6xl">Tell us what you are trying to<br className="hidden md:block" /> learn or solve.</h1>
            <p className="mx-auto mt-4 max-w-[470px] text-base leading-7 text-[#687267] dark:text-[#aeb8aa]">A real person will read your message and point you in the right direction.</p>
          </div>
        </section>

        <section className="bg-[#f7f6f0] px-6 pb-20 dark:bg-[#151a16] md:pb-28">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.55fr_0.85fr]">
            <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className="rounded-lg border border-[#dfe5d8] bg-[#fffefa] p-5 shadow-[0_14px_35px_rgba(29,45,25,0.05)] dark:border-white/10 dark:bg-[#171c18] md:p-6">
              <h2 className="text-xl font-bold tracking-[-0.04em]">Send us a message</h2>
              <p className="mt-2 text-sm text-[#687267] dark:text-[#aeb8aa]">Share a little context so we can connect you with the right team.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold">First name<input required name="firstName" placeholder="Mia" className="mt-1.5 w-full rounded border border-[#dfe5d8] bg-transparent px-3 py-2.5 text-base font-normal outline-none transition focus:border-[#526d43] dark:border-white/10" /></label>
                <label className="text-sm font-semibold">Last name<input required name="lastName" placeholder="Patel" className="mt-1.5 w-full rounded border border-[#dfe5d8] bg-transparent px-3 py-2.5 text-base font-normal outline-none transition focus:border-[#526d43] dark:border-white/10" /></label>
              </div>
              <label className="mt-4 block text-sm font-semibold">Email<input required type="email" name="email" placeholder="mia@example.com" className="mt-1.5 w-full rounded border border-[#dfe5d8] bg-transparent px-3 py-2.5 text-base font-normal outline-none transition focus:border-[#526d43] dark:border-white/10" /></label>
              <label className="mt-4 block text-sm font-semibold">What are you here with?<select name="reason" className="mt-1.5 w-full rounded border border-[#dfe5d8] bg-transparent px-3 py-2.5 text-base font-normal outline-none transition focus:border-[#526d43] dark:border-white/10"><option>Choose one thing</option><option>Course question</option><option>Instructor inquiry</option><option>School or team plan</option></select></label>
              <label className="mt-4 block text-sm font-semibold">Message<textarea required name="message" rows={4} placeholder="Tell us what you need and any useful context..." className="mt-1.5 w-full resize-y rounded border border-[#dfe5d8] bg-transparent px-3 py-2.5 text-base font-normal outline-none transition focus:border-[#526d43] dark:border-white/10" /></label>
              <button type="submit" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-[#263d21] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#34512c]"><Send size={13} /> {sent ? "Message sent" : "Send message"}</button>
              <p className="mt-3 text-center text-xs text-[#687267] dark:text-[#aeb8aa]">By sending this, you agree to our privacy policy.</p>
            </form>

            <aside className="pt-1">
              <h2 className="text-xl font-bold tracking-[-0.04em]">The right route, faster.</h2>
              <div className="mt-5 space-y-4">{routes.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#e4eddc] text-[#456238] dark:bg-[#304728] dark:text-[#c3d8b6]"><Icon size={14} /></span><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#687267] dark:text-[#aeb8aa]">{text}</p></div></div>)}</div>
              <div className="mt-6 rounded-md bg-[#e8efe2] p-4 dark:bg-[#263d21]"><div className="flex items-center gap-2 text-sm font-bold"><Clock3 size={14} /> When you will hear back</div><p className="mt-2 text-sm leading-6 text-[#687267] dark:text-[#c5d6bc]">Usually 1-2 business days. Most questions are answered sooner during open hours.</p></div>
            </aside>
          </div>
        </section>

        <section className="border-t border-[#e2e7df] bg-[#f7f6f0] px-6 py-20 dark:border-white/10 dark:bg-[#151a16] md:py-24"><div className="mx-auto max-w-6xl"><div className="text-center"><p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#60764f] dark:text-[#9ab978]">Quick answers</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] md:text-4xl">Before you send a note.</h2><p className="mt-2 text-base text-[#687267] dark:text-[#aeb8aa]">The most common things learners and teachers ask us.</p></div><div className="mx-auto mt-8 max-w-[960px]">{questions.map(([question, answer]) => <div key={question} className="grid gap-2 border-b border-[#dfe5d8] py-4 text-sm dark:border-white/10 md:grid-cols-[0.7fr_1.3fr] md:gap-8"><strong>{question}</strong><p className="leading-6 text-[#687267] dark:text-[#aeb8aa]">{answer}</p></div>)}</div></div></section>
      </main>
      <Footer />
    </div>
  );
}