"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { Activity, BookOpen, GraduationCap, Users } from "lucide-react";

const metrics = [
  { label: "Total learners", value: "1,248", change: "+86 this week", icon: GraduationCap, tone: "bg-[#eef4ff] text-[#3b5f9d]" },
  { label: "Verified teachers", value: "1", change: "Mutiti Stivo", icon: Users, tone: "bg-[#f4f7f2] text-[#34482f]" },
  { label: "Courses", value: "15", change: "Assigned to Mutiti Stivo", icon: BookOpen, tone: "bg-[#f7f3ea] text-[#8d6b2f]" },
  { label: "Platform attendance", value: "92.9%", change: "Across recorded sessions", icon: Activity, tone: "bg-[#fdf1f4] text-[#ab5b6d]" },
];

const weeklyActivity = [
  { day: "Mon", learners: 74, classes: 62 },
  { day: "Tue", learners: 82, classes: 70 },
  { day: "Wed", learners: 91, classes: 76 },
  { day: "Thu", learners: 68, classes: 58 },
  { day: "Fri", learners: 96, classes: 84 },
  { day: "Sat", learners: 46, classes: 35 },
  { day: "Sun", learners: 30, classes: 22 },
];

const topClasses = [
  { name: "Algebra I · Class A", teacher: "Mutiti Stivo", attendance: "96.4%" },
  { name: "Biology · Class D", teacher: "Mutiti Stivo", attendance: "93.8%" },
  { name: "Geometry · Class B", teacher: "Mutiti Stivo", attendance: "91.2%" },
];

export default function AdminAnalyticsPage() {
  return (
    <DashboardShell role="admin">
      <div className="space-y-5 pb-8 pt-1">
        <header>
          <p className="text-[12px] font-medium leading-5 text-[#707c6c]">Admin</p>
          <h1 className="text-[26px] font-bold leading-8 tracking-[-0.03em] text-[#172115] dark:text-[#ecf1ea]">Analytics</h1>
          <p className="mt-1 text-[10px] text-[#707c6c] dark:text-[#9aa592]">
            A snapshot of learner, teacher and class activity across Konnect.
          </p>
        </header>

        <section aria-label="Platform metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, change, icon: Icon, tone }) => (
            <article key={label} className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#687564] dark:text-[#a4af9e]">{label}</p>
                  <p className="mt-1 text-[24px] font-bold leading-7 text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                  <p className="mt-1 text-[10px] text-[#85917f] dark:text-[#9aa592]">{change}</p>
                </div>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={15} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">Weekly platform activity</h2>
              <p className="mt-1 text-[10px] text-[#687564] dark:text-[#a4af9e]">Learner participation and completed classes</p>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-[#687564] dark:text-[#a4af9e]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#35522b]" />Learners</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#b8c9a7]" />Classes</span>
            </div>
          </div>
          <div className="mt-5 grid h-44 grid-cols-7 items-end gap-2 border-b border-[#edf0e9] pb-2 dark:border-[#2a312a]">
            {weeklyActivity.map((item) => (
              <div key={item.day} className="flex h-full flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full max-w-12 items-end justify-center gap-1">
                  <span className="w-2/5 rounded-t bg-[#35522b]" style={{ height: `${item.learners}%` }} />
                  <span className="w-2/5 rounded-t bg-[#b8c9a7]" style={{ height: `${item.classes}%` }} />
                </div>
                <span className="text-[9px] text-[#687564] dark:text-[#a4af9e]">{item.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="mb-3">
            <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">Class attendance</h2>
            <p className="mt-1 text-[10px] text-[#687564] dark:text-[#a4af9e]">Attendance overview for active classes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-[10px]">
              <thead className="bg-[#f4f6f1] text-[9px] font-bold uppercase tracking-[0.06em] text-[#687564] dark:bg-[#20271e] dark:text-[#a4af9e]">
                <tr>
                  <th className="rounded-l-md px-3 py-2.5">Class</th>
                  <th className="px-3 py-2.5">Teacher</th>
                  <th className="rounded-r-md px-3 py-2.5">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {topClasses.map((item) => (
                  <tr key={item.name} className="border-b border-[#edf0e9] last:border-0 dark:border-[#2a312a]">
                    <td className="px-3 py-3 font-semibold text-[#35402f] dark:text-[#e1e8dc]">{item.name}</td>
                    <td className="px-3 py-3 text-[#687564] dark:text-[#a4af9e]">{item.teacher}</td>
                    <td className="px-3 py-3 font-semibold text-[#405c35] dark:text-[#c5d6b8]">{item.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
