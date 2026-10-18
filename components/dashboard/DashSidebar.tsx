"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { currentUser, logout, type ApiUser } from "@/lib/api/auth";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout as logoutAction } from "@/lib/redux/slices/authSlice";
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
  LogOut,
  UserRound,
  BarChart3,
  Users,
  FileText,
} from "lucide-react";

/*
  left      = icon's left edge from the sidebar's left edge (px)
  marginTop = extra gap above the item (the screenshot's rhythm is uneven)
*/
type DashboardRole = "learner" | "teacher" | "admin";
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
  { name: "Classes", href: "/teacher/classes", icon: BookOpen, left: 20, marginTop: 1, badge: "3/3" },
  { name: "Attendance", href: "/teacher/attendance", icon: CalendarDays, left: 20, marginTop: 1 },
  { name: "Students Roster", href: "/teacher/student", icon: Users, left: 20, marginTop: 1 },
  { name: "Activities", href: "/teacher/activities", icon: ClipboardList, left: 20, marginTop: 0, nested: [
    { name: "Assignments", href: "/teacher/activities/assignments", icon: ClipboardList, left: 20 },
    { name: "Exams", href: "/teacher/activities/exams", icon: ClipboardList, left: 20 },
  ] },
  { name: "Analytics", href: "/teacher/analytics", icon: BarChart3, left: 20, marginTop: 1 },
  { name: "Messages", href: "/teacher/messages", icon: MessageSquare, left: 20, marginTop: 1, badge: "2" },
  { name: "Settings", href: "/teacher/settings", icon: Settings, left: 20, marginTop: 1 },
];

const adminMenuItems: MenuItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid, left: 20, marginTop: 0 },
  { name: "Classes", href: "/admin/classes", icon: BookOpen, left: 20, marginTop: 1 },
  { name: "Approval", href: "/admin/approval", icon: UserCheck, left: 20, marginTop: 1 },
  { name: "Management", href: "/admin/management", icon: Users, left: 20, marginTop: 1 },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, left: 20, marginTop: 0 },
  { name: "Reports", href: "/admin/reports", icon: FileText, left: 20, marginTop: 1 },
  { name: "Settings", href: "/admin/settings", icon: Settings, left: 20, marginTop: 1 },
];

