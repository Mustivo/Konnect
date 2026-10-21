"use client";

import { useEffect, useRef } from "react";
import { ATTENDANCE_CONFIG } from "@/lib/attendance/config";

/**
 * Headless client hook for automatic attendance tracking.
 * - Sends "join" on mount
 * - Sends "ping" every 30 seconds
 * - Pauses pings when tab is hidden for > 2 minutes
 * - Sends "leave" on unmount and on pagehide via sendBeacon
 * - Fails silently on network errors
 */
export function useAttendance(classId: string | null | undefined): void {
  const hiddenSinceRef = useRef<number | null>(null);
  const deviceIdRef = useRef<string>("");

  useEffect(() => {
    if (!classId) return;

    // Stable client device/tab identifier
    if (!deviceIdRef.current) {
      deviceIdRef.current = "tab-" + Math.random().toString(36).slice(2, 9);
    }
    const deviceId = deviceIdRef.current;
    const targetUrl = "/api/attendance/heartbeat";

    const sendEvent = async (event: "join" | "ping" | "leave") => {
      try {
        const token = window.localStorage.getItem("konnect-access-token");
        await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ classId, event, deviceId }),
          keepalive: event === "leave",
        });
      } catch {
        // Fail silently
      }
    };

    const sendBeaconLeave = () => {
      try {
        const payload = JSON.stringify({ classId, event: "leave", deviceId });
        const token = window.localStorage.getItem("konnect-access-token");
        void fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: payload,
          keepalive: true,
        }).catch(() => undefined);
      } catch {
        // Fail silently
      }
    };

    // 1. Send "join" on mount
    void sendEvent("join");

    // 2. Track tab visibility: pause pings if hidden for > 2 minutes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenSinceRef.current = Date.now();
      } else {
        const wasHiddenSince = hiddenSinceRef.current;
        hiddenSinceRef.current = null;
        if (wasHiddenSince) {
          const hiddenDurationSeconds = (Date.now() - wasHiddenSince) / 1000;
          // If resumed after being paused, send an immediate ping
          if (hiddenDurationSeconds >= ATTENDANCE_CONFIG.MAX_HIDDEN_PAUSE_SECONDS) {
            void sendEvent("ping");
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. Periodic ping every 30 seconds
    const intervalId = setInterval(() => {
      // If tab has been hidden for > 2 minutes (120s), pause pinging
      if (hiddenSinceRef.current) {
        const hiddenDuration = (Date.now() - hiddenSinceRef.current) / 1000;
        if (hiddenDuration >= ATTENDANCE_CONFIG.MAX_HIDDEN_PAUSE_SECONDS) {
          return;
        }
      }

      void sendEvent("ping");
    }, ATTENDANCE_CONFIG.HEARTBEAT_INTERVAL_SECONDS * 1000);

    // 4. Handle pagehide / unload
    const handlePageHide = () => {
      sendBeaconLeave();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      sendBeaconLeave();
    };
  }, [classId]);
}
