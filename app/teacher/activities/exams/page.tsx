"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ApiError, apiErrorMessage, apiJson, getCourses, getExams, createExam, type ApiCourse, type ApiExam } from "@/lib/api";
import { Check, Info, Plus, RefreshCw, X } from "lucide-react";

type ExamGroup = "Upcoming" | "Ongoing" | "Completed";
type CourseOption = Pick<ApiCourse, "id" | "title">;
type Collection<T> = T[] | { results?: T[] };
type TeacherExam = ApiExam & { group: ExamGroup; status: "Scheduled" | "Ongoing" | "Completed" };

function toRows<T>(data: Collection<T>) {
  return Array.isArray(data) ? data : data.results || [];
}

function examGroup(exam: ApiExam, now = Date.now()): ExamGroup {
  const startsAt = new Date(exam.exam_date).getTime();
  const endsAt = startsAt + exam.duration_minutes * 60_000;
  if (now < startsAt) return "Upcoming";
  if (now < endsAt) return "Ongoing";
  return "Completed";
}

function formatExam(exam: ApiExam): TeacherExam {
  const group = examGroup(exam);
  return { ...exam, group, status: group === "Upcoming" ? "Scheduled" : group };
}

function localDateTimeTomorrow() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setSeconds(0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [group, setGroup] = useState<ExamGroup>("Upcoming");
  const [classFilter, setClassFilter] = useState("All courses");
  const [title, setTitle] = useState("Design systems fundamentals");
  const [courseId, setCourseId] = useState("");
  const [startsOn, setStartsOn] = useState(localDateTimeTomorrow);
  const [duration, setDuration] = useState("90");
  const [maxMarks, setMaxMarks] = useState("100");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [courseResponse, examResponse] = await Promise.all([getCourses(), getExams()]);
      const [courseData, examData] = await Promise.all([
        apiJson<Collection<ApiCourse>>(courseResponse),
        apiJson<Collection<ApiExam>>(examResponse),
      ]);
      const availableCourses = toRows(courseData).map(({ id, title: courseTitle }) => ({ id, title: courseTitle }));
      setCourses(availableCourses);
      setCourseId((current) => current || availableCourses[0]?.id || "");
      setExams(toRows(examData).map(formatExam));
    } catch (cause) {
      setError(apiErrorMessage(cause instanceof ApiError ? cause.payload : cause, "Could not load exams from the external API."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const filteredExams = useMemo(() => exams.filter((exam) => exam.group === group &&
    (classFilter === "All courses" || exam.course === classFilter)), [classFilter, exams, group]);
  const happeningNow = exams.find((exam) => exam.group === "Ongoing");
  const tabs: ExamGroup[] = ["Upcoming", "Ongoing", "Completed"];

  async function scheduleExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    const date = new Date(startsOn);
    if (!courseId || !Number.isFinite(date.getTime()) || date <= new Date()) {
      setError("Choose an API course and a future exam date.");
      return;
    }
    setSaving(true);
    try {
      const created = await apiJson<ApiExam>(await createExam({
        course: courseId,
        title: title.trim(),
        exam_date: date.toISOString(),
        duration_minutes: Number(duration),
        total_marks: Number(maxMarks),
      }));
      setExams((current) => [formatExam(created), ...current]);
      setClassFilter("All courses");
      setGroup("Upcoming");
      setNotice("Exam schedule saved to the external API. The API does not accept question content, so the 20 demo questions were not uploaded.");
    } catch (cause) {
      setError(apiErrorMessage(cause instanceof ApiError ? cause.payload : cause, "The API did not create the exam. Check that your teacher account is active and verified, and that the course belongs to you."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-3">
        <div className={`grid items-start gap-3 ${panelOpen ? "grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.95fr)]" : "grid-cols-1"}`}>
          <div className="min-w-0 space-y-3">
            <section aria-label="Your exams" className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">Your exams</h2><p className="text-[8px] text-[#788173]">Loaded from `/api/exams/`.</p></div>
                <div className="flex gap-2"><button type="button" onClick={() => void refresh()} className="inline-flex h-7 items-center gap-1 rounded-full border border-[#e0e5dd] px-3 text-[8px] font-semibold"><RefreshCw size={11} /> Refresh</button><button type="button" onClick={() => setPanelOpen(true)} className="inline-flex h-7 items-center gap-1 rounded-full bg-[#233c20] px-3 text-[8px] font-semibold text-white"><Plus size={12} /> Create</button></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="teacher-exam-course">Course filter</label>
                <select id="teacher-exam-course" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px]"><option>All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
              </div>
              <div className="flex items-center gap-1 border-b border-[#e5e9e1]" role="tablist" aria-label="Exam status">
                {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={group === tab} onClick={() => setGroup(tab)} className={`relative px-3 py-2 text-[8px] font-semibold ${group === tab ? "text-[#263d21] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#263d21]" : "text-[#71806b]"}`}>{tab} ({exams.filter((exam) => exam.group === tab).length})</button>)}
              </div>
            </section>
            {happeningNow && group === "Ongoing" && <section className="rounded-lg border bg-white p-3"><span className="text-[8px] font-semibold">Ongoing · {happeningNow.course_title}</span><h2 className="mt-1 text-[11px] font-bold">{happeningNow.title}</h2><p className="text-[8px]">{happeningNow.duration_minutes} minutes · {happeningNow.total_marks} marks</p></section>}
            <section className="overflow-hidden rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label={`${group} exams`}>
              <div className="mb-2"><h2 className="text-[11px] font-bold">{group} exams</h2><p className="text-[8px] text-[#788173]">Schedule data from the external API · times shown in your local timezone.</p></div>
              {error && <p role="alert" className="mb-2 rounded bg-[#fff3ef] p-2 text-[8px] text-[#9b3b30]">{error}</p>}
              <div className="overflow-x-auto"><table className="w-full min-w-[280px] table-fixed text-left text-[8px]"><thead><tr className="bg-[#f1f4ed] text-[7px] font-semibold"><th className="w-[43%] rounded-l-md px-2 py-2">Exam</th><th className="w-[25%] px-2 py-2">Starts</th><th className="w-[16%] px-2 py-2">Duration</th><th className="w-[16%] rounded-r-md px-2 py-2">Status</th></tr></thead><tbody>{filteredExams.map((exam) => <tr key={exam.id} className="border-b border-[#edf0e9] last:border-0"><td className="px-2 py-2"><p className="truncate font-semibold">{exam.title}</p><p className="truncate text-[7px] text-[#858e7d]">{exam.course_title} · {exam.total_marks} marks</p></td><td className="px-2 py-2">{new Date(exam.exam_date).toLocaleString()}</td><td className="px-2 py-2">{exam.duration_minutes} min</td><td className="px-2 py-2">{exam.status}</td></tr>)}{!loading && !filteredExams.length && <tr><td colSpan={4} className="py-7 text-center text-[9px] text-[#778171]">No exams returned for this course and status.</td></tr>}{loading && <tr><td colSpan={4} className="py-7 text-center text-[9px]">Loading exams from API…</td></tr>}</tbody></table></div>
            </section>
            <aside className="flex items-start gap-2 rounded-lg bg-[#e7f0e2] p-3 text-[#43543a]"><Info size={12} className="mt-0.5 shrink-0" /><p className="text-[7px] leading-relaxed"><strong>API limitation</strong><br />`/api/exams/` stores the schedule and marks only. It has no question-bank field, so it cannot import or deliver the 20 demo questions.</p></aside>
          </div>

          {panelOpen && <aside className="min-w-0 md:sticky md:top-2"><form onSubmit={scheduleExam} className="space-y-2 rounded-xl border border-[#e0e5dd] bg-white p-3 shadow-[0_4px_16px_rgba(26,39,20,0.08)] dark:border-[#2a312a] dark:bg-[#161b17]">
            <div className="flex items-start justify-between"><div><h2 className="text-[11px] font-bold">Schedule an exam</h2><p className="text-[7px] text-[#7b8574]">Creates a record using the external Exams API.</p></div><button type="button" aria-label="Close create exam panel" onClick={() => setPanelOpen(false)} className="grid size-6 place-items-center rounded-full"><X size={12} /></button></div>
            <label className="block text-[7px] font-semibold">Course<select required value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={!courses.length} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal disabled:opacity-60"><option value="">{courses.length ? "Select a course" : "No API courses available"}</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
            <label className="block text-[7px] font-semibold">Exam title<input required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal" /></label>
            <div className="grid grid-cols-[1.25fr_0.75fr] gap-2"><label className="text-[7px] font-semibold">Starts on<input required type="datetime-local" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[7px] font-normal" /></label><label className="text-[7px] font-semibold">Duration<input required min="1" type="number" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal" /></label></div>
            <label className="block text-[7px] font-semibold">Total marks<input required min="1" type="number" value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal" /></label>
            <p role="status" className="text-[7px] text-[#52624b]">{notice}</p>{error && <p role="alert" className="text-[7px] text-[#9b3b30]">{error}</p>}
            <p className="text-[7px] text-[#7b8574]">The backend currently accepts schedule metadata only. Your teacher account must be active and verified.</p>
            <div className="flex justify-end border-t border-[#edf0e9] pt-2"><button type="submit" disabled={saving || !courseId} className="inline-flex items-center gap-1 rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Schedule"} <Check size={10} /></button></div>
          </form></aside>}
        </div>
      </div>
    </DashboardShell>
  );
}