export default function DashSidebar({ role = "learner", onNavigate }: { role?: DashboardRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const menuItems = isAdmin ? adminMenuItems : isTeacher ? teacherMenuItems : learnerMenuItems;
  const [tasksOpen, setTasksOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<{ name: string; href: string } | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      if (!window.localStorage.getItem("konnect-access-token")) return;
      currentUser().then(setUser).catch(() => setUser(null));
    };
    const handleUserUpdated = (event: Event) => {
      const updatedUser = (event as CustomEvent<ApiUser>).detail;
      if (updatedUser) setUser(updatedUser);
      else syncUser();
    };
    syncUser();
    window.addEventListener("konnect-user-updated", handleUserUpdated);
    return () => window.removeEventListener("konnect-user-updated", handleUserUpdated);
  }, []);

  useEffect(() => {
    setTasksOpen(pathname.startsWith("/learner/tasks") || (isTeacher && ["/teacher/activities/assignments", "/teacher/activities/exams"].includes(pathname)));
    setAccountMenuOpen(false);
  }, [isTeacher, pathname]);

  const displayName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name || user.username || "Learner" : isAdmin ? "Admin" : isTeacher ? "Teacher" : "Learner";
  const profile = {
    initials: displayName.split(/\s+/).slice(0, 2).map((part: string) => part[0]?.toUpperCase() ?? "").join("") || "K",
    name: displayName,
    meta: user?.email ?? (user ? String(user.role).toLowerCase() : "Account"),
  };
  const profileHref = isAdmin ? "/admin/settings" : isTeacher ? "/teacher/settings" : "/learner/settings?section=profile";
  const settingsHref = isAdmin ? "/admin/settings" : isTeacher ? "/teacher/settings" : "/learner/settings?section=account";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("konnect-refresh-token") : null;
    if (refreshToken) {
      logout(refreshToken).catch(() => {});
    }
    dispatch(logoutAction());
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("konnect-access-token");
      window.localStorage.removeItem("konnect-refresh-token");
      document.cookie = "konnect-access-token=; path=/; max-age=0; SameSite=Lax";
    }
    router.replace("/login?logged_out=1");
  }

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
              : role === "admin"
                ? (item.name === "Dashboard" && pathname.startsWith("/admin/dashboard")) ||
                    (item.name === "Analytics" && pathname.startsWith("/admin/analytics")) ||
                    (item.name === "Approval" && pathname.startsWith("/admin/approval")) ||
                    (item.name === "Classes" && pathname.startsWith("/admin/classes")) ||
                    (item.name === "Management" && pathname.startsWith("/admin/management")) ||
                    (item.name === "Reports" && pathname.startsWith("/admin/reports")) ||
                    (item.name === "Settings" && pathname.startsWith("/admin/settings"))
                : isTeacher
                  ? (item.name === "Dashboard" && pathname === "/teacher/dashboard") || (item.name === "Students Roster" && pathname === "/teacher/student") || (item.name === "Activities" && ["/teacher/activities", "/teacher/activities/assignments", "/teacher/activities/exams"].includes(pathname)) || (item.name === "Analytics" && pathname === "/teacher/analytics") || (item.name === "Messages" && pathname === "/teacher/messages") || (item.name === "Settings" && pathname === "/teacher/settings")
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
                      <span className="ml-[35px] flex-1 text-left text-[14px] font-medium leading-none">
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
                                <span className="text-[14px] font-semibold leading-none">{subItem.name}</span>
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
                  if (item.href.startsWith("/teacher/dashboard#")) {
                    window.dispatchEvent(new CustomEvent("konnect-dashboard-section", {
                      detail: item.href.split("#")[1],
                    }));
                  }
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

                <span className={`ml-[33px] text-[14px] ${isActive ? "font-bold" : "font-semibold"}`}>
                  {item.name}
                </span>
                {"badge" in item && item.badge ? (
                  <span className="ml-auto mr-3 rounded-full bg-[#f2f3ed] px-2 py-0.5 text-[12px] font-bold text-[#40522c] dark:bg-[#111510] dark:text-[#b4e3a8]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="relative mt-auto shrink-0 border-t border-[#dae3d0] p-3 dark:border-[#212f1f]">
        {accountMenuOpen && <div id="dashboard-account-menu" className="absolute bottom-[calc(100%-4px)] left-3 right-3 z-30 rounded-md border border-[#d5dfca] bg-white p-1.5 shadow-lg dark:border-[#303b2d] dark:bg-[#1b2419]">
          <Link href={profileHref} onClick={() => { setAccountMenuOpen(false); if (!isTeacher && !isAdmin) window.dispatchEvent(new CustomEvent("konnect-settings-section", { detail: "profile" })); }} className="flex min-h-9 items-center gap-2 rounded px-2 text-[14px] font-medium text-[#33412e] hover:bg-[#f1f4ed] dark:text-[#e1e8dc] dark:hover:bg-[#263123]">
            <UserRound size={13} /> View profile
          </Link>
          <Link href={settingsHref} onClick={() => { setAccountMenuOpen(false); if (!isTeacher && !isAdmin) window.dispatchEvent(new CustomEvent("konnect-settings-section", { detail: "account" })); }} className="flex min-h-9 items-center gap-2 rounded px-2 text-[14px] font-medium text-[#33412e] hover:bg-[#f1f4ed] dark:text-[#e1e8dc] dark:hover:bg-[#263123]">
            <Settings size={13} /> Account settings
          </Link>
          <button type="button" disabled={loggingOut} onClick={handleLogout} className="flex min-h-9 w-full items-center gap-2 rounded px-2 text-left text-[14px] font-medium text-[#9c3434] hover:bg-[#fbefed] disabled:opacity-60 dark:hover:bg-[#35211f]">
            <LogOut size={13} /> {loggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>}
        <button type="button" aria-expanded={accountMenuOpen} aria-controls="dashboard-account-menu" onClick={() => setAccountMenuOpen((open) => !open)} className="flex min-h-[48px] w-full items-center rounded px-1 text-left hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43] dark:hover:bg-white/[0.05]">
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#eaf0e3] text-[12px] font-semibold text-[#3a4a30] dark:bg-[#1e2d1d] dark:text-[#aee09f]">
            {profile.initials}
          </span>
          <span className="ml-2.5 min-w-0 flex-1 leading-none">
            <span className="block truncate text-[14px] font-semibold text-[#171d15] dark:text-[#ecf1ea]">{profile.name}</span>
            <span className="mt-[7px] block truncate text-[12px] text-[#67705f] dark:text-[#849480]">{profile.meta}</span>
          </span>
          <ChevronDown size={14} className={`shrink-0 text-[#444c3f] transition-transform dark:text-[#849480] ${accountMenuOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
    </aside>
  );
}
