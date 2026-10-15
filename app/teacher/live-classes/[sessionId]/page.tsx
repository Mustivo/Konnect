"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useSessionChat } from "@/lib/useSessionChat";
import { apiJson } from "@/lib/api";
import { endSession, getSession, startSession } from "@/lib/api/sessions";
import {
  Camera,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Laptop,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  Share2,
  Shield,
  UserCheck,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

type SessionDetails = {
  id: string;
  title: string;
  course_title?: string;
  teacher_name?: string;
  agenda?: string;
  meeting_url?: string;
  status?: string;
};

type WaitingLearner = {
  id: string;
  name: string;
  requestedAt: string;
};

export default function TeacherLiveClassPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params?.sessionId || "general";

  const [session, setSession] = useState<SessionDetails>({
    id: sessionId,
    title: "Live Course Session",
    course_title: "Classroom Studio",
    teacher_name: "Instructor",
  });

  const [cameraOn, setCameraOn] = useState(false);
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "info">("chat");
  const [autoAdmit, setAutoAdmit] = useState(true);
  const [copyNotice, setCopyNotice] = useState("");
  const [waitingLearners, setWaitingLearners] = useState<WaitingLearner[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [admittedCount, setAdmittedCount] = useState(1); // Teacher is 1
  const [mediaNotice, setMediaNotice] = useState("");

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const screenSharePreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Chat integration
  const { messages, sending, send } = useSessionChat(sessionId);
  const [chatDraft, setChatDraft] = useState("");

  // Base URL for learner invite link
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const learnerInviteLink = `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(sessionId)}`;

  // Load session details
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const details = await apiJson<SessionDetails>(await getSession(sessionId));
        if (!active) return;
        setSession({
          id: sessionId,
          title: details.title || "Live Course Session",
          course_title: details.course_title || "Virtual Classroom",
          teacher_name: details.teacher_name || "Instructor",
          agenda: details.agenda,
          meeting_url: details.meeting_url || learnerInviteLink,
          status: details.status || "LIVE",
        });
      } catch {
        // Fallback session state
      }
    }
    void load();
    void startSession(sessionId).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [learnerInviteLink, sessionId]);

  // Live timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for waiting learners & admission via BroadcastChannel & Storage
  useEffect(() => {
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    function handleIncomingRequest(learnerId: string, learnerName: string) {
      if (autoAdmit) {
        // Automatically admit
        channel?.postMessage({
          sessionId,
          status: "admitted",
        });
        localStorage.setItem(
          `konnect-live-class-admission:${sessionId}`,
          JSON.stringify({ sessionId, status: "admitted" })
        );
        setAdmittedCount((count) => count + 1);
      } else {
        setWaitingLearners((prev) => {
          if (prev.some((l) => l.id === learnerId)) return prev;
          return [...prev, { id: learnerId, name: learnerName, requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
        });
      }
    }

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === "join-request" && event.data?.sessionId === sessionId) {
          handleIncomingRequest(event.data.learnerId || "learner-1", event.data.learnerName || "Learner");
        }
      };
    }

    // Auto-broadcast admission periodically so waiting room picks it up immediately
    const autoAdmitPulse = setInterval(() => {
      if (autoAdmit) {
        channel?.postMessage({
          sessionId,
          status: "admitted",
        });
        localStorage.setItem(
          `konnect-live-class-admission:${sessionId}`,
          JSON.stringify({ sessionId, status: "admitted" })
        );
      }
    }, 2000);

    return () => {
      channel?.close();
      clearInterval(autoAdmitPulse);
    };
  }, [autoAdmit, sessionId]);

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function toggleCamera() {
    setMediaNotice("");
    if (cameraOn) {
      const videoTrack = mediaStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        mediaStreamRef.current?.removeTrack(videoTrack);
      }
      setCameraOn(false);
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: microphoneOn,
      });

      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setMediaNotice("Camera could not be accessed. Check browser permissions.");
    }
  }

  async function toggleMicrophone() {
    setMediaNotice("");
    if (microphoneOn) {
      const audioTrack = mediaStreamRef.current?.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.stop();
        mediaStreamRef.current?.removeTrack(audioTrack);
      }
      setMicrophoneOn(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: cameraOn });
      mediaStreamRef.current = stream;
      setMicrophoneOn(true);
    } catch {
      setMediaNotice("Microphone could not be accessed. Check browser permissions.");
    }
  }

  async function toggleScreenShare() {
    setMediaNotice("");
    if (sharingScreen) {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setSharingScreen(false);
      if (screenSharePreviewRef.current) screenSharePreviewRef.current.srcObject = null;
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setMediaNotice("Screen sharing is not supported by your browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = stream;
      if (screenSharePreviewRef.current) screenSharePreviewRef.current.srcObject = stream;
      setSharingScreen(true);

      stream.getVideoTracks()[0].onended = () => {
        setSharingScreen(false);
        if (screenSharePreviewRef.current) screenSharePreviewRef.current.srcObject = null;
      };
    } catch {
      setMediaNotice("Screen sharing was cancelled or unavailable.");
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(learnerInviteLink);
      setCopyNotice("Invite link copied! Send it to your learners.");
      setTimeout(() => setCopyNotice(""), 4000);
    } catch {
      setCopyNotice("Failed to copy automatically. Please copy the link manually.");
    }
  }

  function admitLearner(learnerId: string) {
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    channel?.postMessage({
      sessionId,
      learnerId,
      status: "admitted",
    });

    localStorage.setItem(
      `konnect-live-class-admission:${sessionId}`,
      JSON.stringify({ sessionId, status: "admitted" })
    );

    setWaitingLearners((prev) => prev.filter((l) => l.id !== learnerId));
    setAdmittedCount((count) => count + 1);
    channel?.close();
  }

  function admitAll() {
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    channel?.postMessage({
      sessionId,
      status: "admitted",
    });

    localStorage.setItem(
      `konnect-live-class-admission:${sessionId}`,
      JSON.stringify({ sessionId, status: "admitted" })
    );

    setAdmittedCount((count) => count + waitingLearners.length);
    setWaitingLearners([]);
    channel?.close();
  }

  async function handleEndClass() {
    if (confirm("Are you sure you want to end this live session for all participants?")) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      await endSession(sessionId).catch(() => undefined);
      router.push("/teacher/dashboard");
    }
  }

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatDraft.trim()) return;
    if (await send(chatDraft)) {
      setChatDraft("");
    }
  }

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <DashboardShell role="teacher">
      <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-7xl flex-col gap-3 py-1">
        {/* Top Header bar */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-[#dfe5da] bg-white px-4 py-2.5 shadow-sm dark:border-[#263124] dark:bg-[#161c16]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-[#eef6eb] px-2.5 py-1 text-[9px] font-bold tracking-wide text-[#34592a] dark:bg-[#202f1d] dark:text-[#aee09f]">
              <Radio size={12} className="animate-pulse text-[#2e7d1d]" />
              LIVE CLASSROOM
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5b6657] dark:text-[#a3af9e]">
              <Clock size={12} />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
            <div className="hidden h-4 w-px bg-[#dfe5da] sm:block dark:bg-[#263124]" />
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-bold text-[#1b2219] dark:text-[#edf2ea]">
                {session.title}
              </h1>
              <p className="truncate text-[9px] text-[#697463] dark:text-[#9ea999]">
                {session.course_title} · Host: {session.teacher_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#cdd7c8] bg-white px-2.5 text-[10px] font-semibold text-[#32452b] shadow-sm hover:bg-[#f4f7f2] dark:border-[#2e3b2c] dark:bg-[#192218] dark:text-[#cde1c5]"
            >
              <Share2 size={12} />
              <span>Share Learner Link</span>
            </button>
            <button
              type="button"
              onClick={handleEndClass}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#b83535] px-3 text-[10px] font-semibold text-white shadow-sm hover:bg-[#992828]"
            >
              <PhoneOff size={12} />
              <span>End Class</span>
            </button>
          </div>
        </header>

        {copyNotice && (
          <div className="shrink-0 rounded-md border border-[#c3dcba] bg-[#eef7ec] px-3 py-1.5 text-[10px] font-medium text-[#2d5c21] dark:border-[#2f492a] dark:bg-[#1a2b18] dark:text-[#b2e2a4]">
            {copyNotice}
          </div>
        )}

        {mediaNotice && (
          <div className="shrink-0 rounded-md border border-[#edd1c9] bg-[#fdf3f1] px-3 py-1.5 text-[10px] font-medium text-[#a33827] dark:border-[#4d2520] dark:bg-[#2a1614] dark:text-[#f39c8f]">
            {mediaNotice}
          </div>
        )}

        {/* Main Studio Area */}
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Stage (Video Feed / Screen Share & Controls) */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#dfe5da] bg-[#111811] shadow-sm dark:border-[#263124]">
            {/* Viewport */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-2">
              {sharingScreen ? (
                <video
                  ref={screenSharePreviewRef}
                  autoPlay
                  playsInline
                  className="h-full w-full rounded object-contain"
                />
              ) : cameraOn ? (
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-center text-[#73856e]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1b261a] text-2xl font-bold text-[#b5cbaf]">
                    {(session.teacher_name || "Instructor").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#c8d8c2]">{session.teacher_name || "Instructor"}</p>
                    <p className="mt-0.5 text-[9px] text-[#73856e]">Camera is off. Click &apos;Turn Camera On&apos; below to start your video.</p>
                  </div>
                </div>
              )}

              {/* Status Pill on top of Video */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[9px] font-medium text-white backdrop-blur-sm">
                <span className={`h-2 w-2 rounded-full ${cameraOn ? "bg-green-500" : "bg-red-500"}`} />
                <span>{cameraOn ? "Teacher Video Active" : "Video Muted"}</span>
                {microphoneOn && (
                  <span className="flex items-center gap-1 border-l border-white/20 pl-2 text-green-400">
                    <Mic size={10} /> Live Audio
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Media Controls Bar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#162016] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  aria-label={microphoneOn ? "Mute microphone" : "Unmute microphone"}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold transition ${
                    microphoneOn
                      ? "bg-[#294224] text-[#bcedb1] hover:bg-[#34542d]"
                      : "bg-[#332222] text-[#f29c9c] hover:bg-[#442c2c]"
                  }`}
                >
                  {microphoneOn ? <Mic size={14} /> : <MicOff size={14} />}
                  <span>{microphoneOn ? "Mute Mic" : "Unmute Mic"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold transition ${
                    cameraOn
                      ? "bg-[#294224] text-[#bcedb1] hover:bg-[#34542d]"
                      : "bg-[#332222] text-[#f29c9c] hover:bg-[#442c2c]"
                  }`}
                >
                  {cameraOn ? <Video size={14} /> : <VideoOff size={14} />}
                  <span>{cameraOn ? "Stop Video" : "Start Video"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleScreenShare}
                  aria-label={sharingScreen ? "Stop screen share" : "Share screen"}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold transition ${
                    sharingScreen
                      ? "bg-[#344b2b] text-white"
                      : "bg-[#242f23] text-[#b8c7b3] hover:bg-[#2e3c2c]"
                  }`}
                >
                  <Laptop size={14} />
                  <span>{sharingScreen ? "Stop Screen Share" : "Share Screen"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#242f23] px-2.5 py-1.5 text-[9px] font-medium text-[#c5d5bf]">
                  <input
                    type="checkbox"
                    checked={autoAdmit}
                    onChange={(e) => setAutoAdmit(e.target.checked)}
                    className="accent-[#3b6631]"
                  />
                  <span>Auto-admit Learners</span>
                </label>
              </div>
            </div>
          </section>

          {/* Right Side Drawer (Chat / Participants / Invite) */}
          <aside className="flex min-h-0 flex-col rounded-lg border border-[#dfe5da] bg-white shadow-sm dark:border-[#263124] dark:bg-[#161c16]">
            {/* Tab navigation */}
            <div className="flex shrink-0 border-b border-[#dfe5da] dark:border-[#263124]">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold ${
                  activeTab === "chat"
                    ? "border-b-2 border-[#2b4426] text-[#243d1f] dark:border-[#aee09f] dark:text-[#aee09f]"
                    : "text-[#6b7566] hover:bg-[#f6f8f4] dark:text-[#97a393] dark:hover:bg-[#1d251d]"
                }`}
              >
                <MessageCircle size={13} />
                <span>Chat ({messages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold ${
                  activeTab === "participants"
                    ? "border-b-2 border-[#2b4426] text-[#243d1f] dark:border-[#aee09f] dark:text-[#aee09f]"
                    : "text-[#6b7566] hover:bg-[#f6f8f4] dark:text-[#97a393] dark:hover:bg-[#1d251d]"
                }`}
              >
                <Users size={13} />
                <span>Learners ({admittedCount})</span>
                {waitingLearners.length > 0 && (
                  <span className="grid size-4 place-items-center rounded-full bg-[#c94532] text-[8px] text-white">
                    {waitingLearners.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold ${
                  activeTab === "info"
                    ? "border-b-2 border-[#2b4426] text-[#243d1f] dark:border-[#aee09f] dark:text-[#aee09f]"
                    : "text-[#6b7566] hover:bg-[#f6f8f4] dark:text-[#97a393] dark:hover:bg-[#1d251d]"
                }`}
              >
                <Share2 size={13} />
                <span>Invite</span>
              </button>
            </div>

            {/* Tab 1: Live Chat */}
            {activeTab === "chat" && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
                  {messages.map((msg) => (
                    <article key={msg.id} className="space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[8px] font-bold ${msg.self ? "text-[#3b5930] dark:text-[#aee09f]" : "text-[#1d261b] dark:text-[#e7eee4]"}`}>
                          {msg.name}
                        </span>
                        <time className="text-[7px] text-[#8e988b]">{msg.time}</time>
                      </div>
                      <p className={`rounded px-2.5 py-1.5 text-[9px] leading-relaxed ${
                        msg.self
                          ? "bg-[#edf5ea] text-[#2c3d26] dark:bg-[#202f1d] dark:text-[#d3e3cc]"
                          : "bg-[#f4f6f1] text-[#343e30] dark:bg-[#222a21] dark:text-[#c7d4c2]"
                      }`}>
                        {msg.text}
                      </p>
                    </article>
                  ))}
                  {!messages.length && (
                    <p className="py-12 text-center text-[9px] text-[#798374]">
                      No messages yet. Send a greeting to your learners.
                    </p>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex shrink-0 gap-1.5 border-t border-[#e2e7dd] p-2 dark:border-[#263124]">
                  <input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    placeholder="Message learners..."
                    className="h-8 min-w-0 flex-1 rounded border border-[#ccd6c6] bg-white px-2.5 text-[9px] outline-none placeholder:text-[#929c8e] focus:border-[#4b713e] dark:border-[#2d3a2b] dark:bg-[#182117] dark:text-[#eef3ec]"
                  />
                  <button
                    type="submit"
                    disabled={!chatDraft.trim() || sending}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#263d21] text-white hover:bg-[#344f2c] disabled:opacity-50"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Participants & Waiting Room */}
            {activeTab === "participants" && (
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
                {/* Waiting room queue */}
                {waitingLearners.length > 0 && (
                  <div className="mb-4 rounded-md border border-[#ebd8b7] bg-[#fdf9f0] p-2.5 dark:border-[#423118] dark:bg-[#231a0e]">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#825c1e] dark:text-[#e5b364]">
                        Waiting Room ({waitingLearners.length})
                      </p>
                      <button
                        type="button"
                        onClick={admitAll}
                        className="rounded bg-[#825c1e] px-2 py-0.5 text-[8px] font-semibold text-white hover:bg-[#684713]"
                      >
                        Admit all
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {waitingLearners.map((learner) => (
                        <div key={learner.id} className="flex items-center justify-between rounded bg-white p-2 text-[9px] shadow-sm dark:bg-[#1a1c17]">
                          <div>
                            <p className="font-semibold text-[#273123] dark:text-[#e0e9dc]">{learner.name}</p>
                            <p className="text-[7px] text-[#7d8678]">Requested at {learner.requestedAt}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => admitLearner(learner.id)}
                            className="rounded bg-[#2c4724] px-2.5 py-1 text-[8px] font-semibold text-white hover:bg-[#3b5d30]"
                          >
                            Admit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admitted / In this class */}
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#697463] dark:text-[#9ea999]">
                  In This Classroom ({admittedCount})
                </p>

                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between rounded-md border border-[#e4e9df] bg-[#f8faf6] p-2 dark:border-[#273525] dark:bg-[#1c241b]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#294223] text-[9px] font-bold text-white">
                        {(session.teacher_name || "Instructor").slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[9px] font-bold text-[#1f291c] dark:text-[#edf2ea]">{session.teacher_name || "Instructor"}</p>
                        <p className="text-[7px] text-[#4d733d] dark:text-[#aee09f]">Host · Teacher</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[8px] text-[#4d733d]">
                      <Video size={11} /> <Mic size={11} />
                    </span>
                  </div>

                  {/* Connected learners indicator */}
                  <div className="flex items-center justify-between rounded-md border border-[#e4e9df] bg-[#f8faf6] p-2 dark:border-[#273525] dark:bg-[#1c241b]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#355230] text-[9px] font-bold text-white">
                        ST
                      </span>
                      <div>
                        <p className="text-[9px] font-bold text-[#1f291c] dark:text-[#edf2ea]">Connected Learner</p>
                        <p className="text-[7px] text-[#717c6b]">Enrolled student</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#edf6eb] px-1.5 py-0.5 text-[7px] font-semibold text-[#325227] dark:bg-[#202f1d] dark:text-[#aee09f]">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Invite Link & Session Information */}
            {activeTab === "info" && (
              <div className="space-y-4 overflow-y-auto p-3">
                <div className="rounded-md border border-[#d6e3d0] bg-[#f4f8f1] p-3 dark:border-[#263723] dark:bg-[#1a2518]">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#3d6030] dark:text-[#aee09f]">
                    Learner Join Link
                  </p>
                  <p className="mt-1 text-[8px] text-[#63705d] dark:text-[#a4b29f]">
                    Send this link to learners so they can enter the waiting room and join your live class:
                  </p>
                  <div className="mt-2 rounded border border-[#ccd7c6] bg-white p-2 font-mono text-[9px] text-[#222b1f] select-all break-all dark:border-[#2d3a2b] dark:bg-[#141b13] dark:text-[#e5ece1]">
                    {learnerInviteLink}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded bg-[#263d21] py-1.5 text-[9px] font-semibold text-white shadow-sm hover:bg-[#344f2c]"
                  >
                    <Copy size={11} /> Copy Invite Link
                  </button>
                </div>

                <div className="space-y-2 rounded-md border border-[#dfe5da] p-3 text-[9px] text-[#4d5947] dark:border-[#263124] dark:text-[#c4d0be]">
                  <p className="font-bold text-[#1c2419] dark:text-[#edf2ea]">Session Details</p>
                  <p><span className="font-semibold">Course:</span> {session.course_title}</p>
                  <p><span className="font-semibold">Session Title:</span> {session.title}</p>
                  {session.agenda && <p><span className="font-semibold">Agenda:</span> {session.agenda}</p>}
                  <p><span className="font-semibold">Session ID:</span> {sessionId}</p>
                  <p><span className="font-semibold">Status:</span> Live and accepting students</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}