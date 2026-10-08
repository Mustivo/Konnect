"use client";

import { Search, Bell, CalendarDays, ChevronDown } from "lucide-react";

export default function DashNav() {
  return (
    <header className="flex h-20 items-center justify-between pl-4 pr-[31px]">
      {/* Search: 335 × 36 */}
      <div className="relative h-9 w-[335px]">
        <Search
          size={13}
          className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#9ca3af]"
        />

        <input
          type="text"
          placeholder="Search courses, topics, teachers..."
          className="h-9 w-full rounded-lg border border-[#e2e5dc] bg-white pl-[34px] pr-3 text-[11px] text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#9ca3af] focus:border-[#40522c]"
        />
      </div>

      {/* Right side: 12px gaps, all buttons 30px high */}
      <div className="flex items-center gap-3">
        {/* Date: 114 × 30 */}
        <button className="flex h-[30px] items-center gap-1 rounded-md border border-[#e4e7df] bg-white pl-[10px] pr-[11px] text-[11px] font-semibold text-[#40522c] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <CalendarDays size={13} />
          <span>Tue, 6 Oct 2026</span>
        </button>

        {/* Notification: 30 × 30 */}
        <button className="relative flex h-[30px] w-[30px] items-center justify-center rounded-md border border-[#e4e7df] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Bell size={14} className="text-[#40522c]" />

          <span className="absolute left-[13px] top-[4px] flex h-[11px] w-[11px] items-center justify-center rounded-full bg-[#ef4444] text-[7px] font-bold leading-none text-white">
            2
          </span>
        </button>

        {/* Profile: 111 × 30 */}
        <button className="flex h-[30px] items-center rounded-md border border-[#e4e7df] bg-white pl-[9px] pr-[9px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf0e3] text-[7px] font-semibold text-[#40522c]">
            GT
          </div>

          <span className="ml-[9px] text-[11px] font-semibold text-[#171d15]">
            Gabriella
          </span>

          <ChevronDown size={12} className="ml-2 text-[#596052]" />
        </button>
      </div>
    </header>
  );
}