"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  BookOpen,
  Video,
  CalendarDays,
  ClipboardList,
  UserCheck,
  GraduationCap,
  FolderOpen,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Users,
} from "lucide-react";

/*
  left      = icon's left edge from the sidebar's left edge (px)
  marginTop = extra gap above the item (the screenshot's rhythm is uneven)
*/
type DashboardRole = "learner" | "teacher";
type MenuItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  left: number;
  marginTop?: number;
  badge?: string;
  nested?: Array<{
    name: string;
    href: string;
    icon: LucideIcon;
    left: number;
  }>;
};

const learnerMenuItems: MenuItem[] = [
  { name: "Dashboard", href: "/learner/dashboard", icon: LayoutGrid, left: 20, marginTop: 0 },
  { name: "My Courses", href: "/learner/courses", icon: BookOpen, left: 20, marginTop: 1 },
  { name: "Live Classes", href: "/learner/live_classes", icon: Video, left: 20, marginTop: 2 },
  { name: "Calendar", href: "/learner/calender", icon: CalendarDays, left: 20, marginTop: 1 },
  { name: "Tasks", href: "/learner/resource", icon: ClipboardList, left: 20, marginTop: 0, nested: [
    { name: "Assignments", href: "/learner/tasks/assignment", icon: ClipboardList, left: 20 },
    { name: "Exams", href: "/learner/tasks/exams", icon: ClipboardList, left: 20 },
  ] },
  { name: "Attendance", href: "/learner/attendance", icon: UserCheck, left: 20, marginTop: 1 },
  { name: "Grades", href: "/learner/grades", icon: GraduationCap, left: 20, marginTop: 1 },
  { name: "Resources", href: "/learner/resource", icon: FolderOpen, left: 20, marginTop: 1 },
  { name: "Messages", href: "/learner/message", icon: MessageSquare, left: 20, marginTop: 1 },
  { name: "Settings", href: "/learner/settings", icon: Settings, left: 20, marginTop: 1 },
];

const teacherMenuItems: MenuItem[] = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutGrid, left: 20, marginTop: 0 },
  { name: "Classes", href: "/teacher/dashboard#classes", icon: BookOpen, left: 20, marginTop: 1, badge: "3/3" },
  { name: "Attendance", href: "/teacher/dashboard#attendance", icon: CalendarDays, left: 20, marginTop: 1 },
  { name: "Students Roster", href: "/teacher/dashboard#students", icon: Users, left: 20, marginTop: 1 },
  { name: "Activities", href: "/teacher/dashboard#activities", icon: ClipboardList, left: 20, marginTop: 0, nested: [
    { name: "Assignments", href: "/teacher/assignments", icon: ClipboardList, left: 20 },
    { name: "Approvals", href: "/teacher/dashboard#approvals", icon: UserCheck, left: 20 },
  ] },
  { name: "Grades & Reports", href: "/teacher/dashboard#reports", icon: GraduationCap, left: 20, marginTop: 1 },
  { name: "Analytics", href: "/teacher/dashboard#analytics", icon: BarChart3, left: 20, marginTop: 1 },
  { name: "Messages", href: "/teacher/dashboard#messages", icon: MessageSquare, left: 20, marginTop: 1, badge: "2" },
  { name: "Settings", href: "/teacher/dashboard#settings", icon: Settings, left: 20, marginTop: 1 },
];

