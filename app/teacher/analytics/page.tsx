"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ArrowDownToLine, CalendarCheck2, Check, ClipboardCheck, HeartHandshake, Info, TrendingUp, BarChart3 } from "lucide-react";

const classes = [
  "Introduction to Python & Web Systems (PY101)",
  "Algebra I · Class A",
  "Algebra I · Class B",
  "Geometry · Class C"
];
const terms = ["Term 1 · Sep–Oct 2026", "Term 2 · Nov–Dec 2026", "Term 3 · Jan–Mar 2027"];
const scorePoints = [72, 76, 78, 80, 84.8];
const attendanceSessions = [
  { date: "02 Oct", value: 96.4 },
  { date: "05 Oct", value: 100 },
  { date: "07 Oct", value: 92.9 },
  { date: "09 Oct", value: 96.4 },
  { date: "16 Oct", value: 98.2 },
];
const topPerformers = [
  { initials: "AU", name: "Alice Umutoni", className: "Introduction to Python (PY101)", score: "100/100" },
  { initials: "OJ", name: "Oliver James", className: "Algebra I · Class A", score: "97/100" },
  { initials: "DP", name: "David Peter", className: "Algebra I · Class A", score: "95/100" },
  { initials: "LP", name: "Lilly Paul", className: "Algebra I · Class A", score: "92/100" },
];
const studentsNeedingSupport = [
  { initials: "MD", name: "Mia Davis", className: "Algebra I · Class A", score: "58/100" },
  { initials: "EB", name: "Ethan Brown", className: "Algebra I · Class A", score: "62/100" },
  { initials: "BK", name: "Bob Kagame", className: "Introduction to Python (PY101)", score: "70/100" },
];

