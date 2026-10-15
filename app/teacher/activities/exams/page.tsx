"use client";

import { useState, type FormEvent } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, FileText, Info, Lightbulb, Plus, X } from "lucide-react";

type ExamGroup = "Upcoming" | "Ongoing" | "Completed";
type ExamStatus = "Draft" | "Scheduled" | "Completed";
type TeacherExam = {
  id: number;
  title: string;
  className: string;
  starts: string;
  duration: number;
  status: ExamStatus;
  group: ExamGroup;
};

const examClasses = ["Algebra I · Class A", "Algebra I · Class B", "Geometry · Class C"];
const examTabs: { label: ExamGroup; count: number }[] = [
  { label: "Upcoming", count: 3 },
  { label: "Ongoing", count: 1 },
  { label: "Completed", count: 2 },
];
const initialExams: TeacherExam[] = [
  { id: 1, title: "Algebra Unit Test", className: examClasses[0], starts: "19 Oct 2026 · 09:00", duration: 50, status: "Draft", group: "Upcoming" },
  { id: 2, title: "Polynomial Functions Test", className: examClasses[1], starts: "21 Oct 2026 · 14:00", duration: 50, status: "Scheduled", group: "Upcoming" },
  { id: 3, title: "Similarity & Scale Test", className: examClasses[2], starts: "22 Oct 2026 · 11:00", duration: 50, status: "Scheduled", group: "Upcoming" },
  { id: 4, title: "Triangle Congruence Test", className: examClasses[2], starts: "13 Oct 2026 · 11:00", duration: 50, status: "Scheduled", group: "Ongoing" },
  { id: 5, title: "Linear Equations Exam", className: examClasses[0], starts: "08 Oct 2026 · 09:00", duration: 50, status: "Completed", group: "Completed" },
  { id: 6, title: "Algebra Foundations", className: examClasses[1], starts: "02 Oct 2026 · 14:00", duration: 45, status: "Completed", group: "Completed" },
];
const previewQuestions = [
  { title: "Solve simultaneous equations", prompt: "Find the values of x and y. Show each step of your working.", equation: "2x + y = 11\nx − y = 1" },
  { title: "Factor the expression", prompt: "Factor fully and check your answer by expanding.", equation: "x² + 7x + 12" },
  { title: "Find the gradient", prompt: "Use the coordinates to calculate the gradient of the line.", equation: "A(2, 3)  →  B(6, 11)" },
];

