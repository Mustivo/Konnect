"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ArrowDownToLine, CalendarCheck2, Check, ClipboardCheck, HeartHandshake, Info, TrendingUp } from "lucide-react";

const classes = ["Algebra I · Class A", "Algebra I · Class B", "Geometry · Class C"];
const terms = ["Term 1 · Sep–Oct 2026", "Term 2 · Nov–Dec 2026", "Term 3 · Jan–Mar 2027"];
const scorePoints = [72, 76, 78, 80, 83.4];
const attendanceSessions = [
  { date: "02 Oct", value: 96.4 },
  { date: "05 Oct", value: 100 },
  { date: "07 Oct", value: 92.9 },
  { date: "09 Oct", value: 96.4 },
  { date: "12 Oct", value: 92.9 },
];
const topPerformers = [
  { initials: "OJ", name: "Oliver James", className: "Algebra I · Class A", score: "97/100" },
  { initials: "DP", name: "David Peter", className: "Algebra I · Class A", score: "95/100" },
  { initials: "LP", name: "Lilly Paul", className: "Algebra I · Class A", score: "92/100" },
];
const studentsNeedingSupport = [
  { initials: "MD", name: "Mia Davis", className: "Algebra I · Class A", score: "58/100" },
  { initials: "EB", name: "Ethan Brown", className: "Algebra I · Class A", score: "62/100" },
  { initials: "LM", name: "Lucas Martin", className: "Algebra I · Class A", score: "66/100" },
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
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            <label className="sr-only" htmlFor="analytics-class">Class</label>
            <select id="analytics-class" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-8 min-w-[150px] flex-1 rounded-md border border-[#e0e5dd] bg-white px-2.5 text-[8px] text-[#3c4638] outline-none focus:border-[#8ca47e] dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]">{classes.map((className) => <option key={className}>{className}</option>)}</select>
            <label className="sr-only" htmlFor="analytics-term">Term</label>
            <select id="analytics-term" value={termFilter} onChange={(event) => setTermFilter(event.target.value)} className="h-8 min-w-[150px] flex-1 rounded-md border border-[#e0e5dd] bg-white px-2.5 text-[8px] text-[#3c4638] outline-none focus:border-[#8ca47e] dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]">{terms.map((term) => <option key={term}>{term}</option>)}</select>
          </div>
          <button type="button" onClick={exportReport} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-[8px] font-semibold text-[#405b35] hover:bg-[#eaf0e4] dark:text-[#c5d6b8] dark:hover:bg-[#20271e]"><ArrowDownToLine size={12} /> Export report</button>
        </div>

        <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4" aria-label="Analytics summary">
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]"><div className="flex items-center justify-between"><p className="text-[8px] font-medium text-[#687564] dark:text-[#9aa592]">Average score</p><span className="grid size-6 place-items-center rounded-full bg-[#e7f0e2] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]"><TrendingUp size={12} /></span></div><p className="mt-2 text-[20px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">83.4<span className="text-[10px] font-semibold text-[#697764]">/100</span></p><p className="mt-2 text-[7px] text-[#788173] dark:text-[#9aa592]">↑ 11.4 points since diagnostic</p></article>
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]"><div className="flex items-center justify-between"><p className="text-[8px] font-medium text-[#687564] dark:text-[#9aa592]">Latest attendance</p><span className="grid size-6 place-items-center rounded-full bg-[#e5f0ff] text-[#3475b9]"><CalendarCheck2 size={12} /></span></div><p className="mt-2 text-[20px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">92.9%</p><p className="mt-2 text-[7px] text-[#788173] dark:text-[#9aa592]">12 Oct · 24 present +2 late</p></article>
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]"><div className="flex items-center justify-between"><p className="text-[8px] font-medium text-[#687564] dark:text-[#9aa592]">Completion rate</p><span className="grid size-6 place-items-center rounded-full bg-[#e7f0e2] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]"><ClipboardCheck size={12} /></span></div><p className="mt-2 text-[20px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">100%</p><p className="mt-2 text-[7px] text-[#788173] dark:text-[#9aa592]">Linear Equations Quiz · 28/28</p></article>
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]"><div className="flex items-center justify-between"><p className="text-[8px] font-medium text-[#687564] dark:text-[#9aa592]">Need support</p><span className="grid size-6 place-items-center rounded-full bg-[#fff0e2] text-[#b96d27]"><HeartHandshake size={12} /></span></div><p className="mt-2 text-[20px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">3</p><p className="mt-2 text-[7px] text-[#788173] dark:text-[#9aa592]">Scores below the 70-point target</p></article>
        </section>

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_0.9fr]">
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="class-performance-title">
            <div className="mb-2 flex items-start justify-between gap-2"><div><h2 id="class-performance-title" className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">Class performance</h2><p className="text-[7px] text-[#7d8979] dark:text-[#9aa592]">Average score across the last five assessments</p></div><span className="rounded-full bg-[#e7f0e2] px-2 py-1 text-[7px] font-semibold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">+11.4 pts</span></div>
            <div className="h-[150px] w-full">
              <svg viewBox="0 0 440 170" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Class average score trend, increasing from 72 to 83.4 out of 100">
                {[20, 55, 90, 125, 150].map((y, index) => <g key={y}><line x1="24" y1={y} x2="416" y2={y} stroke="#edf0e9" strokeWidth="1" /><text x="1" y={y + 3} fill="#81907d" fontSize="7">{100 - index * 10}</text></g>)}
                <path d={area} fill="#e6efdf" />
                <path d={line} fill="none" stroke="#294825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {scorePoints.map((score, index) => { const x = 24 + (index * 392) / (scorePoints.length - 1); const y = 150 - ((score - 50) / 50) * 130; return <circle key={index} cx={x} cy={y} r="2.5" fill="#294825" />; })}
              </svg>
            </div>
            <div className="mt-1 grid grid-cols-5 text-[6px] text-[#788173] dark:text-[#9aa592]">{["25 Sep", "02 Oct", "05 Oct", "07 Oct", "09 Oct"].map((date) => <span key={date}>{date}</span>)}</div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[7px] text-[#677362] dark:text-[#a8b39f]"><span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-[#294825]" />Class average</span><span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-[#afc5a5]" />Learning target · 70</span></div>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="attendance-session-title">
            <div className="mb-2"><h2 id="attendance-session-title" className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">Attendance by session</h2><p className="text-[7px] text-[#7d8979] dark:text-[#9aa592]">Present and late students combined</p></div>
            <div className="flex h-[150px] items-end justify-around gap-2 px-1">
              {attendanceSessions.map((session, index) => <div key={session.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"><span className="text-[6px] font-semibold text-[#4a5d42] dark:text-[#c5d6b8]">{session.value}%</span><div className={`w-full max-w-[24px] rounded-t-md ${index === attendanceSessions.length - 1 ? "bg-[#2d4827]" : "bg-[#b8caae] dark:bg-[#526b48]"}`} style={{ height: `${session.value}%` }} /><span className="text-[6px] text-[#788173] dark:text-[#9aa592]">{session.date}</span></div>)}
            </div>
            <p className="mt-3 text-[7px] text-[#788173] dark:text-[#9aa592]">Latest session · 26 of 28 attended</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="top-performers-title">
            <div className="mb-2 flex items-start justify-between gap-2"><div><h2 id="top-performers-title" className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">Top performers</h2><p className="text-[7px] text-[#7d8979] dark:text-[#9aa592]">Linear Equations Quiz · 09 Oct</p></div><span className="rounded-full bg-[#e7f0e2] px-2 py-1 text-[7px] font-semibold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">Above 90</span></div>
            <div className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">{topPerformers.map((student) => <div key={student.name} className="flex items-center gap-2 py-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[6px] font-bold text-[#405c35]">{student.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-[8px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{student.name}</p><p className="truncate text-[6px] text-[#858e7d] dark:text-[#9ca797]">{student.className}</p></div><span className="text-[9px] font-bold text-[#172115] dark:text-[#ecf1ea]">{student.score}</span></div>)}</div>
            <button type="button" className="mt-2 rounded-full bg-[#f0f3ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">View all students</button>
          </article>

          <article className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]" aria-labelledby="support-title">
            <div className="mb-2 flex items-start justify-between gap-2"><div><h2 id="support-title" className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">A little extra support</h2><p className="text-[7px] text-[#7d8979] dark:text-[#9aa592]">Linear Equations Quiz · 09 Oct</p></div><span className="rounded-full bg-[#fff0e2] px-2 py-1 text-[7px] font-semibold text-[#b96d27]">Below 70</span></div>
            <div className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">{studentsNeedingSupport.map((student) => <div key={student.name} className="flex items-center gap-2 py-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[6px] font-bold text-[#405c35]">{student.initials}</span><div className="min-w-0 flex-1"><p className="truncate text-[8px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{student.name}</p><p className="truncate text-[6px] text-[#858e7d] dark:text-[#9ca797]">{student.className}</p></div><span className="text-[9px] font-bold text-[#172115] dark:text-[#ecf1ea]">{student.score}</span></div>)}</div>
            <button type="button" className="mt-2 rounded-full bg-[#f0f3ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">Plan follow-up</button>
          </article>
        </section>

        <aside className="flex items-start gap-2 rounded-lg bg-[#e7f0e2] p-3 text-[#43543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]"><Info size={12} className="mt-0.5 shrink-0" /><p className="text-[7px] leading-relaxed"><strong>Steady progress, one lesson at a time</strong><br />The class average is improving. Focus the next guided practice on distributing brackets and checking solutions with your three students below target.</p></aside>
      </div>
    </DashboardShell>
  );
}