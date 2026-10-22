"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Bell, Flag, Info, Search } from "lucide-react";

type TabId = "reports" | "permissions";
type IncidentStatus = "Open" | "In review" | "Resolved";
type Role = "teacher" | "learner" | "admin";

type ClassInfo = { id: string; name: string; short: string };

type AttendanceRow = {
  id: string;
  classId: string;
  teacher: string;
  initials: string;
  date: string;
  day: number;
  attended: number;
  total: number;
};

type Incident = {
  id: string;
  date: string;
  day: number;
  classId: string;
  person: string;
  type: string;
  session: "Teaching" | "Exam";
  clip: string;
  status: IncidentStatus;
  reporter: string;
  time: string;
  detail: string;
  during: string;
  evidence: string;
  assignee: string;
};

const classInfo: ClassInfo[] = [
  { id: "algebra-a", name: "Algebra I · Class A", short: "Algebra I · A" },
  { id: "geometry-b", name: "Geometry · Class B", short: "Geometry · B" },
  { id: "biology-d", name: "Biology · Class D", short: "Biology · D" },
  { id: "english-e", name: "English · Class E", short: "English · E" },
];

const classById = (id: string) => classInfo.find((c) => c.id === id)!;

const attendance: AttendanceRow[] = [
  { id: "a1", classId: "algebra-a", teacher: "Mutiti Stivo", initials: "MS", date: "12 Oct 2026", day: 12, attended: 26, total: 28 },
  { id: "a2", classId: "geometry-b", teacher: "Mutiti Stivo", initials: "MS", date: "13 Oct 2026", day: 13, attended: 29, total: 30 },
  { id: "a3", classId: "biology-d", teacher: "Mutiti Stivo", initials: "MS", date: "12 Oct 2026", day: 12, attended: 31, total: 32 },
];

const initialIncidents: Incident[] = [
  {
    id: "INC-014", date: "14 Oct · 09:18", day: 14, classId: "algebra-a",
    person: "Ethan Brown", type: "Disruptive chat", session: "Teaching", clip: "00:45",
    status: "Open", reporter: "Mutiti Stivo", time: "09:18",
    detail: "posted repeated off-topic messages", during: "Algebra I",
    evidence: "09:17:45–09:18:30", assignee: "Alex Morgan",
  },
  // placeholder details: the screenshot only shows the table row for INC-013 and INC-012
  {
    id: "INC-013", date: "13 Oct · 11:24", day: 13, classId: "geometry-b",
    person: "Noah Williams", type: "Left full screen", session: "Exam", clip: "00:30",
    status: "In review", reporter: "Mutiti Stivo", time: "11:24",
    detail: "left full screen", during: "Geometry",
    evidence: "11:23:50–11:24:20", assignee: "Alex Morgan",
  },
  {
    id: "INC-012", date: "12 Oct · 11:16", day: 12, classId: "english-e",
    person: "Emma Wilson", type: "Disruptive audio", session: "Teaching", clip: "00:35",
    status: "Resolved", reporter: "Mutiti Stivo", time: "11:16",
    detail: "played disruptive audio", during: "English",
    evidence: "11:15:55–11:16:30", assignee: "Alex Morgan",
  },
];

const ranges = [
  { label: "01–14 Oct 2026", from: 1, to: 14 },
  { label: "01–07 Oct 2026", from: 1, to: 7 },
  { label: "08–14 Oct 2026", from: 8, to: 14 },
  { label: "12–14 Oct 2026", from: 12, to: 14 },
];

const capabilities = [
  { key: "create", label: "Create class" },
  { key: "share", label: "Share screen" },
  { key: "whiteboard", label: "Whiteboard" },
  { key: "exams", label: "Launch exams" },
];

const initialPerms: Record<string, Record<Role, boolean>> = Object.fromEntries(
  capabilities.map((c) => [c.key, { teacher: true, learner: false, admin: false }])
);

const PLATFORM_ATTENDANCE = "92.9%";

