"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { AuthMessageState } from "@/lib/redux/types";

export interface AuthMessageProps {
  notice?: AuthMessageState | string | null;
  type?: "error" | "success" | "info" | "warning";
  title?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | string>;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  onDismiss?: () => void;
  autoDismissTimeout?: number;
  className?: string;
}

export default function AuthMessage({
  notice,
  type,
  title,
  message,
  fieldErrors,
  action,
  onDismiss,
  autoDismissTimeout,
  className = "",
}: AuthMessageProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  // Normalize notice data from either object or direct props
  let currentType: "error" | "success" | "info" | "warning" = type ?? "error";
  let currentTitle = title;
  let currentMessage = message ?? "";
  let currentFieldErrors = fieldErrors;
  let currentAction = action;

  if (typeof notice === "string" && notice.trim()) {
    currentMessage = notice;
    // Auto-detect type if not explicitly passed
    const lower = notice.toLowerCase();
    if (lower.includes("success") || lower.includes("created") || lower.includes("saved") || lower.includes("live")) {
      currentType = type ?? "success";
    } else if (lower.includes("not connected") || lower.includes("coming soon") || lower.includes("draft")) {
      currentType = type ?? "info";
    } else {
      currentType = type ?? "error";
    }
  } else if (notice && typeof notice === "object") {
    currentType = notice.type || currentType;
    currentTitle = notice.title || currentTitle;
    currentMessage = notice.message || currentMessage;
    currentFieldErrors = notice.fieldErrors || currentFieldErrors;
    currentAction = notice.action || currentAction;
  }

  const autoDismissMs =
    autoDismissTimeout ??
    (typeof notice === "object" && notice && typeof notice.autoDismiss === "number"
      ? notice.autoDismiss
      : typeof notice === "object" && notice && notice.autoDismiss === true
      ? 4000
      : undefined);

  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    setIsDismissing(false);

    const startExitTimer = setTimeout(() => {
      setIsDismissing(true);
    }, autoDismissMs);

    const finishDismissTimer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs + 280);

    return () => {
      clearTimeout(startExitTimer);
      clearTimeout(finishDismissTimer);
    };
  }, [autoDismissMs, onDismiss, currentTitle, currentMessage]);

  const hasContent = Boolean(
    currentMessage ||
    currentTitle ||
    (currentFieldErrors && Object.keys(currentFieldErrors).length > 0)
  );

  if (!hasContent) {
    return null;
  }

  // Visual styles per variant
  const variantStyles = {
    error: {
      container:
        "border-red-200/90 bg-red-50/95 text-red-950 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.15)] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100",
      iconWrap: "bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300 ring-2 ring-red-200/50 dark:ring-red-800/30",
      title: "text-red-900 dark:text-red-200 font-semibold",
      text: "text-red-800/90 dark:text-red-200/85",
      action: "text-red-900 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100 underline decoration-red-400 font-semibold",
      closeBtn: "text-red-500 hover:bg-red-100/70 dark:text-red-400 dark:hover:bg-red-900/40",
      bullet: "text-red-600 dark:text-red-400",
      IconComponent: AlertCircle,
    },
    success: {
      container:
        "border-emerald-200/90 bg-emerald-50/95 text-emerald-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100",
      iconWrap: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 ring-2 ring-emerald-200/50 dark:ring-emerald-800/30",
      title: "text-emerald-950 dark:text-emerald-200 font-semibold",
      text: "text-emerald-800/90 dark:text-emerald-200/85",
      action: "text-emerald-900 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-100 underline decoration-emerald-400 font-semibold",
      closeBtn: "text-emerald-600 hover:bg-emerald-100/70 dark:text-emerald-400 dark:hover:bg-emerald-900/40",
      bullet: "text-emerald-600 dark:text-emerald-400",
      IconComponent: CheckCircle2,
    },
    warning: {
      container:
        "border-amber-200/90 bg-amber-50/95 text-amber-950 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.15)] dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
      iconWrap: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 ring-2 ring-amber-200/50 dark:ring-amber-800/30",
      title: "text-amber-950 dark:text-amber-200 font-semibold",
      text: "text-amber-800/90 dark:text-amber-200/85",
      action: "text-amber-900 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-100 underline decoration-amber-400 font-semibold",
      closeBtn: "text-amber-600 hover:bg-amber-100/70 dark:text-amber-400 dark:hover:bg-amber-900/40",
      bullet: "text-amber-600 dark:text-amber-400",
      IconComponent: AlertTriangle,
    },
    info: {
      container:
        "border-[#dde1d8] bg-[#f2f5ed]/95 text-[#20271d] shadow-[0_4px_20px_-4px_rgba(47,74,42,0.08)] dark:border-white/10 dark:bg-[#182118]/80 dark:text-[#f4f4f0]",
      iconWrap: "bg-[#e2ead9] text-[#3b5934] dark:bg-[#283827] dark:text-[#b4ceaa] ring-2 ring-[#3b5934]/10 dark:ring-white/5",
      title: "text-[#20271d] dark:text-[#f4f4f0] font-semibold",
      text: "text-[#535d4f] dark:text-[#b7c1b4]",
      action: "text-[#2a4523] hover:text-[#182b13] dark:text-[#c4ddba] dark:hover:text-white underline decoration-[#3b5934]/40 font-semibold",
      closeBtn: "text-[#6c7668] hover:bg-black/5 dark:text-[#9ea89a] dark:hover:bg-white/10",
      bullet: "text-[#3b5934] dark:text-[#a5c29a]",
      IconComponent: Info,
    },
  };

  const style = variantStyles[currentType] || variantStyles.error;
  const Icon = style.IconComponent;

  // Flatten any structured field errors
  const errorEntries = currentFieldErrors ? Object.entries(currentFieldErrors) : [];

  const handleManualDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  return (
    <aside
      role={currentType === "error" ? "alert" : "status"}
      aria-live={currentType === "error" ? "assertive" : "polite"}
      className={`relative my-3.5 w-full overflow-hidden rounded-xl border px-3.5 py-3 transition-all duration-300 ease-out ${
        isDismissing ? "opacity-0 -translate-y-2 pointer-events-none scale-[0.99]" : ""
      } ${
        currentType === "error" ? "animate-auth-shake" : "animate-banner-in"
      } ${style.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Rounded Icon Badge */}
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform ${style.iconWrap}`}>
          <Icon size={16} strokeWidth={2.2} />
        </div>

        {/* Content Area */}
        <div className="min-w-0 flex-1 pr-1 text-xs">
          {currentTitle && (
            <h3 className={`text-[0.78rem] tracking-tight leading-4 ${style.title}`}>
              {currentTitle}
            </h3>
          )}

          {currentMessage && (
            <p className={`mt-0.5 text-[0.72rem] leading-relaxed ${style.text}`}>
              {currentMessage}
            </p>
          )}

          {/* Detailed field errors if returned from API */}
          {errorEntries.length > 0 && (
            <ul className="mt-2 space-y-1 text-[0.68rem]">
              {errorEntries.map(([field, err]) => {
                const text = Array.isArray(err) ? err.join(". ") : String(err);
                const fieldLabel = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <li key={field} className="flex items-start gap-1.5">
                    <span className={`mt-1 h-1 w-1 shrink-0 rounded-full ${style.bullet}`} />
                    <span>
                      <strong className="font-semibold">{fieldLabel}:</strong> {text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Action Link / Button (e.g. Forgot password? / Try another email) */}
          {currentAction && (
            <div className="mt-2">
              {currentAction.href ? (
                <Link
                  href={currentAction.href}
                  className={`inline-flex items-center text-[0.7rem] transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 ${style.action}`}
                >
                  {currentAction.label}
                  <span className="ml-1 text-[0.65rem]">&rarr;</span>
                </Link>
              ) : currentAction.onClick ? (
                <button
                  type="button"
                  onClick={currentAction.onClick}
                  className={`inline-flex items-center text-[0.7rem] transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 ${style.action}`}
                >
                  {currentAction.label}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={handleManualDismiss}
            aria-label="Dismiss alert"
            className={`-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${style.closeBtn}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Subtle Auto-dismiss Progress Bar */}
      {autoDismissMs && !isDismissing && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/5 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full ${
              currentType === "success"
                ? "bg-emerald-500/80 dark:bg-emerald-400"
                : currentType === "info"
                ? "bg-[#3b5934]/70 dark:bg-[#a5c29a]"
                : currentType === "warning"
                ? "bg-amber-500/80"
                : "bg-red-500/80"
            }`}
            style={{
              animation: `auth-progress ${autoDismissMs}ms linear forwards`,
            }}
          />
        </div>
      )}
    </aside>
  );
}
