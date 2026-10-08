"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  CalendarX2,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

type Status = "Attended" | "Late" | "Missed";

const classes = [
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
  { date: "6 Oct 2026", lesson: "Design systems & component libraries", course: "UI/UX Design", time: "14:00–15:30", status: "Attended", detail: "90 / 90 min" },
  { date: "5 Oct 2026", lesson: "Hooks & state management", course: "React.js", time: "09:00–10:30", status: "Attended", detail: "90 / 90 min" },
  { date: "2 Oct 2026", lesson: "Linear functions in everyday life", course: "Mathematics", time: "11:00–12:30", status: "Attended", detail: "90 / 90 min" },
  { date: "30 Sep 2026", lesson: "Models, migrations & relationships", course: "Django", time: "10:00–11:30", status: "Attended", detail: "90 / 90 min" },
  { date: "29 Sep 2026", lesson: "Interactive prototyping in Figma", course: "UI/UX Design", time: "14:00–15:30", status: "Attended", detail: "90 / 90 min" },
  { date: "28 Sep 2026", lesson: "Component composition", course: "React.js", time: "09:00–10:30", status: "Late", detail: "Joined 09:08" },
  { date: "23 Sep 2026", lesson: "Views & URL routing", course: "Django", time: "10:00–11:30", status: "Missed", detail: "No attendance" },
];

const pill: Record<Status, string> = {
  Attended: "bg-[#eaf0e3] text-[#2f4a2a]",
  Late: "bg-[#faf0de] text-[#9a6a22]",
  Missed: "bg-[#fbe9e7] text-[#b4372b]",
};

const pct = (a: number, t: number) =>
  `${parseFloat(((a / t) * 100).toFixed(1))}%`;