const sectionId: Record<TabId, string> = {
  reports: "attendance-reports",
  permissions: "permissions",
};

const card =
  "rounded-xl border border-[#e9ece4] bg-white shadow-[0_1px_3px_rgba(21,32,18,0.04)]";
const cardTitle = "text-[14px] font-bold leading-5 text-[#111c0f]";
const cardSub = "mt-[6px] text-[11px] leading-[14px] text-[#63715d]";
const tableHead =
  "grid h-10 items-center rounded-lg bg-[#f2f5ee] px-[11px] text-[10px] font-medium text-[#63715d]";
const rowBase =
  "grid items-center border-b border-[#f2f4ef] px-[11px] text-[11px] text-[#3d473c]";
const lightBtn =
  "rounded-full bg-[#f2f5ee] text-[11px] font-semibold text-[#111c0f] transition-colors hover:bg-[#e3eedf]";
const fieldCls =
  "h-[35px] w-full rounded-lg border border-[#edefe8] bg-white px-[11px] text-[11px] text-[#111c0f] outline-none focus:border-[#263a20]";

const pct = (a: number, t: number) => `${((a / t) * 100).toFixed(1)}%`;

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#e3eedf] text-[9px] font-bold text-[#263a20]">
      {initials}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[21px] w-[37px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#263a20]" : "bg-[#b9cbb0]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[15px] w-[15px] rounded-full bg-white transition-all ${
          checked ? "left-[19px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function IncidentPill({ status }: { status: IncidentStatus }) {
  const tone =
    status === "Open"
      ? "bg-[#fde8ef] text-[#b65b78]"
      : status === "In review"
      ? "bg-[#fae8db] text-[#7a4b2a]"
      : "bg-[#e3eedf] text-[#3d5038]";

  return (
    <span
      className={`inline-flex h-[21px] items-center rounded-full px-[10px] text-[10px] font-bold ${tone}`}
    >
      {status}
    </span>
  );
}

