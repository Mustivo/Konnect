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
      <div className="space-y-3 py-1">
        <header>
          <h1 className="text-[20px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">
            Assignments
          </h1>
          <p className="text-[9px] text-[#707c6c] dark:text-[#9aa592]">
            Practice, check understanding and keep learning on track.
          </p>
        </header>

        <div
          className={`grid items-start gap-3 ${
            panelOpen
              ? "grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.95fr)]"
              : "grid-cols-1"
          }`}
        >
          <AssignmentActivityWorkspace
            activeKind={activeKind}
            assignments={assignments}
            classFilter={classFilter}
            monthFilter={monthFilter}
            maxMarks={maxMarks}
            reviewed={reviewed}
            onKindChange={setActiveKind}
            onClassChange={setClassFilter}
            onMonthChange={setMonthFilter}
            onReview={markReviewed}
            onCreate={openCreatePanel}
          />

          {panelOpen && (
            <CreateAssignmentPanel
              assignmentType={assignmentType}
              assignmentClass={assignmentClass}
              title={title}
              dueDate={dueDate}
              maxMarks={maxMarks}
              fileName={fileName}
              questionIndex={questionIndex}
              notice={notice}
              titleInput={titleInput}
              onAssignmentTypeChange={setAssignmentType}
              onAssignmentClassChange={setAssignmentClass}
              onTitleChange={setTitle}
              onDueDateChange={setDueDate}
              onMaxMarksChange={setMaxMarks}
              onFileNameChange={setFileName}
              onQuestionIndexChange={setQuestionIndex}
              onNoticeChange={setNotice}
              onClose={() => setPanelOpen(false)}
              onSubmit={publishAssignment}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
