"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Upload,
} from "lucide-react";

type AssignmentGroup = "Upcoming" | "Submitted" | "Graded";
type AssignmentState = "Not started" | "In progress" | "Submitted" | "Graded";

type Assignment = {
  id: string;
  course: string;
  instructor: string;
  title: string;
  due: string;
  state: AssignmentState;
  group: AssignmentGroup;
  badge: string;
  progress?: string;
  description: string;
  requirements: string[];
  submittedLink?: string;
  submittedFile?: string;
  draftLink?: string;
  draftFile?: string;
  score?: string;
};

const initialAssignments: Assignment[] = [
  {
    id: "component-library",
    course: "UI/UX Design",
    instructor: "Amara Okafor",
    title: "Build a reusable component library",
    due: "Mon, 12 Oct 2026 · 18:00 BST",
    state: "Not started",
    group: "Upcoming",
    badge: "New · Not started",
    description:
      "Use today's design-system principles to build a small, reusable library in Figma. Create clear tokens, components and guidance for a product team.",
    requirements: [
      "Define color, typography and spacing tokens",
      "Create buttons, inputs and cards with variants",
      "Document states and show one example screen",
    ],
  },
  {
    id: "linear-functions",
    course: "Mathematics",
    instructor: "Dr. Elena Ruiz",
    title: "Linear functions practice",
    due: "Thu, 8 Oct 2026 · 18:00 BST",
    state: "In progress",
    group: "Upcoming",
    badge: "Due soon",
    progress: "Draft saved · 6 of 10 questions complete",
    description:
      "Complete the practice set on linear relationships. Show your working for each answer and include a graph for the final question.",
    requirements: [
      "Complete all ten practice questions",
      "Show working for each answer",
      "Include a labeled graph for question ten",
    ],
  },
  {
    id: "hooks-dashboard",
    course: "React.js",
    instructor: "Sarah Mitchell",
    title: "Create a hooks-based task dashboard",
    due: "Sat, 10 Oct 2026 · 18:00 BST",
    state: "In progress",
    group: "Upcoming",
    badge: "In progress",
    progress: "Draft saved · 2 of 4 requirements complete",
    description:
      "Build a small task dashboard using React hooks. Keep state updates predictable and make the main task workflow usable on mobile.",
    requirements: [
      "Create, complete and remove tasks",
      "Use React state for the task list",
      "Add an empty state and responsive layout",
    ],
  },
  {
    id: "library-database",
    course: "Django",
    instructor: "Daniel Brooks",
    title: "Model a library database",
    due: "Wed, 7 Oct 2026 · 18:00 BST",
    state: "Submitted",
    group: "Submitted",
    badge: "Awaiting grade",
    description:
      "Create the core models for a small library and submit your project for instructor review.",
    requirements: ["Add book and author models", "Define the model relationships"],
    submittedFile: "library-models.zip",
  },
  {
    id: "interactive-prototype",
    course: "UI/UX Design",
    instructor: "Amara Okafor",
    title: "Interactive prototype",
    due: "Fri, 2 Oct 2026 · 18:00 BST",
    state: "Graded",
    group: "Graded",
    badge: "Graded",
    description:
      "Create a clickable prototype that demonstrates the primary user flow and key interaction states.",
    requirements: ["Connect the primary user flow", "Show loading and error states"],
    submittedFile: "interactive-prototype.fig",
    score: "92 / 100",
  },
];

const tabs: { label: AssignmentGroup; count: number }[] = [
  { label: "Upcoming", count: 3 },
  { label: "Submitted", count: 1 },
  { label: "Graded", count: 8 },
];

const courseOptions = ["All classes", "UI/UX Design", "Mathematics", "React.js", "Django"];
const stateOptions: ("All statuses" | AssignmentState)[] = [
  "All statuses",
  "Not started",
  "In progress",
  "Submitted",
  "Graded",
];

