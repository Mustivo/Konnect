"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, CalendarDays, Plus } from "lucide-react";

type DashboardRole = "learner" | "teacher" | "admin";
const teacherPageHeaders: Record<string, { title: string; description: string; searchPlaceholder: string }> = {
  "/teacher/dashboard": { title: "Dashboard", description: "Overview of student approvals, class performance, notes & tasks", searchPlaceholder: "Search programs, assessments..." },
  "/teacher/student": { title: "Students Roster", description: "Manage enrolled learners and join requests for your classes.", searchPlaceholder: "Search students..." },
  "/teacher/activities": { title: "Activities", description: "Assignments and exams for your classes.", searchPlaceholder: "Search activities..." },
  "/teacher/activities/assignments": { title: "Assignments", description: "Practice, check understanding and keep learning on track.", searchPlaceholder: "Search assignments..." },
  "/teacher/activities/exams": { title: "Exams", description: "Thoughtful assessments. Clear expectations. Confident learners.", searchPlaceholder: "Search exams..." },
  "/teacher/analytics": { title: "Analytics", description: "See the progress. Spot the patterns. Support the next step.", searchPlaceholder: "Search analytics..." },
  "/teacher/messages": { title: "Messages", description: "A connected classroom starts with a conversation.", searchPlaceholder: "Search messages..." },
  "/teacher/settings": { title: "Settings", description: "Make Konnect feel right for you and your classroom.", searchPlaceholder: "Search settings..." },
};

export default function DashNav({ role = "learner", menuButton }: { role?: DashboardRole; menuButton?: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState("Today");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const isTeacherDashboard = isTeacher && pathname === "/teacher/dashboard";
  const teacherPageHeader = isTeacher ? teacherPageHeaders[pathname] : undefined;
  const destinations = useMemo(() => isAdmin ? [
    ["Dashboard", "/admin/dashboard"], ["Classes", "/admin/classes"], ["Teacher approvals", "/admin/approval"],
    ["Management", "/admin/management"], ["Analytics", "/admin/analytics"], ["Reports", "/admin/reports"], ["Settings", "/admin/settings"],
  ] : isTeacher ? [
    ["Dashboard", "/teacher/dashboard"], ["Classes", "/teacher/classes"], ["Attendance", "/teacher/attendance"], ["Students", "/teacher/student"],
    ["Assignments", "/teacher/activities/assignments"], ["Exams", "/teacher/activities/exams"], ["Analytics", "/teacher/analytics"],
    ["Messages", "/teacher/messages"], ["Settings", "/teacher/settings"],
  ] : [
    ["Dashboard", "/learner/dashboard"], ["Courses", "/learner/courses"], ["Live classes", "/learner/live_classes"],
    ["Calendar", "/learner/calender"], ["Assignments", "/learner/tasks/assignment"], ["Exams", "/learner/tasks/exams"],
    ["Attendance", "/learner/attendance"], ["Grades", "/learner/grades"], ["Resources", "/learner/resource"],
    ["Messages", "/learner/message"], ["Settings", "/learner/settings"],
  ], [isAdmin, isTeacher]);
  const filteredDestinations = destinations.filter(([label]) => label.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!search.trim()) return;
    const target = filteredDestinations[0];
    if (target) router.push(target[1]);
    setSearchOpen(false);
  }

  function renderSearch(placeholder: string, widthClass = "max-w-[335px]") {
    return <form onSubmit={submitSearch} role="search" className={`relative h-9 min-w-0 ${widthClass} flex-1`}>
      <Search size={13} className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#9ca3af] dark:text-[#788875]" />
      <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} placeholder={placeholder} aria-label="Search dashboard pages" aria-expanded={searchOpen && Boolean(search.trim())} className="h-9 w-full rounded-lg border border-[#e2e5dc] bg-white pl-[34px] pr-3 text-[13px] text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#9ca3af] focus:border-[#40522c] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea] dark:placeholder:text-[#6f7e6d] dark:focus:border-[#aee09f] transition-colors" />
      {searchOpen && search.trim() && <div className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-lg border border-[#e2e5dc] bg-white p-1 shadow-lg dark:border-[#303b2d] dark:bg-[#1b2419]">
        {filteredDestinations.length ? filteredDestinations.map(([label, href]) => <Link key={href} href={href} onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(""); setSearchOpen(false); }} className="block rounded px-3 py-2 text-[12px] text-[#263322] hover:bg-[#f1f4ed] dark:text-[#e1e8dc] dark:hover:bg-[#263123]">{label}</Link>) : <p className="px-3 py-2 text-[12px] text-[#687564]">No matching dashboard pages</p>}
      </div>}
    </form>;
  }

  useEffect(() => {
    if (isTeacher) return;

    const updateDate = () => setCurrentDate(new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date()));

    updateDate();
    const interval = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(interval);
  }, [isTeacher]);

  return (
    <header className={`${isTeacher ? "h-14 px-5" : "h-16 pl-3 pr-3"} flex min-w-0 items-center justify-between gap-3`}>
      {menuButton}
      {teacherPageHeader ? (
        <div className="min-w-0 flex-1 leading-tight">
          <h1 className="text-[20px] font-bold text-[#172115] dark:text-[#ecf1ea]">{teacherPageHeader.title}</h1>
          <p className="truncate text-[9px] text-[#707c6c] dark:text-[#9aa592]">{teacherPageHeader.description}</p>
        </div>
      ) : (
        renderSearch("Search dashboard pages...")
      )}

      <div className="flex shrink-0 items-center gap-2">
        {!isTeacher && <Link href={isAdmin ? "/admin/reports" : "/learner/calender"} aria-label={`Open calendar, current date: ${currentDate}`} title="Open calendar" className="flex h-8 min-w-[132px] items-center justify-center gap-1 whitespace-nowrap rounded-md border border-[#e4e7df] bg-white px-2.5 text-[12px] font-semibold text-[#40522c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#b4e3a8] transition-colors hover:bg-[#f5f7f2]">
          <CalendarDays size={13} />
          <span>{currentDate}</span>
        </Link>}

        {teacherPageHeader && renderSearch(teacherPageHeader.searchPlaceholder, "w-[min(260px,24vw)] min-w-[150px] max-w-none")}

        {isTeacher && (!teacherPageHeader || isTeacherDashboard) ? (
          <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => window.dispatchEvent(new Event("konnect-open-create-class"))} className="hidden h-8 items-center gap-1.5 rounded-md bg-[#23351f] px-3 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#182615] sm:flex">
            <Plus size={13} />
            <span>Create Class</span>
          </button>
            {isTeacherDashboard && <span className="hidden rounded-full bg-[#e5efdf] px-2 py-1 text-[8px] font-semibold text-[#405c35] sm:inline-flex dark:bg-[#263521] dark:text-[#c5d6b8]">3/3 Limit</span>}
          </div>
        ) : isAdmin ? (
          <button type="button" className="hidden h-8 items-center gap-1.5 rounded-md bg-[#23351f] px-3 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#182615] sm:flex">
            <Plus size={13} />
            <span>New Visitor</span>
          </button>
        ) : null}

        <Link href={isAdmin ? "/admin/settings?section=notifications" : isTeacher ? "/teacher/settings?tab=notifications" : "/learner/settings?section=notifications"} aria-label="Open notification settings" title="Notification settings" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e7df] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#f5f7f2] dark:border-[#212f1f] dark:bg-[#141d13] dark:hover:bg-[#1b2819]">
          <Bell size={15} className="text-[#40522c] dark:text-[#b4e3a8]" />
        </Link>

      </div>
    </header>
  );
}
