"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, Check, ClipboardList, GraduationCap, Loader2, Video, X } from "lucide-react";
import { apiJson, getLearnerClasses, getLearnerProgressGrades, getMyAssessmentSubmissions } from "@/lib/api";
import { currentUser, getLearnerProfile } from "@/lib/api/auth";
import { cancelLiveJoinRequest, requestJoinSession } from "@/lib/api/sessions";

type ActiveLiveSession = {
  sessionId: string;
  classId?: string;
  courseTitle: string;
  sessionTitle: string;
  teacherName?: string;
  meetingUrl?: string;
  status?: string;
  startedAt?: string;
};

type Enrollment = {
  id: string;
  class_room: string;
  class_title: string;
  class_subject: string;
  teacher_name: string;
  status?: string;
};

type Submission = {
  id: string;
  assessment_title: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | string;
  total_score: string | number | null;
  submitted_at: string | null;
  teacher_feedback?: string;
};

type LearnerData = {
  name: string;
  classes: Enrollment[];
  submissions: Submission[];
  learningGoals: string;
  attendanceRate: number | null;
};

type Collection<T> = T[] | { results?: T[]; next?: string | null };

async function jsonRequest<T>(request: Promise<Response>) {
  return apiJson<T>(await request);
}

async function allPages<T>(requestPage: (query: string) => Promise<Response>) {
  const records: T[] = [];
  for (let page = 1; page <= 100; page += 1) {
    const response = await requestPage(page === 1 ? "" : `?page=${page}`);
    const result = await apiJson<Collection<T>>(response);
    if (Array.isArray(result)) {
      records.push(...result);
      break;
    }
    records.push(...(result.results ?? []));
    if (!result.next) break;
  }
  return records;
}