function downloadBrief() {
  const encoder = new TextEncoder();
  const stream = [
    "BT",
    "/F1 18 Tf",
    "72 730 Td",
    "(Component Library Brief) Tj",
    "/F1 11 Tf",
    "0 -32 Td",
    "(Build a reusable component library in Figma.) Tj",
    "0 -18 Td",
    "(Define color, typography, spacing, buttons, and cards.) Tj",
    "0 -18 Td",
    "(Document component states and show one example screen.) Tj",
    "ET",
  ].join("\n");
  const streamObject = `${stream}\n`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${encoder.encode(streamObject).length} >>\nstream\n${streamObject}endstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((object, index) => {
    const offset = encoder.encode(pdf).length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const crossReferenceOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`;

  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "Component-library-brief.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [activeGroup, setActiveGroup] = useState<AssignmentGroup>("Upcoming");
  const [courseFilter, setCourseFilter] = useState("All classes");
  const [stateFilter, setStateFilter] = useState<(typeof stateOptions)[number]>("All statuses");
  const [selectedId, setSelectedId] = useState("component-library");
  const [submissionLink, setSubmissionLink] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".learner-main-scroll");
    if (main) main.scrollTop = 0;
  }, []);

  const visibleAssignments = assignments.filter((assignment) =>
    assignment.group === activeGroup &&
    (courseFilter === "All classes" || assignment.course === courseFilter) &&
    (stateFilter === "All statuses" || assignment.state === stateFilter),
  );
  const selectedAssignment = visibleAssignments.find((assignment) => assignment.id === selectedId)
    ?? visibleAssignments[0]
    ?? null;

  function openAssignment(assignment: Assignment) {
    setSelectedId(assignment.id);
    setSubmissionLink(assignment.draftLink ?? "");
    setAttachedFile(null);
    setNotice("");
  }

  function updateSelected(update: Partial<Assignment>) {
    if (!selectedAssignment) return;
    setAssignments((current) => current.map((assignment) =>
      assignment.id === selectedAssignment.id ? { ...assignment, ...update } : assignment,
    ));
  }

  function submitAssignment() {
    if (!selectedAssignment || (!submissionLink.trim() && !attachedFile)) {
      setNotice("Add a Figma link or attach a file before submitting.");
      return;
    }

    updateSelected({
      group: "Submitted",
      state: "Submitted",
      badge: "Awaiting review",
      submittedLink: submissionLink.trim() || undefined,
      submittedFile: attachedFile?.name,
    });
    setActiveGroup("Submitted");
    setStateFilter("All statuses");
    setNotice("Assignment submitted for review.");
  }

  return (
    <DashboardShell role="learner">
      <div className="space-y-4 pb-8 pt-1">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#35452e] dark:text-[#a4b49e]">
          YOUR LEARNING SPACE
        </p>
        <h1 className="text-[20px] font-bold leading-tight text-[#151b14] dark:text-[#edf1e9]">Assignments</h1>
        <p className="mt-1 text-[9px] text-[#70796b] dark:text-[#9aa592]">Turn what you learned into something you can share.</p>
      </header>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Assignment summary">
        <article className="min-h-[78px] rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]">
          <div className="flex items-center justify-between text-[8px] text-[#788172] dark:text-[#a0aa99]">
            <span>Upcoming assignments</span><CalendarDays size={12} className="text-[#526445] dark:text-[#b9caa9]" />
          </div>
          <p className="mt-1 text-[21px] font-bold leading-none">3</p>
          <p className="mt-2 text-[7px] text-[#788172] dark:text-[#a0aa99]">Across your enrolled classes</p>
        </article>
        <article className="min-h-[78px] rounded-lg border border-[#263d21] bg-[#263d21] p-3 text-white dark:border-[#34482e] dark:bg-[#20291d]">
          <div className="flex items-center justify-between text-[8px] text-[#d2ddc8]">
            <span>Your next priority</span><Clock3 size={12} />
          </div>
          <p className="mt-1 text-[21px] font-bold leading-none">8 Oct</p>
          <p className="mt-2 text-[7px] text-[#d2ddc8]">Linear functions practice · 18:00 BST</p>
        </article>
        <article className="min-h-[78px] rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]">
          <div className="flex items-center justify-between text-[8px] text-[#788172] dark:text-[#a0aa99]">
            <span>Submitted for review</span><Check size={13} className="text-[#526445] dark:text-[#b9caa9]" />
          </div>
          <p className="mt-1 text-[21px] font-bold leading-none">1</p>
          <p className="mt-2 text-[7px] text-[#788172] dark:text-[#a0aa99]">Django · Waiting for teacher feedback</p>
        </article>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Assignment status">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={activeGroup === tab.label}
              onClick={() => { setActiveGroup(tab.label); setNotice(""); }}
              className={`rounded-md border px-2.5 py-1.5 text-[8px] font-semibold transition ${activeGroup === tab.label
                ? "border-[#263d21] bg-[#263d21] text-white"
                : "border-[#dce3d6] bg-white text-[#43503d] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]"
              }`}
            >
              {tab.label} · {tab.count}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          <label className="sr-only" htmlFor="assignment-course-filter">Filter by class</label>
          <select
            id="assignment-course-filter"
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="h-7 rounded-md border border-[#dce3d6] bg-white px-2 text-[8px] font-semibold text-[#43503d] outline-none dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]"
          >
            {courseOptions.map((course) => <option key={course}>{course}</option>)}
          </select>
          <label className="sr-only" htmlFor="assignment-state-filter">Filter by status</label>
          <select
            id="assignment-state-filter"
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value as (typeof stateOptions)[number])}
            className="h-7 rounded-md border border-[#dce3d6] bg-white px-2 text-[8px] font-semibold text-[#43503d] outline-none dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]"
          >
            {stateOptions.map((state) => <option key={state}>{state}</option>)}
          </select>
        </div>
      </div>

      <div className="grid items-start gap-2.5 lg:grid-cols-[minmax(250px,0.92fr)_minmax(0,1.72fr)]">
        <section className="min-w-0 space-y-2" aria-label={`${activeGroup} assignments`}>
          {visibleAssignments.map((assignment) => {
            const isSelected = selectedAssignment?.id === assignment.id;
            return (
              <button
                key={assignment.id}
                type="button"
                onClick={() => openAssignment(assignment)}
                aria-pressed={isSelected}
                className={`w-full rounded-lg border p-2.5 text-left transition ${isSelected
                  ? "border-[#819371] bg-[#eaf0e3] dark:border-[#586d4a] dark:bg-[#20291d]"
                  : "border-[#e0e5dd] bg-white hover:border-[#b8c4ad] dark:border-[#2a312a] dark:bg-[#161b17] dark:hover:border-[#586d4a]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[7px] font-semibold uppercase text-[#536447] dark:text-[#b9caa9]">
                    {assignment.course} · {assignment.instructor}
                  </p>
                  <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[6px] font-semibold text-[#626c5d] dark:bg-[#171d16] dark:text-[#c2ccb9]">
                    {assignment.badge}
                  </span>
                </div>
                <h2 className="mt-1 text-[10px] font-semibold leading-tight text-[#20271d] dark:text-[#edf1e9]">{assignment.title}</h2>
                <p className="mt-1 text-[7px] text-[#70796b] dark:text-[#9aa592]">Due {assignment.due}</p>
                {assignment.progress && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[6px] text-[#788172] dark:text-[#a0aa99]">{assignment.progress}</span>
                    <span className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-white dark:bg-[#171d16]">
                      <span className={`block h-full rounded-full ${assignment.id === "linear-functions" ? "w-3/5" : "w-1/2"} bg-[#344d2d]`} />
                    </span>
                  </div>
                )}
                {(assignment.score || assignment.submittedFile) && !assignment.progress && (
                  <p className="mt-1 text-[7px] font-semibold text-[#536447] dark:text-[#b9caa9]">
                    {assignment.score ? `Score · ${assignment.score}` : `Submitted · ${assignment.submittedFile}`}
                  </p>
                )}
              </button>
            );
          })}

          {visibleAssignments.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#cbd4c4] bg-white/70 px-4 py-8 text-center dark:border-[#35432f] dark:bg-[#161b17]">
              <p className="text-[9px] font-semibold">No assignments match these filters.</p>
              <button type="button" onClick={() => { setCourseFilter("All classes"); setStateFilter("All statuses"); }} className="mt-2 text-[8px] font-semibold text-[#536d43] underline underline-offset-2 dark:text-[#b9caa9]">Clear filters</button>
            </div>
          )}

          {activeGroup === "Upcoming" && (
            <section className="rounded-lg border border-[#e0e5dd] bg-white p-2.5 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label="Latest activity">
              <h2 className="text-[9px] font-semibold">Latest activity</h2>
              <button type="button" onClick={() => { setActiveGroup("Submitted"); setStateFilter("All statuses"); setSelectedId("library-database"); }} className="mt-2 flex w-full items-center justify-between gap-2 border-b border-[#edf0e9] pb-2 text-left dark:border-[#2a312a]">
                <span><span className="block text-[7px] font-semibold">Django · Model a library database</span><span className="mt-0.5 block text-[6px] text-[#788172] dark:text-[#a0aa99]">Submitted 5 Oct · Due 7 Oct, 18:00 BST</span></span>
                <span className="shrink-0 rounded-full bg-[#f8f0df] px-2 py-1 text-[6px] font-semibold text-[#8a6530]">Awaiting grade</span>
              </button>
              <button type="button" onClick={() => { setActiveGroup("Graded"); setStateFilter("All statuses"); setSelectedId("interactive-prototype"); }} className="mt-2 flex w-full items-center justify-between gap-2 text-left">
                <span><span className="block text-[7px] font-semibold">UI/UX Design · Interactive prototype</span><span className="mt-0.5 block text-[6px] text-[#788172] dark:text-[#a0aa99]">Graded 2 Oct · Teacher feedback available</span></span>
                <span className="shrink-0 text-[10px] font-bold text-[#536447] dark:text-[#b9caa9]">92 / 100</span>
              </button>
            </section>
          )}
        </section>

        <section className="min-w-0 rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]" aria-label="Assignment details">
          {selectedAssignment ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[7px] font-semibold uppercase text-[#536447] dark:text-[#b9caa9]">
                  {selectedAssignment.group === "Upcoming" ? "AFTER YOUR CLASS" : `${selectedAssignment.group.toUpperCase()} ASSIGNMENT`}
                </p>
                <span className="shrink-0 rounded-full bg-[#f1f3ed] px-2 py-1 text-[6px] font-semibold text-[#687260] dark:bg-[#252c22] dark:text-[#b2bcae]">{selectedAssignment.badge}</span>
              </div>
              <h2 className="mt-2 text-[16px] font-bold leading-tight text-[#20271d] dark:text-[#edf1e9]">{selectedAssignment.title}</h2>
              <p className="mt-2 text-[7px] text-[#70796b] dark:text-[#9aa592]">{selectedAssignment.course} — {selectedAssignment.instructor}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[8px] font-semibold text-[#303a2a] dark:text-[#dce5d7]"><CalendarDays size={11} />{selectedAssignment.due}</p>

              <div className="my-2.5 border-t border-[#edf0e9] dark:border-[#2a312a]" />
              <h3 className="text-[9px] font-semibold">Your brief</h3>
              <p className="mt-1.5 text-[8px] leading-[1.5] text-[#737b70] dark:text-[#a0aa99]">{selectedAssignment.description}</p>
              <ul className="mt-2 space-y-1">
                {selectedAssignment.requirements.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-1.5 text-[7px] leading-snug text-[#303a2a] dark:text-[#dce5d7]">
                    <CheckCircle2 size={10} className="mt-px shrink-0 text-[#526b43] dark:text-[#b9caa9]" />{requirement}
                  </li>
                ))}
              </ul>

              <div className="mt-2.5 flex items-center gap-2 rounded-md bg-[#f1f3ec] p-2 dark:bg-[#20261f]">
                <FileText size={13} className="shrink-0 text-[#657657] dark:text-[#b9caa9]" />
                <span className="min-w-0 flex-1"><span className="block truncate text-[7px] font-semibold">Component-library-brief.pdf</span><span className="mt-0.5 block text-[6px] text-[#788172] dark:text-[#a0aa99]">PDF · 1.2 MB</span></span>
                <button type="button" onClick={downloadBrief} aria-label="Download assignment brief" title="Download brief" className="grid size-6 shrink-0 place-items-center rounded text-[#526445] hover:bg-white dark:text-[#b9caa9] dark:hover:bg-[#171d16]"><Download size={12} /></button>
              </div>

              {selectedAssignment.group === "Upcoming" ? (
                <>
                  <h3 className="mt-2.5 text-[8px] font-semibold">Your submission</h3>
                  <label className="sr-only" htmlFor="submission-link">Paste your Figma file link</label>
                  <input
                    id="submission-link"
                    type="url"
                    value={submissionLink}
                    onChange={(event) => setSubmissionLink(event.target.value)}
                    placeholder="Paste your Figma file link..."
                    className="mt-1.5 h-7 w-full rounded-md border border-[#e0e5dc] bg-white px-2 text-[7px] outline-none placeholder:text-[#a2aaa0] focus:border-[#829576] focus:ring-2 focus:ring-[#dce6d5] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#edf1e9] dark:placeholder:text-[#788875]"
                  />
                  <label className="mt-1.5 flex min-h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-[#dfe5da] px-2 py-1.5 text-[7px] text-[#687260] hover:bg-[#f8faf6] dark:border-[#35432f] dark:text-[#b2bcae] dark:hover:bg-[#20261f]">
                    <Upload size={11} />
                    <span className="truncate">{attachedFile ? attachedFile.name : "Add a file · PDF or ZIP, up to 25 MB"}</span>
                    <input
                      type="file"
                      accept=".pdf,.zip,application/pdf,application/zip"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        if (file && file.size > 25 * 1024 * 1024) {
                          setAttachedFile(null);
                          setNotice("Choose a file smaller than 25 MB.");
                          return;
                        }
                        setAttachedFile(file);
                        setNotice("");
                      }}
                    />
                  </label>
                  {notice && <p role="status" className="mt-1.5 text-[7px] text-[#536d43] dark:text-[#b9caa9]">{notice}</p>}
                  <p className="mt-1.5 text-[6px] text-[#858c80] dark:text-[#9aa592]">No files added. Check link access before submitting.</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateSelected({ draftLink: submissionLink.trim() || undefined, draftFile: attachedFile?.name });
                        setNotice("Draft saved.");
                      }}
                      className="h-7 rounded-md border border-[#dfe5da] px-2.5 text-[7px] font-semibold text-[#536447] hover:bg-[#f5f7f2] dark:border-[#35432f] dark:text-[#c2ccb9] dark:hover:bg-[#20261f]"
                    >Save draft</button>
                    <button
                      type="button"
                      onClick={submitAssignment}
                      className="inline-flex h-7 min-w-[150px] flex-1 items-center justify-center gap-1.5 rounded-md bg-[#263d21] px-3 text-[7px] font-semibold text-white hover:bg-[#1c3019] dark:bg-[#34482e] dark:hover:bg-[#405b37]"
                    >Submit assignment <ArrowRight size={11} /></button>
                  </div>
                </>
              ) : (
                <div className="mt-2.5 rounded-md bg-[#f1f3ec] p-2.5 dark:bg-[#20261f]">
                  <h3 className="text-[8px] font-semibold">{selectedAssignment.group === "Graded" ? "Instructor feedback" : "Submission received"}</h3>
                  <p className="mt-1 text-[7px] leading-relaxed text-[#737b70] dark:text-[#a0aa99]">
                    {selectedAssignment.group === "Graded"
                      ? `Well structured and easy to follow. Strong interaction states and a thoughtful visual system. Score: ${selectedAssignment.score}.`
                      : "Your work has been sent to your instructor and is waiting for review."}
                  </p>
                  {selectedAssignment.submittedFile && <p className="mt-1.5 text-[7px] font-semibold">File · {selectedAssignment.submittedFile}</p>}
                  {selectedAssignment.submittedLink && <p className="mt-1.5 break-all text-[7px] font-semibold">Link · {selectedAssignment.submittedLink}</p>}
                  {notice && <p role="status" className="mt-1.5 text-[7px] text-[#536d43] dark:text-[#b9caa9]">{notice}</p>}
                </div>
              )}
            </>
          ) : (
            <div className="grid min-h-64 place-items-center text-center">
              <div><Clock3 size={18} className="mx-auto text-[#8b9684]" /><p className="mt-2 text-[9px] font-semibold">Choose an assignment</p><p className="mt-1 text-[7px] text-[#788172]">Its brief and submission details will appear here.</p></div>
            </div>
          )}
        </section>
      </div>
    </div>
  </DashboardShell>
);
}