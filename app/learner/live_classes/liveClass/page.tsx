"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { getSession, joinSession, leaveSession, heartbeatSession } from "@/lib/api/sessions";
import { currentUser } from "@/lib/api/auth";
import { useSessionChat } from "@/lib/useSessionChat";
import { useVisionProctor } from "@/lib/vision/useVisionProctor";
import LearnerEngagementBadge from "@/components/vision/LearnerEngagementBadge";
import { useAttendance } from "@/lib/hooks/useAttendance";
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  Hand,
  Maximize,
  Minimize,
  MessageCircle,
  Mic,
  MicOff,
  Moon,
  MonitorUp,
  MoreHorizontal,
  Send,
  Settings,
  Smile,
  Sun,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";

const reactionEmojis = ["👍", "👏", "💖", "🎉", "💡", "🤔", "✋"];

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function LiveClassRoomPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const { messages, chatError, sending, send } = useSessionChat(sessionId);
  useAttendance(sessionId);

  const [sessionDetails, setSessionDetails] = useState<{
    title: string;
    courseTitle: string;
    teacherName: string;
    agenda: string;
  }>({
    title: "Live Class Session",
    courseTitle: "Classroom Studio",
    teacherName: "Mutiti Stivo",
    agenda: "A structured 1-on-1 session connecting lecture, interactive Q&A, and practical exercises.",
  });

  const [currentUserName, setCurrentUserName] = useState("Learner");
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [teacherSharingScreen, setTeacherSharingScreen] = useState(false);
  const [fullscreenOn, setFullscreenOn] = useState(false);
  const [draft, setDraft] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [admissionVerified, setAdmissionVerified] = useState(false);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
  const [remoteScreenFrame, setRemoteScreenFrame] = useState<string | null>(null);
  const [teacherCameraFrame, setTeacherCameraFrame] = useState<string | null>(null);
  const [aliveSeconds, setAliveSeconds] = useState(0);

  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const teacherLiveScreenRef = useRef<HTMLVideoElement>(null);
  const learnerPcRef = useRef<RTCPeerConnection | null>(null);
  const learnerIdRef = useRef<string>("learner-" + Math.random().toString(36).slice(2, 9));
  const reactionTimeoutRef = useRef<number | null>(null);
  const mediaStreamsRef = useRef<{ camera: MediaStream | null; microphone: MediaStream | null }>({
    camera: null,
    microphone: null,
  });

  const learnerVision = useVisionProctor({
    videoRef: cameraPreviewRef,
    isActive: cameraOn,
    mode: "classroom",
    intervalMs: 2400,
  });

  // Verify admission & load session + user info
  useEffect(() => {
    const activeSessionId = new URLSearchParams(window.location.search).get("session") || "algebra";
    setSessionId(activeSessionId);

    const cleanSession = activeSessionId.toLowerCase().trim();
    let isAdmitted =
      sessionStorage.getItem(`konnect-live-class-admitted:${activeSessionId}`) === "true" ||
      sessionStorage.getItem(`konnect-live-class-admitted:${cleanSession}`) === "true" ||
      localStorage.getItem(`konnect-live-class-admitted:${activeSessionId}`) === "true" ||
      localStorage.getItem(`konnect-live-class-admitted:${cleanSession}`) === "true";

    // If teacher is currently live in studio right now, grant admission to attend
    if (!isAdmitted) {
      try {
        const liveRaw = localStorage.getItem("konnect-active-live-session");
        if (liveRaw) {
          const parsed = JSON.parse(liveRaw);
          if (
            parsed &&
            (parsed.sessionId === activeSessionId ||
             parsed.sessionId === cleanSession ||
             parsed.classId === activeSessionId ||
             parsed.classId === cleanSession)
          ) {
            isAdmitted = true;
          }
        }
      } catch {}
    }

    if (!isAdmitted) {
      router.replace(`/learner/live_classes/waiting-room?session=${encodeURIComponent(activeSessionId)}`);
      return;
    }

    sessionStorage.setItem(`konnect-live-class-admitted:${activeSessionId}`, "true");
    sessionStorage.setItem(`konnect-live-class-admitted:${cleanSession}`, "true");
    localStorage.setItem(`konnect-live-class-admitted:${activeSessionId}`, "true");
    localStorage.setItem(`konnect-live-class-admitted:${cleanSession}`, "true");

    setMounted(true);
    setAdmissionVerified(true);
    setDarkMode(window.localStorage.getItem("konnect-theme") === "dark");

    try {
      const connected = localStorage.getItem(`konnect-live-class-connected:${activeSessionId}`);
      if (connected) {
        const parsed = JSON.parse(connected);
        if (parsed?.learnerId) learnerIdRef.current = String(parsed.learnerId);
      }
    } catch {}

    let initialName = "Steven Mwizerwa";
    try {
      const cached = localStorage.getItem("konnect-user");
      if (cached) {
        const u = JSON.parse(cached);
        const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.username;
        if (full) initialName = full;
      }
    } catch {}
    setCurrentUserName(initialName);

    currentUser()
      .then((u) => {
        const full = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.username || "Steven Mwizerwa";
        setCurrentUserName(full);
      })
      .catch(() => undefined);

    void getSession(activeSessionId)
      .then((res) => apiJson<Record<string, unknown>>(res))
      .then((data) => {
        if (!data) return;
        const classRoom = typeof data.class_room === "object" && data.class_room ? (data.class_room as Record<string, unknown>) : null;
        setSessionDetails({
          title: String(data.title || "Live Class Session"),
          courseTitle: String(data.course_title || classRoom?.title || classRoom?.subject || "Course"),
          teacherName: String(data.teacher_name || classRoom?.teacher_name || "Mutiti Stivo"),
          agenda: String(data.agenda || "Live interactive teaching session."),
        });
      })
      .catch(() => undefined);
  }, [router]);

  // Real-time attendance duration & keep-alive tracking
  useEffect(() => {
    if (!sessionId || !admissionVerified) return;

    // Record join in database
    void joinSession(sessionId, {
      student_id: learnerIdRef.current,
      student_name: currentUserName,
    }).catch(() => undefined);

    // Notify teacher studio via BroadcastChannel and localStorage that learner joined
    const cleanSession = sessionId.toLowerCase().trim();
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel("konnect-live-class-admission");
        ch.postMessage({
          type: "learner-joined",
          sessionId: cleanSession,
          learnerId: learnerIdRef.current,
          learnerName: currentUserName,
        });
        ch.close();
      }
      localStorage.setItem(`konnect-live-class-connected:${cleanSession}`, JSON.stringify({
        learnerId: learnerIdRef.current,
        name: currentUserName,
        connectedAt: new Date().toISOString(),
      }));
    } catch {}

    const ticker = setInterval(() => {
      setAliveSeconds((sec) => sec + 1);
    }, 1000);

    // Heartbeat every 25s so server knows learner is actively alive
    const heartbeat = setInterval(() => {
      void heartbeatSession(sessionId, {
        student_id: learnerIdRef.current,
      }).catch(() => undefined);
    }, 25000);

    // On tab close or navigation, cleanly record leave time and attendance duration
    function handleUnload() {
      try {
        const payload = JSON.stringify({ student_id: learnerIdRef.current });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(`/api/sessions/${encodeURIComponent(sessionId)}/leave/`, payload);
        } else {
          fetch(`/api/sessions/${encodeURIComponent(sessionId)}/leave/`, {
            method: "POST",
            body: payload,
            keepalive: true,
          }).catch(() => undefined);
        }
      } catch {}
    }

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(ticker);
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [admissionVerified, currentUserName, sessionId]);

  // Synchronize teacher screen sharing detection and WebRTC / Frame streaming
  useEffect(() => {
    if (!sessionId) return;

    function checkScreenShare() {
      try {
        const stored = window.localStorage.getItem(`konnect-live-screen-share:${sessionId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.sharing) {
            setTeacherSharingScreen(true);
            return;
          }
        }
      } catch {}
      setTeacherSharingScreen(false);
    }

    checkScreenShare();

    let channel: BroadcastChannel | null = null;
    let streamChannel: BroadcastChannel | null = null;
    let framesChannel: BroadcastChannel | null = null;

    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("konnect-live-screen-share");
        streamChannel = new BroadcastChannel("konnect-live-webrtc-stream");
        framesChannel = new BroadcastChannel("konnect-live-screen-frames");

        channel.onmessage = (event) => {
          if (event.data?.sessionId === sessionId) {
            const isSharing = Boolean(event.data.sharing);
            setTeacherSharingScreen(isSharing);
            if (isSharing) {
              streamChannel?.postMessage({
                type: "request-stream",
                sessionId,
                learnerId: learnerIdRef.current,
              });
            } else {
              setRemoteScreenStream(null);
              setRemoteScreenFrame(null);
            }
          }
        };

        streamChannel.onmessage = async (event) => {
          const data = event.data;
          if (!data || data.sessionId !== sessionId) return;

          if (data.type === "stream-available") {
            setTeacherSharingScreen(true);
            streamChannel?.postMessage({
              type: "request-stream",
              sessionId,
              learnerId: learnerIdRef.current,
            });
          }

          if (data.type === "webrtc-offer" && data.learnerId === learnerIdRef.current && data.sdp) {
            try {
              learnerPcRef.current?.close();
              const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
              });
              learnerPcRef.current = pc;

              pc.ontrack = (trackEvent) => {
                const stream = trackEvent.streams[0];
                setRemoteScreenStream(stream);
                if (teacherLiveScreenRef.current) {
                  teacherLiveScreenRef.current.srcObject = stream;
                }
              };

              pc.onicecandidate = (iceEvent) => {
                if (iceEvent.candidate) {
                  streamChannel?.postMessage({
                    type: "ice-candidate",
                    sessionId,
                    learnerId: learnerIdRef.current,
                    candidate: iceEvent.candidate,
                    sender: "learner",
                  });
                }
              };

              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              streamChannel?.postMessage({
                type: "webrtc-answer",
                sessionId,
                learnerId: learnerIdRef.current,
                sdp: pc.localDescription,
              });
            } catch (err) {
              console.error("Learner WebRTC answer error:", err);
            }
          }

          if (data.type === "ice-candidate" && data.learnerId === learnerIdRef.current && data.sender === "teacher") {
            if (learnerPcRef.current && data.candidate) {
              try {
                await learnerPcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch {}
            }
          }

          if (data.type === "stream-ended") {
            setRemoteScreenStream(null);
            setRemoteScreenFrame(null);
            if (teacherLiveScreenRef.current) teacherLiveScreenRef.current.srcObject = null;
            learnerPcRef.current?.close();
            learnerPcRef.current = null;
          }
        };

        framesChannel.onmessage = (event) => {
          const data = event.data;
          if (!data || data.sessionId !== sessionId) return;

          if (data.type === "live-frame" && data.frame) {
            setRemoteScreenFrame(data.frame);
          }

          if (data.type === "teacher-camera-frame" && data.frame) {
            setTeacherCameraFrame(data.frame);
          }

          if (data.type === "teacher-camera-ended") {
            setTeacherCameraFrame(null);
          }

          if (data.type === "stream-ended") {
            setRemoteScreenFrame(null);
          }
        };

        // If screen sharing was already active when mounting, request stream immediately
        streamChannel.postMessage({
          type: "request-stream",
          sessionId,
          learnerId: learnerIdRef.current,
        });
      } catch {}
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === `konnect-live-screen-share:${sessionId}`) {
        checkScreenShare();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.close();
      streamChannel?.close();
      framesChannel?.close();
      learnerPcRef.current?.close();
      learnerPcRef.current = null;
    };
  }, [sessionId]);

  // Ensure video element receives stream whenever state updates
  useEffect(() => {
    if (teacherLiveScreenRef.current && remoteScreenStream) {
      teacherLiveScreenRef.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream]);

  // Handle local camera preview
  useEffect(() => {
    const preview = cameraPreviewRef.current;
    const tracks = mediaStreamsRef.current.camera?.getVideoTracks() ?? [];
    if (preview) preview.srcObject = tracks.length ? new MediaStream(tracks) : null;
    return () => {
      if (preview) preview.srcObject = null;
    };
  }, [cameraOn]);

  useEffect(() => {
    const updateFullscreen = () => setFullscreenOn(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => () => {
    stopStream(mediaStreamsRef.current.camera);
    stopStream(mediaStreamsRef.current.microphone);
    if (reactionTimeoutRef.current !== null) window.clearTimeout(reactionTimeoutRef.current);
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;
    const theme = nextDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    window.localStorage.setItem("konnect-theme", theme);
    setDarkMode(nextDarkMode);
  }

  async function toggleCamera() {
    if (cameraOn) {
      stopStream(mediaStreamsRef.current.camera);
      mediaStreamsRef.current.camera = null;
      setCameraOn(false);
      setMediaError(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      mediaStreamsRef.current.camera = stream;
      setCameraOn(true);
      setMediaError(null);
    } catch {
      setMediaError("Camera access was blocked. Please enable camera access in browser permissions.");
    }
  }

  async function toggleMicrophone() {
    if (microphoneOn) {
      stopStream(mediaStreamsRef.current.microphone);
      mediaStreamsRef.current.microphone = null;
      setMicrophoneOn(false);
      setMediaError(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamsRef.current.microphone = stream;
      setMicrophoneOn(true);
      setMediaError(null);
    } catch {
      setMediaError("Microphone access was blocked. Please enable microphone access in browser permissions.");
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMediaError("Fullscreen is not supported on this device.");
    }
  }

  function leaveClass() {
    if (sessionId) {
      void leaveSession(sessionId, { student_id: learnerIdRef.current }).catch(() => undefined);
    }
    const cleanSession = sessionId ? sessionId.toLowerCase().trim() : "";
    try {
      if (sessionId) {
        sessionStorage.removeItem(`konnect-live-class-admitted:${sessionId}`);
        localStorage.removeItem(`konnect-live-class-admitted:${sessionId}`);
        localStorage.removeItem(`konnect-live-class-requested:${sessionId}`);
        localStorage.removeItem(`konnect-live-class-request:${sessionId}`);
      }
      if (cleanSession) {
        sessionStorage.removeItem(`konnect-live-class-admitted:${cleanSession}`);
        localStorage.removeItem(`konnect-live-class-admitted:${cleanSession}`);
        localStorage.removeItem(`konnect-live-class-requested:${cleanSession}`);
        localStorage.removeItem(`konnect-live-class-request:${cleanSession}`);
      }
    } catch {}
    router.push(`/learner/live_classes/class-complete?session=${encodeURIComponent(sessionId)}`);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (await send(text)) setDraft("");
  }

  function sendReaction(emoji: string) {
    setReaction(emoji);
    void send(`Reacted ${emoji}`);
    if (reactionTimeoutRef.current !== null) window.clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = window.setTimeout(() => setReaction(null), 2500);
  }

  const teacherInitials = sessionDetails.teacherName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "TR";

  const learnerInitials = currentUserName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "LR";

  const meetingRoom = (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen flex-col overflow-hidden bg-[#0c100c] text-[#f0f4ee]">
      {/* 1. Sleek Top Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#121712]/95 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Video size={15} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xs font-bold text-white sm:text-sm">
              {sessionDetails.title}
            </h1>
            <p className="truncate text-[8px] text-emerald-300/80">
              {sessionDetails.courseTitle} · Teacher: <span className="text-white font-medium">{sessionDetails.teacherName}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Live indicator badge */}
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[8px] font-semibold text-emerald-300 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            1-on-1 Live Class
          </span>

          {/* Attendance alive time tracking */}
          <span
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-medium text-emerald-200 border border-white/15"
            title="Attendance is automatically recorded based on active presence"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active: {Math.floor(aliveSeconds / 60)}m {aliveSeconds % 60 < 10 ? "0" : ""}{aliveSeconds % 60}s
          </span>

          {/* Participants toggle (2 people) */}
          <button
            type="button"
            onClick={() => {
              setParticipantsOpen(!participantsOpen);
              if (!participantsOpen) setChatOpen(false);
            }}
            title="Meeting participants"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[8px] font-medium transition ${
              participantsOpen ? "bg-white/20 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Users size={12} />
            <span>2 People</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={fullscreenOn ? "Exit fullscreen" : "Fullscreen"}
            className="rounded-lg p-1.5 text-gray-300 hover:bg-white/10 hover:text-white transition"
          >
            {fullscreenOn ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>

          {/* Dark / Light toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-lg p-1.5 text-gray-300 hover:bg-white/10 hover:text-white transition"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* 2. Main Stage (Cinematic, Uncluttered Screen Focus) */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden p-2 sm:p-3">
        <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#080b08] border border-white/5 shadow-2xl">
          {/* --- CASE A: TEACHER IS SHARING SCREEN --- */}
          {teacherSharingScreen ? (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
              {remoteScreenStream ? (
                <video
                  ref={teacherLiveScreenRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label="Teacher's shared screen stream"
                  className="h-full w-full object-contain"
                />
              ) : remoteScreenFrame ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={remoteScreenFrame}
                  alt="Teacher's live shared screen stream"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    <span className="absolute h-full w-full rounded-full border-2 border-emerald-500/40 animate-ping" />
                    <MonitorUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Connecting to {sessionDetails.teacherName}&apos;s Screen
                    </h3>
                    <p className="mt-1 text-[9px] text-gray-400">
                      Receiving high-definition screen broadcast stream...
                    </p>
                  </div>
                </div>
              )}

              {/* Floating Top Pill: Real-time broadcast status */}
              <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-black/80 px-3 py-1 text-[8px] font-medium text-white backdrop-blur border border-white/15 shadow-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-300">🔴 LIVE SCREEN</span>
                <span className="text-gray-300">· {sessionDetails.teacherName} is sharing</span>
              </div>

              {/* Learner Camera PIP (Bottom Right) */}
              {cameraOn && (
                <div className="absolute bottom-3 right-3 z-20 h-28 w-40 overflow-hidden rounded-xl border-2 border-emerald-500/50 bg-[#161c16] shadow-2xl transition hover:scale-105">
                  <video
                    ref={cameraPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[7px] text-white">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    <span>You</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- CASE B: 1-on-1 LIVE STAGE (TEACHER & LEARNER TILES) --- */
            <div className="flex h-full w-full flex-col justify-between p-4 sm:p-6">
              {/* Top lesson info banner */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-emerald-400">
                    1-on-1 Virtual Classroom
                  </span>
                  <h2 className="text-base font-bold text-white sm:text-lg">
                    {sessionDetails.title}
                  </h2>
                  <p className="mt-0.5 max-w-xl text-[9px] text-gray-400">
                    {sessionDetails.agenda}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 border border-white/10">
                  <MonitorUp size={16} className="text-emerald-400" />
                  <div className="text-left">
                    <p className="text-[7px] font-semibold text-white">Full Screen Sharing Ready</p>
                    <p className="text-[6px] text-gray-400">When teacher shares, screen expands here automatically</p>
                  </div>
                </div>
              </div>

              {/* 1-on-1 Meeting Tiles Grid: Teacher & Learner only */}
              <div className="my-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. Teacher Tile */}
                <div className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#131b13] p-5 text-center shadow-lg transition">
                  {teacherCameraFrame ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={teacherCameraFrame}
                      alt={sessionDetails.teacherName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-800 text-lg font-bold text-white shadow-inner">
                        {teacherInitials}
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-white">
                        {sessionDetails.teacherName}
                      </h3>
                      <p className="mt-0.5 text-[8px] text-emerald-300">
                        Course Instructor · Session Host
                      </p>
                      <p className="mt-3 rounded-full bg-white/5 px-3 py-1 text-[7px] text-gray-300 border border-white/5">
                        Ready to teach · Waiting to share screen
                      </p>
                    </>
                  )}
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[7px] font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online &amp; Teaching
                  </div>
                  {teacherCameraFrame && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[7px] text-gray-200 backdrop-blur border border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{sessionDetails.teacherName}</span>
                    </div>
                  )}
                </div>

                {/* 2. Learner Tile (You) */}
                <div className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#151c15] p-5 text-center shadow-lg transition">
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                    <LearnerEngagementBadge proctor={learnerVision} cameraOn={cameraOn} />
                    <div className="rounded-full bg-white/10 px-2 py-0.5 text-[7px] font-semibold text-gray-300">
                      {cameraOn ? "Camera Active" : "Camera Off"}
                    </div>
                  </div>

                  {cameraOn && learnerVision.violations.cellPhone && (
                    <div className="absolute top-10 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-amber-400/95 px-2.5 py-1 text-[8px] font-bold text-amber-950 shadow-md backdrop-blur animate-bounce">
                      <span>💡 Phone in view — stay focused on class</span>
                    </div>
                  )}

                  {cameraOn ? (
                    <video
                      ref={cameraPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2a3c27] text-lg font-bold text-emerald-200 shadow-inner">
                        {learnerInitials}
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-white">
                        {currentUserName} (You)
                      </h3>
                      <p className="mt-0.5 text-[8px] text-gray-400">
                        Enrolled Learner
                      </p>
                    </>
                  )}

                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[7px] text-gray-200 backdrop-blur border border-white/10">
                    {microphoneOn ? <Mic size={10} className="text-emerald-400" /> : <MicOff size={10} className="text-gray-400" />}
                    <span>{microphoneOn ? "Microphone Unmuted" : "Microphone Muted"}</span>
                  </div>
                </div>
              </div>

              {/* Bottom hint banner */}
              <div className="text-center">
                <p className="text-[8px] text-gray-400">
                  💡 Tip: As soon as the teacher clicks <span className="font-semibold text-emerald-300">&ldquo;Share Screen&rdquo;</span>, this stage transforms into the full-view shared screen display.
                </p>
              </div>
            </div>
          )}

          {/* Reaction animation overlay */}
          {reaction && (
            <div
              aria-live="polite"
              className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 text-5xl drop-shadow-2xl animate-bounce"
            >
              {reaction}
            </div>
          )}
        </main>

        {/* 3. Sliding Side Drawers (Chat & Participants - overlay to never squish the main video) */}
        {chatOpen && (
          <aside className="absolute right-3 top-3 bottom-3 z-30 flex w-72 flex-col rounded-2xl border border-white/15 bg-[#141a14]/95 backdrop-blur shadow-2xl">
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={13} className="text-emerald-400" />
                <h2 className="text-[9px] font-bold text-white">Live Session Chat</h2>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 text-[8px]">
              {messages.map((message, index) => (
                <div key={`${message.name}-${message.time}-${index}`} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${message.self ? "text-emerald-400" : "text-white"}`}>
                      {message.name}
                    </span>
                    <time className="text-[6px] text-gray-400">{message.time}</time>
                  </div>
                  <p className={`rounded-lg px-2.5 py-1.5 leading-relaxed ${message.self ? "bg-emerald-950/70 text-emerald-100" : "bg-white/10 text-gray-200"}`}>
                    {message.text}
                  </p>
                </div>
              ))}
              {!messages.length && !chatError && (
                <p className="py-8 text-center text-gray-400 text-[8px]">
                  No messages yet. Send a message to your teacher.
                </p>
              )}
              {chatError && <p className="text-rose-400 text-[7px]">{chatError}</p>}
            </div>

            {/* Quick Reactions bar in chat */}
            <div className="flex items-center justify-center gap-1 border-t border-white/10 p-1.5">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => sendReaction(emoji)}
                  className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/15 text-xs transition"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-1.5 border-t border-white/10 p-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask teacher a question..."
                className="h-7 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-2 text-[8px] text-white outline-none placeholder:text-gray-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition"
              >
                <Send size={11} />
              </button>
            </form>
          </aside>
        )}

        {participantsOpen && (
          <aside className="absolute right-3 top-3 bottom-3 z-30 flex w-72 flex-col rounded-2xl border border-white/15 bg-[#141a14]/95 backdrop-blur shadow-2xl">
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-emerald-400" />
                <h2 className="text-[9px] font-bold text-white">Participants (2)</h2>
              </div>
              <button
                type="button"
                onClick={() => setParticipantsOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>

            <div className="space-y-2 p-3 text-[8px]">
              {/* Teacher item */}
              <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-800 text-[9px] font-bold text-white">
                  {teacherInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{sessionDetails.teacherName}</p>
                  <p className="text-[6px] text-emerald-300">Teacher · Host</p>
                </div>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[6px] font-semibold text-emerald-300">
                  Online
                </span>
              </div>

              {/* Learner item */}
              <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a3c27] text-[9px] font-bold text-emerald-200">
                  {learnerInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{currentUserName} (You)</p>
                  <p className="text-[6px] text-gray-400">Learner</p>
                </div>
                {handRaised && <Hand size={11} className="text-amber-400" />}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 4. Sleek Floating Bottom Controls Bar */}
      <footer className="flex h-14 shrink-0 items-center justify-between border-t border-white/10 bg-[#111611]/95 px-4 backdrop-blur">
        {/* Left: Device status or notice */}
        <div className="flex items-center gap-2 text-[7px] text-gray-400">
          {mediaError ? (
            <span className="text-rose-400">{mediaError}</span>
          ) : (
            <span>Connected securely to {sessionDetails.teacherName}&apos;s live class</span>
          )}
        </div>

        {/* Center: Core interactive buttons */}
        <div className="flex items-center gap-2">
          {/* Microphone toggle */}
          <button
            type="button"
            onClick={toggleMicrophone}
            title={microphoneOn ? "Mute microphone" : "Unmute microphone"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              microphoneOn
                ? "border-emerald-500/60 bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40"
                : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            {microphoneOn ? <Mic size={15} /> : <MicOff size={15} />}
          </button>

          {/* Camera toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            title={cameraOn ? "Turn camera off" : "Turn camera on"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              cameraOn
                ? "border-emerald-500/60 bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40"
                : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            {cameraOn ? <Camera size={15} /> : <VideoOff size={15} />}
          </button>

          {/* Raise Hand toggle */}
          <button
            type="button"
            onClick={() => setHandRaised(!handRaised)}
            title={handRaised ? "Lower hand" : "Raise hand to ask question"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              handRaised
                ? "border-amber-500/60 bg-amber-600/30 text-amber-300 hover:bg-amber-600/40"
                : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Hand size={15} />
          </button>

          {/* Chat toggle */}
          <button
            type="button"
            onClick={() => {
              setChatOpen(!chatOpen);
              if (!chatOpen) setParticipantsOpen(false);
            }}
            title="Open class chat"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
              chatOpen
                ? "border-emerald-500/60 bg-emerald-600/30 text-emerald-300"
                : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
            }`}
          >
            <MessageCircle size={15} />
            {messages.length > 0 && !chatOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[6px] font-bold text-white">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Right: Leave room button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={leaveClass}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600/90 px-3.5 py-1.5 text-[8px] font-bold text-white shadow-lg transition hover:bg-rose-500"
          >
            <X size={12} />
            <span>Leave Class</span>
          </button>
        </div>
      </footer>
    </div>
  );

  return mounted && admissionVerified ? createPortal(meetingRoom, document.body) : null;
}