function chartLine(values: number[], width: number, height: number) {
  const min = 50;
  const max = 100;
  return values.map((value, index) => {
    const x = 24 + (index * (width - 48)) / (values.length - 1);
    const y = height - 20 - ((value - min) / (max - min)) * (height - 40);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
}

export default function TeacherAnalyticsPage() {
  const [classFilter, setClassFilter] = useState(classes[0]);
  const [termFilter, setTermFilter] = useState(terms[0]);
  const line = chartLine(scorePoints, 440, 170);
  const area = `${line} L 416 150 L 24 150 Z`;

  function exportReport() {
    const rows = [
      ["Student", "Class", "Score"],
      ...topPerformers.map((student) => [student.name, student.className, student.score]),
      ...studentsNeedingSupport.map((student) => [student.name, student.className, student.score]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "teacher-analytics-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-4 pb-8 pt-1">
        {/* Header & Filter Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-md bg-[#edf2e8] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                Teacher Analytics
              </span>
              <span className="text-[12px] text-[#707c6c]">•</span>
              <span className="text-[12px] font-medium text-[#707c6c] dark:text-[#9aa592]">
                Performance &amp; Engagement
              </span>
            </div>
            <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em] text-[#172115] dark:text-[#ecf1ea]">
              Class Analytics &amp; Reports
            </h1>
            <p className="mt-1 text-[13px] text-[#556350] dark:text-[#9aa592]">
              Track student comprehension, attendance trends, quiz score trajectories, and identify students who need support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by class"
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="h-9 rounded-lg border border-[#e0e5dd] bg-white px-3 text-[12px] font-medium text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea]"
            >
              {classes.map((className) => <option key={className}>{className}</option>)}
            </select>
            <select
              aria-label="Filter by term"
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="h-9 rounded-lg border border-[#e0e5dd] bg-white px-3 text-[12px] font-medium text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea]"
            >
              {terms.map((term) => <option key={term}>{term}</option>)}
            </select>
            <button
              type="button"
              onClick={exportReport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e2e7dd] bg-white px-3 text-[12px] font-semibold text-[#35522b] shadow-sm hover:bg-[#f4f7f2] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#c5d6b8] dark:hover:bg-[#1c2919]"
            >
              <ArrowDownToLine size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Analytics summary">
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-[#687564] dark:text-[#a4af9e]">Average Class Score</p>
              <span className="grid size-8 place-items-center rounded-lg bg-[#edf2e8] text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                <TrendingUp size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">
              84.8<span className="text-[13px] font-semibold text-[#697764]">/100</span>
            </p>
            <p className="mt-2 text-[11px] text-[#788173] dark:text-[#9aa592]">
              <span className="font-semibold text-[#35522b] dark:text-[#a1b894]">↑ +12.8 pts</span> since baseline
            </p>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-[#687564] dark:text-[#a4af9e]">Latest Attendance</p>
              <span className="grid size-8 place-items-center rounded-lg bg-[#e0f2fe] text-[#0369a1] dark:bg-[#1e293b] dark:text-[#38bdf8]">
                <CalendarCheck2 size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">98.2%</p>
            <p className="mt-2 text-[11px] text-[#788173] dark:text-[#9aa592]">
              16 Oct · 28 present + 0 absent
            </p>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-[#687564] dark:text-[#a4af9e]">Completion Rate</p>
              <span className="grid size-8 place-items-center rounded-lg bg-[#f3e8ff] text-[#7e22ce] dark:bg-[#2e1065] dark:text-[#c084fc]">
                <ClipboardCheck size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">100%</p>
            <p className="mt-2 text-[11px] text-[#788173] dark:text-[#9aa592]">
              Python Core Quiz · 28/28 submitted
            </p>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-[#687564] dark:text-[#a4af9e]">Need Support</p>
              <span className="grid size-8 place-items-center rounded-lg bg-[#fef3c7] text-[#b45309] dark:bg-[#3d2605] dark:text-[#fde68a]">
                <HeartHandshake size={16} />
              </span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">3</p>
            <p className="mt-2 text-[11px] text-[#788173] dark:text-[#9aa592]">
              Scores below 70-point target
            </p>
          </article>
        </section>

        {/* Chart Sections */}
        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_0.9fr]">
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="class-performance-title">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 id="class-performance-title" className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                  Class Performance Trajectory
                </h2>
                <p className="mt-0.5 text-[11px] text-[#7d8979] dark:text-[#9aa592]">
                  Average assessment score over the last five live learning milestones
                </p>
              </div>
              <span className="rounded-full bg-[#edf2e8] px-2.5 py-1 text-[11px] font-semibold text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                +12.8 pts
              </span>
            </div>
            <div className="h-[160px] w-full">
              <svg viewBox="0 0 440 170" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Class average score trend, increasing from 72 to 84.8 out of 100">
                {[20, 55, 90, 125, 150].map((y, index) => (
                  <g key={y}>
                    <line x1="24" y1={y} x2="416" y2={y} stroke="#edf0e9" strokeWidth="1" />
                    <text x="1" y={y + 3} fill="#81907d" fontSize="8">{100 - index * 10}</text>
                  </g>
                ))}
                <path d={area} fill="#e6efdf" />
                <path d={line} fill="none" stroke="#294825" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {scorePoints.map((score, index) => {
                  const x = 24 + (index * 392) / (scorePoints.length - 1);
                  const y = 150 - ((score - 50) / 50) * 130;
                  return <circle key={index} cx={x} cy={y} r="3" fill="#294825" />;
                })}
              </svg>
            </div>
            <div className="mt-1.5 grid grid-cols-5 text-[10px] font-medium text-[#788173] dark:text-[#9aa592]">
              {["25 Sep", "02 Oct", "05 Oct", "07 Oct", "16 Oct"].map((date) => <span key={date}>{date}</span>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#677362] dark:text-[#a8b39f]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-[#294825]" />Class average
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-3 rounded-full bg-[#afc5a5]" />Target benchmark · 70
              </span>
            </div>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="attendance-session-title">
            <div className="mb-3">
              <h2 id="attendance-session-title" className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                Attendance by Session
              </h2>
              <p className="mt-0.5 text-[11px] text-[#7d8979] dark:text-[#9aa592]">
                Present and punctual student attendance rate
              </p>
            </div>
            <div className="flex h-[160px] items-end justify-around gap-2 px-1">
              {attendanceSessions.map((session, index) => (
                <div key={session.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[10px] font-semibold text-[#4a5d42] dark:text-[#c5d6b8]">{session.value}%</span>
                  <div className={`w-full max-w-[26px] rounded-t-md transition-all ${index === attendanceSessions.length - 1 ? "bg-[#2d4827]" : "bg-[#b8caae] dark:bg-[#526b48]"}`} style={{ height: `${session.value}%` }} />
                  <span className="text-[10px] text-[#788173] dark:text-[#9aa592]">{session.date}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#788173] dark:text-[#9aa592]">
              Latest session · 28 of 28 attended (98.2%)
            </p>
          </article>
        </section>

        {/* Top Performers & Extra Support Columns */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="top-performers-title">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 id="top-performers-title" className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                  Top Performers
                </h2>
                <p className="mt-0.5 text-[11px] text-[#7d8979] dark:text-[#9aa592]">
                  Python Core &amp; Web Systems Quiz · 16 Oct
                </p>
              </div>
              <span className="rounded-full bg-[#edf2e8] px-2.5 py-1 text-[11px] font-semibold text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                Above 90%
              </span>
            </div>
            <div className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">
              {topPerformers.map((student) => (
                <div key={student.name} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf2e8] text-[11px] font-bold text-[#35522b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                    {student.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                    <p className="truncate text-[10px] text-[#707c6c] dark:text-[#9aa592]">{student.className}</p>
                  </div>
                  <span className="text-[13px] font-bold text-[#172115] dark:text-[#ecf1ea]">{student.score}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="support-title">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 id="support-title" className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">
                  A Little Extra Support
                </h2>
                <p className="mt-0.5 text-[11px] text-[#7d8979] dark:text-[#9aa592]">
                  Students needing review or 1-on-1 coaching
                </p>
              </div>
              <span className="rounded-full bg-[#fff0e2] px-2.5 py-1 text-[11px] font-semibold text-[#b96d27]">
                Below 70%
              </span>
            </div>
            <div className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">
              {studentsNeedingSupport.map((student) => (
                <div key={student.name} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fff0e2] text-[11px] font-bold text-[#b96d27]">
                    {student.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                    <p className="truncate text-[10px] text-[#707c6c] dark:text-[#9aa592]">{student.className}</p>
                  </div>
                  <span className="text-[13px] font-bold text-[#b96d27]">{student.score}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Insight Card */}
        <aside className="flex items-start gap-3 rounded-xl border border-[#d6e3cf] bg-[#edf2e8] p-4 text-[#35522b] dark:border-[#212f1f] dark:bg-[#182316] dark:text-[#c5d6b8]">
          <Info size={18} className="mt-0.5 shrink-0" />
          <div className="text-[12px] leading-relaxed">
            <strong className="font-bold">Steady progress, one lesson at a time:</strong> The class average is up +12.8 points. Plan guided practice on mutable dictionary methods and test coverage during next Wednesday&apos;s virtual lab session.
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}