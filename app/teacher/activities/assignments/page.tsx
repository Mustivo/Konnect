"use client";

import { useRef, useState, type FormEvent } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AssignmentActivityWorkspace from "./_components/AssignmentActivityWorkspace";
import CreateAssignmentPanel from "./_components/CreateAssignmentPanel";
import {
  classOptions,
  initialAssignments,
  type ActivityKind,
  type TeacherAssignment,
} from "./_lib/assignment-data";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [activeKind, setActiveKind] = useState<ActivityKind>("In-Class");
  const [classFilter, setClassFilter] = useState(classOptions[0]);
  const [monthFilter, setMonthFilter] = useState("October 2026");
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [assignmentType, setAssignmentType] = useState<ActivityKind>("In-Class");
  const [assignmentClass, setAssignmentClass] = useState(classOptions[0]);
  const [title, setTitle] = useState("Linear Equations Practice");
  const [dueDate, setDueDate] = useState("2026-10-14T09:50");
  const [maxMarks, setMaxMarks] = useState("100");
  const [fileName, setFileName] = useState("linear_equations.pdf");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const titleInput = useRef<HTMLInputElement>(null);

  function publishAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newAssignment: TeacherAssignment = {
      id: Date.now(),
      title,
      className: assignmentClass,
      due: new Date(dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      submitted: `0/${assignmentClass === classOptions[0] ? 28 : 30}`,
      status: "Scheduled",
      kind: assignmentType,
    };

    setAssignments((current) => [newAssignment, ...current]);
    setClassFilter(assignmentClass);
    setActiveKind(assignmentType);
    setNotice("Assignment published to your class.");
  }

  function openCreatePanel() {
    setPanelOpen(true);
    window.setTimeout(() => titleInput.current?.focus(), 0);
  }

  function markReviewed(studentId: string) {
    setReviewed((current) =>
      current.includes(studentId) ? current : [...current, studentId],
    );
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-3">
        <div className={`grid items-start gap-3 ${panelOpen ? "grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.95fr)]" : "grid-cols-1"}`}>
          <div className="min-w-0 space-y-3">
            <section aria-label="Class activities" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">Class activities</h2>
                <button type="button" onClick={() => { setPanelOpen(true); window.setTimeout(() => titleInput.current?.focus(), 0); }} className="inline-flex h-7 items-center gap-1 rounded-full bg-[#233c20] px-3 text-[8px] font-semibold text-white hover:bg-[#304d2b]"><Plus size={12} /> Create</button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="teacher-assignment-class-filter">Class</label>
                <select id="teacher-assignment-class-filter" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] text-[#3c4638] outline-none focus:border-[#8ca47e] dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]">
                  {classOptions.map((className) => <option key={className}>{className}</option>)}
                </select>
                <label className="sr-only" htmlFor="teacher-assignment-month-filter">Month</label>
                <select id="teacher-assignment-month-filter" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] text-[#3c4638] outline-none focus:border-[#8ca47e] dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]">
                  <option>October 2026</option><option>November 2026</option><option>December 2026</option>
                </select>
                <span className="rounded-full bg-[#e5f0df] px-2 py-1 text-[7px] font-semibold text-[#415d37] dark:bg-[#263521] dark:text-[#c5d6b8]">100-point activities</span>
              </div>
              <div className="flex items-center gap-1 border-b border-[#e5e9e1] dark:border-[#2a312a]" role="tablist" aria-label="Activity type">
                {activityKinds.map((kind) => <button key={kind} type="button" role="tab" aria-selected={activeKind === kind} onClick={() => setActiveKind(kind)} className={`relative px-3 py-2 text-[8px] font-semibold ${activeKind === kind ? "text-[#263d21] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#263d21] dark:text-[#c9dbbd] dark:after:bg-[#c9dbbd]" : "text-[#71806b] hover:text-[#263d21] dark:text-[#9aa592]"}`}>{kind}</button>)}
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label={`${activeKind} assignments`}>
              <div className="mb-2 flex items-start justify-between gap-2"><div><h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">{activeKind} assignments</h2><p className="text-[8px] text-[#788173] dark:text-[#9aa592]">Live practice and guided problem solving</p></div><button type="button" className="shrink-0 text-[8px] font-semibold text-[#516846] hover:underline dark:text-[#c5d6b8]">See all <span aria-hidden="true">→</span></button></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] table-fixed text-left text-[8px]">
                  <thead><tr className="bg-[#f1f4ed] text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]"><th className="w-[48%] rounded-l-md px-2 py-2">Assignment</th><th className="w-[18%] px-2 py-2">Due</th><th className="w-[16%] px-2 py-2">Submitted</th><th className="w-[18%] rounded-r-md px-2 py-2">Status</th></tr></thead>
                  <tbody>
                    {visibleAssignments.map((assignment) => <tr key={assignment.id} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]"><td className="px-2 py-2"><p className="truncate font-semibold text-[#273124] dark:text-[#e5ebdf]">{assignment.title}</p><p className="truncate text-[7px] text-[#858e7d] dark:text-[#9ca797]">{assignment.className} · {maxMarks} marks</p></td><td className="px-2 py-2 text-[#687362] dark:text-[#b3bdab]">{assignment.due}</td><td className="px-2 py-2 text-[#687362] dark:text-[#b3bdab]">{assignment.submitted}</td><td className="px-2 py-2"><span className={`rounded-full px-1.5 py-1 text-[7px] font-semibold ${statusClass(assignment.status)}`}>{assignment.status}</span></td></tr>)}
                    {!visibleAssignments.length && <tr><td colSpan={4} className="py-8 text-center text-[9px] text-[#778171]">No activities for this class and type.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center justify-between text-[7px] text-[#828b7b] dark:text-[#9ca797]"><span>Showing {visibleAssignments.length} {activeKind.toLowerCase()} activities</span><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" className="font-semibold text-[#30462a] dark:text-[#c5d6b8]">Prev</button><span className="grid size-5 place-items-center rounded-full bg-[#e5f0df] font-bold text-[#415d37]">1</span><span>2</span><span>3</span><button type="button" aria-label="Next page" className="font-semibold text-[#30462a] dark:text-[#c5d6b8]">Next</button></div></div>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label="Ready for your feedback">
              <div className="mb-2 flex items-center justify-between gap-2"><div><h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">Ready for your feedback</h2><p className="text-[8px] text-[#788173] dark:text-[#9aa592]">Equations with Brackets · 09 Oct 2026</p></div><span className="rounded-full bg-[#e5f0df] px-2 py-1 text-[7px] font-semibold text-[#415d37] dark:bg-[#263521] dark:text-[#c5d6b8]">{27 - reviewed.length}/28</span></div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(90px,0.75fr)_64px] rounded-md bg-[#f1f4ed] px-2 py-2 text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]"><span>Student</span><span>Submitted</span><span>Action</span></div>
              {feedbackItems.map((student) => <div key={student.id} className="grid grid-cols-[minmax(0,1fr)_minmax(90px,0.75fr)_64px] items-center border-b border-[#edf0e9] px-2 py-2 last:border-0 dark:border-[#2a312a]"><span className="flex min-w-0 items-center gap-2 truncate text-[8px] font-medium text-[#35402f] dark:text-[#e1e8dc]"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[7px] font-bold text-[#405c35]">{student.name.split(" ").map((part) => part[0]).join("")}</span>{student.name}</span><span className="text-[7px] text-[#778171] dark:text-[#9ca797]">{student.submitted}</span><button type="button" onClick={() => setReviewed((current) => current.includes(student.id) ? current : [...current, student.id])} className="rounded-full bg-[#f1f4ed] px-2 py-1 text-[7px] font-semibold text-[#41513a] hover:bg-[#e5f0df] dark:bg-[#20271e] dark:text-[#c5d6b8]">{reviewed.includes(student.id) ? "Reviewed" : "Review"}</button></div>)}
            </section>

            <aside className="flex items-start gap-2 rounded-lg bg-[#e7f0e2] p-3 text-[#43543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]"><Info size={12} className="mt-0.5 shrink-0" /><p className="text-[7px] leading-relaxed"><strong>A helpful starting point</strong><br />Upload a question-list PDF, review each slide, then publish. You can save a draft and come back to it anytime.</p></aside>
          </div>

          {panelOpen && <aside className="min-w-0 md:sticky md:top-2">
            <form onSubmit={publishAssignment} className="space-y-2 rounded-xl border border-[#e0e5dd] bg-white p-3 shadow-[0_4px_16px_rgba(26,39,20,0.08)] dark:border-[#2a312a] dark:bg-[#161b17]">
              <div className="flex items-start justify-between"><div><h2 className="text-[11px] font-bold text-[#20291e] dark:text-[#ecf1e9]">Create assignment</h2><p className="text-[7px] text-[#7b8574] dark:text-[#9aa592]">Prepare a new learning moment for your class.</p></div><button type="button" aria-label="Close create assignment panel" onClick={() => setPanelOpen(false)} className="grid size-6 place-items-center rounded-full text-[#56634f] hover:bg-[#f1f4ed] dark:text-[#bdc9b6] dark:hover:bg-[#252e22]"><X size={12} /></button></div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Type<select value={assignmentType} onChange={(event) => setAssignmentType(event.target.value as ActivityKind)} className="mt-1 h-7 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{activityKinds.map((kind) => <option key={kind}>{kind}</option>)}</select></label>
                <label className="space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Class<select value={assignmentClass} onChange={(event) => setAssignmentClass(event.target.value)} className="mt-1 h-7 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{classOptions.map((className) => <option key={className}>{className}</option>)}</select></label>
              </div>
              <label className="block space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Title<input ref={titleInput} required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label>
              <div className="grid grid-cols-[1.4fr_0.8fr] gap-2"><label className="block space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Due date<input required type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1 h-8 w-full min-w-0 rounded-md border border-[#e1e6dc] bg-white px-2 text-[7px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label><label className="block space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Maximum marks<input required min="1" type="number" value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} className="mt-1 h-8 w-full min-w-0 rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label></div>
              <div className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Question-list upload<label className="mt-1 flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#cbd5c4] bg-[#f7f9f5] px-2 text-[8px] font-normal text-[#52624b] hover:bg-[#f0f4ed] dark:border-[#3a4636] dark:bg-[#202720] dark:text-[#c5d6b8]"><FileText size={13} /><span className="min-w-0 flex-1 truncate">{fileName || "Choose a PDF or question file"}</span><CheckCircle2 size={12} className="shrink-0 text-[#57784b]" /><input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /></label></div>
              <section className="space-y-2 rounded-lg bg-[#f1f4ed] p-3 dark:bg-[#20271e]" aria-label="Assignment preview"><div className="flex items-center justify-between"><span className="text-[7px] font-bold uppercase tracking-wide text-[#7b8574] dark:text-[#aab6a1]">{assignmentClass.split(" · ")[0]} · Grade 9</span><span className="rounded-full bg-[#e0ecd9] px-2 py-1 text-[7px] font-semibold text-[#4d6740] dark:bg-[#2d3a28] dark:text-[#c5d6b8]">{maxMarks} marks</span></div><div><h3 className="text-[10px] font-bold text-[#243020] dark:text-[#e5ebdf]">{question.title}</h3><p className="mt-1 text-[7px] leading-relaxed text-[#697464] dark:text-[#b1bba9]">{question.prompt}</p></div><p className="py-1 text-center text-[16px] font-bold tracking-[0] text-[#273423] dark:text-[#e5ebdf]">{question.expression}</p><p className="text-[6px] text-[#778171] dark:text-[#9ca797]">Working space · Explain your method clearly.</p><div className="flex items-center justify-between border-t border-[#dce5d5] pt-2 dark:border-[#354130]"><button type="button" aria-label="Previous question" onClick={() => setQuestionIndex((index) => (index + questions.length - 1) % questions.length)} className="flex size-6 items-center justify-center rounded-full bg-white text-[#52624b] hover:bg-[#e4ecdf] dark:bg-[#2a3327] dark:text-[#d5e0ce]"><ChevronLeft size={13} /></button><span className="text-[7px] font-semibold text-[#687362] dark:text-[#b1bba9]">{questionIndex + 1}/{questions.length}</span><button type="button" aria-label="Next question" onClick={() => setQuestionIndex((index) => (index + 1) % questions.length)} className="flex size-6 items-center justify-center rounded-full bg-white text-[#52624b] hover:bg-[#e4ecdf] dark:bg-[#2a3327] dark:text-[#d5e0ce]"><ChevronRight size={13} /></button></div></section>
              <p className="flex items-start gap-1 text-[6px] leading-relaxed text-[#7b8574] dark:text-[#9ca797]"><Lightbulb size={10} className="mt-0.5 shrink-0" />12 questions · {maxMarks} marks total. Students will see this assignment when you publish it.</p>
              {notice && <p role="status" className="rounded-md bg-[#e7f0e2] px-2 py-1.5 text-[7px] font-medium text-[#405d36] dark:bg-[#263521] dark:text-[#c5d6b8]">{notice}</p>}
              <div className="flex items-center justify-between border-t border-[#edf0e9] pt-2 dark:border-[#2a312a]"><button type="button" onClick={() => setNotice("Draft saved. You can return to it anytime.")} className="rounded-full bg-[#f0f3ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">Save Draft</button><button type="submit" className="inline-flex items-center gap-1 rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white hover:bg-[#304d2b]">Publish <Check size={10} /></button></div>
            </form>
          </aside>}
        </div>
      </div>
    </DashboardShell>
  );
}