export default function AttendancePage() {
  return (
    <div>
      {/* Heading */}
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-700">
          Your learning space
        </p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-gray-900">
          Attendance
        </h1>
        <p className="mt-0.5 text-[11px] text-gray-600">
          Every lesson counts. Here&apos;s how you&apos;re showing up across your
          classes.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-[15px] grid grid-cols-4 gap-4">
        <div className="rounded-[10px] bg-[#283821] p-[15px] text-white">
          <div className="flex h-4 items-center justify-between">
            <p className="text-[11px] text-white/85">Overall attendance</p>
            <BarChart3 size={14} className="text-white/80" />
          </div>
          <p className="mt-2 text-[26px] font-semibold leading-8">96%</p>
          <p className="mt-2 text-[10px] leading-[14px] text-white/75">
            24 of 25 sessions attended
          </p>
        </div>

        <div className="rounded-[10px] border border-[#edefea] bg-white p-[15px]">
          <div className="flex h-4 items-center justify-between">
            <p className="text-[11px] text-gray-700">Attended on time</p>
            <CheckCircle2 size={14} className="text-gray-800" />
          </div>
          <p className="mt-2 text-[26px] font-semibold leading-8 text-gray-900">
            23
          </p>
          <p className="mt-2 text-[10px] leading-[14px] text-gray-500">
            Plus 1 late arrival counted as attended
          </p>
        </div>

        <div className="rounded-[10px] border border-[#edefea] bg-white p-[15px]">
          <div className="flex h-4 items-center justify-between">
            <p className="text-[11px] text-gray-700">Late arrivals</p>
            <Clock3 size={14} className="text-gray-800" />
          </div>
          <p className="mt-2 text-[26px] font-semibold leading-8 text-gray-900">
            1
          </p>
          <p className="mt-2 text-[10px] leading-[14px] text-gray-500">
            React.js · 28 September
          </p>
        </div>

        <div className="rounded-[10px] border border-[#edefea] bg-white p-[15px]">
          <div className="flex h-4 items-center justify-between">
            <p className="text-[11px] text-gray-700">Missed sessions</p>
            <CalendarX2 size={14} className="text-gray-800" />
          </div>
          <p className="mt-2 text-[26px] font-semibold leading-8 text-gray-900">
            1
          </p>
          <p className="mt-2 text-[10px] leading-[14px] text-gray-500">
            Django · 23 September · 0 excused
          </p>
        </div>
      </div>

      {/* By class + legend */}
      <div className="mt-4 grid grid-cols-[1fr_350px] items-start gap-5">
        <section className="rounded-[10px] border border-[#edefea] bg-white px-[15px] pb-[10px] pt-4">
          <h2 className="text-[15px] font-semibold leading-5 text-gray-900">
            Attendance by class
          </h2>
          <p className="mt-1.5 text-[10px] text-gray-500">
            1 Sep–6 Oct 2026 · Late arrivals are included in attended totals.
          </p>

          <div className="mt-2.5">
            {classes.map((c) => (
              <div
                key={c.name}
                className="grid h-[26px] grid-cols-[113px_357px_64px_1fr] items-center"
              >
                <span className="text-[11px] font-semibold text-gray-900">
                  {c.name}
                </span>
                <div className="h-[5px] rounded-full bg-[#f2f3ed]">
                  <div
                    className="h-[5px] rounded-full"
                    style={{
                      width: `${(c.attended / c.total) * 100}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
                <span className="pl-3 text-[10px] text-gray-500">
                  {c.attended} / {c.total}
                </span>
                <span className="pl-3 text-[11px] font-semibold text-gray-900">
                  {pct(c.attended, c.total)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[10px] border border-[#dfe4d9] bg-[#eaf0e3] px-[15px] pb-3 pt-4">
          <h2 className="text-[15px] font-semibold leading-5 text-gray-900">
            Understanding your record
          </h2>

          <div className="mt-3 space-y-[7px] text-[10px] leading-[14px] text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Attended</span> —
              Present for the lesson, including late arrivals.
            </p>
            <p>
              <span className="font-medium text-gray-900">Late</span> — Joined
              after the scheduled start time.
            </p>
            <p>
              <span className="font-medium text-gray-900">Missed / excused</span>{" "}
              — Not present; an excused absence is noted separately.
            </p>
          </div>

          <p className="mt-[18px] text-[8.5px] text-gray-500">
            Something doesn&apos;t look right? Ask your teacher to review the
            session record.
          </p>
        </section>
      </div>

      {/* Session history */}
      <section className="mt-4 rounded-[10px] border border-[#edefea] bg-white p-[15px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Session history
          </h2>

          <div className="flex items-center gap-[7px]">
            {["All classes", "1 Sep–6 Oct 2026", "All statuses"].map((f) => (
              <button
                key={f}
                className="flex h-7 items-center gap-3 rounded-md border border-[#dfe4d9] bg-white px-3 text-[10px] font-medium text-gray-800"
              >
                {f}
                <ChevronDown size={12} className="text-gray-700" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-[11px]">
          {/* Header */}
          <div className="grid h-[25px] grid-cols-[102px_464px_122px_122px_1fr] items-center rounded-[3px] bg-[#f2f3ed] px-2.5 pl-2.5 text-[8.5px] font-medium uppercase tracking-wide text-gray-600">
            <span>Date</span>
            <span className="pl-[0px]">Class &amp; Lesson</span>
            <span>Time · BST</span>
            <span>Status</span>
            <span>Detail</span>
          </div>

          {/* Rows */}
          {sessions.map((s, i) => (
            <div
              key={s.date + s.lesson}
              className={`grid h-[38.6px] grid-cols-[102px_464px_122px_122px_1fr] items-center border-b border-[#f0f2ec] px-2.5 hover:bg-[#eaf0e3] ${
                i === 0 ? "bg-[#eaf0e3]" : ""
              }`}
            >
              <span className="text-[10px] text-gray-700">{s.date}</span>

              <div className="leading-none">
                <p className="text-[10.5px] font-semibold text-gray-900">
                  {s.lesson}
                </p>
                <p className="mt-[5px] text-[8.5px] text-gray-500">
                  {s.course}
                </p>
              </div>

              <span className="text-[10px] text-gray-700">{s.time}</span>

              <span>
                <span
                  className={`inline-flex h-5 items-center rounded-full px-2.5 text-[9px] font-medium ${pill[s.status]}`}
                >
                  {s.status}
                </span>
              </span>

              <span className="text-[10px] text-gray-700">{s.detail}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between px-0">
          <p className="text-[9px] text-gray-500">
            Showing 7 recent sessions of 25 · Updated after today&apos;s session
          </p>
          <button className="flex items-center gap-1 text-[9.5px] font-semibold text-gray-900">
            View earlier sessions
            <ArrowRight size={10} />
          </button>
        </div>
      </section>
    </div>
  );
}