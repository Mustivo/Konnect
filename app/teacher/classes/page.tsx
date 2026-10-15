"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiJson, getClassAssessments, getTeacherClasses } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  Info,
  Plus,
  Users,
  Video,
} from "lucide-react";

const initialClasses = [
  { id: "algebra", grade: "Grade 9", group: "Class A", title: "Algebra I", topic: "Linear equations & inequalities", students: 28, activities: 3, schedule: "Mon, Wed, Fri · 09:00–09:50", joinCode: "ALG-IX-28", nextSession: "Wed 14 Oct · 09:00", nextTopic: "Solving two-step equations", preparation: "12 question slides ready" },
  { id: "geometry", grade: "Grade 10", group: "Class B", title: "Geometry", topic: "Congruence & similarity", students: 30, activities: 2, schedule: "Tue, Thu · 11:00–11:50", joinCode: "GEO-IX-26", nextSession: "Thu 15 Oct · 11:00", nextTopic: "Triangle congruence proofs", preparation: "Quiz scheduled" },
  { id: "precalculus", grade: "Grade 11", group: "Class C", title: "Precalculus", topic: "Polynomial & rational functions", students: 25, activities: 1, schedule: "Mon, Wed · 14:00–14:50", joinCode: "PRE-IX-26", nextSession: "Wed 14 Oct · 14:00", nextTopic: "Finding polynomial zeros", preparation: "Worksheet published" },
];

const completedClasses = [
  { id: "biology", grade: "Grade 8", group: "Class D", title: "Biology", topic: "Cells & ecosystems", students: 24, activities: 0, schedule: "Mon, Wed · 10:00–10:50", joinCode: "BIO-VIII-25", nextSession: "Completed", nextTopic: "Course complete", preparation: "Records archived" },
  { id: "statistics", grade: "Grade 12", group: "Class E", title: "Statistics", topic: "Probability & data analysis", students: 26, activities: 0, schedule: "Tue, Thu · 13:00–13:50", joinCode: "STA-XII-25", nextSession: "Completed", nextTopic: "Course complete", preparation: "Records archived" },
];

const allClasses = [...initialClasses, ...completedClasses];

type TeacherClass = (typeof allClasses)[number] & { isCompleted?: boolean };
type ApiClassRoom = {
  id: string | number;
  title: string;
  subject?: string;
  description?: string;
  grade?: string;
  group?: string;
  enrolled_count?: string | number;
  start_date?: string | null;
  join_code?: string;
  status?: string;
};
type ApiAssessmentList = { results?: Array<{ id: string }> } | Array<{ id: string }>;

