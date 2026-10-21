"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiErrorMessage, apiJson, getExams, type ApiExam } from "@/lib/api";
import { CalendarDays, Clock3, HelpCircle, RefreshCw } from "lucide-react";

type ExamState = "Available now" | "Upcoming" | "Completed";
type LearnerExam = ApiExam & { state: ExamState };
type Collection<T> = T[] | { results?: T[] };

function toRows<T>(data: Collection<T>) { return Array.isArray(data) ? data : data.results || []; }

function stateOf(exam: ApiExam, now = Date.now()): ExamState {
  const start = new Date(exam.exam_date).getTime();
  const end = start + exam.duration_minutes * 60_000;
  if (now < start) return "Upcoming";
  if (now < end) return "Available now";
  return "Completed";
}

export default function ExamsPage() {
  const [exams, setExams] = useState<LearnerExam[]>([]);
  const [selectedState, setSelectedState] = useState<"All exams" | ExamState>("All exams");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const result = await apiJson<Collection<ApiExam>>(await getExams());
      setExams(toRows(result).map((exam) => ({ ...exam, state: stateOf(exam) })));
    } catch (cause) {
      setError(apiErrorMessage(cause instanceof ApiError ? cause.payload : cause, "Could not load exams from your API."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const visibleExams = useMemo(() => selectedState === "All exams" ? exams : exams.filter((exam) => exam.state === selectedState), [exams, selectedState]);
  const tabs: Array<"All exams" | ExamState> = ["All exams", "Available now", "Upcoming", "Completed"];

  return (
    <div className="space-y-4 pb-8 pt-1">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#35452e] dark:text-[#a4b49e]">YOUR LEARNING SPACE</p>
        <h1 className="text-[20px] font-bold leading-tight text-[#151b14] dark:text-[#edf1e9]">Exams</h1>
        <p className="mt-1 text-[9px] text-[#70796b] dark:text-[#9aa592]">Exam schedules visible to your learner account, loaded from the external API.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter exams by status">
          {tabs.map((tab) => <button key={tab} type="button" aria-pressed={selectedState === tab} onClick={() => setSelectedState(tab)} className={`rounded-md border px-2.5 py-1 text-[9px] font-semibold ${selectedState === tab ? "border-[#263d21] bg-[#263d21] text-white" : "border-[#dce3d6] bg-white text-[#43503d] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]"}`}>{tab} ({tab === "All exams" ? exams.length : exams.filter((exam) => exam.state === tab).length})</button>)}
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#dce3d6] bg-white px-2.5 text-[8px] font-semibold text-[#43503d] disabled:opacity-50"><RefreshCw size={11} /> Refresh</button>
      </div>

      {error && <p role="alert" className="rounded-md border border-[#f0c8bf] bg-[#fff3ef] p-3 text-[9px] text-[#963a2c]">{error}</p>}

      <section className="space-y-2" aria-label="Exams returned from API">
        {visibleExams.map((exam) => <article key={exam.id} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#e0e5dd] bg-white px-3 py-3 dark:border-[#2a312a] dark:bg-[#161b17] sm:grid-cols-[minmax(0,1fr)_180px_95px_110px]">
          <div><p className="text-[7px] font-semibold text-[#536447] dark:text-[#aabc98]">{exam.course_title} · {exam.teacher_name}</p><h2 className="mt-1 text-[10px] font-semibold text-[#252c22] dark:text-[#e8eee3]">{exam.title}</h2></div>
          <div className="text-[8px] text-[#50594b] dark:text-[#c1cbb9]"><p className="inline-flex items-center gap-1"><CalendarDays size={10} />{new Date(exam.exam_date).toLocaleString()}</p><p className="mt-1 inline-flex items-center gap-1"><Clock3 size={10} />{exam.duration_minutes} minutes · {exam.total_marks} marks</p></div>
          <span className="justify-self-start rounded-full bg-[#f1f3ed] px-2 py-1 text-[7px] font-semibold text-[#687260] dark:bg-[#252c22] dark:text-[#b2bcae]">{exam.state}</span>
          <span className="text-[8px] text-[#8a642b]">Questions unavailable</span>
        </article>)}
        {!loading && !error && visibleExams.length === 0 && <div className="rounded-lg border border-dashed border-[#dfe5da] bg-white px-4 py-10 text-center text-[9px] text-[#788172]">No exams were returned for this filter. Your teacher must schedule an exam for a course you are enrolled in.</div>}
        {loading && <div className="rounded-lg border border-[#e0e5dd] bg-white px-4 py-10 text-center text-[9px] text-[#788172]">Loading exams from API…</div>}
      </section>

      <aside className="flex items-start gap-2 rounded-md bg-[#eaf0e3] px-3 py-2 text-[8px] text-[#65715c] dark:bg-[#20291d] dark:text-[#b0bda5]"><HelpCircle size={11} className="mt-0.5 shrink-0" /><span>The external API currently returns exam schedules only. It does not provide exam questions or an exam-answer submission endpoint, so this page does not start the hard-coded demo quiz.</span></aside>
    </div>
  );
}
