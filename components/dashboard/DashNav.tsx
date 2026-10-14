"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, CalendarDays } from "lucide-react";

export default function DashNav() {
  const [currentDate, setCurrentDate] = useState("Today");

  useEffect(() => {
    const updateDate = () => setCurrentDate(new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date()));

    updateDate();
    const interval = window.setInterval(updateDate, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex h-16 min-w-0 items-center justify-between gap-3 pl-3 pr-3">
      <div className="relative h-9 min-w-0 max-w-[335px] flex-1">
        <Search
          size={13}
          className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#9ca3af] dark:text-[#788875]"
        />

        <input
          type="text"
          placeholder="Search courses, topics, teachers..."
          className="h-9 w-full rounded-lg border border-[#e2e5dc] bg-white pl-[34px] pr-3 text-[13px] text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#9ca3af] focus:border-[#40522c] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea] dark:placeholder:text-[#6f7e6d] dark:focus:border-[#aee09f] transition-colors"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-label={`Current date: ${currentDate}`} className="flex h-8 min-w-[132px] items-center justify-center gap-1 whitespace-nowrap rounded-md border border-[#e4e7df] bg-white px-2.5 text-[12px] font-semibold text-[#40522c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#b4e3a8] transition-colors">
          <CalendarDays size={13} />
          <span>{currentDate}</span>
        </button>

        <Link href="/learner/settings?section=notifications" onClick={() => {
          if (window.location.pathname === "/learner/settings") {
            window.dispatchEvent(new CustomEvent("konnect-settings-section", { detail: "notifications" }));
          }
        }} aria-label="Notifications, 2 unread" title="2 unread notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e7df] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#f5f7f2] dark:border-[#212f1f] dark:bg-[#141d13] dark:hover:bg-[#1b2819]">
          <Bell size={15} className="text-[#40522c] dark:text-[#b4e3a8]" />

          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#f2f3ed] bg-[#e5484d] px-1 text-[8px] font-bold leading-none text-white dark:border-[#111510]">
            2
          </span>
        </Link>

      </div>
    </header>
  );
}