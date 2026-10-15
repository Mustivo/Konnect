"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TeacherClassCreator from "@/components/dashboard/TeacherClassCreator";
import { apiJson, getClassAssessments, getTeacherClasses } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  MoreVertical,
  Search,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";

const stats = [
  { label: "Active Classes", value: "3", note: "3/3 class limit", icon: BookOpen, tone: "bg-[#edf4e8] text-[#34522a]" },
  { label: "Students", value: "83", note: "Across all classes", icon: Users, tone: "bg-[#eaf2ff] text-[#2563a8]" },
  { label: "Pending Reviews", value: "42", note: "Assignments waiting", icon: FileText, tone: "bg-[#fce7f3] text-[#be3b75]" },
  { label: "Approvals", value: "3", note: "New requests today", icon: Check, tone: "bg-[#fef4e8] text-[#c2781b]" },
];

type TeacherClassSummary = { id: string; code: string; subject: string; title: string; group: string; students: number; tasks: number; schedule: string; time: string };

const classes: TeacherClassSummary[] = [
  { id: "algebra", code: "MATH 101", subject: "MATH 101 · GRADE 1", title: "Math Algebra Unit Formula", group: "G1 / Class - A", students: 28, tasks: 12, schedule: "Mon, Wed, Fri", time: "09:00 AM" },
  { id: "geometry", code: "ALG 201", subject: "ALG 201 · GRADE 1", title: "Advanced Linear Geometry", group: "G1 / Class - B", students: 30, tasks: 18, schedule: "Tue, Thu", time: "11:00 AM" },
  { id: "trigonometry", code: "GEOM 301", subject: "GEOM 301 · GRADE 2", title: "Trigonometry & Spatial Math", group: "G2 / Class - C", students: 25, tasks: 8, schedule: "Mon, Wed", time: "02:00 PM" },
];

type ApiClassRoom = { id: string; title: string; subject?: string; enrolled_count?: string | number; max_students?: number; start_date?: string | null };
type ApiAssessmentList = { results?: Array<{ id: string }> } | Array<{ id: string }>;

const initialApprovals = [
  { name: "Sophie Bennett", meta: "G1 / Class - A · 5 mins ago" },
  { name: "Oscar Hughes", meta: "G1 / Class - A · 12 mins ago" },
  { name: "Freya Cooper", meta: "G1 / Class - A" },
];

const rosterStudents = [
  { name: "Oliver James", id: "KA-001", email: "oliver.james@student.school.edu", joined: "07 Sep 2026", attendance: "100%" },
  { name: "David Peter", id: "KA-002", email: "david.peter@student.school.edu", joined: "07 Sep 2026", attendance: "96.4%" },
  { name: "Lilly Paul", id: "KA-003", email: "lilly.paul@student.school.edu", joined: "07 Sep 2026", attendance: "100%" },
  { name: "Emma Wilson", id: "KA-004", email: "emma.wilson@student.school.edu", joined: "07 Sep 2026", attendance: "92.9%" },
  { name: "Noah Williams", id: "KA-005", email: "noah.williams@student.school.edu", joined: "07 Sep 2026", attendance: "92.9%" },
  { name: "Ava Thompson", id: "KA-006", email: "ava.thompson@student.school.edu", joined: "07 Sep 2026", attendance: "96.4%" },
  { name: "Ethan Brown", id: "KA-007", email: "ethan.brown@student.school.edu", joined: "07 Sep 2026", attendance: "85.7%" },
  { name: "Mia Davis", id: "KA-008", email: "mia.davis@student.school.edu", joined: "07 Sep 2026", attendance: "89.3%" },
];

const initialNotes = [
  { title: "Prepare Questions for Unit Test", text: "Prepare questions for unit tests", date: "05 Dec 2026" },
  { title: "Announcements to Students", text: "Announce important updates to students", date: "01 Dec 2026" },
];

const activeClasses = [
  { id: "algebra", subject: "MATH 101 · GRADE 1", title: "Math Algebra Unit Formula", group: "G1 / Class - A", students: 28, tasks: 12, schedule: "Mon, Wed, Fri", time: "09:00 AM" },
  { id: "geometry", subject: "ALG 201 · GRADE 1", title: "Advanced Linear Geometry", group: "G1 / Class - B", students: 30, tasks: 18, schedule: "Tue, Thu", time: "11:00 AM" },
  { id: "trigonometry", subject: "GEOM 301 · GRADE 2", title: "Trigonometry & Spatial Math", group: "G2 / Class - C", students: 25, tasks: 8, schedule: "Mon, Wed", time: "02:00 PM" },
];

