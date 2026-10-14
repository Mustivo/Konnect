
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  ChartNoAxesCombined,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  UserRound,
  Clock,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  GraduationCap,
  PanelLeft,
  CalendarCheck,
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
      time: "09:00–10:30",
      color: "#00a8ed",
      status: "Completed",
      description: "React fundamentals and component development",
    },
  ],
  6: [
    {
      title: "UI/UX Design",
      time: "14:00–15:30",
      color: "#883cff",
      status: "Completed",
      description: "From Wireframes to Prototypes",
      fullTitle: "Design systems & component libraries",
    },
  ],
  7: [
    {
      title: "Django",
      time: "10:00–11:30",
      color: "#16a34a",
      status: "Awaiting response",
      description: "REST APIs with Django REST Framework",
    },
  ],
  9: [
    {
      title: "Mathematics",
      time: "11:00–12:30",
      color: "#f45125",
      status: "Not available",
      description: "Probability & real-world statistics",
      fullTitle: "Mathematics for Everyday Life",
    },
  ],
  12: [
    {
      title: "React.js",
      time: "09:00–10:30",
      color: "#00a8ed",
      status: "Available",
      description: "React fundamentals and component development",
    },
  ],
  13: [
    {
      title: "UI/UX Design",
      time: "14:00–15:30",
      color: "#883cff",
      status: "Available",
      description: "From Wireframes to Prototypes",
    },
  ],
  14: [
    {
      title: "Django",
      time: "10:00–11:30",
      color: "#16a34a",
      status: "Available",
      description: "REST APIs with Django REST Framework",
    },
  ],
  16: [
    {
      title: "Mathematics",
      time: "11:00–12:30",
      color: "#f45125",
      status: "Available",
      description: "Probability & real-world statistics",
    },
  ],
  19: [
    {
      title: "React.js",
      time: "09:00–10:30",
      color: "#00a8ed",
      status: "Available",
      description: "React fundamentals and component development",
    },
  ],
  20: [
    {
      title: "UI/UX Design",
      time: "14:00–15:30",
      color: "#883cff",
      status: "Available",
      description: "From Wireframes to Prototypes",
    },
  ],
  21: [
    {
      title: "Django",
      time: "10:00–11:30",
      color: "#16a34a",
      status: "Available",
      description: "REST APIs with Django REST Framework",
    },
  ],
  23: [
    {
      title: "Mathematics",
      time: "11:00–12:30",
      color: "#f45125",
      status: "Available",
      description: "Probability & real-world statistics",
    },
  ],
  26: [
    {
      title: "React.js",
      time: "09:00–10:30",
      color: "#00a8ed",
      status: "Available",
      description: "React fundamentals and component development",
    },
  ],
  27: [
    {
      title: "UI/UX Design",
      time: "14:00–15:30",
      color: "#883cff",
      status: "Available",
      description: "From Wireframes to Prototypes",
    },
  ],
  28: [
    {
      title: "Django",
      time: "10:00–11:30",
      color: "#16a34a",
      status: "Available",
      description: "REST APIs with Django REST Framework",
    },
  ],
  30: [
    {
      title: "Mathematics",
      time: "11:00–12:30",
      color: "#f45125",
      status: "Available",
      description: "Probability & real-world statistics",
    },
  ],
};

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const shortWeekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function getCalendarDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - mondayOffset + 1);

    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      currentMonth: date.getMonth() === month,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    };
  });
}

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`);
  const [view, setView] = useState<"Month" | "Week">("Month");
  const [taskExpanded, setTaskExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All classes");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dates = useMemo(
    () => getCalendarDates(year, month),
    [year, month]
  );

  const selectedParts = selectedDate.split("-").map(Number);
  const selectedDay = selectedParts[2];
  const selectedMonth = selectedParts[1];
  const selectedYear = selectedParts[0];

  const selectedLesson =
    selectedYear === 2026 && selectedMonth === 9
      ? lessons[selectedDay]?.[0]
      : undefined;

  const monthName = currentDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const todayLabel = today.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  const selectedHeading = new Date(
    selectedYear,
    selectedMonth,
    selectedDay
  ).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function changeMonth(amount: number) {
    setCurrentDate(new Date(year, month + amount, 1));
  }

  function goToday() {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`);
  }

  function selectDay(day: number, monthIndex: number, dateYear: number) {
    setSelectedDate(`${dateYear}-${monthIndex}-${day}`);

    if (monthIndex !== month || dateYear !== year) {
      setCurrentDate(new Date(dateYear, monthIndex, 1));
    }
  }

  const visibleDates =
    view === "Week"
      ? dates.filter((date) => {
          const selected = new Date(
            selectedYear,
            selectedMonth,
            selectedDay
          );
          const monday = new Date(selected);
          monday.setDate(selected.getDate() - ((selected.getDay() + 6) % 7));
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          const actual = new Date(date.year, date.month, date.day);
          return actual >= monday && actual <= sunday;
        })
      : dates;

  return (
    <main className="min-h-screen  p-0 text-[#20271e] sm:p-4">
      <div className="relative mx-auto flex min-h-[calc(100vh-32px)] max-w-[1600px] overflow-hidden rounded-none border border-[#d9ddd2] bg-[#f3f4ed] sm:rounded-[15px]">
        {/* Mobile sidebar toggle */}
   

        {/* Sidebar */}


        {/* Main content */}
        <div className="min-w-0 flex-1 px-3 pb-5 pt-14 sm:px-5 sm:pt-5 lg:px-4 lg:pt-5">
     

   

          {/* Page title */}
          <section className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.02em] text-[#506341]">
                YOUR LEARNING SPACE
              </p>
              <h1 className="text-[25px] font-semibold leading-[1.15] tracking-[-0.8px] text-[#20251e]">
                Calendar
              </h1>
              <p className="mt-1 text-[10px] text-[#7a8073]">
                Your lessons, in one place. All class times are shown in BST.
              </p>
            </div>

            <button
              type="button"
              onClick={goToday}
              className="flex h-[30px] items-center gap-1.5 rounded-md border border-[#e0e4db] bg-white px-3 text-[9px] font-semibold text-[#4b5b3d] transition-colors hover:bg-[#e9f0e2]"
            >
              <CalendarDays size={12} />
              Today · {todayLabel}
            </button>
          </section>

          {/* Calendar and right panels */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_295px]">
            {/* Calendar */}
            <section className="min-w-0 rounded-[13px] border border-[#e0e4dc] bg-white p-3 sm:p-4">
              {/* Calendar heading */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => changeMonth(-1)}
                    className="flex h-[29px] w-[29px] items-center justify-center rounded-md border border-[#e1e5dc] text-[#44543a] hover:bg-[#eff4e9]"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <h2 className="min-w-[100px] text-[15px] font-semibold tracking-[-0.3px] text-[#232920]">
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
                      type="button"
                      key={item}
                      onClick={() => setView(item)}
                      className={`h-[29px] rounded-md border px-3 text-[10px] font-medium transition-colors ${
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

              {/* Filters */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="relative">
                  <select
                    aria-label="Filter classes"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="h-[30px] appearance-none rounded-md border border-[#e0e4dc] bg-white pl-3 pr-7 text-[10px] font-medium text-[#405236] outline-none focus:border-[#a7b99a]"
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

              {/* Weekday labels */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {(view === "Week"
                  ? shortWeekdays
                  : shortWeekdays
                ).map((day) => (
                  <div
                    key={day}
                    className="truncate py-1 text-center text-[8px] font-medium text-[#42483c]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div
                className={`grid grid-cols-7 gap-1 ${
                  view === "Week" ? "grid-rows-1" : ""
                }`}
              >
                {visibleDates.map((date) => {
                  const dateId = `${date.year}-${date.month}-${date.day}`;
                  const isSelected = selectedDate === dateId;
                  const dayLessons =
                    date.month === 9 && date.year === 2026
                      ? lessons[date.day] || []
                      : [];

                  const filteredLessons = dayLessons.filter((lesson) => {
                    const matchesSearch =
                      !search ||
                      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
                      lesson.description.toLowerCase().includes(search.toLowerCase());

                    const matchesFilter =
                      filter === "All classes" || lesson.title === filter;

                    return matchesSearch && matchesFilter;
                  });

                  return (
                    <button
                      type="button"
                      key={date.key}
                      onClick={() =>
                        selectDay(date.day, date.month, date.year)
                      }
                      aria-label={`${date.day} ${new Date(
                        date.year,
                        date.month
                      ).toLocaleDateString("en-GB", { month: "long" })} ${date.year}`}
                      className={`flex min-h-[86px] min-w-0 flex-col items-stretch overflow-hidden rounded-[7px] border p-1.5 text-left transition-colors sm:min-h-[96px] sm:p-2 ${
                        isSelected
                          ? "border-[#526c42] bg-[#e9f0e2]"
                          : "border-[#e8ebe4] bg-white hover:border-[#bdcdb0] hover:bg-[#fafcf8]"
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
                            <p
                              className={`truncate text-[7px] leading-[1.5] sm:text-[7px] ${
                                lesson.status === "Awaiting response"
                                  ? "text-[#9a6a29]"
                                  : lesson.status === "Not available"
                                    ? "text-[#8d5540]"
                                    : "text-[#506c42]"
                              }`}
                            >
                              {lesson.status}
                            </p>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calendar legend */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#edf0e9] pt-3">
                {[
                  { label: "React.js", color: "#00a8ed" },
                  { label: "UI/UX Design", color: "#883cff" },
                  { label: "Django", color: "#16a34a" },
                  { label: "Mathematics", color: "#f45125" },
                ].map((item) => (
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

            {/* Right panels */}
            <aside className="flex min-w-0 flex-col gap-3">
              {/* Selected class */}
              <section className="rounded-[13px] border border-[#dfe7d6] bg-[#eaf0e3] p-3.5">
                <h2 className="text-[13px] font-semibold tracking-[-0.2px] text-[#252c22]">
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
                      <div className="flex h-[34px] w-[47px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#d3dfc8] text-[#53664a]">
                        <GraduationCap size={23} />
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
                      Available · You attended this lesson. Your class review
                      and learning materials are ready.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setNotice(
                          `Review selected: ${selectedLesson.fullTitle || selectedLesson.title}. Connect this button to your existing review page.`
                        )
                      }
                      className="mt-2.5 flex h-[30px] w-full items-center justify-center gap-2 rounded-md bg-[#263b20] px-2 text-[9px] font-semibold text-white transition-colors hover:bg-[#354d2d]"
                    >
                      Review class &amp; give feedback
                      <ArrowRight size={12} />
                    </button>
                  </>
                ) : (
                  <div className="mt-5 rounded-lg border border-[#dbe5d2] bg-white/60 p-4 text-center">
                    <CalendarCheck
                      size={23}
                      className="mx-auto text-[#6e8060]"
                    />
                    <p className="mt-2 text-[11px] font-semibold">
                      No class selected
                    </p>
                    <p className="mt-1 text-[9px] text-[#7b8275]">
                      Choose a scheduled lesson on the calendar to view its
                      details.
                    </p>
                  </div>
                )}
              </section>

              {/* Upcoming classes */}
              <section className="rounded-[13px] border border-[#e0e4dc] bg-white p-3.5">
                <h2 className="mb-3 text-[13px] font-semibold tracking-[-0.2px] text-[#262c23]">
                  Coming up this week
                </h2>

                {/* Django */}
                <div className="pb-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[8px] font-medium text-[#59614f]">
                      WED, 7 OCT
                    </p>
                    <span className="whitespace-nowrap rounded-full bg-[#fbf0df] px-2 py-1 text-[8px] font-medium text-[#946328]">
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
                      10:00–11:30 BST
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setResponses((old) => ({
                          ...old,
                          django:
                            old.django === "Accepted"
                              ? "Awaiting response"
                              : "Accepted",
                        }))
                      }
                      className="text-[8px] font-semibold text-[#425a35] hover:underline"
                    >
                      {responses.django || "Respond"} →
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#edf0e9]" />

                {/* Mathematics */}
                <div className="py-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[8px] font-medium text-[#59614f]">
                      FRI, 9 OCT
                    </p>
                    <span className="whitespace-nowrap rounded-full bg-[#f0f1ec] px-2 py-1 text-[8px] font-medium text-[#626b5a]">
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
                      11:00–12:30 BST
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setResponses((old) => ({
                          ...old,
                          mathematics:
                            old.mathematics === "Available"
                              ? "Not available"
                              : "Available",
                        }))
                      }
                      className="text-[8px] font-semibold text-[#425a35] hover:underline"
                    >
                      {responses.mathematics
                        ? "Change response"
                        : "Change response"}{" "}
                      →
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#edf0e9] pt-3">
                  <p className="text-[8px] leading-[1.7] text-[#818779]">
                    Availability is set by your instructor. Respond to
                    invitations to confirm your plans.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({
  icon,
  label,
  href,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`relative flex h-[42px] items-center gap-3 rounded-md px-3 transition-colors ${
        active
          ? "bg-[#f3f4ed] text-[#435936]"
          : "text-[#697363] hover:bg-white/40 hover:text-[#35472b]"
      }`}
    >
      {icon}
      <span className={`text-[11px] ${active ? "font-semibold" : "font-normal"}`}>
        {label}
      </span>
    </a>
  );
}
