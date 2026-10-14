"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Maximize,
  Mic,
  MonitorCheck,
  ShieldAlert,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { getExamMediaStream, releaseExamMediaStream } from "@/app/learner/tasks/exams/examMedia";

type ExamQuestion = {
  topic: string;
  prompt: string;
  instruction: string;
  options: string[];
  correctIndex: number;
};

const questions: ExamQuestion[] = [
  { topic: "Design systems", prompt: "Which practice best helps a team keep interface styles consistent across a product?", instruction: "Choose one answer. Think about how shared design decisions are applied.", options: ["Let each page choose its own colors", "Use shared design tokens and reusable components", "Copy styles between separate files", "Ask each designer to define their own spacing"], correctIndex: 1 },
  { topic: "Design tokens & components", prompt: "A product team needs to change its primary button colour across every screen. Which approach best maintains consistency?", instruction: "Choose one answer. Think about how design tokens and reusable components work together.", options: ["Duplicate each button and change its colour separately.", "Update the shared colour token used by the button components.", "Detach the button instances so every screen can use a different colour.", "Create a new button component for each screen in the product."], correctIndex: 1 },
  { topic: "Design tokens", prompt: "What is the main benefit of using a spacing scale in a design system?", instruction: "Choose one answer.", options: ["It makes every page use the same layout", "It creates consistent, reusable spacing decisions", "It prevents designers from changing layouts", "It replaces the need for responsive design"], correctIndex: 1 },
  { topic: "Component libraries", prompt: "When should a component be added to a shared library?", instruction: "Choose one answer.", options: ["When it solves a repeated interface need", "Whenever a page has a unique heading", "Only after the entire product is finished", "When it has no documented states"], correctIndex: 0 },
  { topic: "Accessibility", prompt: "Which button color check is most important for readable interface text?", instruction: "Choose one answer.", options: ["That it matches the logo exactly", "That it has sufficient contrast with its background", "That it is the brightest color on the page", "That it uses the same hue as every icon"], correctIndex: 1 },
  { topic: "Component states", prompt: "Why should a reusable button define hover, focus, and disabled states?", instruction: "Choose one answer.", options: ["To make its file larger", "To keep interaction feedback consistent and accessible", "To prevent it from being reused", "To remove the need for labels"], correctIndex: 1 },
  { topic: "Typography", prompt: "What should a type scale provide to a product team?", instruction: "Choose one answer.", options: ["A set of unrelated font sizes", "Consistent text roles and hierarchy", "A different font for every page", "Fixed line lengths on all devices"], correctIndex: 1 },
  { topic: "Documentation", prompt: "What makes component documentation useful?", instruction: "Choose one answer.", options: ["It lists only the component name", "It describes usage, variants, and accessibility", "It is kept separate from the team", "It avoids showing examples"], correctIndex: 1 },
  { topic: "Design tokens", prompt: "Which is an example of a semantic color token?", instruction: "Choose one answer.", options: ["green-17", "button-background-primary", "rgb-44-72-31", "color-final-new"], correctIndex: 1 },
  { topic: "Responsive design", prompt: "How should a component library support different screen sizes?", instruction: "Choose one answer.", options: ["Use one fixed width everywhere", "Document responsive behavior and constraints", "Remove mobile states", "Duplicate every component for each device"], correctIndex: 1 },
  { topic: "Versioning", prompt: "Why is versioning important for a shared component library?", instruction: "Choose one answer.", options: ["It hides component changes", "It helps teams understand and adopt updates safely", "It prevents teams from updating", "It removes the need for release notes"], correctIndex: 1 },
  { topic: "Component states", prompt: "What should happen when a form field has an error?", instruction: "Choose one answer.", options: ["Only change its border color", "Show clear, accessible feedback explaining the issue", "Clear the user's input", "Disable the whole application"], correctIndex: 1 },
  { topic: "Design systems", prompt: "Who should contribute to a design system?", instruction: "Choose one answer.", options: ["Only the original designer", "Design, engineering, and product collaborators", "Only external contractors", "No one after its first release"], correctIndex: 1 },
  { topic: "Naming", prompt: "Which token name is easiest to reuse across products?", instruction: "Choose one answer.", options: ["blue-hex-283821", "primary-action-background", "new-button-green", "page-3-color"], correctIndex: 1 },
  { topic: "Maintenance", prompt: "What is a good way to keep a component library healthy?", instruction: "Choose one answer.", options: ["Never remove outdated patterns", "Review usage and maintain components over time", "Allow duplicates to accumulate", "Avoid collecting team feedback"], correctIndex: 1 },
  { topic: "Design tokens", prompt: "What is the relationship between a token and a component?", instruction: "Choose one answer.", options: ["Tokens define reusable values that components can consume", "Tokens replace components", "Components cannot use tokens", "They are unrelated naming systems"], correctIndex: 0 },
  { topic: "Accessibility", prompt: "Why should focus states be included in shared components?", instruction: "Choose one answer.", options: ["They help keyboard users see their current location", "They are only decorative", "They replace labels", "They are shown only on touchscreens"], correctIndex: 0 },
  { topic: "Governance", prompt: "What is the purpose of design-system governance?", instruction: "Choose one answer.", options: ["To stop teams from contributing", "To agree how changes are proposed, reviewed, and maintained", "To make every change require a redesign", "To keep standards undocumented"], correctIndex: 1 },
  { topic: "Components", prompt: "Why should component variants be limited and intentional?", instruction: "Choose one answer.", options: ["To make components harder to understand", "To keep choices clear and prevent unnecessary duplication", "To avoid supporting real product needs", "To hide design decisions"], correctIndex: 1 },
  { topic: "Design systems", prompt: "How can a team tell whether its design system is working well?", instruction: "Choose one answer.", options: ["By counting the number of files", "By observing adoption, consistency, and team feedback", "By never changing it", "By measuring only its visual style"], correctIndex: 1 },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function ExamStartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(90 * 60);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({ 0: 0, 1: 1 });
  const [markedForReview, setMarkedForReview] = useState<number[]>([0]);
  const [cameraMinimized, setCameraMinimized] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micFrameRef = useRef<number | null>(null);
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    setMounted(true);
    const activeStream = getExamMediaStream();
    if (!activeStream) {
      router.replace("/learner/tasks/exams/device-check");
      return;
    }
    setStream(activeStream);
  }, [router]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const detectTabSwitch = () => {
      if (document.visibilityState === "hidden" && !examSubmitted) {
        setTabSwitchDetected(true);
      }
    };

    updateFullscreen();
    document.addEventListener("fullscreenchange", updateFullscreen);
    document.addEventListener("visibilitychange", detectTabSwitch);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreen);
      document.removeEventListener("visibilitychange", detectTabSwitch);
    };
  }, [examSubmitted]);

  useEffect(() => {
    if (cameraRef.current) cameraRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (!audioTrack) return;

    let cancelled = false;
    const startMeter = async () => {
      try {
        const context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        context.createMediaStreamSource(new MediaStream([audioTrack])).connect(analyser);
        await context.resume();
        if (cancelled) {
          await context.close();
          return;
        }
        micContextRef.current = context;
        micAnalyserRef.current = analyser;
        const samples = new Uint8Array(analyser.fftSize);
        const updateMeter = () => {
          analyser.getByteTimeDomainData(samples);
          const volume = samples.reduce((total, sample) => total + Math.abs(sample - 128), 0) / samples.length;
          setMicLevel(Math.min(100, Math.round(volume * 4)));
          micFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch {
        setMicLevel(0);
      }
    };

    void startMeter();
    return () => {
      cancelled = true;
      if (micFrameRef.current !== null) cancelAnimationFrame(micFrameRef.current);
      micFrameRef.current = null;
      void micContextRef.current?.close();
      micContextRef.current = null;
      micAnalyserRef.current = null;
    };
  }, [stream]);

  useEffect(() => {
    if (!examSubmitted && secondsRemaining > 0) {
      const timer = window.setInterval(() => setSecondsRemaining((time) => Math.max(0, time - 1)), 1000);
      return () => window.clearInterval(timer);
    }
  }, [examSubmitted, secondsRemaining > 0]);

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const cameraActive = !!stream?.getVideoTracks().some((track) => track.readyState === "live");
  const microphoneActive = !!stream?.getAudioTracks().some((track) => track.readyState === "live");

  function chooseAnswer(optionIndex: number) {
    if (examSubmitted) return;
    setAnswers((current) => ({ ...current, [currentIndex]: optionIndex }));
  }

  function toggleReview() {
    setMarkedForReview((current) => current.includes(currentIndex)
      ? current.filter((index) => index !== currentIndex)
      : [...current, currentIndex]);
  }

  function finishExam() {
    setExamSubmitted(true);
    releaseExamMediaStream();
    setStream(null);
    setSubmitDialogOpen(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }

  async function enterFullscreen() {
    if (!document.fullscreenEnabled) {
      setFullscreenError("Fullscreen is not available in this browser.");
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      setFullscreenError("");
    } catch {
      setFullscreenError("Fullscreen was blocked. Select the button again to retry.");
    }
  }

  const page = (
    <main className="learner-exam-rules fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#f3f4ee] text-[#22291f]">
      <header className="flex h-[66px] shrink-0 items-center justify-between gap-3 border-b border-[#e0e5dc] bg-white px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Image src="/konnect-wordmark.png" alt="Konnect" width={90} height={38} className="h-[30px] w-[82px] shrink-0 object-contain object-left" priority />
          <span className="h-8 w-px shrink-0 bg-[#edf0e9]" />
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-bold sm:text-[18px]">Design systems fundamentals</h1>
            <p className="truncate text-[10px] text-[#788172]">UI/UX Design — From Wireframes to Prototypes</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-[#eaf0e3] px-3 py-1.5 text-[#34482d]">
            <Clock3 size={17} />
            <span><span className="block text-[7px] font-semibold uppercase">Time remaining</span><span className="block text-[20px] font-bold leading-none tabular-nums">{formatTime(secondsRemaining)}</span></span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf0e3] text-[10px] font-semibold text-[#40522c]">GT</span>
          <span className="hidden sm:block"><span className="block text-[10px] font-semibold">Gabriella Igabe</span><span className="block text-[8px] text-[#788172]">Learner</span></span>
        </div>
      </header>

      <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b border-[#e0e5dc] px-4 sm:px-7">
        {isFullscreen ? (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase text-[#4b5f3c]"><Maximize size={11} /> Full-screen exam <span className="font-normal normal-case text-[#7d8579]">· In progress</span></span>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={enterFullscreen} className="inline-flex shrink-0 items-center gap-1.5 text-[9px] font-semibold uppercase text-[#4b5f3c] hover:text-[#263d21]"><Maximize size={11} /> Enter fullscreen</button>
            {fullscreenError && <span role="status" className="truncate text-[8px] text-[#907a53]">{fullscreenError}</span>}
          </div>
        )}
        <div className="flex min-w-0 items-center justify-end gap-3">
          {tabSwitchDetected && <span role="status" className="hidden text-[8px] font-semibold text-[#907a53] sm:inline">Exam tab switch detected</span>}
          <span className="hidden text-[9px] text-[#788172] sm:inline">6 October 2026 · 16:00–17:30 BST · 90 minutes · Teacher: Amara Okafor</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-3 sm:px-7 sm:pt-5">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_238px]">
          <section className="rounded-xl border border-[#dfe5da] bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#eaf0e3] px-2.5 py-1 text-[9px] font-semibold text-[#4e633d]">Question {currentIndex + 1} of 20</span>
              <span className="text-[9px] text-[#70796b]">Multiple choice · 5 points</span>
            </div>
            <p className="mt-3 text-[9px] font-semibold uppercase text-[#526744]">{currentQuestion.topic}</p>
            <h2 className="mt-2 max-w-[980px] text-[20px] font-bold leading-snug sm:text-[22px]">{currentQuestion.prompt}</h2>
            <p className="mt-2 text-[12px] text-[#70796b]">{currentQuestion.instruction}</p>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((option, optionIndex) => {
                const selected = answers[currentIndex] === optionIndex;
                return (
                  <button key={option} type="button" aria-pressed={selected} onClick={() => chooseAnswer(optionIndex)} className={`flex min-h-[56px] w-full items-center gap-3 rounded-lg border px-3 text-left transition ${selected ? "border-[#405c34] bg-[#eaf0e3] ring-1 ring-[#405c34]" : "border-[#dfe5da] bg-white hover:bg-[#f8f9f6]"}`}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${selected ? "bg-[#405c34] text-white" : "bg-[#f1f3ed] text-[#66705f]"}`}>{String.fromCharCode(65 + optionIndex)}</span>
                    <span className="flex-1 text-[12px] font-medium">{option}</span>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#405c34]" : "border-[#cdd4c8]"}`}>{selected && <span className="h-2 w-2 rounded-full bg-[#405c34]" />}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[9px] text-[#60714f]"><Check size={12} />{answers[currentIndex] !== undefined ? `Answer saved · Option ${String.fromCharCode(65 + answers[currentIndex])} selected` : "No answer selected"}</span>
              <button type="button" aria-pressed={markedForReview.includes(currentIndex)} onClick={toggleReview} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[9px] font-semibold ${markedForReview.includes(currentIndex) ? "border-[#d5b66d] bg-[#fcf5e6] text-[#725c2e]" : "border-[#dfe5da] bg-white text-[#526744] hover:bg-[#f6f8f3]"}`}><Flag size={11} />{markedForReview.includes(currentIndex) ? "Marked for review" : "Mark for review"}</button>
            </div>
            <p className="mt-5 text-[8px] text-[#7a8277]">You can change your answer or revisit this question before submitting.</p>
          </section>

          <aside className="space-y-3">
            <section className="rounded-xl border border-[#dfe5da] bg-white p-4">
              <div className="flex items-center justify-between"><h2 className="text-[14px] font-semibold">Your progress</h2><span className="text-[9px] font-semibold text-[#506440]">{Math.round(answeredCount / questions.length * 100)}%</span></div>
              <div className="mt-2 flex items-center justify-between text-[9px] text-[#70796b]"><span>{answeredCount} of 20 answered</span><span>{markedForReview.length} for review</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0e9]"><div className="h-full rounded-full bg-[#405c34] transition-[width]" style={{ width: `${answeredCount / questions.length * 100}%` }} /></div>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {questions.map((_, index) => {
                  const isCurrent = index === currentIndex;
                  const isAnswered = answers[index] !== undefined;
                  const isMarked = markedForReview.includes(index);
                  return <button key={index} type="button" aria-label={`Go to question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`} onClick={() => setCurrentIndex(index)} className={`relative flex h-9 items-center justify-center rounded-md border text-[9px] font-semibold ${isCurrent ? "border-[#263d21] bg-[#263d21] text-white" : isAnswered ? "border-[#91a681] bg-[#eaf0e3] text-[#35482c]" : "border-[#e2e7dd] bg-[#f3f4ef] text-[#737c70] hover:bg-[#eaeee5]"}`}>
                    {index + 1}{isMarked && <span className="absolute bottom-0.5 right-1 h-1 w-1 rounded-full bg-[#d6a542]" />}
                  </button>;
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] text-[#768071]">
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-[#91a681] bg-[#eaf0e3]" /> Answered</span>
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#263d21]" /> Current</span>
                <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#f3f4ef]" /> Unanswered</span>
                <span className="inline-flex items-center gap-1"><Flag size={9} /> For review</span>
              </div>
              <div className="mt-3 border-t border-[#edf0e9] pt-2 text-[8px] leading-relaxed text-[#7c8478]">{questions.length - answeredCount} unanswered · {markedForReview.length} marked for review<br />20 questions · 100 points total</div>
            </section>

            <section className="rounded-xl border border-[#f0dfbd] bg-[#fcf4e5] p-3.5">
              <h2 className="flex items-center gap-2 text-[10px] font-semibold text-[#775f35]"><ShieldAlert size={13} /> Stay in the exam screen</h2>
              <p className="mt-1.5 text-[9px] leading-relaxed text-[#907a53]">Work independently and do not switch tabs. Leaving this screen or switching tabs may be recorded and reviewed.</p>
            </section>
          </aside>
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e0e5dc] bg-white px-4 py-3 sm:px-7">
        <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5da] px-3 text-[10px] font-semibold text-[#43503d] hover:bg-[#f5f7f2] disabled:opacity-40"><ChevronLeft size={13} /> Previous question</button>
        <span className="hidden text-[9px] text-[#788172] sm:inline">{questions.length - answeredCount} questions still need an answer</span>
        <div className="ml-auto flex items-center gap-2">
          {currentIndex < questions.length - 1 && <button type="button" onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#263d21] px-3 text-[10px] font-semibold text-white hover:bg-[#1c3019]">Next question <ChevronRight size={13} /></button>}
          <button type="button" onClick={() => setSubmitDialogOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5da] bg-white px-3 text-[10px] font-semibold text-[#43503d] hover:bg-[#f5f7f2]">Submit exam</button>
        </div>
      </footer>

      {cameraMinimized ? (
        <button type="button" onClick={() => setCameraMinimized(false)} className="fixed bottom-[76px] right-5 z-[120] rounded-full bg-[#263d21] px-3 py-2 text-[9px] font-semibold text-white shadow-lg">Show camera · {microphoneActive ? "Mic on" : "Mic off"}</button>
      ) : (
        <aside className="fixed bottom-[76px] right-5 z-[120] w-[190px] overflow-hidden rounded-lg border border-white/70 bg-[#101810] text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] sm:w-[220px]">
          <div className="relative aspect-video bg-[#283328]">
            {cameraActive ? <video ref={cameraRef} autoPlay muted playsInline className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-[#d7e0d0]">Camera unavailable</div>}
            <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-1 text-[8px]">Gabriella Igabe</span>
            <button type="button" aria-label="Minimize camera preview" onClick={() => setCameraMinimized(true)} className="absolute right-2 top-2 rounded bg-black/55 p-1 text-white"><VideoOff size={11} /></button>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[8px]">
            {microphoneActive ? <Mic size={10} /> : <Video size={10} />}
            <span>{microphoneActive ? "Microphone active" : "Microphone unavailable"}</span>
            <span className="ml-auto flex h-2 items-end gap-px" aria-label={`Microphone input ${micLevel} percent`}>
              {[20, 40, 60, 80, 100].map((level) => <span key={level} className={`w-1 rounded-sm ${micLevel >= level ? "bg-[#82bc59]" : "bg-[#596255]"}`} style={{ height: `${Math.max(3, level / 1.5)}px` }} />)}
            </span>
          </div>
        </aside>
      )}

      {submitDialogOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 p-4" role="presentation" onClick={() => setSubmitDialogOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="submit-exam-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[#dfe5da] bg-white p-5 shadow-xl">
            <h2 id="submit-exam-title" className="text-[16px] font-semibold">Submit your exam?</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-[#70796b]">You have answered {answeredCount} of 20 questions. You can still review unanswered questions before submitting.</p>
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setSubmitDialogOpen(false)} className="h-8 rounded-md border border-[#dfe5da] px-3 text-[10px] font-medium">Keep working</button><button type="button" onClick={finishExam} className="h-8 rounded-md bg-[#263d21] px-3 text-[10px] font-semibold text-white">Submit exam</button></div>
          </section>
        </div>
      )}

      {examSubmitted && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#f3f4ee] p-5 text-center">
          <div className="max-w-md"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf0e3] text-[#476039]"><Check size={22} /></span><h2 className="mt-4 text-[22px] font-bold">Exam submitted</h2><p className="mt-2 text-[12px] text-[#70796b]">Your answers have been saved. Your teacher will review your results.</p><button type="button" onClick={() => router.push("/learner/tasks/exams")} className="mt-5 h-9 rounded-md bg-[#263d21] px-4 text-[10px] font-semibold text-white">Back to exams</button></div>
        </div>
      )}
    </main>
  );

  return mounted ? createPortal(page, document.body) : null;
}
