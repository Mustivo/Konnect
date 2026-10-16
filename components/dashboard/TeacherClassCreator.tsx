"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiJson, createTeacherClass } from "@/lib/api";
import { createClassSession, startSession } from "@/lib/api/sessions";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { ArrowRight, Check, Copy, ExternalLink, X } from "lucide-react";

type CreatedClass = { id: string; title: string };
type CreatedSession = { id: string; title: string; meeting_url: string };

export default function TeacherClassCreator() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [notice, setNotice] = useState("");
  const [createdClass, setCreatedClass] = useState<CreatedClass | null>(null);
  const [createdSession, setCreatedSession] = useState<CreatedSession | null>(null);

  useEffect(() => {
    const openDialog = () => {
      setOpen(true);
      setNotice("");
      setCreatedClass(null);
      setCreatedSession(null);
    };
    window.addEventListener("konnect-open-create-class", openDialog);
    return () => window.removeEventListener("konnect-open-create-class", openDialog);
  }, []);

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setNotice("");
    const form = new FormData(formElement);
    const title = String(form.get("classTitle") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const sessionTitle = String(form.get("sessionTitle") ?? "").trim() || `${title} live class`;
    const startValue = String(form.get("scheduledStart") ?? "");
    const endValue = String(form.get("scheduledEnd") ?? "");
    const maxStudents = Number(form.get("maxStudents"));
    const rawMeetingUrl = String(form.get("meetingUrl") ?? "").trim();
    let meetingUrl = "";

    if (rawMeetingUrl) {
      try {
        const parsed = new URL(rawMeetingUrl);
        if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Use a valid HTTPS meeting link.");
        meetingUrl = parsed.toString();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Enter a valid meeting link.");
        return;
      }
    }

    const startDate = new Date(startValue);
    const endDate = new Date(endValue);
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || endDate <= startDate) {
      setNotice("Choose a valid session end time after the start time.");
      return;
    }
    if (!Number.isInteger(maxStudents) || maxStudents < 1) {
      setNotice("Maximum students must be a whole number greater than zero.");
      return;
    }

    setSaving(true);
    let newClass = createdClass;
    try {
      if (!newClass) {
        newClass = await apiJson<CreatedClass>(await createTeacherClass({
          title,
          description,
          subject,
          visibility: "PUBLIC",
          status: "ACTIVE",
          max_students: maxStudents,
          start_date: startDate.toISOString().slice(0, 10),
        }));
        setCreatedClass(newClass);
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      const session = await apiJson<CreatedSession>(await createClassSession(newClass.id, {
        class_room: newClass.id,
        title: sessionTitle,
        agenda: description,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        status: "LIVE",
        room_id: crypto.randomUUID(),
        meeting_url: meetingUrl || `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(newClass.id)}`,
      }));

      const finalMeetingUrl = meetingUrl || `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(session.id)}`;
      const activeSessionInfo = {
        sessionId: String(session.id),
        classId: newClass.id,
        courseTitle: newClass.title,
        sessionTitle: session.title || sessionTitle,
        teacherName: "Teacher",
        meetingUrl: finalMeetingUrl,
        scheduledStart: startDate.toISOString(),
        scheduledEnd: endDate.toISOString(),
        status: "LIVE",
        startedAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem("konnect-active-live-session", JSON.stringify(activeSessionInfo));
        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("konnect-live-classes");
          channel.postMessage({ type: "session-started", session: activeSessionInfo });
          channel.close();
        }
        window.dispatchEvent(new CustomEvent("konnect-active-live-session-updated", { detail: activeSessionInfo }));
      } catch {
        // Storage or broadcast fallback
      }

      setCreatedSession({
        ...session,
        meeting_url: finalMeetingUrl,
      });
      setNotice("Class and live session created! Published to enrolled learners.");
      formElement.reset();
    } catch (error) {
      const message = apiErrorMessage(error instanceof ApiError ? error.payload : error, "The class could not be created. Please try again.");
      setNotice(newClass ? `Class created, but its live session was not saved: ${message}` : message);
    } finally {
      setSaving(false);
    }
  }

  async function copyMeetingLink() {
    if (!createdSession?.meeting_url) return;
    try {
      await navigator.clipboard.writeText(createdSession.meeting_url);
      setNotice("Learner join link copied to clipboard!");
    } catch {
      setNotice("Could not copy the link. Please select and copy manually.");
    }
  }

  async function startLiveSession() {
    if (!createdSession) return;
    setStarting(true);
    setNotice("");
    try {
      await startSession(createdSession.id);
      setNotice("Session is live! Open the classroom studio to broadcast and admit learners.");
    } catch (error) {
      setNotice(apiErrorMessage(error instanceof ApiError ? error.payload : error, "Could not start the session."));
    } finally {
      setStarting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-class-title" className="max-h-[min(90vh,760px)] w-full max-w-xl overflow-y-auto rounded-lg border border-[#dfe5d8] bg-white p-5 shadow-2xl dark:border-[#303b2d] dark:bg-[#171d16]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#657a55] dark:text-[#a8be97]">Teacher workspace</p>
            <h2 id="create-class-title" className="mt-1 text-lg font-bold text-[#172115] dark:text-[#ecf1ea]">Create a class and live session</h2>
            <p className="mt-1 text-[11px] text-[#707c6c] dark:text-[#a6aea0]">Add a class, schedule its live session, and generate the learner invite link.</p>
          </div>
          <button type="button" aria-label="Close create class" disabled={saving} onClick={() => setOpen(false)} className="grid size-8 shrink-0 place-items-center rounded border border-[#e0e5dd] text-[#596552] hover:bg-[#f3f6ef] disabled:opacity-60 dark:border-[#303b2d] dark:text-[#c5d6bc] dark:hover:bg-[#202720]"><X size={16} /></button>
        </header>

        {createdClass && createdSession ? (
          <div className="mt-5 space-y-4">
            <div className="rounded border border-[#d7e5cf] bg-[#f1f6ed] p-3.5 dark:border-[#303b2d] dark:bg-[#20291e]">
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[#334b2c] dark:text-[#c5d6bc]"><Check size={15} /> {createdClass.title}</p>
              <p className="mt-1 text-[10px] text-[#64745a] dark:text-[#a6b39e]">{createdSession.title}</p>
              <div className="mt-3 rounded border border-[#d4e2cc] bg-white p-2.5 dark:border-[#2a3627] dark:bg-[#151d14]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#527045] dark:text-[#a2be94]">Learner Join Link</p>
                <p className="mt-1 select-all break-all font-mono text-[10px] text-[#1c2719] dark:text-[#e5ece2]">{createdSession.meeting_url}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/teacher/live-classes/${encodeURIComponent(createdSession.id)}`}
                className="inline-flex min-h-9 items-center gap-2 rounded bg-[#263d21] px-3.5 text-[10px] font-semibold text-white shadow-sm hover:bg-[#344f2c]"
              >
                Enter Teacher Live Room <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={() => void copyMeetingLink()}
                className="inline-flex min-h-9 items-center gap-2 rounded border border-[#dfe5d8] bg-white px-3 text-[10px] font-semibold text-[#40522c] shadow-sm hover:bg-[#f3f6ef] dark:border-[#303b2d] dark:bg-[#1a2319] dark:text-[#c5d6bc] dark:hover:bg-[#202720]"
              >
                <Copy size={13} /> Copy Learner Link
              </button>
            </div>
            {notice && <p role="status" className="text-[10px] font-medium text-[#446b38] dark:text-[#b6c6a9]">{notice}</p>}
            <p className="text-[9px] text-[#788173] dark:text-[#9aa592]">Learners can join the live class through the link and will enter the waiting room or live session.</p>
            <button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded border border-[#dfe5d8] px-3 text-[10px] font-semibold text-[#40522c] hover:bg-[#f3f6ef] dark:border-[#303b2d] dark:text-[#c5d6bc] dark:hover:bg-[#202720]">Done</button>
          </div>
        ) : (
          <form onSubmit={createClass} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Class name
                <input name="classTitle" required maxLength={200} className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2.5 text-[12px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Subject
                <input name="subject" maxLength={100} className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2.5 text-[12px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
            </div>
            <label className="block text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Class description
              <textarea name="description" required rows={2} className="mt-1 block w-full resize-y rounded border border-[#e1e6dc] bg-white px-2.5 py-2 text-[12px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Maximum learners
                <input name="maxStudents" type="number" required min={1} step={1} defaultValue={30} className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2.5 text-[12px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Session title
                <input name="sessionTitle" maxLength={200} placeholder="First live class" className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2.5 text-[12px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Starts
                <input name="scheduledStart" type="datetime-local" required className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2 text-[11px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
              <label className="text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Ends
                <input name="scheduledEnd" type="datetime-local" required className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2 text-[11px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" />
              </label>
            </div>
            <label className="block text-[10px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">
              Live Class Meeting link (optional)
              <input
                name="meetingUrl"
                type="url"
                placeholder="Leave blank to auto-generate Konnect Live Class link"
                className="mt-1 block h-9 w-full rounded border border-[#e1e6dc] bg-white px-2.5 text-[12px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"
              />
            </label>
            <p role="status" className="min-h-4 text-[10px] text-[#8b4138] dark:text-[#f09a8e]">{notice}</p>
            <button type="submit" disabled={saving} className="min-h-10 w-full rounded bg-[#233c20] px-4 text-[11px] font-semibold text-white hover:bg-[#304d2b] disabled:cursor-wait disabled:opacity-60">{saving ? "Creating class and session…" : "Create class and live session"}</button>
          </form>
        )}
      </section>
    </div>
  );
}
