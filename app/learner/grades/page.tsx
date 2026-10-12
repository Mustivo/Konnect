"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Code,
  PenTool,
  Database,
  Calculator,
  ChevronDown,
  ClipboardList,
  MessageCircle,
} from "lucide-react";

type AssessmentType = "Assignment" | "Exam" | "Quiz";

const courses = [
  { name: "React.js", teacher: "Sarah Mitchell", icon: Code },
  { name: "UI/UX Design", teacher: "Amara Okafor", icon: PenTool },
  { name: "Django", teacher: "Daniel Brooks", icon: Database },
  { name: "Mathematics", teacher: "Dr. Elena Ruiz", icon: Calculator },
];

const results: {
  title: string;
  course: string;
  type: AssessmentType;
  graded: string;
  score: number;
}[] = [
  { title: "Routing & accessibility", course: "React.js", type: "Assignment", graded: "5 Oct", score: 94 },
  { title: "Interactive prototype", course: "UI/UX Design", type: "Assignment", graded: "2 Oct", score: 92 },
  { title: "Statistics & probability exam", course: "Mathematics", type: "Exam", graded: "2 Oct", score: 92 },
  { title: "API fundamentals exam", course: "Django", type: "Exam", graded: "1 Oct", score: 86 },
  { title: "Linear functions assessment", course: "Mathematics", type: "Assignment", graded: "25 Sep", score: 88 },
  { title: "React fundamentals quiz", course: "React.js", type: "Quiz", graded: "24 Sep", score: 90 },
  { title: "Wireframes & user flows", course: "UI/UX Design", type: "Assignment", graded: "23 Sep", score: 88 },
  { title: "Views & URL routing", course: "Django", type: "Assignment", graded: "21 Sep", score: 82 },
];

const feedback = [
  {
    teacher: "Amara Okafor",
    score: 92,
    work: "Interactive prototype",
    quote:
      "Your flow is clear and easy to follow. Add disabled and error states so the prototype covers more real-world scenarios.",
  },
  {
    teacher: "Daniel Brooks",
    score: 86,
    work: "API fundamentals exam",
    quote:
      "Strong understanding of endpoints. Revisit authentication and explain when a request should return 401 rather than 403.",
  },
];

const breakdownTypes: { type: AssessmentType; label: string }[] = [
  { type: "Assignment", label: "Assignments" },
  { type: "Exam", label: "Exams" },
  { type: "Quiz", label: "Quizzes" },
];

// ---- Derived numbers (always computed from the data above) ----
const fmt = (n: number) => `${parseFloat(n.toFixed(1))}%`;
const average = (list: { score: number }[]) =>
  list.reduce((s, r) => s + r.score, 0) / list.length;

const totalPoints = results.reduce((s, r) => s + r.score, 0);
const maxPoints = results.length * 100;
const overallAverage = Math.round((totalPoints / maxPoints) * 100);

const cardHover =
  "transition-colors duration-150 hover:border-[#dfe4d9] hover:bg-[#eaf0e3]";

