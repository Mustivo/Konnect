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
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[index % colors.length]} text-[10px] font-bold text-white`}>
      {initials}
    </span>
  );
}

export default function TeacherDashboardPage() {
  return (
    <DashboardShell role="teacher">
      <div className="space-y-5 pb-8 pt-1">
        <header className="flex flex-col gap-1.5">
          <div>
            <p className="text-[12px] font-medium leading-5 text-[#707c6c]">Good afternoon,</p>
            <h1 className="text-[26px] font-bold leading-8 tracking-[0] text-[#172115] dark:text-[#ecf1ea]">
              Edna Francis
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#707c6c]">
              Teacher workspace - approvals, class performance, notes & tasks
            </p>
          </div>
        </header>

        <section id="analytics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon, tone }) => (
            <article key={label} className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#687564] dark:text-[#8b9987]">{label}</p>
                  <p className="mt-1 text-[24px] font-bold leading-7 tracking-[0] text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                  <p className="mt-1 text-[10px] text-[#85917f]">{note}</p>
                </div>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={14} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <article id="assignments" className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BarChart2 size={13} className="text-[#35522b] dark:text-[#b4e3a8]" />
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">Assignments Overview</h2>
              </div>
              <button type="button" className="flex h-7 items-center gap-1 rounded-md border border-[#dce3d6] px-2.5 text-[10px] font-semibold text-[#5f6c5b] hover:bg-[#f6f8f3]">
                This Week
                <ChevronDown size={11} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {[
                ["Received", "127"],
                ["Yet to Receive", "58"],
                ["Pending Review", "42"],
                ["Reviewed", "25"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[#f6f8f3] p-3 dark:bg-[#1b2819]">
                  <p className="min-h-8 text-[11px] font-semibold leading-4 text-[#66735f]">{label}</p>
                  <p className="mt-1 text-[24px] font-bold leading-7 text-[#172115] dark:text-[#ecf1ea]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 h-28">
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

          <article id="approvals" className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">Students Pending Approval</h2>
              <span className="rounded-full bg-[#fef4e8] px-2.5 py-1 text-[10px] font-bold text-[#b45309]">3 waiting</span>
            </div>

            <div className="space-y-2">
              {approvals.map((student, index) => (
                <div key={student.name} className="flex items-center gap-3 rounded-lg bg-[#f6f8f3] p-3 dark:bg-[#1b2819]">
                  <Avatar name={student.name} index={index} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                    <p className="truncate text-[10px] text-[#707c6c]">{student.meta}</p>
                  </div>
                  <button type="button" aria-label={`Approve ${student.name}`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#23351f] text-white">
                    <Check size={13} />
                  </button>
                  <button type="button" aria-label={`Reject ${student.name}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#dce3d6] bg-white text-[#67705f]">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          <div id="classes" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold tracking-[0] text-[#172115] dark:text-[#ecf1ea]">My Active Classes</h2>
              <span className="rounded-full bg-[#23351f] px-2.5 py-1 text-[9.5px] font-bold text-white">3 / 3 max reached</span>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {classes.map((item) => (
                <article key={item.title} className="rounded-xl border border-[#e2e7dd] bg-white p-3.5 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[9.5px] font-bold tracking-wider text-[#707c6c]">{item.code}</span>
                    <span className="rounded-full bg-[#eaf4e6] px-2 py-0.5 text-[9px] font-bold text-[#2c6e21]">Active</span>
                  </div>
                  <h3 className="min-h-9 text-xs font-bold leading-snug text-[#172115] dark:text-[#ecf1ea]">{item.title}</h3>
                  <p className="mt-1 text-[10.5px] text-[#707c6c]">{item.group}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[9.5px] text-[#616d5c]">
                    <span className="flex items-center gap-1"><Users size={12} />{item.students} students</span>
                    <span className="flex items-center gap-1"><ClipboardList size={12} />{item.tasks} tasks</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-[9.5px] leading-4 text-[#7d8979]">{item.time}</p>
                    <button type="button" className="flex items-center gap-1 rounded-lg bg-[#23351f] px-3 py-1.5 text-[10.5px] font-semibold text-white">
                      Manage
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <article id="students" className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">Student Performance</h2>
                <LineChart size={14} className="text-[#35522b]" />
              </div>
              <div className="space-y-3">
                {performance.map((student, index) => (
                  <div key={student.name} className="flex items-center gap-3">
                    <Avatar name={student.name} index={index} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-bold text-[#172115] dark:text-[#ecf1ea]">{student.name}</p>
                      <p className="text-[9.5px] text-[#707c6c]">{student.group}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">{student.score}</span>
                    <Star size={13} className="text-[#f08c20]" />
                  </div>
                ))}
              </div>
            </article>

            <article id="activities" className="rounded-xl border border-[#e2e7dd] bg-white p-4 shadow-[0_1px_3px_rgba(21,32,18,0.04)] dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#ecf1ea]">My Notes</h2>
                <span className="rounded-full bg-[#eaf4e6] px-2 py-0.5 text-[9px] font-bold text-[#2c6e21]">10</span>
              </div>
              <div className="space-y-2.5">
                {notes.map((note) => (
                  <div key={note.title} className="rounded-lg bg-[#f6f8f3] p-3 dark:bg-[#1b2819]">
                    <p className="text-[11px] font-bold text-[#172115] dark:text-[#ecf1ea]">{note.title}</p>
                    <p className="mt-1 text-[9.5px] text-[#707c6c]">{note.detail}</p>
                    <p className="mt-2 text-[9px] font-semibold text-[#9aa395]">{note.date}</p>
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
