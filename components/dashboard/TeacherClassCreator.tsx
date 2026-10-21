"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiJson, getCourses } from "@/lib/api";
import { createClassSession } from "@/lib/api/sessions";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { ArrowRight, Check, Copy, X } from "lucide-react";

type CourseOption = { id: string; title: string; status?: string };
type CreatedSession = { id: string; title: string; meeting_url: string; video_provider_configured?: boolean };
type ApiLiveSession = { id: string; course_title?: string; video_provider_configured?: boolean };

export default function TeacherClassCreator() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);

  useEffect(() => {
    const openDialog = () => {
      setOpen(true);
      setNotice("");
      setCreatedSession(null);
    };
    window.addEventListener("konnect-open-create-class", openDialog);
    return () => window.removeEventListener("konnect-open-create-class", openDialog);
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setCoursesLoading(true);
    async function loadCourses() {
      try {
        const records: CourseOption[] = [];
        for (let page = 1; page <= 100; page += 1) {
          const response = await getCourses(page === 1 ? "" : `?page=${page}`);
          const result = await apiJson<CourseOption[] | { results?: CourseOption[]; next?: string | null }>(response);
          if (Array.isArray(result)) { records.push(...result); break; }
          records.push(...(result.results || []));
          if (!result.next) break;
        }
        if (active) setCourses(records.filter((course) => (course.status || "").toLowerCase() === "approved"));
      } catch (error) {
        if (active) setNotice(error instanceof Error ? error.message : "Could not load your approved courses.");
      } finally {
        if (active) setCoursesLoading(false);
      }
    }
    void loadCourses();
    return () => { active = false; };
  }, [open]);

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setNotice("");
    const form = new FormData(formElement);
    const courseId = String(form.get("courseId") ?? "").trim();
    const startDate = new Date(String(form.get("scheduledStart") ?? ""));
    const endDate = new Date(String(form.get("scheduledEnd") ?? ""));
    if (!courseId) { setNotice("Select one of your approved courses first."); return; }
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || startDate <= new Date() || endDate.getTime() - startDate.getTime() < 15 * 60 * 1000) {
      setNotice("Choose a future start time and an end time at least 15 minutes later.");
      return;
    }

    setSaving(true);
    try {
      const course = courses.find((item) => item.id === courseId);
      if (!course) throw new Error("That course is no longer available. Refresh and choose an approved course.");
      const session = await apiJson<ApiLiveSession>(await createClassSession(course.id, {
        course: course.id,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
      }));
      const origin = window.location.origin;
      const learnerLink = `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(session.id)}`;
      setCreatedSession({
        id: session.id,
        title: session.course_title || course.title,
        meeting_url: learnerLink,
        video_provider_configured: session.video_provider_configured,
      });
      setNotice(session.video_provider_configured
        ? "Live session scheduled in the external API."
        : "Live session scheduled in the external API. A video provider is not configured yet.");
      formElement.reset();
    } catch (error) {
      setNotice(apiErrorMessage(error instanceof ApiError ? error.payload : error, "The session could not be scheduled. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function copyMeetingLink() {
    if (!createdSession?.meeting_url) return;
    try { await navigator.clipboard.writeText(createdSession.meeting_url); setNotice("Learner join link copied to clipboard."); }
    catch { setNotice("Could not copy the link. Please select and copy it manually."); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-class-title" className="max-h-[min(90vh,760px)] w-full max-w-xl overflow-y-auto rounded-lg border border-[#dfe5d8] bg-white p-5 shadow-2xl dark:border-[#303b2d] dark:bg-[#171d16]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#657a55] dark:text-[#a8be97]">Teacher workspace</p>
            <h2 id="create-class-title" className="mt-1 text-lg font-bold text-[#172115] dark:text-[#ecf1ea]">Schedule a live session</h2>
            <p className="mt-1 text-[11px] text-[#707c6c] dark:text-[#a6aea0]">Choose an approved course and schedule a session through the external API.</p>
          </div>
          <button type="button" aria-label="Close session scheduler" disabled={saving} onClick={() => setOpen(false)} className="grid size-8 shrink-0 place-items-center rounded border border-[#e0e5dd] text-[#596552] hover:bg-[#f3f6ef] disabled:opacity-60 dark:border-[#303b2d] dark:text-[#c5d6bc] dark:hover:bg-[#202720]"><X size={16} /></button>
        </header>

        {createdSession ? (
          <div className="mt-5 space-y-4">
            <div className="rounded border border-[#d7e5cf] bg-[#f1f6ed] p-3.5 dark:border-[#303b2d] dark:bg-[#20291e]">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[#334b2c] dark:text-[#c5d6bc]"><Check size={15} /> Session scheduled: {createdSession.title}</p>
              <div className="mt-3 rounded border border-[#d4e2cc] bg-white p-2.5 dark:border-[#2a3627] dark:bg-[#151d14]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#527045] dark:text-[#a2be94]">Learner Waiting Room Link</p>
                <p className="mt-1 select-all break-all font-mono text-[10px] text-[#1c2719] dark:text-[#e5ece2]">{createdSession.meeting_url}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/teacher/live-classes/${encodeURIComponent(createdSession.id)}`} className="inline-flex min-h-9 items-center gap-2 rounded bg-[#263d21] px-3.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#344f2c]">Open session details <ArrowRight size={13} /></Link>
              <button type="button" onClick={() => void copyMeetingLink()} className="inline-flex min-h-9 items-center gap-2 rounded border border-[#dfe5d8] bg-white px-3 text-[10px] font-semibold text-[#40522c] shadow-sm hover:bg-[#f3f6ef] dark:border-[#303b2d] dark:bg-[#1a2319] dark:text-[#c5d6bc]"><Copy size={13} /> Copy Learner Link</button>
            </div>
            <p className="text-[10px] text-[#788173] dark:text-[#9aa592]">The API schedules the session but reports whether a video provider is configured. If it is not, learners can open the waiting room, but live audio/video is not connected.</p>
            {notice && <p role="status" className="text-[10px] font-medium text-[#446b38] dark:text-[#b6c6a9]">{notice}</p>}
            <button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded border border-[#dfe5d8] px-3 text-[10px] font-semibold text-[#40522c] hover:bg-[#f3f6ef] dark:border-[#303b2d] dark:text-[#c5d6bc]">Done</button>
          </div>
        ) : (
          <form onSubmit={createClass} className="mt-4 space-y-3">
            <label className="block text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Approved course
              <select name="courseId" required disabled={coursesLoading || courses.length === 0} className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2.5 text-[12px] font-normal text-[#30392d] outline-none disabled:opacity-60 dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">
                <option value="">{coursesLoading ? "Loading approved courses…" : courses.length ? "Select a course" : "No approved courses available"}</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
            {!coursesLoading && courses.length === 0 && <p className="text-[10px] text-[#8b5c20]">A course must be created and approved before you can schedule a session.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Starts
                <input name="scheduledStart" type="datetime-local" required className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2 text-[11px] font-normal text-[#30392d] outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Ends
                <input name="scheduledEnd" type="datetime-local" required className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2 text-[11px] font-normal text-[#30392d] outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
            </div>
            <p role="status" className="min-h-4 text-[10px] text-[#8b4138] dark:text-[#f09a8e]">{notice}</p>
            <button type="submit" disabled={saving || coursesLoading || courses.length === 0} className="min-h-10 w-full rounded bg-[#233c20] px-4 text-[11px] font-semibold text-white hover:bg-[#304d2b] disabled:cursor-wait disabled:opacity-60">{saving ? "Scheduling session…" : "Schedule live session"}</button>
          </form>
        )}
      </section>
    </div>
  );
}
