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
  Search,
  SlidersHorizontal,
  UserCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type AttendanceStatus = "Present" | "Late" | "Absent";
type AttendanceStudent = {
  id: string;
  name: string;
  email?: string;
  joinedAt: string;
  status: AttendanceStatus;
};

const students: AttendanceStudent[] = [
  { id: "KA-000", name: "Steven Mwizerwa", email: "stevenmwizerwa1@gmail.com", joinedAt: "08:55", status: "Present" },
  { id: "KA-001", name: "Oliver James", email: "oliver.james@student.school.edu", joinedAt: "08:56", status: "Present" },
  { id: "KA-002", name: "David Peter", email: "david.peter@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-003", name: "Lilly Paul", email: "lilly.paul@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-004", name: "Emma Wilson", email: "emma.wilson@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-005", name: "Noah Williams", email: "noah.williams@student.school.edu", joinedAt: "09:12", status: "Late" },
  { id: "KA-006", name: "Ava Thompson", email: "ava.thompson@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-007", name: "Ethan Brown", email: "ethan.brown@student.school.edu", joinedAt: "—", status: "Absent" },
  { id: "KA-008", name: "Mia Davis", email: "mia.davis@student.school.edu", joinedAt: "08:57", status: "Present" },
  { id: "KA-009", name: "Lucas Martin", email: "lucas.martin@student.school.edu", joinedAt: "08:59", status: "Present" },
  { id: "KA-010", name: "Amelia Garcia", email: "amelia.garcia@student.school.edu", joinedAt: "09:04", status: "Late" },
  { id: "KA-011", name: "Mason Rodriguez", email: "mason.rodriguez@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-012", name: "Sophia Martinez", email: "sophia.martinez@student.school.edu", joinedAt: "08:57", status: "Present" },
  { id: "KA-013", name: "James Anderson", email: "james.anderson@student.school.edu", joinedAt: "—", status: "Absent" },
  { id: "KA-014", name: "Isabella Taylor", email: "isabella.taylor@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-015", name: "Benjamin Thomas", email: "benjamin.thomas@student.school.edu", joinedAt: "08:56", status: "Present" },
  { id: "KA-016", name: "Charlotte Moore", email: "charlotte.moore@student.school.edu", joinedAt: "08:59", status: "Present" },
  { id: "KA-017", name: "Elijah Jackson", email: "elijah.jackson@student.school.edu", joinedAt: "09:08", status: "Late" },
  { id: "KA-018", name: "Harper White", email: "harper.white@student.school.edu", joinedAt: "08:57", status: "Present" },
  { id: "KA-019", name: "Henry Harris", email: "henry.harris@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-020", name: "Evelyn Clark", email: "evelyn.clark@student.school.edu", joinedAt: "—", status: "Absent" },
  { id: "KA-021", name: "Alexander Lewis", email: "alexander.lewis@student.school.edu", joinedAt: "08:56", status: "Present" },
  { id: "KA-022", name: "Abigail Robinson", email: "abigail.robinson@student.school.edu", joinedAt: "08:59", status: "Present" },
  { id: "KA-023", name: "Daniel Walker", email: "daniel.walker@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-024", name: "Emily Young", email: "emily.young@student.school.edu", joinedAt: "08:57", status: "Present" },
  { id: "KA-025", name: "Michael Allen", email: "michael.allen@student.school.edu", joinedAt: "—", status: "Absent" },
  { id: "KA-026", name: "Ella King", email: "ella.king@student.school.edu", joinedAt: "08:58", status: "Present" },
  { id: "KA-027", name: "William Wright", email: "william.wright@student.school.edu", joinedAt: "09:06", status: "Late" },
  { id: "KA-028", name: "Grace Scott", email: "grace.scott@student.school.edu", joinedAt: "08:59", status: "Present" },
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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceStudent[]>(students);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | AttendanceStatus>("All");

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

  const displayedStudents = useMemo(() => {
    return attendance.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.id.toLowerCase().includes(q) ||
        (student.email && student.email.toLowerCase().includes(q));
      const matchesTab = activeTab === "All" || student.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [attendance, searchQuery, activeTab]);

  function updateStatus(id: string, status: AttendanceStatus) {
    setAttendance((current) =>
      current.map((student) => (student.id === id ? { ...student, status } : student)),
    );
    setSaved(false);
  }

  function markAllPresent() {
    setAttendance((current) =>
      current.map((student) => ({ ...student, status: "Present" })),
    );
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 4000);
  }

  const attendancePercentage = ((totals.Present / attendance.length) * 100).toFixed(1);

  return (
    <DashboardShell role="teacher">
      <div className="space-y-4 py-2">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold leading-tight tracking-tight text-[#172115] dark:text-[#ecf1ea]">
              Attendance
            </h1>
            <p className="text-[10px] text-[#707c6c] dark:text-[#9aa592]">
              Every student, every session. Live tracking &amp; records management.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5efdf] px-2.5 py-1 text-[8px] font-semibold text-[#45683b] dark:bg-[#263722] dark:text-[#c5d6b8]">
              <span className="size-1.5 rounded-full bg-[#45683b] animate-pulse" />
              Live Session Active
            </span>
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-[#dce3d7] bg-white px-2.5 text-[8px] font-semibold text-[#30472b] shadow-sm hover:bg-[#f5f8f2] dark:border-[#2a3826] dark:bg-[#141d13] dark:text-[#c5d6b8]"
            >
              <Info size={11} /> Review Dialog
            </button>
          </div>
        </header>

        {/* Filters Bar */}
        <section className="flex flex-wrap items-end gap-2.5 rounded-xl border border-[#e2e7dd] bg-white p-3 dark:border-[#212f1f] dark:bg-[#141d13]">
          <label className="min-w-[160px] flex-1 text-[8px] font-semibold text-[#596653] dark:text-[#c5d6b8]">
            Class
            <span className="relative mt-1 block">
              <select
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                className="h-8 w-full appearance-none rounded-md bg-[#f1f4ed] px-2.5 pr-6 text-[9px] font-normal text-[#273423] outline-none dark:bg-[#20271e] dark:text-[#e1e8dc]"
              >
                <option>Python &amp; Web Development · Class A</option>
                <option>Algebra I · Class A</option>
                <option>Geometry · Class B</option>
                <option>Precalculus · Class C</option>
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-2.5 text-[#71806b]" />
            </span>
          </label>
          <label className="min-w-[145px] flex-1 text-[8px] font-semibold text-[#596653] dark:text-[#c5d6b8]">
            Date range
            <span className="relative mt-1 block">
              <select
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                className="h-8 w-full appearance-none rounded-md bg-[#f1f4ed] px-2.5 pr-6 text-[9px] font-normal text-[#273423] outline-none dark:bg-[#20271e] dark:text-[#e1e8dc]"
              >
                <option>01–13 Oct 2026</option>
                <option>14–31 Oct 2026</option>
                <option>01–30 Nov 2026</option>
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-2.5 text-[#71806b]" />
            </span>
          </label>
          <button
            type="button"
            onClick={() => setFiltered(true)}
            className="h-8 rounded-full bg-[#23351f] px-4 text-[8px] font-semibold text-white transition-colors hover:bg-[#30472b]"
          >
            {filtered ? "Filters applied" : "Apply filters"}
          </button>
        </section>

        {/* Overview Stats Cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-medium text-[#74806f] dark:text-[#9ca797]">Attendance rate</p>
                <p className="mt-1 text-[22px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">
                  {attendancePercentage}%
                </p>
                <p className="mt-1 text-[8px] text-[#74806f] dark:text-[#9ca797]">Today's active session</p>
              </div>
              <span className="grid size-8 place-items-center rounded-full bg-[#f1f4ed] text-[#48663e] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                <UserRound size={14} />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#e5efdf] px-2 py-0.5 text-[8px] font-semibold text-[#45683b]">{totals.Present} present</span>
              <span className="rounded-full bg-[#fce9dc] px-2 py-0.5 text-[8px] font-semibold text-[#bd622c]">{totals.Late} late</span>
              <span className="rounded-full bg-[#f9e7ef] px-2 py-0.5 text-[8px] font-semibold text-[#bd4776]">{totals.Absent} absent</span>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students needing attention</h2>
                <p className="mt-0.5 text-[8px] text-[#74806f] dark:text-[#9ca797]">Late arrivals or unverified absence</p>
              </div>
              <span className="rounded-full bg-[#fce9dc] px-2 py-0.5 text-[8px] font-semibold text-[#bd622c]">
                {totals.Late + totals.Absent} students
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {attendance.filter((student) => student.status !== "Present").slice(0, 3).map((student) => (
                <span key={student.id} className="rounded-md bg-[#f6f7f3] px-2 py-1 text-[8px] font-medium text-[#52634b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                  {student.name} · {student.status}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setActiveTab("Absent")}
                className="rounded-full bg-[#fce9dc] px-2 py-1 text-[8px] font-semibold text-[#bd622c] hover:bg-[#fadbc7]"
              >
                Filter absent
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] sm:col-span-2 xl:col-span-1 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Quick actions</h2>
                <p className="mt-0.5 text-[8px] text-[#74806f] dark:text-[#9ca797]">Batch controls for today's session</p>
              </div>
              <span className="grid size-8 place-items-center rounded-full bg-[#e5efdf] text-[#45683b] dark:bg-[#263722] dark:text-[#c5d6b8]">
                <UserCheck size={14} />
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                className="h-7 rounded-full bg-[#e5efdf] px-3 text-[8px] font-semibold text-[#405c35] hover:bg-[#d8e7d0] dark:bg-[#263722] dark:text-[#c5d6b8]"
              >
                Mark all present
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-[#23351f] px-3 text-[8px] font-semibold text-white hover:bg-[#30472b]"
              >
                <Check size={11} /> Save session
              </button>
              {saved && (
                <span className="inline-flex items-center text-[8px] font-semibold text-[#45683b]">
                  ✓ Saved
                </span>
              )}
            </div>
          </article>
        </section>

        {/* Live Attendance Table directly on the page */}
        <section className="rounded-2xl border border-[#e2e7dd] bg-white p-4 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] pb-3 dark:border-[#2a312a]">
            <div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#35522b] dark:text-[#c5d6b8]" />
                <h2 className="text-[13px] font-bold text-[#243020] dark:text-[#ecf1ea]">
                  Today's Session Attendance Roster
                </h2>
              </div>
              <p className="mt-0.5 text-[8px] text-[#74806f] dark:text-[#9ca797]">
                {className} · 12 Oct 2026, 09:00–09:50 · {attendance.length} enrolled students
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {saved && (
                <span className="rounded-full bg-[#e5efdf] px-2.5 py-1 text-[8px] font-semibold text-[#45683b] animate-fadeIn">
                  ✓ Attendance saved
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#23351f] px-3 text-[8px] font-semibold text-white hover:bg-[#30472b]"
              >
                <Check size={10} /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[#dce3d7] bg-[#f8faf6] px-2.5 text-[8px] font-semibold text-[#30472b] hover:bg-[#edf2e9] dark:border-[#2b3827] dark:bg-[#1a2319] dark:text-[#c5d6b8]"
              >
                Full Dialog
              </button>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1">
              {(["All", "Present", "Late", "Absent"] as const).map((tab) => {
                const count = tab === "All" ? attendance.length : totals[tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-2.5 py-1 text-[8px] font-semibold transition-colors ${
                      isActive
                        ? "bg-[#23351f] text-white"
                        : "bg-[#f1f4ed] text-[#556350] hover:bg-[#e4ede0] dark:bg-[#20271e] dark:text-[#c5d6b8]"
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[200px] flex-1 sm:max-w-[260px]">
              <Search size={11} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#83907d]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or ID..."
                className="h-7 w-full rounded-full border border-[#e2e7dd] bg-[#f8faf6] pl-7 pr-3 text-[8px] text-[#243020] outline-none focus:border-[#45683b] dark:border-[#303b2d] dark:bg-[#1a2319] dark:text-[#e1e8dc]"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#edf0e9] dark:border-[#2a312a]">
            <table className="w-full min-w-[620px] text-left text-[8px]">
              <thead className="bg-[#f4f7f1] text-[8px] font-bold uppercase tracking-wider text-[#63725e] dark:bg-[#1c241a] dark:text-[#a8b5a1]">
                <tr>
                  <th className="px-3 py-2.5">Student</th>
                  <th className="px-3 py-2.5">Student ID</th>
                  <th className="px-3 py-2.5">Joined At</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">
                {displayedStudents.map((student) => {
                  const isFeatured = student.id === "KA-000";
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors hover:bg-[#fafbf8] dark:hover:bg-[#192218] ${
                        isFeatured ? "bg-[#f8faf5] dark:bg-[#1b251a]" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[8px] font-bold text-[#405c35] dark:bg-[#2d3a28] dark:text-[#c5d6b8]">
                            {student.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <div>
                            <span className="block font-semibold text-[#243020] dark:text-[#ecf1ea]">
                              {student.name}
                              {isFeatured && (
                                <span className="ml-1.5 inline-block rounded-full bg-[#e5efdf] px-1.5 py-0.2 text-[7px] font-bold text-[#35522b]">
                                  Active Learner
                                </span>
                              )}
                            </span>
                            <span className="block text-[7px] text-[#707c6c] dark:text-[#9aa592]">
                              {student.email || `${student.id.toLowerCase()}@student.school.edu`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[8px] text-[#556350] dark:text-[#c5d6b8]">
                        {student.id}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-[#35402f] dark:text-[#d6dfd2]">
                        {student.joinedAt}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold ${statusStyles[student.status]}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1 rounded-md bg-[#f1f4ed] p-0.5 dark:bg-[#20271e]">
                          {(["Present", "Late", "Absent"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateStatus(student.id, st)}
                              className={`rounded px-1.5 py-0.5 text-[7px] font-semibold transition-all ${
                                student.status === st
                                  ? st === "Present"
                                    ? "bg-[#45683b] text-white shadow-xs"
                                    : st === "Late"
                                    ? "bg-[#bd622c] text-white shadow-xs"
                                    : "bg-[#bd4776] text-white shadow-xs"
                                  : "text-[#6d7967] hover:text-[#243020] dark:text-[#9ba793] dark:hover:text-[#ecf1ea]"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {displayedStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[9px] text-[#707c6c]">
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[8px] text-[#707c6c] dark:text-[#9aa592]">
            <span>
              Showing {displayedStudents.length} of {attendance.length} enrolled students
            </span>
            <button
              type="button"
              onClick={markAllPresent}
              className="font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]"
            >
              Reset all to Present
            </button>
          </div>
        </section>

        {/* Session history section */}
        <section className="rounded-2xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[11px] font-bold text-[#243020] dark:text-[#ecf1ea]">Session history</h2>
              <p className="mt-0.5 text-[8px] text-[#74806f] dark:text-[#9ca797]">{className} · October 2026</p>
            </div>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f1f4ed] px-2.5 text-[8px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]"
            >
              <Download size={10} /> Export history
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[8px]">
              <thead className="bg-[#f1f4ed] text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
                <tr>
                  <th className="rounded-l-md px-2.5 py-2">Session</th>
                  <th className="px-2.5 py-2">Present</th>
                  <th className="px-2.5 py-2">Late</th>
                  <th className="px-2.5 py-2">Absent</th>
                  <th className="rounded-r-md px-2.5 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessionHistory.map((session) => (
                  <tr key={session.date} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]">
                    <td className="whitespace-nowrap px-2.5 py-2 text-[#35402f] dark:text-[#e1e8dc]">{session.date}</td>
                    <td className="px-2.5 py-2 text-[#52634b] dark:text-[#c5d6b8]">{session.present}</td>
                    <td className="px-2.5 py-2 text-[#bd622c]">{session.late}</td>
                    <td className="px-2.5 py-2 text-[#bd4776]">{session.absent}</td>
                    <td className="px-2.5 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewOpen(true);
                          setSaved(false);
                        }}
                        className={`rounded-full px-2 py-0.5 text-[7px] font-semibold ${
                          session.status === "Review" ? "bg-[#fce9dc] text-[#bd622c]" : "bg-[#e5efdf] text-[#45683b]"
                        }`}
                      >
                        {session.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[8px] text-[#7c8776] dark:text-[#9ca797]">5 sessions recorded · 1 awaiting review</p>
        </section>

        {/* Info & follow-up cards */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#e5efdf] text-[#45683b] dark:bg-[#263722] dark:text-[#c5d6b8]">
                <CalendarDays size={12} />
              </span>
              <h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Automatic attendance</h2>
            </div>
            <p className="mt-2 text-[8px] leading-relaxed text-[#74806f] dark:text-[#9ca797]">
              Students are marked present automatically when they enter the live classroom. Arrivals after 10 minutes are flagged late; non-attendees remain absent.
            </p>
            <span className="mt-2.5 inline-block rounded-full bg-[#e5efdf] px-2 py-0.5 text-[7px] font-semibold text-[#45683b] dark:bg-[#263722] dark:text-[#c5d6b8]">
              Automated sync active
            </span>
          </article>

          <article className="rounded-2xl border border-[#e2e7dd] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Attendance follow-up</h2>
                <p className="mt-0.5 text-[8px] text-[#74806f] dark:text-[#9ca797]">Students with recent absences</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-[#f1f4ed] px-2 py-1 text-[7px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]"
              >
                <MessageSquare size={9} /> Message learners
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[8px] text-[#52634b] dark:text-[#c5d6b8]">
              {attendance.filter((student) => student.status === "Absent").slice(0, 3).map((student) => (
                <span key={student.id} className="rounded-md bg-[#f6f7f3] px-2 py-1 dark:bg-[#20271e]">
                  {student.name}
                </span>
              ))}
              {totals.Absent === 0 && <span>No students currently marked absent.</span>}
            </div>
          </article>
        </section>
      </div>

      {/* Manual / On-demand Review Dialog (Only appears when teacher clicks "Full Dialog" or "Review") */}
      {reviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172115]/30 p-3 backdrop-blur-[2px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-review-title"
            className="flex max-h-[88vh] w-full max-w-[440px] flex-col rounded-2xl bg-white p-4 shadow-[0_18px_60px_rgba(20,35,17,0.22)] dark:border dark:border-[#303b2d] dark:bg-[#161b17]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="attendance-review-title" className="text-[12px] font-bold text-[#243020] dark:text-[#ecf1ea]">
                  Class ended: Review Attendance
                </h2>
                <p className="mt-0.5 text-[8px] text-[#74806f] dark:text-[#9ca797]">
                  Algebra I · Grade 9 · Class A · 12 Oct 2026, 09:00–09:50
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                aria-label="Close attendance review"
                className="grid size-6 shrink-0 place-items-center rounded-full text-[#66735f] hover:bg-[#f1f4ed] dark:text-[#c5d6b8] dark:hover:bg-[#20271e]"
              >
                <X size={13} />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-[#e8f1e3] p-2.5 text-[#40543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]">
              <p className="flex items-center gap-1.5 text-[8px] font-bold">
                <Info size={11} /> A quick check before you save
              </p>
              <p className="mt-1 pl-4 text-[7px] leading-relaxed">
                Attendance was recorded automatically. Review late arrivals or missing records and edit any status below.
              </p>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <span className="rounded-full bg-[#e5efdf] px-2 py-0.5 text-[7px] font-semibold text-[#45683b]">{totals.Present} present</span>
                <span className="rounded-full bg-[#fce9dc] px-2 py-0.5 text-[7px] font-semibold text-[#bd622c]">{totals.Late} late</span>
                <span className="rounded-full bg-[#f9e7ef] px-2 py-0.5 text-[7px] font-semibold text-[#bd4776]">{totals.Absent} absent</span>
              </div>
              <span className="text-[7px] font-semibold text-[#53634b] dark:text-[#c5d6b8]">
                {attendance.length} students · {attendancePercentage}% attendance
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_54px_58px_100px] rounded-md bg-[#f1f4ed] px-2.5 py-2 text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
              <span>Student</span>
              <span>Joined at</span>
              <span>Recorded</span>
              <span>Edit status</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {attendance.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-[minmax(0,1fr)_54px_58px_100px] items-center border-b border-[#edf0e9] px-2.5 py-1.5 dark:border-[#2a312a]"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[7px] font-bold text-[#405c35] dark:bg-[#2d3a28] dark:text-[#c5d6b8]">
                      {student.name.split(" ").map((part) => part[0]).join("")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[8px] font-semibold text-[#35402f] dark:text-[#e1e8dc]">
                        {student.name}
                      </span>
                      <span className="block text-[7px] text-[#84907e] dark:text-[#9ca797]">{student.id}</span>
                    </span>
                  </div>
                  <span className="text-[8px] text-[#35402f] dark:text-[#d6dfd2]">{student.joinedAt}</span>
                  <span className={`w-fit rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${statusStyles[student.status]}`}>
                    {student.status}
                  </span>
                  <span className="relative">
                    <select
                      aria-label={`Attendance status for ${student.name}`}
                      value={student.status}
                      onChange={(event) => updateStatus(student.id, event.target.value as AttendanceStatus)}
                      className="h-7 w-full appearance-none rounded-md border border-[#e2e7dd] bg-white px-2 pr-5 text-[8px] text-[#35402f] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
                    >
                      <option>Present</option>
                      <option>Late</option>
                      <option>Absent</option>
                    </select>
                    <ChevronDown size={9} className="pointer-events-none absolute right-1.5 top-2.5 text-[#71806b]" />
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0e9] pt-2.5 dark:border-[#2a312a]">
              <p className="text-[7px] text-[#74806f] dark:text-[#9ca797]">
                {saved ? "Attendance saved successfully." : `All ${attendance.length} records captured`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="text-[8px] font-semibold text-[#53634b] dark:text-[#c5d6b8]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setReviewOpen(false);
                  }}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-[#23351f] px-3 text-[8px] font-semibold text-white hover:bg-[#30472b]"
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
