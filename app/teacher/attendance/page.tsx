"use client";

import { useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Info,
  MessageSquare,
  UserRound,
  X,
} from "lucide-react";

type AttendanceStatus = "Present" | "Late" | "Absent";
type AttendanceStudent = {
  id: string;
  name: string;
  joinedAt: string;
  status: AttendanceStatus;
};

const students: AttendanceStudent[] = [
  { id: "KA-001", name: "Oliver James", joinedAt: "08:56", status: "Present" },
  { id: "KA-002", name: "David Peter", joinedAt: "08:58", status: "Present" },
  { id: "KA-003", name: "Lilly Paul", joinedAt: "08:58", status: "Present" },
  { id: "KA-004", name: "Emma Wilson", joinedAt: "08:58", status: "Present" },
  { id: "KA-005", name: "Noah Williams", joinedAt: "09:12", status: "Late" },
  { id: "KA-006", name: "Ava Thompson", joinedAt: "08:58", status: "Present" },
  { id: "KA-007", name: "Ethan Brown", joinedAt: "—", status: "Absent" },
  { id: "KA-008", name: "Mia Davis", joinedAt: "08:57", status: "Present" },
  { id: "KA-009", name: "Lucas Martin", joinedAt: "08:59", status: "Present" },
  { id: "KA-010", name: "Amelia Garcia", joinedAt: "09:04", status: "Late" },
  { id: "KA-011", name: "Mason Rodriguez", joinedAt: "08:58", status: "Present" },
  { id: "KA-012", name: "Sophia Martinez", joinedAt: "08:57", status: "Present" },
  { id: "KA-013", name: "James Anderson", joinedAt: "—", status: "Absent" },
  { id: "KA-014", name: "Isabella Taylor", joinedAt: "08:58", status: "Present" },
  { id: "KA-015", name: "Benjamin Thomas", joinedAt: "08:56", status: "Present" },
  { id: "KA-016", name: "Charlotte Moore", joinedAt: "08:59", status: "Present" },
  { id: "KA-017", name: "Elijah Jackson", joinedAt: "09:08", status: "Late" },
  { id: "KA-018", name: "Harper White", joinedAt: "08:57", status: "Present" },
  { id: "KA-019", name: "Henry Harris", joinedAt: "08:58", status: "Present" },
  { id: "KA-020", name: "Evelyn Clark", joinedAt: "—", status: "Absent" },
  { id: "KA-021", name: "Alexander Lewis", joinedAt: "08:56", status: "Present" },
  { id: "KA-022", name: "Abigail Robinson", joinedAt: "08:59", status: "Present" },
  { id: "KA-023", name: "Daniel Walker", joinedAt: "08:58", status: "Present" },
  { id: "KA-024", name: "Emily Young", joinedAt: "08:57", status: "Present" },
  { id: "KA-025", name: "Michael Allen", joinedAt: "—", status: "Absent" },
  { id: "KA-026", name: "Ella King", joinedAt: "08:58", status: "Present" },
  { id: "KA-027", name: "William Wright", joinedAt: "09:06", status: "Late" },
  { id: "KA-028", name: "Grace Scott", joinedAt: "08:59", status: "Present" },
];

const sessionHistory = [
  { date: "12 Oct · 09:00", present: "26 present", late: "1 late", absent: "1 absent", status: "Review" },
  { date: "09 Oct · 09:00", present: "27 present", late: "0 late", absent: "1 absent", status: "Reviewed" },
  { date: "07 Oct · 09:00", present: "25 present", late: "2 late", absent: "1 absent", status: "Reviewed" },
  { date: "05 Oct · 09:00", present: "26 present", late: "1 late", absent: "1 absent", status: "Reviewed" },
  { date: "02 Oct · 09:00", present: "24 present", late: "2 late", absent: "2 absent", status: "Reviewed" },
];

const statusStyles: Record<AttendanceStatus, string> = {
  Present: "bg-[#e5efdf] text-[#45683b]",
  Late: "bg-[#fce9dc] text-[#bd622c]",
  Absent: "bg-[#f9e7ef] text-[#bd4776]",
};

