"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { getExams, LiveExamItem } from "@/lib/api/exams";
import {
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  HelpCircle,
  Play,
  ShieldCheck,
} from "lucide-react";

type Exam = {
  id: string;
  subject: string;
  instructor: string;
  title: string;
  date: string;
  time: string;
  duration: string;
};

const fallbackExams: Exam[] = [
  {
    id: "maths",
    subject: "MATHEMATICS",
    instructor: "Dr. Elena Ruiz",
    title: "Linear functions assessment",
    date: "16 Oct 2026",
    time: "13:30 BST",
    duration: "60 min",
  },
  {
    id: "react",
    subject: "REACT.JS",
    instructor: "Sarah Mitchell",
    title: "State management exam",
    date: "18 Oct 2026",
    time: "09:00 BST",
    duration: "75 min",
  },
  {
    id: "django",
    subject: "DJANGO",
    instructor: "Daniel Brooks",
    title: "Models and database exam",
    date: "21 Oct 2026",
    time: "11:00 BST",
    duration: "90 min",
  },
];

const preparationSteps = [
  { icon: ShieldCheck, title: "Review the rules", detail: "Understand the exam and monitoring requirements." },
  { icon: Camera, title: "Check your devices", detail: "Allow camera and microphone access, then test both." },
  { icon: Play, title: "Start when you are ready", detail: "Your timer starts only after readiness checks and Start exam." },
];

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>(fallbackExams);
  const [activeTab, setActiveTab] = useState("Schedule");
  const [subjectFilter, setSubjectFilter] = useState("All classes");

  // Load real exams from the database table /api/exams/
  useEffect(() => {
    getExams()
      .then(async (res) => {
        const data = await apiJson<LiveExamItem[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Exam[] = data.map((item) => {
            const dateObj = new Date(item.exam_date);
            return {
              id: item.id,
              subject: (item.course_title || "General").split("—")[0].trim().toUpperCase(),
              instructor: item.teacher_name || "Instructor",
              title: item.title,
              date: dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              time: dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " BST",
              duration: `${item.duration_minutes || 90} min`,
            };
          });
          setExams(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback exams due to error loading from database:", err);
      });
  }, []);

  const subjects = useMemo(() => {
    const list = new Set(exams.map((e) => e.subject));
    return ["All classes", ...Array.from(list)];
  }, [exams]);

  const filteredExams = useMemo(
    () => exams.filter((exam) => subjectFilter === "All classes" || exam.subject === subjectFilter.toUpperCase()),
    [exams, subjectFilter],
  );

  const availableCount = exams.length > 0 ? 1 : 0;
  const upcomingCount = Math.max(0, exams.length - 1);
  const tabs = ["Schedule", `Available now · ${availableCount}`, `Upcoming · ${upcomingCount}`];
  const showAvailableExam = activeTab !== `Upcoming · ${upcomingCount}` && (subjectFilter === "All classes" || subjectFilter.toUpperCase().includes("UI/UX"));
  const showUpcomingExams = activeTab !== `Available now · ${availableCount}`;

  return (
    <div className="space-y-4 pb-8 pt-1">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#35452e] dark:text-[#a4b49e]">
          YOUR LEARNING SPACE
        </p>
        <h1 className="text-[20px] font-bold leading-tight text-[#151b14] dark:text-[#edf1e9]">Exams</h1>
        <p className="mt-1 text-[9px] text-[#70796b] dark:text-[#9aa592]">
          View your exam schedule and prepare before you begin.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Exam schedule">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md border px-2.5 py-1 text-[9px] font-semibold transition ${activeTab === tab
                ? "border-[#263d21] bg-[#263d21] text-white"
                : "border-[#dce3d6] bg-white text-[#43503d] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <label className="relative flex items-center">
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            aria-label="Filter exams by class"
            className="h-7 appearance-none rounded-md border border-[#dce3d6] bg-white pl-6 pr-7 text-[8px] font-semibold text-[#43503d] outline-none dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]"
          >
            {subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
          <ChevronDown size={11} className="pointer-events-none absolute left-2 text-[#53634b]" />
        </label>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1.85fr)_minmax(220px,1fr)]">
        {showAvailableExam && (
          <section className="flex min-h-[154px] flex-col justify-between rounded-lg border border-[#899b76] bg-[#eaf0e3] p-3 dark:border-[#42533b] dark:bg-[#20291d] lg:min-h-[194px]">
            <div className="flex items-center justify-between">
              <p className="text-[7px] font-semibold uppercase text-[#536447] dark:text-[#b9caa9]">TODAY&apos;S EXAM</p>
              <span className="text-[7px] font-semibold text-[#536447] dark:text-[#b9caa9]">Available now</span>
            </div>
            <div className="mt-2">
              <p className="text-[7px] font-semibold text-[#61714f] dark:text-[#aabc98]">UI/UX DESIGN · AMARA OKAFOR</p>
              <h2 className="mt-1 text-[16px] font-bold leading-tight text-[#20271d] dark:text-[#edf1e9]">Design systems fundamentals</h2>
              <div className="mt-2 flex items-center gap-3 text-[8px] text-[#5b6554] dark:text-[#b4c0aa]">
                <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> 6 Oct 2026 · 16:00 BST</span>
                <span className="inline-flex items-center gap-1"><Clock3 size={11} /> 90 min</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#d8e0cf] pt-2 dark:border-[#35432f]">
              <div>
                <p className="text-[8px] font-semibold text-[#384333] dark:text-[#e0e8d9]">Review the rules before entering</p>
                <p className="mt-0.5 text-[7px] text-[#788172] dark:text-[#a0aa99]">Next: camera & microphone check. Your timer has not started.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/learner/tasks/exams/rules")}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#263d21] px-2.5 text-[8px] font-semibold text-white hover:bg-[#1c3019]"
              >
                <span aria-hidden="true">→</span> Review rules
              </button>
            </div>
          </section>
        )}

        <section className="rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17] lg:col-start-2 lg:row-start-1">
          <h2 className="text-[12px] font-semibold text-[#20261e] dark:text-[#edf1e9]">A moment to prepare</h2>
          <ul className="mt-2 space-y-2">
            {preparationSteps.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#edf2e8] text-[#465b39] dark:bg-[#2b3627] dark:text-[#c2d2b5]">
                  <Icon size={11} />
                </span>
                <span>
                  <span className="block text-[8px] font-semibold text-[#343c30] dark:text-[#dce5d7]">{title}</span>
                  <span className="mt-0.5 block text-[7px] leading-relaxed text-[#788172] dark:text-[#a0aa99]">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {showUpcomingExams && (
          <section className="space-y-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-[12px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Upcoming exams</h2>
                <span className="text-[7px] text-[#788172] dark:text-[#a0aa99]">{filteredExams.length} scheduled</span>
              </div>
              <span className="text-[7px] text-[#788172] dark:text-[#a0aa99]">All times shown in BST</span>
            </div>

            {filteredExams.map((exam) => (
              <article key={exam.id} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-[#e0e5dd] bg-white px-3 py-2 dark:border-[#2a312a] dark:bg-[#161b17] sm:grid-cols-[minmax(0,1fr)_120px_84px_94px]">
                <div>
                  <p className="text-[6px] font-semibold text-[#536447] dark:text-[#aabc98]">{exam.subject} · {exam.instructor.toUpperCase()}</p>
                  <h3 className="mt-1 text-[9px] font-semibold text-[#252c22] dark:text-[#e8eee3]">{exam.title}</h3>
                </div>
                <div className="text-[7px] text-[#50594b] dark:text-[#c1cbb9]">
                  <p className="font-semibold">{exam.date}</p>
                  <p className="mt-0.5 text-[#80887b] dark:text-[#9ba594]">{exam.time}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[7px] text-[#66705f] dark:text-[#a0aa99]">
                  <Clock3 size={10} /> {exam.duration}
                </span>
                <span className="justify-self-start rounded-full bg-[#f1f3ed] px-2 py-1 text-[6px] font-semibold text-[#687260] dark:bg-[#252c22] dark:text-[#b2bcae] sm:justify-self-end">
                  Not available
                </span>
              </article>
            ))}
          </section>
        )}

        {showUpcomingExams && (
          <p className="text-[7px] text-[#858c80] dark:text-[#929b8b] lg:col-span-2">
            Exam entry becomes available at the scheduled time. You&apos;ll review the rules before checking your devices.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#eaf0e3] px-3 py-2 text-[7px] text-[#65715c] dark:bg-[#20291d] dark:text-[#b0bda5] lg:col-span-2">
          <span className="inline-flex items-center gap-1.5"><HelpCircle size={11} /> Need help preparing or accessing an exam? Contact your teacher or Konnect support.</span>
          <a href="mailto:support@konnect.example" className="font-semibold text-[#35452e] dark:text-[#c3d7ad]">Get help</a>
        </div>
      </div>
    </div>
  );
}