export default function ReportsPermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("reports");
  const [query, setQuery] = useState("");

  // filters: draft values are applied with "Apply filters"
  const [classDraft, setClassDraft] = useState("all");
  const [rangeDraft, setRangeDraft] = useState(0);
  const [applied, setApplied] = useState({ classId: "all", range: 0 });

  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState("INC-014");

  const [perms, setPerms] = useState(initialPerms);
  const [classLimit, setClassLimit] = useState("3");
  const [seats, setSeats] = useState("100");

  const q = query.trim().toLowerCase();
  const match = (...parts: string[]) =>
    !q || parts.join(" ").toLowerCase().includes(q);

  const range = ranges[applied.range];
  const inFilters = (classId: string, day: number) =>
    (applied.classId === "all" || applied.classId === classId) &&
    day >= range.from &&
    day <= range.to;

  const visibleAttendance = attendance.filter(
    (r) =>
      inFilters(r.classId, r.day) &&
      match(r.teacher, classById(r.classId).name)
  );
  const visibleIncidents = incidents.filter(
    (i) =>
      inFilters(i.classId, i.day) &&
      match(i.person, i.id, classById(i.classId).name)
  );

  const openCount = incidents.filter((i) => i.status !== "Resolved").length;
  const selected = incidents.find((i) => i.id === selectedIncident);

  const goTo = (tab: TabId) => {
    setActiveTab(tab);
    document
      .getElementById(sectionId[tab])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setStatus = (id: string, status: IncidentStatus) =>
    setIncidents((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));

  const review = (i: Incident) => {
    if (i.status === "Open") setStatus(i.id, "In review");
    setSelectedIncident(i.id);
  };

  const resolve = (i: Incident) => {
    if (window.confirm(`Mark ${i.id} as resolved? The outcome stays in the audit log.`)) {
      setStatus(i.id, "Resolved");
      setSelectedIncident(i.id);
    }
  };

  const applyFilters = () =>
    setApplied({ classId: classDraft, range: rangeDraft });

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ["Attendance reports"],
      ["Class", "Teacher", "Date", "Attended", "Total", "Attendance"],
      ...visibleAttendance.map((r) => [
        classById(r.classId).name,
        r.teacher,
        r.date,
        r.attended,
        r.total,
        pct(r.attended, r.total),
      ]),
      [],
      ["Incident log"],
      ["ID", "Date", "Class", "Person", "Type", "Session", "Clip", "Status"],
      ...visibleIncidents.map((i) => [
        i.id,
        i.date,
        classById(i.classId).short,
        i.person,
        i.type,
        i.session,
        `${i.clip} clip`,
        i.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const setPerm = (key: string, role: Role, value: boolean) =>
    setPerms((p) => ({ ...p, [key]: { ...p[key], [role]: value } }));

  const tabs: { id: TabId; label: string }[] = [
    { id: "reports", label: "Reports" },
    { id: "permissions", label: "Permissions" },
  ];

  return (
    <DashboardShell role="admin">
      <div className="pb-8 pt-1">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-9 tracking-[-0.03em] text-[#111c0f]">
              Reports &amp; Permissions
            </h1>
            <p className="mt-2 text-[12px] leading-4 text-[#63715d]">
              Reliable records, thoughtful access and safer classrooms.
            </p>
          </div>

          <div className="mt-2 flex items-center gap-5">
            <label className="flex h-[39px] w-[247px] items-center gap-2.5 rounded-full border border-[#e9ece4] bg-white px-[15px]">
              <Search size={13} className="shrink-0 text-[#63715d]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teachers, classes..."
                className="w-full bg-transparent text-[10px] text-[#111c0f] outline-none placeholder:text-[#8a9485]"
              />
            </label>

            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9ece4] bg-white text-[#263a20]"
            >
              <Bell size={13} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-[27px] flex items-center gap-2.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => goTo(t.id)}
              className={`h-8 rounded-full px-[17px] text-[11px] font-semibold transition-colors ${
                activeTab === t.id
                  ? "bg-[#263a20] text-white"
                  : "bg-[#f2f5ee] text-[#63715d] hover:bg-[#e3eedf]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-[10px] flex flex-wrap items-end gap-[11px] border-t border-[#edefe8] pt-[19px]">
          <div className="w-[236px]">
            <label
              htmlFor="filter-class"
              className="block text-[10px] font-bold leading-3 text-[#111c0f]"
            >
              Class
            </label>
            <select
              id="filter-class"
              value={classDraft}
              onChange={(e) => setClassDraft(e.target.value)}
              className={`${fieldCls} mt-[7px] cursor-pointer appearance-none`}
            >
              <option value="all">All classes</option>
              {classInfo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-[214px]">
            <label
              htmlFor="filter-range"
              className="block text-[10px] font-bold leading-3 text-[#111c0f]"
            >
              Date range
            </label>
            <select
              id="filter-range"
              value={rangeDraft}
              onChange={(e) => setRangeDraft(Number(e.target.value))}
              className={`${fieldCls} mt-[7px] cursor-pointer appearance-none`}
            >
              {ranges.map((r, i) => (
                <option key={r.label} value={i}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={applyFilters}
            className={`${lightBtn} h-[35px] px-[17px]`}
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="h-[35px] rounded-full bg-[#263a20] px-[17px] text-[11px] font-semibold text-white transition-colors hover:bg-[#35522b]"
          >
            Export
          </button>
        </div>

        {/* Attendance reports */}
        <section
          id={sectionId.reports}
          className={`${card} mt-6 px-[22px] pb-[22px] pt-[22px]`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cardTitle}>Attendance reports</h2>
              <p className={cardSub}>
                Automatically captured at join · Latest completed sessions
              </p>
            </div>
            <span className="inline-flex h-[22px] items-center rounded-full bg-[#e3eedf] px-[11px] text-[10px] font-bold text-[#3d5038]">
              {PLATFORM_ATTENDANCE} platform attendance
            </span>
          </div>

          <div className="mt-[18px] overflow-x-auto">
            <div className="min-w-[900px]">
              <div
                className={`${tableHead} grid-cols-[246px_219px_177px_206px_1fr]`}
              >
                <span>Class</span>
                <span>Teacher</span>
                <span>Date</span>
                <span>Attendance</span>
                <span>Action</span>
              </div>

              {visibleAttendance.map((r) => (
                <div
                  key={r.id}
                  className={`${rowBase} h-[59px] grid-cols-[246px_219px_177px_206px_1fr]`}
                >
                  <span>{classById(r.classId).name}</span>
                  <div className="flex items-center gap-[10px]">
                    <Avatar initials={r.initials} />
                    <span className="font-bold text-[#111c0f]">{r.teacher}</span>
                  </div>
                  <span>{r.date}</span>
                  <span>
                    {r.attended}/{r.total} · {pct(r.attended, r.total)}
                  </span>
                  <div>
                    <button
                      type="button"
                      // TODO: open the full report
                      className={`${lightBtn} h-[34px] px-[17px]`}
                    >
                      View report
                    </button>
                  </div>
                </div>
              ))}

              {visibleAttendance.length === 0 && (
                <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                  No attendance reports match these filters.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Incident log */}
        <section className={`${card} mt-[26px] px-[22px] pb-5 pt-[22px]`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cardTitle}>Incident Log</h2>
              <p className={cardSub}>
                Teaching and exam incidents · Clips linked to retained session
                recordings
              </p>
            </div>
            <span className="inline-flex h-[21px] items-center rounded-full bg-[#fde8ef] px-[11px] text-[10px] font-bold text-[#b65b78]">
              {openCount} open
            </span>
          </div>

          <div className="mt-[18px] overflow-x-auto">
            <div className="min-w-[960px]">
              <div
                className={`${tableHead} grid-cols-[121px_159px_127px_141px_81px_103px_108px_1fr]`}
              >
                <span>Date / ID</span>
                <span>Class</span>
                <span>Person</span>
                <span>Type</span>
                <span>Session</span>
                <span>Clip</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {visibleIncidents.map((i) => (
                <div
                  key={i.id}
                  className={`${rowBase} min-h-[59px] grid-cols-[121px_159px_127px_141px_81px_103px_108px_1fr] py-[14px]`}
                >
                  <div className="leading-[14px]">
                    <p>{i.date}</p>
                    <p>{i.id}</p>
                  </div>
                  <span>{classById(i.classId).short}</span>
                  <span>{i.person}</span>
                  <span>{i.type}</span>
                  <span>{i.session}</span>

                  <button
                    type="button"
                    // TODO: play the evidence clip
                    className="flex w-fit items-center gap-1 text-[11px] font-bold text-[#111c0f] hover:underline"
                  >
                    <span className="text-[8px]">▶</span>
                    {i.clip} clip
                  </button>

                  <span>
                    <IncidentPill status={i.status} />
                  </span>

                  <div className="flex flex-col items-start gap-[3px]">
                    {i.status === "Resolved" ? (
                      <button
                        type="button"
                        onClick={() => setSelectedIncident(i.id)}
                        className="text-[11px] font-bold text-[#111c0f] hover:underline"
                      >
                        View outcome
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => review(i)}
                          className={`${lightBtn} h-[34px] px-[18px]`}
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => resolve(i)}
                          className="text-[11px] font-bold text-[#111c0f] hover:underline"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {visibleIncidents.length === 0 && (
                <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                  No incidents match these filters.
                </p>
              )}
            </div>
          </div>

          {selected && (
            <div className="mt-[18px] rounded-xl bg-[#fde8ef] px-[22px] py-[17px]">
              <div className="flex items-center gap-2">
                <Flag size={13} className="shrink-0 text-[#263a20]" />
                <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
                  {selected.id} ·{" "}
                  {selected.status === "Resolved" ? "Outcome" : "Review details"}
                </p>
              </div>
              <p className="mt-[7px] pl-[21px] text-[11px] leading-[14px] text-[#63715d]">
                Reported by {selected.reporter} at {selected.time}.{" "}
                {selected.person} {selected.detail} during {selected.during}.
                Evidence clip: {selected.evidence}. Assigned to{" "}
                {selected.assignee}.
              </p>
            </div>
          )}
        </section>

        {/* Permissions */}
        <section
          id={sectionId.permissions}
          className={`${card} mt-[25px] px-[22px] pb-[22px] pt-[22px]`}
        >
          <h2 className={cardTitle}>Permissions · alternate state</h2>
          <p className={cardSub}>
            Role defaults · Changes are logged and apply to future sessions
          </p>

          <div className="mt-[19px] flex gap-[7px]">
            <button
              type="button"
              onClick={() => goTo("reports")}
              className="h-[35px] rounded-full bg-[#f2f5ee] px-[18px] text-[11px] font-semibold text-[#63715d] transition-colors hover:bg-[#e3eedf]"
            >
              Reports
            </button>
            <button
              type="button"
              onClick={() => goTo("permissions")}
              className="h-[35px] rounded-full bg-[#263a20] px-[18px] text-[11px] font-semibold text-white"
            >
              Permissions
            </button>
          </div>

          <div className="mt-[11px] overflow-x-auto border-t border-[#f2f4ef] pt-[18px]">
            <div className="min-w-[900px]">
              <div className={`${tableHead} grid-cols-[394px_186px_188px_1fr]`}>
                <span>Capability</span>
                <span>Teacher</span>
                <span>Learner</span>
                <span>Admin observer</span>
              </div>

              {capabilities.map((c) => (
                <div
                  key={c.key}
                  className={`${rowBase} h-[59px] grid-cols-[394px_186px_188px_1fr]`}
                >
                  <span className="font-bold text-[#111c0f]">{c.label}</span>

                  <div>
                    <Toggle
                      label={`${c.label}: teacher`}
                      checked={perms[c.key].teacher}
                      onChange={(v) => setPerm(c.key, "teacher", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between pr-[11px]">
                    <span className="font-bold text-[#111c0f]">
                      {perms[c.key].learner ? "On" : "Off"}
                    </span>
                    <Toggle
                      label={`${c.label}: learner`}
                      checked={perms[c.key].learner}
                      onChange={(v) => setPerm(c.key, "learner", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111c0f]">
                      {perms[c.key].admin ? "On" : "Off"}
                    </span>
                    <Toggle
                      label={`${c.label}: admin observer`}
                      checked={perms[c.key].admin}
                      onChange={(v) => setPerm(c.key, "admin", v)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-[21px] grid grid-cols-1 gap-[19px] sm:grid-cols-2">
            <div>
              <label
                htmlFor="class-limit"
                className="block text-[10px] font-bold leading-3 text-[#111c0f]"
              >
                Class limit per teacher
              </label>
              <input
                id="class-limit"
                type="number"
                min={1}
                value={classLimit}
                onChange={(e) => setClassLimit(e.target.value)}
                className={`${fieldCls} mt-2 h-[38px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </div>
            <div>
              <label
                htmlFor="max-seats"
                className="block text-[10px] font-bold leading-3 text-[#111c0f]"
              >
                Maximum seats per class
              </label>
              <input
                id="max-seats"
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className={`${fieldCls} mt-2 h-[38px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </div>
          </div>

          {/* placeholder wording: this banner is hidden behind the toolbar in the screenshot */}
          <div className="mt-[18px] rounded-xl bg-[#e3eedf] px-[22px] py-4">
            <div className="flex items-center gap-2">
              <Info size={13} className="shrink-0 text-[#263a20]" />
              <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
                Changes are logged
              </p>
            </div>
            <p className="mt-[7px] pl-[21px] text-[11px] leading-[14px] text-[#63715d]">
              Every permission change is recorded in the audit log and applies
              to future sessions only.
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}