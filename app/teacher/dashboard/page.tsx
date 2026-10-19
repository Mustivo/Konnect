"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TeacherClassCreator from "@/components/dashboard/TeacherClassCreator";
import { apiJson, getClassAssessments, getTeacherClasses } from "@/lib/api";
import {
  admitLiveJoinRequest,
  getLiveJoinRequests,
  rejectLiveJoinRequest,
} from "@/lib/api/sessions";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileText,
  Mic,
  MoreVertical,
  Radio,
  Search,
  ThumbsUp,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";

const stats = [
  { label: "Active Classes", value: "3", note: "3/3 class limit", icon: BookOpen, tone: "bg-[#edf4e8] text-[#34522a]" },
  { label: "Students", value: "83", note: "Across all classes", icon: Users, tone: "bg-[#eaf2ff] text-[#2563a8]" },
  { label: "Pending Reviews", value: "42", note: "Assignments waiting", icon: FileText, tone: "bg-[#fce7f3] text-[#be3b75]" },
  { label: "Approvals", value: "3", note: "New requests today", icon: Check, tone: "bg-[#fef4e8] text-[#c2781b]" },
];

type TeacherClassSummary = { id: string; code: string; subject: string; title: string; group: string; students: number; tasks: number; schedule: string; time: string };

const classes: TeacherClassSummary[] = [
  { id: "python-web-dev", code: "PYTH 101", subject: "PYTH 101 · GRADE 11", title: "Python & Web Development", group: "G1 / Class - A", students: 34, tasks: 14, schedule: "Mon, Wed, Fri", time: "09:00 AM" },
  { id: "algebra", code: "MATH 101", subject: "MATH 101 · GRADE 1", title: "Math Algebra Unit Formula", group: "G1 / Class - A", students: 28, tasks: 12, schedule: "Mon, Wed, Fri", time: "09:00 AM" },
  { id: "geometry", code: "ALG 201", subject: "ALG 201 · GRADE 1", title: "Advanced Linear Geometry", group: "G1 / Class - B", students: 30, tasks: 18, schedule: "Tue, Thu", time: "11:00 AM" },
];

type ApiClassRoom = { id: string; title: string; subject?: string; enrolled_count?: string | number; max_students?: number; start_date?: string | null };
type ApiAssessmentList = { results?: Array<{ id: string }> } | Array<{ id: string }>;

const initialApprovals = [
  { name: "Sophie Bennett", meta: "G1 / Class - A · 5 mins ago" },
  { name: "Oscar Hughes", meta: "G1 / Class - A · 12 mins ago" },
  { name: "Freya Cooper", meta: "G1 / Class - A" },
];

const rosterStudents = [
  { name: "Steven Mwizerwa", id: "KA-000", email: "stevenmwizerwa1@gmail.com", joined: "07 Sep 2026", attendance: "98.5%" },
  { name: "Oliver James", id: "KA-001", email: "oliver.james@student.school.edu", joined: "07 Sep 2026", attendance: "100%" },
  { name: "David Peter", id: "KA-002", email: "david.peter@student.school.edu", joined: "07 Sep 2026", attendance: "96.4%" },
  { name: "Lilly Paul", id: "KA-003", email: "lilly.paul@student.school.edu", joined: "07 Sep 2026", attendance: "100%" },
  { name: "Emma Wilson", id: "KA-004", email: "emma.wilson@student.school.edu", joined: "07 Sep 2026", attendance: "92.9%" },
  { name: "Noah Williams", id: "KA-005", email: "noah.williams@student.school.edu", joined: "07 Sep 2026", attendance: "92.9%" },
  { name: "Ava Thompson", id: "KA-006", email: "ava.thompson@student.school.edu", joined: "07 Sep 2026", attendance: "96.4%" },
  { name: "Ethan Brown", id: "KA-007", email: "ethan.brown@student.school.edu", joined: "07 Sep 2026", attendance: "85.7%" },
  { name: "Mia Davis", id: "KA-008", email: "mia.davis@student.school.edu", joined: "07 Sep 2026", attendance: "89.3%" },
];

const initialNotes = [
  { title: "Prepare Questions for Unit Test", text: "Prepare questions for unit tests", date: "05 Dec 2026" },
  { title: "Announcements to Students", text: "Announce important updates to students", date: "01 Dec 2026" },
];

const activeClasses = [
  { id: "python-web-dev", subject: "PYTH 101 · GRADE 11", title: "Python & Web Development", group: "G1 / Class - A", students: 34, tasks: 14, schedule: "Mon, Wed, Fri", time: "09:00 AM" },
  { id: "algebra", subject: "MATH 101 · GRADE 1", title: "Math Algebra Unit Formula", group: "G1 / Class - A", students: 28, tasks: 12, schedule: "Mon, Wed, Fri", time: "09:00 AM" },
  { id: "geometry", subject: "ALG 201 · GRADE 1", title: "Advanced Linear Geometry", group: "G1 / Class - B", students: 30, tasks: 18, schedule: "Tue, Thu", time: "11:00 AM" },
];

const plannerItems = [
  { title: "Maths Algebra Unit Formula", className: "G1 / Class - A", status: "Overdue", color: "text-[#cf5047] bg-[#fbe9e7]" },
  { title: "Linear Functions Review", className: "G1 / Class - B", status: "Today", color: "text-[#4e7543] bg-[#e7f1e2]" },
];

type LiveClassJoinRequest = {
  id: string;
  sessionId: string;
  classTitle?: string;
  teacherName?: string;
  learnerId: string;
  learnerName: string;
  requestedAt: string;
  status: "waiting" | "admitted" | "denied";
};

