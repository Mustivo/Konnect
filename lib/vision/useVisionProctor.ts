"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { loadCocoModel } from "./cocoModel";

export type ProctorViolationType =
  | "cell_phone"
  | "multiple_people"
  | "person_absent"
  | "prohibited_material";

export interface VisionIncident {
  id: string;
  timestamp: number;
  timeFormatted: string;
  type: ProctorViolationType;
  message: string;
  confidence: number;
}

export interface UseVisionProctorOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive?: boolean;
  mode?: "exam" | "classroom";
  intervalMs?: number; // default: 1800ms (~0.55 checks/sec to preserve battery and CPU)
  confidenceThreshold?: number; // default: 0.52
  onViolation?: (incident: VisionIncident) => void;
}

export interface VisionProctorState {
  status: "idle" | "loading" | "monitoring" | "warning" | "error";
  isModelLoaded: boolean;
  activeAlert: string | null;
  violations: {
    cellPhone: boolean;
    multiplePeople: boolean;
    personAbsent: boolean;
    prohibitedMaterial: boolean;
  };
  incidentLog: VisionIncident[];
  stats: {
    totalChecks: number;
    phoneIncidents: number;
    multiplePeopleIncidents: number;
    absentIncidents: number;
  };
  clearActiveAlert: () => void;
}

