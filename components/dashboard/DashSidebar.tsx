"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

/*
  left      = icon's left edge from the sidebar's left edge (px)
  marginTop = extra gap above the item (the screenshot's rhythm is uneven)
*/
const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, left: 17, marginTop: 0 },
  { name: "My Courses", href: "/dashboard/courses", icon: BookOpen, left: 20, marginTop: 3 },
  { name: "Live Classes", href: "/dashboard/live-classes", icon: Video, left: 20, marginTop: 5 },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, left: 17, marginTop: 2 },
  { name: "Assignments", href: "/dashboard/assignments", icon: ClipboardList, left: 20, marginTop: 0 },
  { name: "Attendance", href: "/learner", icon: UserCheck, left: 17, marginTop: 0 },
  { name: "Grades", href: "/dashboard/grades", icon: GraduationCap, left: 23, marginTop: 1 },
  { name: "Resources", href: "/learner/resource", icon: FolderOpen, left: 24, marginTop: 0 },
  { name: "Messages", href: "/learner/message", icon: MessageSquare, left: 26, marginTop: 0 },
  { name: "Settings", href: "/learner/settings", icon: Settings, left: 25, marginTop: 0 },
];

export default function DashSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[252px] flex-col rounded-l-[14px] bg-[#cddbbd]">
      {/* Logo block: first menu item starts 120px from the top */}
      <div className="h-[120px] shrink-0 pl-[64px] pt-[52px]">
        <Image
          src="/konnect-wordmark.png"
          alt="Konnect"
          width={80}
          height={34}
          priority
          className="h-[34px] w-[80px] object-contain object-left"
        />
      </div>

      {/* Menu: nothing selected, only hover */}
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.name === "Attendance" && pathname === "/learner/attendance");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                marginTop: item.marginTop,
                paddingLeft: item.left - 4,
              }}
              className={`ml-1 flex h-11 items-center rounded-l-lg transition-colors ${isActive ? "bg-[#f2f3ed] font-semibold text-[#40522c]" : "text-[#596052] hover:bg-[#f2f3ed] hover:text-[#40522c]"}`}
            >
              <Icon size={14} className="shrink-0" />

              <span className="ml-[35px] text-[11.5px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="mt-auto flex h-[77px] shrink-0 items-center border-t border-[#dae3d0] pl-4 pr-[15px]">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#eaf0e3] text-[10px] font-semibold text-[#3a4a30]">
          GT
        </div>

        <div className="ml-2.5 flex-1 leading-none">
          <p className="text-[11px] font-semibold text-[#171d15]">
            Gabriella Igabe
          </p>
          <p className="mt-[7px] text-[9.5px] text-[#67705f]">View Profile</p>
        </div>

        <ChevronDown size={14} className="text-[#444c3f]" />
      </div>
    </aside>
  );
}