"use client";

import { useParams } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import SessionChatPanel from "@/components/live-classes/SessionChatPanel";

export default function TeacherLiveClassPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <DashboardShell role="teacher">
      <div className="mx-auto grid w-full max-w-5xl gap-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <section className="rounded-lg border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-[#536447] dark:text-[#b9caa9]">Live class</p>
          <h1 className="mt-1 text-[18px] font-bold text-[#20261e] dark:text-[#edf1e9]">Teacher session room</h1>
          <p className="mt-2 text-[9px] leading-relaxed text-[#6c7469] dark:text-[#a0aa99]">Use this room chat to communicate with learners in this session. Audio and video are handled by the meeting link configured for the class.</p>
          <p className="mt-4 break-all rounded-md bg-[#f3f5ef] p-2 text-[8px] text-[#586354] dark:bg-[#20271e] dark:text-[#c1cbb9]">Session · {sessionId}</p>
        </section>
        <SessionChatPanel sessionId={sessionId} />
      </div>
    </DashboardShell>
  );
}