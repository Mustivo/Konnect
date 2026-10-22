"use client";

import React from "react";
import { Smartphone, UserCheck, UserX } from "lucide-react";
import { VisionProctorState } from "@/lib/vision/useVisionProctor";

interface LearnerEngagementBadgeProps {
  proctor: VisionProctorState;
  cameraOn: boolean;
}

export default function LearnerEngagementBadge({
  proctor,
  cameraOn,
}: LearnerEngagementBadgeProps) {
  if (!cameraOn) return null;

  const { status, violations } = proctor;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[7px] text-gray-300 backdrop-blur border border-white/10">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <span>AI Vision Syncing</span>
      </div>
    );
  }

  if (violations.cellPhone) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/25 px-2 py-0.5 text-[7px] font-semibold text-amber-300 backdrop-blur border border-amber-400/30 animate-pulse">
        <Smartphone size={9} />
        <span>Phone Detected</span>
      </div>
    );
  }

  if (violations.personAbsent) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2 py-0.5 text-[7px] font-semibold text-red-300 backdrop-blur border border-red-400/30">
        <UserX size={9} />
        <span>Away</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[7px] font-semibold text-emerald-300 backdrop-blur border border-emerald-500/30">
      <UserCheck size={9} />
      <span>Attentive</span>
    </div>
  );
}
