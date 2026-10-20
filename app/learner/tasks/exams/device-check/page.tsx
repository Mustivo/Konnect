"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  Mic,
  RefreshCw,
  ShieldCheck,
  Video,
  VideoOff,
} from "lucide-react";
import { releaseExamMediaStream, setExamMediaStream } from "@/app/learner/tasks/exams/examMedia";
import { useVisionProctor } from "@/lib/vision/useVisionProctor";

const initialMeter = Array.from({ length: 32 }, (_, index) => index);

export default function ExamDeviceCheckPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [microphoneId, setMicrophoneId] = useState("");
  const [faceVisible, setFaceVisible] = useState(true);
  const [monitoringAccepted, setMonitoringAccepted] = useState(false);
  const [testingMicrophone, setTestingMicrophone] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const preserveStreamOnRouteRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const proctor = useVisionProctor({
    videoRef,
    isActive: !!stream?.getVideoTracks().some((track) => track.readyState === "live"),
    mode: "exam",
    intervalMs: 1800,
  });

  // Automatically update faceVisible when AI confirms face presence
  useEffect(() => {
    if (proctor.isModelLoaded && !proctor.violations.personAbsent) {
      setFaceVisible(true);
    }
  }, [proctor.isModelLoaded, proctor.violations.personAbsent]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => () => {
    if (!preserveStreamOnRouteRef.current) releaseExamMediaStream();
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    void audioContextRef.current?.close();
  }, []);

  const cameraReady = !!stream?.getVideoTracks().some((track) => track.readyState === "live");
  const microphoneReady = !!stream?.getAudioTracks().some((track) => track.readyState === "live");
  const checks = [cameraReady, microphoneReady, faceVisible, monitoringAccepted];
  const completedChecks = checks.filter(Boolean).length;
  const allChecksPassed = completedChecks === checks.length;

  async function runDeviceCheck() {
    setMediaError(null);
    releaseExamMediaStream();
    streamRef.current = null;
    setStream(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("This browser does not support camera and microphone access. Open this page in a supported browser over HTTPS or localhost.");
      return;
    }

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: cameraId ? { deviceId: { exact: cameraId }, width: { ideal: 1280 }, height: { ideal: 720 } } : true,
        audio: microphoneId ? { deviceId: { exact: microphoneId } } : true,
      });
      streamRef.current = nextStream;
      setExamMediaStream(nextStream);
      setStream(nextStream);
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const microphones = devices.filter((device) => device.kind === "audioinput");
      setCameraDevices(cameras);
      setMicrophoneDevices(microphones);
      setCameraId((current) => current || cameras[0]?.deviceId || "");
      setMicrophoneId((current) => current || microphones[0]?.deviceId || "");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setMediaError("Camera or microphone access was denied. Allow both in your browser permission prompt, then retry.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setMediaError("No camera or microphone was found. Connect a device and retry the check.");
      } else {
        setMediaError("We could not start your camera and microphone. Check device permissions and try again.");
      }
    }
  }

  async function toggleMicrophoneTest() {
    if (testingMicrophone) {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      await audioContextRef.current?.close();
      audioContextRef.current = null;
      setTestingMicrophone(false);
      setMicLevel(0);
      return;
    }

    const audioTrack = stream?.getAudioTracks()[0];
    if (!audioTrack) {
      setMediaError("Run the device check and allow microphone access before testing your microphone.");
      return;
    }

    try {
      const context = new AudioContext();
      await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(new MediaStream([audioTrack])).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      audioContextRef.current = context;
      setTestingMicrophone(true);

      const sampleMicrophone = () => {
        analyser.getByteTimeDomainData(samples);
        const volume = samples.reduce((total, sample) => total + Math.abs(sample - 128), 0) / samples.length;
        setMicLevel(Math.min(100, Math.round(volume * 4)));
        animationFrameRef.current = requestAnimationFrame(sampleMicrophone);
      };
      sampleMicrophone();
    } catch {
      setMediaError("The microphone test could not start. Check browser audio permissions and retry.");
    }
  }

  const page = (
    <main className="learner-exam-rules fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f3f4ee] text-[#22291f]">
      <header className="flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-[#e0e5dc] bg-white px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/learner/tasks/exams" aria-label="Back to exams" className="shrink-0 border-r border-[#edf0e9] pr-3 sm:pr-5">
            <Image src="/konnect-wordmark.png" alt="Konnect" width={90} height={38} className="h-[30px] w-[82px] object-contain object-left" priority />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-bold sm:text-[18px]">Design systems fundamentals</h1>
            <p className="truncate text-[10px] text-[#788172]">UI/UX Design — From Wireframes to Prototypes</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1 rounded-full bg-[#eaf0e3] px-2.5 py-1 text-[9px] font-semibold text-[#526744] sm:inline-flex"><Check size={11} /> Available now</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf0e3] text-[10px] font-semibold text-[#40522c]">GT</span>
          <span className="hidden sm:block"><span className="block text-[10px] font-semibold">Gabriella Igabe</span><span className="block text-[8px] text-[#788172]">Learner</span></span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-7 sm:pt-5">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#526744]">Before you begin · Step 2 of 3</p>
              <h2 className="mt-0.5 text-[24px] font-bold leading-tight sm:text-[26px]">Camera &amp; microphone check</h2>
              <p className="mt-1 text-[12px] text-[#70796b]">Make sure your devices are ready before starting the exam.</p>
            </div>
            <nav aria-label="Exam steps" className="flex items-center gap-2 text-[10px] text-[#7b8376]">
              <Link href="/learner/tasks/exams" className="hover:text-[#40522c]">Rules</Link>
              <ChevronRight size={12} />
              <span aria-current="step" className="rounded-full bg-[#eaf0e3] px-2.5 py-1 font-semibold text-[#40522c]">Device check</span>
              <ChevronRight size={12} /><span>Exam</span>
            </nav>
          </div>

          <section className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#dfe5da] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:p-5">
            <div><p className="text-[9px] uppercase text-[#778071]">Assessment</p><p className="mt-1 text-[13px] font-semibold">Design systems fundamentals</p><p className="mt-1 text-[10px] text-[#788172]">Teacher · Amara Okafor</p></div>
            <div><p className="text-[9px] uppercase text-[#778071]">Schedule</p><p className="mt-1 text-[13px] font-semibold">6 October 2026</p><p className="mt-1 text-[10px] text-[#788172]">16:00–17:30 BST</p></div>
            <div><p className="text-[9px] uppercase text-[#778071]">Duration</p><p className="mt-1 text-[13px] font-semibold">90 minutes</p><p className="mt-1 text-[10px] text-[#788172]">Timer has not started</p></div>
            <div><p className="text-[9px] uppercase text-[#778071]">Exam structure</p><p className="mt-1 text-[13px] font-semibold">20 questions · 100 points</p><p className="mt-1 text-[10px] text-[#788172]">You can revisit questions</p></div>
          </section>

          <div className="mt-3 grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,2.1fr)_minmax(300px,0.9fr)]">
            <section className="rounded-xl border border-[#dfe5da] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-[15px] font-semibold"><Video size={16} className="text-[#526744]" /> Camera preview</h2><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${cameraReady ? "bg-[#eaf0e3] text-[#526744]" : "bg-[#f1f3ed] text-[#6b7466]"}`}>{cameraReady ? "Camera ready" : "Not tested"}</span></div>

              <div className="relative mt-3 flex h-[220px] items-center justify-center overflow-hidden rounded-md bg-[#e2e8dc] sm:h-[260px] lg:h-[320px]">
                {cameraReady ? (
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <>
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[8px] font-medium text-[#66705f]">Illustration · camera not active</span>
                    <div className="relative mt-4 flex h-[160px] w-[150px] items-end justify-center overflow-hidden rounded-t-full border border-dashed border-[#85937a]">
                      <span className="absolute top-3 h-[76px] w-[64px] rounded-[50%] bg-[#c5cdbf]" />
                      <span className="h-[76px] w-[142px] rounded-t-[55%] bg-[#c5cdbf]" />
                    </div>
                  </>
                )}
                <div className="absolute bottom-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={faceVisible}
                    disabled={!cameraReady}
                    onClick={() => setFaceVisible((visible) => !visible)}
                    className={`rounded-full px-2.5 py-1 text-[8px] font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-90 ${faceVisible ? "bg-[#eaf0e3] text-[#3f5633]" : "bg-white/95 text-[#586552]"}`}
                  >
                    {faceVisible ? (proctor.isModelLoaded ? "AI Verified: Face clearly visible ✓" : "Face confirmed in preview ✓") : "Click to confirm face visibility"}
                  </button>

                  {proctor.violations.cellPhone && (
                    <span className="rounded-full bg-amber-500/95 px-2.5 py-1 text-[8px] font-bold text-amber-950 shadow-sm animate-pulse">
                      📱 Phone detected in view — put away before starting
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-[9px] font-semibold text-[#343c30]">Camera
                  <span className="relative mt-1 flex h-8 items-center">
                    <Camera size={12} className="pointer-events-none absolute left-2 text-[#526744]" />
                    <select value={cameraId} onChange={(event) => setCameraId(event.target.value)} disabled={!cameraDevices.length} className="h-full w-full rounded-md border border-[#dfe5da] bg-white pl-7 pr-2 text-[9px] font-normal disabled:text-[#7c8478]">
                      {cameraDevices.length ? cameraDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>) : <option value="">Default camera · permission needed</option>}
                    </select>
                  </span>
                </label>
                <label className="block text-[9px] font-semibold text-[#343c30]">Microphone
                  <span className="relative mt-1 flex h-8 items-center">
                    <Mic size={12} className="pointer-events-none absolute left-2 text-[#526744]" />
                    <select value={microphoneId} onChange={(event) => setMicrophoneId(event.target.value)} disabled={!microphoneDevices.length} className="h-full w-full rounded-md border border-[#dfe5da] bg-white pl-7 pr-2 text-[9px] font-normal disabled:text-[#7c8478]">
                      {microphoneDevices.length ? microphoneDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>) : <option value="">Default microphone · permission needed</option>}
                    </select>
                  </span>
                </label>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between"><p className="text-[9px] font-semibold">Microphone level</p><span className="text-[8px] text-[#788172]">{testingMicrophone ? "Listening…" : "Awaiting test"}</span></div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 gap-0.5" role="meter" aria-label="Microphone input level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={micLevel}>
                    {initialMeter.map((meter, index) => <span key={meter} className={`h-2 flex-1 rounded-[1px] ${micLevel > index * (100 / initialMeter.length) ? "bg-[#6b8d52]" : "bg-[#e7eae3]"}`} />)}
                  </div>
                  <button type="button" disabled={!microphoneReady} onClick={toggleMicrophoneTest} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#e9ede5] px-2.5 text-[8px] font-semibold text-[#46553e] disabled:cursor-not-allowed disabled:opacity-50">
                    <Mic size={11} /> {testingMicrophone ? "Stop test" : "Test microphone"}
                  </button>
                </div>
                <p className="mt-1 text-[8px] text-[#81897d]">Speak a few words to check the test input.</p>
              </div>

              <div className="mt-3 flex flex-wrap items-start gap-2 rounded-md bg-[#f0f3ec] px-3 py-2.5 text-[8px] leading-relaxed text-[#66705f]">
                <LockKeyhole size={12} className="mt-0.5 shrink-0" />
                <span>{mediaError || "Run the check, then choose Allow in your browser for both camera and microphone. Device options appear after permission is granted."}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[8px] text-[#788172]">{cameraReady && microphoneReady ? "Devices connected. Complete the checklist to continue." : "No device tests have run yet."}</span>
                <button type="button" onClick={runDeviceCheck} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#263d21] px-3 text-[9px] font-semibold text-white hover:bg-[#1c3019]">
                  <RefreshCw size={12} /> {cameraReady || microphoneReady ? "Run check again" : "Run device check"}
                </button>
              </div>
            </section>

            <aside className="space-y-3">
              <section className="rounded-xl border border-[#dfe5da] bg-white p-4">
                <div className="flex items-center justify-between gap-2"><h2 className="text-[15px] font-semibold">Readiness checklist</h2><span className="rounded-full bg-[#f1f3ed] px-2.5 py-1 text-[9px] font-semibold text-[#65705d]">{completedChecks} / 4</span></div>
                <ul className="mt-2 space-y-2.5">
                  {[
                    { title: "Camera permission & video", complete: cameraReady },
                    { title: "Microphone permission & input", complete: microphoneReady },
                    { title: "Face clearly visible in preview", complete: faceVisible },
                    { title: "Monitoring acknowledgement", complete: monitoringAccepted },
                  ].map((check) => (
                    <li key={check.title} className="flex items-center gap-2 text-[9px]">
                      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${check.complete ? "border-[#6b8d52] bg-[#6b8d52] text-white" : "border-[#7d8678] text-transparent"}`}><Check size={9} /></span>
                      <span className="flex-1">{check.title}</span><span className="text-[8px] text-[#858c80]">{check.complete ? "Ready" : "Pending"}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[8px] text-[#858c80]">All checks must pass before the exam is enabled.</p>
              </section>

              <section className="rounded-xl border border-[#dce5d3] bg-[#eaf0e3] p-4">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold"><ShieldCheck size={14} /> Exam monitoring</h2>
                <p className="mt-2 text-[8px] leading-relaxed text-[#70796b]">Your camera and microphone stay on throughout the exam. Your session may be recorded and reviewed by Amara Okafor. Monitoring supports instructor review; it does not guarantee cheating prevention.</p>
                <label className="mt-2 flex cursor-pointer items-start gap-2 text-[9px] font-semibold">
                  <input type="checkbox" checked={monitoringAccepted} onChange={(event) => setMonitoringAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#344d2b]" />
                  <span>I consent to exam monitoring and will keep my camera and microphone on.</span>
                </label>
              </section>

              <section className="rounded-xl border border-[#dfe5da] bg-white p-4">
                <h2 className="text-[11px] font-semibold">Having trouble?</h2>
                <p className="mt-1 text-[8px] leading-relaxed text-[#788172]">Check browser permissions, close apps using your devices, then run the check again.</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button type="button" onClick={runDeviceCheck} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[#f0f3ec] px-2.5 text-[8px] font-semibold text-[#56634e]"><RefreshCw size={10} /> Retry check</button>
                  <a href="mailto:support@konnect.example" className="text-[8px] font-semibold text-[#45583b]">Troubleshooting guide</a>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e0e5dc] bg-white px-4 py-3 sm:px-7">
        <Link href="/learner/tasks/exams/rules" className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5da] px-3 text-[11px] font-semibold text-[#43503d] hover:bg-[#f5f7f2]"><ArrowLeft size={13} /> Back to rules</Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] text-[#788172] sm:inline">Your timer has not started yet.</span>
          <button type="button" disabled={!allChecksPassed} onClick={() => {
            preserveStreamOnRouteRef.current = true;
            if (document.fullscreenEnabled) {
              void document.documentElement.requestFullscreen().catch(() => {});
            }
            router.push("/learner/tasks/exams/start");
          }} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#263d21] px-4 text-[10px] font-semibold text-white hover:bg-[#1c3019] disabled:cursor-not-allowed disabled:opacity-40">
            Start exam <ArrowRight size={13} />
          </button>
        </div>
      </footer>
    </main>
  );

  return mounted ? createPortal(page, document.body) : null;
}
