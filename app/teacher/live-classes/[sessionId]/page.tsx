"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useSessionChat } from "@/lib/useSessionChat";
import { apiJson } from "@/lib/api";
import {
  admitLiveJoinRequest,
  endSession,
  getLiveJoinRequests,
  getSession,
  getSessionAttendance,
  rejectLiveJoinRequest,
  startSession,
} from "@/lib/api/sessions";
import type { MockParticipant } from "@/lib/mock/classesTable";
import {
  Bell,
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
  UserX,
  Users,
  Video,
  VideoOff,
  X,
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

type ConnectedLearner = {
  id: string;
  name: string;
  joinedAt: string;
  status?: string;
  durationMinutes?: number;
  attendanceStatus?: string;
};

export default function TeacherLiveClassPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params?.sessionId || "general";

  const [session, setSession] = useState<SessionDetails>({
    id: sessionId,
    title: "Live Course Session",
    course_title: "Classroom Studio",
    teacher_name: "Mutiti Stivo",
  });

  const [cameraOn, setCameraOn] = useState(false);
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "info">("chat");
  const [autoAdmit, setAutoAdmit] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");
  const [waitingLearners, setWaitingLearners] = useState<WaitingLearner[]>([]);
  const [joinReminderLearner, setJoinReminderLearner] = useState<WaitingLearner | null>(null);
  const [connectedLearners, setConnectedLearners] = useState<ConnectedLearner[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [admittedCount, setAdmittedCount] = useState(1); // Teacher is 1
  const [mediaNotice, setMediaNotice] = useState("");

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const screenSharePreviewRef = useRef<HTMLVideoElement>(null);
  const screenMonitorRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Synthesized notification chime so no external audio asset is needed
  function playJoinReminderChime() {
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
    } catch {
      // Audio context may be restricted by browser until interaction
    }
  }

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

  // Sync real-time attendance and learner alive duration from database
  useEffect(() => {
    let active = true;
    async function syncAttendance() {
      try {
        const res = await getSessionAttendance(sessionId);
        const data = await apiJson<{ results?: MockParticipant[] }>(res);
        if (!active || !data?.results) return;
        const learners = data.results.filter((p) => p.role === "learner");
        if (learners.length > 0) {
          setConnectedLearners(
            learners.map((l) => ({
              id: l.id,
              name: l.name,
              joinedAt: l.joined_at ? new Date(l.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
              status: l.status,
              durationMinutes: l.duration_minutes || 1,
              attendanceStatus: l.attendance_status || (l.status === "left" ? "Finished" : "Active"),
            }))
          );
          setAdmittedCount(1 + learners.length);
        }
      } catch {}
    }

    void syncAttendance();
    const interval = setInterval(syncAttendance, 6000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  // Live timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Broadcast teacher live presence to learners and portals
  useEffect(() => {
    function publishLiveState() {
      try {
        const payload = {
          sessionId,
          classId: sessionId,
          courseTitle: session.course_title || session.title || "Virtual Classroom",
          sessionTitle: session.title || "Live Course Session",
          teacherName: session.teacher_name || "Mutiti Stivo",
          status: "LIVE",
          startedAt: new Date().toISOString(),
          lastHeartbeat: Date.now(),
          meetingUrl: `${origin}/learner/live_classes/waiting-room?session=${encodeURIComponent(sessionId)}&autoRequest=1`,
        };
        window.localStorage.setItem("konnect-active-live-session", JSON.stringify(payload));
        if (typeof BroadcastChannel !== "undefined") {
          const liveChannel = new BroadcastChannel("konnect-live-classes");
          liveChannel.postMessage({ type: "session-started", session: payload });
          liveChannel.close();
        }
        window.dispatchEvent(new CustomEvent("konnect-active-live-session-updated", { detail: payload }));
      } catch {}
    }

    publishLiveState();
    const heartbeatTimer = setInterval(publishLiveState, 3000);

    let queryChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        queryChannel = new BroadcastChannel("konnect-live-classes");
        queryChannel.onmessage = (event) => {
          if (event.data?.type === "is-teacher-live-query") {
            publishLiveState();
          }
        };
      } catch {}
    }

    function handleBeforeUnload() {
      try {
        window.localStorage.removeItem("konnect-active-live-session");
        if (typeof BroadcastChannel !== "undefined") {
          const ch = new BroadcastChannel("konnect-live-classes");
          ch.postMessage({ type: "session-ended", sessionId });
          ch.close();
        }
      } catch {}
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatTimer);
      queryChannel?.close();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [origin, session.course_title, session.teacher_name, session.title, sessionId]);

  // Listen for waiting learners & admission via BroadcastChannel & Storage
  useEffect(() => {
    const cleanSessionId = String(sessionId || "general").toLowerCase().trim();
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    function handleIncomingRequest(learnerId: string, learnerName: string) {
      const cleanId = String(learnerId || "").trim();
      const cleanName = String(learnerName || "").trim() || "Learner";
      if (!cleanId) return;

      // Check if this learner is already admitted or denied
      try {
        const admission = localStorage.getItem(`konnect-live-class-admission:${cleanSessionId}`);
        if (admission) {
          const adm = JSON.parse(admission);
          if (adm.status === "admitted" || adm.status === "denied") {
            if (String(adm.learnerId || adm.requestId || "") === cleanId) return;
          }
        }
      } catch {}

      if (autoAdmit) {
        channel?.postMessage({
          sessionId: cleanSessionId,
          learnerId: cleanId,
          status: "admitted",
        });
        localStorage.setItem(
          `konnect-live-class-admission:${cleanSessionId}`,
          JSON.stringify({ sessionId: cleanSessionId, learnerId: cleanId, status: "admitted", timestamp: Date.now() })
        );
        localStorage.setItem(
          `konnect-live-class-admission:${sessionId}`,
          JSON.stringify({ sessionId, learnerId: cleanId, status: "admitted", timestamp: Date.now() })
        );
        localStorage.setItem(`konnect-live-class-admitted:${cleanSessionId}`, "true");
        localStorage.setItem(`konnect-live-class-admitted:${sessionId}`, "true");
        setConnectedLearners((prev) => {
          if (prev.some((l) => l.id === cleanId)) return prev;
          return [...prev, { id: cleanId, name: cleanName, joinedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
        });
        setAdmittedCount((count) => count + 1);
      } else {
        const item: WaitingLearner = {
          id: cleanId,
          name: cleanName,
          requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setWaitingLearners((prev) => {
          if (prev.some((l) => l.id === cleanId)) return prev;
          return [...prev, item];
        });
        setJoinReminderLearner(item);
        playJoinReminderChime();
      }
    }

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === "join-request") {
          const msgSession = String(event.data?.sessionId || "").toLowerCase().trim();
          if (msgSession === cleanSessionId) {
            handleIncomingRequest(event.data.learnerId || event.data.requestId || "learner", event.data.learnerName || "Learner");
          }
        }
      };
    }

    function handleStorage(event: StorageEvent) {
      if (!event.key || !event.newValue) return;
      if (
        event.key === `konnect-live-class-request:${cleanSessionId}` ||
        event.key === `konnect-live-class-request:${sessionId}`
      ) {
        try {
          const req = JSON.parse(event.newValue);
          if (req.type === "join-request" && String(req.sessionId || "").toLowerCase().trim() === cleanSessionId) {
            handleIncomingRequest(req.learnerId || req.requestId || "learner", req.learnerName || "Learner");
          }
        } catch {}
      }
    }
    window.addEventListener("storage", handleStorage);

    // Initial check and periodic polling of server API and local storage for waiting learners
    function scanWaitingRequests() {
      // 1. Query server API for active waiting join requests for THIS exact session
      void getLiveJoinRequests(cleanSessionId)
        .then((res) => apiJson<{ results?: Array<{ id: string; session_id: string; learner_id: string | number; learner_name: string; status: string; requested_at?: string }> }>(res))
        .then((data) => {
          if (data?.results && Array.isArray(data.results)) {
            const activeWaiting = data.results.filter(
              (r) => r.status === "waiting" && String(r.session_id || "").toLowerCase().trim() === cleanSessionId
            );
            if (activeWaiting.length > 0) {
              setWaitingLearners(
                activeWaiting.map((r) => ({
                  id: String(r.learner_id || r.id),
                  name: r.learner_name || "Learner",
                  requestedAt: r.requested_at ? new Date(r.requested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
                }))
              );
              return;
            }
          }

          // 2. Fallback to localStorage ONLY for this session if not yet handled
          try {
            const raw = window.localStorage.getItem(`konnect-live-class-request:${cleanSessionId}`);
            if (raw) {
              const req = JSON.parse(raw);
              const admission = window.localStorage.getItem(`konnect-live-class-admission:${cleanSessionId}`);
              let isHandled = false;
              if (admission) {
                try {
                  const adm = JSON.parse(admission);
                  if (adm.status === "admitted" || adm.status === "denied") isHandled = true;
                } catch {}
              }
              if (!isHandled && req && req.type === "join-request" && String(req.sessionId || "").toLowerCase().trim() === cleanSessionId) {
                handleIncomingRequest(req.learnerId || req.requestId || "learner", req.learnerName || "Learner");
                return;
              }
            }
          } catch {}

          // If no waiting request exists for this session, clear waiting learners
          setWaitingLearners([]);
          setJoinReminderLearner(null);
        })
        .catch(() => undefined);
    }

    scanWaitingRequests();
    const scanTimer = setInterval(scanWaitingRequests, 2000);

    // Auto-broadcast admission periodically ONLY if teacher explicitly toggled autoAdmit
    const autoAdmitPulse = setInterval(() => {
      if (autoAdmit) {
        channel?.postMessage({
          sessionId: cleanSessionId,
          status: "admitted",
        });
        localStorage.setItem(
          `konnect-live-class-admission:${cleanSessionId}`,
          JSON.stringify({ sessionId: cleanSessionId, status: "admitted" })
        );
        localStorage.setItem(
          `konnect-live-class-admission:${sessionId}`,
          JSON.stringify({ sessionId, status: "admitted" })
        );
      }
    }, 2000);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(scanTimer);
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

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamChannelRef = useRef<BroadcastChannel | null>(null);
  const framesChannelRef = useRef<BroadcastChannel | null>(null);

  // Set up signaling channel for WebRTC screen sharing and frame streaming
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const streamChannel = new BroadcastChannel("konnect-live-webrtc-stream");
    const framesChannel = new BroadcastChannel("konnect-live-screen-frames");
    streamChannelRef.current = streamChannel;
    framesChannelRef.current = framesChannel;

    streamChannel.onmessage = async (event) => {
      const data = event.data;
      if (!data || data.sessionId !== sessionId) return;

      if (data.type === "request-stream" && screenStreamRef.current) {
        const learnerId = String(data.learnerId || "anonymous-learner");
        try {
          // Close old PC if exists
          const existingPc = peerConnectionsRef.current.get(learnerId);
          existingPc?.close();

          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });
          peerConnectionsRef.current.set(learnerId, pc);

          screenStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, screenStreamRef.current!);
          });

          pc.onicecandidate = (e) => {
            if (e.candidate) {
              streamChannel.postMessage({
                type: "ice-candidate",
                sessionId,
                learnerId,
                candidate: e.candidate,
                sender: "teacher",
              });
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          streamChannel.postMessage({
            type: "webrtc-offer",
            sessionId,
            learnerId,
            sdp: pc.localDescription,
          });
        } catch (err) {
          console.error("WebRTC offer creation error:", err);
        }
      }

      if (data.type === "webrtc-answer") {
        const learnerId = String(data.learnerId);
        const pc = peerConnectionsRef.current.get(learnerId);
        if (pc && data.sdp) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          } catch (err) {
            console.error("WebRTC setRemoteDescription error on teacher:", err);
          }
        }
      }

      if (data.type === "ice-candidate" && data.sender === "learner") {
        const learnerId = String(data.learnerId);
        const pc = peerConnectionsRef.current.get(learnerId);
        if (pc && data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error("WebRTC addIceCandidate error on teacher:", err);
          }
        }
      }
    };

    return () => {
      streamChannel.close();
      framesChannel.close();
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, [sessionId]);

  function notifyScreenShare(isSharing: boolean) {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("konnect-live-screen-share");
        channel.postMessage({ sessionId, sharing: isSharing, teacherName: session.teacher_name });
        channel.close();
      }
      window.localStorage.setItem(
        `konnect-live-screen-share:${sessionId}`,
        JSON.stringify({ sessionId, sharing: isSharing, teacherName: session.teacher_name, timestamp: Date.now() })
      );
    } catch {}
  }

  function stopScreenStreaming() {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    streamChannelRef.current?.postMessage({ type: "stream-ended", sessionId });
    framesChannelRef.current?.postMessage({ type: "stream-ended", sessionId });
  }

  async function toggleScreenShare() {
    setMediaNotice("");
    if (sharingScreen) {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setSharingScreen(false);
      if (screenSharePreviewRef.current) screenSharePreviewRef.current.srcObject = null;
      if (screenMonitorRef.current) screenMonitorRef.current.srcObject = null;
      stopScreenStreaming();
      notifyScreenShare(false);
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
      if (screenMonitorRef.current) screenMonitorRef.current.srcObject = stream;
      setSharingScreen(true);
      notifyScreenShare(true);

      // Start frame streaming fallback
      if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

        frameIntervalRef.current = setInterval(() => {
          if (!screenStreamRef.current || !screenMonitorRef.current) return;
          try {
            const video = screenMonitorRef.current;
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              const maxDim = 1280;
              let w = video.videoWidth;
              let h = video.videoHeight;
              if (w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              }
              canvas.width = w;
              canvas.height = h;
              ctx?.drawImage(video, 0, 0, w, h);
              const frameData = canvas.toDataURL("image/jpeg", 0.65);
              framesChannelRef.current?.postMessage({
                type: "live-frame",
                sessionId,
                frame: frameData,
                timestamp: Date.now(),
              });
            }
          } catch {}
        }, 120);
      }

      // Broadcast stream availability to all learners in the session
      streamChannelRef.current?.postMessage({
        type: "stream-available",
        sessionId,
        teacherName: session.teacher_name,
      });

      stream.getVideoTracks()[0].onended = () => {
        setSharingScreen(false);
        if (screenSharePreviewRef.current) screenSharePreviewRef.current.srcObject = null;
        if (screenMonitorRef.current) screenMonitorRef.current.srcObject = null;
        stopScreenStreaming();
        notifyScreenShare(false);
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

  function admitLearner(learnerId: string, learnerName?: string) {
    const cleanSessionId = String(sessionId || "general").toLowerCase().trim();
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    const admissionPayload = {
      sessionId: cleanSessionId,
      learnerId,
      status: "admitted",
      timestamp: Date.now(),
    };

    channel?.postMessage(admissionPayload);

    localStorage.setItem(
      `konnect-live-class-admission:${cleanSessionId}`,
      JSON.stringify(admissionPayload)
    );
    localStorage.setItem(
      `konnect-live-class-admission:${sessionId}`,
      JSON.stringify(admissionPayload)
    );
    localStorage.setItem(`konnect-live-class-admitted:${cleanSessionId}`, "true");
    localStorage.setItem(`konnect-live-class-admitted:${sessionId}`, "true");

    try {
      localStorage.removeItem(`konnect-live-class-request:${cleanSessionId}`);
      localStorage.removeItem(`konnect-live-class-request:${sessionId}`);
    } catch {}

    const target = waitingLearners.find((l) => l.id === learnerId);
    const name = learnerName || target?.name || "Learner";

    setConnectedLearners((prev) => {
      if (prev.some((l) => l.id === learnerId)) return prev;
      return [...prev, { id: learnerId, name, joinedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
    });

    setWaitingLearners((prev) => prev.filter((l) => l.id !== learnerId));
    if (joinReminderLearner?.id === learnerId) {
      setJoinReminderLearner(null);
    }
    setAdmittedCount((count) => count + 1);
    setCopyNotice(`Admitted ${name} into the live classroom.`);
    setTimeout(() => setCopyNotice(""), 3500);
    channel?.close();
  }

  function admitAll() {
    const cleanSessionId = String(sessionId || "general").toLowerCase().trim();
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    const admissionPayload = {
      sessionId: cleanSessionId,
      status: "admitted",
      timestamp: Date.now(),
    };

    channel?.postMessage(admissionPayload);

    localStorage.setItem(
      `konnect-live-class-admission:${cleanSessionId}`,
      JSON.stringify(admissionPayload)
    );
    localStorage.setItem(
      `konnect-live-class-admission:${sessionId}`,
      JSON.stringify(admissionPayload)
    );
    localStorage.setItem(`konnect-live-class-admitted:${cleanSessionId}`, "true");
    localStorage.setItem(`konnect-live-class-admitted:${sessionId}`, "true");

    try {
      localStorage.removeItem(`konnect-live-class-request:${cleanSessionId}`);
      localStorage.removeItem(`konnect-live-class-request:${sessionId}`);
    } catch {}

    setConnectedLearners((prev) => {
      const existingIds = new Set(prev.map((l) => l.id));
      const newlyAdded: ConnectedLearner[] = waitingLearners
        .filter((l) => !existingIds.has(l.id))
        .map((l) => ({ id: l.id, name: l.name, joinedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }));
      return [...prev, ...newlyAdded];
    });

    setAdmittedCount((count) => count + waitingLearners.length);
    setWaitingLearners([]);
    setJoinReminderLearner(null);
    setCopyNotice("Admitted all waiting learners.");
    setTimeout(() => setCopyNotice(""), 3500);
    channel?.close();
  }

  function denyLearner(learnerId: string, learnerName?: string) {
    const cleanSessionId = String(sessionId || "general").toLowerCase().trim();
    const channel = typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("konnect-live-class-admission")
      : null;

    const rejectionPayload = {
      sessionId: cleanSessionId,
      learnerId,
      status: "denied" as const,
      timestamp: Date.now(),
    };

    channel?.postMessage(rejectionPayload);

    localStorage.setItem(
      `konnect-live-class-admission:${cleanSessionId}`,
      JSON.stringify(rejectionPayload)
    );
    localStorage.setItem(
      `konnect-live-class-admission:${sessionId}`,
      JSON.stringify(rejectionPayload)
    );

    try {
      localStorage.removeItem(`konnect-live-class-request:${cleanSessionId}`);
      localStorage.removeItem(`konnect-live-class-request:${sessionId}`);
      const rawAll = localStorage.getItem("konnect-all-live-requests");
      if (rawAll) {
        const parsed = JSON.parse(rawAll);
        const filtered = Array.isArray(parsed)
          ? parsed.filter((r: { id?: string; learnerId?: string }) => r.id !== learnerId && r.learnerId !== learnerId)
          : [];
        localStorage.setItem("konnect-all-live-requests", JSON.stringify(filtered));
      }
    } catch {}

    const target = waitingLearners.find((l) => l.id === learnerId);
    const name = learnerName || target?.name || "Learner";

    setWaitingLearners((prev) => prev.filter((l) => l.id !== learnerId));
    if (joinReminderLearner?.id === learnerId) {
      setJoinReminderLearner(null);
    }
    setCopyNotice(`Declined join request from ${name}.`);
    setTimeout(() => setCopyNotice(""), 3500);
    channel?.close();

    void rejectLiveJoinRequest(cleanSessionId, learnerId, {
      learner_id: learnerId,
    }).catch(() => undefined);
  }

  async function handleEndClass() {
    if (confirm("Are you sure you want to end this live session for all participants?")) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      try {
        window.localStorage.removeItem("konnect-active-live-session");
        if (typeof BroadcastChannel !== "undefined") {
          const ch = new BroadcastChannel("konnect-live-classes");
          ch.postMessage({ type: "session-ended", sessionId });
          ch.close();
        }
        window.dispatchEvent(new CustomEvent("konnect-active-live-session-updated", { detail: null }));
      } catch {}
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

        {waitingLearners.length > 0 && (
          <aside
            role="alert"
            className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#3d7a31] bg-[#f0f8ed] p-3 shadow-lg animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#27481f] text-white">
                <Bell size={16} className="animate-bounce" />
              </span>
              <div>
                <p className="text-[11.5px] font-bold text-[#1b2f18]">
                  🔔 Live Lobby Request: <span className="font-extrabold underline decoration-[#417b35]">
                    Learner Waiting to Join Class ({waitingLearners.map((l) => l.name).join(", ")})
                  </span>
                </p>
                <p className="text-[9.5px] text-[#55694f]">
                  {waitingLearners.length === 1
                    ? `Learner is in the live lobby waiting to join (Requested at ${waitingLearners[0].requestedAt}). Approve to admit them into this live meeting.`
                    : `${waitingLearners.length} learners are in the live lobby waiting to join. Approve to admit them into this live meeting.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (waitingLearners.length === 1) {
                    admitLearner(waitingLearners[0].id, waitingLearners[0].name);
                  } else {
                    admitAll();
                  }
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#25491d] px-3.5 text-[10.5px] font-bold text-white shadow hover:bg-[#346329] transition-all hover:scale-105 active:scale-95"
              >
                <UserCheck size={13} /> {waitingLearners.length === 1 ? "Accept & Admit" : `Admit All (${waitingLearners.length})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (waitingLearners.length === 1) {
                    denyLearner(waitingLearners[0].id, waitingLearners[0].name);
                  } else {
                    waitingLearners.forEach((l) => denyLearner(l.id, l.name));
                  }
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5c3bd] bg-[#fff5f3] px-3 text-[10.5px] font-bold text-[#b83535] hover:bg-[#fde9e6] transition-all dark:border-[#4d2520] dark:bg-[#241514] dark:text-[#f89c9c]"
              >
                <X size={13} /> {waitingLearners.length === 1 ? "Reject" : "Reject All"}
              </button>
            </div>
          </aside>
        )}

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
              {/* LIVE LOBBY REQUEST - LEARNER WAITING TO JOIN CLASS (ON ROOM VIDEO STAGE) */}
              {waitingLearners.length > 0 && (
                <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#48a934] bg-[#0c140b]/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e4817] text-white">
                      <Bell size={18} className="animate-bounce" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#eab308] text-[9px] font-black text-black">
                        {waitingLearners.length}
                      </span>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#25521e] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#a5f396] border border-[#3b782f]">
                          Live Lobby Request
                        </span>
                        <span className="text-[11px] font-bold text-white">
                          Learner Waiting to Join Class
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-200">
                        <span className="font-extrabold text-[#bcf2b0] underline">
                          {waitingLearners.map((l) => l.name).join(", ")}
                        </span>{" "}
                        {waitingLearners.length === 1 ? "is waiting in the live lobby. Accept to admit them into this meeting." : "are waiting in the live lobby. Accept to admit them into this meeting."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (waitingLearners.length === 1) {
                          admitLearner(waitingLearners[0].id, waitingLearners[0].name);
                        } else {
                          admitAll();
                        }
                      }}
                      className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#2e6b22] px-3.5 text-[10.5px] font-bold text-white shadow-md hover:bg-[#3d8c2d] transition-all hover:scale-105 active:scale-95"
                    >
                      <UserCheck size={14} /> {waitingLearners.length === 1 ? "Accept & Admit to Class" : `Admit All (${waitingLearners.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (waitingLearners.length === 1) {
                          denyLearner(waitingLearners[0].id, waitingLearners[0].name);
                        } else {
                          waitingLearners.forEach((l) => denyLearner(l.id, l.name));
                        }
                      }}
                      className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-[#f87171]/40 bg-[#450a0a]/80 px-3 text-[10.5px] font-bold text-[#fca5a5] hover:bg-[#7f1d1d]/80 transition-all active:scale-95"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
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
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-[9px] font-medium text-white backdrop-blur-sm border border-emerald-500/30">
                {sharingScreen ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-emerald-300">Screen Sharing Live · Learner View Confirmed</span>
                  </>
                ) : (
                  <>
                    <span className={`h-2 w-2 rounded-full ${cameraOn ? "bg-green-500" : "bg-red-500"}`} />
                    <span>{cameraOn ? "Teacher Video Active" : "Video Muted"}</span>
                  </>
                )}
                {microphoneOn && (
                  <span className="flex items-center gap-1 border-l border-white/20 pl-2 text-green-400">
                    <Mic size={10} /> Live Audio
                  </span>
                )}
              </div>

              {/* Dedicated Learner View Confirmed Verification Tile */}
              {sharingScreen && (
                <div
                  aria-label="Learner view confirmation monitor"
                  className="absolute bottom-3 right-3 z-20 w-64 overflow-hidden rounded-xl border border-emerald-500/50 bg-[#121911]/95 p-2.5 shadow-2xl backdrop-blur-md"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-emerald-300">
                        Learner View Confirmed
                      </span>
                    </div>
                    <span className="rounded bg-[#1a3818] px-1.5 py-0.5 text-[7px] font-bold text-[#9ae28f] border border-[#2b5927]">
                      Broadcasting
                    </span>
                  </div>
                  <div className="relative mt-2 aspect-video w-full overflow-hidden rounded bg-black">
                    <video
                      ref={screenMonitorRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 font-mono text-[6.5px] text-white/90">
                      Live Mirror · 1080p
                    </span>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[8px] text-[#9db495]">
                    <Check size={10} className="text-emerald-400 shrink-0" />
                    Verified: Learners in classroom are seeing this shared screen
                  </p>
                </div>
              )}
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
                {/* Live Lobby Request: Learner Waiting to Join Class */}
                {waitingLearners.length > 0 && (
                  <div className="mb-4 rounded-xl border-2 border-[#3d7a31] bg-[#f0f8ed] p-3 shadow-sm dark:border-[#385e2f] dark:bg-[#182816]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="rounded bg-[#25521e] px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-[#a5f396]">
                          Live Lobby Request
                        </span>
                        <p className="mt-1 text-[9.5px] font-bold text-[#1b2f18] dark:text-[#edf2ea]">
                          Learner Waiting to Join Class ({waitingLearners.length})
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={admitAll}
                          className="rounded bg-[#25491d] px-2.5 py-1 text-[8px] font-bold text-white hover:bg-[#346329]"
                        >
                          Admit all
                        </button>
                        <button
                          type="button"
                          onClick={() => waitingLearners.forEach((l) => denyLearner(l.id, l.name))}
                          className="rounded border border-[#e0cbab] bg-white px-2 py-0.5 text-[8px] font-semibold text-[#8b3b3b] hover:bg-[#fde9e6] dark:border-[#423118] dark:bg-[#1a1711] dark:text-[#f89c9c]"
                        >
                          Reject all
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {waitingLearners.map((learner) => (
                        <div key={learner.id} className="flex items-center justify-between rounded bg-white p-2 text-[9px] shadow-sm dark:bg-[#1a1c17]">
                          <div>
                            <p className="font-semibold text-[#273123] dark:text-[#e0e9dc]">{learner.name}</p>
                            <p className="text-[7px] text-[#7d8678]">Requested at {learner.requestedAt}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => admitLearner(learner.id, learner.name)}
                              className="rounded bg-[#2c4724] px-2.5 py-1 text-[8px] font-semibold text-white hover:bg-[#3b5d30]"
                            >
                              Admit
                            </button>
                            <button
                              type="button"
                              onClick={() => denyLearner(learner.id, learner.name)}
                              className="rounded border border-[#e5c3bd] bg-[#fff5f3] px-2 py-1 text-[8px] font-semibold text-[#b83535] hover:bg-[#fde9e6] dark:border-[#4d2520] dark:bg-[#241514] dark:text-[#f89c9c]"
                            >
                              Reject
                            </button>
                          </div>
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

                  {/* Connected learners list */}
                  {connectedLearners.length > 0 ? (
                    connectedLearners.map((learner) => (
                      <div key={learner.id} className="flex items-center justify-between rounded-md border border-[#e4e9df] bg-[#f8faf6] p-2 dark:border-[#273525] dark:bg-[#1c241b]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#355230] text-[9px] font-bold text-white">
                            {learner.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-[9px] font-bold text-[#1f291c] dark:text-[#edf2ea]">{learner.name}</p>
                            <p className="text-[7px] text-[#717c6b]">
                              Joined {learner.joinedAt} · Active: {learner.durationMinutes || 1}m
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[7px] font-semibold ${
                          learner.status === "left"
                            ? "bg-[#fce9dc] text-[#bd622c]"
                            : "bg-[#edf6eb] text-[#325227] dark:bg-[#202f1d] dark:text-[#aee09f]"
                        }`}>
                          {learner.attendanceStatus || (learner.status === "left" ? "Left" : "Present")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between rounded-md border border-[#e4e9df] bg-[#f8faf6] p-2 dark:border-[#273525] dark:bg-[#1c241b]">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#355230] text-[9px] font-bold text-white">
                          ST
                        </span>
                        <div>
                          <p className="text-[9px] font-bold text-[#1f291c] dark:text-[#edf2ea]">Connected Learner</p>
                          <p className="text-[7px] text-[#717c6b]">Waiting for students to join</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#f4f7f2] px-1.5 py-0.5 text-[7px] font-semibold text-[#5a6b54] dark:bg-[#202f1d] dark:text-[#aee09f]">
                        Waiting
                      </span>
                    </div>
                  )}
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