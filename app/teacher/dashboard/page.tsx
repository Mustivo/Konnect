import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Classes", icon: BookOpen, badge: "3/3" },
  { label: "Attendance", icon: CalendarDays },
  { label: "Students Roster", icon: Users },
  { label: "Activities", icon: ClipboardList, expandable: true },
  { label: "Grades & Reports", icon: GraduationCap },
  { label: "Analytics", icon: LineChart },
  { label: "Messages", icon: Mail, badge: "2" },
  { label: "Settings", icon: Settings },
];

const overviewStats = [
  { label: "Received", value: "127", icon: CheckCircle2, tone: "bg-[#dcead3] text-[#527948]" },
  { label: "Yet to Receive", value: "58", icon: ChevronDown, tone: "bg-[#f7dfcf] text-[#d9783d]" },
  { label: "Pending Review", value: "42", icon: FileText, tone: "bg-[#f8d9e5] text-[#df4f86]" },
  { label: "Reviewed", value: "25", icon: Check, tone: "bg-[#dcebd9] text-[#57834f]" },
  { label: "Classes Created", value: "3/3", icon: BarChart3, tone: "bg-[#d9ecfb] text-[#3d8bc1]" },
];

const performance = [
  { name: "Oliver James", className: "G1 / Class - B", score: "97%" },
  { name: "David Peter", className: "G1 / Class - B", score: "95%" },
  { name: "Lilly Paul", className: "G1 / Class - B", score: "92%" },
];

const approvals = [
  { name: "Oliver James", meta: "G1 / Class - A - 5 mins ago" },
  { name: "David Peter", meta: "G1 / Class - B - 12 mins ago" },
  { name: "Lilly Paul", meta: "G1 / Class - B" },
];

const notes = [
  { title: "Prepare Questions for Unit Test", text: "Prepare questions for unit tests", date: "05 Dec 2026" },
  { title: "Announcements to Students", text: "Announce important updates to", date: "01 Dec 2026" },
];

const classes = [
  {
    code: "MATH 101 - GRADE 1",
    title: "Math Algebra Unit Formula",
    group: "G1 / Class - A",
    students: 28,
    tasks: 12,
    time: "Mon, Wed, Fri (09:00 AM)",
  },
  {
    code: "ALG 201 - GRADE 1",
    title: "Advanced Linear Geometry",
    group: "G1 / Class - B",
    students: 30,
    tasks: 18,
    time: "Tue, Thu (11:00 AM)",
  },
  {
    code: "GEOM 301 - GRADE 2",
    title: "Trigonometry & Spatial Math",
    group: "G2 / Class - C",
    students: 25,
    tasks: 8,
    time: "Mon, Wed (02:00 PM)",
  },
];

const plannerItems = [
  { title: "Maths Algebra Unit Formula", group: "G1 / Class - A", status: "Overdue" },
  { title: "Linear Functions Review", group: "G1 / Class - B", status: "Today" },
];

function Avatar({ name, index }: { name: string; index: number }) {
  const palettes = ["bg-[#1f3520]", "bg-[#6d4938]", "bg-[#263d4c]"];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${palettes[index % palettes.length]} text-[10px] font-bold text-white shadow-sm`}
    >
      {initials}
    </span>
  );
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[8px] bg-white shadow-[0_8px_24px_rgba(38,53,32,0.07)] ${className}`}>{children}</section>;
}