function statusStyle(status: ExamStatus) {
  if (status === "Draft") return "bg-[#fff0e2] text-[#b96d27]";
  if (status === "Scheduled") return "bg-[#e6f1ff] text-[#3475b9]";
  return "bg-[#e7f2e2] text-[#527846]";
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState(initialExams);
  const [group, setGroup] = useState<ExamGroup>("Upcoming");
  const [classFilter, setClassFilter] = useState("All classes");
  const [monthFilter, setMonthFilter] = useState("October 2026");
  const [title, setTitle] = useState("Algebra Unit Test");
  const [examClass, setExamClass] = useState(examClasses[0]);
  const [startsOn, setStartsOn] = useState("2026-10-19T09:00");
  const [duration, setDuration] = useState("50");
  const [maxMarks, setMaxMarks] = useState("100");
  const [fileName, setFileName] = useState("algebra_unit_test.pdf");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [fullScreen, setFullScreen] = useState(true);
  const [shuffle, setShuffle] = useState(true);
  const [notice, setNotice] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const visibleExams = exams.filter((exam) => exam.group === group &&
    (classFilter === "All classes" || exam.className === classFilter) &&
    exam.starts.includes(monthFilter.slice(0, 3)),
  );
  const happeningNow = exams.find((exam) => exam.group === "Ongoing");
  const question = previewQuestions[questionIndex];

  function scheduleExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExams((current) => [{
      id: Date.now(), title, className: examClass,
      starts: new Date(startsOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      duration: Number(duration), status: "Scheduled", group: "Upcoming",
    }, ...current]);
    setClassFilter(examClass);
    setGroup("Upcoming");
    setNotice("Exam scheduled for your class.");
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-3">
        <div className={`grid items-start gap-3 ${panelOpen ? "grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.95fr)]" : "grid-cols-1"}`}>
          <div className="min-w-0 space-y-3">
            <section aria-label="Your assessments" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">Your assessments</h2>
                <button type="button" onClick={() => setPanelOpen(true)} className="inline-flex h-7 items-center gap-1 rounded-full bg-[#233c20] px-3 text-[8px] font-semibold text-white hover:bg-[#304d2b]"><Plus size={12} /> Create</button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="teacher-exam-class">Class filter</label>
                <select id="teacher-exam-class" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] text-[#3c4638] outline-none dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]"><option>All classes</option>{examClasses.map((className) => <option key={className}>{className}</option>)}</select>
                <label className="sr-only" htmlFor="teacher-exam-month">Month filter</label>
                <select id="teacher-exam-month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] text-[#3c4638] outline-none dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]"><option>October 2026</option><option>November 2026</option><option>December 2026</option></select>
              </div>
              <div className="flex items-center gap-1 border-b border-[#e5e9e1] dark:border-[#2a312a]" role="tablist" aria-label="Exam status">
                {examTabs.map((tab) => <button key={tab.label} type="button" role="tab" aria-selected={group === tab.label} onClick={() => setGroup(tab.label)} className={`relative px-3 py-2 text-[8px] font-semibold ${group === tab.label ? "text-[#263d21] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#263d21] dark:text-[#c9dbbd] dark:after:bg-[#c9dbbd]" : "text-[#71806b] hover:text-[#263d21] dark:text-[#9aa592]"}`}>{tab.label} ({tab.count})</button>)}
              </div>
            </section>

            {group === "Ongoing" && happeningNow && <section className="space-y-2 rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label="Happening now"><div className="flex items-center justify-between"><span className="rounded-full bg-[#fff0e2] px-2 py-1 text-[7px] font-semibold text-[#b96d27]">Ongoing</span><span className="text-[7px] text-[#75806f]">{happeningNow.className}</span></div><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">{happeningNow.title}</h2><p className="text-[8px] text-[#788173] dark:text-[#9aa592]">Geometry · Grade 10 · Class B · 13 Oct, 11:00–11:50</p><div className="flex items-center justify-between pt-2"><span className="text-[8px] font-semibold text-[#52624b] dark:text-[#c5d6b8]">18/30 submitted</span><button type="button" className="rounded-full bg-[#f1f4ed] px-3 py-1.5 text-[7px] font-semibold text-[#41513a] dark:bg-[#20271e] dark:text-[#c5d6b8]">Monitor exam</button></div></section>}

            <section className="overflow-hidden rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label={`${group} exams`}>
              <div className="mb-2"><h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">{group} exams</h2><p className="text-[8px] text-[#788173] dark:text-[#9aa592]">All times are local · London (GMT+1)</p></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[280px] table-fixed text-left text-[8px]">
                  <thead><tr className="bg-[#f1f4ed] text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]"><th className="w-[43%] rounded-l-md px-2 py-2">Exam</th><th className="w-[25%] px-2 py-2">Starts</th><th className="w-[16%] px-2 py-2">Duration</th><th className="w-[16%] rounded-r-md px-2 py-2">Status</th></tr></thead>
                  <tbody>{visibleExams.map((exam) => <tr key={exam.id} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]"><td className="px-2 py-2"><p className="truncate font-semibold text-[#273124] dark:text-[#e5ebdf]">{exam.title}</p><p className="truncate text-[7px] text-[#858e7d] dark:text-[#9ca797]">{exam.className} · {maxMarks} marks</p></td><td className="px-2 py-2 text-[#687362] dark:text-[#b3bdab]">{exam.starts}</td><td className="px-2 py-2 text-[#687362] dark:text-[#b3bdab]">{exam.duration} min</td><td className="px-2 py-2"><span className={`rounded-full px-1.5 py-1 text-[7px] font-semibold ${statusStyle(exam.status)}`}>{exam.status}</span></td></tr>)}{!visibleExams.length && <tr><td colSpan={4} className="py-7 text-center text-[9px] text-[#778171]">No exams for this class and month.</td></tr>}</tbody>
                </table>
              </div>
              <p className="mt-2 text-[7px] text-[#828b7b] dark:text-[#9ca797]">{visibleExams.length} exams · {visibleExams.filter((exam) => exam.status === "Scheduled").length} scheduled, {visibleExams.filter((exam) => exam.status === "Draft").length} draft</p>
            </section>

            <aside className="flex items-start gap-2 rounded-lg bg-[#e7f0e2] p-3 text-[#43543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]"><Info size={12} className="mt-0.5 shrink-0" /><p className="text-[7px] leading-relaxed"><strong>A calm start to exam day</strong><br />Scheduled exams open automatically at the start time. Students receive a reminder 24 hours beforehand.</p></aside>
          </div>

          {panelOpen && <aside className="min-w-0 md:sticky md:top-2">
            <form onSubmit={scheduleExam} className="space-y-2 rounded-xl border border-[#e0e5dd] bg-white p-3 shadow-[0_4px_16px_rgba(26,39,20,0.08)] dark:border-[#2a312a] dark:bg-[#161b17]">
              <div className="flex items-start justify-between"><div><h2 className="text-[11px] font-bold text-[#20291e] dark:text-[#ecf1e9]">Create exam</h2><p className="text-[7px] text-[#7b8574] dark:text-[#9aa592]">Set up a focused, fair assessment.</p></div><button type="button" aria-label="Close create exam panel" onClick={() => setPanelOpen(false)} className="grid size-6 place-items-center rounded-full text-[#56634f] hover:bg-[#f1f4ed] dark:text-[#bdc9b6] dark:hover:bg-[#252e22]"><X size={12} /></button></div>
              <div className="grid grid-cols-[1.25fr_0.75fr] gap-2"><label className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Class<select value={examClass} onChange={(event) => setExamClass(event.target.value)} className="mt-1 h-7 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{examClasses.map((className) => <option key={className}>{className}</option>)}</select></label><label className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Maximum marks<input required min="1" type="number" value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} className="mt-1 h-7 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label></div>
              <label className="block text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Exam title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label>
              <div className="grid grid-cols-[1.25fr_0.75fr] gap-2"><label className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Starts on<input required type="datetime-local" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} className="mt-1 h-8 w-full min-w-0 rounded-md border border-[#e1e6dc] bg-white px-2 text-[7px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label><label className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Duration<input required min="1" type="number" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1 h-8 w-full min-w-0 rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label></div>
              <div className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Question-list upload<label className="mt-1 flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#cbd5c4] bg-[#f7f9f5] px-2 text-[8px] font-normal text-[#52624b] hover:bg-[#f0f4ed] dark:border-[#3a4636] dark:bg-[#202720] dark:text-[#c5d6b8]"><FileText size={13} /><span className="min-w-0 flex-1 truncate">{fileName || "Choose a PDF or question file"}</span><CheckCircle2 size={12} className="shrink-0 text-[#57784b]" /><input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /></label></div>
              <section className="space-y-2 rounded-lg bg-[#f1f4ed] p-3 dark:bg-[#20271e]" aria-label="Exam preview"><div className="flex items-center justify-between"><span className="text-[7px] font-bold uppercase tracking-wide text-[#7b8574] dark:text-[#aab6a1]">{examClass.split(" · ")[0]} · Grade 9</span><span className="rounded-full bg-[#e0ecd9] px-2 py-1 text-[7px] font-semibold text-[#4d6740] dark:bg-[#2d3a28] dark:text-[#c5d6b8]">{maxMarks} marks</span></div><div><h3 className="text-[10px] font-bold text-[#243020] dark:text-[#e5ebdf]">{question.title}</h3><p className="mt-1 text-[7px] leading-relaxed text-[#697464] dark:text-[#b1bba9]">{question.prompt}</p></div><p className="whitespace-pre-line py-1 text-center text-[15px] font-bold leading-tight tracking-[0] text-[#273423] dark:text-[#e5ebdf]">{question.equation}</p><p className="text-[6px] text-[#778171] dark:text-[#9ca797]">Working space · Explain your method clearly.</p><div className="flex items-center justify-between border-t border-[#dce5d5] pt-2 dark:border-[#354130]"><button type="button" aria-label="Previous question" onClick={() => setQuestionIndex((index) => (index + previewQuestions.length - 1) % previewQuestions.length)} className="flex size-6 items-center justify-center rounded-full bg-white text-[#52624b] hover:bg-[#e4ecdf] dark:bg-[#2a3327] dark:text-[#d5e0ce]"><ChevronLeft size={13} /></button><span className="text-[7px] font-semibold text-[#687362] dark:text-[#b1bba9]">{questionIndex + 1}/{previewQuestions.length}</span><button type="button" aria-label="Next question" onClick={() => setQuestionIndex((index) => (index + 1) % previewQuestions.length)} className="flex size-6 items-center justify-center rounded-full bg-white text-[#52624b] hover:bg-[#e4ecdf] dark:bg-[#2a3327] dark:text-[#d5e0ce]"><ChevronRight size={13} /></button></div></section>
              <div className="space-y-1.5"><label className="flex items-center justify-between rounded-md px-1 py-1 text-[8px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Full-screen mode<input type="checkbox" checked={fullScreen} onChange={(event) => setFullScreen(event.target.checked)} className="size-4 accent-[#314d2c]" /></label><label className="flex items-center justify-between rounded-md px-1 py-1 text-[8px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">Shuffle<input type="checkbox" checked={shuffle} onChange={(event) => setShuffle(event.target.checked)} className="size-4 accent-[#314d2c]" /></label></div>
              <p className="flex items-start gap-1 text-[6px] leading-relaxed text-[#7b8574] dark:text-[#9ca797]"><Lightbulb size={10} className="mt-0.5 shrink-0" />Students receive an automatic reminder 24 hours before the exam.</p>
              {notice && <p role="status" className="rounded-md bg-[#e7f0e2] px-2 py-1.5 text-[7px] font-medium text-[#405d36] dark:bg-[#263521] dark:text-[#c5d6b8]">{notice}</p>}
              <div className="flex items-center justify-between border-t border-[#edf0e9] pt-2 dark:border-[#2a312a]"><button type="button" onClick={() => setNotice("Draft saved.")} className="rounded-full bg-[#f0f3ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">Save Draft</button><button type="submit" className="inline-flex items-center gap-1 rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white hover:bg-[#304d2b]">Schedule <Check size={10} /></button></div>
            </form>
          </aside>}
        </div>
      </div>
    </DashboardShell>
  );
}