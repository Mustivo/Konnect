"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  CalendarX2,
  ChevronDown,
  ArrowRight,
  Filter
} from "lucide-react";

type Status = "Attended" | "Late" | "Missed";

const classes = [
  { name: "Introduction to Python (PY101)", attended: 7, total: 7, color: "#35522b" },
  { name: "React.js", attended: 7, total: 7, color: "#0ea5e9" },
  { name: "UI/UX Design", attended: 6, total: 6, color: "#7c3aed" },
  { name: "Django", attended: 5, total: 6, color: "#16a34a" },
  { name: "Mathematics", attended: 6, total: 6, color: "#ea580c" },
];

const sessions: {
  date: string;
  lesson: string;
  course: string;
  time: string;
  status: Status;
  detail: string;
}[] = [
  { date: "16 Oct 2026", lesson: "Live Interactive Python Syntax & Types", course: "Introduction to Python (PY101)", time: "09:00–10:30", status: "Attended", detail: "90 / 90 min" },
  { date: "6 Oct 2026", lesson: "Design systems & component libraries", course: "UI/UX Design", time: "14:00–15:30", status: "Attended", detail: "90 / 90 min" },
  { date: "5 Oct 2026", lesson: "Hooks & state management", course: "React.js", time: "09:00–10:30", status: "Attended", detail: "90 / 90 min" },
  { date: "2 Oct 2026", lesson: "Linear functions in everyday life", course: "Mathematics", time: "11:00–12:30", status: "Attended", detail: "90 / 90 min" },
  { date: "30 Sep 2026", lesson: "Models, migrations & relationships", course: "Django", time: "10:00–11:30", status: "Attended", detail: "90 / 90 min" },
  { date: "29 Sep 2026", lesson: "Interactive prototyping in Figma", course: "UI/UX Design", time: "14:00–15:30", status: "Attended", detail: "90 / 90 min" },
  { date: "28 Sep 2026", lesson: "Component composition", course: "React.js", time: "09:00–10:30", status: "Late", detail: "Joined 09:08" },
  { date: "23 Sep 2026", lesson: "Views & URL routing", course: "Django", time: "10:00–11:30", status: "Missed", detail: "No attendance" },
];

const pill: Record<Status, string> = {
  Attended: "bg-[#eaf0e3] text-[#2f4a2a] dark:bg-[#20271e] dark:text-[#c5d6b8]",
  Late: "bg-[#faf0de] text-[#9a6a22] dark:bg-[#38260b] dark:text-[#fde68a]",
  Missed: "bg-[#fbe9e7] text-[#b4372b] dark:bg-[#431407] dark:text-[#fca5a5]",
};

const pct = (a: number, t: number) =>
  `${parseFloat(((a / t) * 100).toFixed(1))}%`;

