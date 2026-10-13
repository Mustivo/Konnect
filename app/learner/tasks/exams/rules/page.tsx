"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const examRules = [
  {
    title: "Work independently",
    detail: "Complete the exam yourself. Do not use external assistance, AI tools, shared answers, or materials not authorised by your teacher.",
  },
  {
    title: "Camera and microphone required",
    detail: "Your camera and microphone must remain active throughout the exam. Your face must be clearly visible at all times. Covering or disabling either will be flagged for review.",
  },
  {
    title: "Use a quiet, private space",
    detail: "Sit alone in a quiet room with a clear desk. Remove any books, notes, or devices not authorised for the exam. No other person should be present or visible.",
  },
  {
    title: "Stay in the exam screen",
    detail: "Do not switch tabs, open other applications, or leave this screen. Navigating away may be recorded and reviewed by your instructor.",
  },
  {
    title: "Keep track of your time",
    detail: "The 90-minute timer starts when the exam begins and continues once started, even if you leave the screen or lose connectivity. You can revisit and mark questions for review before submitting.",
  },
  {
    title: "Review before submitting",
    detail: "You can move between questions and mark answers for review. Check all responses before final submission; submitted answers cannot be changed.",
  },
  {
    title: "If your connection drops",
    detail: "Reconnect and return to the exam promptly. Note the time and any error, then contact Amara Okafor or Konnect support if you cannot continue.",
  },
];

const readinessChecks = [
  { title: "Camera and microphone required", detail: "This exam is proctored. Your camera and microphone must be enabled. You will verify them on the next screen." },
  { title: "Quiet, private room — clear desk", detail: "Sit alone in a quiet space. Clear your desk of unauthorised materials. No other person should be visible on camera." },
  { title: "Stable internet and charged device", detail: "Keep your device plugged in or fully charged. Ensure a reliable internet connection before proceeding." },
  { title: "Monitoring notice", detail: "Your session may be recorded and reviewed by Amara Okafor to ensure exam integrity. By proceeding you consent to this monitoring." },
];

