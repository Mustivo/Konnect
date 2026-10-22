"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { apiJson, currentUser } from "@/lib/api";
import { cancelLiveJoinRequest, getLiveJoinRequests, getSession, joinSession, requestJoinSession } from "@/lib/api/sessions";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  LoaderCircle,
  Mic,
  MicOff,
  ShieldCheck,
  Video,
  VideoOff,
  X,
} from "lucide-react";

const fallbackSession = {
  id: "uiux",
  title: "Design systems & component libraries",
  course: "UI/UX Design — From Wireframes to Prototypes",
  teacher: "Mutiti Stivo",
  time: "Tue, 6 Oct 2026 · 14:00–15:30 BST",
};

type ApiSession = {
  title?: string;
  course_title?: string;
  teacher_name?: string;
  starts_at?: string;
  ends_at?: string;
  join_window_open?: boolean;
  video_provider_configured?: boolean;
  scheduled_start?: string;
  scheduled_end?: string;
  class_room?: string | { title?: string; subject?: string; teacher_name?: string };
};

type AdmissionMessage = {
  sessionId: string;
  requestId?: string;
  status: "admitted" | "denied";
};

function LiveClassWaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSessionId = searchParams.get("session") || "";
  const sessionId = rawSessionId.trim().toLowerCase();
  const [session, setSession] = useState({ ...fallbackSession, id: sessionId || fallbackSession.id });
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("konnect-user");
        if (cached) {
          const u = JSON.parse(cached);
          const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.username;
          if (full) return full;
        }
        const email = localStorage.getItem("konnect-user-email");
        if (email === "stevenmwizerwa1@gmail.com") return "Steven Mwizerwa";
        if (email) return email.split("@")[0];
      } catch {}
    }
    return "Learner";
  });
  const [userInitials, setUserInitials] = useState(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("konnect-user-email");
      if (email === "stevenmwizerwa1@gmail.com") return "SM";
      if (email) return email.slice(0, 2).toUpperCase();
    }
    return "LR";
  });
  const [mounted, setMounted] = useState(false);
  const [isTeacherLive, setIsTeacherLive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [microphoneId, setMicrophoneId] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [admissionState, setAdmissionState] = useState<"ready" | "waiting" | "admitted" | "denied">("ready");
  const [requestError, setRequestError] = useState("");
  const [waitingSeconds, setWaitingSeconds] = useState(0);

  const cleanSessionId = (session.id || sessionId || fallbackSession.id).toLowerCase().trim();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef("");
  const autoRequestHandledRef = useRef(false);
  const admissionStorageKey = `konnect-live-class-admission:${cleanSessionId}`;
  const requestStorageKey = `konnect-live-class-request:${cleanSessionId}`;
  useEffect(() => {
    let initialName = "Steven Mwizerwa";
    try {
      const cached = localStorage.getItem("konnect-user");
      if (cached) {
        const u = JSON.parse(cached);
        const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.username;
        if (full) initialName = full;
      }
    } catch {}
    setUserName(initialName);
    setUserInitials(initialName.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "SM");

    currentUser().then((u) => {
      const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.username || "Steven Mwizerwa";
      setUserName(full);
      const initials = full.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "SM";
      setUserInitials(initials);
      try {
        localStorage.setItem("konnect-user", JSON.stringify(u));
      } catch {}

      // Re-broadcast updated request if waiting
      if (requestIdRef.current) {
        const updatedPayload = {
          type: "join-request",
          sessionId: session.id,
          learnerId: requestIdRef.current,
          learnerName: full,
          requestId: requestIdRef.current,
          requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        try {
          window.localStorage.setItem(requestStorageKey, JSON.stringify(updatedPayload));
          if (typeof BroadcastChannel !== "undefined") {
            const channel = new BroadcastChannel("konnect-live-class-admission");
            channel.postMessage(updatedPayload);
            channel.close();
          }
        } catch {}
      }
    }).catch(() => undefined);
  }, [requestStorageKey, session.id]);

  useEffect(() => setMounted(true), []);

  // Restore waiting state from previous request if present
  useEffect(() => {
    try {
      const existingReq = window.localStorage.getItem(requestStorageKey);
      if (existingReq) {
        const parsed = JSON.parse(existingReq);
        if (parsed && parsed.sessionId === session.id && parsed.requestId) {
          requestIdRef.current = parsed.requestId;
          setAdmissionState("waiting");
        }
      }
    } catch {}
  }, [requestStorageKey, session.id]);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/learner/live_classes");
      return;
    }
    let active = true;
    setSession((current) => ({ ...current, id: sessionId }));
    async function loadSession() {
      try {
        const detail = await apiJson<ApiSession>(await getSession(sessionId));
        const classRoom = typeof detail.class_room === "object" ? detail.class_room : null;
        const start = detail.starts_at ? new Date(detail.starts_at) : null;
        const end = detail.ends_at ? new Date(detail.ends_at) : null;
        if (!active) return;
        setSession({
          id: sessionId,
          title: detail.title || detail.course_title || fallbackSession.title,
          course: detail.course_title || classRoom?.title || classRoom?.subject || fallbackSession.course,
          teacher: detail.teacher_name || classRoom?.teacher_name || fallbackSession.teacher,
          time: start && Number.isFinite(start.getTime())
            ? `${start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${end ? `–${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`
            : fallbackSession.time,
        });
      } catch {
        if (active) setRequestError("Session details could not be loaded. You can still try to join.");
      }
    }
    void loadSession();
    return () => { active = false; };
  }, [router, sessionId]);

  // Monitor teacher live presence
  useEffect(() => {
    async function checkLive() {
      try {
        const stored = window.localStorage.getItem("konnect-active-live-session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.sessionId === sessionId || parsed.status === "LIVE")) {
            if (!parsed.lastHeartbeat || Date.now() - parsed.lastHeartbeat < 45000) {
              setIsTeacherLive(true);
              return;
            }
          }
        }
      } catch {}
      try {
        const response = await getSession(sessionId);
        const detail = await apiJson<ApiSession & { status?: string }>(response);
        setIsTeacherLive(Boolean(detail.join_window_open));
      } catch {
        setIsTeacherLive(false);
      }
    }
    checkLive();

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("konnect-live-classes");
        channel.onmessage = (event) => {
          if (event.data?.type === "session-started") {
            setIsTeacherLive(true);
          } else if (event.data?.type === "session-ended") {
            setIsTeacherLive(false);
          }
        };
        channel.postMessage({ type: "is-teacher-live-query" });
      } catch {}
    }

    const interval = setInterval(() => { void checkLive(); }, 2500);
    return () => {
      clearInterval(interval);
      channel?.close();
    };
  }, [sessionId]);

  // Handle autoRequest parameter from live_classes page
  useEffect(() => {
    if (!mounted) return;
    const autoReq = searchParams.get("autoRequest") === "1" || searchParams.get("request") === "1";
    if (autoReq && admissionState === "ready" && !autoRequestHandledRef.current) {
      autoRequestHandledRef.current = true;
      void sendJoinRequest();
    }
  }, [mounted, searchParams, admissionState]);

  // Waiting elapsed timer ticker
  useEffect(() => {
    if (admissionState !== "waiting") {
      setWaitingSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setWaitingSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [admissionState]);

  // Periodic heartbeat broadcast while waiting so teacher studio always picks up waiting request
  useEffect(() => {
    if (admissionState !== "waiting" || !cleanSessionId) return;
    const interval = setInterval(() => {
      try {
        const payload = {
          type: "join-request",
          sessionId: cleanSessionId,
          learnerId: requestIdRef.current,
          learnerName: userName,
          requestId: requestIdRef.current,
          requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          heartbeat: Date.now(),
        };
        window.localStorage.setItem(requestStorageKey, JSON.stringify(payload));
        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("konnect-live-class-admission");
          channel.postMessage(payload);
          channel.close();
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [admissionState, cleanSessionId, requestStorageKey, userName]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel("konnect-live-class-admission");

    function applyAdmission(message: AdmissionMessage & { learnerId?: string }) {
      const msgSessionId = String(message.sessionId || "").toLowerCase().trim();
      if (msgSessionId && msgSessionId !== cleanSessionId && msgSessionId !== String(session.id || "").toLowerCase().trim()) return;

      if (message.status === "denied") {
        setAdmissionState("denied");
        setRequestError("The instructor declined the join request for this session.");
        return;
      }

      if (message.status === "admitted") {
        setAdmissionState("admitted");
        setRequestError("");

        try {
          sessionStorage.setItem(`konnect-live-class-admitted:${cleanSessionId}`, "true");
          sessionStorage.setItem(`konnect-live-class-admitted:${session.id}`, "true");
          localStorage.setItem(`konnect-live-class-admitted:${cleanSessionId}`, "true");
          localStorage.setItem(`konnect-live-class-admitted:${session.id}`, "true");
          localStorage.setItem(`konnect-live-class-connected:${cleanSessionId}`, JSON.stringify({
            learnerId: requestIdRef.current || "learner",
            name: userName,
            connectedAt: new Date().toISOString(),
          }));
          localStorage.removeItem(requestStorageKey);
        } catch {}

        // Enter classroom swiftly
        const timer = setTimeout(() => {
          streamRef.current?.getTracks().forEach((track) => track.stop());
          router.push(`/learner/live_classes/liveClass?session=${encodeURIComponent(cleanSessionId)}`);
        }, 700);
        return () => clearTimeout(timer);
      }
    }

    if (channel) {
      channel.onmessage = (event: MessageEvent<AdmissionMessage & { learnerId?: string }>) => applyAdmission(event.data);
    }

    function handleStorage(event: StorageEvent) {
      if (!event.key) return;
      if (event.key === `konnect-live-class-admitted:${cleanSessionId}` && event.newValue === "true") {
        applyAdmission({ sessionId: cleanSessionId, status: "admitted" });
        return;
      }
      if (event.key !== admissionStorageKey || !event.newValue) return;
      try {
        applyAdmission(JSON.parse(event.newValue) as AdmissionMessage & { learnerId?: string });
      } catch {
        setRequestError("We couldn't confirm your admission. Please request to join again.");
      }
    }

    window.addEventListener("storage", handleStorage);

    // Initial check: if already admitted in local/sessionStorage, enter immediately
    const isAlreadyAdmitted =
      localStorage.getItem(`konnect-live-class-admitted:${cleanSessionId}`) === "true" ||
      localStorage.getItem(`konnect-live-class-admitted:${session.id}`) === "true" ||
      sessionStorage.getItem(`konnect-live-class-admitted:${cleanSessionId}`) === "true" ||
      sessionStorage.getItem(`konnect-live-class-admitted:${session.id}`) === "true";

    if (isAlreadyAdmitted) {
      applyAdmission({ sessionId: cleanSessionId, status: "admitted" });
    }

    try {
      const cachedAdmission = localStorage.getItem(admissionStorageKey);
      if (cachedAdmission) applyAdmission(JSON.parse(cachedAdmission));
    } catch {}

    const pollAdmission = setInterval(async () => {
      try {
        if (
          localStorage.getItem(`konnect-live-class-admitted:${cleanSessionId}`) === "true" ||
          localStorage.getItem(`konnect-live-class-admitted:${session.id}`) === "true"
        ) {
          applyAdmission({ sessionId: cleanSessionId, status: "admitted" });
          return;
        }
        const raw = localStorage.getItem(admissionStorageKey) || localStorage.getItem(`konnect-live-class-admission:${session.id}`);
        if (raw) applyAdmission(JSON.parse(raw));
      } catch {}

      // Also check API status if requestId is present
      if (requestIdRef.current && cleanSessionId) {
        try {
          const res = await getLiveJoinRequests(cleanSessionId);
          const data = await apiJson<{ results?: Array<{ id: string; learner_id: string | number; status: "waiting" | "admitted" | "denied" }> }>(res);
          const reqs = data?.results || [];
          const myReq = reqs.find((r) => r.id === requestIdRef.current || String(r.learner_id) === String(requestIdRef.current));
          if (myReq && (myReq.status === "admitted" || myReq.status === "denied")) {
            applyAdmission({
              sessionId: cleanSessionId,
              requestId: requestIdRef.current,
              learnerId: requestIdRef.current,
              status: myReq.status,
            });
          }
        } catch {}
      }
    }, 1000);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(pollAdmission);
    };
  }, [admissionStorageKey, cleanSessionId, requestStorageKey, router, session.id, userName]);

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const nextCameras = devices.filter((device) => device.kind === "videoinput");
    const nextMicrophones = devices.filter((device) => device.kind === "audioinput");
    setCameras(nextCameras);
    setMicrophones(nextMicrophones);
    setCameraId((current) => current || nextCameras[0]?.deviceId || "");
    setMicrophoneId((current) => current || nextMicrophones[0]?.deviceId || "");
  }

  async function enableDevice(kind: "camera" | "microphone", deviceId?: string) {
    setMediaError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Camera and microphone access is not available in this browser.");
      return;
    }

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia(kind === "camera"
        ? { video: deviceId ? { deviceId: { exact: deviceId } } : true, audio: false }
        : { video: false, audio: deviceId ? { deviceId: { exact: deviceId } } : true });
      const existingStream = streamRef.current ?? new MediaStream();
      const nextTracks = nextStream.getTracks();
      for (const track of existingStream.getTracks()) {
        if (track.kind === (kind === "camera" ? "video" : "audio")) {
          existingStream.removeTrack(track);
          track.stop();
        }
      }
      nextTracks.forEach((track) => existingStream.addTrack(track));
      streamRef.current = existingStream;
      setStream(existingStream);
      if (kind === "camera") setCameraOn(true);
      else setMicrophoneOn(true);
      await refreshDevices();
    } catch {
      setMediaError(`Couldn't access your ${kind}. Check browser permissions and try again.`);
    }
  }

  function toggleDevice(kind: "camera" | "microphone") {
    const enabled = kind === "camera" ? cameraOn : microphoneOn;
    const trackKind = kind === "camera" ? "video" : "audio";
    const track = streamRef.current?.getTracks().find((item) => item.kind === trackKind);

    if (!enabled || !track) {
      void enableDevice(kind, kind === "camera" ? cameraId : microphoneId);
      return;
    }

    track.enabled = false;
    if (kind === "camera") setCameraOn(false);
    else setMicrophoneOn(false);
  }

  async function sendJoinRequest() {
    if (admissionState === "waiting" || admissionState === "admitted") return;

    const requestId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;
    requestIdRef.current = requestId;
    setRequestError("");
    setAdmissionState("waiting");

    let effectiveName = userName;
    if (effectiveName === "Learner") {
      try {
        const cached = localStorage.getItem("konnect-user");
        if (cached) {
          const u = JSON.parse(cached);
          const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.username;
          if (full) effectiveName = full;
        }
      } catch {}
    }

    const joinPayload = {
      type: "join-request",
      sessionId: cleanSessionId,
      classTitle: session.title || session.course || "Live Class",
      teacherName: session.teacher || "Mutiti Stivo",
      learnerId: requestId,
      learnerName: effectiveName,
      requestId,
      requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
    };

    try {
      window.localStorage.setItem(requestStorageKey, JSON.stringify(joinPayload));
      window.localStorage.setItem(`konnect-live-class-request:${session.id}`, JSON.stringify(joinPayload));

      // Maintain shared pending live requests list for teacher dashboard across all classes
      const rawAll = window.localStorage.getItem("konnect-all-live-requests");
      const parsedAll = rawAll ? JSON.parse(rawAll) : [];
      const filtered = Array.isArray(parsedAll)
        ? parsedAll.filter((r: { requestId?: string; learnerId?: string }) => r.requestId !== requestId && r.learnerId !== requestId)
        : [];
      filtered.unshift(joinPayload);
      window.localStorage.setItem("konnect-all-live-requests", JSON.stringify(filtered));

      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("konnect-live-class-admission");
        channel.postMessage(joinPayload);
        channel.close();
      }
    } catch {}

    // Persist on the server so the host can see and respond from another device.
    try {
      await requestJoinSession(cleanSessionId, {
        requestId,
        id: requestId,
        learner_id: requestId,
        learner_name: effectiveName,
        class_title: session.title || session.course || "Live Class",
        teacher_name: session.teacher || "Mutiti Stivo",
        requested_at: new Date().toISOString(),
      });
    } catch {
      setAdmissionState("ready");
      requestIdRef.current = "";
      setRequestError("Your request could not reach the live class host. Check your connection and try again.");
      try { localStorage.removeItem(requestStorageKey); } catch {}
    }
  }

  function cancelJoinRequest() {
    const requestId = requestIdRef.current;
    try {
      localStorage.removeItem(requestStorageKey);
      localStorage.removeItem(admissionStorageKey);
      const rawRequests = localStorage.getItem("konnect-all-live-requests");
      if (rawRequests) {
        const requests = JSON.parse(rawRequests);
        if (Array.isArray(requests)) {
          localStorage.setItem("konnect-all-live-requests", JSON.stringify(requests.filter((request: { requestId?: string; learnerId?: string; id?: string }) =>
            request.requestId !== requestId && request.learnerId !== requestId && request.id !== requestId
          )));
        }
      }
    } catch {}
    requestIdRef.current = "";
    setAdmissionState("ready");
    setRequestError("");
    if (requestId) void cancelLiveJoinRequest(cleanSessionId, requestId).catch(() => undefined);
    router.replace("/learner/live_classes");
  }

  function enterClass() {
    try {
      sessionStorage.setItem(`konnect-live-class-admitted:${session.id}`, "true");
      localStorage.setItem(`konnect-live-class-connected:${session.id}`, JSON.stringify({
        learnerId: requestIdRef.current || "learner",
        name: userName,
        connectedAt: new Date().toISOString(),
      }));
    } catch {}
    streamRef.current?.getTracks().forEach((track) => track.stop());
    router.push(`/learner/live_classes/liveClass?session=${encodeURIComponent(session.id)}`);
  }

  const lobby = (
    <main className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#f5f6f1] text-[#22291f] dark:bg-[#111510] dark:text-[#edf1e9]">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e2e6dd] bg-white px-4 dark:border-[#293127] dark:bg-[#171d16] sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => router.push("/learner/live_classes")} aria-label="Back to live classes" className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#59684f] hover:bg-[#f0f3ec] dark:text-[#c2ccb9] dark:hover:bg-[#252c22]"><ArrowLeft size={15} /></button>
          <Image src="/konnect-wordmark.png" alt="Konnect" width={90} height={38} className="h-[28px] w-[76px] shrink-0 object-contain object-left" priority />
          <span className="h-7 w-px shrink-0 bg-[#e8ece3] dark:bg-[#303b2d]" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold">{session.title}</p>
            <p className="truncate text-[8px] text-[#788172] dark:text-[#a0aa99]">{session.course}</p>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#eaf0e3] px-2.5 py-1 text-[8px] font-semibold text-[#526744] dark:bg-[#293823] dark:text-[#c2d2b5] sm:inline-flex"><ShieldCheck size={11} /> Secure class</span>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 items-center gap-6 px-4 py-6 sm:px-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.8fr)] lg:gap-10 lg:px-10">
        <section className="min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-[#1c281c] shadow-[0_12px_32px_rgba(24,34,22,0.12)]">
            {cameraOn && stream ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#263426] text-[#e1e8dc]">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#496342] text-2xl font-semibold">{userInitials}</span>
                <span className="text-[11px] font-medium">Camera is off</span>
              </div>
            )}
            <div className="absolute left-3 top-3 rounded-md bg-black/45 px-2.5 py-1.5 text-[9px] font-medium text-white">{userName}</div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              <button type="button" aria-label={microphoneOn ? "Turn microphone off" : "Turn microphone on"} aria-pressed={microphoneOn} onClick={() => toggleDevice("microphone")} className={`grid h-10 w-10 place-items-center rounded-full shadow ${microphoneOn ? "bg-white text-[#263d21]" : "bg-[#a7463a] text-white"}`}>{microphoneOn ? <Mic size={16} /> : <MicOff size={16} />}</button>
              <button type="button" aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} aria-pressed={cameraOn} onClick={() => toggleDevice("camera")} className={`grid h-10 w-10 place-items-center rounded-full shadow ${cameraOn ? "bg-white text-[#263d21]" : "bg-[#a7463a] text-white"}`}>{cameraOn ? <Video size={16} /> : <VideoOff size={16} />}</button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="relative flex h-9 min-w-0 items-center gap-2 rounded-full border border-[#dfe5da] bg-white px-3 text-[8px] text-[#56634e] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]">
              <Mic size={13} className="shrink-0" />
              <span className="sr-only">Microphone device</span>
              <select aria-label="Microphone device" value={microphoneId} onChange={(event) => { setMicrophoneId(event.target.value); if (microphoneOn) void enableDevice("microphone", event.target.value); }} className="min-w-0 flex-1 appearance-none bg-transparent pr-4 outline-none">
                {microphones.length ? microphones.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>) : <option value="">Default microphone</option>}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-3" />
            </label>
            <label className="relative flex h-9 min-w-0 items-center gap-2 rounded-full border border-[#dfe5da] bg-white px-3 text-[8px] text-[#56634e] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]">
              <Video size={13} className="shrink-0" />
              <span className="sr-only">Camera device</span>
              <select aria-label="Camera device" value={cameraId} onChange={(event) => { setCameraId(event.target.value); if (cameraOn) void enableDevice("camera", event.target.value); }} className="min-w-0 flex-1 appearance-none bg-transparent pr-4 outline-none">
                {cameras.length ? cameras.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>) : <option value="">Default camera</option>}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-3" />
            </label>
          </div>
          {mediaError && <p role="status" className="mt-2 text-[9px] text-[#a7463a] dark:text-[#f09a8e]">{mediaError}</p>}
          <p className="mt-2 text-[8px] text-[#788172] dark:text-[#a0aa99]">Your microphone and camera stay off until you turn them on.</p>
        </section>

        <aside className="mx-auto w-full max-w-[440px] rounded-xl border border-[#e0e5dd] bg-white p-5 dark:border-[#2a312a] dark:bg-[#161b17] sm:p-6">
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#536447] dark:text-[#b9caa9]">
            <span className={`h-2 w-2 rounded-full ${admissionState === "admitted" ? "bg-[#5f9348]" : admissionState === "waiting" ? "animate-pulse bg-[#d19a35]" : "bg-[#809276]"}`} />
            {admissionState === "waiting" ? "Request sent" : admissionState === "admitted" ? "You are admitted" : admissionState === "denied" ? "Request declined" : "Live class"}
          </div>

          {admissionState === "waiting" ? (
            <>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6f0e3] text-[#9b7430] dark:bg-[#2b2416] dark:text-[#f0c56e]">
                  <LoaderCircle size={20} className="animate-spin" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-[#f5ede0] px-2 py-0.5 text-[8.5px] font-bold text-[#8a5d1a] dark:bg-[#342713] dark:text-[#f4cb76]">
                    Request Sent · Waiting for Approval
                  </span>
                  <p className="mt-0.5 text-[8.5px] font-mono text-[#788172] dark:text-[#a0aa99]">
                    Waiting time: {String(Math.floor(waitingSeconds / 60)).padStart(2, "0")}:{String(waitingSeconds % 60).padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Live Lobby Request
                </span>
                <span className="text-[10px] font-bold text-[#55694f] dark:text-[#a5b89f]">
                  Learner Waiting to Join Class
                </span>
              </div>

              <h1 className="mt-3 text-[22px] font-semibold leading-tight text-[#1b2318] dark:text-[#edf2ea]">
                Waiting for Teacher Approval
              </h1>
              <p className="mt-2 text-[12px] leading-relaxed text-[#737c70] dark:text-[#a0aa99]">
                {session.teacher || "Your instructor"} has received your request and will admit you into the live class when ready.
              </p>

              {isTeacherLive ? (
                <div className="mt-5 rounded-lg border border-[#c6dfbc] bg-[#eff8ec] p-3 dark:border-[#304d27] dark:bg-[#182816]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#1f3b17] dark:text-[#edf2ea]">{session.teacher}</p>
                    <span className="flex items-center gap-1.5 text-[8px] font-bold text-[#27641d] dark:text-[#aee09f]">
                      <span className="h-2 w-2 rounded-full bg-[#27641d] animate-pulse" />
                      Teacher is on live now
                    </span>
                  </div>
                  <p className="mt-1 text-[9px] text-[#4f6b45] dark:text-[#a0aa99]">{session.title}</p>
                  <p className="mt-1.5 text-[8px] font-medium text-[#2d5722] dark:text-[#b0d9a6]">
                    ✓ Request sent directly to teacher&apos;s live studio. As soon as the teacher approves, you will enter the classroom automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-[#e8d7b7] bg-[#fbf7ee] p-3.5 dark:border-[#423118] dark:bg-[#20180d]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#232c20] dark:text-[#edf2ea]">{session.teacher || "Mutiti Stivo"}</p>
                    <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-[#9e6d1a] dark:text-[#f3c36c]">
                      <span className="h-2 w-2 rounded-full bg-[#c79124] animate-ping" />
                      Waiting for Teacher to Admit You
                    </span>
                  </div>
                  <p className="mt-1 text-[9.5px] font-semibold text-[#665126] dark:text-[#ebd8b7]">{session.title}</p>
                  <p className="mt-2 text-[8.5px] leading-relaxed text-[#735824] dark:text-[#d3bc91]">
                    Your join request has been sent to your teacher&apos;s dashboard. Your teacher is not currently in the live room yet. Please stay on this screen — when your teacher receives and accepts your request, you will automatically enter the live class!
                  </p>
                </div>
              )}

              {requestError && <p role="status" className="mt-3 text-[9px] text-[#a7463a]">{requestError}</p>}
              <button
                type="button"
                onClick={cancelJoinRequest}
                className="mt-5 h-10 w-full rounded-md border border-[#dfe5da] text-[10px] font-semibold text-[#536447] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:text-[#c2ccb9] dark:hover:bg-[#20271e]"
              >
                Cancel request
              </button>
            </>
          ) : admissionState === "admitted" ? (
            <>
              <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7ec] text-[#346827] dark:bg-[#202f1d] dark:text-[#aee09f]">
                <Check size={22} className="stroke-[3]" />
              </div>
              <h1 className="mt-4 text-[22px] font-semibold leading-tight text-[#222d1f] dark:text-[#edf2ea]">
                You are admitted!
              </h1>
              <p className="mt-2 text-[12px] leading-relaxed text-[#737c70] dark:text-[#a0aa99]">
                {session.teacher} accepted your request. Entering classroom now…
              </p>
              <button
                type="button"
                onClick={enterClass}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#263d21] text-[11px] font-semibold text-white shadow hover:bg-[#1c3019]"
              >
                <Video size={14} /> Enter classroom now
              </button>
            </>
          ) : admissionState === "denied" ? (
            <>
              <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#fce9e6] text-[#b83535] dark:bg-[#341818] dark:text-[#f89c9c]">
                <X size={22} className="stroke-[3]" />
              </div>
              <span className="mt-2 inline-block rounded-full bg-[#fce9e6] px-2.5 py-0.5 text-[8.5px] font-bold text-[#b83535] dark:bg-[#341818] dark:text-[#f89c9c]">
                Request Declined
              </span>
              <h1 className="mt-3 text-[20px] font-bold leading-tight text-[#222d1f] dark:text-[#edf2ea]">
                Join Request Declined
              </h1>
              <p className="mt-2 text-[11px] leading-relaxed text-[#737c70] dark:text-[#a0aa99]">
                Your teacher ({session.teacher || "Instructor"}) declined your request to join this session at this time.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={sendJoinRequest}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#263d21] text-[10px] font-semibold text-white shadow hover:bg-[#1c3019]"
                >
                  <Video size={13} /> Ask to join again
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/learner/live_classes")}
                  className="h-10 w-full rounded-full border border-[#dfe5da] text-[10px] font-semibold text-[#536447] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:text-[#c2ccb9] dark:hover:bg-[#20271e]"
                >
                  Return to Live Classes
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-[24px] font-medium leading-tight">Ready to join?</h1>
              <p className="mt-2 text-[12px] text-[#737c70] dark:text-[#a0aa99]">Check your audio and video before asking to enter.</p>
              <div className="mt-5 rounded-lg bg-[#f3f5ef] p-3 dark:bg-[#20271e]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dce8d2] text-[10px] font-semibold text-[#435a37]">AO</span>
                    <div className="min-w-0"><p className="text-[10px] font-semibold">{session.teacher}</p><p className="mt-0.5 text-[8px] text-[#788172] dark:text-[#a0aa99]">Class host</p></div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[8px] font-medium text-[#617253] dark:bg-[#171d16] dark:text-[#c2ccb9]">{session.time}</span>
                </div>
                <p className="mt-3 border-t border-[#e3e8df] pt-2.5 text-[10px] font-semibold dark:border-[#303b2d]">{session.title}</p>
              </div>
              <p className="mt-4 flex items-start gap-2 text-[9px] leading-relaxed text-[#788172] dark:text-[#a0aa99]"><Check size={12} className="mt-0.5 shrink-0 text-[#62834d]" />Your camera and microphone are under your control. The class host must admit you before you can enter.</p>
              {requestError && <p role="status" className="mt-3 text-[9px] text-[#a7463a]">{requestError}</p>}
              <button type="button" onClick={sendJoinRequest} className="mt-5 h-11 w-full rounded-full bg-[#263d21] text-[11px] font-semibold text-white hover:bg-[#1c3019]">Ask to join</button>
            </>
          )}
        </aside>
      </div>
    </main>
  );

  return mounted ? createPortal(lobby, document.body) : null;
}

export default function LiveClassWaitingRoomPage() {
  return (
    <Suspense fallback={null}>
      <LiveClassWaitingRoomContent />
    </Suspense>
  );
}
