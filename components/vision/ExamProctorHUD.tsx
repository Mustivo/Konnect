"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Users,
  UserX,
  BookOpen,
  X,
  History,
  AlertTriangle,
} from "lucide-react";
import { VisionProctorState } from "@/lib/vision/useVisionProctor";

interface ExamProctorHUDProps {
  proctor: VisionProctorState;
  tabSwitchDetected?: boolean;
}

export default function ExamProctorHUD({
  proctor,
  tabSwitchDetected = false,
}: ExamProctorHUDProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const { status, activeAlert, violations, incidentLog, clearActiveAlert } = proctor;

  const totalIncidents = incidentLog.length + (tabSwitchDetected ? 1 : 0);
  const hasActiveWarning =
    status === "warning" ||
    violations.cellPhone ||
    violations.multiplePeople ||
    violations.personAbsent ||
    violations.prohibitedMaterial ||
    !!activeAlert;

  return (
    <>
      {/* 1. Header Mini Badge */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          title="Click to view Proctoring Integrity Log"
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold transition border ${
            hasActiveWarning
              ? "border-amber-400/50 bg-amber-50 text-amber-800 animate-pulse"
              : status === "monitoring"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : status === "loading"
              ? "border-gray-200 bg-gray-50 text-gray-600"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {hasActiveWarning ? (
            <ShieldAlert size={12} className="text-amber-600" />
          ) : (
            <ShieldCheck size={12} className="text-emerald-600" />
          )}

          <span>
            {status === "loading"
              ? "AI Proctor Starting..."
              : hasActiveWarning
              ? "Proctor Warning Active"
              : "AI Proctor Active"}
          </span>

          {totalIncidents > 0 && (
            <span className="ml-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-amber-200 px-1 text-[8px] font-bold text-amber-900">
              {totalIncidents}
            </span>
          )}
        </button>
      </div>

      {/* 2. Floating Warning Banner (Appears when active violation is detected) */}
      {hasActiveWarning && (
        <div
          role="alert"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] w-full max-w-lg px-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-[#fffbeb] p-3 shadow-lg text-amber-950">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-800">
                {violations.cellPhone ? (
                  <Smartphone size={16} />
                ) : violations.multiplePeople ? (
                  <Users size={16} />
                ) : violations.personAbsent ? (
                  <UserX size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold leading-tight">
                  {violations.cellPhone
                    ? "Mobile Phone Detected"
                    : violations.multiplePeople
                    ? "Multiple People Detected"
                    : violations.personAbsent
                    ? "Face Not Visible"
                    : violations.prohibitedMaterial
                    ? "Unauthorized Material"
                    : "Exam Integrity Notice"}
                </p>
                <p className="text-[9px] text-amber-800 truncate">
                  {activeAlert ||
                    "Please keep your face centered and remove external devices."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearActiveAlert}
              className="rounded p-1 text-amber-800 hover:bg-amber-200/60"
              aria-label="Dismiss banner"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Incident History Modal */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowLogModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="integrity-log-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <h3
                    id="integrity-log-title"
                    className="text-sm font-bold text-gray-900"
                  >
                    AI Proctor Integrity Log
                  </h3>
                  <p className="text-[9px] text-gray-500">
                    Recorded during this active exam session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={15} />
              </button>
            </div>

            {/* Incident Summary */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-gray-50 p-2.5 text-center border border-gray-100">
                <span className="block text-[8px] font-semibold uppercase text-gray-500">
                  Phone
                </span>
                <span className="text-base font-bold text-gray-900">
                  {proctor.stats.phoneIncidents}
                </span>
              </div>
              <div className="rounded-xl bg-gray-50 p-2.5 text-center border border-gray-100">
                <span className="block text-[8px] font-semibold uppercase text-gray-500">
                  Multiple Faces
                </span>
                <span className="text-base font-bold text-gray-900">
                  {proctor.stats.multiplePeopleIncidents}
                </span>
              </div>
              <div className="rounded-xl bg-gray-50 p-2.5 text-center border border-gray-100">
                <span className="block text-[8px] font-semibold uppercase text-gray-500">
                  Absence
                </span>
                <span className="text-base font-bold text-gray-900">
                  {proctor.stats.absentIncidents}
                </span>
              </div>
            </div>

            {/* List of events */}
            <div className="mt-4 max-h-56 overflow-y-auto space-y-2 pr-1">
              {tabSwitchDetected && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-2 text-red-900">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-600" />
                  <div className="text-[9px]">
                    <p className="font-semibold">Browser tab switch detected</p>
                    <p className="text-red-700 text-[8px]">Student navigated away from exam tab</p>
                  </div>
                </div>
              )}

              {incidentLog.length === 0 && !tabSwitchDetected ? (
                <div className="py-6 text-center text-gray-400">
                  <ShieldCheck size={28} className="mx-auto text-emerald-500 opacity-60 mb-2" />
                  <p className="text-[10px] font-medium text-gray-600">No violations recorded</p>
                  <p className="text-[8px] text-gray-400">Environment clean and verified</p>
                </div>
              ) : (
                incidentLog.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 text-[9px]"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-amber-600">
                        {inc.type === "cell_phone" ? (
                          <Smartphone size={12} />
                        ) : inc.type === "multiple_people" ? (
                          <Users size={12} />
                        ) : inc.type === "person_absent" ? (
                          <UserX size={12} />
                        ) : (
                          <BookOpen size={12} />
                        )}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{inc.message}</p>
                        <p className="text-[8px] text-gray-500">
                          Confidence: {inc.confidence}%
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[8px] text-gray-400 tabular-nums">
                      {inc.timeFormatted}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="h-8 rounded-lg bg-gray-900 px-4 text-[10px] font-medium text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
