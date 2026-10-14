"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { BookOpen, BriefcaseBusiness, CircleAlert, GraduationCap, MessageSquareText, ShieldCheck, Users } from "lucide-react";

const stats = [
  { label: "Teachers", value: "24", note: "4 applications pending", icon: Users, tone: "bg-[#f4f7f2] text-[#34482f]" },
  { label: "Learners", value: "1,248", note: "86 this week", icon: GraduationCap, tone: "bg-[#eef4ff] text-[#3b5f9d]" },
  { label: "Classes", value: "62", note: "Across 24 teachers", icon: BookOpen, tone: "bg-[#f7f3ea] text-[#8d6b2f]" },
  { label: "Live now", value: "2", note: "1 waiting room", icon: MessageSquareText, tone: "bg-[#fdf1f4] text-[#ab5b6d]" },
];

const approvals = [
  { initials: "SC", name: "Sarah Chen", subject: "Mathematics", date: "13 Oct 2026" },
  { initials: "JW", name: "James Wilson", subject: "Science", date: "13 Oct 2026" },
  { initials: "AY", name: "Amina Yusuf", subject: "English", date: "13 Oct 2026" },
  { initials: "DB", name: "Daniel Brooks", subject: "History", date: "13 Oct 2026" },
];

const liveClasses = [
  { className: "Algebra - Class A", teacher: "Edna Francis", learners: "28/100", status: "Live" },
  { className: "Biology - Class D", teacher: "Michael Reed", learners: "32/100", status: "Live" },
];

function InitialsPill({ initials }: { initials: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#20351e] text-[10px] font-bold text-white">
      {initials}
    </span>
  );
}

export default function AdminDashboardPage() {
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
            <span className="rounded-full bg-[#fef4e8] px-2 py-1 text-[9px] font-bold text-[#b36a10]">4 pending</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e2e7dd]">
            <div className="grid grid-cols-[1.4fr_1fr_0.8fr] bg-[#f4f6f1] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#687564]">
              <span>Teacher</span>
              <span>Submitted</span>
              <span className="text-right">Actions</span>
            </div>

            {approvals.map((teacher) => (
              <div key={teacher.name} className="grid grid-cols-[1.4fr_1fr_0.8fr] items-center gap-3 border-t border-[#e2e7dd] bg-white px-3 py-3 text-[11px]">
                <div className="flex items-center gap-2.5">
                  <InitialsPill initials={teacher.initials} />
                  <div>
                    <p className="font-bold text-[#172115]">{teacher.name}</p>
                    <p className="text-[10px] text-[#6d766d]">{teacher.subject}</p>
                  </div>
                </div>
                <div className="text-[#5a6758]">{teacher.date}</div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="rounded-md bg-[#23351f] px-3 py-1.5 text-[10px] font-semibold text-white">Approve</button>
                  <button type="button" className="rounded-md border border-[#dfe4dc] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#5a6758]">Reject</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button type="button" className="text-[10px] font-semibold text-[#35522b]">View all applications →</button>
          </div>
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={14} className="text-[#35522b]" />
              <h2 className="text-[15px] font-bold text-[#172115]">Live classrooms</h2>
            </div>
            <span className="rounded-full bg-[#edf4e8] px-2 py-1 text-[9px] font-bold text-[#2b5a2d]">2 live</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e2e7dd]">
            <div className="grid grid-cols-[1.5fr_1.1fr_0.8fr_0.7fr] bg-[#f4f6f1] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#687564]">
              <span>Class</span>
              <span>Teacher</span>
              <span>Learners</span>
              <span className="text-right">Action</span>
            </div>

            {liveClasses.map((room) => (
              <div key={room.className} className="grid grid-cols-[1.5fr_1.1fr_0.8fr_0.7fr] items-center gap-3 border-t border-[#e2e7dd] bg-white px-3 py-3 text-[11px]">
                <div className="font-bold text-[#172115]">{room.className}</div>
                <div className="flex items-center gap-2">
                  <InitialsPill initials={room.teacher.split(" ").map((part) => part[0]).join("").slice(0, 2)} />
                  <span className="text-[#4a564a]">{room.teacher}</span>
                </div>
                <div className="text-[#4a564a]">{room.learners}</div>
                <div className="flex items-center justify-end gap-2">
                  <span className="rounded-full bg-[#edf4e8] px-2 py-1 text-[9px] font-bold text-[#2b5a2d]">{room.status}</span>
                  <button type="button" className="rounded-md border border-[#dfe4dc] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#5a6758]">Join</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-xl border border-[#e2e7dd] bg-[#edf1e7] px-3 py-2 text-[10px] text-[#536350]">
          Every learning moment, safely kept.
        </div>
      </div>
    </DashboardShell>
  );
}