const plannerItems = [
  { title: "Maths Algebra Unit Formula", className: "G1 / Class - A", status: "Overdue", color: "text-[#cf5047] bg-[#fbe9e7]" },
  { title: "Linear Functions Review", className: "G1 / Class - B", status: "Today", color: "text-[#4e7543] bg-[#e7f1e2]" },
];

export default function TeacherDashboardPage() {
  const [activeClasses, setActiveClasses] = useState(classes);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [notes] = useState(initialNotes);
  const [, setAddingNote] = useState(false);
  const [apiClassCount, setApiClassCount] = useState<number | null>(null);
  const [apiStudentCount, setApiStudentCount] = useState<number | null>(null);
  const [loadNotice, setLoadNotice] = useState("");

  function dismissApproval(name: string) {
    setApprovals((current) => current.filter((approval) => approval.name !== name));
  }

  useEffect(() => {
    if (!window.localStorage.getItem("konnect-access-token")) return;
    let cancelled = false;

    async function loadTeacherClasses() {
      try {
        const response = await getTeacherClasses();
        const payload = await apiJson<ApiClassRoom[] | { results?: ApiClassRoom[] }>(response);
        const records = Array.isArray(payload) ? payload : payload.results ?? [];
        const mapped = await Promise.all(records.map(async (classRoom, index) => {
          let taskCount = 0;
          try {
            const assessments = await apiJson<ApiAssessmentList>(await getClassAssessments(classRoom.id));
            taskCount = Array.isArray(assessments) ? assessments.length : assessments.results?.length ?? 0;
          } catch {
            taskCount = 0;
          }
          return {
            id: classRoom.id,
            code: (classRoom.subject || `CLASS ${index + 1}`).toUpperCase().slice(0, 12),
            subject: `${(classRoom.subject || `CLASS ${index + 1}`).toUpperCase()} · CLASS`,
            title: classRoom.title,
            group: classRoom.subject || `Class ${index + 1}`,
            students: Number(classRoom.enrolled_count) || 0,
            tasks: taskCount,
            schedule: classRoom.start_date ? "Starts" : "Schedule",
            time: classRoom.start_date ? new Date(classRoom.start_date).toLocaleDateString("en-GB") : "To be announced",
          };
        }));

        if (!cancelled) {
          setActiveClasses(mapped);
          setApiClassCount(records.length);
          setApiStudentCount(records.reduce((sum, item) => sum + (Number(item.enrolled_count) || 0), 0));
        }
      } catch {
        if (!cancelled) setLoadNotice("Live class data is temporarily unavailable. Showing the dashboard preview.");
      }
    }

    void loadTeacherClasses();
    return () => { cancelled = true; };
  }, []);

  const visibleStats = stats.map((stat) => {
    if (stat.label === "Active Classes" && apiClassCount !== null) return { ...stat, value: String(apiClassCount), note: `${apiClassCount}/3 class limit` };
    if (stat.label === "Students" && apiStudentCount !== null) return { ...stat, value: String(apiStudentCount), note: "Across your classes" };
    return stat;
  });

  return (
    <DashboardShell role="teacher" teacherDashboard>
      <TeacherClassCreator />
      <div className="space-y-5 pt-1 pb-8">
        <header className="flex flex-col gap-1.5">
          <div>
            <p className="text-[12px] font-medium leading-5 text-[#707c6c]">Good afternoon,</p>
            <h1 className="text-[26px] font-bold leading-8 tracking-[0] text-[#172115] dark:text-[#ecf1ea]">
              Edna Francis
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#707c6c]">
              Teacher workspace - approvals, class performance, notes & tasks
            </p>
          </div>
        </header>

        {loadNotice && <p role="status" className="text-[9px] text-[#7d8979]">{loadNotice}</p>}

        <section id="analytics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleStats.map(({ label, value, note, icon: Icon, tone }) => (
            <article key={label} className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#687564] dark:text-[#8b9987]">{label}</p>
                  <p className="mt-1 text-[24px] font-bold leading-7 tracking-[0] text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                  <p className="mt-1 text-[10px] text-[#85917f]">{note}</p>
                </div>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={14} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-3">
          <section
            id="students"
            aria-label="Students roster"
            className="min-w-0 rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] lg:col-span-3 dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students Roster</h2>
                <p className="mt-0.5 text-[7px] text-[#74806f] dark:text-[#9ca797]">Get to know your students and make room for new learners.</p>
              </div>
              <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f1f4ed] px-2.5 text-[7px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                <Download size={10} /> Export roster
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="teacher-roster-class">Select class</label>
              <select
                id="teacher-roster-class"
                value={rosterClass}
                onChange={(event) => setRosterClass(event.target.value)}
                className="h-7 min-w-0 flex-1 rounded-md border border-[#e2e7dd] bg-[#f8f9f6] px-2 text-[7px] text-[#35402f] outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc] sm:max-w-[240px]"
              >
                <option>Algebra I · Grade 9 · Class A</option>
                <option>Geometry · Grade 10 · Class B</option>
                <option>Precalculus · Grade 11 · Class C</option>
              </select>
              <span className="rounded-full bg-[#e5efdf] px-2 py-1 text-[6px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">28/100</span>
              <span className="flex-1" />
              <label className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
                <span className="sr-only">Search students</span>
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#83907d]" />
                <input
                  type="search"
                  value={rosterSearch}
                  onChange={(event) => setRosterSearch(event.target.value)}
                  placeholder="Search students..."
                  className="h-7 w-full rounded-full border border-[#e2e7dd] bg-white pl-6 pr-2 text-[7px] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#161b17] dark:text-[#e1e8dc]"
                />
              </label>
            </div>

            <div className="mt-3 rounded-xl bg-[#e7f0e2] px-3 py-2.5 text-[#43543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]">
              <p className="text-[7px] font-bold">28 enrolled · 72 seats available</p>
              <p className="mt-0.5 text-[6px] leading-relaxed">Share class code ALG-9A-26 with your students. New learners will appear under Join Requests for your approval.</p>
            </div>

            <div className="mt-3 flex gap-1 border-b border-[#edf0e9] dark:border-[#2a312a]" role="tablist" aria-label="Roster status">
              {(["enrolled", "requests"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  id={tab === "requests" ? "approvals" : undefined}
                  role="tab"
                  aria-selected={rosterTab === tab}
                  onClick={() => setRosterTab(tab)}
                  className={`rounded-full px-2.5 py-1.5 text-[7px] font-semibold ${rosterTab === tab ? "bg-[#23351f] text-white" : "text-[#687564] hover:bg-[#f1f4ed] dark:text-[#a5b19f] dark:hover:bg-[#20271e]"}`}
                >
                  {tab === "enrolled" ? "Enrolled (28)" : `Join Requests (${approvals.length})`}
                </button>
              ))}
            </div>

            {rosterTab === "enrolled" ? (
              <>
                <div className="mt-2">
                  <h3 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Enrolled students</h3>
                  <p className="mt-0.5 text-[6px] text-[#74806f] dark:text-[#9ca797]">{rosterClass}</p>
                </div>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-[7px]">
                    <thead className="bg-[#f1f4ed] text-[6px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
                      <tr>
                        {["Student", "Email address", "Joined", "Attendance", "Status"].map((heading) => (
                          <th key={heading} className="px-2 py-2 first:rounded-l-md last:rounded-r-md">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]">
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[6px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index % 3]}`}>{student.name.split(" ").map((part) => part[0]).join("")}</span>
                              <span>
                                <span className="block font-semibold text-[#35402f] dark:text-[#e1e8dc]">{student.name}</span>
                                <span className="block text-[6px] text-[#84907e] dark:text-[#9ca797]">{student.id}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-[#52634b] dark:text-[#c5d6b8]">{student.email}</td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-[#52634b] dark:text-[#c5d6b8]">{student.joined}</td>
                          <td className="px-2 py-1.5 text-[#52634b] dark:text-[#c5d6b8]">{student.attendance}</td>
                          <td className="px-2 py-1.5"><span className="rounded-full bg-[#e5efdf] px-2 py-1 text-[6px] font-semibold text-[#45683b]">Enrolled</span></td>
                        </tr>
                      ))}
                      {!filteredStudents.length && (
                        <tr><td colSpan={5} className="py-6 text-center text-[7px] text-[#74806f]">No students match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[6px] text-[#74806f] dark:text-[#9ca797]">
                  <span>Showing {filteredStudents.length ? 1 : 0}–{filteredStudents.length} of 28 students</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="font-semibold text-[#405c35] dark:text-[#c5d6b8]">Prev</button>
                    <span className="grid size-4 place-items-center rounded-full bg-[#e5efdf] font-bold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">1</span>
                    <span>2</span><span>3</span><span>4</span>
                    <button type="button" className="rounded-full bg-[#f1f4ed] px-2 py-1 font-semibold text-[#405c35] dark:bg-[#20271e] dark:text-[#c5d6b8]">Next</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-2 space-y-1.5">
                {approvals.map((student, index) => (
                  <div key={student.name} className="flex items-center gap-2 rounded-lg bg-[#f6f7f3] p-2 dark:bg-[#20271e]">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[6px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index % 3]}`}>{student.name.split(" ").map((part) => part[0]).join("")}</span>
                    <div className="min-w-0 flex-1"><p className="text-[7px] font-semibold text-[#35402f] dark:text-[#e1e8dc]">{student.name}</p><p className="text-[6px] text-[#74806f] dark:text-[#9ca797]">{student.meta}</p></div>
                    <button type="button" onClick={() => dismissApproval(student.name)} className="inline-flex items-center gap-1 rounded-full bg-[#23351f] px-2.5 py-1 text-[6px] font-semibold text-white"><Check size={8} /> Approve</button>
                    <button type="button" onClick={() => dismissApproval(student.name)} aria-label={`Dismiss ${student.name}`} className="grid size-5 place-items-center rounded-full bg-white text-[#71806b] dark:bg-[#161b17]"><X size={9} /></button>
                  </div>
                ))}
                {!approvals.length && <p className="py-6 text-center text-[7px] text-[#74806f]">No join requests are waiting.</p>}
              </div>
            )}

            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <article className="rounded-xl border border-[#edf0e9] p-3 dark:border-[#2a312a]">
                <h3 className="text-[8px] font-bold text-[#243020] dark:text-[#ecf1ea]">Invite students</h3>
                <p className="mt-0.5 text-[6px] text-[#74806f] dark:text-[#9ca797]">One code, a connected classroom.</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <code className="text-[12px] font-bold tracking-wide text-[#253322] dark:text-[#e1e8dc]">ALG-9A-26</code>
                  <button type="button" onClick={copyInviteCode} className="inline-flex items-center gap-1 rounded-full bg-[#f1f4ed] px-2.5 py-1.5 text-[6px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]"><Copy size={9} /> Copy code</button>
                </div>
                <p role="status" className="mt-1 text-[6px] text-[#74806f] dark:text-[#9ca797]">{copyMessage || "Students can request to join from their Konnect account."}</p>
              </article>
              <article className="rounded-xl border border-[#edf0e9] p-3 dark:border-[#2a312a]">
                <h3 className="text-[8px] font-bold text-[#243020] dark:text-[#ecf1ea]">{approvals.length} join requests waiting</h3>
                <p className="mt-0.5 text-[6px] text-[#74806f] dark:text-[#9ca797]">{approvals.map((student) => student.name).join(", ") || "No requests are waiting."}</p>
                <button type="button" onClick={() => setRosterTab("requests")} className="mt-2 rounded-full bg-[#e5efdf] px-2.5 py-1.5 text-[6px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">Review requests</button>
              </article>
            </div>
          </section>

          {!isRosterView && <section
            aria-label="My notes"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">
                My Notes <span className="ml-1 rounded-full bg-[#e5efdf] px-1.5 py-0.5 text-[6px] text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">{notes.length + 8}</span>
              </h2>
              <button
                type="button"
                onClick={() => setAddingNote((current) => !current)}
                className="rounded-full border border-[#e2e7dd] px-2 py-1 text-[6px] font-semibold text-[#43543a] hover:bg-[#f6f8f3] dark:border-[#303b2d] dark:text-[#c5d6b8]"
              >
                + Add Notes
              </button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <article key={note.title} className="rounded-lg bg-[#f6f7f3] p-2.5 dark:bg-[#20271e]">
                  <h3 className="text-[8px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{note.title}</h3>
                  <p className="mt-1 text-[7px] text-[#7c8776] dark:text-[#9ca797]">{note.text}</p>
                  <p className="mt-1 text-[6px] text-[#7c8776] dark:text-[#9ca797]">{note.date}</p>
                </article>
              ))}
            </div>
            <button type="button" className="mt-2 block w-full text-right text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">
              View All Notes <span aria-hidden="true">›</span>
            </button>
          </section>}
        </div>

        {!isRosterView && <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(235px,1fr)]">
          <section aria-label="My active classes">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[9px] font-bold text-[#253322] dark:text-[#e1e8dc]">
                My Active Classes <span className="ml-1 rounded-full bg-[#e5efdf] px-1.5 py-0.5 text-[6px] text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">3 / 3 Max Limit Reached</span>
              </h2>
              <p className="text-[6px] text-[#7c8776] dark:text-[#9ca797]">Teachers are limited to 3 active classes max</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeClasses.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#e8ebe4] bg-white p-2.5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-[6px] font-semibold text-[#7c8776] dark:text-[#9ca797]">{item.subject}</p>
                    <span className="rounded-full bg-[#e5efdf] px-1.5 py-0.5 text-[6px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">Active</span>
                  </div>
                  <h3 className="mt-1 text-[8px] font-bold leading-tight text-[#253322] dark:text-[#e1e8dc]">{item.title}</h3>
                  <p className="mt-0.5 text-[6px] text-[#7c8776] dark:text-[#9ca797]">{item.group}</p>
                  <div className="mt-2 flex items-center gap-3 text-[6px] text-[#52634b] dark:text-[#c5d6b8]">
                    <span className="flex items-center gap-1"><Users size={9} />{item.students} Students</span>
                    <span className="flex items-center gap-1"><FileText size={9} />{item.tasks} Pending Tasks</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#edf0e9] pt-2 dark:border-[#2a312a]">
                    <div className="text-[6px] text-[#7c8776] dark:text-[#9ca797]">
                      <p>{item.schedule}</p><p>({item.time})</p>
                    </div>
                    <Link href="/teacher/classes" className="inline-flex items-center gap-1 rounded-full bg-[#23351f] px-2 py-1 text-[6px] font-semibold text-white hover:bg-[#30472b]">
                      Manage Class <ArrowRight size={8} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-label="My planner"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">My Planner</h2>
              <button type="button" className="flex items-center gap-1 rounded-full bg-[#f1f4ed] px-2 py-1 text-[6px] font-semibold text-[#52634b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                Dec 2026 <ChevronDown size={9} />
              </button>
            </div>
            <p className="mt-1 text-[6px] text-[#7c8776] dark:text-[#9ca797]">Dec 12, Thursday</p>
            <div className="mt-2 grid grid-cols-7 text-center text-[6px] text-[#7c8776] dark:text-[#9ca797]">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`${day}-${index}`} className="py-1">{day}</span>
              ))}
              {[8, 9, 10, 11, 12, 13, 14].map((day) => (
                <span key={day} className={`mx-auto grid size-5 place-items-center rounded-full ${day === 12 ? "bg-[#23351f] font-bold text-white" : "text-[#40503a] dark:text-[#c5d6b8]"}`}>{day}</span>
              ))}
            </div>
            <div className="mt-2 space-y-1.5">
              {plannerItems.map((item) => (
                <article key={item.title} className="flex items-center justify-between gap-2 rounded-xl bg-[#f6f7f3] p-2 dark:bg-[#20271e]">
                  <div className="min-w-0">
                    <h3 className="truncate text-[7px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{item.title}</h3>
                    <p className="text-[6px] text-[#7c8776] dark:text-[#9ca797]">{item.className}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-1.5 py-1 text-[6px] font-semibold ${item.color}`}>{item.status}</span>
                </article>
              ))}
            </div>
            <Link href="/teacher/assignments" className="mt-2 inline-flex items-center gap-1 text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">
              <CalendarDays size={9} /> View assignments <ArrowRight size={8} />
            </Link>
          </section>
        </div>}
      </div>
    </DashboardShell>
  );
}
