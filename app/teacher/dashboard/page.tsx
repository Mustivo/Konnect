import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  LineChart,
  Star,
  Users,
  X,
} from "lucide-react";

const stats = [
  { label: "Active Classes", value: "3", note: "3/3 class limit", icon: BookOpen, tone: "bg-[#edf4e8] text-[#34522a]" },
  { label: "Students", value: "83", note: "Across all classes", icon: Users, tone: "bg-[#eaf2ff] text-[#2563a8]" },
  { label: "Pending Reviews", value: "42", note: "Assignments waiting", icon: FileText, tone: "bg-[#fce7f3] text-[#be3b75]" },
  { label: "Approvals", value: "3", note: "New requests today", icon: Check, tone: "bg-[#fef4e8] text-[#c2781b]" },
];

const classes = [
  { code: "MATH 101", title: "Math Algebra Unit Formula", group: "G1 / Class - A", students: 28, tasks: 12, time: "Mon, Wed, Fri (09:00 AM)" },
  { code: "ALG 201", title: "Advanced Linear Geometry", group: "G1 / Class - B", students: 30, tasks: 18, time: "Tue, Thu (11:00 AM)" },
  { code: "GEOM 301", title: "Trigonometry & Spatial Math", group: "G2 / Class - C", students: 25, tasks: 8, time: "Mon, Wed (02:00 PM)" },
];

const approvals = [
  { name: "Oliver James", meta: "G1 / Class - A - 5 mins ago" },
  { name: "David Peter", meta: "G1 / Class - B - 12 mins ago" },
  { name: "Lilly Paul", meta: "G1 / Class - B" },
];

const performance = [
  { name: "Oliver James", score: "97%", group: "G1 / Class - B" },
  { name: "David Peter", score: "95%", group: "G1 / Class - B" },
  { name: "Lilly Paul", score: "92%", group: "G1 / Class - B" },
];

const notes = [
  { title: "Prepare Questions for Unit Test", detail: "Prepare questions for unit tests", date: "05 Dec 2026" },
  { title: "Announcements to Students", detail: "Announce important updates to", date: "01 Dec 2026" },
];