export default function TeacherAttendancePage() {
  const [className, setClassName] = useState("Algebra I · Class A");
  const [dateRange, setDateRange] = useState("01–13 Oct 2026");
  const [filtered, setFiltered] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(true);
  const [attendance, setAttendance] = useState(students);
  const [saved, setSaved] = useState(false);

  const totals = useMemo(
    () =>
      attendance.reduce(
        (counts, student) => {
          counts[student.status] += 1;
          return counts;
        },
        { Present: 0, Late: 0, Absent: 0 },
      ),
    [attendance],
  );

  function updateStatus(id: string, status: AttendanceStatus) {
    setAttendance((current) =>
      current.map((student) => (student.id === id ? { ...student, status } : student)),
    );
    setSaved(false);
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-3 py-2">
        <header>
          <h1 className="text-[20px] font-bold leading-tight tracking-tight text-[#172115] dark:text-[#ecf1ea]">
            Attendance
          </h1>
          <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">
            Every student, every session. Review and keep records up to date.
          </p>
        </header>

        <section className="flex flex-wrap items-end gap-2 rounded-xl border border-[#e2e7dd] bg-white p-2.5 dark:border-[#212f1f] dark:bg-[#141d13]">
          <label className="min-w-[160px] flex-1 text-[7px] font-semibold text-[#596653] dark:text-[#c5d6b8]">
            Class
            <span className="relative mt-1 block">
              <select
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className="h-7 w-full appearance-none rounded-md bg-[#f1f4ed] px-2 pr-6 text-[8px] font-normal text-[#273423] outline-none dark:bg-[#20271e] dark:text-[#e1e8dc]"
              >
                <option>Algebra I · Class A</option>
                <option>Geometry · Class B</option>
                <option>Precalculus · Class C</option>
              </select>
              <ChevronDown size={10} className="pointer-events-none absolute right-2 top-2 text-[#71806b]" />
            </span>
          </label>
          <label className="min-w-[145px] flex-1 text-[7px] font-semibold text-[#596653] dark:text-[#c5d6b8]">
            Date range
            <span className="relative mt-1 block">
              <select
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                className="h-7 w-full appearance-none rounded-md bg-[#f1f4ed] px-2 pr-6 text-[8px] font-normal text-[#273423] outline-none dark:bg-[#20271e] dark:text-[#e1e8dc]"
              >
                <option>01–13 Oct 2026</option>
                <option>14–31 Oct 2026</option>
                <option>01–30 Nov 2026</option>
              </select>
              <ChevronDown size={10} className="pointer-events-none absolute right-2 top-2 text-[#71806b]" />
            </span>
          </label>
          <button
            type="button"
            onClick={() => setFiltered(true)}
            className="h-7 rounded-full bg-[#23351f] px-3 text-[8px] font-semibold text-white hover:bg-[#30472b]"
          >
            {filtered ? "Filters applied" : "Apply filters"}
          </button>
        </section>

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,1fr)]">
          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[8px] font-medium text-[#74806f] dark:text-[#9ca797]">Attendance rate</p>
                <p className="mt-1 text-[20px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">
                  {((totals.Present / attendance.length) * 100).toFixed(1)}%
                </p>
                <p className="mt-1 text-[7px] text-[#74806f] dark:text-[#9ca797]">Present + late · latest session</p>
              </div>
              <span className="grid size-7 place-items-center rounded-full bg-[#f1f4ed] text-[#48663e] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                <UserRound size={12} />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#e5efdf] px-2 py-1 text-[7px] font-semibold text-[#45683b]">{totals.Present} present</span>
              <span className="rounded-full bg-[#fce9dc] px-2 py-1 text-[7px] font-semibold text-[#bd622c]">{totals.Late} late</span>
              <span className="rounded-full bg-[#f9e7ef] px-2 py-1 text-[7px] font-semibold text-[#bd4776]">{totals.Absent} absent</span>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students needing attention</h2>
                <p className="mt-1 text-[7px] text-[#74806f] dark:text-[#9ca797]">Review attendance records and follow up</p>
              </div>
              <span className="rounded-full bg-[#fce9dc] px-2 py-1 text-[7px] font-semibold text-[#bd622c]">{totals.Late + totals.Absent} students</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {attendance.filter((student) => student.status !== "Present").slice(0, 4).map((student) => (
                <span key={student.id} className="rounded-lg bg-[#f6f7f3] px-2 py-1 text-[7px] text-[#52634b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                  {student.name} · {student.status}
                </span>
              ))}
              <button type="button" onClick={() => setReviewOpen(true)} className="rounded-full bg-[#e5efdf] px-2 py-1 text-[7px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">
                Review attendance
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-[#e2e7dd] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Session history</h2>
              <p className="mt-1 text-[7px] text-[#74806f] dark:text-[#9ca797]">{className} · October 2026</p>
            </div>
            <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f1f4ed] px-2.5 text-[7px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]">
              <Download size={10} /> Export attendance
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[8px]">
              <thead className="bg-[#f1f4ed] text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
                <tr>
                  <th className="rounded-l-md px-2 py-2">Session</th>
                  <th className="px-2 py-2">Present</th>
                  <th className="px-2 py-2">Late</th>
                  <th className="px-2 py-2">Absent</th>
                  <th className="rounded-r-md px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessionHistory.map((session) => (
                  <tr key={session.date} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]">
                    <td className="whitespace-nowrap px-2 py-2.5 text-[#35402f] dark:text-[#e1e8dc]">{session.date}</td>
                    <td className="px-2 py-2.5 text-[#52634b] dark:text-[#c5d6b8]">{session.present}</td>
                    <td className="px-2 py-2.5 text-[#bd622c]">{session.late}</td>
                    <td className="px-2 py-2.5 text-[#bd4776]">{session.absent}</td>
                    <td className="px-2 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewOpen(true);
                          setSaved(false);
                        }}
                        className={`rounded-full px-2 py-1 text-[7px] font-semibold ${session.status === "Review" ? "bg-[#fce9dc] text-[#bd622c]" : "bg-[#e5efdf] text-[#45683b]"}`}
                      >
                        {session.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[7px] text-[#7c8776] dark:text-[#9ca797]">5 sessions · 1 awaiting confirmation</p>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#e5efdf] text-[#45683b] dark:bg-[#263722] dark:text-[#c5d6b8]"><CalendarDays size={11} /></span>
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Automatic attendance</h2>
            </div>
            <p className="mt-2 text-[7px] leading-relaxed text-[#74806f] dark:text-[#9ca797]">
              Students are marked present when they join. Arrivals after 10 minutes are flagged late; students who never join are marked absent.
            </p>
            <span className="mt-2 inline-block rounded-full bg-[#e5efdf] px-2 py-1 text-[6px] font-semibold text-[#45683b] dark:bg-[#263722] dark:text-[#c5d6b8]">Recording enabled</span>
          </article>
          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Attendance follow-up</h2>
                <p className="mt-1 text-[7px] text-[#74806f] dark:text-[#9ca797]">Students with recent absences</p>
              </div>
              <button type="button" className="inline-flex items-center gap-1 rounded-full bg-[#f1f4ed] px-2 py-1 text-[6px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]"><MessageSquare size={9} /> Message students</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[7px] text-[#52634b] dark:text-[#c5d6b8]">
              {attendance.filter((student) => student.status === "Absent").slice(0, 3).map((student) => (
                <span key={student.id} className="rounded-lg bg-[#f6f7f3] px-2 py-1 dark:bg-[#20271e]">{student.name}</span>
              ))}
              {totals.Absent === 0 && <span>No students currently marked absent.</span>}
            </div>
          </article>
        </section>
      </div>

      {reviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172115]/25 p-3 backdrop-blur-[1px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-review-title"
            className="flex max-h-[88vh] w-full max-w-[420px] flex-col rounded-2xl bg-white p-3 shadow-[0_18px_60px_rgba(20,35,17,0.22)] dark:border dark:border-[#303b2d] dark:bg-[#161b17] sm:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="attendance-review-title" className="text-[11px] font-bold text-[#243020] dark:text-[#ecf1ea]">Class ended: Review Attendance</h2>
                <p className="mt-1 text-[7px] text-[#74806f] dark:text-[#9ca797]">Algebra I · Grade 9 · Class A · 12 Oct 2026, 09:00–09:50</p>
              </div>
              <button type="button" onClick={() => setReviewOpen(false)} aria-label="Close attendance review" className="grid size-6 shrink-0 place-items-center rounded-full text-[#66735f] hover:bg-[#f1f4ed] dark:text-[#c5d6b8] dark:hover:bg-[#20271e]"><X size={12} /></button>
            </div>

            <div className="mt-3 rounded-lg bg-[#e8f1e3] p-2.5 text-[#40543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]">
              <p className="flex items-center gap-1.5 text-[7px] font-bold"><Info size={10} /> A quick check before you save</p>
              <p className="mt-1 pl-4 text-[7px] leading-relaxed">Attendance was recorded automatically. Review late arrivals or missing records and edit any status below.</p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <span className="rounded-full bg-[#e5efdf] px-2 py-1 text-[6px] font-semibold text-[#45683b]">{totals.Present} present</span>
                <span className="rounded-full bg-[#fce9dc] px-2 py-1 text-[6px] font-semibold text-[#bd622c]">{totals.Late} late</span>
                <span className="rounded-full bg-[#f9e7ef] px-2 py-1 text-[6px] font-semibold text-[#bd4776]">{totals.Absent} absent</span>
              </div>
              <span className="text-[6px] font-semibold text-[#53634b] dark:text-[#c5d6b8]">
                {attendance.length} students · {((totals.Present / attendance.length) * 100).toFixed(1)}% attendance
              </span>
            </div>

            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_54px_58px_100px] rounded-md bg-[#f1f4ed] px-2 py-2 text-[6px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
              <span>Student</span><span>Joined at</span><span>Recorded</span><span>Edit status</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {attendance.map((student) => (
                <div key={student.id} className="grid grid-cols-[minmax(0,1fr)_54px_58px_100px] items-center border-b border-[#edf0e9] px-2 py-1.5 dark:border-[#2a312a]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[6px] font-bold text-[#405c35] dark:bg-[#2d3a28] dark:text-[#c5d6b8]">{student.name.split(" ").map((part) => part[0]).join("")}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[7px] font-semibold text-[#35402f] dark:text-[#e1e8dc]">{student.name}</span>
                      <span className="block text-[6px] text-[#84907e] dark:text-[#9ca797]">{student.id}</span>
                    </span>
                  </div>
                  <span className="text-[7px] text-[#35402f] dark:text-[#d6dfd2]">{student.joinedAt}</span>
                  <span className={`w-fit rounded-full px-1.5 py-1 text-[6px] font-semibold ${statusStyles[student.status]}`}>{student.status}</span>
                  <span className="relative">
                    <select
                      aria-label={`Attendance status for ${student.name}`}
                      value={student.status}
                      onChange={(event) => updateStatus(student.id, event.target.value as AttendanceStatus)}
                      className="h-7 w-full appearance-none rounded-md border border-[#e2e7dd] bg-white px-2 pr-5 text-[7px] text-[#35402f] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
                    >
                      <option>Present</option>
                      <option>Late</option>
                      <option>Absent</option>
                    </select>
                    <ChevronDown size={9} className="pointer-events-none absolute right-1.5 top-2 text-[#71806b]" />
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0e9] pt-2 dark:border-[#2a312a]">
              <p className="text-[6px] text-[#74806f] dark:text-[#9ca797]">
                {saved ? "Attendance saved successfully." : `All ${attendance.length} records captured`}
                <span className="block">Scroll to review the full list.</span>
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setReviewOpen(false)} className="text-[7px] font-semibold text-[#53634b] dark:text-[#c5d6b8]">Cancel</button>
                <button
                  type="button"
                  onClick={() => setSaved(true)}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-[#23351f] px-3 text-[7px] font-semibold text-white hover:bg-[#30472b]"
                >
                  <Check size={10} /> Confirm &amp; Save
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