export function useVisionProctor({
  videoRef,
  isActive = true,
  mode = "exam",
  intervalMs = 1800,
  confidenceThreshold = 0.52,
  onViolation,
}: UseVisionProctorOptions): VisionProctorState {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState<VisionProctorState["status"]>("idle");
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [violations, setViolations] = useState({
    cellPhone: false,
    multiplePeople: false,
    personAbsent: false,
    prohibitedMaterial: false,
  });
  const [incidentLog, setIncidentLog] = useState<VisionIncident[]>([]);
  const [stats, setStats] = useState({
    totalChecks: 0,
    phoneIncidents: 0,
    multiplePeopleIncidents: 0,
    absentIncidents: 0,
  });

  // Rolling counters to debounce false positives (require 2 consecutive checks)
  const streakRef = useRef({
    cellPhone: 0,
    multiplePeople: 0,
    personAbsent: 0,
    prohibitedMaterial: 0,
  });

  // Cooldown timers so we don't log the same violation every 1.8 seconds (10s cooldown per type)
  const lastLoggedRef = useRef<Record<ProctorViolationType, number>>({
    cell_phone: 0,
    multiple_people: 0,
    person_absent: 0,
    prohibited_material: 0,
  });

  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  const clearActiveAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const recordIncident = useCallback(
    (type: ProctorViolationType, message: string, confidence: number) => {
      const now = Date.now();
      const COOLDOWN_MS = 10000; // 10 seconds between repeated incident entries

      if (now - (lastLoggedRef.current[type] || 0) < COOLDOWN_MS) {
        return; // Still in cooldown
      }

      lastLoggedRef.current[type] = now;
      const date = new Date(now);
      const timeFormatted = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const newIncident: VisionIncident = {
        id: `inc-${now}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        timeFormatted,
        type,
        message,
        confidence: Math.round(confidence * 100),
      };

      setIncidentLog((prev) => [newIncident, ...prev].slice(0, 50)); // Keep last 50
      setActiveAlert(message);

      setStats((prev) => ({
        ...prev,
        phoneIncidents: prev.phoneIncidents + (type === "cell_phone" ? 1 : 0),
        multiplePeopleIncidents:
          prev.multiplePeopleIncidents + (type === "multiple_people" ? 1 : 0),
        absentIncidents:
          prev.absentIncidents + (type === "person_absent" ? 1 : 0),
      }));

      onViolationRef.current?.(newIncident);
    },
    []
  );

  useEffect(() => {
    if (!isActive) {
      setStatus("idle");
      return;
    }

    let isMounted = true;
    let timerId: NodeJS.Timeout | null = null;
    let isProcessingFrame = false;

    setStatus("loading");

    // Load model
    loadCocoModel()
      .then((model) => {
        if (!isMounted) return;
        if (!model) {
          setStatus("error");
          return;
        }

        setIsModelLoaded(true);
        setStatus("monitoring");

        // Detection interval loop
        const runCheck = async () => {
          if (!isMounted) return;
          const video = videoRef.current;

          // Video must be loaded and playing
          if (
            !video ||
            video.readyState < 2 ||
            video.paused ||
            video.videoWidth === 0
          ) {
            timerId = setTimeout(runCheck, intervalMs);
            return;
          }

          if (isProcessingFrame) {
            timerId = setTimeout(runCheck, intervalMs);
            return;
          }

          isProcessingFrame = true;

          try {
            const predictions = await model.detect(video, 10, confidenceThreshold);
            if (!isMounted) return;

            setStats((prev) => ({ ...prev, totalChecks: prev.totalChecks + 1 }));

            // Tally detections
            let personCount = 0;
            let phoneConfidence = 0;
            let hasBook = false;

            for (const pred of predictions) {
              const label = pred.class.toLowerCase();
              if (label === "person") {
                personCount++;
              } else if (label === "cell phone") {
                phoneConfidence = Math.max(phoneConfidence, pred.score);
              } else if (mode === "exam" && (label === "book" || label === "notebook")) {
                hasBook = true;
              }
            }

            // 1. Check Phone
            if (phoneConfidence > 0) {
              streakRef.current.cellPhone++;
              if (streakRef.current.cellPhone >= 2) {
                recordIncident(
                  "cell_phone",
                  mode === "exam"
                    ? "Warning: Mobile phone detected in view"
                    : "Tip: Mobile phone detected — stay focused on the class",
                  phoneConfidence
                );
              }
            } else {
              streakRef.current.cellPhone = 0;
            }

            // 2. Check Multiple People (Exam mode)
            if (personCount > 1) {
              streakRef.current.multiplePeople++;
              if (mode === "exam" && streakRef.current.multiplePeople >= 2) {
                recordIncident(
                  "multiple_people",
                  `Warning: Multiple people detected (${personCount} in view)`,
                  0.88
                );
              }
            } else {
              streakRef.current.multiplePeople = 0;
            }

            // 3. Check Absence / Covered Camera
            if (personCount === 0) {
              streakRef.current.personAbsent++;
              if (streakRef.current.personAbsent >= 2) {
                recordIncident(
                  "person_absent",
                  mode === "exam"
                    ? "Warning: Face not visible in camera"
                    : "Away from camera",
                  0.9
                );
              }
            } else {
              streakRef.current.personAbsent = 0;
            }

            // 4. Prohibited book / notes in exam
            if (hasBook) {
              streakRef.current.prohibitedMaterial++;
              if (streakRef.current.prohibitedMaterial >= 2) {
                recordIncident(
                  "prohibited_material",
                  "Warning: Book or unauthorized notes detected",
                  0.75
                );
              }
            } else {
              streakRef.current.prohibitedMaterial = 0;
            }

            // Update live violation flags
            const currentViolations = {
              cellPhone: streakRef.current.cellPhone >= 2,
              multiplePeople: streakRef.current.multiplePeople >= 2,
              personAbsent: streakRef.current.personAbsent >= 2,
              prohibitedMaterial: streakRef.current.prohibitedMaterial >= 2,
            };

            setViolations(currentViolations);

            if (
              currentViolations.cellPhone ||
              currentViolations.multiplePeople ||
              currentViolations.personAbsent ||
              currentViolations.prohibitedMaterial
            ) {
              setStatus("warning");
            } else {
              setStatus("monitoring");
            }
          } catch (err) {
            console.warn("[Vision Proctor] Frame detection error:", err);
          } finally {
            isProcessingFrame = false;
            if (isMounted) {
              timerId = setTimeout(runCheck, intervalMs);
            }
          }
        };

        // Start initial cycle
        timerId = setTimeout(runCheck, 800);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[Vision Proctor] Init error:", err);
        setStatus("error");
      });

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [
    isActive,
    intervalMs,
    confidenceThreshold,
    mode,
    videoRef,
    recordIncident,
  ]);

  return {
    status,
    isModelLoaded,
    activeAlert,
    violations,
    incidentLog,
    stats,
    clearActiveAlert,
  };
}
