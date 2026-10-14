import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ArrowUpRight, CalendarDays, ClipboardList, FileText } from "lucide-react";

const assignments = [
  { title: "Linear Equations Practice", className: "Algebra I · Class A", due: "14 Oct 2026", submitted: "0/28", status: "Scheduled", tone: "bg-[#e6f1ff] text-[#3475b9]" },
  { title: "Equations with Brackets", className: "Algebra I · Class A", due: "09 Oct 2026", submitted: "27/28", status: "Review", tone: "bg-[#fff0e2] text-[#b96d27]" },
  { title: "Two-step Equations", className: "Algebra I · Class A", due: "07 Oct 2026", submitted: "28/28", status: "Graded", tone: "bg-[#e7f2e2] text-[#527846]" },
];

const exams = [
  { title: "Algebra Unit Test", className: "Algebra I · Class A", starts: "19 Oct · 09:00", duration: "50 min", status: "Draft", tone: "bg-[#fff0e2] text-[#b96d27]" },
  { title: "Polynomial Functions Test", className: "Algebra I · Class B", starts: "21 Oct · 14:00", duration: "50 min", status: "Scheduled", tone: "bg-[#e6f1ff] text-[#3475b9]" },
  { title: "Similarity & Scale Test", className: "Geometry · Class C", starts: "22 Oct · 11:00", duration: "50 min", status: "Scheduled", tone: "bg-[#e6f1ff] text-[#3475b9]" },
];

export default function TeacherActivitiesPage() {
  return (
    <DashboardShell role="teacher">
      <div className="space-y-4 py-1">
        <header>
          <h1 className="text-[20px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">Activities</h1>
          <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">Assignments and exams for your classes.</p>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className="min-w-0 rounded-lg border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]" aria-labelledby="activity-assignments-title">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-[#eaf2e5] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]"><ClipboardList size={16} /></span><div><h2 id="activity-assignments-title" className="text-[12px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">Assignments</h2><p className="text-[8px] text-[#788173] dark:text-[#9aa592]">Classwork, quizzes and homework</p></div></div>
              <Link href="/teacher/assignments" aria-label="Open all assignments" className="grid size-8 shrink-0 place-items-center rounded-full text-[#52624b] hover:bg-[#f1f4ed] dark:text-[#c5d6b8] dark:hover:bg-[#20271e]"><ArrowUpRight size={15} /></Link>
            </div>
            <div className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">
              {assignments.map((assignment) => <div key={assignment.title} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-[9px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{assignment.title}</p><p className="mt-0.5 truncate text-[7px] text-[#858e7d] dark:text-[#9ca797]">{assignment.className} · {assignment.submitted} submitted</p></div><div className="flex shrink-0 flex-col items-end gap-1"><span className="text-[7px] text-[#687362] dark:text-[#b3bdab]">Due {assignment.due}</span><span className={`rounded-full px-2 py-0.5 text-[7px] font-semibold ${assignment.tone}`}>{assignment.status}</span></div></div>)}
            </div>
            <Link href="/teacher/assignments" className="mt-2 inline-flex items-center gap-1 text-[8px] font-semibold text-[#405b35] hover:underline dark:text-[#c5d6b8]">View assignment manager <ArrowUpRight size={11} /></Link>
          </section>

          <section className="min-w-0 rounded-lg border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]" aria-labelledby="activity-exams-title">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-md bg-[#eaf2e5] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]"><FileText size={16} /></span><div><h2 id="activity-exams-title" className="text-[12px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">Exams</h2><p className="text-[8px] text-[#788173] dark:text-[#9aa592]">Scheduled assessments and drafts</p></div></div>
              <Link href="/teacher/exams" aria-label="Open all exams" className="grid size-8 shrink-0 place-items-center rounded-full text-[#52624b] hover:bg-[#f1f4ed] dark:text-[#c5d6b8] dark:hover:bg-[#20271e]"><ArrowUpRight size={15} /></Link>
            </div>
            <div className="divide-y divide-[#edf0e9] dark:divide-[#2a312a]">
              {exams.map((exam) => <div key={exam.title} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-[9px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{exam.title}</p><p className="mt-0.5 truncate text-[7px] text-[#858e7d] dark:text-[#9ca797]">{exam.className} · {exam.duration}</p></div><div className="flex shrink-0 flex-col items-end gap-1"><span className="flex items-center gap-1 text-[7px] text-[#687362] dark:text-[#b3bdab]"><CalendarDays size={10} />{exam.starts}</span><span className={`rounded-full px-2 py-0.5 text-[7px] font-semibold ${exam.tone}`}>{exam.status}</span></div></div>)}
            </div>
            <Link href="/teacher/exams" className="mt-2 inline-flex items-center gap-1 text-[8px] font-semibold text-[#405b35] hover:underline dark:text-[#c5d6b8]">View exam manager <ArrowUpRight size={11} /></Link>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}