"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Bell,
  CalendarDays,
  BookOpen,
  ClipboardList,
  TrendingUp,
  BarChart2,
  ArrowRight,
  Shield,
  Palette,
  Lightbulb,
  Cpu,
  Lock,
  ChevronDown,
} from "lucide-react";

export default function LearnerDashboardPage() {
  return (
    <div className="space-y-6 pt-3 pb-8">
      {/* ========================================================= */}
      {/* 1. TOP HEADER: GREETING & QUICK ACTIONS                  */}
      {/* ========================================================= */}
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#707c6c]">Good afternoon,</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#172115] flex items-center gap-1.5">
            Gabriella Igabe <span className="text-xl">👋</span>
          </h1>
          <p className="text-[9.5px] font-bold tracking-wider uppercase text-[#707c6c] mt-0.5">
            TUESDAY, 6 OCTOBER 2026
          </p>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. STATS & PROGRESS ROW (4 CARDS)                         */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* CARD 1: Quick Stats 2x2 */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-2 gap-4">
            {/* Courses Enrolled */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#707c6c]">
                Courses Enrolled
              </span>
              <div className="flex items-center justify-between pr-2">
                <span className="text-2xl font-bold tracking-tight text-[#172115]">
                  4
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4e8] text-[#34522a]">
                  <BookOpen size={14} />
                </span>
              </div>
              <p className="text-[9.5px] text-[#8e9a8a]">Active classes</p>
            </div>

            {/* Classes Today */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#707c6c]">
                Classes Today
              </span>
              <div className="flex items-center justify-between pr-2">
                <span className="text-2xl font-bold tracking-tight text-[#172115]">
                  3
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4e8] text-[#34522a]">
                  <CalendarDays size={14} />
                </span>
              </div>
              <p className="text-[9.5px] text-[#8e9a8a]">Upcoming</p>
            </div>

            {/* Assignments Due */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-medium text-[#707c6c]">
                Assignments Due
              </span>
              <div className="flex items-center justify-between pr-2">
                <span className="text-2xl font-bold tracking-tight text-[#172115]">
                  1
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fef4e8] text-[#c2781b]">
                  <ClipboardList size={14} />
                </span>
              </div>
              <p className="text-[9.5px] text-[#8e9a8a]">Pending</p>
            </div>

            {/* Attendance */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-medium text-[#707c6c]">
                Attendance
              </span>
              <div className="flex items-center justify-between pr-2">
                <span className="text-2xl font-bold tracking-tight text-[#172115]">
                  96%
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4e8] text-[#34522a]">
                  <TrendingUp size={14} />
                </span>
              </div>
              <p className="text-[9.5px] text-[#8e9a8a]">This Month</p>
            </div>
          </div>
        </div>

        {/* CARD 2: Learning Progress */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#172115]">Learning Progress</h2>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-[#dce3d6] px-2 py-0.5 text-[9.5px] font-medium text-[#5f6c5b] hover:bg-[#f6f8f3]"
            >
              <span>This Week</span>
              <ChevronDown size={11} />
            </button>
          </div>

          {/* Donut and Legend */}
          <div className="my-2 flex items-center justify-between gap-3">
            {/* Circular Gauge */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e6ede2"
                  strokeWidth="8"
                />
                {/* Not started (8%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#d7dfd3"
                  strokeWidth="8"
                  strokeDasharray="251.3"
                  strokeDashoffset="0"
                />
                {/* In Progress (20%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f08c20"
                  strokeWidth="8"
                  strokeDasharray="50.2 201.1"
                  strokeDashoffset="-181"
                />
                {/* Completed (72%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2b4724"
                  strokeWidth="8"
                  strokeDasharray="181 70.3"
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-[#172115] leading-none">
                  72%
                </span>
                <span className="text-[8.5px] font-medium text-[#7d8979] mt-0.5">
                  Overall Progress
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1.5 text-[10.5px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2b4724]" />
                  <span className="text-[#647160]">Completed</span>
                </div>
                <span className="font-bold text-[#172115]">72%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#f08c20]" />
                  <span className="text-[#647160]">In Progress</span>
                </div>
                <span className="font-bold text-[#172115]">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#d7dfd3]" />
                  <span className="text-[#647160]">Not Started</span>
                </div>
                <span className="font-bold text-[#172115]">8%</span>
              </div>
            </div>
          </div>

          {/* Sub Stats Row */}
          <div className="flex items-center justify-between pt-1 border-t border-[#f0f4ed] text-[9.5px]">
            <div>
              <span className="text-[#7d8979]">Attendance </span>
              <span className="font-bold text-[#172115]">96%</span>
            </div>
            <div>
              <span className="text-[#7d8979]">Avg Grade </span>
              <span className="font-bold text-[#172115]">89%</span>
            </div>
          </div>

          {/* Bottom Motivation */}
          <p className="mt-1 text-[9.5px] font-medium text-[#2b4724]">
            You&apos;re showing up. Keep it going. ↗
          </p>
        </div>

        {/* CARD 3: Study Goals */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#172115]">Study Goals</h2>
            <Link
              href="/learner/resource"
              className="text-[9.5px] font-bold text-[#172115] hover:underline"
            >
              View All →
            </Link>
          </div>

          {/* Goals */}
          <div className="space-y-2.5 my-1">
            {/* Goal 1 */}
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#172115]">
                  Complete Linear Functions Module
                </span>
                <span className="font-bold text-[#172115]">72%</span>
              </div>
              <p className="text-[9.5px] text-[#8e9a8a]">Target: 8 Oct 2026</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e8eee3]">
                <div className="h-full rounded-full bg-[#2b4724] w-[72%]" />
              </div>
            </div>

            {/* Goal 2 */}
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#172115]">
                  Submit All Pending Assignments
                </span>
                <span className="font-bold text-[#172115]">30%</span>
              </div>
              <p className="text-[9.5px] text-[#8e9a8a]">Target: 15 Oct 2026</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e8eee3]">
                <div className="h-full rounded-full bg-[#2b4724] w-[30%]" />
              </div>
            </div>
          </div>

          {/* One thing to focus on Banner */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#f3e4ca] bg-[#fcf5e9] p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f6e5c8] text-[#9c6314]">
                <ClipboardList size={14} />
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-[#422e11] leading-tight">
                  One thing to focus on
                </p>
                <p className="text-[9px] text-[#7d6133] mt-0.5">
                  Linear functions practice · Due 8 Oct, 18:00
                </p>
              </div>
            </div>
            <ArrowRight size={13} className="shrink-0 text-[#7d6133]" />
          </div>
        </div>

        {/* CARD 4: Performance Overview */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 size={13} className="text-[#35522b]" />
              <h2 className="text-xs font-bold text-[#172115]">Performance Overview</h2>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-[#dce3d6] px-2 py-0.5 text-[9.5px] font-medium text-[#5f6c5b] hover:bg-[#f6f8f3]"
            >
              <span>This Month</span>
              <ChevronDown size={11} />
            </button>
          </div>

          {/* Line Chart */}
          <div className="relative mt-2 h-36 w-full">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 300 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#35522b" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#35522b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid lines */}
              <line x1="30" y1="15" x2="295" y2="15" stroke="#f0f3ed" strokeWidth="1" />
              <line x1="30" y1="40" x2="295" y2="40" stroke="#f0f3ed" strokeWidth="1" />
              <line x1="30" y1="65" x2="295" y2="65" stroke="#f0f3ed" strokeWidth="1" />
              <line x1="30" y1="90" x2="295" y2="90" stroke="#f0f3ed" strokeWidth="1" />
              <line x1="30" y1="110" x2="295" y2="110" stroke="#f0f3ed" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="12" y="18" fontSize="8" fill="#9da697" textAnchor="start">100</text>
              <text x="12" y="43" fontSize="8" fill="#9da697" textAnchor="start">75</text>
              <text x="12" y="68" fontSize="8" fill="#9da697" textAnchor="start">50</text>
              <text x="12" y="93" fontSize="8" fill="#9da697" textAnchor="start">25</text>
              <text x="16" y="113" fontSize="8" fill="#9da697" textAnchor="start">0</text>

              {/* Shaded Area */}
              <polygon
                points="35,110 50,96 100,74 150,71 200,60 250,52 285,24 285,110"
                fill="url(#chartGradient)"
              />

              {/* Trend Curve */}
              <path
                d="M 35 110 C 60 92, 80 75, 100 74 C 125 73, 140 71, 160 70 C 185 68, 205 60, 225 56 C 245 52, 265 42, 285 24"
                fill="none"
                stroke="#35522b"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Data Dots */}
              <circle cx="100" cy="74" r="2.5" fill="#fff" stroke="#35522b" strokeWidth="1.5" />
              <circle cx="160" cy="70" r="2.5" fill="#fff" stroke="#35522b" strokeWidth="1.5" />
              <circle cx="225" cy="56" r="2.5" fill="#fff" stroke="#35522b" strokeWidth="1.5" />
              <circle cx="285" cy="24" r="3" fill="#fff" stroke="#35522b" strokeWidth="2" />

              {/* Badge "93" at top right */}
              <g transform="translate(268, 8)">
                <rect width="24" height="15" rx="3.5" fill="#243d1f" />
                <text x="12" y="11" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                  93
                </text>
              </g>
            </svg>
          </div>

          {/* X Axis Dates */}
          <div className="flex justify-between pl-7 pr-2 text-[8px] font-medium text-[#9da697]">
            <span>1 Oct</span>
            <span>8 Oct</span>
            <span>15 Oct</span>
            <span>22 Oct</span>
            <span>29 Oct</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. AVAILABLE COURSES SECTION                              */}
      {/* ========================================================= */}
      <section className="space-y-3 pt-2">
        <h2 className="text-base font-bold tracking-tight text-[#172115]">
          Available courses
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* COURSE 1: Cybersecurity Fundamentals */}
          <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:shadow-md">
            <div>
              {/* Image banner */}
              <div className="relative h-[135px] w-full overflow-hidden bg-slate-900">
                <Image
                  src="/courses/cybersecurity.jpg"
                  alt="Cybersecurity Fundamentals"
                  fill
                  className="object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#0d1726]/85 px-2.5 py-0.5 text-[8.5px] font-bold tracking-wider text-white shadow-sm">
                  SECURITY
                </span>
              </div>

              {/* Body */}
              <div className="space-y-1.5 p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#e0f2fe] text-[#0284c7]">
                    <Lock size={11} />
                  </span>
                  <span className="text-[9.5px] font-bold tracking-wider text-[#0284c7]">
                    CYBERSECURITY · SEC 301
                  </span>
                </div>

                <h3 className="text-[13.5px] font-bold leading-snug text-[#172115]">
                  Cybersecurity Fundamentals
                </h3>

                <p className="line-clamp-2 text-[10.5px] leading-relaxed text-[#616d5c]">
                  Network security, ethical hacking basics, threat analysis & modern defence strategies.
                </p>

                <div className="flex items-center justify-between pt-1 text-[9.5px] text-[#616d5c]">
                  <span>Marcus Adeyemi · 10 live lessons</span>
                  <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[9px] font-semibold text-[#0284c7]">
                    Intermediate
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 pt-0">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#d2dacb] py-2 text-[11px] font-bold text-[#172115] transition hover:border-[#172115] hover:bg-[#f6f8f3]"
              >
                <span>View course</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>

          {/* COURSE 2: Graphic Design — Visual Storytelling */}
          <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:shadow-md">
            <div>
              {/* Image banner */}
              <div className="relative h-[135px] w-full overflow-hidden bg-rose-900">
                <Image
                  src="/courses/graphic-design.jpg"
                  alt="Graphic Design — Visual Storytelling"
                  fill
                  className="object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#db2777]/85 px-2.5 py-0.5 text-[8.5px] font-bold tracking-wider text-white shadow-sm">
                  DESIGN
                </span>
              </div>

              {/* Body */}
              <div className="space-y-1.5 p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#fce7f3] text-[#db2777]">
                    <Palette size={11} />
                  </span>
                  <span className="text-[9.5px] font-bold tracking-wider text-[#db2777]">
                    GRAPHIC DESIGN · GD 201
                  </span>
                </div>

                <h3 className="text-[13.5px] font-bold leading-snug text-[#172115]">
                  Graphic Design — Visual Storytelling
                </h3>

                <p className="line-clamp-2 text-[10.5px] leading-relaxed text-[#616d5c]">
                  Typography, colour theory, brand identity & Adobe Illustrator for modern graphic designers.
                </p>

                <div className="flex items-center justify-between pt-1 text-[9.5px] text-[#616d5c]">
                  <span>Nadia Fernandez · 10 live lessons</span>
                  <span className="rounded-full bg-[#fce7f3] px-2 py-0.5 text-[9px] font-semibold text-[#db2777]">
                    Beginner
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 pt-0">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#d2dacb] py-2 text-[11px] font-bold text-[#172115] transition hover:border-[#172115] hover:bg-[#f6f8f3]"
              >
                <span>View course</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>

          {/* COURSE 3: Soft Skills for the Digital Age */}
          <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:shadow-md">
            <div>
              {/* Image banner */}
              <div className="relative h-[135px] w-full overflow-hidden bg-amber-900">
                <Image
                  src="/courses/soft-skills.jpg"
                  alt="Soft Skills for the Digital Age"
                  fill
                  className="object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#d97706]/85 px-2.5 py-0.5 text-[8.5px] font-bold tracking-wider text-white shadow-sm">
                  PERSONAL GROWTH
                </span>
              </div>

              {/* Body */}
              <div className="space-y-1.5 p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#fef3c7] text-[#d97706]">
                    <Lightbulb size={11} />
                  </span>
                  <span className="text-[9.5px] font-bold tracking-wider text-[#d97706]">
                    SOFT SKILLS · SS 101
                  </span>
                </div>

                <h3 className="text-[13.5px] font-bold leading-snug text-[#172115]">
                  Soft Skills for the Digital Age
                </h3>

                <p className="line-clamp-2 text-[10.5px] leading-relaxed text-[#616d5c]">
                  Communication, leadership, critical thinking & emotional intelligence for modern professionals.
                </p>

                <div className="flex items-center justify-between pt-1 text-[9.5px] text-[#616d5c]">
                  <span>Prof. James Osei · 8 live lessons</span>
                  <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[9px] font-semibold text-[#b45309]">
                    All Levels
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 pt-0">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#d2dacb] py-2 text-[11px] font-bold text-[#172115] transition hover:border-[#172115] hover:bg-[#f6f8f3]"
              >
                <span>View course</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>

          {/* COURSE 4: Machine Learning — Foundations & Practice */}
          <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:shadow-md">
            <div>
              {/* Image banner */}
              <div className="relative h-[135px] w-full overflow-hidden bg-indigo-950">
                <Image
                  src="/courses/machine-learning.jpg"
                  alt="Machine Learning — Foundations & Practice"
                  fill
                  className="object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#4338ca]/85 px-2.5 py-0.5 text-[8.5px] font-bold tracking-wider text-white shadow-sm">
                  DATA & AI
                </span>
              </div>

              {/* Body */}
              <div className="space-y-1.5 p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#ede9fe] text-[#4f46e5]">
                    <Cpu size={11} />
                  </span>
                  <span className="text-[9.5px] font-bold tracking-wider text-[#4f46e5]">
                    MACHINE LEARNING · ML 401
                  </span>
                </div>

                <h3 className="text-[13.5px] font-bold leading-snug text-[#172115]">
                  Machine Learning — Foundations & Practice
                </h3>

                <p className="line-clamp-2 text-[10.5px] leading-relaxed text-[#616d5c]">
                  Supervised & unsupervised learning, model evaluation, Python scikit-learn & real datasets.
                </p>

                <div className="flex items-center justify-between pt-1 text-[9.5px] text-[#616d5c]">
                  <span>Dr. Priya Nair · 14 live lessons</span>
                  <span className="rounded-full bg-[#ede9fe] px-2 py-0.5 text-[9px] font-semibold text-[#6d28d9]">
                    Advanced
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 pt-0">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#d2dacb] py-2 text-[11px] font-bold text-[#172115] transition hover:border-[#172115] hover:bg-[#f6f8f3]"
              >
                <span>View course</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. REMINDERS SECTION                                      */}
      {/* ========================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-[#172115]">
            Reminders
          </h2>
          <span className="text-[11px] font-medium text-[#707c6c]">3 reminders</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* REMINDER 1: Django */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#d2e3ca] bg-[#edf4e8] px-2 py-0.5 text-[9px] font-bold text-[#2c5222]">
                    DJANGO
                  </span>
                  <span className="text-[11px] text-[#6e7b69]">Daniel Brooks</span>
                </div>
                <span className="rounded-full border border-[#c6e4bf] bg-[#eaf4e6] px-2.5 py-0.5 text-[9.5px] font-medium text-[#2c6e21]">
                  Next live lesson
                </span>
              </div>

              <h3 className="text-xs font-bold text-[#172115] pt-1">
                REST APIs with Django REST Framework
              </h3>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-[11px] text-[#6e7b69]">
                Wed, 7 Oct · 10:00–11:30 BST
              </span>
              <button
                type="button"
                className="rounded-lg bg-[#23351f] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#182615]"
              >
                View lesson
              </button>
            </div>
          </div>

          {/* REMINDER 2: Mathematics */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#ebdcc7] bg-[#fbf7f0] px-2 py-0.5 text-[9px] font-bold text-[#715428]">
                    MATHEMATICS
                  </span>
                  <span className="text-[11px] text-[#6e7b69]">Dr. Elena Ruiz</span>
                </div>
                <span className="rounded-full border border-[#fcd9ad] bg-[#fef4e6] px-2.5 py-0.5 text-[9.5px] font-medium text-[#b45309]">
                  Assignment deadline
                </span>
              </div>

              <h3 className="text-xs font-bold text-[#172115] pt-1">
                Linear functions practice
              </h3>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-[11px] text-[#6e7b69]">
                Thu, 8 Oct · 18:00 BST
              </span>
              <button
                type="button"
                className="rounded-lg border border-[#d0d7ca] bg-white px-3.5 py-1.5 text-[11px] font-semibold text-[#172115] shadow-sm transition hover:bg-[#f6f8f3]"
              >
                Continue work
              </button>
            </div>
          </div>

          {/* REMINDER 3: UI/UX Design */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#d2e4dd] bg-[#f1f6f4] px-2 py-0.5 text-[9px] font-bold text-[#2c5b4d]">
                    UI/UX DESIGN
                  </span>
                  <span className="text-[11px] text-[#6e7b69]">Amara Okafor</span>
                </div>
                <span className="rounded-full border border-[#c6e4bf] bg-[#eaf4e6] px-2.5 py-0.5 text-[9.5px] font-medium text-[#2c6e21]">
                  Available now
                </span>
              </div>

              <h3 className="text-xs font-bold text-[#172115] pt-1">
                Design systems fundamentals
              </h3>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-[11px] text-[#6e7b69]">
                Closes 6 Oct · 17:30 BST
              </span>
              <button
                type="button"
                className="rounded-lg bg-[#23351f] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#182615]"
              >
                Join exam
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}