export default function DashSidebar({ role = "learner", onNavigate }: { role?: DashboardRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isTeacher = role === "teacher";
  const menuItems = isTeacher ? teacherMenuItems : learnerMenuItems;
  const [tasksOpen, setTasksOpen] = useState(() => !isTeacher && pathname.startsWith("/learner/tasks"));
  const [activeLink, setActiveLink] = useState<{ name: string; href: string } | null>(null);

  useEffect(() => {
    setTasksOpen(pathname.startsWith("/learner/tasks") || (isTeacher && pathname === "/teacher/assignments"));
  }, [isTeacher, pathname]);

  const profile = isTeacher
    ? { initials: "EF", name: "Edna Francis", meta: "Lead Mathematics Teacher" }
    : { initials: "GT", name: "Gabriella Igabe", meta: "View Profile" };

  return (
    <aside className="flex h-full w-[min(252px,85vw)] flex-col overflow-hidden rounded-l-[14px] bg-[#cddbbd] dark:bg-[#152014] dark:border-r dark:border-[#212f1f] transition-colors md:w-[252px]">
      <div className="h-[92px] shrink-0 pl-[64px] pt-[28px]">
        <Image
          src="/konnect-wordmark.png"
          alt="Konnect"
          width={80}
          height={34}
          priority
          className="h-[34px] w-[80px] object-contain object-left dark:brightness-0 dark:invert transition-all"
        />
      </div>

      <nav className="learner-sidebar-nav min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-[2px] py-1 font-weight-bold ">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const normalizedHref = item.href.split("#")[0];
            const selectedLinkName = activeLink?.href === pathname ? activeLink.name : null;
            const isNestedItemActive = item.nested?.some((subItem) => subItem.name === selectedLinkName) ?? false;
            const isActive = selectedLinkName
              ? selectedLinkName === item.name || isNestedItemActive
              : isTeacher
                ? (item.name === "Dashboard" && pathname === "/teacher/dashboard") || (item.name === "Activities" && pathname === "/teacher/assignments")
                : (item.name === "Dashboard" && (pathname === "/learner" || pathname === "/learner/dashboard")) ||
                (item.name === "My Courses" && pathname.startsWith("/learner/courses")) ||
                (item.name === "Live Classes" && pathname === "/learner/live_classes") ||
                (item.name === "Attendance" && pathname === "/learner/attendance") ||
                (item.name === "Resources" && pathname === "/learner/resource") ||
                (item.name === "Messages" && pathname === "/learner/message") ||
                (item.name === "Settings" && pathname === "/learner/settings");

            if (item.nested) {
              return (
                  <div key={item.name} className="pt-0">
                    <button
                      type="button"
                      onClick={() => setTasksOpen((open) => !open)}
                      aria-expanded={tasksOpen}
                      className="ml-1 flex h-10 w-[calc(100%-0.25rem)] items-center rounded-l-lg px-[18px] text-[#596052] transition-colors hover:bg-[#f2f3ed] hover:text-[#40522c] dark:text-[#849480] dark:hover:bg-[#141b13] dark:hover:text-[#ecf1ea]"
                      style={{ marginTop: item.marginTop }}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span className="ml-[35px] flex-1 text-left text-[11.5px] font-medium leading-none">
                        {item.name}
                      </span>
                      <ChevronRight
                        size={12}
                        className={`mr-1 transition-transform ${tasksOpen ? "rotate-90" : "rotate-0"}`}
                      />
                    </button>

                    {tasksOpen && (
                      <div className="pb-1 pl-[42px] pt-[2px]">
                        {item.nested?.map((subItem) => (
                          (() => {
                            const subItemPath = subItem.href.split("#")[0];
                            const isSubItemActive = activeLink?.href === pathname
                              ? activeLink.name === subItem.name
                              : pathname === subItemPath && (!isTeacher || subItemPath !== "/teacher/dashboard");
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                aria-current={isSubItemActive ? "page" : undefined}
                                onClick={() => {
                                  setActiveLink({ name: subItem.name, href: subItem.href });
                                  onNavigate?.();
                                }}
                                className={`flex h-8 items-center rounded-l-lg px-2 transition-colors ${isSubItemActive
                                  ? "bg-[#f2f3ed] font-bold text-[#40522c] dark:bg-[#111510] dark:text-[#e4efe0]"
                                  : "text-[#596052] hover:bg-[#f2f3ed] hover:text-[#40522c] dark:text-[#849480] dark:hover:bg-[#141b13] dark:hover:text-[#ecf1ea]"
                                }`}
                              >
                                <span className="text-[11.5px] font-semibold leading-none">{subItem.name}</span>
                              </Link>
                            );
                          })()
                        ))}
                      </div>
                    )}
                  </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setActiveLink({ name: item.name, href: normalizedHref });
                  onNavigate?.();
                }}
                style={{
                  marginTop: item.marginTop,
                  paddingLeft: item.left - 4,
                }}
                className={`ml-1 flex items-center transition-colors ${
                  isActive
                    ? "h-12 rounded-l-md rounded-r-none bg-[#f2f3ed] font-semibold text-[#40522c] dark:bg-[#111510] dark:text-[#e4efe0] dark:font-semibold"
                    : "h-11 rounded-l-lg text-[#596052] hover:bg-[#f2f3ed] hover:text-[#40522c] dark:text-[#849480] dark:hover:bg-[#141b13] dark:hover:text-[#ecf1ea]"
                }`}
              >
                <Icon size={14} className="shrink-0" />

                <span className={`ml-[33px] text-[11.5px] ${isActive ? "font-bold" : "font-semibold"}`}>
                  {item.name}
                </span>
                {"badge" in item && item.badge ? (
                  <span className="ml-auto mr-3 rounded-full bg-[#f2f3ed] px-2 py-0.5 text-[9px] font-bold text-[#40522c] dark:bg-[#111510] dark:text-[#b4e3a8]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto flex h-[77px] shrink-0 items-center border-t border-[#dae3d0] pl-4 pr-[15px] dark:border-[#212f1f] transition-colors">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#eaf0e3] text-[10px] font-semibold text-[#3a4a30] dark:bg-[#1e2d1d] dark:text-[#aee09f]">
          {profile.initials}
        </div>

        <div className="ml-2.5 flex-1 leading-none">
          <p className="text-[11px] font-semibold text-[#171d15] dark:text-[#ecf1ea]">
            {profile.name}
          </p>
          <p className="mt-[7px] text-[9.5px] text-[#67705f] dark:text-[#849480]">
            {profile.meta}
          </p>
        </div>

        <ChevronDown size={14} className="text-[#444c3f] dark:text-[#849480]" />
      </div>
    </aside>
  );
}
