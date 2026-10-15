"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { leaveSession } from "@/lib/api/sessions";
import { useSessionChat } from "@/lib/useSessionChat";
import {
  ArrowDown,
  Bell,
  Camera,
  Captions,
  Check,
  ChevronDown,
  Hand,
  Maximize,
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

const participants = [
  { initials: "GI", name: "Gabriella Igabe", caption: "Camera off" },
  { initials: "JW", name: "James Wilson", caption: "" },
  { initials: "AN", name: "Aisha Noor", caption: "" },
  { initials: "+15", name: "Other learners", caption: "" },
];
const reactionEmojis = ["💖", "👍", "🎉", "👏", "😂", "😮", "😢", "🤔", "👎"];

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function LiveClassRoomPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const { messages, chatError, sending, send } = useSessionChat(sessionId);
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [teacherPresenting, setTeacherPresenting] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [meetingMenuOpen, setMeetingMenuOpen] = useState(false);
  const [meetingPolicyOpen, setMeetingPolicyOpen] = useState(false);
  const [fullscreenOn, setFullscreenOn] = useState(false);
  const [draft, setDraft] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [admissionVerified, setAdmissionVerified] = useState(false);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const screenSharePreviewRef = useRef<HTMLVideoElement>(null);
  const reactionTimeoutRef = useRef<number | null>(null);
  const mediaStreamsRef = useRef<{ camera: MediaStream | null; microphone: MediaStream | null }>({
    camera: null,
    microphone: null,
  });

  useEffect(() => {
    const activeSessionId = new URLSearchParams(window.location.search).get("session") || "uiux";
    setSessionId(activeSessionId);
    if (sessionStorage.getItem(`konnect-live-class-admitted:${activeSessionId}`) !== "true") {
      router.replace(`/learner/live_classes/waiting-room?session=${encodeURIComponent(activeSessionId)}`);
      return;
    }

    setMounted(true);
    setAdmissionVerified(true);
    setDarkMode(window.localStorage.getItem("konnect-theme") === "dark");
  }, [router]);

  useEffect(() => {
    const preview = cameraPreviewRef.current;
    const tracks = mediaStreamsRef.current.camera?.getVideoTracks() ?? [];
    if (preview) preview.srcObject = tracks.length ? new MediaStream(tracks) : null;
    return () => {
      if (preview) preview.srcObject = null;
    };
  }, [cameraOn, teacherPresenting]);

  useEffect(() => {
    if (screenSharePreviewRef.current) screenSharePreviewRef.current.srcObject = screenShareStream;
  }, [screenShareStream]);

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

  useEffect(() => () => stopStream(screenShareStream), [screenShareStream]);

  function toggleTheme() {
    const nextDarkMode = !darkMode;
    const theme = nextDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    document.body.style.backgroundColor = nextDarkMode ? "#111510" : "#f2f3ed";
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
      setMediaError("Camera access was blocked. Allow camera access in your browser settings and try again.");
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
      setMediaError("Microphone access was blocked. Allow microphone access in your browser settings and try again.");
    }
  }

  async function toggleScreenShare() {
    if (screenShareStream) {
      stopStream(screenShareStream);
      setScreenShareStream(null);
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError("Screen sharing is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      stream.getVideoTracks()[0]?.addEventListener("ended", () => setScreenShareStream(null), { once: true });
      setScreenShareStream(stream);
      setMediaError(null);
    } catch {
      setMediaError("Screen sharing was cancelled or blocked by the browser.");
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMediaError("Fullscreen is not available in this browser.");
    }
  }

  function leaveClass() {
    stopStream(screenShareStream);
    if (sessionId) void leaveSession(sessionId).catch(() => undefined);
    sessionStorage.removeItem(`konnect-live-class-admitted:${sessionId}`);
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
    reactionTimeoutRef.current = window.setTimeout(() => setReaction(null), 2600);
  }

  const meetingRoom = (
    <div className="learner-live-class-room fixed inset-0 z-[100] flex min-h-0 flex-col overflow-hidden bg-[#f5f6f1] text-[#22291f] dark:bg-[#111510] dark:text-[#edf1e9]">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#e2e6dd] bg-white px-3 dark:border-[#293127] dark:bg-[#171d16] sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#edf2e8] text-[#405a35] dark:bg-[#2b3627] dark:text-[#c2d2b5]">
            <Video size={16} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[12px] font-bold sm:text-[14px]">Design systems &amp; component libraries</h1>
            <p className="truncate text-[8px] text-[#747c70] dark:text-[#a0aa99]">UI/UX Design · From Wireframes to Prototypes · Amara Okafor · Tue, 6 Oct 2026</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span className="rounded-full bg-[#e8f0df] px-2 py-1 text-[7px] font-semibold text-[#526a40] dark:bg-[#293823] dark:text-[#c2d2b5]">LIVE · 14:18 BST</span>
          <button type="button" onClick={() => { setParticipantsOpen(true); setChatOpen(false); }} aria-label="Open participants" title="Participants" className="hidden items-center gap-1.5 text-[8px] text-[#65705d] hover:text-[#40522c] dark:text-[#a0aa99] dark:hover:text-white sm:inline-flex">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef2e9] text-[7px] font-semibold text-[#526744] dark:bg-[#2b3627] dark:text-[#c2d2b5]">19</span>
            19 participants
          </button>
          <button
            type="button"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkMode}
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-[#65705d] hover:bg-[#f0f3ec] dark:text-[#d0d8cb] dark:hover:bg-[#252c22]"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <div className="relative">
            <button type="button" aria-label="More meeting options" aria-expanded={meetingMenuOpen} onClick={() => setMeetingMenuOpen((open) => !open)} className="rounded p-1 text-[#65705d] hover:bg-[#f0f3ec] dark:text-[#b8c3b0] dark:hover:bg-[#252c22]">
              <MoreHorizontal size={16} />
            </button>
            {meetingMenuOpen && (
              <div role="menu" aria-label="Meeting options" className="absolute right-0 top-full z-20 mt-2 w-52 rounded-lg border border-[#e0e5dd] bg-white p-1.5 shadow-lg dark:border-[#303b2d] dark:bg-[#171d16]">
                <button type="button" role="menuitem" onClick={() => { setMeetingMenuOpen(false); setMeetingPolicyOpen(true); }} className="w-full rounded px-2.5 py-2 text-left text-[8px] hover:bg-[#f1f3ed] dark:hover:bg-[#252c22]">Meeting safety &amp; policies</button>
                <button type="button" role="menuitem" onClick={() => { setMeetingMenuOpen(false); void toggleFullscreen(); }} className="w-full rounded px-2.5 py-2 text-left text-[8px] hover:bg-[#f1f3ed] dark:hover:bg-[#252c22]">{fullscreenOn ? "Exit fullscreen" : "Enter fullscreen"}</button>
                <a role="menuitem" href="mailto:support@konnect.example?subject=Live%20class%20report" className="block rounded px-2.5 py-2 text-[8px] hover:bg-[#f1f3ed] dark:hover:bg-[#252c22]">Report a problem</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3 lg:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between px-1">
            <p className="text-[8px] text-[#737c70] dark:text-[#a0aa99]">
              {teacherPresenting ? "Amara Okafor is presenting" : "No presentation · Showing participants"}
            </p>
            <button
              type="button"
              aria-label={teacherPresenting ? "Switch to participant view" : "Show teacher presentation"}
              aria-pressed={!teacherPresenting}
              onClick={() => setTeacherPresenting((presenting) => !presenting)}
              className="inline-flex items-center gap-1 text-[7px] text-[#737c70] dark:text-[#a0aa99]"
            >
              {teacherPresenting ? "Show participants" : "Show presentation"} <ChevronDown size={10} />
            </button>
          </div>

          <div className="relative flex min-h-[280px] flex-1 items-center justify-center rounded-lg bg-[#1c281c] p-1 sm:p-2">
            {screenShareStream ? (
              <video ref={screenSharePreviewRef} autoPlay muted playsInline aria-label="Your shared screen preview" className="h-full w-full rounded-md object-contain" />
            ) : teacherPresenting ? (
            <article className="flex h-full min-h-[260px] w-full flex-col overflow-hidden rounded-md bg-[#fafaf5] p-5 sm:p-8">
              <div className="mb-2 text-[7px] font-semibold uppercase tracking-wide text-[#586a4c]">UI/UX Design / Lesson 6 / Design systems</div>
              <h2 className="text-[18px] font-bold leading-tight text-[#22291f] sm:text-[24px]">Design systems &amp; component libraries</h2>
              <div className="mt-3 grid min-h-0 flex-1 gap-4 md:grid-cols-[0.85fr_1.15fr]">
                <div className="flex flex-col justify-between gap-2">
                  <p className="max-w-sm text-[9px] leading-relaxed text-[#6d7569] sm:text-[10px]">
                    A design system connects the interface, the language, and the process so teams can ship faster without losing consistency.
                  </p>
                  <div className="rounded-md bg-[#eaf0e3] p-3">
                    <h3 className="text-[9px] font-semibold text-[#34432d]">Component library</h3>
                    <p className="mt-1 text-[7px] text-[#697461]">Tokens + atoms + molecules + pages</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {["16px", "600", "#283821"].map((token) => <span key={token} className="rounded-full bg-white px-2 py-1 text-[7px] font-semibold text-[#53634a]">{token}</span>)}
                    </div>
                  </div>
                  <ul className="space-y-1 text-[8px] text-[#485342]">
                    <li className="flex items-start gap-1.5"><Check size={10} className="shrink-0 text-[#64844c]" /> Tokens define spacing, type, and color</li>
                    <li className="flex items-start gap-1.5"><Check size={10} className="shrink-0 text-[#64844c]" /> Components reuse those tokens consistently</li>
                    <li className="flex items-start gap-1.5"><Check size={10} className="shrink-0 text-[#64844c]" /> Documentation keeps the team aligned</li>
                  </ul>
                </div>

                <div className="flex min-h-0 flex-col">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-[8px] font-semibold text-[#343c30]">Component library example</h3>
                    <span className="text-[6px] text-[#858c80]">Figma-style system board</span>
                  </div>
                  <div className="flex-1 rounded-md border border-[#e2e6dd] bg-white p-2.5">
                    <div className="flex items-center justify-between border-b border-[#edf0e9] pb-2">
                      <span className="text-[7px] font-semibold">Design system board</span>
                      <span className="text-[6px] text-[#858c80]">12 components</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[
                        { label: "TYPE SCALE", sample: "16px", detail: "Body copy" },
                        { label: "PRIMARY", sample: "#283821", detail: "Brand color" },
                        { label: "SURFACE", sample: "#F9F8F1", detail: "Canvas" },
                      ].map((item) => (
                        <div key={item.label} className="rounded border border-[#edf0e9] bg-[#f8f9f5] p-2">
                          <p className="text-[6px] font-semibold text-[#7b8476]">{item.label}</p>
                          <p className="mt-1 text-[10px] font-bold text-[#30382b]">{item.sample}</p>
                          <p className="text-[6px] text-[#858c80]">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      {[
                        { label: "BUTTON", content: "Join class" },
                        { label: "INPUT", content: "Search courses..." },
                        { label: "TABS", content: "Overview   Tokens" },
                      ].map((item) => (
                        <div key={item.label} className="rounded border border-[#edf0e9] p-2">
                          <p className="text-[6px] font-semibold text-[#7b8476]">{item.label}</p>
                          <p className="mt-1 truncate rounded bg-[#eff2eb] px-1.5 py-1 text-[6px] text-[#4e5b45]">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-1.5 flex justify-end gap-1 text-[7px] text-[#737c70]">
                    <span className="rounded-full bg-white px-2 py-1">👏 3</span>
                    <span className="rounded-full bg-white px-2 py-1">💡 2</span>
                  </div>
                </div>
              </div>
            </article>
            ) : (
              <div className="grid h-full min-h-[260px] w-full grid-cols-2 gap-2 rounded-md bg-[#111811] p-2 sm:grid-cols-3 sm:p-3">
                <article className="relative flex min-h-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-[#263426] p-2 text-center">
                  <Video className="absolute right-2 top-2 text-[#bac5b0]" size={12} />
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#496342] text-sm font-semibold text-white">AO</span>
                  <span className="text-[8px] font-semibold text-white">Amara Okafor</span>
                  <span className="text-[7px] text-[#c2ccb9]">Teacher</span>
                </article>
                {participants.map((person) => (
                  <article key={person.initials} className="relative flex min-h-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-[#1b241b] p-2 text-center">
                    {person.initials === "GI" && cameraOn ? (
                      <video ref={cameraPreviewRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#324b2e] text-[10px] font-semibold text-[#d8e4cf]">{person.initials}</span>
                    )}
                    <span className="relative mt-auto text-[8px] font-medium text-white">{person.name}</span>
                    {person.caption && <span className="relative text-[7px] text-[#c2ccb9]">{cameraOn ? "Camera on" : person.caption}</span>}
                  </article>
                ))}
              </div>
            )}
            {reaction && <div aria-live="polite" className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg animate-bounce">{reaction}</div>}
            {captionsEnabled && <div role="status" className="absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 rounded-md bg-black/75 px-3 py-2 text-center text-[8px] text-white">Waiting for the teacher&apos;s live captions</div>}
          </div>

          {reactionsOpen && (
            <div aria-label="Send a reaction" className="flex shrink-0 items-center justify-center gap-1 overflow-x-auto rounded-full bg-[#e8ece4] px-2 py-1.5 dark:bg-[#20271e]">
              {reactionEmojis.map((emoji) => <button key={emoji} type="button" aria-label={`Send ${emoji} reaction`} onClick={() => { sendReaction(emoji); setReactionsOpen(false); }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[16px] hover:bg-white dark:hover:bg-[#30382e]">{emoji}</button>)}
            </div>
          )}

          <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
            <div className="flex min-h-11 items-center gap-2 rounded-md bg-[#e8ece4] px-2 dark:bg-[#20271e]">
              <span className="flex h-8 w-10 items-center justify-center rounded bg-[#d5d9d0] text-[8px] font-semibold text-[#54624c] dark:bg-[#30382e] dark:text-[#c1cbb9]">AO</span>
              <span className="min-w-0"><span className="block truncate text-[7px] font-semibold">Amara Okafor · Teacher</span><span className="text-[6px] text-[#7a8277]">Presenting</span></span>
            </div>
            {participants.map((person) => (
              <div key={person.initials} className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#edf0e9] px-2 dark:bg-[#1b211a]">
                {person.initials === "GI" && cameraOn && teacherPresenting ? (
                  <video ref={cameraPreviewRef} autoPlay muted playsInline className="h-7 w-9 shrink-0 rounded object-cover" />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e2ead9] text-[7px] font-semibold text-[#4b5d3f] dark:bg-[#2b3627] dark:text-[#c2d2b5]">{person.initials}</span>
                )}
                <span className="min-w-0"><span className="block truncate text-[7px] font-medium">{person.name}</span>{person.caption && <span className="block truncate text-[6px] text-[#7a8277]">{person.caption}</span>}</span>
              </div>
            ))}
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
            {[
              { title: screenShareStream ? "Stop sharing" : "Share screen", Icon: MonitorUp, active: !!screenShareStream, action: toggleScreenShare },
              { title: "Captions", Icon: Captions, active: captionsEnabled, action: () => setCaptionsEnabled((enabled) => !enabled) },
              { title: "Participants", Icon: Users, active: participantsOpen, action: () => { setParticipantsOpen((open) => !open); setChatOpen(false); } },
              { title: "Chat", Icon: MessageCircle, active: chatOpen, action: () => { setChatOpen((open) => !open); setParticipantsOpen(false); } },
              { title: "Raise hand", Icon: Hand, active: handRaised, action: () => setHandRaised((raised) => !raised) },
              { title: "Reactions", Icon: Smile, active: reactionsOpen, action: () => setReactionsOpen((open) => !open) },
              { title: fullscreenOn ? "Exit fullscreen" : "Fullscreen", Icon: Maximize, active: fullscreenOn, action: toggleFullscreen },
            ].map(({ title, Icon, active, action }) => (
              <button
                key={title}
                type="button"
                aria-label={title}
                aria-pressed={active}
                title={title}
                onClick={action}
                className={`flex h-8 items-center justify-center gap-1.5 rounded-md border text-[7px] font-medium ${active ? "border-[#718662] bg-[#e7eee0] text-[#3e5334] dark:border-[#526346] dark:bg-[#273122] dark:text-[#d1dfc5]" : "border-[#e0e5dd] bg-white text-[#58645b] hover:bg-[#f2f4ef] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#b8c3b0]"}`}
              >
                <Icon size={12} /> {title}
              </button>
            ))}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#e0e5dd] px-1 pt-2 text-[7px] text-[#7a8277] dark:border-[#293127] dark:text-[#9da897]">
            <span title={mediaError || undefined} className={mediaError ? "text-[#a7463a] dark:text-[#f09a8e]" : undefined}>
              {mediaError || (microphoneOn ? "Microphone ready · local device" : "14:18 · Connected securely")}
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" aria-label={microphoneOn ? "Turn microphone off" : "Turn microphone on"} aria-pressed={microphoneOn} onClick={toggleMicrophone} className="flex h-7 items-center gap-1 rounded-md border border-[#dfe5da] bg-white px-2 text-[7px] font-medium text-[#475341] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]">
                {microphoneOn ? <Mic size={11} /> : <MicOff size={11} />}{microphoneOn ? "Mic on" : "Mic off"}
              </button>
              <button type="button" aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} aria-pressed={cameraOn} onClick={toggleCamera} className="flex h-7 items-center gap-1 rounded-md border border-[#dfe5da] bg-white px-2 text-[7px] font-medium text-[#475341] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9]">
                {cameraOn ? <Camera size={11} /> : <VideoOff size={11} />}{cameraOn ? "Camera on" : "Camera off"}
              </button>
              <button type="button" onClick={leaveClass} className="flex h-7 items-center gap-1 rounded-md bg-[#a7463a] px-2.5 text-[7px] font-semibold text-white hover:bg-[#8f392f]">
                <X size={10} /> Leave
              </button>
            </div>
            <button type="button" aria-pressed={handRaised} onClick={() => setHandRaised((raised) => !raised)} className="hidden items-center gap-1.5 sm:flex"><span>{handRaised ? "Your hand is raised" : "Your hand is lowered"}</span><Settings size={11} /></button>
          </footer>
        </section>

        {(chatOpen || participantsOpen) && (
          <aside className="flex max-h-[34vh] min-h-0 shrink-0 flex-col rounded-lg border border-[#e0e5dd] bg-white dark:border-[#2a312a] dark:bg-[#161b17] lg:max-h-none lg:w-[270px] xl:w-[300px]">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#e9ede5] px-3 dark:border-[#293127]">
              <div>
                <h2 className="text-[9px] font-semibold">{participantsOpen ? "Participants" : "Class conversation"}</h2>
                <p className="text-[6px] text-[#81897d] dark:text-[#99a391]">{participantsOpen ? "People in this live class" : "Visible to everyone · Enabled by teacher"}</p>
              </div>
              <button type="button" aria-label={participantsOpen ? "Close participants" : "Close chat"} onClick={() => { setChatOpen(false); setParticipantsOpen(false); }} className="rounded p-1 text-[#74806d] hover:bg-[#f1f3ed] dark:text-[#b8c3b0] dark:hover:bg-[#252c22]"><X size={12} /></button>
            </div>

            {participantsOpen ? (
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5">
                {[{ initials: "AO", name: "Amara Okafor", caption: "Teacher · presenting" }, ...participants].map((person) => (
                  <div key={person.initials} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f3f5ef] dark:hover:bg-[#20271e]">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e2ead9] text-[7px] font-semibold text-[#4b5d3f] dark:bg-[#2b3627] dark:text-[#c2d2b5]">{person.initials}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[7px] font-semibold">{person.name}</span><span className="mt-0.5 block truncate text-[6px] text-[#7a8277]">{person.caption || "In the class"}</span></span>
                    {person.initials === "GI" && handRaised && <Hand size={11} className="text-[#536b43]" />}
                    {person.initials === "GI" && microphoneOn && <Mic size={10} className="text-[#536b43]" />}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
                  {messages.map((message, index) => (
                    <article key={`${message.name}-${message.time}-${index}`} className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[7px] font-semibold ${message.self ? "text-[#4d633d] dark:text-[#c2d2b5]" : "text-[#343c30] dark:text-[#e1e8dc]"}`}>{message.name}</span>
                        <time className="text-[6px] text-[#90978b]">{message.time}</time>
                      </div>
                      <p className={`rounded-md px-2 py-1.5 text-[7px] leading-relaxed ${message.self ? "bg-[#eaf0e3] text-[#3f4939] dark:bg-[#293522] dark:text-[#d5dfce]" : "bg-[#f3f4ef] text-[#50594b] dark:bg-[#20271e] dark:text-[#c1cbb9]"}`}>{message.text}</p>
                    </article>
                  ))}
                  {!messages.length && !chatError && <p className="py-4 text-center text-[7px] text-[#788172]">No messages yet. Start the conversation.</p>}
                  {chatError && <p role="status" className="py-1 text-[6px] text-[#a7463a] dark:text-[#f09a8e]">{chatError}</p>}
                  <div className="pt-1">
                    <p className="text-[6px] font-semibold uppercase text-[#737c70] dark:text-[#9da897]">Reactions · Stickers</p>
                    <div className="mt-1 grid grid-cols-5 gap-1">
                      {reactionEmojis.map((emoji) => (
                        <button key={emoji} type="button" aria-label={`Send ${emoji} reaction`} onClick={() => sendReaction(emoji)} className="flex h-6 items-center justify-center rounded border border-[#e6e9e2] bg-white text-[10px] hover:bg-[#eaf0e3] dark:border-[#303b2d] dark:bg-[#171d16]">{emoji}</button>
                      ))}
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      {["Got it!", "Great idea"].map((phrase) => <button key={phrase} type="button" onClick={() => void send(phrase)} className="flex-1 rounded bg-[#edf2e8] py-1 text-[6px] font-medium text-[#526744] dark:bg-[#2b3627] dark:text-[#c2d2b5]">{phrase}</button>)}
                    </div>
                  </div>
                </div>

                <form onSubmit={sendMessage} className="flex shrink-0 items-center gap-1.5 border-t border-[#e9ede5] p-2 dark:border-[#293127]">
                  <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message your class..." className="h-7 min-w-0 flex-1 rounded-md border border-[#e1e6dc] bg-white px-2 text-[7px] outline-none placeholder:text-[#92998d] focus:border-[#9aab8c] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#edf1e9]" />
                  <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" title="Send message" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#263d21] text-white hover:bg-[#1c3019] disabled:cursor-not-allowed disabled:opacity-50"><Send size={11} /></button>
                </form>
                <div className="flex shrink-0 items-center gap-1.5 px-2 pb-2 text-[6px] text-[#92998d]">
                  <Bell size={9} /> Class chat · Follow the meeting policies
                  <button type="button" aria-label="View meeting policies" title="Meeting policies" onClick={() => setMeetingPolicyOpen(true)} className="ml-auto rounded p-0.5 hover:bg-[#f1f3ed]"><Settings size={11} /></button>
                </div>
              </>
            )}
          </aside>
        )}

        {meetingPolicyOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 p-4" role="presentation" onClick={() => setMeetingPolicyOpen(false)}>
            <section role="dialog" aria-modal="true" aria-labelledby="meeting-policy-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-xl border border-[#dfe5da] bg-white p-5 shadow-xl dark:border-[#303b2d] dark:bg-[#171d16]">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[7px] font-semibold uppercase tracking-wide text-[#536447] dark:text-[#b9caa9]">Live class</p><h2 id="meeting-policy-title" className="mt-1 text-[15px] font-semibold">Meeting safety &amp; policies</h2></div>
                <button type="button" aria-label="Close meeting policies" onClick={() => setMeetingPolicyOpen(false)} className="rounded p-1 text-[#74806d] hover:bg-[#f1f3ed] dark:text-[#b8c3b0] dark:hover:bg-[#252c22]"><X size={14} /></button>
              </div>
              <ul className="mt-4 space-y-3 text-[8px] leading-relaxed text-[#586354] dark:text-[#c1cbb9]">
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-[#5b7a47]" />Treat classmates respectfully and keep messages related to the lesson.</li>
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-[#5b7a47]" />Do not record, screenshot, or redistribute class content without the teacher&apos;s permission.</li>
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-[#5b7a47]" />Protect personal information. Share only what is needed for class participation.</li>
                <li className="flex gap-2"><Check size={12} className="mt-0.5 shrink-0 text-[#5b7a47]" />You control your camera and microphone. Mute when you are not speaking.</li>
              </ul>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf0e9] pt-3 text-[7px] dark:border-[#303b2d]">
                <span className="text-[#81897d] dark:text-[#99a391]">Need help with this meeting?</span>
                <a href="mailto:support@konnect.example?subject=Live%20class%20support" className="font-semibold text-[#40522c] hover:underline dark:text-[#c3d7ad]">Contact support</a>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );

  return mounted && admissionVerified ? createPortal(meetingRoom, document.body) : null;
}