function Avatar({ name, index }: { name: string; index: number }) {
  const colors = ["bg-[#213b1f]", "bg-[#8a5a32]", "bg-[#24445a]"];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colors[index % colors.length]} text-xs font-bold text-white`}>
      {initials}
    </span>
  );
}

export default function TeacherDashboardPage() {
  return (
    <DashboardShell role="teacher">
      <div className="space-y-7 pb-10 pt-4 sm:space-y-8 sm:pt-5">
        <header>
          <div>
            <p className="text-sm font-medium leading-6 text-[#707c6c]">Good afternoon,</p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#172115] dark:text-[#ecf1ea]">
              Edna Francis
            </h1>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#707c6c] sm:text-sm">
              Teacher workspace - approvals, class performance, notes & tasks
            </p>
          </div>
        </header>

        <section id="analytics" className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon, tone }) => (
            <article key={label} className="rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#687564] dark:text-[#8b9987]">{label}</p>
                  <p className="mt-2 text-3xl font-bold leading-9 tracking-tight text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                  <p className="mt-1 text-sm text-[#85917f]">{note}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                  <Icon size={19} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <article id="assignments" className="rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] sm:p-6 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-[#35522b] dark:text-[#b4e3a8]" />
                <h2 className="text-lg font-bold text-[#172115] dark:text-[#ecf1ea]">Assignments Overview</h2>
              </div>
              <button type="button" className="flex h-9 items-center gap-2 rounded-lg border border-[#dce3d6] px-3 text-sm font-semibold text-[#5f6c5b] hover:bg-[#f6f8f3]">
                This Week
                <ChevronDown size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Received", "127"],
                ["Yet to Receive", "58"],
                ["Pending Review", "42"],
                ["Reviewed", "25"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#f6f8f3] p-4 dark:bg-[#1b2819]">
                  <p className="min-h-10 text-sm font-semibold leading-5 text-[#66735f]">{label}</p>
                  <p className="mt-2 text-2xl font-bold leading-8 text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 h-40 sm:h-44">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 420 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="teacherChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#35522b" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#35522b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[24, 52, 80, 108, 132].map((y) => (
                  <line key={y} x1="18" y1={y} x2="410" y2={y} stroke="#eef3eb" strokeWidth="1" />
                ))}
                <polygon points="20,132 80,96 150,100 230,68 310,74 398,34 398,132" fill="url(#teacherChartGradient)" />
                <path d="M20 132 C62 104, 92 92, 150 100 C190 106, 206 70, 230 68 C270 66, 280 78, 310 74 C350 70, 370 44, 398 34" fill="none" stroke="#35522b" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </article>

          <article id="approvals" className="rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] sm:p-6 dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#172115] dark:text-[#ecf1ea]">Students Pending Approval</h2>
              <span className="rounded-full bg-[#fef4e8] px-3 py-1.5 text-xs font-bold text-[#b45309]">3 waiting</span>
            </div>

            <div className="space-y-3">
              {approvals.map((student, index) => (
                <div key={student.name} className="flex items-center gap-3 rounded-xl bg-[#f6f8f3] p-3.5 dark:bg-[#1b2819]">
                  <Avatar name={student.name} index={index} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                    <p className="break-words text-xs text-[#707c6c] md:truncate">{student.meta}</p>
                  </div>
                  <button type="button" aria-label={`Approve ${student.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#23351f] text-white">
                    <Check size={16} />
                  </button>
                  <button type="button" aria-label={`Reject ${student.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce3d6] bg-white text-[#67705f]">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.38fr)]">
          <div id="classes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-[#172115] dark:text-[#ecf1ea]">My Active Classes</h2>
              <span className="rounded-full bg-[#23351f] px-3 py-1.5 text-xs font-semibold text-white">3 / 3 max reached</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {classes.map((item) => (
                <article key={item.title} className="rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#707c6c]">{item.code}</span>
                    <span className="rounded-full bg-[#eaf4e6] px-2.5 py-1 text-[11px] font-bold text-[#2c6e21]">Active</span>
                  </div>
                  <h3 className="min-h-12 text-base font-bold leading-snug text-[#172115] dark:text-[#ecf1ea]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[#707c6c]">{item.group}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#616d5c]">
                    <span className="flex items-center gap-1"><Users size={12} />{item.students} students</span>
                    <span className="flex items-center gap-1"><ClipboardList size={12} />{item.tasks} tasks</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <p className="text-xs leading-5 text-[#7d8979]">{item.time}</p>
                    <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#23351f] px-3.5 py-2 text-xs font-semibold text-white">
                      Manage
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <article id="students" className="rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] sm:p-6 dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#172115] dark:text-[#ecf1ea]">Student Performance</h2>
                <LineChart size={18} className="text-[#35522b]" />
              </div>
              <div className="space-y-4">
                {performance.map((student, index) => (
                  <div key={student.name} className="flex items-center gap-3">
                    <Avatar name={student.name} index={index} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                      <p className="text-xs text-[#707c6c]">{student.group}</p>
                    </div>
                    <span className="text-sm font-bold text-[#172115] dark:text-[#ecf1ea]">{student.score}</span>
                    <Star size={15} className="text-[#f08c20]" />
                  </div>
                ))}
              </div>
            </article>

            <article id="activities" className="rounded-2xl border border-[#e2e7dd] bg-white p-5 shadow-[0_2px_8px_rgba(21,32,18,0.04)] sm:p-6 dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#172115] dark:text-[#ecf1ea]">My Notes</h2>
                <span className="rounded-full bg-[#eaf4e6] px-2.5 py-1 text-xs font-bold text-[#2c6e21]">10</span>
              </div>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.title} className="rounded-xl bg-[#f6f8f3] p-4 dark:bg-[#1b2819]">
                    <p className="text-sm font-bold text-[#172115] dark:text-[#ecf1ea]">{note.title}</p>
                    <p className="mt-1 text-xs text-[#707c6c]">{note.detail}</p>
                    <p className="mt-3 text-xs font-semibold text-[#9aa395]">{note.date}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>
      </div>
    </DashboardShell>
  );
}