const initialData: LearnerData = {
  name: "Learner",
  classes: [],
  submissions: [],
  learningGoals: "",
  attendanceRate: null,
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function findAttendanceRate(value: unknown, depth = 0): number | null {
  if (Array.isArray(value)) {
    for (const field of value) {
      const nestedRate = findAttendanceRate(field, depth + 1);
      if (nestedRate !== null) return nestedRate;
    }
    return null;
  }
  const item = record(value);
  if (!item || depth > 4) return null;
  for (const [key, field] of Object.entries(item)) {
    if (["attendance_rate", "attendance_percentage", "attendance_percent"].includes(key.toLowerCase())) {
      const parsed = Number(String(field).replace("%", ""));
      if (Number.isFinite(parsed)) return Math.round(parsed <= 1 ? parsed * 100 : parsed);
    }
  }
  for (const field of Object.values(item)) {
    const nestedRate = findAttendanceRate(field, depth + 1);
    if (nestedRate !== null) return nestedRate;
  }
  return null;
}

function displayDate(value: string | null) {
  if (!value) return "Not submitted";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Submitted" : `Submitted ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function scoreValue(submission: Submission) {
  if (submission.total_score === null || submission.total_score === undefined) return null;
  const score = Number(submission.total_score);
  return Number.isFinite(score) ? score : null;
}

export default function LearnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [loadNotice, setLoadNotice] = useState("");
  const [activeLiveClass, setActiveLiveClass] = useState<ActiveLiveSession | null>(null);

  type JoinRequestStatus = "idle" | "waiting" | "admitted" | "denied";
  const [requestStatuses, setRequestStatuses] = useState<Record<string, JoinRequestStatus>>({});
  const requestStatusesRef = useRef<Record<string, JoinRequestStatus>>({});
  const learnerIdRef = useRef<string>("learner-" + Math.random().toString(36).slice(2, 8));

  useEffect(() => {
    requestStatusesRef.current = requestStatuses;
  }, [requestStatuses]);

  // 1. One-time mount restore from localStorage
  // 1. One-time mount restore from localStorage
  useEffect(() => {
    try {
      const activeFound: Array<{ sid: string; status: JoinRequestStatus; timestamp: number }> = [];
      const keysToRemove: string[] = [];

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("konnect-live-class-requested:")) {
          const sid = key.replace("konnect-live-class-requested:", "").toLowerCase().trim();
          const val = window.localStorage.getItem(key);

          // Hardcode purge for past Saturday 17th test sessions
          const isStale = sid === "react" || sid === "uiux" || sid === "math" || val === "denied";

          if (isStale) {
            keysToRemove.push(key);
            keysToRemove.push(`konnect-live-class-request:${sid}`);
            keysToRemove.push(`konnect-live-class-admission:${sid}`);
          } else if (val === "waiting" || val === "admitted") {
            let ts = 0;
            try {
              const reqRaw = window.localStorage.getItem(`konnect-live-class-request:${sid}`);
              if (reqRaw) {
                const parsed = JSON.parse(reqRaw);
                ts = Number(parsed?.timestamp) || 0;
              }
            } catch {}
            activeFound.push({ sid, status: val as JoinRequestStatus, timestamp: ts });
          }
        }
      }

      // STRICT 1-CLASS LIMIT: If multiple classes were stored waiting/admitted, keep ONLY THE SINGLE LATEST ONE!
      if (activeFound.length > 1) {
        activeFound.sort((a, b) => b.timestamp - a.timestamp);
        for (let i = 1; i < activeFound.length; i++) {
          const dropSid = activeFound[i].sid;
          keysToRemove.push(`konnect-live-class-requested:${dropSid}`);
          keysToRemove.push(`konnect-live-class-request:${dropSid}`);
          keysToRemove.push(`konnect-live-class-admission:${dropSid}`);
        }
        activeFound.splice(1);
      }

      // Clean up all stale or excess keys from localStorage
      keysToRemove.forEach((k) => {
        try {
          window.localStorage.removeItem(k);
        } catch {}
      });

      if (activeFound.length === 1) {
        setRequestStatuses({ [activeFound[0].sid]: activeFound[0].status });
      } else {
        setRequestStatuses({});
      }
    } catch {}
  }, []);

  // 2. Admission channel listener & interval check
  useEffect(() => {
    function applyAdmission(admission: { sessionId: string; status: "admitted" | "denied" }) {
      const sid = String(admission.sessionId || "").toLowerCase().trim();
      if (!sid) return;

      if (admission.status === "admitted") {
        setRequestStatuses((prev) => ({ ...prev, [sid]: "admitted" }));
        window.sessionStorage.setItem(`konnect-live-class-admitted:${sid}`, "true");
        window.localStorage.setItem(`konnect-live-class-admitted:${sid}`, "true");
        window.localStorage.removeItem(`konnect-live-class-requested:${sid}`);

        setTimeout(() => {
          router.push(`/learner/live_classes/liveClass?session=${encodeURIComponent(sid)}`);
        }, 500);
      } else if (admission.status === "denied") {
        setRequestStatuses((prev) => ({ ...prev, [sid]: "denied" }));
        window.localStorage.removeItem(`konnect-live-class-requested:${sid}`);
      }
    }

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("konnect-live-class-admission");
        channel.onmessage = (event) => {
          if (event.data?.status === "admitted" || event.data?.status === "denied") {
            applyAdmission(event.data);
          }
        };
      } catch {}
    }

    function handleStorage(event: StorageEvent) {
      if (!event.key || !event.newValue) return;
      if (event.key.startsWith("konnect-live-class-admission:")) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && (parsed.status === "admitted" || parsed.status === "denied")) {
            applyAdmission(parsed);
          }
        } catch {}
      }
    }
    window.addEventListener("storage", handleStorage);

    const pollTimer = setInterval(() => {
      const currentMap = requestStatusesRef.current;
      Object.keys(currentMap).forEach((sid) => {
        if (currentMap[sid] === "waiting") {
          try {
            const raw = window.localStorage.getItem(`konnect-live-class-admission:${sid}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.status === "admitted" || parsed?.status === "denied") {
                applyAdmission(parsed);
              }
            }
          } catch {}
        }
      });
    }, 1200);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(pollTimer);
    };
  }, [router]);

  // Single-class limit: find if any session is currently requested/admitted
  const activePendingSessionId = Object.keys(requestStatuses).find(
    (sid) => requestStatuses[sid] === "waiting" || requestStatuses[sid] === "admitted"
  ) || null;

  async function handleCancelRequest(rawSessionId: string) {
    const cleanSessionId = String(rawSessionId || "general").toLowerCase().trim();

    setRequestStatuses((prev) => {
      const next = { ...prev };
      delete next[cleanSessionId];
      return next;
    });

    try {
      window.localStorage.removeItem(`konnect-live-class-requested:${cleanSessionId}`);
      window.localStorage.removeItem(`konnect-live-class-request:${cleanSessionId}`);
      window.localStorage.removeItem(`konnect-live-class-admission:${cleanSessionId}`);

      const rawAll = window.localStorage.getItem("konnect-all-live-requests");
      if (rawAll) {
        const parsed = JSON.parse(rawAll);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (r: { sessionId?: string; learnerId?: string; id?: string }) =>
              r.sessionId?.toLowerCase().trim() !== cleanSessionId &&
              r.learnerId !== learnerIdRef.current &&
              r.id !== learnerIdRef.current
          );
          window.localStorage.setItem("konnect-all-live-requests", JSON.stringify(filtered));
        }
      }
    } catch {}

    try {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel("konnect-live-class-admission");
        ch.postMessage({
          type: "cancel-request",
          sessionId: cleanSessionId,
          learnerId: learnerIdRef.current,
          requestId: learnerIdRef.current,
        });
        ch.close();
      }
    } catch {}

    void cancelLiveJoinRequest(cleanSessionId, learnerIdRef.current).catch(() => undefined);
  }

  async function handleAskToJoin(rawSessionId: string, sessionTitle?: string) {
    const cleanSessionId = String(rawSessionId || "general").toLowerCase().trim();

    // STRICT 1-CLASS LIMIT: If learner is already waiting for or attending another class
    if (activePendingSessionId && activePendingSessionId !== cleanSessionId) {
      alert("You can only request to attend one live class at a time. Please wait for teacher approval or cancel your current request.");
      return;
    }

    // Allow only ONE request!
    if (requestStatuses[cleanSessionId] === "waiting" || requestStatuses[cleanSessionId] === "admitted") {
      return;
    }

    setRequestStatuses((prev) => ({ ...prev, [cleanSessionId]: "waiting" }));
    window.localStorage.setItem(`konnect-live-class-requested:${cleanSessionId}`, "waiting");

    const reqPayload = {
      type: "join-request",
      sessionId: cleanSessionId,
      learnerId: learnerIdRef.current,
      learnerName: data.name || "Learner",
      classTitle: sessionTitle || "Live Class Session",
      timestamp: Date.now(),
    };

    try {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel("konnect-live-class-admission");
        ch.postMessage(reqPayload);
        ch.close();
      }

      window.localStorage.setItem(`konnect-live-class-request:${cleanSessionId}`, JSON.stringify(reqPayload));
      const rawAll = window.localStorage.getItem("konnect-all-live-requests");
      let allReqs = [];
      try {
        allReqs = rawAll ? JSON.parse(rawAll) : [];
      } catch {}
      if (!Array.isArray(allReqs)) allReqs = [];
      allReqs = allReqs.filter((r: { id?: string; learnerId?: string }) => r.id !== reqPayload.learnerId && r.learnerId !== reqPayload.learnerId);
      allReqs.push({
        id: reqPayload.learnerId,
        sessionId: cleanSessionId,
        learnerId: reqPayload.learnerId,
        learnerName: data.name || "Learner",
        classTitle: sessionTitle || "Live Class Session",
        status: "waiting",
        requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
      });
      window.localStorage.setItem("konnect-all-live-requests", JSON.stringify(allReqs));

      await requestJoinSession(cleanSessionId, {
        student_id: learnerIdRef.current,
        student_name: data.name || "Learner",
        class_title: sessionTitle || "Live Class Session",
      }).catch(() => undefined);
    } catch {}
  }

  useEffect(() => {
    function checkActiveSession() {
      try {
        const stored = window.localStorage.getItem("konnect-active-live-session");
        if (stored) {
          const parsed = JSON.parse(stored) as ActiveLiveSession;
          if (parsed && parsed.sessionId && parsed.status !== "ENDED") {
            setActiveLiveClass(parsed);
            return;
          }
        }
      } catch {}
      setActiveLiveClass(null);
    }

    checkActiveSession();

    function handleStorage(e: StorageEvent) {
      if (e.key === "konnect-active-live-session") {
        checkActiveSession();
      }
    }

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("konnect-live-classes");
        channel.onmessage = (event) => {
          if (event.data?.type === "session-started" && event.data.session) {
            setActiveLiveClass(event.data.session);
          } else if (event.data?.type === "session-ended") {
            setActiveLiveClass(null);
          }
        };
        channel.postMessage({ type: "is-teacher-live-query" });
      } catch {}
    }

    const onCustomUpdate = (event: Event) => {
      const custom = event as CustomEvent<ActiveLiveSession>;
      if (custom.detail) setActiveLiveClass(custom.detail);
      else checkActiveSession();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("konnect-active-live-session-updated", onCustomUpdate);

    const pollInterval = setInterval(() => {
      checkActiveSession();
      try {
        channel?.postMessage({ type: "is-teacher-live-query" });
      } catch {}
    }, 2500);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("konnect-active-live-session-updated", onCustomUpdate);
      clearInterval(pollInterval);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      if (!window.localStorage.getItem("konnect-access-token")) {
        router.replace("/login");
        return;
      }

      try {
        const user = await currentUser();
        const normalizedRole = String(user.role ?? "").trim().toUpperCase();
        if (normalizedRole !== "LEARNER" && normalizedRole !== "STUDENT") {
          router.replace(normalizedRole === "TEACHER" ? "/teacher/dashboard" : "/admin/dashboard");
          return;
        }

        const [classesResult, submissionsResult, progressResult, profileResult] = await Promise.allSettled([
          allPages<Enrollment>(getLearnerClasses),
          allPages<Submission>(getMyAssessmentSubmissions),
          jsonRequest<unknown>(getLearnerProgressGrades()),
          getLearnerProfile(),
        ]);
        if (!active) return;

        const failures = [classesResult, submissionsResult, progressResult, profileResult].filter((result) => result.status === "rejected").length;
        const classes = classesResult.status === "fulfilled" ? classesResult.value : [];
        const submissions = submissionsResult.status === "fulfilled" ? submissionsResult.value : [];
        const profile = profileResult.status === "fulfilled" ? profileResult.value : {};
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name || user.username || "Learner";

        setData({
          name: fullName || user.username || "Learner",
          classes: classes.filter((item) => !item.status || item.status.toUpperCase() === "ENROLLED"),
          submissions,
          learningGoals: String(profile.learning_goals ?? ""),
          attendanceRate: progressResult.status === "fulfilled" ? findAttendanceRate(progressResult.value) : null,
        });
        if (failures) setLoadNotice("Some learner records could not be loaded. Refresh to try again.");
      } catch {
        if (active) router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => { active = false; };
  }, [router]);

  const activeSubmissions = data.submissions.filter((submission) => submission.status === "IN_PROGRESS" || submission.status === "SUBMITTED");
  const gradedSubmissions = data.submissions.filter((submission) => submission.status === "GRADED");
  const inProgressSubmissions = data.submissions.filter((submission) => submission.status === "IN_PROGRESS");
  const gradedScores = gradedSubmissions.map(scoreValue).filter((score): score is number => score !== null);
  const averageScore = gradedScores.length ? gradedScores.reduce((sum, score) => sum + score, 0) / gradedScores.length : null;
  const totalSubmissions = data.submissions.length;
  const gradedShare = totalSubmissions ? Math.round((gradedSubmissions.length / totalSubmissions) * 100) : 0;
  const submittedShare = totalSubmissions ? Math.round((data.submissions.filter((submission) => submission.status === "SUBMITTED").length / totalSubmissions) * 100) : 0;
  const inProgressShare = totalSubmissions ? Math.round((inProgressSubmissions.length / totalSubmissions) * 100) : 0;
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5 py-3 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[#707c6c]">Your learning dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-[#172115] dark:text-[#ecf1ea]">Welcome, {data.name}</h1>
          <p className="mt-1 text-[9.5px] font-semibold uppercase text-[#707c6c] dark:text-[#a6aea0]">{todayLabel}</p>
        </div>
        <Link href="/learner/settings?section=profile" className="inline-flex min-h-9 items-center gap-1 rounded border border-[#d5ddce] bg-white px-3 text-[10px] font-semibold text-[#40522c] hover:bg-[#f6f8f3] dark:border-[#303b2d] dark:bg-[#1b211a] dark:text-[#d5e3cb]">
          Edit profile <ArrowRight size={12} />
        </Link>
      </header>

      {activeLiveClass && (
        <section
          aria-label="Active live class alert"
          className="relative overflow-hidden rounded-xl border border-[#b9dfb2] bg-gradient-to-r from-[#eef8eb] via-[#f7fbf5] to-[#ebf6e7] p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="relative mt-1 flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39882a] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#2c6e20]" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#28571e] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Live Class In Session
                  </span>
                  <span className="text-[10px] font-semibold text-[#416834]">
                    {activeLiveClass.courseTitle}
                  </span>
                </div>
                <h2 className="mt-1 text-[13px] font-bold text-[#1a2e16]">
                  {activeLiveClass.sessionTitle}
                </h2>
                <p className="mt-0.5 text-[10px] text-[#586c52]">
                  Host: {activeLiveClass.teacherName || "Instructor"} · Classroom studio is open now
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {requestStatuses[activeLiveClass.sessionId.toLowerCase().trim()] === "waiting" ? (
                <div className="flex items-center gap-2">
                  <div className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-[10px] font-bold text-amber-800 dark:text-amber-200 shadow-sm animate-pulse">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                    <span>Waiting for teacher approval...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancelRequest(activeLiveClass.sessionId)}
                    className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#cfd8cb] bg-white px-2.5 text-[9.5px] font-bold text-[#576451] hover:bg-[#edf2e8] transition"
                  >
                    <X size={12} />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : requestStatuses[activeLiveClass.sessionId.toLowerCase().trim()] === "admitted" ? (
                <div className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-bold text-white shadow">
                  <Check size={13} className="stroke-[3]" />
                  <span>Approved! Entering class...</span>
                </div>
              ) : activePendingSessionId && activePendingSessionId !== activeLiveClass.sessionId.toLowerCase().trim() ? (
                <div className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#dfdfdf] bg-[#f5f5f5] px-3.5 py-2 text-[10px] font-semibold text-[#707070] dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#999] opacity-80 cursor-not-allowed">
                  <span>1 Class Limit · Waiting for other class</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAskToJoin(activeLiveClass.sessionId, activeLiveClass.sessionTitle)}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#274e1d] px-4 text-[10.5px] font-bold text-white shadow hover:bg-[#346627] transition"
                >
                  <Video size={13} className="text-[#86efac] animate-pulse" />
                  <span>Ask to Join Live Class →</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {loadNotice && <p role="status" className="rounded border border-[#ead9b7] bg-[#fbf7ed] px-3 py-2 text-[10px] text-[#705a30]">{loadNotice}</p>}

      <section aria-label="Your learning summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Enrolled classes" value={loading ? "—" : String(data.classes.length)} detail="Your active enrollments" icon={<BookOpen size={15} />} />
        <Summary label="Assessment records" value={loading ? "—" : String(data.submissions.length)} detail="Submissions on your account" icon={<ClipboardList size={15} />} />
        <Summary label="Needs attention" value={loading ? "—" : String(activeSubmissions.length)} detail="In progress or awaiting review" icon={<GraduationCap size={15} />} />
        <Summary label="Attendance" value={loading ? "—" : data.attendanceRate === null ? "—" : `${data.attendanceRate}%`} detail="From your progress record" icon={<ChartNoAxesColumnIncreasing size={15} />} />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-lg border border-[#e2e7dd] bg-white p-4 dark:border-white/10 dark:bg-[#1b211a]">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-[12px] font-bold text-[#172115] dark:text-[#ecf1ea]">My classes</h2><p className="mt-1 text-[9px] text-[#7a8575] dark:text-[#a6aea0]">Classes linked to your learner account.</p></div>
            <Link href="/learner/courses" className="text-[9px] font-semibold text-[#40522c] hover:underline dark:text-[#c5d6bc]">All classes</Link>
          </div>
          <div className="mt-3 divide-y divide-[#edf0e9] dark:divide-white/10">
            {loading ? <p className="py-4 text-[10px] text-[#7a8575]">Loading your classes…</p> : data.classes.length ? data.classes.slice(0, 5).map((item) => {
              const cleanId = item.class_room.toLowerCase().trim();
              const currentStatus = requestStatuses[cleanId];

              return (
                <article key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-1">
                  <div className="min-w-0"><h3 className="truncate text-[10px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{item.class_title}</h3><p className="mt-1 truncate text-[8px] text-[#798374] dark:text-[#9aa592]">{item.class_subject || "Class"}{item.teacher_name ? ` · ${item.teacher_name}` : ""}</p></div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="hidden sm:inline-block rounded-full bg-[#edf4e8] px-2 py-1 text-[8px] font-semibold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">Enrolled</span>
                    {currentStatus === "waiting" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[8px] font-semibold text-amber-800 dark:text-amber-200 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                        Waiting for teacher approval...
                      </span>
                    ) : currentStatus === "admitted" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[8px] font-bold text-white shadow">
                        <Check size={10} className="stroke-[3]" />
                        Approved!
                      </span>
                    ) : currentStatus === "denied" ? (
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[7px] text-red-700">Declined</span>
                        <button
                          type="button"
                          onClick={() => handleAskToJoin(item.class_room, item.class_title)}
                          className="text-[7.5px] font-bold text-[#2e5924] underline"
                        >
                          Ask again
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAskToJoin(item.class_room, item.class_title)}
                        className="inline-flex items-center gap-1 rounded bg-[#274e1d] px-2.5 py-1 text-[8px] font-bold text-white shadow hover:bg-[#346627] transition-all"
                        title="Ask to join live class directly from your portal"
                      >
                        <Video size={10} className="text-[#86efac]" />
                        <span>Ask to Join</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            }) : <p className="py-4 text-[10px] text-[#7a8575]">No enrolled classes are linked to this account yet.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e7dd] bg-white p-4 dark:border-white/10 dark:bg-[#1b211a]">
          <div className="flex items-center gap-2"><ChartNoAxesColumnIncreasing size={15} className="text-[#405b35]" /><h2 className="text-[12px] font-bold text-[#172115] dark:text-[#ecf1ea]">Assessment progress</h2></div>
          <p className="mt-1 text-[9px] text-[#7a8575] dark:text-[#a6aea0]">Based on your submitted assessment records.</p>
          {loading ? <p className="mt-5 text-[10px] text-[#7a8575]">Loading your progress…</p> : totalSubmissions ? <>
              <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-[#edf0e9] dark:bg-[#2a3328]" aria-label={`${gradedShare}% graded, ${submittedShare}% submitted, ${inProgressShare}% in progress`}>
              <span className="bg-[#36532e]" style={{ width: `${gradedShare}%` }} />
              <span className="bg-[#b8a067]" style={{ width: `${submittedShare}%` }} />
              <span className="bg-[#8ba2bb]" style={{ width: `${inProgressShare}%` }} />
            </div>
            <dl className="mt-4 space-y-2 text-[9px]">
              <div className="flex justify-between"><dt className="text-[#687463] dark:text-[#a6aea0]">Graded</dt><dd className="font-semibold">{gradedSubmissions.length}</dd></div>
              <div className="flex justify-between"><dt className="text-[#687463] dark:text-[#a6aea0]">Submitted</dt><dd className="font-semibold">{data.submissions.filter((submission) => submission.status === "SUBMITTED").length}</dd></div>
              <div className="flex justify-between"><dt className="text-[#687463] dark:text-[#a6aea0]">In progress</dt><dd className="font-semibold">{inProgressSubmissions.length}</dd></div>
              <div className="flex justify-between border-t border-[#edf0e9] pt-2 dark:border-white/10"><dt className="text-[#687463] dark:text-[#a6aea0]">Average graded score</dt><dd className="font-semibold">{averageScore === null ? "—" : averageScore.toFixed(1)}</dd></div>
            </dl>
          </> : <p className="mt-5 text-[10px] text-[#7a8575]">There are no assessment records to summarize yet.</p>}
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-lg border border-[#e2e7dd] bg-white p-4 dark:border-white/10 dark:bg-[#1b211a]">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-[12px] font-bold text-[#172115] dark:text-[#ecf1ea]">Recent assessments</h2><p className="mt-1 text-[9px] text-[#7a8575] dark:text-[#a6aea0]">Your submissions and review status.</p></div><Link href="/learner/grades" className="text-[9px] font-semibold text-[#40522c] hover:underline dark:text-[#c5d6bc]">View grades</Link></div>
          <div className="mt-3 divide-y divide-[#edf0e9] dark:divide-white/10">
            {loading ? <p className="py-4 text-[10px] text-[#7a8575]">Loading your assessment records…</p> : data.submissions.length ? data.submissions.slice(0, 5).map((submission) => (
              <article key={submission.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-1">
                <div className="min-w-0"><h3 className="truncate text-[10px] font-semibold text-[#273124] dark:text-[#e5ebdf]">{submission.assessment_title}</h3><p className="mt-1 text-[8px] text-[#798374] dark:text-[#9aa592]">{displayDate(submission.submitted_at)}</p></div>
                <div className="shrink-0 text-right"><p className="text-[8px] font-semibold text-[#405b35] dark:text-[#c5d6bc]">{submission.status.replaceAll("_", " ")}</p>{scoreValue(submission) !== null && <p className="mt-1 text-[8px] text-[#798374]">Score {scoreValue(submission)}</p>}</div>
              </article>
            )) : <p className="py-4 text-[10px] text-[#7a8575]">No assessment submissions are linked to this account yet.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-[#e2e7dd] bg-white p-4 dark:border-white/10 dark:bg-[#1b211a]">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-[12px] font-bold text-[#172115] dark:text-[#ecf1ea]">Your learning goals</h2><p className="mt-1 text-[9px] text-[#7a8575] dark:text-[#a6aea0]">Saved on your learner profile.</p></div><Link href="/learner/settings?section=account" className="text-[9px] font-semibold text-[#40522c] hover:underline dark:text-[#c5d6bc]">Edit goals</Link></div>
          {loading ? <p className="mt-4 text-[10px] text-[#7a8575]">Loading your learner profile…</p> : data.learningGoals ? <p className="mt-4 whitespace-pre-wrap text-[10px] leading-5 text-[#495344] dark:text-[#d6dfd0]">{data.learningGoals}</p> : <p className="mt-4 text-[10px] text-[#7a8575] dark:text-[#a6aea0]">No learning goals added yet. Add your goals to your learner profile to see them here.</p>}
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-[#e2e7dd] bg-white p-3.5 dark:border-white/10 dark:bg-[#1b211a]">
      <div className="flex items-start justify-between gap-2"><div><p className="text-[9px] font-medium text-[#707c6c] dark:text-[#a6aea0]">{label}</p><p className="mt-1.5 text-xl font-bold text-[#172115] dark:text-[#ecf1ea]">{value}</p></div><span className="grid size-8 place-items-center rounded bg-[#edf4e8] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">{icon}</span></div>
      <p className="mt-1 text-[8px] text-[#899085] dark:text-[#929a8d]">{detail}</p>
    </article>
  );
}
