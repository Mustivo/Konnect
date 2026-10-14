"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Lightbulb,
  Video,
  X,
} from "lucide-react";

const lessons = [
  { id: "uiux", day: "06", weekday: "TUE", time: "14:00–15:30", subject: "UI/UX Design", detail: "Design systems & component libraries", color: "#8957e5", join: true, sessionTitle: "UI/UX Design — From Wireframes to Prototypes", teacher: "Amara Okafor", date: "Tue 6 October 2026", fullTime: "14:00–15:30 BST" },
  { id: "django-07", day: "07", weekday: "WED", time: "10:00–11:30", subject: "Django", detail: "REST APIs with Django REST Framework", color: "#18a769" },
  { id: "django-08", day: "08", weekday: "WED", time: "10:00–11:30", subject: "Django", detail: "REST APIs with Django REST Framework", color: "#18a769" },
  { id: "django-09", day: "09", weekday: "WED", time: "11:00–12:30", subject: "Django", detail: "REST APIs with Django REST Framework", color: "#18a769" },
  { id: "maths", day: "12", weekday: "FRI", time: "11:00–12:30", subject: "Mathematics", detail: "Probability & real-world statistics", color: "#ee7853" },
];

const checklist = [
  { id: "topic", label: "Review the lesson topic and learning objectives." },
  { id: "notes", label: "Open the class materials and read the recommended notes." },
  { id: "question", label: "Prepare one question to ask during the session." },
  { id: "room", label: "Join the room a few minutes early to test audio and video." },
];

const materials = [
  { title: "Lesson notes", detail: "Key concepts, examples, and discussion prompts.", type: "PDF" },
  { title: "Reading list", detail: "Recommended articles and supporting resources.", type: "Links" },
  { title: "Starter files", detail: "Templates and exercises for guided practice.", type: "ZIP" },
];

const eventDays: Record<number, string> = {
  5: "#20a9e0",
  7: "#19a86a",
  9: "#ef7350",
  12: "#20a9e0",
};

