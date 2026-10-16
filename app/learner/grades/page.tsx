
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Clock,
} from "lucide-react";

type Lesson = {
  title: string;
  time: string;
  color: string;
  status: string;
  description: string;
  fullTitle?: string;
};

const lessons: Record<number, Lesson[]> = {
  5: [
    {
      title: "React.js",
      time: "09:00-10:30",
      color: "#00a8ed",
      status: "Completed",
      description: "React fundamentals",
    },
  ],
  6: [
    {
      title: "UI/UX Design",
      time: "14:00-15:30",
      color: "#883cff",
      status: "Completed",
      description: "From Wireframes to Prototypes",
      fullTitle: "Design systems & component libraries",
    },
  ],
  7: [
    {
      title: "Django",
      time: "10:00-11:30",
      color: "#16a34a",
      status: "Awaiting response",
      description: "REST APIs with Django REST Framework",
    },
  ],
  9: [
    {
      title: "Mathematics",
      time: "11:00-12:30",
      color: "#f45125",
      status: "Not available",
      description: "Probability & real-world statistics",
      fullTitle: "Mathematics for Everyday Life",
    },
  ],
  12: [
    {
      title: "React.js",
      time: "09:00-10:30",
      color: "#00a8ed",
      status: "Available",
      description: "React fundamentals",
    },
  ],
  13: [
    {
      title: "UI/UX Design",
      time: "14:00-15:30",
      color: "#883cff",
      status: "Available",
      description: "From Wireframes to Prototypes",
    },
  ],
  14: [
    {
      title: "Django",
      time: "10:00-11:30",
      color: "#16a34a",
      status: "Available",
      description: "REST APIs with Django REST Framework",
    },
  ],
  16: [
    {
      title: "Mathematics",
      time: "11:00-12:30",
      color: "#f45125",
      status: "Available",
      description: "Probability and statistics",
    },
  ],
  19: [
    {
      title: "React.js",
      time: "09:00-10:30",
      color: "#00a8ed",
      status: "Available",
      description: "React fundamentals",
    },
  ],
  20: [
    {
      title: "UI/UX Design",
      time: "14:00-15:30",
      color: "#883cff",
      status: "Available",
      description: "From Wireframes to Prototypes",
    },
  ],
  21: [
    {
      title: "Django",
      time: "10:00-11:30",
      color: "#16a34a",
      status: "Available",
      description: "REST APIs with Django REST Framework",
    },
  ],
  23: [
    {
      title: "Mathematics",
      time: "11:00-12:30",
      color: "#f45125",
      status: "Available",
      description: "Probability and statistics",
    },
  ],
  26: [
    {
      title: "React.js",
      time: "09:00-10:30",
      color: "#00a8ed",
      status: "Available",
      description: "React fundamentals",
    },
  ],
  27: [
    {
      title: "UI/UX Design",
      time: "14:00-15:30",
      color: "#883cff",
      status: "Available",
      description: "From Wireframes to Prototypes",
    },
  ],
  28: [
    {
      title: "Django",
      time: "10:00-11:30",
      color: "#16a34a",
      status: "Available",
      description: "REST APIs with Django REST Framework",
    },
  ],
  30: [
    {
      title: "Mathematics",
      time: "11:00-12:30",
      color: "#f45125",
      status: "Available",
      description: "Probability and statistics",
    },
  ],
};

const weekdays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const legend = [
  { label: "React.js", color: "#00a8ed" },
  { label: "UI/UX Design", color: "#883cff" },
  { label: "Django", color: "#16a34a" },
  { label: "Mathematics", color: "#f45125" },
];

function getCalendarDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - offset + 1);

    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      currentMonth: date.getMonth() === month,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    };
  });
}