function Filter({
  value,
  onChange,
  options,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  width: number;
}) {
  return (
    <div className="relative" style={{ width }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[29px] w-full cursor-pointer appearance-none rounded-md border border-[#e2e5dd] bg-white pl-3 pr-7 text-[10px] font-medium text-[#262b24] outline-none focus:border-[#40522c]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#596052]"
      />
    </div>
  );
}

export default function GradesPage() {
  const [classFilter, setClassFilter] = useState("All classes");
  const [typeFilter, setTypeFilter] = useState("All assessment types");
  const [term, setTerm] = useState("Autumn 2026");

  const visible = results.filter(
    (r) =>
      (classFilter === "All classes" || r.course === classFilter) &&
      (typeFilter === "All assessment types" || r.type === typeFilter)
  );

  return (
    <div>
      {/* Heading */}
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-700">
          Your learning space
        </p>
        <h1 className="mt-0.5 text-[26px] font-semibold leading-tight tracking-tight text-gray-900">
          Grades
        </h1>
        <p className="text-[11px] text-gray-600">
          See your assessed work, understand your feedback and plan your next
          step.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-[15px] grid grid-cols-2 gap-[13px] lg:grid-cols-5">
        {/* Overall average: dark */}
        <div className="rounded-[10px] bg-[#283821] p-[15px] text-white">
          <div className="flex h-4 items-center justify-between">
            <p className="text-[11px] text-white/85">Overall average</p>
            <Award size={14} className="text-white/80" />
          </div>
          <p className="mt-2 text-[26px] font-semibold leading-8">
            {overallAverage}%
          </p>
          <p className="mt-2 text-[10px] leading-[14px] text-white/75">
            {totalPoints} / {maxPoints} points · {results.length} results
          </p>
        </div>

        {/* One card per course */}
        {courses.map((c) => {
          const list = results.filter((r) => r.course === c.name);
          const Icon = c.icon;

          return (
            <div
              key={c.name}
              className={`rounded-[10px] border border-[#e4e7df] bg-white p-[15px] ${cardHover}`}
            >
              <div className="flex h-4 items-center justify-between">
                <p className="text-[11px] text-gray-700">{c.name}</p>
                <Icon size={14} className="text-[#283821]" />
              </div>
              <p className="mt-2 text-[26px] font-semibold leading-8 text-gray-900">
                {Math.round(average(list))}%
              </p>
              <p className="mt-2 text-[10px] leading-[14px] text-gray-500">
                {c.teacher} · {list.length} results
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-[7px]">
          <Filter
            width={92}
            value={classFilter}
            onChange={setClassFilter}
            options={["All classes", ...courses.map((c) => c.name)]}
          />
          <Filter
            width={144}
            value={typeFilter}
            onChange={setTypeFilter}
            options={["All assessment types", "Assignment", "Exam", "Quiz"]}
          />
          <Filter
            width={107}
            value={term}
            onChange={setTerm}
            options={["Autumn 2026"]}
          />
        </div>

        <p className="text-[8.5px] text-gray-500">
          Scores reflect assessed work, not course completion.
        </p>
      </div>

      {/* Main grid */}
      <div className="mt-4 grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1fr_359px]">
        {/* Left column */}
        <div>
          {/* Recent assignments & exam results */}
          <section className="rounded-[10px] border border-[#e4e7df] bg-white p-[15px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold leading-5 text-gray-900">
                Recent assignments &amp; exam results
              </h2>
              <span className="flex h-[18px] items-center rounded-full bg-[#eaf0e3] px-2 text-[8px] font-semibold text-[#40522c]">
                {visible.length} assessed items
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                {/* Header */}
                <div className="mt-[10px] grid h-[26px] grid-cols-[315px_107px_77px_1fr] items-center rounded-[4px] bg-[#f2f3ed] px-2 text-[8px] font-medium uppercase tracking-wide text-[#596052]">
                  <span>Assessed work</span>
                  <span>Type</span>
                  <span>Graded</span>
                  <span>Score</span>
                </div>

                {/* Rows */}
                <div className="mt-[9px]">
                  {visible.map((r) => (
                    <div
                      key={r.title}
                      className="grid h-[41.8px] grid-cols-[315px_107px_77px_1fr] items-center border-b border-[#f3f5f1] px-2"
                    >
                      <div className="leading-none">
                        <p className="text-[10.5px] font-semibold text-[#171d15]">
                          {r.title}
                        </p>
                        <p className="mt-[5px] text-[8.5px] text-[#6d7467]">
                          {r.course}
                        </p>
                      </div>

                      <span className="text-[9px] text-[#636a5d]">{r.type}</span>
                      <span className="text-[9px] text-[#636a5d]">{r.graded}</span>
                      <span className="text-[10.5px] font-semibold text-[#40522c]">
                        {r.score} / 100
                      </span>
                    </div>
                  ))}

                  {visible.length === 0 && (
                    <p className="py-6 text-center text-[10px] text-[#6d7467]">
                      No results match these filters.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-[11px] text-[8.5px] leading-3 text-[#6d7467]">
              All {results.length} items are out of 100 points. The overall
              average is the mean of these scores.
            </p>
          </section>

          {/* Pending assignment */}
          <Link
            href="/dashboard/assignments"
            className="mt-4 flex h-[62px] items-center gap-[13px] rounded-[10px] border border-[#e4e7df] bg-white px-[15px] transition-colors duration-150 hover:border-[#dfe4d9] hover:bg-[#eaf0e3]"
          >
            <ClipboardList size={15} className="shrink-0 text-[#262b24]" />

            <div className="flex-1 leading-none">
              <p className="text-[10.5px] font-semibold text-[#171d15]">
                Build a reusable component library
              </p>
              <p className="mt-2 text-[8.5px] text-[#6d7467]">
                UI/UX Design · Due 12 Oct
              </p>
            </div>

            <span className="flex h-[13px] items-center rounded-full bg-[#ebece6] px-2.5 text-[8px] font-medium text-[#596052]">
              Awaiting grade
            </span>
          </Link>
        </div>

        {/* Right column */}
        <div>
          {/* Grade breakdown */}
          <section className="rounded-[10px] border border-[#e4e7df] bg-white p-[15px]">
            <h2 className="text-[15px] font-semibold leading-5 text-gray-900">
              Grade breakdown
            </h2>
            <p className="mt-[11px] text-[8.5px] leading-3 text-[#6d7467]">
              Average score by assessment type
            </p>

            <div className="mt-[13px] space-y-3">
              {breakdownTypes.map(({ type, label }) => {
                const list = results.filter((r) => r.type === type);
                const avg = average(list);

                return (
                  <div key={type}>
                    <div className="flex h-3 items-center justify-between">
                      <span className="text-[9px] text-[#262b24]">
                        {label} · {list.length}
                      </span>
                      <span className="text-[9px] font-semibold text-[#40522c]">
                        {fmt(avg)}
                      </span>
                    </div>

                    <div className="mt-[7px] h-[5px] w-[304px] max-w-full rounded-full bg-[#f2f3ed]">
                      <div
                        className="h-[5px] rounded-full bg-[#40522c]"
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 border-t border-[#f3f5f1] pt-[10px]">
              <p className="text-[8px] leading-3 text-[#6d7467]">
                Pending submissions are excluded until a teacher publishes a
                grade.
              </p>
            </div>
          </section>

          {/* Feedback to build on */}
          <section className="mt-4 rounded-[10px] border border-[#dfe4d9] bg-[#eaf0e3] p-[15px]">
            <h2 className="text-[15px] font-semibold leading-5 text-gray-900">
              Feedback to build on
            </h2>

            {feedback.map((f, i) => (
              <div key={f.teacher} className={i === 0 ? "mt-[14px]" : "mt-[25px]"}>
                <div className="flex h-[14px] items-center justify-between pr-[6px]">
                  <p className="text-[10.5px] font-semibold text-[#171d15]">
                    {f.teacher}
                  </p>
                  <p className="text-[8.5px] font-semibold text-[#262b24]">
                    {f.score} / 100
                  </p>
                </div>

                <p className="mt-[9px] text-[8.5px] font-semibold leading-3 text-[#40522c]">
                  {f.work}
                </p>

                <p className="mt-[7px] text-[9px] leading-[15px] text-[#62695b]">
                  &ldquo;{f.quote}&rdquo;
                </p>
              </div>
            ))}

            <Link
              href="/dashboard/messages"
              className="mt-[10px] flex h-[30px] items-center justify-center gap-1.5 rounded-md border border-[#e2e5dd] bg-white text-[9.5px] font-medium text-[#171d15] transition-colors hover:bg-[#f2f3ed]"
            >
              <MessageCircle size={11} />
              Open teacher feedback
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}