function getCalendarCells(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset);

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export default function LiveClassesPage() {
  const router = useRouter();
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [joinedLesson, setJoinedLesson] = useState<string | null>(null);
  const [joinLessonId, setJoinLessonId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState(["topic", "notes", "question", "room"]);
  const monthLabel = calendarMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const calendarCells = getCalendarCells(calendarMonth);
  const joinLesson = lessons.find((lesson) => lesson.id === joinLessonId);

  return (
    <div className="space-y-3 py-3">
      <header>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#35452e] dark:text-[#a4b49e]">
          YOUR LEARNING SPACE
        </p>
        <h1 className="text-[20px] font-bold leading-tight text-[#151b14] dark:text-[#edf1e9]">
          Live Classes
        </h1>
        <button
          type="button"
          className="mt-1 border-b-2 border-[#22aee2] pb-0.5 text-[10px] font-semibold text-[#3b5140] dark:text-[#d5e1d0]"
        >
          Upcoming Lessons
        </button>
      </header>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1.85fr)_minmax(220px,1fr)]">
        <div className="space-y-3">
          <section className="rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="text-[11px] font-semibold text-[#20261e] dark:text-[#edf1e9]">
                  Upcoming lessons
                </h2>
                <p className="mt-1 text-[8px] text-[#788173] dark:text-[#95a18f]">
                  5–11 October · All times in BST
                </p>
              </div>
              <a href="#class-preparation" className="mt-0.5 text-[8px] font-semibold text-[#40522c] dark:text-[#b4d49f]">
                See all →
              </a>
            </div>

            <div>
              {lessons.map((lesson) => (
                <div key={lesson.id} className="flex min-h-[48px] items-center gap-2 border-b border-[#dce6d4] py-1.5 last:border-0 dark:border-[#303b2d]">
                  <div className="flex w-6 shrink-0 flex-col items-center leading-none">
                    <span className="text-[6px] font-semibold text-[#66705f] dark:text-[#9aa693]">{lesson.weekday}</span>
                    <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${lesson.join ? "bg-[#263d21] text-white" : "text-[#263226] dark:text-[#e3e9df]"}`}>
                      {lesson.day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-semibold" style={{ color: lesson.color }}>{lesson.time}</p>
                    <p className="text-[9px] font-semibold text-[#22291f] dark:text-[#ecf1e9]">{lesson.subject}</p>
                    <p className="truncate text-[8px] text-[#768071] dark:text-[#98a393]">{lesson.detail}</p>
                  </div>

                  {lesson.join && (
                    <button
                      type="button"
                      disabled={joinedLesson === lesson.id}
                      onClick={() => setJoinLessonId(lesson.id)}
                      className="shrink-0 rounded bg-[#263d21] px-2 py-1 text-[8px] font-semibold text-white hover:bg-[#1b2d18]"
                    >
                      {joinedLesson === lesson.id ? "Joined ✓" : "Join →"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section id="class-preparation" className="rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[11px] font-semibold text-[#20261e] dark:text-[#edf1e9]">Class preparation</h2>
                <p className="mt-0.5 text-[8px] text-[#788173] dark:text-[#95a18f]">
                  Quick steps to help you arrive ready for your next live session.
                </p>
              </div>
              <a href="#class-materials" className="shrink-0 rounded border border-[#e1e7db] bg-[#f3f6ef] px-2 py-1 text-[7px] font-medium text-[#35452e] dark:border-[#303b2d] dark:bg-[#20291e] dark:text-[#c7d4bd]">
                Open materials
              </a>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-[#e1e7db] bg-[#f4f6f0] p-2 dark:border-[#303b2d] dark:bg-[#1b211a]">
                <h3 className="mb-1 text-[8px] font-semibold text-[#283124] dark:text-[#e1e8dc]">Before class checklist</h3>
                <ul className="space-y-1.5">
                  {checklist.map((item) => {
                    const checked = checkedItems.includes(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-pressed={checked}
                          onClick={() => setCheckedItems((items) => checked ? items.filter((id) => id !== item.id) : [...items, item.id])}
                          className="flex items-start gap-1.5 text-left text-[7px] leading-[1.35] text-[#515b4b] dark:text-[#bac5b3]"
                        >
                          <span className={`mt-px flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${checked ? "bg-[#cbd9b9] text-[#38512d]" : "border border-[#aab59f] text-transparent"}`}>
                            <Check size={8} strokeWidth={3} />
                          </span>
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div id="class-materials" className="rounded-md border border-[#e1e7db] bg-[#f4f6f0] p-2 dark:border-[#303b2d] dark:bg-[#1b211a]">
                <h3 className="mb-1 text-[8px] font-semibold text-[#283124] dark:text-[#e1e8dc]">Class materials</h3>
                <ul className="space-y-1">
                  {materials.map((material) => (
                    <li key={material.title} className="flex items-center gap-1.5 rounded-md border border-[#e3e8df] bg-white px-1.5 py-1 dark:border-[#303b2d] dark:bg-[#202720]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#edf2e8] text-[#465b39] dark:bg-[#2b3627] dark:text-[#c2d2b5]">
                        <FileText size={11} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[7.5px] font-semibold text-[#374132] dark:text-[#e1e8dc]">{material.title}</span>
                        <span className="block text-[6.5px] leading-tight text-[#798174] dark:text-[#9ca797]">{material.detail}</span>
                      </span>
                      <span className="rounded-full bg-[#edf2e8] px-1.5 py-0.5 text-[6px] font-semibold text-[#506440] dark:bg-[#2b3627] dark:text-[#c2d2b5]">{material.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-2">
          <section className="rounded-lg border border-[#e0e5dd] bg-white p-3 dark:border-[#2a312a] dark:bg-[#161b17]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold text-[#20261e] dark:text-[#edf1e9]">{monthLabel}</h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="flex h-4 w-4 items-center justify-center rounded bg-[#f1f3ee] text-[#66705f] dark:bg-[#242c22] dark:text-[#c1cbb9]"
                >
                  <ChevronLeft size={10} />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="flex h-4 w-4 items-center justify-center rounded bg-[#f1f3ee] text-[#66705f] dark:bg-[#242c22] dark:text-[#c1cbb9]"
                >
                  <ChevronRight size={10} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((weekday) => (
                <span key={weekday} className="pb-1 text-[6px] font-medium text-[#8b9387] dark:text-[#909a8b]">{weekday}</span>
              ))}
              {calendarCells.map((day) => {
                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const eventColor = day.getFullYear() === 2026 && day.getMonth() === 9 ? eventDays[day.getDate()] : undefined;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    aria-label={day.toLocaleDateString("en-GB", { dateStyle: "full" })}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDate(day)}
                    className={`relative mx-auto mb-0.5 flex h-[21px] w-[21px] items-center justify-center rounded text-[7px] ${isSelected
                      ? "bg-[#263d21] font-semibold text-white"
                      : isCurrentMonth
                        ? "text-[#394235] hover:bg-[#f0f3ec] dark:text-[#d0d8cb] dark:hover:bg-[#283126]"
                        : "text-[#bdc3b9] dark:text-[#596153]"
                    }`}
                  >
                    {day.getDate()}
                    {eventColor && <span className="absolute bottom-0.5 h-[3px] w-[3px] rounded-full" style={{ backgroundColor: eventColor }} />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 flex flex-wrap gap-x-2 text-[6px] text-[#71796e] dark:text-[#a0aa99]">
              {[ ["#20a9e0", "React.js"], ["#8957e5", "UI/UX"], ["#19a86a", "Django"], ["#ee7853", "Maths"] ].map(([color, label]) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />{label}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#e5e8de] bg-[#f2f3ed] p-3 dark:border-[#303b2d] dark:bg-[#1b211a]">
            <Lightbulb size={13} className="mb-1 text-[#425b34] dark:text-[#c0d49f]" />
            <h2 className="text-[9px] font-semibold text-[#262d22] dark:text-[#e5ebdf]">Make time for curiosity.</h2>
            <p className="mt-1 text-[8px] leading-relaxed text-[#747c70] dark:text-[#a0aa99]">
              Review your course materials before each session. A few minutes of preparation can make a big difference.
            </p>
            <a href="#class-preparation" className="mt-1.5 inline-block text-[7px] font-semibold text-[#40522c] dark:text-[#c3d7ad]">
              Explore learning tips ↗
            </a>
          </section>
        </aside>
      </div>

      {joinLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
          onClick={() => setJoinLessonId(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-class-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[530px] rounded-xl border border-[#e1e6dc] bg-white p-4 shadow-[0_16px_48px_rgba(24,34,22,0.18)] dark:border-[#303b2d] dark:bg-[#171d16] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf2e8] text-[#405a35] dark:bg-[#2b3627] dark:text-[#c2d2b5]">
                  <Video size={16} />
                </span>
                <div>
                  <h2 id="join-class-title" className="text-[16px] font-bold text-[#22291f] dark:text-[#edf1e9]">
                    Join your live class
                  </h2>
                  <p className="mt-0.5 text-[10px] text-[#788172] dark:text-[#a0aa99]">
                    Your enrolled session is ready to join.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close join confirmation"
                onClick={() => setJoinLessonId(null)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f1f3ed] text-[#65705d] hover:bg-[#e8ece2] dark:bg-[#252c22] dark:text-[#c1cbb9] dark:hover:bg-[#30382b]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-[#f2f4ee] p-3 dark:bg-[#20271e] sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[8px] font-semibold uppercase text-[#536447] dark:text-[#b9caa9]">
                  Enrolled session
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e5eddc] px-2 py-1 text-[8px] font-semibold text-[#4d633d] dark:bg-[#303d29] dark:text-[#c7d8b7]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6f9a4d]" />
                  Ready to join
                </span>
              </div>
              <h3 className="mt-2 text-[13px] font-semibold text-[#252c22] dark:text-[#e8eee3]">
                {joinLesson.sessionTitle || `${joinLesson.subject} live class`}
              </h3>
              <p className="mt-1 text-[9px] text-[#687264] dark:text-[#a0aa99]">
                Teacher: {joinLesson.teacher || "Your instructor"}
              </p>
              <p className="mt-2 text-[10px] font-medium text-[#3f4939] dark:text-[#d5dfce]">
                {joinLesson.detail}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[#687264] dark:text-[#a0aa99]">
                <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {joinLesson.date || `${joinLesson.weekday} ${joinLesson.day} October 2026`}</span>
                <span className="inline-flex items-center gap-1"><Clock3 size={11} /> {joinLesson.fullTime || `${joinLesson.time} BST`}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[8px] text-[#788172] dark:text-[#a0aa99]">
                Signed in as Gabriella Igabe
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJoinLessonId(null)}
                  className="h-8 rounded-md border border-[#dfe5da] bg-white px-3 text-[9px] font-medium text-[#4e5a49] hover:bg-[#f5f7f2] dark:border-[#303b2d] dark:bg-[#171d16] dark:text-[#c2ccb9] dark:hover:bg-[#252c22]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJoinedLesson(joinLesson.id);
                    setJoinLessonId(null);
                    router.push(`/learner/live_classes/waiting-room?session=${joinLesson.id}`);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#263d21] px-3 text-[9px] font-semibold text-white hover:bg-[#1c3019]"
                >
                  <Video size={12} /> Join live class
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