function toTeacherClass(classRoom: ApiClassRoom, activities: number): TeacherClass {
  const date = classRoom.start_date ? new Date(`${classRoom.start_date.slice(0, 10)}T00:00:00`) : null;
  const formattedDate = date && Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Not scheduled";
  const group = classRoom.group || classRoom.subject || "Class";
  const status = classRoom.status?.toUpperCase();

  return {
    id: String(classRoom.id),
    grade: classRoom.grade || "Grade not set",
    group: group.startsWith("Class ") ? group : `Class ${group}`,
    title: classRoom.title,
    topic: classRoom.description || classRoom.subject || "Course details to be announced",
    students: Number(classRoom.enrolled_count) || 0,
    activities,
    schedule: formattedDate === "Not scheduled" ? formattedDate : `Starts · ${formattedDate}`,
    joinCode: classRoom.join_code || "Not available",
    nextSession: "Not scheduled",
    nextTopic: classRoom.description || classRoom.subject || "Course details to be announced",
    preparation: activities ? `${activities} assessment${activities === 1 ? "" : "s"} available` : "No assessments yet",
    isCompleted: status === "COMPLETED" || status === "FINISHED" || status === "ARCHIVED",
  };
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeacherClass[]>(allClasses);
  const [activeClassIds, setActiveClassIds] = useState(initialClasses.map((item) => item.id));
  const [completedClassIds, setCompletedClassIds] = useState(completedClasses.map((item) => item.id));
  const [classTab, setClassTab] = useState<"active" | "completed">("active");
  const [loadNotice, setLoadNotice] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyLearnerLink(classId: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(classId)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => undefined);
    }
    setCopiedId(classId);
    setTimeout(() => setCopiedId(null), 2500);
  }

  useEffect(() => {
    if (!window.localStorage.getItem("konnect-access-token")) return;
    let cancelled = false;

    async function loadClasses() {
      try {
        const response = await getTeacherClasses();
        const payload = await apiJson<ApiClassRoom[] | { results?: ApiClassRoom[] }>(response);
        const records = Array.isArray(payload) ? payload : payload.results ?? [];
        const mapped = await Promise.all(records.map(async (classRoom) => {
          let activities = 0;
          try {
            const assessments = await apiJson<ApiAssessmentList>(await getClassAssessments(String(classRoom.id)));
            activities = Array.isArray(assessments) ? assessments.length : assessments.results?.length ?? 0;
          } catch {
            activities = 0;
          }
          return toTeacherClass(classRoom, activities);
        }));

        if (!cancelled) {
          const active = mapped.filter((item) => !item.isCompleted);
          const completed = mapped.filter((item) => item.isCompleted);
          setClasses(mapped);
          setActiveClassIds(active.map((item) => item.id));
          setCompletedClassIds(completed.map((item) => item.id));
        }
      } catch {
        if (!cancelled) setLoadNotice("Live class data is unavailable. Showing the sample classes.");
      }
    }

    void loadClasses();
    return () => { cancelled = true; };
  }, []);

  const visibleClasses = classTab === "active"
    ? classes.filter((item) => activeClassIds.includes(item.id))
    : classes.filter((item) => completedClassIds.includes(item.id));
  const activeClasses = classes.filter((item) => activeClassIds.includes(item.id));
  const activityCount = activeClasses.reduce((total, item) => total + item.activities, 0);
  const studentCount = activeClasses.reduce((total, item) => total + item.students, 0);

  function finishClass(id: string) {
    setActiveClassIds((current) => current.filter((classId) => classId !== id));
    setCompletedClassIds((current) => current.includes(id) ? current : [...current, id]);
  }

  function reactivateClass(id: string) {
    if (activeClassIds.length >= 3) return;
    setCompletedClassIds((current) => current.filter((classId) => classId !== id));
    setActiveClassIds((current) => current.includes(id) ? current : [...current, id]);
  }

  return (
    <DashboardShell role="teacher">
      <div id="classes" className="space-y-3 py-2 sm:py-3">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold leading-tight tracking-tight text-[#172115] dark:text-[#ecf1ea]">Classes</h1>
            <p className="mt-1 text-[9px] text-[#707c6c] dark:text-[#9aa592]">A little structure for every learning moment.</p>
          </div>
        </header>

        {loadNotice && <p role="status" className="text-[8px] text-[#8a5c32] dark:text-[#d4a777]">{loadNotice}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[9px] font-semibold text-[#253322] dark:text-[#d6dfd2]">
            Your classes <span className="ml-1 rounded-full bg-[#e5efdf] px-2 py-1 text-[8px] text-[#34522a] dark:bg-[#263722] dark:text-[#b8c9af]">{activeClassIds.length}/3 active</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("konnect-open-create-class"))}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#23351f] px-3.5 text-[8px] font-semibold text-white shadow-sm hover:bg-[#30472b] transition-colors"
            >
              <Plus size={11} /> Create Class &amp; Live Room
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Active classes", value: `${activeClassIds.length}/3`, note: "Your teaching spaces this term", icon: BookOpen, tone: "bg-[#e5efdf] text-[#34522a]" },
            { title: "Students enrolled", value: String(studentCount), note: "Across your active classes", icon: Users, tone: "bg-[#eaf2ff] text-[#2563a8]" },
            { title: "Activities to review", value: String(activityCount), note: "Keep feedback moving forward", icon: ClipboardList, tone: "bg-[#fcefe4] text-[#a45d27]" },
          ].map(({ title, value, note, icon: Icon, tone }) => (
            <article key={title} className="min-h-[94px] rounded-2xl border border-[#e2e7dd] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[8px] font-medium text-[#687564] dark:text-[#8b9987]">{title}</p>
                  <p className="mt-2 text-[20px] font-bold leading-none tracking-tight text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                  <p className="mt-2 text-[7px] text-[#85917f]">{note}</p>
                </div>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${tone}`}><Icon size={12} /></span>
              </div>
            </article>
          ))}
        </div>

        <div className="flex gap-1 border-b border-[#e5e9e1] pb-1 dark:border-[#293627]" role="tablist" aria-label="Class status">
          {(["active", "completed"] as const).map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={classTab === tab} onClick={() => setClassTab(tab)}
              className={`rounded-full px-3 py-1.5 text-[8px] font-bold capitalize transition-colors ${classTab === tab ? "bg-[#23351f] text-white" : "text-[#687564] hover:bg-[#e9eee5] dark:text-[#a5b19f] dark:hover:bg-[#1b2819]"}`}>
              {tab} ({tab === "active" ? activeClassIds.length : completedClassIds.length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleClasses.map((item) => {
            const isActive = classTab === "active";
            return (
              <article key={item.id} className="rounded-2xl border border-[#e2e7dd] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[8px] font-medium text-[#707c6c]">{item.grade} · {item.group}</span>
                  <span className="rounded-full bg-[#eaf4e6] px-2 py-1 text-[7px] font-bold text-[#2c6e21]">{isActive ? "Active" : "Completed"}</span>
                </div>
                <h2 className="text-[14px] font-bold leading-snug text-[#172115] dark:text-[#ecf1ea]">{item.title}</h2>
                <p className="mt-1 text-[8px] text-[#707c6c]">{item.topic}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[8px] font-semibold text-[#253322] dark:text-[#d6dfd2]">
                    <span>Students</span><span>{item.students}/100</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#edf1e9] dark:bg-[#263323]">
                    <div className="h-full rounded-full bg-[#b6c9ad]" style={{ width: `${Math.min(item.students, 100)}%` }} />
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-[#f3f6f0] p-2.5 text-[8px] text-[#42513d] dark:bg-[#1b2819] dark:text-[#c4d0bd]">
                  <p className="flex items-center gap-1.5"><Clock3 size={11} />{item.schedule}</p>
                  <p className="mt-1.5 flex items-center gap-1.5"><ClipboardList size={11} />{item.activities} {item.activities === 1 ? "activity" : "activities"} to review</p>
                  <p className="mt-1.5 text-[7px] text-[#879282]">Join code · {item.joinCode}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0e9] pt-2.5 dark:border-[#212f1f]">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/teacher/live-classes/${item.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-[#23351f] px-2.5 py-1.5 text-[8px] font-semibold text-white hover:bg-[#30472b] transition-colors"
                      title="Enter teacher live studio"
                    >
                      <Video size={10} className="text-[#86efac]" /> Studio
                    </Link>
                    <button
                      type="button"
                      onClick={() => copyLearnerLink(item.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#dce3d7] bg-[#f8faf6] px-2 py-1.5 text-[8px] font-semibold text-[#405439] hover:bg-[#edf2ea] dark:border-[#2b3a28] dark:bg-[#1a2518] dark:text-[#c2d3bd] transition-colors"
                      title="Copy join link for learners"
                    >
                      {copiedId === item.id ? <Check size={10} className="text-[#2c6e21]" /> : <Copy size={10} />}
                      {copiedId === item.id ? "Copied!" : "Learner Link"}
                    </button>
                  </div>
                  {isActive ? (
                    <button type="button" onClick={() => finishClass(item.id)} className="rounded-lg px-2 py-1.5 text-[8px] font-semibold text-[#34482d] hover:bg-[#f1f5ed] dark:text-[#c9d7c1] dark:hover:bg-[#1b2819]">Mark as Finished</button>
                  ) : (
                    <button type="button" disabled={activeClassIds.length >= 3} onClick={() => reactivateClass(item.id)} className="rounded-lg px-2 py-1.5 text-[8px] font-semibold text-[#34482d] hover:bg-[#f1f5ed] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#c9d7c1] dark:hover:bg-[#1b2819]">Reactivate</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {classTab === "active" && (
          <article className="rounded-2xl border border-[#e6ebe2] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13] sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">This week in your classes</h2>
                <p className="mt-1 text-[8px] text-[#707c6c]">Upcoming sessions · 13–16 October 2026</p>
              </div>
              <span className="rounded-full bg-[#eaf4e6] px-2 py-1 text-[7px] font-bold text-[#2c6e21]">Term 1</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[8px]">
                <thead className="bg-[#f1f4ee] text-[7px] font-semibold text-[#687564] dark:bg-[#1b2819] dark:text-[#a5b19f]">
                  <tr>{["Class", "Next session", "Topic", "Preparation"].map((heading) => <th key={heading} className="px-2 py-2 font-semibold first:rounded-l-lg last:rounded-r-lg">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#edf0ea] text-[#253322] dark:divide-[#293627] dark:text-[#d6dfd2]">
                  {activeClasses.map((item) => (
                    <tr key={item.id}>
                      <td className="px-2 py-2.5 font-medium">{item.title} · {item.group.replace("Class ", "")}</td>
                      <td className="whitespace-nowrap px-2 py-2.5">{item.nextSession}</td>
                      <td className="px-2 py-2.5">{item.nextTopic}</td>
                      <td className="px-2 py-2.5">{item.preparation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        <div className="flex gap-2 rounded-xl bg-[#e4efdf] px-3 py-2.5 text-[#3e5736] dark:bg-[#20301d] dark:text-[#c5d9bc]">
          <Info size={12} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-[8px] font-bold">Finished doesn’t mean forgotten</p>
            <p className="mt-1 text-[8px] leading-relaxed text-[#6e8067] dark:text-[#a5b99c]">Marking a class as finished frees an active-class slot. Attendance, grades and reports stay safely archived.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