export default function TeacherDashboardPage() {
  return (
    <main className="min-h-screen bg-[#edf0e8] text-[#162314]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] bg-[#f7f8f3]">
        <aside className="hidden w-[224px] shrink-0 flex-col bg-[#d6e4cb] px-5 py-5 lg:flex">
          <Link href="/" aria-label="Konnect home" className="mb-8 inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/konnect-wordmark.png" alt="Konnect" className="h-11 w-auto" />
          </Link>

          <nav className="flex flex-1 flex-col gap-2 text-[13px] font-semibold">
            {navItems.map(({ label, icon: Icon, active, badge, expandable }) => (
              <a
                key={label}
                href="#"
                className={`flex min-h-11 items-center gap-3 rounded-[6px] px-3 ${
                  active ? "bg-white text-[#172417] shadow-sm" : "text-[#20331e] hover:bg-white/55"
                }`}
              >
                <Icon size={17} strokeWidth={1.9} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-[#314f2c]">{badge}</span>
                ) : null}
                {expandable ? <ChevronDown size={14} /> : null}
              </a>
            ))}
          </nav>

          <div className="rounded-[8px] bg-[#eef5e9] p-4 text-[12px] text-[#51624c]">
            <div className="mb-3 flex items-center justify-between font-bold text-[#172417]">
              <span>Class creation limit</span>
              <span>3/3 Max</span>
            </div>
            <div className="h-2 rounded-full bg-[#c9d9bf]">
              <div className="h-2 w-full rounded-full bg-[#223b20]" />
            </div>
            <p className="mt-3 leading-5">Maximum 3 classes per teacher reached.</p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#243d21] text-sm font-bold text-white">
              EF
            </span>
            <div>
              <p className="text-[13px] font-bold">Edna Francis</p>
              <p className="text-[11px] text-[#5f7059]">Lead Mathematics Teacher</p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-7">
          <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[32px] font-extrabold leading-none tracking-[0] text-[#152113] sm:text-[36px]">
                Dashboard
              </h1>
              <p className="mt-2 max-w-md text-[13px] leading-5 text-[#66715f]">
                Overview of student approvals, class performance, notes & tasks
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-11 w-full min-w-[260px] items-center gap-3 rounded-full bg-white px-4 text-[#7d8777] shadow-sm sm:w-[300px] lg:w-[360px]">
                <Search size={16} />
                <input
                  type="search"
                  aria-label="Search programs and assessments"
                  placeholder="Search programs, assessments..."
                  className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#8a9384]"
                />
              </label>

              <button aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                <Bell size={18} />
                <span className="absolute right-2 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f18130] text-[10px] font-bold text-white">
                  1
                </span>
              </button>

              <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[#dbe8cf] px-5 text-[12px] font-extrabold text-[#183116] shadow-sm">
                <Plus size={16} />
                <span>Create Class</span>
              </button>

              <div className="flex h-12 items-center rounded-full bg-[#dbe8cf] px-4 text-center text-[11px] font-bold leading-4 text-[#314f2c] shadow-sm">
                <span>3/3<br />Limit</span>
              </div>
            </div>
          </header>

          <SectionCard className="mb-6 p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-extrabold">Assignments & Classes Overview</h2>
              <button className="inline-flex h-9 items-center gap-2 rounded-full bg-[#eff4eb] px-4 text-[12px] font-bold text-[#41523d]">
                Assignments
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="grid gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
              {overviewStats.map(({ label, value, icon: Icon, tone }, index) => (
                <div
                  key={label}
                  className={`flex flex-col items-center px-4 text-center ${index > 0 ? "lg:border-l lg:border-[#edf0e9]" : ""}`}
                >
                  <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <strong className="text-[28px] font-extrabold leading-7 text-[#172417]">{value}</strong>
                  <span className="mt-2 text-[12px] font-medium text-[#6e7968]">{label}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid flex-1 gap-6 xl:grid-cols-[1fr_430px]">
            <div className="min-w-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <h2 className="max-w-[140px] text-[15px] font-extrabold leading-5">Students Performance</h2>
                    <button className="inline-flex h-8 items-center gap-1 rounded-full bg-[#eef4e9] px-3 text-[11px] font-bold text-[#527948]">
                      Mastery
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {performance.map((student, index) => (
                      <div key={student.name} className="flex items-center gap-3">
                        <Avatar name={student.name} index={index} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-extrabold">{student.name}</p>
                          <p className="text-[11px] font-medium text-[#7a8575]">{student.className}</p>
                        </div>
                        <span className="text-[13px] font-extrabold">{student.score}</span>
                        <Star size={15} className="text-[#f2a348]" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end border-t border-[#eef1eb] pt-4">
                    <a href="#" className="inline-flex items-center gap-1 text-[12px] font-extrabold">
                      View All Students
                      <ChevronRight size={13} />
                    </a>
                  </div>
                </SectionCard>

                <SectionCard className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <h2 className="max-w-[145px] text-[15px] font-extrabold leading-5">Students Pending Approval</h2>
                    <span className="rounded-full bg-[#fde8d4] px-3 py-1 text-[11px] font-extrabold text-[#c86a23]">3 Waiting</span>
                  </div>

                  <div className="space-y-3">
                    {approvals.map((student, index) => (
                      <div key={student.name} className="flex items-center gap-3 rounded-[8px] bg-[#f6f8f3] px-3 py-3">
                        <Avatar name={student.name} index={index} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-extrabold">{student.name}</p>
                          <p className="truncate text-[10px] font-medium text-[#7a8575]">{student.meta}</p>
                        </div>
                        <button className="inline-flex h-8 items-center gap-1 rounded-full bg-[#213b1f] px-3 text-[11px] font-extrabold text-white">
                          <Check size={13} />
                          Approve
                        </button>
                        <button aria-label={`Reject ${student.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#6f7869]">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 text-[10px] font-medium text-[#7c8776]">
                    <p className="max-w-[145px] leading-4">Class capacity alert: 28/30 seats filled</p>
                    <a href="#" className="inline-flex items-center gap-1 text-[12px] font-extrabold text-[#172417]">
                      View All Requests
                      <ChevronRight size={13} />
                    </a>
                  </div>
                </SectionCard>
              </div>

              <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[16px] font-extrabold">
                  My Active Classes
                  <span className="ml-2 rounded-full bg-[#254020] px-3 py-1 text-[11px] text-white">3 / 3 Max Limit Reached</span>
                </h2>
                <p className="text-[11px] font-medium text-[#798473]">Teachers are limited to 3 active classes max</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {classes.map((item) => (
                  <article key={item.title} className="rounded-[8px] bg-white p-5 shadow-[0_8px_24px_rgba(38,53,32,0.07)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-[10px] font-extrabold uppercase text-[#8b9585]">{item.code}</p>
                      <span className="rounded-full bg-[#edf4e8] px-2 py-1 text-[10px] font-extrabold text-[#527948]">Active</span>
                    </div>

                    <h3 className="min-h-10 text-[14px] font-extrabold leading-5">{item.title}</h3>
                    <p className="mt-1 text-[12px] font-semibold text-[#6e7968]">{item.group}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] font-semibold text-[#6d7867]">
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} />
                        {item.students} Students
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClipboardList size={13} />
                        {item.tasks} Pending Tasks
                      </span>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-3">
                      <p className="max-w-[110px] text-[11px] font-semibold leading-4 text-[#75806f]">{item.time}</p>
                      <button className="inline-flex h-9 items-center gap-2 rounded-full bg-[#203b1f] px-4 text-[11px] font-extrabold text-white">
                        Manage Class
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="grid content-start gap-6">
              <SectionCard className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-[15px] font-extrabold">
                    My Notes
                    <span className="ml-2 rounded-full bg-[#e5efde] px-2 py-1 text-[11px] text-[#527948]">10</span>
                  </h2>
                  <button className="h-8 rounded-full border border-[#dfe6da] px-3 text-[11px] font-extrabold">+ Add Notes</button>
                </div>

                <div className="space-y-3">
                  {notes.map((note) => (
                    <article key={note.title} className="flex gap-3 rounded-[8px] bg-[#f5f8f2] p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e0edd8] text-[#5f854e]">
                        <FileText size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-extrabold">{note.title}</h3>
                        <p className="mt-1 text-[11px] font-medium text-[#75806f]">{note.text}</p>
                        <p className="mt-3 text-[10px] font-semibold text-[#9aa395]">{note.date}</p>
                      </div>
                      <button aria-label={`${note.title} options`} className="self-start text-[#7f8979]">
                        <MoreVertical size={15} />
                      </button>
                    </article>
                  ))}
                </div>

                <div className="mt-7 flex justify-end">
                  <a href="#" className="inline-flex items-center gap-1 text-[12px] font-extrabold">
                    View All Notes
                    <ChevronRight size={13} />
                  </a>
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-[15px] font-extrabold">My Planner</h2>
                    <p className="mt-1 text-[11px] font-semibold text-[#747f6e]">Dec 12, Thursday</p>
                  </div>
                  <button className="inline-flex h-8 items-center gap-1 rounded-full bg-[#eef4e9] px-3 text-[11px] font-bold text-[#41523d]">
                    Dec 2026
                    <ChevronDown size={13} />
                  </button>
                </div>

                <div className="mb-4 grid grid-cols-7 text-center text-[10px] font-bold text-[#7b8676]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <span key={`${day}-${index}`}>{day}</span>
                  ))}
                  {[8, 9, 10, 11, 12, 13, 14].map((date) => (
                    <span
                      key={date}
                      className={`mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-full ${
                        date === 12 ? "bg-[#1f3b1e] text-white" : ""
                      }`}
                    >
                      {date}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  {plannerItems.map((item) => (
                    <article key={item.title} className="flex items-center justify-between gap-3 rounded-[8px] bg-[#f6f8f3] p-4">
                      <div>
                        <h3 className="text-[13px] font-extrabold">{item.title}</h3>
                        <p className="mt-1 text-[11px] font-semibold text-[#747f6e]">{item.group}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
                          item.status === "Overdue" ? "bg-[#fde4e4] text-[#e8495a]" : "bg-[#e7f3df] text-[#517c46]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