export default function ExamRulesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => setMounted(true), []);

  const page = (
    <main className="learner-exam-rules fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f3f4ee] text-[#22291f]">
      <header className="flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-[#e0e5dc] bg-white px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/learner/tasks/exams" aria-label="Back to exams" className="shrink-0 border-r border-[#edf0e9] pr-3 sm:pr-5">
            <Image src="/konnect-wordmark.png" alt="Konnect" width={90} height={38} className="h-[30px] w-[82px] object-contain object-left" priority />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-bold sm:text-[18px]">Design systems fundamentals</h1>
            <p className="truncate text-[10px] text-[#788172]">UI/UX Design — From Wireframes to Prototypes</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1 rounded-full bg-[#eaf0e3] px-2.5 py-1 text-[9px] font-semibold text-[#526744] sm:inline-flex"><Check size={11} /> Available now</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf0e3] text-[10px] font-semibold text-[#40522c]">GT</span>
          <span className="hidden sm:block"><span className="block text-[10px] font-semibold">Gabriella Igabe</span><span className="block text-[8px] text-[#788172]">Learner</span></span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-7 sm:pt-5">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#526744]">Before you begin</p>
              <h2 className="mt-0.5 text-[24px] font-bold leading-tight sm:text-[26px]">Rules &amp; regulations</h2>
              <p className="mt-1 text-[12px] text-[#70796b]">Take a moment to read the rules and prepare your space before joining the exam.</p>
            </div>
            <nav aria-label="Exam steps" className="flex items-center gap-2 text-[10px] text-[#7b8376]">
              <Link href="/learner/tasks/exams" className="hover:text-[#40522c]">Schedule</Link>
              <ChevronRight size={12} />
              <span aria-current="step" className="rounded-full bg-[#eaf0e3] px-2.5 py-1 font-semibold text-[#40522c]">Rules</span>
              <ChevronRight size={12} />
              <Link href="/learner/tasks/exams/device-check" className="hover:text-[#40522c]">Device check</Link>
              <ChevronRight size={12} />
              <span>Exam</span>
            </nav>
          </div>

          <section className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#dfe5da] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:p-5">
            <div><p className="text-[9px] uppercase text-[#778071]">Assessment</p><p className="mt-1 text-[13px] font-semibold">Design systems fundamentals</p><p className="mt-1 text-[10px] text-[#788172]">Teacher · Amara Okafor</p></div>
            <div><p className="text-[9px] uppercase text-[#778071]">Schedule</p><p className="mt-1 text-[13px] font-semibold">6 October 2026</p><p className="mt-1 text-[10px] text-[#788172]">16:00–17:30 BST</p></div>
            <div><p className="text-[9px] uppercase text-[#778071]">Duration</p><p className="mt-1 text-[13px] font-semibold">90 minutes</p><p className="mt-1 text-[10px] text-[#788172]">Timer starts when the exam begins</p></div>
            <div><p className="text-[9px] uppercase text-[#778071]">Exam structure</p><p className="mt-1 text-[13px] font-semibold">20 questions · 100 points</p><p className="mt-1 text-[10px] text-[#788172]">Multiple choice · 5 points each</p></div>
          </section>

          <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,2.1fr)_minmax(300px,0.9fr)]">
            <section className="rounded-xl border border-[#dfe5da] bg-white p-4 sm:p-5">
              <h2 className="flex items-center gap-2 border-b border-[#e9ede5] pb-2.5 text-[15px] font-semibold"><ShieldCheck size={17} className="text-[#526744]" /> Exam rules</h2>
              <ol className="mt-2 space-y-2.5">
                {examRules.map((rule, index) => (
                  <li key={rule.title} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f1f3ed] text-[10px] font-semibold text-[#536447]">{String(index + 1).padStart(2, "0")}</span>
                    <span><span className="block text-[12px] font-semibold">{rule.title}</span><span className="mt-0.5 block text-[10px] leading-relaxed text-[#737c70]">{rule.detail}</span></span>
                  </li>
                ))}
              </ol>
            </section>

            <aside className="space-y-3">
              <section className="rounded-xl border border-[#dfe5da] bg-white p-4 sm:p-5">
                <h2 className="text-[15px] font-semibold">Before you continue</h2>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eaf0e3] px-2.5 py-1 text-[9px] font-semibold text-[#526744]"><Check size={11} /> Exam access is ready</p>
                <ul className="mt-3 space-y-3">
                  {readinessChecks.map((item) => (
                    <li key={item.title} className="flex items-start gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#536a43]" />
                      <span><span className="block text-[11px] font-semibold">{item.title}</span><span className="mt-0.5 block text-[9px] leading-relaxed text-[#788172]">{item.detail}</span></span>
                    </li>
                  ))}
                </ul>
              </section>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#dce5d3] bg-[#eaf0e3] p-4">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#344d2b]" />
                <span><span className="block text-[11px] font-semibold">I have read and agree to the exam rules and proctoring requirements</span><span className="mt-1 block text-[9px] leading-relaxed text-[#6e7865]">Proceeding will take you to the device check. Your 90-minute timer only starts when the exam itself begins.</span></span>
              </label>
            </aside>
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e0e5dc] bg-white px-4 py-3 sm:px-7">
        <Link href="/learner/tasks/exams" className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5da] px-3 text-[11px] font-semibold text-[#43503d] hover:bg-[#f5f7f2]"><ArrowLeft size={13} /> Back to exams</Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-[10px] text-[#788172] sm:inline">Your timer has not started yet.</span>
          <button type="button" disabled={!agreed} onClick={() => router.push("/learner/tasks/exams/device-check")} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#263d21] px-4 text-[11px] font-semibold text-white hover:bg-[#1c3019] disabled:cursor-not-allowed disabled:opacity-50">
            Continue to device check <ArrowRight size={13} />
          </button>
        </div>
      </footer>
    </main>
  );

  return mounted ? createPortal(page, document.body) : null;
}
