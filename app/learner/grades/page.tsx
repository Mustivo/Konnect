"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Code2,
  Palette,
  Database,
  Calculator,
  ChevronDown,
  ClipboardList,
  MessageSquare,
  X,
  CheckCircle2,
  FileText,
  CalendarDays,
  ExternalLink,
  Award,
} from "lucide-react";
import { apiJson, getMyAssessmentSubmissions } from "@/lib/api";

type AssessedWork = {
  id: string;
  title: string;
  course: string;
  type: "Assignment" | "Exam" | "Quiz";
  gradedDate: string;
  score: number;
  maxScore: number;
  teacher: string;
  feedback: string;
  term?: string;
};

const initialAssessedWorks: AssessedWork[] = [
  {
    id: "grade-1",
    title: "Routing & accessibility",
    course: "React.js",
    type: "Assignment",
    gradedDate: "5 Oct",
    score: 94,
    maxScore: 100,
    teacher: "Sarah Mitchell",
    feedback:
      "Excellent implementation of focus management and ARIA roles. Code structure is clear and follows React best practices.",
    term: "Autumn 2026",
  },
  {
    id: "grade-2",
    title: "Interactive prototype",
    course: "UI/UX Design",
    type: "Assignment",
    gradedDate: "2 Oct",
    score: 92,
    maxScore: 100,
    teacher: "Amara Okafor",
    feedback:
      "Your flow is clear and easy to follow. Add disabled and error states so the prototype covers more real-world scenarios.",
    term: "Autumn 2026",
  },
  {
    id: "grade-3",
    title: "Statistics & probability exam",
    course: "Mathematics",
    type: "Exam",
    gradedDate: "2 Oct",
    score: 92,
    maxScore: 100,
    teacher: "Dr. Elena Ruiz",
    feedback:
      "Great work on Bayes' theorem and hypothesis testing. Clear mathematical notation throughout the submission.",
    term: "Autumn 2026",
  },
  {
    id: "grade-4",
    title: "API fundamentals exam",
    course: "Django",
    type: "Exam",
    gradedDate: "1 Oct",
    score: 86,
    maxScore: 100,
    teacher: "Daniel Brooks",
    feedback:
      "Strong understanding of endpoints. Revisit authentication and explain when a request should return 401 rather than 403.",
    term: "Autumn 2026",
  },
  {
    id: "grade-5",
    title: "Linear functions assessment",
    course: "Mathematics",
    type: "Assignment",
    gradedDate: "25 Sep",
    score: 88,
    maxScore: 100,
    teacher: "Dr. Elena Ruiz",
    feedback:
      "Good solutions. Double-check graph intercept labels on problem 4.",
    term: "Autumn 2026",
  },
  {
    id: "grade-6",
    title: "React fundamentals quiz",
    course: "React.js",
    type: "Quiz",
    gradedDate: "24 Sep",
    score: 90,
    maxScore: 100,
    teacher: "Sarah Mitchell",
    feedback:
      "Strong mastery of props, state, and component lifecycles. All questions answered accurately.",
    term: "Autumn 2026",
  },
  {
    id: "grade-7",
    title: "Wireframes & user flows",
    course: "UI/UX Design",
    type: "Assignment",
    gradedDate: "23 Sep",
    score: 88,
    maxScore: 100,
    teacher: "Amara Okafor",
    feedback:
      "Solid user journey mapping. Make sure wireframe typography hierarchy stays consistent across desktop and mobile screens.",
    term: "Autumn 2026",
  },
  {
    id: "grade-8",
    title: "Views & URL routing",
    course: "Django",
    type: "Assignment",
    gradedDate: "21 Sep",
    score: 82,
    maxScore: 100,
    teacher: "Daniel Brooks",
    feedback:
      "URLs are well organized. Ensure namespaces are used for re-usable app configurations.",
    term: "Autumn 2026",
  },
];

const courseMetrics = [
  {
    id: "react",
    title: "React.js",
    icon: Code2,
    score: 92,
    teacher: "Sarah Mitchell",
    resultsCount: 2,
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    icon: Palette,
    score: 90,
    teacher: "Amara Okafor",
    resultsCount: 2,
  },
  {
    id: "django",
    title: "Django",
    icon: Database,
    score: 84,
    teacher: "Daniel Brooks",
    resultsCount: 2,
  },
  {
    id: "math",
    title: "Mathematics",
    icon: Calculator,
    score: 90,
    teacher: "Dr. Elena Ruiz",
    resultsCount: 2,
  },
];

