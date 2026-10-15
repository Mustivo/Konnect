"use client";

import type { FormEventHandler, RefObject, Dispatch, SetStateAction } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  X,
} from "lucide-react";
import {
  activityKinds,
  classOptions,
  questions,
  type ActivityKind,
} from "../_lib/assignment-data";

type CreateAssignmentPanelProps = {
  assignmentType: ActivityKind;
  assignmentClass: string;
  title: string;
  dueDate: string;
  maxMarks: string;
  fileName: string;
  questionIndex: number;
  notice: string;
  titleInput: RefObject<HTMLInputElement | null>;
  onAssignmentTypeChange: (kind: ActivityKind) => void;
  onAssignmentClassChange: (className: string) => void;
  onTitleChange: (title: string) => void;
  onDueDateChange: (dueDate: string) => void;
  onMaxMarksChange: (maxMarks: string) => void;
  onFileNameChange: (fileName: string) => void;
  onQuestionIndexChange: Dispatch<SetStateAction<number>>;
  onNoticeChange: (notice: string) => void;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function CreateAssignmentPanel({
  assignmentType,
  assignmentClass,
  title,
  dueDate,
  maxMarks,
  fileName,
  questionIndex,
  notice,
  titleInput,
  onAssignmentTypeChange,
  onAssignmentClassChange,
  onTitleChange,
  onDueDateChange,
  onMaxMarksChange,
  onFileNameChange,
  onQuestionIndexChange,
  onNoticeChange,
  onClose,
  onSubmit,
}: CreateAssignmentPanelProps) {
  const question = questions[questionIndex];

  return (
    <aside className="min-w-0 md:sticky md:top-2">
      <form
        onSubmit={onSubmit}
        className="space-y-2 rounded-xl border border-[#e0e5dd] bg-white p-3 shadow-[0_4px_16px_rgba(26,39,20,0.08)] dark:border-[#2a312a] dark:bg-[#161b17]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[11px] font-bold text-[#20291e] dark:text-[#ecf1e9]">
              Create assignment
            </h2>
            <p className="text-[7px] text-[#7b8574] dark:text-[#9aa592]">
              Prepare a new learning moment for your class.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close create assignment panel"
            onClick={onClose}
            className="grid size-6 place-items-center rounded-full text-[#56634f] hover:bg-[#f1f4ed] dark:text-[#bdc9b6] dark:hover:bg-[#252e22]"
          >
            <X size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">
            Type
            <select
              value={assignmentType}
              onChange={(event) => onAssignmentTypeChange(event.target.value as ActivityKind)}
              className="mt-1 h-7 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
            >
              {activityKinds.map((kind) => <option key={kind}>{kind}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">
            Class
            <select
              value={assignmentClass}
              onChange={(event) => onAssignmentClassChange(event.target.value)}
              className="mt-1 h-7 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
            >
              {classOptions.map((className) => <option key={className}>{className}</option>)}
            </select>
          </label>
        </div>

        <label className="block space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">
          Title
          <input
            ref={titleInput}
            required
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
          />
        </label>

        <div className="grid grid-cols-[1.4fr_0.8fr] gap-2">
          <label className="block space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">
            Due date
            <input
              required
              type="datetime-local"
              value={dueDate}
              onChange={(event) => onDueDateChange(event.target.value)}
              className="mt-1 h-8 w-full min-w-0 rounded-md border border-[#e1e6dc] bg-white px-2 text-[7px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
            />
          </label>
          <label className="block space-y-1 text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">
            Maximum marks
            <input
              required
              min="1"
              type="number"
              value={maxMarks}
              onChange={(event) => onMaxMarksChange(event.target.value)}
              className="mt-1 h-8 w-full min-w-0 rounded-md border border-[#e1e6dc] bg-white px-2 text-[8px] font-normal outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
            />
          </label>
        </div>

        <div className="text-[7px] font-semibold text-[#30392d] dark:text-[#d8e0d2]">
          Question-list upload
          <label className="mt-1 flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#cbd5c4] bg-[#f7f9f5] px-2 text-[8px] font-normal text-[#52624b] hover:bg-[#f0f4ed] dark:border-[#3a4636] dark:bg-[#202720] dark:text-[#c5d6b8]">
            <FileText size={13} />
            <span className="min-w-0 flex-1 truncate">{fileName || "Choose a PDF or question file"}</span>
            <CheckCircle2 size={12} className="shrink-0 text-[#57784b]" />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(event) => onFileNameChange(event.target.files?.[0]?.name ?? "")}
            />
          </label>
        </div>

        <section
          className="space-y-2 rounded-lg bg-[#f1f4ed] p-3 dark:bg-[#20271e]"
          aria-label="Assignment preview"
        >
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold uppercase tracking-wide text-[#7b8574] dark:text-[#aab6a1]">
              {assignmentClass.split(" · ")[0]} · Grade 9
            </span>
            <span className="rounded-full bg-[#e0ecd9] px-2 py-1 text-[7px] font-semibold text-[#4d6740] dark:bg-[#2d3a28] dark:text-[#c5d6b8]">
              {maxMarks} marks
            </span>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#243020] dark:text-[#e5ebdf]">{question.title}</h3>
            <p className="mt-1 text-[7px] leading-relaxed text-[#697464] dark:text-[#b1bba9]">{question.prompt}</p>
          </div>
          <p className="py-1 text-center text-[16px] font-bold tracking-[0] text-[#273423] dark:text-[#e5ebdf]">
            {question.expression}
          </p>
          <p className="text-[6px] text-[#778171] dark:text-[#9ca797]">
            Working space · Explain your method clearly.
          </p>
          <div className="flex items-center justify-between border-t border-[#dce5d5] pt-2 dark:border-[#354130]">
            <button
              type="button"
              aria-label="Previous question"
              onClick={() => onQuestionIndexChange((index) => (index + questions.length - 1) % questions.length)}
              className="flex size-6 items-center justify-center rounded-full bg-white text-[#52624b] hover:bg-[#e4ecdf] dark:bg-[#2a3327] dark:text-[#d5e0ce]"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-[7px] font-semibold text-[#687362] dark:text-[#b1bba9]">
              {questionIndex + 1}/{questions.length}
            </span>
            <button
              type="button"
              aria-label="Next question"
              onClick={() => onQuestionIndexChange((index) => (index + 1) % questions.length)}
              className="flex size-6 items-center justify-center rounded-full bg-white text-[#52624b] hover:bg-[#e4ecdf] dark:bg-[#2a3327] dark:text-[#d5e0ce]"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </section>

        <p className="flex items-start gap-1 text-[6px] leading-relaxed text-[#7b8574] dark:text-[#9ca797]">
          <Lightbulb size={10} className="mt-0.5 shrink-0" />
          12 questions · {maxMarks} marks total. Students will see this assignment when you publish it.
        </p>

        {notice && (
          <p role="status" className="rounded-md bg-[#e7f0e2] px-2 py-1.5 text-[7px] font-medium text-[#405d36] dark:bg-[#263521] dark:text-[#c5d6b8]">
            {notice}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-[#edf0e9] pt-2 dark:border-[#2a312a]">
          <button
            type="button"
            onClick={() => onNoticeChange("Draft saved. You can return to it anytime.")}
            className="rounded-full bg-[#f0f3ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white hover:bg-[#304d2b]"
          >
            Publish <Check size={10} />
          </button>
        </div>
      </form>
    </aside>
  );
}
