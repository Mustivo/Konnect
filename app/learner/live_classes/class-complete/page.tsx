"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Download,
  FileText,
  Play,
  Star,
  X,
} from "lucide-react";

const materials = [
  { name: "Design systems — lesson slides", detail: "PDF · 2.4 MB", kind: "slides" },
  { name: "Component library starter file", detail: "Figma file · Open and duplicate to your workspace", kind: "figma" },
];

const feedbackOptions = ["Lesson pace", "Clarity", "Examples", "Materials"];

export default function ClassCompletePage() {
  const [classRating, setClassRating] = useState(4);
  const [teacherRating, setTeacherRating] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [savedMaterials, setSavedMaterials] = useState<string[]>([]);
  const [recordingOpen, setRecordingOpen] = useState(false);

  function toggleTopic(topic: string) {
    setSelectedTopics((topics) => topics.includes(topic)
      ? topics.filter((item) => item !== topic)
      : [...topics, topic]);
  }

  return (
    <div className="space-y-2.5 py-3">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#35452e] dark:text-[#a4b49e]">YOUR LEARNING SPACE</p>
          <h1 className="text-[20px] font-bold leading-tight text-[#151b14] dark:text-[#edf1e9]">Class complete. Keep the momentum.</h1>
          <p className="mt-0.5 text-[8px] text-[#737c70] dark:text-[#a0aa99]">Review your lesson, take the next step and share your experience.</p>
        </div>
        <Link href="/learner/courses" className="inline-flex h-7 items-center gap-1 rounded-md border border-[#dfe5da] bg-white px-2.5 text-[8px] font-semibold text-[#43503d] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]">
          <ArrowLeft size={10} /> Back to My Courses
        </Link>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dce5d3] bg-[#eaf0e3] p-3 dark:border-[#303b2d] dark:bg-[#20291d]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 text-[7px] font-semibold text-[#536447] dark:text-[#b9caa9]">
            <span>Class ended · 15:30 BST</span>
            <span className="inline-flex items-center gap-1"><Check size={10} /> Attended</span>
          </div>
          <h2 className="mt-2 text-[14px] font-bold leading-tight text-[#20271d] dark:text-[#edf1e9]">Design systems &amp; component libraries</h2>
          <p className="mt-1 text-[8px] text-[#6b7562] dark:text-[#a0aa99]">UI/UX Design — From Wireframes to Prototypes · Lesson 6 · Amara Okafor</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[7px] text-[#586552] dark:text-[#c1cbb9]">
            <span className="inline-flex items-center gap-1"><CalendarDays size={10} /> Tue, 6 Oct 2026 · 14:00–15:30 BST</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={10} /> 90 minutes</span>
          </div>
        </div>
        <video
          src="/teachervideo.mp4"
          controls
          preload="metadata"
          aria-label="Class recording preview"
          className="h-[84px] w-full rounded-md bg-[#dce4d5] object-cover sm:h-[76px] sm:w-[150px]"
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-2.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.9fr)]">
        <div className="space-y-2.5">
          <section className="rounded-lg border border-[#e0e5dd] bg-white p-2.5 dark:border-[#2a312a] dark:bg-[#161b17]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Revisit the lesson</h2>
              <span className="rounded-full bg-[#eaf0e3] px-2 py-1 text-[6px] font-semibold text-[#506440] dark:bg-[#2b3627] dark:text-[#c2d2b5]">Recording available</span>
            </div>
            <div className="mt-2 rounded-md bg-[#f2f4ee] p-2 dark:bg-[#20271e]">
              <p className="text-[6px] font-semibold uppercase text-[#536447] dark:text-[#b9caa9]">UI/UX Design / Lesson 6</p>
              <h3 className="mt-1 text-[10px] font-semibold text-[#252c22] dark:text-[#e8eee3]">Design systems &amp; component libraries</h3>
              <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <div className="rounded-md border border-[#e1e6dc] bg-white p-2 dark:border-[#303b2d] dark:bg-[#171d16]">
                  <p className="text-[6px] font-semibold text-[#718064]">TOKENS</p>
                  <p className="mt-0.5 text-[8px] font-semibold">Type · Color · Spacing</p>
                  <p className="text-[6px] text-[#858c80]">A shared foundation</p>
                </div>
                <div className="rounded-md border border-[#e1e6dc] bg-[#eaf0e3] p-2 dark:border-[#303b2d] dark:bg-[#293522]">
                  <p className="text-[6px] font-semibold text-[#718064] dark:text-[#b9caa9]">COMPONENTS</p>
                  <p className="mt-0.5 text-[8px] font-semibold">Buttons · Inputs · Cards</p>
                  <p className="text-[6px] text-[#858c80] dark:text-[#a0aa99]">Consistent by design</p>
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[7px] text-[#788172] dark:text-[#a0aa99]">Class recording · 96 minutes</span>
              <button type="button" onClick={() => setRecordingOpen(true)} className="inline-flex h-7 items-center gap-1 rounded-md bg-[#263d21] px-2.5 text-[7px] font-semibold text-white hover:bg-[#1c3019]"><Play size={10} /> Watch recording</button>
            </div>
          </section>

          <section className="rounded-lg border border-[#e0e5dd] bg-white p-2.5 dark:border-[#2a312a] dark:bg-[#161b17]">
            <h2 className="text-[10px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Class materials</h2>
            <ul className="mt-1.5 space-y-1">
              {materials.map((material) => {
                const isSaved = savedMaterials.includes(material.kind);
                return (
                  <li key={material.kind} className="flex items-center gap-2 rounded-md px-1 py-1">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#edf2e8] text-[#465b39] dark:bg-[#2b3627] dark:text-[#c2d2b5]"><FileText size={12} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[8px] font-semibold text-[#343c30] dark:text-[#e1e8dc]">{material.name}</span>
                      <span className="block truncate text-[6px] text-[#858c80] dark:text-[#9da897]">{material.detail}</span>
                    </span>
                    <button type="button" aria-label={isSaved ? `${material.name} saved` : `Save ${material.name}`} onClick={() => setSavedMaterials((current) => isSaved ? current.filter((kind) => kind !== material.kind) : [...current, material.kind])} className="rounded p-1 text-[#56694a] hover:bg-[#edf2e8] dark:text-[#c2d2b5] dark:hover:bg-[#2b3627]">
                      {isSaved ? <Check size={12} /> : <Download size={12} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#dce5d3] bg-[#eaf0e3] p-2.5 dark:border-[#303b2d] dark:bg-[#20291d]">
            <div>
              <p className="text-[6px] font-semibold uppercase text-[#637554] dark:text-[#b9caa9]">Your next assignment</p>
              <h2 className="mt-0.5 text-[8px] font-semibold text-[#2d3628] dark:text-[#e1e8dc]">Build a reusable component library</h2>
              <p className="text-[6px] text-[#788172] dark:text-[#a0aa99]">Due 12 Oct, 18:00 BST · Awaiting submission · Not graded</p>
            </div>
            <Link href="/learner/resource" className="inline-flex h-6 items-center gap-1 rounded-md border border-[#d4deca] bg-white px-2 text-[7px] font-semibold text-[#43533a] hover:bg-[#f5f7f2] dark:border-[#3b4934] dark:bg-[#171d16] dark:text-[#c2d2b5]">View task <ArrowRight size={10} /></Link>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e0e5dd] bg-white px-2.5 py-2 dark:border-[#2a312a] dark:bg-[#161b17]">
            <span className="inline-flex items-center gap-1.5 text-[7px] font-medium text-[#485342] dark:text-[#c1cbb9]"><FileText size={11} /> No exam was set for this lesson</span>
            <Link href="/learner/grades" className="inline-flex items-center gap-1 text-[7px] font-semibold text-[#40522c] dark:text-[#c3d7ad]">View grades <ArrowRight size={9} /></Link>
          </section>
        </div>

        <div className="space-y-2.5">
          <section className="rounded-lg border border-[#e0e5dd] bg-white p-2.5 dark:border-[#2a312a] dark:bg-[#161b17]">
            <h2 className="text-[12px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Rate this class and teacher</h2>
            <p className="mt-0.5 text-[7px] text-[#788172] dark:text-[#a0aa99]">Share what worked and what could be better.</p>

            <div className="mt-2 border-b border-[#edf0e9] pb-2 dark:border-[#303b2d]">
              <div className="flex items-center justify-between"><h3 className="text-[7px] font-semibold">Class rating</h3><span className="text-[7px] font-semibold text-[#526744] dark:text-[#c2d2b5]">{classRating} / 5</span></div>
              <p className="text-[6px] text-[#858c80] dark:text-[#9da897]">How useful was today&apos;s lesson?</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <button key={index} type="button" aria-label={`Rate class ${index + 1} out of 5`} aria-pressed={classRating === index + 1} onClick={() => setClassRating(index + 1)} className={`flex h-6 w-6 items-center justify-center rounded border ${index < classRating ? "border-[#dce5d3] bg-[#eaf0e3] text-[#566d43] dark:border-[#3b4934] dark:bg-[#293522] dark:text-[#c2d2b5]" : "border-[#e5e9e1] bg-white text-[#adb4a8] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#778271]"}`}><Star size={11} fill={index < classRating ? "currentColor" : "none"} /></button>
                ))}
              </div>
            </div>

            <div className="mt-2 border-b border-[#edf0e9] pb-2 dark:border-[#303b2d]">
              <div className="flex items-center justify-between"><h3 className="text-[7px] font-semibold">Teacher rating</h3><span className="text-[7px] font-semibold text-[#526744] dark:text-[#c2d2b5]">{teacherRating} / 5</span></div>
              <p className="text-[6px] text-[#858c80] dark:text-[#9da897]">How clear and supportive was Amara&apos;s teaching?</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <button key={index} type="button" aria-label={`Rate teacher ${index + 1} out of 5`} aria-pressed={teacherRating === index + 1} onClick={() => setTeacherRating(index + 1)} className={`flex h-6 w-6 items-center justify-center rounded border ${index < teacherRating ? "border-[#dce5d3] bg-[#eaf0e3] text-[#566d43] dark:border-[#3b4934] dark:bg-[#293522] dark:text-[#c2d2b5]" : "border-[#e5e9e1] bg-white text-[#adb4a8] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#778271]"}`}><Star size={11} fill={index < teacherRating ? "currentColor" : "none"} /></button>
                ))}
              </div>
            </div>

            <label className="mt-2 block text-[7px] font-semibold" htmlFor="class-feedback">Your feedback · Optional</label>
            <textarea id="class-feedback" value={feedback} onChange={(event) => setFeedback(event.target.value.slice(0, 1000))} placeholder="What helped you learn? Is there anything you&apos;d like explained differently next time?" className="mt-1 h-14 w-full resize-none rounded-md border border-[#e1e6dc] bg-white p-2 text-[7px] leading-relaxed outline-none placeholder:text-[#939a8f] focus:border-[#9aab8c] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#edf1e9]" />
            <p className="mt-0.5 text-right text-[6px] text-[#92998d]">{feedback.length}/1,000</p>

            <div className="mt-1.5">
              <p className="text-[7px] font-semibold">Feedback topics · Optional</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {feedbackOptions.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return <button key={topic} type="button" aria-pressed={active} onClick={() => setSelectedTopics((items) => active ? items.filter((item) => item !== topic) : [...items, topic])} className={`rounded-full px-2 py-1 text-[6px] font-medium ${active ? "bg-[#dce8d2] text-[#3f5633] dark:bg-[#34442c] dark:text-[#d4e0c7]" : "bg-[#f1f3ed] text-[#687260] dark:bg-[#252c22] dark:text-[#b2bcae]"}`}>{topic}</button>;
                })}
              </div>
            </div>

            <p className="mt-1.5 text-[6px] leading-relaxed text-[#838a80] dark:text-[#9da897]">Your feedback helps improve future classes. Avoid personal or sensitive information. Review the feedback policy for how your comments are used.</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[6px] text-[#858c80] dark:text-[#9da897]">{feedbackSubmitted ? "Submitted" : "Not submitted yet"}</span>
              <button type="button" onClick={() => setFeedbackSubmitted(true)} disabled={feedbackSubmitted} className="h-7 rounded-md bg-[#263d21] px-2.5 text-[7px] font-semibold text-white hover:bg-[#1c3019] disabled:cursor-default disabled:opacity-70">{feedbackSubmitted ? "Feedback submitted" : "➤ Submit feedback"}</button>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#dce5d3] bg-[#eaf0e3] p-2.5 dark:border-[#303b2d] dark:bg-[#20291d]">
            <div><h2 className="text-[8px] font-semibold text-[#303a2a] dark:text-[#e1e8dc]">Your next UI/UX class</h2><p className="mt-0.5 text-[6px] text-[#788172] dark:text-[#a0aa99]">Usability testing &amp; iteration</p><p className="text-[6px] text-[#788172] dark:text-[#a0aa99]">Tue, 13 Oct · 14:00–15:30 BST</p></div>
            <Link href="/learner/calender" className="inline-flex items-center gap-1 text-[6px] font-semibold text-[#40522c] dark:text-[#c3d7ad]">View calendar →</Link>
          </section>
        </div>
      </div>

      {recordingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onClick={() => setRecordingOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="recording-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-lg border border-[#dfe5da] bg-white p-4 shadow-xl dark:border-[#303b2d] dark:bg-[#171d16]">
            <div className="flex items-start justify-between gap-3"><div><h2 id="recording-title" className="text-[13px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Design systems &amp; component libraries</h2><p className="mt-1 text-[8px] text-[#788172] dark:text-[#a0aa99]">Class recording · 96 minutes</p></div><button type="button" aria-label="Close recording" onClick={() => setRecordingOpen(false)} className="rounded p-1 text-[#66705f]"><X size={14} /></button></div>
            <video src="/teachervideo.mp4" controls autoPlay className="mt-3 aspect-video w-full rounded-md bg-[#1c281c]" />
          </section>
        </div>
      )}
    </div>
  );
}