export default function AttendancePage() {
  const [classFilter, setClassFilter] = useState("All classes");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const filteredSessions = sessions.filter((s) => {
    const matchClass = classFilter === "All classes" || s.course.includes(classFilter);
    const matchStatus = statusFilter === "All statuses" || s.status === statusFilter;
    return matchClass && matchStatus;
  });

  return (
    <DashboardShell role="learner">
      <div className="space-y-4 pb-8 pt-1">
        {/* Heading */}
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#556350] dark:text-[#a4af9e]">
            Your learning space
          </p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-[#172115] dark:text-[#ecf1ea]">
            Attendance
          </h1>
          <p className="mt-0.5 text-[11px] text-[#556350] dark:text-[#9aa592]">
            Every lesson counts. Here&apos;s how you&apos;re showing up across your classes.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <div className="rounded-[10px] bg-[#283821] p-[15px] text-white shadow-sm dark:bg-[#182514]">
            <div className="flex h-4 items-center justify-between">
              <p className="text-[11px] text-white/85">Overall attendance</p>
              <BarChart3 size={14} className="text-white/80" />
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-8">96.8%</p>
            <p className="mt-2 text-[10px] leading-[14px] text-white/75">
              31 of 32 sessions attended
            </p>
          </div>

          <div className="rounded-[10px] border border-[#edefea] bg-white p-[15px] shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex h-4 items-center justify-between">
              <p className="text-[11px] text-[#556350] dark:text-[#a4af9e]">Attended on time</p>
              <CheckCircle2 size={14} className="text-[#35522b] dark:text-[#c5d6b8]" />
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-8 text-[#172115] dark:text-[#ecf1ea]">
              30
            </p>
            <p className="mt-2 text-[10px] leading-[14px] text-[#707c6c] dark:text-[#9aa592]">
              Plus 1 late arrival counted as attended
            </p>
          </div>

          <div className="rounded-[10px] border border-[#edefea] bg-white p-[15px] shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex h-4 items-center justify-between">
              <p className="text-[11px] text-[#556350] dark:text-[#a4af9e]">Late arrivals</p>
              <Clock3 size={14} className="text-[#9a6a22] dark:text-[#fde68a]" />
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-8 text-[#172115] dark:text-[#ecf1ea]">
              1
            </p>
            <p className="mt-2 text-[10px] leading-[14px] text-[#707c6c] dark:text-[#9aa592]">
              React.js · 28 September
            </p>
          </div>

          <div className="rounded-[10px] border border-[#edefea] bg-white p-[15px] shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex h-4 items-center justify-between">
              <p className="text-[11px] text-[#556350] dark:text-[#a4af9e]">Missed sessions</p>
              <CalendarX2 size={14} className="text-[#b4372b] dark:text-[#fca5a5]" />
            </div>
            <p className="mt-2 text-[26px] font-semibold leading-8 text-[#172115] dark:text-[#ecf1ea]">
              1
            </p>
            <p className="mt-2 text-[10px] leading-[14px] text-[#707c6c] dark:text-[#9aa592]">
              Django · 23 September · 0 excused
            </p>
          </div>
        </div>

        {/* By class + legend */}
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_350px] xl:gap-5">
          <section className="min-w-0 rounded-[10px] border border-[#edefea] bg-white px-[15px] pb-[15px] pt-4 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]">
            <h2 className="text-[15px] font-semibold leading-5 text-[#172115] dark:text-[#ecf1ea]">
              Attendance by class
            </h2>
            <p className="mt-1 text-[10px] text-[#707c6c] dark:text-[#9aa592]">
              1 Sep–16 Oct 2026 · Late arrivals are included in attended totals.
            </p>

            <div className="mt-3 space-y-2">
              {classes.map((c) => (
                <div
                  key={c.name}
                  className="grid h-[28px] grid-cols-[minmax(90px,1.2fr)_minmax(60px,1.5fr)_auto_auto] items-center gap-x-2"
                >
                  <span className="truncate text-[11px] font-semibold text-[#172115] dark:text-[#ecf1ea]">
                    {c.name}
                  </span>
                  <div className="h-[6px] w-full rounded-full bg-[#f2f3ed] dark:bg-[#20271e]">
                    <div
                      className="h-[6px] rounded-full transition-all"
                      style={{
                        width: `${(c.attended / c.total) * 100}%`,
                        backgroundColor: c.color,
                      }}
                    />
                  </div>
                  <span className="pl-1 text-[10px] text-[#707c6c] dark:text-[#9aa592]">
                    {c.attended} / {c.total}
                  </span>
                  <span className="pl-1 text-[11px] font-semibold text-[#172115] dark:text-[#ecf1ea]">
                    {pct(c.attended, c.total)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="min-w-0 rounded-[10px] border border-[#dfe4d9] bg-[#eaf0e3] px-[15px] pb-4 pt-4 dark:border-[#212f1f] dark:bg-[#192418]">
            <h2 className="text-[15px] font-semibold leading-5 text-[#172115] dark:text-[#ecf1ea]">
              Understanding your record
            </h2>

            <div className="mt-3 space-y-[8px] text-[10px] leading-[15px] text-[#41533e] dark:text-[#b0bdae]">
              <p>
                <span className="font-semibold text-[#172115] dark:text-[#ecf1ea]">Attended</span> —
                Present for the lesson, including late arrivals.
              </p>
              <p>
                <span className="font-semibold text-[#172115] dark:text-[#ecf1ea]">Late</span> — Joined
                after the scheduled start time.
              </p>
              <p>
                <span className="font-semibold text-[#172115] dark:text-[#ecf1ea]">Missed / excused</span>{" "}
                — Not present; an excused absence is noted separately.
              </p>
            </div>

            <p className="mt-[18px] text-[9px] text-[#707c6c] dark:text-[#9aa592]">
              Something doesn&apos;t look right? Ask your teacher to review the session record.
            </p>
          </section>
        </div>

        {/* Session history */}
        <section className="min-w-0 rounded-[10px] border border-[#edefea] bg-white p-[15px] shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#172115] dark:text-[#ecf1ea]">
                Session history
              </h2>
              <p className="text-[10px] text-[#707c6c] dark:text-[#9aa592]">
                Detailed breakdown of your attended virtual lectures
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-8 rounded-md border border-[#dfe4d9] bg-white px-2.5 text-[10px] font-medium text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea]"
              >
                <option value="All classes">All classes</option>
                <option value="Python">Introduction to Python</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="React.js">React.js</option>
                <option value="Django">Django</option>
                <option value="Mathematics">Mathematics</option>
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-[#dfe4d9] bg-white px-2.5 text-[10px] font-medium text-[#172115] outline-none focus:border-[#35522b] dark:border-[#212f1f] dark:bg-[#111910] dark:text-[#ecf1ea]"
              >
                <option value="All statuses">All statuses</option>
                <option value="Attended">Attended</option>
                <option value="Late">Late</option>
                <option value="Missed">Missed</option>
              </select>
            </div>
          </div>

          <div className="mt-[14px] hidden xl:block">
            {/* Header */}
            <div className="grid h-[28px] grid-cols-[110px_460px_130px_120px_1fr] items-center rounded-[4px] bg-[#f2f3ed] px-3 text-[9px] font-bold uppercase tracking-wider text-[#556350] dark:bg-[#192418] dark:text-[#a4af9e]">
              <span>Date</span>
              <span>Class &amp; Lesson</span>
              <span>Time · BST</span>
              <span>Status</span>
              <span>Detail</span>
            </div>

            {/* Rows */}
            {filteredSessions.map((s, i) => (
              <div
                key={s.date + s.lesson}
                className={`grid h-[42px] grid-cols-[110px_460px_130px_120px_1fr] items-center border-b border-[#f0f2ec] px-3 transition-colors hover:bg-[#f6f9f3] dark:border-[#212f1f] dark:hover:bg-[#192517] ${
                  i === 0 ? "bg-[#f9fbf7] dark:bg-[#162015]" : ""
                }`}
              >
                <span className="text-[10px] font-medium text-[#556350] dark:text-[#a4af9e]">{s.date}</span>

                <div>
                  <p className="text-[11px] font-semibold text-[#172115] dark:text-[#ecf1ea]">
                    {s.lesson}
                  </p>
                  <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">
                    {s.course}
                  </p>
                </div>

                <span className="text-[10px] text-[#556350] dark:text-[#a4af9e]">{s.time}</span>

                <div>
                  <span
                    className={`inline-flex h-5 items-center rounded-full px-2.5 text-[9px] font-semibold ${pill[s.status]}`}
                  >
                    {s.status}
                  </span>
                </div>

                <span className="text-[10px] text-[#556350] dark:text-[#a4af9e]">{s.detail}</span>
              </div>
            ))}
          </div>

          <div className="mt-[11px] space-y-2 xl:hidden">
            {filteredSessions.map((s) => (
              <article
                key={s.date + s.lesson}
                className="rounded-md border border-[#f0f2ec] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">{s.date} · {s.time} BST</p>
                    <h3 className="mt-1 text-[11px] font-semibold leading-snug text-[#172115] dark:text-[#ecf1ea]">{s.lesson}</h3>
                    <p className="mt-0.5 text-[9px] text-[#707c6c] dark:text-[#9aa592]">{s.course}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[8.5px] font-semibold ${pill[s.status]}`}>
                    {s.status}
                  </span>
                </div>
                <p className="mt-2 border-t border-[#f0f2ec] pt-2 text-[9px] text-[#556350] dark:border-[#212f1f] dark:text-[#a4af9e]">{s.detail}</p>
              </article>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">
              Showing {filteredSessions.length} sessions · Updated after today&apos;s virtual lecture
            </p>
            <button type="button" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#35522b] hover:underline dark:text-[#c5d6b8]">
              View earlier archived sessions
              <ArrowRight size={11} />
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}