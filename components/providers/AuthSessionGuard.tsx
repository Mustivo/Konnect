"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearAuthState } from "@/lib/redux/slices/authSlice";

const INVALIDATED_KEY = "konnect-auth-session-invalidated";

export default function AuthSessionGuard() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const ownerRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const owner = window.localStorage.getItem("konnect-session-owner")
      || window.localStorage.getItem("konnect-user-email");
    ownerRef.current = owner?.trim().toLowerCase() || null;

    const redirectToLogin = (reason: "session_replaced" | "logged_out") => {
      dispatch(clearAuthState());
      if (!pathnameRef.current.startsWith("/login")) {
        router.replace(`/login?${reason}=1`);
      }
    };

    if (window.sessionStorage.getItem(INVALIDATED_KEY) === "1") {
      redirectToLogin("session_replaced");
    } else if (!window.localStorage.getItem("konnect-session-owner") && ownerRef.current) {
      // Upgrade existing sessions to the browser-wide owner marker.
      window.localStorage.setItem("konnect-session-owner", ownerRef.current);
    }

    const invalidateThisTab = (reason: "session_replaced" | "logged_out") => {
      window.sessionStorage.setItem(INVALIDATED_KEY, "1");
      redirectToLogin(reason);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "konnect-session-owner") return;
      if (window.sessionStorage.getItem(INVALIDATED_KEY) === "1") return;

      const newOwner = event.newValue?.trim().toLowerCase() || null;
      if (newOwner === ownerRef.current) return;
      if (ownerRef.current) {
        invalidateThisTab(newOwner ? "session_replaced" : "logged_out");
      }
      ownerRef.current = newOwner;
    };

    const handleSessionStarted = (event: Event) => {
      const detail = (event as CustomEvent<{ email?: string }>).detail;
      const email = detail?.email?.trim().toLowerCase();
      if (!email) return;
      window.sessionStorage.removeItem(INVALIDATED_KEY);
      ownerRef.current = email;
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("konnect-auth-session-started", handleSessionStarted);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("konnect-auth-session-started", handleSessionStarted);
    };
  }, [dispatch, router]);

  return null;
}