export default function TeacherDashboardPage() {
  const pathname = usePathname();
  const isRosterView = pathname === "/teacher/student";
  const [activeClasses, setActiveClasses] = useState(classes);
  const activeClassesRef = useRef(activeClasses);
  useEffect(() => {
    activeClassesRef.current = activeClasses;
  }, [activeClasses]);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [liveRequests, setLiveRequests] = useState<LiveClassJoinRequest[]>([]);
  const [liveActionNotice, setLiveActionNotice] = useState("");
  const [notes] = useState(initialNotes);
  const [, setAddingNote] = useState(false);
  const [rosterClass, setRosterClass] = useState("Algebra I · Grade 9 · Class A");
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterTab, setRosterTab] = useState<"enrolled" | "requests">("enrolled");
  const [copyMessage, setCopyMessage] = useState("");
  const [apiClassCount, setApiClassCount] = useState<number | null>(null);
  const [apiStudentCount, setApiStudentCount] = useState<number | null>(null);
  const [loadNotice, setLoadNotice] = useState("");
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  type LiveAttendedInfo = {
    activeSessionId: string;
    activeSessionTitle: string;
    courseTitle: string;
    teacherName: string;
    isLiveNow: boolean;
    attendedStudents: Array<{
      id: string;
      name: string;
      email: string;
      joinedAt: string;
      status: string;
      attendanceRate: string;
      durationMinutes: number;
      micOn: boolean;
      cameraOn: boolean;
    }>;
  };

  const [liveAttendanceData, setLiveAttendanceData] = useState<LiveAttendedInfo>({
    activeSessionId: "python-web-dev",
    activeSessionTitle: "Python & Web Development",
    courseTitle: "Classroom Studio",
    teacherName: "Mutiti Stivo",
    isLiveNow: false,
    attendedStudents: [
      {
        id: "KA-000",
        name: "Steven Mwizerwa",
        email: "stevenmwizerwa1@gmail.com",
        joinedAt: "Today, 09:55 AM",
        status: "Present",
        attendanceRate: "98.5%",
        durationMinutes: 15,
        micOn: true,
        cameraOn: true,
      },
    ],
  });

  useEffect(() => {
    function checkLiveAttendance() {
      let isLive = false;
      let sId = "python-web-dev";
      let sTitle = "Python & Web Development";
      let cTitle = "Classroom Studio";
      let tName = "Mutiti Stivo";

      try {
        const liveRaw = localStorage.getItem("konnect-active-live-session");
        if (liveRaw) {
          const parsed = JSON.parse(liveRaw);
          if (parsed && (parsed.status === "LIVE" || parsed.sessionId)) {
            isLive = true;
            sId = parsed.sessionId || parsed.classId || sId;
            sTitle = parsed.sessionTitle || parsed.courseTitle || sTitle;
            cTitle = parsed.courseTitle || cTitle;
            tName = parsed.teacherName || tName;
          }
        }
      } catch {}

      const cleanSessionId = sId.toLowerCase().trim();
      let studentName = "Steven Mwizerwa";
      let joinedAt = "Today, 09:55 AM";

      try {
        const connRaw = localStorage.getItem(`konnect-live-class-connected:${cleanSessionId}`) || localStorage.getItem(`konnect-live-class-connected:${sId}`);
        if (connRaw) {
          const conn = JSON.parse(connRaw);
          if (conn) {
            const raw = String(conn.name || "");
            studentName = (!raw || raw === "Learner" || raw === "learner") ? "Steven Mwizerwa" : raw;
            if (conn.connectedAt) {
              joinedAt = new Date(conn.connectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
          }
        }
      } catch {}

      setLiveAttendanceData({
        activeSessionId: sId,
        activeSessionTitle: sTitle,
        courseTitle: cTitle,
        teacherName: tName,
        isLiveNow: isLive,
        attendedStudents: [
          {
            id: "KA-000",
            name: studentName,
            email: "stevenmwizerwa1@gmail.com",
            joinedAt,
            status: "Present",
            attendanceRate: "98.5%",
            durationMinutes: 15,
            micOn: true,
            cameraOn: true,
          },
        ],
      });
    }

    checkLiveAttendance();
    const interval = setInterval(checkLiveAttendance, 3000);

    function handleLiveStorage(e: StorageEvent) {
      if (
        e.key === "konnect-active-live-session" ||
        (e.key && e.key.startsWith("konnect-live-class-connected:")) ||
        (e.key && e.key.startsWith("konnect-live-class-admitted:"))
      ) {
        checkLiveAttendance();
      }
    }

    window.addEventListener("storage", handleLiveStorage);
    window.addEventListener("konnect-active-live-session-updated", checkLiveAttendance);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleLiveStorage);
      window.removeEventListener("konnect-active-live-session-updated", checkLiveAttendance);
    };
  }, []);

  function playJoinChime() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  }

  function acceptLiveRequest(req: LiveClassJoinRequest) {
    const cleanSessionId = String(req.sessionId || "general").toLowerCase().trim();
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    const admissionPayload = {
      sessionId: cleanSessionId,
      requestId: req.id,
      learnerId: req.learnerId,
      status: "admitted" as const,
      timestamp: Date.now(),
    };

    channel?.postMessage(admissionPayload);
    channel?.close();

    localStorage.setItem(`konnect-live-class-admission:${cleanSessionId}`, JSON.stringify(admissionPayload));
    localStorage.setItem(`konnect-live-class-admission:${req.sessionId}`, JSON.stringify(admissionPayload));
    localStorage.setItem(`konnect-live-class-admitted:${cleanSessionId}`, "true");
    localStorage.setItem(`konnect-live-class-admitted:${req.sessionId}`, "true");

    try {
      const rawAll = localStorage.getItem("konnect-all-live-requests");
      if (rawAll) {
        const parsed = JSON.parse(rawAll);
        const filtered = Array.isArray(parsed)
          ? parsed.filter((item: LiveClassJoinRequest) => item.id !== req.id && item.learnerId !== req.learnerId)
          : [];
        localStorage.setItem("konnect-all-live-requests", JSON.stringify(filtered));
      }
      localStorage.removeItem(`konnect-live-class-request:${cleanSessionId}`);
      localStorage.removeItem(`konnect-live-class-request:${req.sessionId}`);
    } catch {}

    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id && r.learnerId !== req.learnerId));
    setLiveActionNotice(`✓ Admitted ${req.learnerName} into ${req.classTitle || "live class"}.`);
    setTimeout(() => setLiveActionNotice(""), 4500);

    void admitLiveJoinRequest(cleanSessionId, req.id, {
      learner_id: req.learnerId,
      learner_name: req.learnerName,
    }).catch(() => undefined);
  }

  function rejectLiveRequest(req: LiveClassJoinRequest) {
    const cleanSessionId = String(req.sessionId || "general").toLowerCase().trim();
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    const rejectionPayload = {
      sessionId: cleanSessionId,
      requestId: req.id,
      learnerId: req.learnerId,
      status: "denied" as const,
      timestamp: Date.now(),
    };

    channel?.postMessage(rejectionPayload);
    channel?.close();

    localStorage.setItem(`konnect-live-class-admission:${cleanSessionId}`, JSON.stringify(rejectionPayload));
    localStorage.setItem(`konnect-live-class-admission:${req.sessionId}`, JSON.stringify(rejectionPayload));

    try {
      const rawAll = localStorage.getItem("konnect-all-live-requests");
      if (rawAll) {
        const parsed = JSON.parse(rawAll);
        const filtered = Array.isArray(parsed)
          ? parsed.filter((item: LiveClassJoinRequest) => item.id !== req.id && item.learnerId !== req.learnerId)
          : [];
        localStorage.setItem("konnect-all-live-requests", JSON.stringify(filtered));
      }
      localStorage.removeItem(`konnect-live-class-request:${cleanSessionId}`);
      localStorage.removeItem(`konnect-live-class-request:${req.sessionId}`);
    } catch {}

    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id && r.learnerId !== req.learnerId));
    setLiveActionNotice(`✕ Declined live class join request from ${req.learnerName}.`);
    setTimeout(() => setLiveActionNotice(""), 4500);

    void rejectLiveJoinRequest(cleanSessionId, req.id, {
      learner_id: req.learnerId,
    }).catch(() => undefined);
  }

  // Real-time tracking of learner join requests across BroadcastChannel, localStorage, and API
  useEffect(() => {
    function parseJoinRequestItem(raw: unknown): LiveClassJoinRequest | null {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const learnerId = String(r.learner_id || r.learnerId || r.requestId || r.id || "").trim();
      const learnerName = String(r.learner_name || r.learnerName || "Learner").trim();
      const sessionId = String(r.session_id || r.sessionId || "general").trim();
      const reqId = String(r.id || r.requestId || learnerId).trim();
      const status = (r.status as "waiting" | "admitted" | "denied") || "waiting";
      if (!learnerId || status !== "waiting") return null;
      return {
        id: reqId,
        sessionId,
        classTitle: String(r.class_title || r.classTitle || "Live Classroom"),
        teacherName: String(r.teacher_name || r.teacherName || "Instructor"),
        learnerId,
        learnerName,
        requestedAt: String(r.requested_at || r.requestedAt || "Just now"),
        status,
      };
    }

    function isRequestForMyClass(item: LiveClassJoinRequest): boolean {
      const sId = String(item.sessionId || "").toLowerCase().trim();
      const cTitle = String(item.classTitle || "").toLowerCase().trim();

      // Check current activeClasses of this teacher
      const myClasses = activeClassesRef.current;
      if (myClasses.some((c) => c.id.toLowerCase().trim() === sId)) return true;
      if (cTitle && myClasses.some((c) => c.title && c.title.toLowerCase().trim() === cTitle)) return true;

      // Check classes created by this teacher stored in localStorage
      try {
        const stored = window.localStorage.getItem("konnect-teacher-created-classes");
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          if (Array.isArray(ids) && ids.some((id) => String(id).toLowerCase().trim() === sId)) return true;
        }
      } catch {}

      // Teacher default classes
      const defaultSlugs = ["python-web-dev", "algebra", "geometry"];
      if (defaultSlugs.includes(sId)) return true;

      return false;
    }

    function syncRequests() {
      const discoveredMap = new Map<string, LiveClassJoinRequest>();

      try {
        const rawAll = window.localStorage.getItem("konnect-all-live-requests");
        if (rawAll) {
          const parsed = JSON.parse(rawAll);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              const parsedItem = parseJoinRequestItem(item);
              if (parsedItem && isRequestForMyClass(parsedItem)) {
                discoveredMap.set(parsedItem.id, parsedItem);
              }
            }
          }
        }
      } catch {}

      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith("konnect-live-class-request:")) {
            const val = window.localStorage.getItem(key);
            if (val) {
              const parsedItem = parseJoinRequestItem(JSON.parse(val));
              if (parsedItem && isRequestForMyClass(parsedItem)) {
                discoveredMap.set(parsedItem.id, parsedItem);
              }
            }
          }
        }
      } catch {}

      void getLiveJoinRequests("all")
        .then((res) => apiJson<{ results?: Array<Record<string, unknown>> }>(res))
        .then((data) => {
          if (data?.results && Array.isArray(data.results)) {
            for (const item of data.results) {
              const parsedItem = parseJoinRequestItem(item);
              if (parsedItem && isRequestForMyClass(parsedItem)) {
                discoveredMap.set(parsedItem.id, parsedItem);
              }
            }
          }
          const list = Array.from(discoveredMap.values());
          setLiveRequests((current) => {
            if (current.length === 0 && list.length === 0) return current;
            const currentIds = current.map((c) => c.id).join(",");
            const listIds = list.map((l) => l.id).join(",");
            if (currentIds === listIds) return current;
            if (list.length > current.length) {
              playJoinChime();
            }
            return list;
          });
        })
        .catch(() => {
          const list = Array.from(discoveredMap.values());
          setLiveRequests((current) => {
            if (current.length === 0 && list.length === 0) return current;
            const currentIds = current.map((c) => c.id).join(",");
            const listIds = list.map((l) => l.id).join(",");
            if (currentIds === listIds) return current;
            return list;
          });
        });
    }

    syncRequests();

    let admissionChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        admissionChannel = new BroadcastChannel("konnect-live-class-admission");
        admissionChannel.onmessage = (event) => {
          if (event.data?.type === "join-request") {
            const parsed = parseJoinRequestItem(event.data);
            if (parsed && isRequestForMyClass(parsed)) {
              setLiveRequests((prev) => {
                if (prev.some((r) => r.id === parsed.id || r.learnerId === parsed.learnerId)) return prev;
                playJoinChime();
                return [parsed, ...prev];
              });
            }
          } else if (event.data?.type === "cancel-request") {
            const targetId = event.data.requestId || event.data.learnerId;
            setLiveRequests((prev) => prev.filter((r) => r.id !== targetId && r.learnerId !== targetId));
          } else if (event.data?.status === "admitted" || event.data?.status === "denied") {
            const targetId = event.data.requestId || event.data.learnerId;
            setLiveRequests((prev) => prev.filter((r) => r.id !== targetId && r.learnerId !== targetId));
          }
        };
      } catch {}
    }

    function handleStorage(e: StorageEvent) {
      if (
        e.key === "konnect-all-live-requests" ||
        e.key === "konnect-teacher-created-classes" ||
        (e.key && e.key.startsWith("konnect-live-class-request:")) ||
        (e.key && e.key.startsWith("konnect-live-class-admission:"))
      ) {
        syncRequests();
      }
    }

    function handleCreatedClass() {
      syncRequests();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("konnect-teacher-class-created", handleCreatedClass);
    const interval = setInterval(syncRequests, 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("konnect-teacher-class-created", handleCreatedClass);
      clearInterval(interval);
      admissionChannel?.close();
    };
  }, []);

  function copyClassLink(classId: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(classId)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => undefined);
    }
    setCopiedSessionId(classId);
    setTimeout(() => setCopiedSessionId(null), 2500);
  }

  function dismissApproval(name: string) {
    setApprovals((current) => current.filter((approval) => approval.name !== name));
  }

  useEffect(() => {
    if (!window.localStorage.getItem("konnect-access-token")) return;
    let cancelled = false;

    async function loadTeacherClasses() {
      try {
        const response = await getTeacherClasses();
        const payload = await apiJson<ApiClassRoom[] | { results?: ApiClassRoom[] }>(response);
        const records = Array.isArray(payload) ? payload : payload.results ?? [];
        const mapped = await Promise.all(records.map(async (classRoom, index) => {
          let taskCount = 0;
          try {
            const assessments = await apiJson<ApiAssessmentList>(await getClassAssessments(classRoom.id));
            taskCount = Array.isArray(assessments) ? assessments.length : assessments.results?.length ?? 0;
          } catch {
            taskCount = 0;
          }
          return {
            id: classRoom.id,
            code: (classRoom.subject || `CLASS ${index + 1}`).toUpperCase().slice(0, 12),
            subject: `${(classRoom.subject || `CLASS ${index + 1}`).toUpperCase()} · CLASS`,
            title: classRoom.title,
            group: classRoom.subject || `Class ${index + 1}`,
            students: Number(classRoom.enrolled_count) || 0,
            tasks: taskCount,
            schedule: classRoom.start_date ? "Starts" : "Schedule",
            time: classRoom.start_date ? new Date(classRoom.start_date).toLocaleDateString("en-GB") : "To be announced",
          };
        }));

        if (!cancelled) {
          setActiveClasses(mapped);
          setApiClassCount(records.length);
          setApiStudentCount(records.reduce((sum, item) => sum + (Number(item.enrolled_count) || 0), 0));
        }
      } catch {
        if (!cancelled) setLoadNotice("Live class data is temporarily unavailable. Showing the dashboard preview.");
      }
    }

    void loadTeacherClasses();
    return () => { cancelled = true; };
  }, []);

  const activeClassTotal = apiClassCount ?? activeClasses.length;
  const studentTotal = apiStudentCount ?? activeClasses.reduce((total, item) => total + item.students, 0);
  const pendingReviewCount = stats.find((stat) => stat.label === "Pending Reviews")?.value ?? "0";
  const overviewMetrics = [
    { label: "Active Classes", value: String(activeClassTotal), icon: BookOpen, tone: "bg-[#e5efdf] text-[#34522a]" },
    { label: "Students", value: String(studentTotal), icon: Users, tone: "bg-[#eaf2ff] text-[#2563a8]" },
    { label: "Pending Review", value: String(pendingReviewCount), icon: FileText, tone: "bg-[#fce7f3] text-[#be3b75]" },
    { label: "Approvals", value: String(approvals.length + liveRequests.length), icon: Check, tone: "bg-[#fef4e8] text-[#c2781b]" },
    { label: "Classes Created", value: `${activeClassTotal}/3`, icon: CalendarDays, tone: "bg-[#e5f0ff] text-[#3475b9]" },
  ];
  const filteredStudents = rosterStudents.filter((student) => {
    const query = rosterSearch.trim().toLowerCase();
    return !query || `${student.name} ${student.id} ${student.email}`.toLowerCase().includes(query);
  });

  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText("ALG-9A-26");
      setCopyMessage("Class code copied.");
    } catch {
      setCopyMessage("Copy is unavailable in this browser.");
    }
  }

  return (
    <DashboardShell role="teacher" teacherDashboard>
      <TeacherClassCreator />
      <div className="space-y-5 pt-1 pb-8">
        {loadNotice && <p role="status" className="text-[9px] text-[#7d8979]">{loadNotice}</p>}

        {liveActionNotice && (
          <aside role="status" className="flex items-center gap-2 rounded-xl border border-[#c2e2bc] bg-[#eff8ec] px-4 py-2.5 text-[10px] font-semibold text-[#25571a] shadow-sm dark:border-[#2f5424] dark:bg-[#1a2918] dark:text-[#aee09f]">
            <Check size={14} className="text-[#3b7b28]" />
            <span>{liveActionNotice}</span>
          </aside>
        )}

        {liveRequests.length > 0 && (
          <section
            aria-label="Pending live class join requests"
            className="relative overflow-hidden rounded-2xl border-2 border-[#3d7a31] bg-gradient-to-r from-[#edf7eb] via-[#f7fcf5] to-[#eaf5e7] p-4 shadow-[0_6px_24px_rgba(40,110,25,0.14)] dark:border-[#3a5e30] dark:from-[#182618] dark:via-[#1c2e1b] dark:to-[#172416]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e6d2] pb-3 dark:border-[#2b4425]">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39882a] opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#2c6e20]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#244f1c] px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white shadow-xs">
                      <Bell size={10} className="animate-bounce" />
                      Live Lobby Request
                    </span>
                    <h2 className="text-[14px] font-extrabold text-[#192f15] dark:text-[#ecf3e9]">
                      Learner Waiting to Join Class ({liveRequests.length})
                    </h2>
                  </div>
                  <p className="mt-0.5 text-[9px] text-[#55694f] dark:text-[#9bb094]">
                    Learners joined the waiting room directly from their portal without a link. Accept to admit them, or reject the request.
                  </p>
                </div>
              </div>
              <span className="rounded-md border border-[#c7dbc0] bg-[#f0f8ed] px-2.5 py-1 text-[8.5px] font-medium text-[#3b5930] dark:border-[#354c30] dark:bg-[#1a2819] dark:text-[#bedbb5]">
                Teacher Dashboard Review Mode
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {liveRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#cfe2c9] bg-white p-3.5 shadow-xs dark:border-[#2d422a] dark:bg-[#141d13]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#24401c] text-[12px] font-bold text-white shadow">
                      {req.learnerName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "L"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-[13px] text-[#1c2a1a] dark:text-[#eef4ec]">
                          {req.learnerName}
                        </p>
                        <span className="rounded-full bg-[#fdf5e7] px-2 py-0.5 text-[8px] font-bold text-[#9b6818] border border-[#e8d2a6] dark:bg-[#2b2010] dark:text-[#f2c66d]">
                          Waiting in lobby · {req.requestedAt || "Just now"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-[#465a41] dark:text-[#b4c7ae]">
                        Target Class: <strong className="font-bold text-[#20371a] dark:text-[#cde4c5]">{req.classTitle || "Live Classroom Session"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => acceptLiveRequest(req)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#274e1d] px-4 text-[10.5px] font-bold text-white shadow hover:bg-[#346627] transition-all active:scale-[0.98]"
                    >
                      <Check size={14} className="text-[#86efac]" />
                      <span>Accept / Admit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectLiveRequest(req)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e5c3bd] bg-[#fff5f3] px-3.5 text-[10.5px] font-bold text-[#b83535] hover:bg-[#fde9e6] transition-all active:scale-[0.98] dark:border-[#4d2520] dark:bg-[#241514] dark:text-[#f89c9c]"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                    <Link
                      href={`/teacher/live-classes/${encodeURIComponent(req.sessionId)}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c5d5bf] bg-[#f8faf6] px-3 text-[10.5px] font-bold text-[#344d2c] hover:bg-[#edf3e9] transition-all dark:border-[#2a3c27] dark:bg-[#192218] dark:text-[#cde0c7]"
                      title="Launch studio to start audio/video session"
                    >
                      <Video size={13} className="text-[#3b732d]" />
                      <span>Go to Live Room →</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LIVE CLASS ATTENDANCE & ATTENDED STUDENTS */}
        {!isRosterView && (
          <section
            aria-label="Live class attendance and attended students"
            className="overflow-hidden rounded-2xl border-2 border-[#3d7a31] bg-gradient-to-br from-[#ffffff] via-[#f7faf5] to-[#edf6ea] p-4 shadow-sm dark:border-[#2f4f26] dark:from-[#131d13] dark:via-[#162215] dark:to-[#1a2819]"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1ebd9] pb-3 dark:border-[#273924]">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5 shrink-0">
                  <span className={`absolute inline-flex h-full w-full rounded-full ${liveAttendanceData.isLiveNow ? "animate-ping bg-[#348e24] opacity-75" : "bg-[#528442] opacity-40"}`} />
                  <span className={`relative inline-flex h-3.5 w-3.5 rounded-full ${liveAttendanceData.isLiveNow ? "bg-[#287919]" : "bg-[#457337]"}`} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#244f1c] px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white shadow-xs">
                      <Radio size={10} className={liveAttendanceData.isLiveNow ? "animate-pulse text-[#86efac]" : "text-[#b2e2a4]"} />
                      {liveAttendanceData.isLiveNow ? "Live Studio Active" : "Classroom Attendance"}
                    </span>
                    <h2 className="text-[13.5px] font-extrabold text-[#192f15] dark:text-[#ecf3e9]">
                      {liveAttendanceData.activeSessionTitle} · Attended Students
                    </h2>
                  </div>
                  <p className="mt-0.5 text-[9px] text-[#55694f] dark:text-[#9bb094]">
                    Real-time presence tracking for teacher studio session · Host: {liveAttendanceData.teacherName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/teacher/live-classes/${encodeURIComponent(liveAttendanceData.activeSessionId)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#274e1d] px-3.5 text-[10px] font-bold text-white shadow hover:bg-[#346627] transition-all hover:scale-105 active:scale-95"
                >
                  <Video size={13} className="text-[#86efac]" />
                  <span>Open Live Studio →</span>
                </Link>
                <Link
                  href="/teacher/attendance"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#c5d5bf] bg-white px-3 text-[10px] font-bold text-[#344d2c] hover:bg-[#f3f7f0] transition-all dark:border-[#2c3d28] dark:bg-[#182317] dark:text-[#cde0c7]"
                >
                  <UserCheck size={12} className="text-[#3b732d]" />
                  <span>Full Roster</span>
                </Link>
              </div>
            </div>

            {/* Attended Students Content Grid */}
            <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
              {/* Attended Students List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-[#526a4b] dark:text-[#9eb497]">
                  <span>Attended Student in Classroom ({liveAttendanceData.attendedStudents.length})</span>
                  <span>Live Status</span>
                </div>

                {liveAttendanceData.attendedStudents.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#cbe1c3] bg-white p-3 shadow-xs dark:border-[#2c4028] dark:bg-[#172115]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#2d5823] text-[10px] font-extrabold text-white shadow-xs">
                        {st.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "SM"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-[11px] font-bold text-[#1a2818] dark:text-[#edf3eb]">
                            {st.name}
                          </p>
                          <span className="rounded bg-[#e8f5e5] px-1.5 py-0.5 text-[7px] font-bold text-[#2a681e] border border-[#bfe2b4] dark:bg-[#1a2e18] dark:text-[#aee09f]">
                            Enrolled Student
                          </span>
                        </div>
                        <p className="truncate text-[8px] text-[#63725e] dark:text-[#9eab9a]">
                          {st.email} · {st.id} · Joined {st.joinedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-[8px] font-semibold text-[#3b6631] dark:text-[#aee09f]">
                        <span className="flex items-center gap-1 rounded bg-[#f0f8ed] px-1.5 py-0.5 border border-[#cde5c5] dark:bg-[#1c2d1a] dark:border-[#2f492b]">
                          <Video size={10} /> Cam On
                        </span>
                        <span className="flex items-center gap-1 rounded bg-[#f0f8ed] px-1.5 py-0.5 border border-[#cde5c5] dark:bg-[#1c2d1a] dark:border-[#2f492b]">
                          <Mic size={10} /> Mic On
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf6e7] px-2.5 py-1 text-[8px] font-extrabold text-[#25611c] border border-[#b8dfb0] dark:bg-[#1b2f19] dark:text-[#86efac]">
                        <Check size={11} className="text-[#3b872b]" />
                        {st.status} · {st.attendanceRate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attendance Quick Stats Box */}
              <div className="flex flex-col justify-between rounded-xl border border-[#d2e5ca] bg-[#f5fbf2] p-3 text-[9px] dark:border-[#2b3e28] dark:bg-[#162015]">
                <div>
                  <p className="font-extrabold text-[10px] text-[#243c1f] dark:text-[#edf2ea]">
                    Live Attendance Metrics
                  </p>
                  <p className="text-[7.5px] text-[#687b62] dark:text-[#9ea999] mt-0.5">
                    Verified for {liveAttendanceData.activeSessionTitle}
                  </p>

                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between rounded bg-white px-2 py-1 dark:bg-[#192318]">
                      <span className="text-[#596d53] dark:text-[#97a992]">Attendance Rate:</span>
                      <strong className="font-extrabold text-[#255e1c] dark:text-[#aee09f]">100% Present</strong>
                    </div>
                    <div className="flex items-center justify-between rounded bg-white px-2 py-1 dark:bg-[#192318]">
                      <span className="text-[#596d53] dark:text-[#97a992]">Active Learners:</span>
                      <strong className="font-bold text-[#1a2818] dark:text-[#edf2ea]">{liveAttendanceData.attendedStudents.length} Student</strong>
                    </div>
                    <div className="flex items-center justify-between rounded bg-white px-2 py-1 dark:bg-[#192318]">
                      <span className="text-[#596d53] dark:text-[#97a992]">Classroom Feed:</span>
                      <span className="font-bold text-[#2e7421] dark:text-[#86efac]">1080p Stream Live</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#dae8d4] dark:border-[#273824] flex items-center justify-between text-[7.5px] text-[#63785d] dark:text-[#9cae97]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-[#387f28]" /> Synced with Studio
                  </span>
                  <span className="font-semibold">{liveAttendanceData.isLiveNow ? "Broadcasting" : "Recorded"}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {!isRosterView && <section id="analytics" aria-label="Assignments and classes overview" className="rounded-xl border border-[#e2e7dd] bg-white px-3 py-3 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">Assignments &amp; Classes Overview</h2>
            <span className="text-[7px] font-medium text-[#778171] dark:text-[#9ca797]">Current term</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-[#edf0e9] sm:grid-cols-3 xl:grid-cols-5 xl:divide-y-0 dark:divide-[#2a312a]">
            {overviewMetrics.map(({ label, value, icon: Icon, tone }) => (
              <article key={label} className="flex min-h-[70px] items-center justify-between gap-2 px-3 py-2 first:pl-1">
                <div className="min-w-0"><p className="truncate text-[8px] font-medium text-[#707c6c] dark:text-[#9aa592]">{label}</p><p className="mt-1 text-[19px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">{value}</p></div>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full ${tone}`}><Icon size={13} /></span>
              </article>
            ))}
          </div>
        </section>}

        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-3">
          {isRosterView && <section
            id="students"
            aria-label="Students roster"
            className="min-w-0 rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] lg:col-span-3 dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students Roster</h2>
                <p className="mt-0.5 text-[7px] text-[#74806f] dark:text-[#9ca797]">Get to know your students and make room for new learners.</p>
              </div>
              <button type="button" className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f1f4ed] px-2.5 text-[7px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                <Download size={10} /> Export roster
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="teacher-roster-class">Select class</label>
              <select
                id="teacher-roster-class"
                value={rosterClass}
                onChange={(event) => setRosterClass(event.target.value)}
                className="h-7 min-w-0 flex-1 rounded-md border border-[#e2e7dd] bg-[#f8f9f6] px-2 text-[7px] text-[#35402f] outline-none dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc] sm:max-w-[240px]"
              >
                <option>Python &amp; Web Development · Grade 11 · Class A</option>
                <option>Algebra I · Grade 9 · Class A</option>
                <option>Geometry · Grade 10 · Class B</option>
                <option>Precalculus · Grade 11 · Class C</option>
              </select>
              <span className="rounded-full bg-[#e5efdf] px-2 py-1 text-[6px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">28/100</span>
              <span className="flex-1" />
              <label className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
                <span className="sr-only">Search students</span>
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#83907d]" />
                <input
                  type="search"
                  value={rosterSearch}
                  onChange={(event) => setRosterSearch(event.target.value)}
                  placeholder="Search students..."
                  className="h-7 w-full rounded-full border border-[#e2e7dd] bg-white pl-6 pr-2 text-[7px] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#161b17] dark:text-[#e1e8dc]"
                />
              </label>
            </div>

            <div className="mt-3 rounded-xl bg-[#e7f0e2] px-3 py-2.5 text-[#43543a] dark:bg-[#202b1d] dark:text-[#c5d6b8]">
              <p className="text-[7px] font-bold">28 enrolled · 72 seats available</p>
              <p className="mt-0.5 text-[6px] leading-relaxed">Share class code ALG-9A-26 with your students. New learners will appear under Join Requests for your approval.</p>
            </div>

            <div className="mt-3 flex gap-1 border-b border-[#edf0e9] dark:border-[#2a312a]" role="tablist" aria-label="Roster status">
              {(["enrolled", "requests"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  id={tab === "requests" ? "approvals" : undefined}
                  role="tab"
                  aria-selected={rosterTab === tab}
                  onClick={() => setRosterTab(tab)}
                  className={`rounded-full px-2.5 py-1.5 text-[7px] font-semibold ${rosterTab === tab ? "bg-[#23351f] text-white" : "text-[#687564] hover:bg-[#f1f4ed] dark:text-[#a5b19f] dark:hover:bg-[#20271e]"}`}
                >
                  {tab === "enrolled" ? "Enrolled (28)" : `Join Requests (${approvals.length})`}
                </button>
              ))}
            </div>

            {rosterTab === "enrolled" ? (
              <>
                <div className="mt-2">
                  <h3 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">Enrolled students</h3>
                  <p className="mt-0.5 text-[6px] text-[#74806f] dark:text-[#9ca797]">{rosterClass}</p>
                </div>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-[7px]">
                    <thead className="bg-[#f1f4ed] text-[6px] font-semibold text-[#75806f] dark:bg-[#20271e] dark:text-[#b1bba9]">
                      <tr>
                        {["Student", "Email address", "Joined", "Attendance", "Status"].map((heading) => (
                          <th key={heading} className="px-2 py-2 first:rounded-l-md last:rounded-r-md">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]">
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[6px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index % 3]}`}>{student.name.split(" ").map((part) => part[0]).join("")}</span>
                              <span>
                                <span className="block font-semibold text-[#35402f] dark:text-[#e1e8dc]">{student.name}</span>
                                <span className="block text-[6px] text-[#84907e] dark:text-[#9ca797]">{student.id}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-[#52634b] dark:text-[#c5d6b8]">{student.email}</td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-[#52634b] dark:text-[#c5d6b8]">{student.joined}</td>
                          <td className="px-2 py-1.5 text-[#52634b] dark:text-[#c5d6b8]">{student.attendance}</td>
                          <td className="px-2 py-1.5"><span className="rounded-full bg-[#e5efdf] px-2 py-1 text-[6px] font-semibold text-[#45683b]">Enrolled</span></td>
                        </tr>
                      ))}
                      {!filteredStudents.length && (
                        <tr><td colSpan={5} className="py-6 text-center text-[7px] text-[#74806f]">No students match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[6px] text-[#74806f] dark:text-[#9ca797]">
                  <span>Showing {filteredStudents.length ? 1 : 0}–{filteredStudents.length} of 28 students</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="font-semibold text-[#405c35] dark:text-[#c5d6b8]">Prev</button>
                    <span className="grid size-4 place-items-center rounded-full bg-[#e5efdf] font-bold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">1</span>
                    <span>2</span><span>3</span><span>4</span>
                    <button type="button" className="rounded-full bg-[#f1f4ed] px-2 py-1 font-semibold text-[#405c35] dark:bg-[#20271e] dark:text-[#c5d6b8]">Next</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-2 space-y-1.5">
                {approvals.map((student, index) => (
                  <div key={student.name} className="flex items-center gap-2 rounded-lg bg-[#f6f7f3] p-2 dark:bg-[#20271e]">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[6px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index % 3]}`}>{student.name.split(" ").map((part) => part[0]).join("")}</span>
                    <div className="min-w-0 flex-1"><p className="text-[7px] font-semibold text-[#35402f] dark:text-[#e1e8dc]">{student.name}</p><p className="text-[6px] text-[#74806f] dark:text-[#9ca797]">{student.meta}</p></div>
                    <button type="button" onClick={() => dismissApproval(student.name)} className="inline-flex items-center gap-1 rounded-full bg-[#23351f] px-2.5 py-1 text-[6px] font-semibold text-white"><Check size={8} /> Approve</button>
                    <button type="button" onClick={() => dismissApproval(student.name)} aria-label={`Dismiss ${student.name}`} className="grid size-5 place-items-center rounded-full bg-white text-[#71806b] dark:bg-[#161b17]"><X size={9} /></button>
                  </div>
                ))}
                {!approvals.length && <p className="py-6 text-center text-[7px] text-[#74806f]">No join requests are waiting.</p>}
              </div>
            )}

            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <article className="rounded-xl border border-[#edf0e9] p-3 dark:border-[#2a312a]">
                <h3 className="text-[8px] font-bold text-[#243020] dark:text-[#ecf1ea]">Invite students</h3>
                <p className="mt-0.5 text-[6px] text-[#74806f] dark:text-[#9ca797]">One code, a connected classroom.</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <code className="text-[12px] font-bold tracking-wide text-[#253322] dark:text-[#e1e8dc]">ALG-9A-26</code>
                  <button type="button" onClick={copyInviteCode} className="inline-flex items-center gap-1 rounded-full bg-[#f1f4ed] px-2.5 py-1.5 text-[6px] font-semibold text-[#43543a] dark:bg-[#20271e] dark:text-[#c5d6b8]"><Copy size={9} /> Copy code</button>
                </div>
                <p role="status" className="mt-1 text-[6px] text-[#74806f] dark:text-[#9ca797]">{copyMessage || "Students can request to join from their Konnect account."}</p>
              </article>
              <article className="rounded-xl border border-[#edf0e9] p-3 dark:border-[#2a312a]">
                <h3 className="text-[8px] font-bold text-[#243020] dark:text-[#ecf1ea]">{approvals.length} join requests waiting</h3>
                <p className="mt-0.5 text-[6px] text-[#74806f] dark:text-[#9ca797]">{approvals.map((student) => student.name).join(", ") || "No requests are waiting."}</p>
                <button type="button" onClick={() => setRosterTab("requests")} className="mt-2 rounded-full bg-[#e5efdf] px-2.5 py-1.5 text-[6px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">Review requests</button>
              </article>
            </div>
          </section>}

          {!isRosterView && <section
            aria-label="Student performance"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="mb-2 flex items-center justify-between"><h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students Performance</h2><span className="rounded-full bg-[#f1f4ed] px-2 py-1 text-[7px] font-semibold text-[#52634b] dark:bg-[#20271e] dark:text-[#c5d6b8]">Attendance</span></div>
            <div className="space-y-2">
              {rosterStudents.slice(0, 3).map((student, index) => <div key={student.id} className="flex items-center gap-2">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[7px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index]}`}>{student.name.split(" ").map((part) => part[0]).join("")}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[8px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{student.name}</p><p className="text-[6px] text-[#7c8776] dark:text-[#9ca797]">{student.id}</p></div>
                <span className="text-[8px] font-bold text-[#273423] dark:text-[#d6dfd2]">{student.attendance}</span>
                <ThumbsUp size={10} className="text-[#e78648]" />
              </div>)}
            </div>
            <Link href="/teacher/student" className="mt-3 block text-right text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">View All Students <span aria-hidden="true">›</span></Link>
          </section>}

          {!isRosterView && <section
            id="approvals"
            aria-label="Students pending approval"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-bold text-[#243020] dark:text-[#ecf1ea]">Students Pending Approval</h2>
              <span className="rounded-full bg-[#fce9dc] px-2 py-1 text-[7px] font-semibold text-[#bc612a]">{approvals.length + liveRequests.length} waiting</span>
            </div>
            <div className="space-y-2">
              {liveRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-2 rounded-lg border border-[#cce3c6] bg-[#f2f8ef] p-2 dark:border-[#2f4928] dark:bg-[#182618]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#244b1c] text-[6px] font-bold text-white shadow-xs">
                    {req.learnerName.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[7.5px] font-bold text-[#253322] dark:text-[#e1e8dc]">{req.learnerName}</p>
                      <span className="rounded bg-[#28571e] px-1 py-0.2 text-[5.5px] font-bold uppercase text-white">Live Class</span>
                    </div>
                    <p className="truncate text-[6px] text-[#4f6746] dark:text-[#a0b59b]">{req.classTitle || "Live Room"} · {req.requestedAt}</p>
                  </div>
                  <button type="button" onClick={() => acceptLiveRequest(req)} aria-label={`Accept ${req.learnerName}`} className="rounded-full bg-[#23351f] px-2 py-1 text-[6px] font-semibold text-white hover:bg-[#324f2b]">Accept</button>
                  <button type="button" onClick={() => rejectLiveRequest(req)} aria-label={`Reject ${req.learnerName}`} className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[#b83535] hover:bg-[#fce9e6] dark:bg-[#161b17]"><X size={9} /></button>
                </div>
              ))}
              {approvals.slice(0, 3).map((student, index) => <div key={student.name} className="flex items-center gap-2 rounded-lg bg-[#f6f7f3] p-2 dark:bg-[#20271e]">
                <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[6px] font-bold text-white ${["bg-[#617b62]", "bg-[#9c7054]", "bg-[#586f89]"][index % 3]}`}>{student.name.split(" ").map((part) => part[0]).join("")}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[7px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{student.name}</p><p className="truncate text-[6px] text-[#7c8776] dark:text-[#9ca797]">{student.meta}</p></div>
                <button type="button" onClick={() => dismissApproval(student.name)} aria-label={`Approve ${student.name}`} className="rounded-full bg-[#23351f] px-2 py-1 text-[6px] font-semibold text-white">Approve</button>
                <button type="button" onClick={() => dismissApproval(student.name)} aria-label={`Dismiss ${student.name}`} className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[#71806b] dark:bg-[#161b17]"><X size={9} /></button>
              </div>)}
              {!approvals.length && !liveRequests.length && <p className="py-5 text-center text-[8px] text-[#7c8776]">No pending approvals.</p>}
            </div>
            <Link href="/teacher/student#approvals" className="mt-3 block text-right text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">View All Requests <span aria-hidden="true">›</span></Link>
          </section>}

          {!isRosterView && <section
            aria-label="My notes"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">
                My Notes <span className="ml-1 rounded-full bg-[#e5efdf] px-1.5 py-0.5 text-[6px] text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">{notes.length + 8}</span>
              </h2>
              <button
                type="button"
                onClick={() => setAddingNote((current) => !current)}
                className="rounded-full border border-[#e2e7dd] px-2 py-1 text-[6px] font-semibold text-[#43543a] hover:bg-[#f6f8f3] dark:border-[#303b2d] dark:text-[#c5d6b8]"
              >
                + Add Notes
              </button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <article key={note.title} className="rounded-lg bg-[#f6f7f3] p-2.5 dark:bg-[#20271e]">
                  <h3 className="text-[8px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{note.title}</h3>
                  <p className="mt-1 text-[7px] text-[#7c8776] dark:text-[#9ca797]">{note.text}</p>
                  <p className="mt-1 text-[6px] text-[#7c8776] dark:text-[#9ca797]">{note.date}</p>
                </article>
              ))}
            </div>
            <button type="button" className="mt-2 block w-full text-right text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">
              View All Notes <span aria-hidden="true">›</span>
            </button>
          </section>}
        </div>

        {!isRosterView && <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(235px,1fr)]">
          <section aria-label="My active classes">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[9px] font-bold text-[#253322] dark:text-[#e1e8dc]">
                My Active Classes <span className="ml-1 rounded-full bg-[#e5efdf] px-1.5 py-0.5 text-[6px] text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">3 / 3 Max Limit Reached</span>
              </h2>
              <p className="text-[6px] text-[#7c8776] dark:text-[#9ca797]">Teachers are limited to 3 active classes max</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activeClasses.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#e8ebe4] bg-white p-2.5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-[6px] font-semibold text-[#7c8776] dark:text-[#9ca797]">{item.subject}</p>
                    <span className="rounded-full bg-[#e5efdf] px-1.5 py-0.5 text-[6px] font-semibold text-[#405c35] dark:bg-[#263722] dark:text-[#c5d6b8]">Active</span>
                  </div>
                  <h3 className="mt-1 text-[8px] font-bold leading-tight text-[#253322] dark:text-[#e1e8dc]">{item.title}</h3>
                  <p className="mt-0.5 text-[6px] text-[#7c8776] dark:text-[#9ca797]">{item.group}</p>
                  <div className="mt-2 flex items-center gap-3 text-[6px] text-[#52634b] dark:text-[#c5d6b8]">
                    <span className="flex items-center gap-1"><Users size={9} />{item.students} Students</span>
                    <span className="flex items-center gap-1"><FileText size={9} />{item.tasks} Pending Tasks</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#edf0e9] pt-2 dark:border-[#2a312a]">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/teacher/live-classes/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-[#23351f] px-2 py-1 text-[6px] font-semibold text-white hover:bg-[#30472b] transition-colors"
                        title="Enter teacher studio"
                      >
                        <Video size={8} className="text-[#86efac]" /> Studio
                      </Link>
                      <button
                        type="button"
                        onClick={() => copyClassLink(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#dce3d7] bg-[#f8faf6] px-1.5 py-1 text-[6px] font-semibold text-[#405439] hover:bg-[#edf2ea] dark:border-[#2b3a28] dark:bg-[#1a2518] dark:text-[#c2d3bd] transition-colors"
                        title="Copy learner link"
                      >
                        {copiedSessionId === item.id ? <Check size={8} className="text-[#2c6e21]" /> : <Copy size={8} />}
                        {copiedSessionId === item.id ? "Copied" : "Link"}
                      </button>
                    </div>
                    <Link href="/teacher/classes" className="inline-flex items-center gap-1 text-[6px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">
                      Manage <ArrowRight size={7} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-label="My planner"
            className="rounded-2xl border border-[#e8ebe4] bg-white p-3 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[9px] font-bold text-[#243020] dark:text-[#ecf1ea]">My Planner</h2>
              <button type="button" className="flex items-center gap-1 rounded-full bg-[#f1f4ed] px-2 py-1 text-[6px] font-semibold text-[#52634b] dark:bg-[#20271e] dark:text-[#c5d6b8]">
                Dec 2026 <ChevronDown size={9} />
              </button>
            </div>
            <p className="mt-1 text-[6px] text-[#7c8776] dark:text-[#9ca797]">Dec 12, Thursday</p>
            <div className="mt-2 grid grid-cols-7 text-center text-[6px] text-[#7c8776] dark:text-[#9ca797]">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`${day}-${index}`} className="py-1">{day}</span>
              ))}
              {[8, 9, 10, 11, 12, 13, 14].map((day) => (
                <span key={day} className={`mx-auto grid size-5 place-items-center rounded-full ${day === 12 ? "bg-[#23351f] font-bold text-white" : "text-[#40503a] dark:text-[#c5d6b8]"}`}>{day}</span>
              ))}
            </div>
            <div className="mt-2 space-y-1.5">
              {plannerItems.map((item) => (
                <article key={item.title} className="flex items-center justify-between gap-2 rounded-xl bg-[#f6f7f3] p-2 dark:bg-[#20271e]">
                  <div className="min-w-0">
                    <h3 className="truncate text-[7px] font-semibold text-[#253322] dark:text-[#e1e8dc]">{item.title}</h3>
                    <p className="text-[6px] text-[#7c8776] dark:text-[#9ca797]">{item.className}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-1.5 py-1 text-[6px] font-semibold ${item.color}`}>{item.status}</span>
                </article>
              ))}
            </div>
            <Link href="/teacher/assignments" className="mt-2 inline-flex items-center gap-1 text-[7px] font-semibold text-[#405c35] hover:underline dark:text-[#c5d6b8]">
              <CalendarDays size={9} /> View assignments <ArrowRight size={8} />
            </Link>
          </section>
        </div>}
      </div>
    </DashboardShell>
  );
}
