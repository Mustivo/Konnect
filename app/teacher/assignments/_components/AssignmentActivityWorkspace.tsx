"use client";

import {
  Info,
  Plus,
} from "lucide-react";
import {
  activityKinds,
  classOptions,
  feedbackItems,
  getAssignmentStatusClass,
  type ActivityKind,
  type TeacherAssignment,
} from "../_lib/assignment-data";

type AssignmentActivityWorkspaceProps = {
  activeKind: ActivityKind;
  assignments: TeacherAssignment[];
  classFilter: string;
  monthFilter: string;
  maxMarks: string;
  reviewed: string[];
  onKindChange: (kind: ActivityKind) => void;
  onClassChange: (className: string) => void;
  onMonthChange: (month: string) => void;
  onReview: (studentId: string) => void;
  onCreate: () => void;
};

export default function AssignmentActivityWorkspace({
  activeKind,
  assignments,
  classFilter,
  monthFilter,
  maxMarks,
  reviewed,
  onKindChange,
  onClassChange,
  onMonthChange,
  onReview,
  onCreate,
}: AssignmentActivityWorkspaceProps) {
  const visibleAssignments = assignments.filter((assignment) =>
    assignment.kind === activeKind &&
    assignment.className === classFilter &&
    assignment.due.includes(monthFilter.slice(0, 3)),
  );

  return (
    <div className="min-w-0 space-y-3">
      <section aria-label="Class activities" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">
            Class activities
          </h2>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-[#233c20] px-3 text-[8px] font-semibold text-white hover:bg-[#304d2b]"
          >
            <Plus size={12} /> Create
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="teacher-assignment-class-filter">
            Class
          </label>
          <select
            id="teacher-assignment-class-filter"
            value={classFilter}
            onChange={(event) => onClassChange(event.target.value)}
            className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] text-[#3c4638] outline-none focus:border-[#8ca47e] dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]"
          >
            {classOptions.map((className) => (
              <option key={className}>{className}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="teacher-assignment-month-filter">
            Month
          </label>
          <select
            id="teacher-assignment-month-filter"
            value={monthFilter}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-7 min-w-0 flex-1 rounded-md border border-[#e0e5dd] bg-white px-2 text-[8px] text-[#3c4638] outline-none focus:border-[#8ca47e] dark:border-[#2a312a] dark:bg-[#161b17] dark:text-[#e1e8dc]"
          >
            <option>October 2026</option>
            <option>November 2026</option>
            <option>December 2026</option>
          </select>

          <span className="rounded-full bg-[#e5f0df] px-2 py-1 text-[7px] font-semibold text-[#415d37] dark:bg-[#263521] dark:text-[#c5d6b8]">
            100-point activities
          </span>
        </div>

        <div
          className="flex items-center gap-1 border-b border-[#e5e9e1] dark:border-[#2a312a]"
          role="tablist"
          aria-label="Activity type"
        >
          {activityKinds.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={activeKind === kind}
              onClick={() => onKindChange(kind)}
              className={`relative px-3 py-2 text-[8px] font-semibold ${
                activeKind === kind
                  ? "text-[#263d21] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#263d21] dark:text-[#c9dbbd] dark:after:bg-[#c9dbbd]"
                  : "text-[#71806b] hover:text-[#263d21] dark:text-[#9aa592]"
              }`}
            >
              {kind}
            </button>
          ))}
        </div>
      </section>

      <section
        className="overflow-hidden rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]"
        aria-label={`${activeKind} assignments`}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">
              {activeKind} assignments
            </h2>
            <p className="text-[8px] text-[#788173] dark:text-[#9aa592]">
              Live practice and guided problem solving
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-[8px] font-semibold text-[#516846] hover:underline dark:text-[#c5d6b8]"
          >
            See all <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] table-fixed text-left text-[8px]">
            <thead>
              <tr className="bg-[#f1f4ed] text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
                <th className="w-[48%] rounded-l-md px-2 py-2">Assignment</th>
                <th className="w-[18%] px-2 py-2">Due</th>
                <th className="w-[16%] px-2 py-2">Submitted</th>
                <th className="w-[18%] rounded-r-md px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]"
                >
                  <td className="px-2 py-2">
                    <p className="truncate font-semibold text-[#273124] dark:text-[#e5ebdf]">
                      {assignment.title}
                    </p>
                    <p className="truncate text-[7px] text-[#858e7d] dark:text-[#9ca797]">
                      {assignment.className} · {maxMarks} marks
                    </p>
                  </td>
                  <td className="px-2 py-2 text-[#687362] dark:text-[#b3bdab]">
                    {assignment.due}
                  </td>
                  <td className="px-2 py-2 text-[#687362] dark:text-[#b3bdab]">
                    {assignment.submitted}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={`rounded-full px-1.5 py-1 text-[7px] font-semibold ${getAssignmentStatusClass(assignment.status)}`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!visibleAssignments.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[9px] text-[#778171]">
                    No activities for this class and type.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex items-center justify-between text-[7px] text-[#828b7b] dark:text-[#9ca797]">
          <span>
            Showing {visibleAssignments.length} {activeKind.toLowerCase()} activities
          </span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" className="font-semibold text-[#30462a] dark:text-[#c5d6b8]">Prev</button>
            <span className="grid size-5 place-items-center rounded-full bg-[#e5f0df] font-bold text-[#415d37]">1</span>
            <span>2</span>
            <span>3</span>
            <button type="button" aria-label="Next page" className="font-semibold text-[#30462a] dark:text-[#c5d6b8]">Next</button>
          </div>
        </div>
      </section>

      <section
        className="overflow-hidden rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]"
        aria-label="Ready for your feedback"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[11px] font-bold text-[#1d271b] dark:text-[#ecf1ea]">
              Ready for your feedback
            </h2>
            <p className="text-[8px] text-[#788173] dark:text-[#9aa592]">
              Equations with Brackets · 09 Oct 2026
            </p>
          </div>
          <span className="rounded-full bg-[#e5f0df] px-2 py-1 text-[7px] font-semibold text-[#415d37] dark:bg-[#263521] dark:text-[#c5d6b8]">
            {27 - reviewed.length}/28
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(90px,0.75fr)_64px] rounded-md bg-[#f1f4ed] px-2 py-2 text-[7px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
          <span>Student</span><span>Submitted</span><span>Action</span>
        </div>
        {feedbackItems.map((student) => (
          <div
            key={student.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(90px,0.75fr)_64px] items-center border-b border-[#edf0e9] px-2 py-2 last:border-0 dark:border-[#2a312a]"
          >
            <span className="flex min-w-0 items-center gap-2 truncate text-[8px] font-medium text-[#35402f] dark:text-[#e1e8dc]">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e4eee0] text-[7px] font-bold text-[#405c35]">
                {student.name.split(" ").map((part) => part[0]).join("")}
              </span>
              {student.name}
            </span>
            <span className="text-[7px] text-[#778171] dark:text-[#9ca797]">
              {student.submitted}
            </span>
            <button
              type="button"
              onClick={() => onReview(student.id)}
              className="rounded-full bg-[#f1f4ed] px-2 py-1 text-[7px] font-semibold text-[#41513a] hover:bg-[#e5f0df] dark:bg-[#20271e] dark:text-[#c5d6b8]"
            >
              {reviewed.includes(student.id) ? "Reviewed" : "Review"}
            </button>
          </div>
        ))}
      </section>

      <aside className="flex items-start gap-2 rounded-lg bg-[#e7f0e2] p-3 text-[#43543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]">
        <Info size={12} className="mt-0.5 shrink-0" />
        <p className="text-[7px] leading-relaxed">
          <strong>A helpful starting point</strong>
          <br />
          Upload a question-list PDF, review each slide, then publish. You can save a draft and come back to it anytime.
        </p>
      </aside>
    </div>
  );
}