export default function LearnerGradesPage() {
  const [items, setItems] = useState<AssessedWork[]>(initialAssessedWorks);
  const [selectedClass, setSelectedClass] = useState("All classes");
  const [selectedType, setSelectedType] = useState("All assessment types");
  const [selectedTerm, setSelectedTerm] = useState("Autumn 2026");
  const [activeFeedback, setActiveFeedback] = useState<AssessedWork | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Optional background sync with real API submissions if present
  useEffect(() => {
    let active = true;
    async function loadApiSubmissions() {
      if (!window.localStorage.getItem("konnect-access-token")) return;
      try {
        const response = await getMyAssessmentSubmissions();
        const payload = await apiJson<any>(response);
        const records = Array.isArray(payload) ? payload : payload.results ?? [];
        if (active && records.length > 0) {
          // Map API submissions if they have valid scores
          const mapped: AssessedWork[] = records
            .filter((r: any) => r.total_score !== null && r.total_score !== undefined)
            .map((r: any, idx: number) => ({
              id: String(r.id || `api-${idx}`),
              title: r.assessment_title || r.title || "Assessment",
              course: r.class_title || r.course_title || "General",
              type: r.type === "EXAM" ? "Exam" : r.type === "QUIZ" ? "Quiz" : "Assignment",
              gradedDate: r.submitted_at
                ? new Date(r.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                : "Recent",
              score: Math.round(Number(r.total_score) || 90),
              maxScore: 100,
              teacher: r.teacher_name || "Instructor",
              feedback: r.teacher_feedback || "Well done on completing this assessment.",
              term: "Autumn 2026",
            }));
          if (mapped.length > 0) {
            setItems(mapped);
          }
        }
      } catch {}
    }
    void loadApiSubmissions();
    return () => {
      active = false;
    };
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedClass !== "All classes" && item.course !== selectedClass) {
        return false;
      }
      if (selectedType !== "All assessment types") {
        const normalized = selectedType.replace(/s$/, ""); // "Assignments" -> "Assignment"
        if (item.type !== normalized && item.type !== selectedType) {
          return false;
        }
      }
      if (selectedTerm !== "All terms" && item.term && item.term !== selectedTerm) {
        return false;
      }
      return true;
    });
  }, [items, selectedClass, selectedTerm, selectedType]);

  // Overall calculations
  const totalPoints = useMemo(() => items.reduce((acc, curr) => acc + curr.score, 0), [items]);
  const totalMax = useMemo(() => items.length * 100, [items]);
  const overallAverage = useMemo(
    () => (items.length ? Math.round(totalPoints / items.length) : 89),
    [items, totalPoints]
  );

  // Grade Breakdown by assessment type
  const breakdown = useMemo(() => {
    const assignments = items.filter((i) => i.type === "Assignment");
    const exams = items.filter((i) => i.type === "Exam");
    const quizzes = items.filter((i) => i.type === "Quiz");

    const assignAvg = assignments.length
      ? (assignments.reduce((sum, i) => sum + i.score, 0) / assignments.length).toFixed(1)
      : "88.8";
    const examAvg = exams.length
      ? Math.round(exams.reduce((sum, i) => sum + i.score, 0) / exams.length)
      : 89;
    const quizAvg = quizzes.length
      ? Math.round(quizzes.reduce((sum, i) => sum + i.score, 0) / quizzes.length)
      : 90;

    return [
      { label: `Assignments · ${assignments.length || 5}`, percentage: Number(assignAvg), display: `${assignAvg}%` },
      { label: `Exams · ${exams.length || 2}`, percentage: Number(examAvg), display: `${examAvg}%` },
      { label: `Quizzes · ${quizzes.length || 1}`, percentage: Number(quizAvg), display: `${quizAvg}%` },
    ];
  }, [items]);

  // Two feedback highlights for the right card
  const feedbackHighlights = useMemo(() => {
    return items.slice(1, 3);
  }, [items]);

  return (
    <div className="space-y-4 py-2 pb-10">
      {/* Top Header */}
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#55694c] dark:text-[#a5b89c]">
          YOUR LEARNING SPACE
        </p>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#162114] dark:text-[#ecf2ea]">
          Grades
        </h1>
        <p className="text-[11.5px] text-[#6b7765] dark:text-[#9ea999]">
          See your assessed work, understand your feedback and plan your next step.
        </p>
      </header>

      {/* Overview Cards Row */}
      <section
        aria-label="Grade overview summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
      >
        {/* Card 1: Overall average (Dark Olive Green) */}
        <div className="flex min-h-[112px] flex-col justify-between rounded-xl bg-[#233520] p-4 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#c4d7bf]">Overall average</span>
            <Bookmark size={14} className="text-[#86efac]" />
          </div>
          <div className="my-1">
            <span className="text-[30px] font-bold leading-none tracking-tight">
              {overallAverage}%
            </span>
          </div>
          <p className="text-[9.5px] text-[#9eb299]">
            {totalPoints} / {totalMax} points · {items.length} results
          </p>
        </div>

        {/* Dynamic Course Cards (White) */}
        {courseMetrics.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="flex min-h-[112px] flex-col justify-between rounded-xl border border-[#dfe4db] bg-white p-4 shadow-2xs dark:border-[#273523] dark:bg-[#151c14]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#4e5b49] dark:text-[#c4d0be]">
                  {card.title}
                </span>
                <IconComponent size={14} className="text-[#717e6c] dark:text-[#9ea999]" />
              </div>
              <div className="my-1">
                <span className="text-[28px] font-bold leading-none tracking-tight text-[#182315] dark:text-[#edf2ea]">
                  {card.score}%
                </span>
              </div>
              <p className="truncate text-[9.5px] text-[#717e6c] dark:text-[#9ea999]">
                {card.teacher} · {card.resultsCount} results
              </p>
            </div>
          );
        })}
      </section>

      {/* Filters & Notice Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Class filter */}
          <div className="relative">
            <select
              aria-label="Filter by class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-8 cursor-pointer appearance-none rounded-lg border border-[#dce3d8] bg-white pl-3 pr-7 text-[10.5px] font-medium text-[#354331] shadow-2xs hover:bg-[#f9faf7] dark:border-[#2a3626] dark:bg-[#161d15] dark:text-[#d3ded0]"
            >
              <option value="All classes">All classes</option>
              <option value="React.js">React.js</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Django">Django</option>
              <option value="Mathematics">Mathematics</option>
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687564] dark:text-[#9ca897]"
            />
          </div>

          {/* Assessment Type filter */}
          <div className="relative">
            <select
              aria-label="Filter by assessment type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8 cursor-pointer appearance-none rounded-lg border border-[#dce3d8] bg-white pl-3 pr-7 text-[10.5px] font-medium text-[#354331] shadow-2xs hover:bg-[#f9faf7] dark:border-[#2a3626] dark:bg-[#161d15] dark:text-[#d3ded0]"
            >
              <option value="All assessment types">All assessment types</option>
              <option value="Assignment">Assignments</option>
              <option value="Exam">Exams</option>
              <option value="Quiz">Quizzes</option>
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687564] dark:text-[#9ca897]"
            />
          </div>

          {/* Term filter */}
          <div className="relative">
            <select
              aria-label="Filter by term"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="h-8 cursor-pointer appearance-none rounded-lg border border-[#dce3d8] bg-white pl-3 pr-7 text-[10.5px] font-medium text-[#354331] shadow-2xs hover:bg-[#f9faf7] dark:border-[#2a3626] dark:bg-[#161d15] dark:text-[#d3ded0]"
            >
              <option value="Autumn 2026">Autumn 2026</option>
              <option value="Spring 2026">Spring 2026</option>
              <option value="All terms">All terms</option>
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687564] dark:text-[#9ca897]"
            />
          </div>
        </div>

        <p className="text-[10px] text-[#758270] dark:text-[#96a391]">
          Scores reflect assessed work, not course completion.
        </p>
      </div>

      {/* Main Grid: Left Table & Right Breakdowns */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(310px,1fr)]">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Recent assignments & exam results Table */}
          <section
            aria-label="Recent assignments and exam results"
            className="rounded-xl border border-[#dfe4db] bg-white p-4 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#182315] dark:text-[#edf2ea]">
                Recent assignments &amp; exam results
              </h2>
              <span className="rounded-full bg-[#f0f4ec] px-2.5 py-0.5 text-[8.5px] font-semibold text-[#485942] dark:bg-[#202b1e] dark:text-[#b7caa0]">
                {filteredItems.length} assessed {filteredItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[minmax(0,2.1fr)_100px_90px_75px] border-b border-[#e9ede5] pb-2 text-[8px] font-bold tracking-wider text-[#6d7968] uppercase dark:border-[#293626] dark:text-[#9ca897]">
              <span>Assessed Work</span>
              <span>Type</span>
              <span>Graded</span>
              <span className="text-right">Score</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#edf1ea] dark:divide-[#222e20]">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveFeedback(item);
                    setFeedbackModalOpen(true);
                  }}
                  className="group grid grid-cols-[minmax(0,2.1fr)_100px_90px_75px] items-center py-2.5 text-[10px] cursor-pointer hover:bg-[#f7faf5] transition-colors rounded-sm px-1 dark:hover:bg-[#192418]"
                  title="Click to view full teacher feedback"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-[10.5px] font-semibold text-[#1a2417] group-hover:text-[#28481e] transition-colors dark:text-[#edf2ea]">
                      {item.title}
                    </p>
                    <p className="truncate text-[8.5px] text-[#717e6d] dark:text-[#9aa796]">
                      {item.course}
                    </p>
                  </div>
                  <span className="text-[9.5px] text-[#566551] dark:text-[#b4c3ae]">
                    {item.type}
                  </span>
                  <span className="text-[9.5px] text-[#566551] dark:text-[#b4c3ae]">
                    {item.gradedDate}
                  </span>
                  <span className="text-right text-[10.5px] font-bold text-[#1a2517] dark:text-[#edf2ea]">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
              ))}

              {!filteredItems.length && (
                <div className="py-8 text-center text-[10px] text-[#758270]">
                  No assessed items match your selected filters.
                </div>
              )}
            </div>

            {/* Table Footer Note */}
            <p className="mt-3.5 border-t border-[#e9ede5] pt-2 text-[8.5px] text-[#798574] dark:border-[#293626] dark:text-[#9aa796]">
              All {items.length} items are out of 100 points. The overall average is the mean of these scores.
            </p>
          </section>

          {/* Pending Assignment Banner Card */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#dfe4db] bg-white p-3.5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4e8] text-[#3d5b32] dark:bg-[#23311f] dark:text-[#b2d9a4]">
                <ClipboardList size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-[#1b2519] dark:text-[#edf2ea]">
                  Build a reusable component library
                </p>
                <p className="truncate text-[9.5px] text-[#6d7a69] dark:text-[#9da998]">
                  UI/UX Design · Due 12 Oct, 16:00 BST · Not graded
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-[#dfe5da] bg-[#f5f7f2] px-2.5 py-1 text-[8.5px] font-semibold text-[#54674d] dark:border-[#2d3a29] dark:bg-[#1e281c] dark:text-[#b8c9af]">
              Awaiting submission
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Grade breakdown Card */}
          <section
            aria-label="Grade breakdown statistics"
            className="rounded-xl border border-[#dfe4db] bg-white p-4 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-5"
          >
            <h2 className="text-[14px] font-bold text-[#192315] dark:text-[#edf2ea]">
              Grade breakdown
            </h2>
            <p className="mt-0.5 text-[9.5px] text-[#6e7b6a] dark:text-[#9da998]">
              Average score by assessment type
            </p>

            <div className="mt-4 space-y-3.5">
              {breakdown.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#273224] dark:text-[#dbe5d7]">
                    <span>{item.label}</span>
                    <span>{item.display}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8ede4] dark:bg-[#273623]">
                    <div
                      className="h-full rounded-full bg-[#273e22] transition-all duration-500 dark:bg-[#86efac]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[8.5px] text-[#7a8775] dark:text-[#9aa796]">
              Pending submissions are excluded until a teacher publishes a grade.
            </p>
          </section>

          {/* Feedback to build on Card (Pale Green Tinted) */}
          <section
            aria-label="Feedback to build on"
            className="rounded-xl border border-[#d6e3d2] bg-[#f2f7ef] p-4 shadow-2xs dark:border-[#2a3c26] dark:bg-[#162115] sm:p-5"
          >
            <h2 className="text-[14px] font-bold text-[#182315] dark:text-[#edf2ea]">
              Feedback to build on
            </h2>

            <div className="mt-3.5 space-y-4">
              {feedbackHighlights.map((item) => (
                <article
                  key={item.id}
                  onClick={() => {
                    setActiveFeedback(item);
                    setFeedbackModalOpen(true);
                  }}
                  className="cursor-pointer space-y-1 hover:opacity-90 transition-opacity"
                  title="Click to view full feedback"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-[#1a2517] dark:text-[#edf2ea]">
                      {item.teacher}
                    </h3>
                    <span className="text-[10px] font-bold text-[#2a4522] dark:text-[#86efac]">
                      {item.score} / {item.maxScore}
                    </span>
                  </div>
                  <p className="text-[9.5px] font-medium text-[#5c6d56] dark:text-[#a0b399]">
                    {item.title}
                  </p>
                  <blockquote className="text-[10px] italic leading-relaxed text-[#455240] dark:text-[#c4d4be]">
                    &ldquo;{item.feedback}&rdquo;
                  </blockquote>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveFeedback(items[0] || null);
                setFeedbackModalOpen(true);
              }}
              className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#d2dfcc] bg-white text-[10px] font-bold text-[#24391f] shadow-2xs hover:bg-[#fafcfa] transition-colors dark:border-[#2c3d28] dark:bg-[#182417] dark:text-[#d3e3cd]"
            >
              <MessageSquare size={13} />
              <span>Open teacher feedback</span>
            </button>
          </section>
        </div>
      </div>

      {/* Teacher Feedback Viewer Modal */}
      {feedbackModalOpen && activeFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] animate-in fade-in"
          onClick={() => setFeedbackModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] rounded-2xl border border-[#dce3d8] bg-white p-5 shadow-xl dark:border-[#2b3a27] dark:bg-[#161d15] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4e8] text-[#2c4e23] font-bold text-[12px] dark:bg-[#202e1c] dark:text-[#aee09f]">
                  {activeFeedback.teacher
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <h2
                    id="feedback-dialog-title"
                    className="text-[15px] font-bold text-[#182315] dark:text-[#edf2ea]"
                  >
                    Teacher Feedback &amp; Review
                  </h2>
                  <p className="text-[10px] text-[#6d7968] dark:text-[#9ea999]">
                    Instructor: {activeFeedback.teacher} · {activeFeedback.course}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="rounded-lg p-1 text-[#6b7965] hover:bg-[#f1f5ee] dark:text-[#9ea999] dark:hover:bg-[#202b1d]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-[#f5f8f3] p-4 dark:bg-[#1a2518]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#546b4c] dark:text-[#a5c49b]">
                    {activeFeedback.type}
                  </span>
                  <h3 className="mt-0.5 text-[13px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                    {activeFeedback.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-[#27481e] px-2.5 py-1 text-[11px] font-extrabold text-white">
                    {activeFeedback.score} / {activeFeedback.maxScore}
                  </span>
                  <p className="mt-0.5 text-[8.5px] text-[#717e6d] dark:text-[#9ca897]">
                    Graded on {activeFeedback.gradedDate}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 border-t border-[#e2ebd9] pt-3 dark:border-[#273722]">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#576b50] dark:text-[#9eb595]">
                  Instructor Comments
                </p>
                <blockquote className="mt-1 text-[11px] italic leading-relaxed text-[#354530] dark:text-[#cfe2c9]">
                  &ldquo;{activeFeedback.feedback}&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Quick selector of other items */}
            <div className="mt-4">
              <p className="text-[9px] font-semibold text-[#6d7968] uppercase tracking-wider mb-2">
                All assessed items
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {items.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setActiveFeedback(i)}
                    className={`rounded-lg px-2.5 py-1 text-[9px] font-semibold transition ${
                      activeFeedback.id === i.id
                        ? "bg-[#25491d] text-white shadow-xs"
                        : "border border-[#dce3d8] bg-white text-[#4a5843] hover:bg-[#f6f9f3] dark:border-[#2d3a29] dark:bg-[#172015] dark:text-[#c4d4be]"
                    }`}
                  >
                    {i.title} ({i.score}%)
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="h-8 rounded-lg bg-[#25491d] px-4 text-[10px] font-bold text-white hover:bg-[#346028] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}