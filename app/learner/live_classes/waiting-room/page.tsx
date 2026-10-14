"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";

const session = {
  id: "uiux",
  title: "Design systems & component libraries",
  course: "UI/UX Design — From Wireframes to Prototypes",
  teacher: "Amara Okafor",
  time: "Tue, 6 Oct 2026 · 14:00–15:30 BST",
};

type AdmissionMessage = {
  sessionId: string;
  requestId?: string;
  status: "admitted" | "denied";
};

function LiveClassWaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef("");
  const isCorrectSession = !searchParams.get("session") || searchParams.get("session") === session.id;
  const admissionStorageKey = `konnect-live-class-admission:${session.id}`;
  const requestStorageKey = `konnect-live-class-request:${session.id}`;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isCorrectSession) router.replace("/learner/live_classes");
  }, [isCorrectSession, router]);

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

    function applyAdmission(message: AdmissionMessage) {
      if (message.sessionId !== session.id) return;
      if (message.requestId && message.requestId !== requestIdRef.current) return;
      setAdmissionState(message.status);
      setRequestError("");
    }

    if (channel) {
      channel.onmessage = (event: MessageEvent<AdmissionMessage>) => applyAdmission(event.data);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== admissionStorageKey || !event.newValue) return;
      try {
        applyAdmission(JSON.parse(event.newValue) as AdmissionMessage);
      } catch {
        setRequestError("We couldn't confirm your admission. Please request to join again.");
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [admissionStorageKey]);

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

  function sendJoinRequest() {
    const requestId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;
    requestIdRef.current = requestId;
    setRequestError("");

    try {
      localStorage.setItem(requestStorageKey, JSON.stringify({
        sessionId: session.id,
        requestId,
        learner: "Gabriella Igabe",
        requestedAt: new Date().toISOString(),
      }));
      setAdmissionState("waiting");
    } catch {
      setRequestError("Your request couldn't be sent. Please check your browser storage and retry.");
    }
  }

  function cancelJoinRequest() {
    localStorage.removeItem(requestStorageKey);
    localStorage.removeItem(admissionStorageKey);
    requestIdRef.current = "";
    setAdmissionState("ready");
    setRequestError("");
  }

  function enterClass() {
    sessionStorage.setItem(`konnect-live-class-admitted:${session.id}`, "true");
    streamRef.current?.getTracks().forEach((track) => track.stop());
    router.push("/learner/live_classes/liveClass");
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
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#496342] text-2xl font-semibold">GI</span>
                <span className="text-[11px] font-medium">Camera is off</span>
              </div>
            )}
            <div className="absolute left-3 top-3 rounded-md bg-black/45 px-2.5 py-1.5 text-[9px] font-medium text-white">Gabriella Igabe</div>
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
              <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f0e3] text-[#9b7430]"><LoaderCircle size={19} className="animate-spin" /></div>
              <h1 className="mt-4 text-[22px] font-semibold leading-tight">Waiting to be admitted</h1>
              <p className="mt-2 text-[12px] leading-relaxed text-[#737c70] dark:text-[#a0aa99]">Amara will let you into the class when she is ready.</p>
              <div className="mt-5 rounded-lg bg-[#f3f5ef] p-3 dark:bg-[#20271e]">
                <p className="text-[10px] font-semibold">{session.teacher}</p>
                <p className="mt-1 text-[9px] text-[#788172] dark:text-[#a0aa99]">{session.title}</p>
              </div>
              {requestError && <p role="status" className="mt-3 text-[9px] text-[#a7463a]">{requestError}</p>}
              <button type="button" onClick={cancelJoinRequest} className="mt-5 h-10 w-full rounded-md border border-[#dfe5da] text-[10px] font-semibold text-[#536447] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:text-[#c2ccb9] dark:hover:bg-[#20271e]">Cancel request</button>
            </>
          ) : admissionState === "admitted" ? (
            <>
              <h1 className="mt-5 text-[22px] font-semibold leading-tight">You&apos;re ready to join</h1>
              <p className="mt-2 text-[12px] leading-relaxed text-[#737c70] dark:text-[#a0aa99]">{session.teacher} admitted you to the class.</p>
              <button type="button" onClick={enterClass} className="mt-6 h-11 w-full rounded-full bg-[#263d21] text-[11px] font-semibold text-white hover:bg-[#1c3019]">Join class</button>
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
              {admissionState === "denied" && <button type="button" onClick={sendJoinRequest} className="mt-2 h-9 w-full rounded-full border border-[#dfe5da] text-[9px] font-semibold text-[#536447] dark:border-[#303b2d] dark:text-[#c2ccb9]">Request again</button>}
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
