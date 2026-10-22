"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { BookOpen, BriefcaseBusiness, CircleAlert, GraduationCap, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { getPendingAccounts, getPendingTeachers, type PendingAccount } from "@/lib/api/admin";
import { apiJson, apiRequest } from "@/lib/api/client";

type DashboardSummary = {
  verified_teachers: number;
  enrolled_learners: number;
  classes: number;
  live_now: number;
  waiting_rooms: number;
  verified_teacher_profiles: Array<{ id: string; name: string; email: string; subject: string; status: string }>;
  live_sessions: Array<{ id: string; class_name: string; teacher: string; status: string }>;
};

function InitialsPill({ initials }: { initials: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#20351e] text-[10px] font-bold text-white">
      {initials}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryUnavailable, setSummaryUnavailable] = useState(false);
  const [pendingTeacherCount, setPendingTeacherCount] = useState<number | null>(null);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[] | null>(null);

  useEffect(() => {
    apiRequest("/api/admin/dashboard/summary/")
      .then((response) => apiJson<DashboardSummary>(response))
      .then(setSummary)
      .catch(() => setSummaryUnavailable(true));
    getPendingTeachers().then((teachers) => setPendingTeacherCount(teachers.length)).catch(() => setPendingTeacherCount(null));
    getPendingAccounts().then(setPendingAccounts).catch(() => setPendingAccounts(null));
  }, []);

  const stats = [
    { label: "Verified teachers", value: summary ? String(summary.verified_teachers) : summaryUnavailable ? "Unavailable" : "—", note: "Verified teacher profiles in the database", icon: Users, tone: "bg-[#f4f7f2] text-[#34482f]" },
    { label: "Learners", value: summary ? String(summary.enrolled_learners) : summaryUnavailable ? "Unavailable" : "—", note: "Unique learners in enrollment records", icon: GraduationCap, tone: "bg-[#eef4ff] text-[#3b5f9d]" },
    { label: "Classes", value: summary ? String(summary.classes) : summaryUnavailable ? "Unavailable" : "—", note: "Class records in the database", icon: BookOpen, tone: "bg-[#f7f3ea] text-[#8d6b2f]" },
    { label: "Live now", value: summary ? String(summary.live_now) : summaryUnavailable ? "Unavailable" : "—", note: summary ? `${summary.waiting_rooms} waiting room${summary.waiting_rooms === 1 ? "" : "s"}` : "From live-session records", icon: MessageSquareText, tone: "bg-[#fdf1f4] text-[#ab5b6d]" },
  ];

  return (
    <DashboardShell role="admin">
      <div className="space-y-5 pb-8 pt-1">
        <header className="flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-[12px] font-medium leading-5 text-[#707c6c]">Admin</p>
            <h1 className="text-[26px] font-bold leading-8 tracking-[-0.03em] text-[#172115]">Dashboard</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#707c6c]">
              A clear view of your teachers, learners and classrooms.
            </p>
          </div>
          <div className="text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6d7a6c]">
            Wednesday, 14 October 2026 · London
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon, tone }) => (
            <article key={label} className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#687564]">{label}</p>
                  <p className="mt-1 text-[24px] font-bold leading-7 tracking-[0] text-[#172115]">{value}</p>
                  <p className="mt-1 text-[10px] text-[#85917f]">{note}</p>
                </div>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={15} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-[#f3dfe4] px-3 py-2.5 text-[#2b2d30] shadow-[0_1px_3px_rgba(21,32,18,0.04)]">
          <div className="flex items-center gap-2">
            <CircleAlert size={14} className="text-[#7f4b55]" />
            <p className="text-[11px] font-semibold">Incident needs your attention</p>
          </div>
          <p className="mt-1 text-[10px] text-[#5d4a4d]">
            Algeria · Class A · Ethos Brown · Disruption at chat 09:18. Teaching session was paused and is being tracked.
          </p>
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#35522b]" />
              <h2 className="text-[15px] font-bold text-[#172115]">Pending teacher approvals</h2>
            </div>
            <span className="rounded-full bg-[#fef4e8] px-2 py-1 text-[9px] font-bold text-[#b36a10]">{pendingTeacherCount === null ? "Unavailable" : `${pendingTeacherCount} pending`}</span>
          </div>

          <div className="rounded-lg border border-dashed border-[#dfe4dc] bg-[#fbfcfa] px-4 py-5 text-center">
            <p className="text-[11px] text-[#5a6758]">{pendingTeacherCount === null ? "Pending applications could not be loaded. Check your admin access." : pendingTeacherCount === 0 ? "There are no teacher applications waiting for review." : `${pendingTeacherCount} teacher ${pendingTeacherCount === 1 ? "application is" : "applications are"} waiting for review.`}</p>
            <Link href="/admin/approval" className="mt-3 inline-flex rounded-md bg-[#23351f] px-3 py-1.5 text-[10px] font-semibold text-white">Review applications</Link>
          </div>

        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[#172115]">Pending accounts</h2>
              <p className="mt-1 text-[10px] text-[#687564]">Accounts waiting for administrator review.</p>
            </div>
            <span className="rounded-full bg-[#fef4e8] px-2 py-1 text-[9px] font-bold text-[#b36a10]">
              {pendingAccounts === null ? "Unavailable" : `${pendingAccounts.length} pending`}
            </span>
          </div>
          {pendingAccounts === null ? (
            <p className="rounded-lg border border-dashed border-[#dfe4dc] bg-[#fbfcfa] px-4 py-5 text-center text-[11px] text-[#5a6758]">
              Pending accounts could not be loaded. Check your admin access.
            </p>
          ) : pendingAccounts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#dfe4dc] bg-[#fbfcfa] px-4 py-5 text-center text-[11px] text-[#5a6758]">
              No pending accounts were returned by the backend.
            </p>
          ) : (
            <div className="divide-y divide-[#eef1eb]">
              {pendingAccounts.map((account) => (
                <div key={account.id || account.email} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-1 last:pb-1">
                  <div>
                    <p className="text-[11px] font-bold text-[#172115]">{account.name}</p>
                    <p className="mt-1 text-[10px] text-[#687564]">{account.email || "Email not provided"} · {account.role}</p>
                  </div>
                  <span className="rounded-full bg-[#fef4e8] px-2 py-1 text-[9px] font-semibold text-[#8d5d19]">{account.status}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[10px] text-[#687564]">Teacher profile review and approval actions are on the <Link href="/admin/approval" className="font-semibold text-[#35522b] hover:underline">Teacher Approvals</Link> page.</p>
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={14} className="text-[#35522b]" />
              <h2 className="text-[15px] font-bold text-[#172115]">Live classrooms</h2>
            </div>
            <span className="rounded-full bg-[#edf4e8] px-2 py-1 text-[9px] font-bold text-[#2b5a2d]">{summary ? `${summary.live_sessions.length} live` : summaryUnavailable ? "Unavailable" : "Loading"}</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e2e7dd]">
            <div className="grid grid-cols-[1.5fr_1.1fr_0.8fr] bg-[#f4f6f1] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#687564]">
              <span>Class</span>
              <span>Teacher</span>
              <span className="text-right">Status</span>
            </div>

            {summary?.live_sessions.map((room) => (
              <div key={room.id} className="grid grid-cols-[1.5fr_1.1fr_0.8fr] items-center gap-3 border-t border-[#e2e7dd] bg-white px-3 py-3 text-[11px]">
                <div className="font-bold text-[#172115]">{room.class_name}</div>
                <div className="flex items-center gap-2">
                  <InitialsPill initials={room.teacher.split(" ").map((part) => part[0]).join("").slice(0, 2)} />
                  <span className="font-semibold text-[#172115]">{room.teacher}</span>
                </div>
                <div className="text-right"><span className="rounded-full bg-[#edf4e8] px-2 py-1 text-[9px] font-bold text-[#2b5a2d]">{room.status}</span></div>
              </div>
            ))}
            {summary && summary.live_sessions.length === 0 && <p className="border-t border-[#e2e7dd] px-3 py-4 text-center text-[11px] text-[#687564]">No live sessions are recorded right now.</p>}
            {!summary && <p className="border-t border-[#e2e7dd] px-3 py-4 text-center text-[11px] text-[#687564]">{summaryUnavailable ? "Live session records are unavailable." : "Loading live session records…"}</p>}
          </div>
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#35522b]" />
              <h2 className="text-[15px] font-bold text-[#172115]">Verified Teachers</h2>
            </div>
            <span className="rounded-full bg-[#edf4e8] px-2 py-1 text-[9px] font-bold text-[#2b5a2d]">{summary ? `${summary.verified_teacher_profiles.length} verified` : summaryUnavailable ? "Unavailable" : "Loading"}</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e2e7dd]">
            <div className="grid grid-cols-[1.4fr_1.2fr_0.8fr] bg-[#f4f6f1] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#687564]">
              <span>Teacher</span>
              <span>Subject</span>
              <span className="text-right">Status</span>
            </div>

            {summary?.verified_teacher_profiles.map((teacher) => (
              <div key={teacher.id} className="grid grid-cols-[1.4fr_1.2fr_0.8fr] items-center gap-3 border-t border-[#e2e7dd] bg-white px-3 py-3 text-[11px]">
                <div className="flex items-center gap-2.5">
                  <InitialsPill initials={teacher.name.split(" ").map((part) => part[0]).join("").slice(0, 2)} />
                  <div>
                    <p className="font-bold text-[#172115]">{teacher.name}</p>
                    <p className="text-[10px] text-[#6d766d]">{teacher.email}</p>
                  </div>
                </div>
                <div className="text-[#3a463a] font-medium">{teacher.subject}</div>
                <div className="flex justify-end">
                  <span className="rounded-full bg-[#edf4e8] px-2 py-0.5 text-[9px] font-bold text-[#2b5a2d]">{teacher.status}</span>
                </div>
              </div>
            ))}
            {summary && summary.verified_teacher_profiles.length === 0 && <p className="border-t border-[#e2e7dd] px-3 py-4 text-center text-[11px] text-[#687564]">No verified teacher profiles are recorded.</p>}
            {!summary && <p className="border-t border-[#e2e7dd] px-3 py-4 text-center text-[11px] text-[#687564]">{summaryUnavailable ? "Teacher records are unavailable." : "Loading verified teacher records…"}</p>}
          </div>
        </section>

        <div className="rounded-xl border border-[#e2e7dd] bg-[#edf1e7] px-3 py-2 text-[10px] text-[#536350]">
          Every learning moment, safely kept.
        </div>
      </div>
    </DashboardShell>
  );
}
