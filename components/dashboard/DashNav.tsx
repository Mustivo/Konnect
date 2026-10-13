"use client";

import { Search, Bell, CalendarDays } from "lucide-react";

export default function DashNav() {
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
        <button className="flex h-[30px] items-center gap-1 whitespace-nowrap rounded-md border border-[#e4e7df] bg-white px-2 text-[12px] font-semibold text-[#40522c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#b4e3a8] transition-colors">
          <CalendarDays size={13} />
          <span>Tue, 6 Oct 2026</span>
        </button>

        <button className="relative flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[#e4e7df] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-[#212f1f] dark:bg-[#141d13] transition-colors">
          <Bell size={14} className="text-[#40522c] dark:text-[#b4e3a8]" />

          <span className="absolute left-[13px] top-[4px] flex h-[11px] w-[11px] items-center justify-center rounded-full bg-[#ef4444] text-[7px] font-bold leading-none text-white">
            2
          </span>
        </button>

      </div>
    </header>
  );
}