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
  Download,
  FileText,
  MoreVertical,
  Star,
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
  { name: "Oliver James", meta: "G1 / Class - A · 5 mins ago" },
  { name: "David Peter", meta: "G1 / Class - B · 12 mins ago" },
  { name: "Lilly Paul", meta: "G1 / Class - B" },
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
            aria-label="Student performance"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students<br />Performance</h2>
              <span className="rounded-full bg-[#f1f4ed] px-2 py-1 text-[7px] font-semibold text-[#52634b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                Mastery
              </span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Oliver James", className: "G1 / Class - B", score: "97%" },
                { name: "David Peter", className: "G1 / Class - B", score: "95%" },
                { name: "Lilly Paul", className: "G1 / Class - B", score: "92%" },
              ].map((student, index) => (
                <div key={student.name} className="flex items-center gap-2">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[7px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index]}`}>
                    {student.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[8px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{student.name}</p>
                    <p className="text-[7px] text-[#7c8776] dark:text-[#9ca797]">{student.className}</p>
                  </div>
                  <span className="text-[8px] font-bold text-[#273423] dark:text-[#d6dfd2]">{student.score}</span>
                  <Star size={10} className="text-[#e78648]" />
                </div>
              ))}
            </div>
            <Link href="/teacher/classes" className="mt-3 block text-right text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">
              View All Students <span aria-hidden="true">›</span>
            </Link>
          </section>

          <section
            id="approvals"
            aria-label="Students pending approval"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students<br />Pending<br className="sm:hidden" /> Approval</h2>
              <div className="text-right">
                <span className="rounded-full bg-[#fce9dc] px-2 py-1 text-[7px] font-semibold text-[#bc612a]">{approvals.length} Waiting</span>
                <p className="mt-1 text-[6px] text-[#7c8776] dark:text-[#9ca797]">3/3 Classes<br />Active</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {approvals.map((student, index) => (
                <div key={student.name} className="flex items-center gap-1.5 rounded-full bg-[#f6f7f3] p-1 dark:bg-[#20271e]">
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[6px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index % 3]}`}>
                    {student.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[7px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{student.name}</p>
                    <p className="truncate text-[6px] text-[#7c8776] dark:text-[#9ca797]">{student.meta}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissApproval(student.name)}
                    className="flex h-5 items-center gap-1 rounded-full bg-[#23351f] px-2 text-[6px] font-semibold text-white hover:bg-[#30472b]"
                    aria-label={`Approve ${student.name}`}
                  >
                    <Check size={9} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissApproval(student.name)}
                    className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[#72806c] hover:bg-[#f0f3ed] dark:bg-[#161b17] dark:text-[#c5d6b8]"
                    aria-label={`Dismiss ${student.name}`}
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
              {!approvals.length && <p className="py-5 text-center text-[8px] text-[#7c8776]">No pending approvals.</p>}
            </div>
            <div className="mt-2 flex items-center justify-between text-[7px] text-[#71806b] dark:text-[#9ca797]">
              <span>Class capacity alert: 28/30 seats filled</span>
              <Link href="/teacher/classes" className="font-semibold text-[#263d21] dark:text-[#c5d6b8]">View All Requests <span aria-hidden="true">›</span></Link>
            </div>
          </section>

          <section
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
          </section>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(235px,1fr)]">
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
        </div>
      </div>
    </DashboardShell>
  );
}