function formatDate(year: number, month: number, day: number) {
  return new Date(year, month, day).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 9, 1)
  );
  const [selectedDate, setSelectedDate] = useState("2026-9-6");
  const [view, setView] = useState<"Week" | "Month">("Month");
  const [filter, setFilter] = useState("All classes");
  const [responses, setResponses] = useState<Record<string, string>>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dates = useMemo(
    () => getCalendarDates(year, month),
    [year, month]
  );

  const [selectedYear, selectedMonth, selectedDay] = selectedDate
    .split("-")
    .map(Number);

  const selectedLesson =
    selectedYear === 2026 && selectedMonth === 9
      ? lessons[selectedDay]?.[0]
      : undefined;

  const monthName = currentDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const selectedHeading = formatDate(
    selectedYear,
    selectedMonth,
    selectedDay
  );

  const visibleDates = useMemo(() => {
    if (view === "Month") return dates;

    const selected = new Date(
      selectedYear,
      selectedMonth,
      selectedDay
    );

    const monday = new Date(selected);
    monday.setDate(
      selected.getDate() - ((selected.getDay() + 6) % 7)
    );

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        currentMonth: date.getMonth() === month,
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      };
    });
  }, [
    dates,
    view,
    selectedYear,
    selectedMonth,
    selectedDay,
    month,
  ]);

  function changeMonth(amount: number) {
    setCurrentDate(new Date(year, month + amount, 1));
  }

  function goToday() {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDate("2026-9-6");
    setView("Month");
  }

  function selectDate(day: number, monthIndex: number, dateYear: number) {
    setSelectedDate(`${dateYear}-${monthIndex}-${day}`);

    if (monthIndex !== month || dateYear !== year) {
      setCurrentDate(new Date(dateYear, monthIndex, 1));
    }
  }

  return (
    <div className="min-w-0">
      {/* Calendar heading: no sidebar or navbar here */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#506341]">
            Your learning space
          </p>

          <h1 className="mt-0.5 text-[26px] font-semibold leading-tight tracking-tight text-[#20251e]">
            Calendar
          </h1>

          <p className="mt-1 text-[10px] text-[#7a8073]">
            Your lessons, in one place. All class times are shown in BST.
          </p>
        </div>

        <button
          type="button"
          onClick={goToday}
          className="flex h-[30px] items-center gap-1.5 rounded-md border border-[#e0e4db] bg-white px-3 text-[9px] font-semibold text-[#4b5b3d] hover:bg-[#eaf0e3]"
        >
          <CalendarDays size={12} />
          Today · 6 October
        </button>
      </div>

      {/* Center calendar and right-side cards only */}
      <div className="mt-4 grid min-w-0 grid-cols-1 items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_295px]">
        {/* Calendar */}
        <section className="min-w-0 rounded-[13px] border border-[#e0e4dc] bg-white p-[15px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
                className="flex h-[29px] w-[29px] items-center justify-center rounded-md border border-[#e1e5dc] text-[#44543a] hover:bg-[#eff4e9]"
              >
                <ChevronLeft size={13} />
              </button>

              <h2 className="text-[15px] font-semibold tracking-[-0.3px] text-[#232920]">
                {monthName}
              </h2>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
                className="flex h-[29px] w-[29px] items-center justify-center rounded-md border border-[#e1e5dc] text-[#44543a] hover:bg-[#eff4e9]"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {(["Week", "Month"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`h-[29px] rounded-md border px-3 text-[10px] font-medium ${
                    view === item
                      ? "border-[#263b20] bg-[#263b20] text-white"
                      : "border-[#e1e5dc] bg-white text-[#526046] hover:bg-[#f0f4eb]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <select
                aria-label="Filter classes"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-[30px] appearance-none rounded-md border border-[#e0e4dc] bg-white pl-3 pr-7 text-[10px] font-medium text-[#405236] outline-none"
              >
                <option>All classes</option>
                <option>React.js</option>
                <option>UI/UX Design</option>
                <option>Django</option>
                <option>Mathematics</option>
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#526046]"
              />
            </div>

            <p className="text-[9px] text-[#7e8478]">
              British Summer Time · BST
            </p>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div
                key={day}
                className="truncate py-1 text-center text-[8px] font-medium text-[#42483c]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {visibleDates.map((date) => {
              const dateId = `${date.year}-${date.month}-${date.day}`;
              const isSelected = selectedDate === dateId;

              const dayLessons =
                date.year === 2026 && date.month === 9
                  ? lessons[date.day] || []
                  : [];

              const filteredLessons = dayLessons.filter((lesson) => {
                return filter === "All classes" || lesson.title === filter;
              });

              return (
                <button
                  type="button"
                  key={date.key}
                  onClick={() =>
                    selectDate(date.day, date.month, date.year)
                  }
                  aria-pressed={isSelected}
                  className={`flex min-h-[88px] min-w-0 flex-col items-stretch overflow-hidden rounded-[7px] border p-1.5 text-left sm:min-h-[96px] sm:p-2 ${
                    isSelected
                      ? "border-[#526c42] bg-[#e9f0e2]"
                      : "border-[#e8ebe4] bg-white hover:border-[#bdcdb0]"
                  }`}
                >
                  <span
                    className={`mb-1 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] text-[10px] ${
                      isSelected
                        ? "bg-[#263b20] font-semibold text-white"
                        : date.currentMonth
                          ? "text-[#41483c]"
                          : "text-[#9aa3b1]"
                    }`}
                  >
                    {date.day}
                  </span>

                  <div className="min-w-0 space-y-1">
                    {filteredLessons.map((lesson) => (
                      <div
                        key={lesson.title}
                        className="min-w-0 border-l-2 pl-1"
                        style={{ borderColor: lesson.color }}
                      >
                        <p className="truncate text-[8px] font-semibold leading-[1.4] text-[#20271e] sm:text-[9px]">
                          {lesson.title}
                        </p>

                        <p className="truncate text-[7px] leading-[1.5] text-[#777e70] sm:text-[8px]">
                          {lesson.time}
                        </p>

                        <p className="truncate text-[7px] leading-[1.5] text-[#506c42]">
                          {lesson.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#edf0e9] pt-3">
            {legend.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1 text-[8px] text-[#737b6c]"
              >
                <span
                  className="h-[5px] w-[5px] rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* Selected lesson */}
        <aside className="flex min-w-0 flex-col gap-3">
          <section className="rounded-[13px] border border-[#dfe7d6] bg-[#eaf0e3] p-3.5">
            <h2 className="text-[13px] font-semibold text-[#252c22]">
              {selectedHeading}
            </h2>

            {selectedLesson ? (
              <>
                <div className="mb-4 mt-3 flex items-center gap-1 text-[8px] font-medium text-[#49603b]">
                  <CheckCircle2 size={11} />
                  {selectedLesson.status === "Completed"
                    ? "Completed · Attendance recorded"
                    : selectedLesson.status}
                </div>

                <h3 className="text-[16px] font-semibold leading-[1.45] tracking-[-0.4px] text-[#22281f]">
                  {selectedLesson.fullTitle || selectedLesson.title}
                </h3>

                <p className="mt-2 text-[9px] leading-4 text-[#7b8275]">
                  {selectedLesson.title} – {selectedLesson.description}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex h-[34px] w-[47px] shrink-0 items-center justify-center rounded-md bg-[#d3dfc8] text-[#53664a]">
                    <GraduationCapFallback />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#2d3429]">
                      Amara Okafor
                    </p>
                    <p className="mt-0.5 text-[8px] text-[#7a8173]">
                      {selectedLesson.time} BST · 90 minutes
                    </p>
                  </div>
                </div>

                <div className="my-3 border-t border-[#dce4d3]" />

                <p className="text-[9px] leading-[1.65] text-[#727b6c]">
                  Available · You attended this lesson. Your class review and
                  learning materials are ready.
                </p>

                <Link
                  href="/dashboard"
                  className="mt-2.5 flex h-[30px] w-full items-center justify-center gap-2 rounded-md bg-[#263b20] px-2 text-[9px] font-semibold text-white hover:bg-[#354d2d]"
                >
                  Review class &amp; give feedback
                  <ArrowRight size={12} />
                </Link>
              </>
            ) : (
              <p className="mt-4 text-[10px] text-[#727b6c]">
                No class scheduled for this date.
              </p>
            )}
          </section>

          {/* Coming up this week */}
          <section className="rounded-[13px] border border-[#e0e4dc] bg-white p-3.5">
            <h2 className="mb-3 text-[13px] font-semibold text-[#262c23]">
              Coming up this week
            </h2>

            <div className="pb-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[8px] font-medium text-[#59614f]">
                  WED, 7 OCT
                </p>

                <span className="rounded-full bg-[#fbf0df] px-2 py-1 text-[8px] text-[#946328]">
                  Awaiting response
                </span>
              </div>

              <h3 className="text-[10px] font-semibold text-[#292f25]">
                Django
              </h3>

              <p className="mt-1 text-[9px] leading-4 text-[#7b8275]">
                REST APIs with Django REST Framework
              </p>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[8px] text-[#7b8275]">
                  <Clock size={10} className="mr-1 inline" />
                  10:00-11:30 BST
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setResponses((previous) => ({
                      ...previous,
                      django:
                        previous.django === "Available"
                          ? "Awaiting response"
                          : "Available",
                    }))
                  }
                  className="text-[8px] font-semibold text-[#425a35] hover:underline"
                >
                  {responses.django || "Respond"} →
                </button>
              </div>
            </div>

            <div className="border-t border-[#edf0e9]" />

            <div className="py-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[8px] font-medium text-[#59614f]">
                  FRI, 9 OCT
                </p>

                <span className="rounded-full bg-[#f0f1ec] px-2 py-1 text-[8px] text-[#626b5a]">
                  Not available
                </span>
              </div>

              <h3 className="text-[10px] font-semibold text-[#292f25]">
                Mathematics for Everyday Life
              </h3>

              <p className="mt-1 text-[9px] leading-4 text-[#7b8275]">
                Probability &amp; real-world statistics
              </p>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[8px] text-[#7b8275]">
                  <Clock size={10} className="mr-1 inline" />
                  11:00-12:30 BST
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setResponses((previous) => ({
                      ...previous,
                      mathematics:
                        previous.mathematics === "Available"
                          ? "Not available"
                          : "Available",
                    }))
                  }
                  className="text-[8px] font-semibold text-[#425a35] hover:underline"
                >
                  Change response →
                </button>
              </div>
            </div>

            <div className="border-t border-[#edf0e9] pt-3">
              <p className="text-[8px] leading-[1.7] text-[#818779]">
                Availability is set by your instructor. Respond to invitations
                to confirm your plans.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function GraduationCapFallback() {
  return (
    <span className="text-[19px]" aria-hidden="true">
      ♙
    </span>
  );
}