"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Bell, Info, Play, Search } from "lucide-react";

type TabId = "all" | "live" | "records";

type Learner = { initials: string; name: string; status: string };

type ClassRow = {
  id: string;
  name: string;
  short: string;
  teacher: string;
  initials: string;
  learners: number;
  session: string;
  status: "Live" | "Scheduled";
  live?: {
    started: string;
    raisedHands: number;
    incident?: string;
    roster: Learner[];
  };
};

type RecordRow = {
  id: string;
  date: string;
  teacher: string;
  initials: string;
  className: string;
  attended: number;
  total: number;
  minutes: number;
  incident: string | null;
};

const MAX_LEARNERS = 100;
const TOTAL_CLASSES = 62;

const classes: ClassRow[] = [
  {
    id: "algebra-a",
    name: "Algebra I · Class A",
    short: "Algebra I · A",
    teacher: "Edna Francis",
    initials: "EF",
    learners: 28,
    session: "14 Oct · 09:00–09:50",
    status: "Live",
    live: {
      started: "09:00",
      raisedHands: 2,
      incident: "INC-014",
      roster: [
        { initials: "OJ", name: "Oliver James", status: "Present · 08:58" },
        { initials: "DP", name: "David Peter", status: "Present · 08:58" },
        { initials: "LP", name: "Lilly Paul", status: "Hand raised" },
        { initials: "EB", name: "Ethan Brown", status: "Present · Incident flagged" },
        { initials: "MD", name: "Mia Davis", status: "Hand raised" },
      ],
    },
  },
  {
    id: "biology-d",
    name: "Biology · Class D",
    short: "Biology · D",
    teacher: "Michael Reed",
    initials: "MR",
    learners: 32,
    session: "14 Oct · 09:00–09:50",
    status: "Live",
    // placeholder: the screenshot doesn't show this class's details
    live: { started: "09:00", raisedHands: 0, roster: [] },
  },
  { id: "geometry-b", name: "Geometry · Class B", short: "Geometry · B", teacher: "Edna Francis", initials: "EF", learners: 30, session: "15 Oct · 10:00–11:50", status: "Scheduled" },
  { id: "precalculus-c", name: "Precalculus · Class C", short: "Precalculus · C", teacher: "Edna Francis", initials: "EF", learners: 25, session: "14 Oct · 14:00–14:50", status: "Scheduled" },
  { id: "english-e", name: "English · Class E", short: "English · E", teacher: "Priya Shah", initials: "PS", learners: 29, session: "14 Oct · 11:00–11:50", status: "Scheduled" },
];

const records: RecordRow[] = [
  { id: "r1", date: "12 Oct · 09:00", teacher: "Edna Francis", initials: "EF", className: "Algebra I · Class A", attended: 26, total: 28, minutes: 50, incident: null },
  { id: "r2", date: "13 Oct · 11:00", teacher: "Edna Francis", initials: "EF", className: "Geometry · Class B", attended: 29, total: 30, minutes: 50, incident: "INC-013" },
  { id: "r3", date: "12 Oct · 09:00", teacher: "Michael Reed", initials: "MR", className: "Biology · Class D", attended: 31, total: 32, minutes: 50, incident: null },
  // placeholder: this row is hidden behind the toolbar in the screenshot (only its date is visible)
  { id: "r4", date: "12 Oct · 11:00", teacher: "Priya Shah", initials: "PS", className: "English · Class E", attended: 27, total: 29, minutes: 50, incident: null },
];

const sectionId: Record<TabId, string> = {
  all: "all-classes",
  live: "live-now",
  records: "records",
};

const card =
  "rounded-xl border border-[#e9ece4] bg-white shadow-[0_1px_3px_rgba(21,32,18,0.04)]";
const cardTitle = "text-[14px] font-bold leading-5 text-[#111c0f]";
const cardSub = "mt-1 text-[11px] leading-[14px] text-[#63715d]";
const tableHead =
  "grid h-[39px] items-center rounded-lg bg-[#f2f5ee] px-[11px] text-[10px] font-medium text-[#63715d]";
const rowBase =
  "grid h-[59px] items-center border-b border-[#f2f4ef] px-[11px] text-[11px] text-[#111c0f]";
const pillBtn =
  "h-[34px] rounded-full bg-[#f2f5ee] px-[18px] text-[11px] font-semibold text-[#111c0f] transition-colors hover:bg-[#e3eedf]";
const joinBtn =
  "h-8 rounded-full bg-[#263a20] px-[14px] text-[11px] font-semibold text-white transition-colors hover:bg-[#35522b]";

const pct = (a: number, t: number) => `${((a / t) * 100).toFixed(1)}%`;

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#e3eedf] text-[9px] font-bold text-[#263a20]">
      {initials}
    </span>
  );
}

function StatusPill({ status }: { status: ClassRow["status"] }) {
  return status === "Live" ? (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-full bg-[#fde8ef] px-[10px] text-[10px] font-bold text-[#ac4767]">
      <span className="h-[5px] w-[5px] rounded-full bg-[#c06f89]" />
      Live
    </span>
  ) : (
    <span className="inline-flex h-5 items-center rounded-full bg-[#e0efff] px-[10px] text-[10px] font-bold text-[#3b5f9d]">
      Scheduled
    </span>
  );
}

export default function AdminClassesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("algebra-a");

  const q = query.trim().toLowerCase();
  const match = (...parts: string[]) =>
    !q || parts.join(" ").toLowerCase().includes(q);

  const visibleClasses = classes.filter((c) => match(c.name, c.teacher));
  const liveClasses = classes.filter((c) => c.status === "Live");
  const visibleLive = liveClasses.filter((c) => match(c.short, c.teacher));
  const visibleRecords = records.filter((r) =>
    match(r.teacher, r.className, r.date)
  );

  const selected =
    liveClasses.find((c) => c.id === selectedId) ?? liveClasses[0];

  const goTo = (tab: TabId) => {
    setActiveTab(tab);
    document
      .getElementById(sectionId[tab])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // "Join" gives observation access: it selects the live class and shows its details
  const join = (id: string) => {
    setSelectedId(id);
    setActiveTab("live");
    document
      .getElementById(sectionId.live)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const exportClasses = () =>
    downloadCsv("classes.csv", [
      ["Class", "Teacher", "Learners", "Max learners", "Next / current session", "Status"],
      ...visibleClasses.map((c) => [
        c.name,
        c.teacher,
        c.learners,
        MAX_LEARNERS,
        c.session,
        c.status,
      ]),
    ]);

  const exportAttendance = () =>
    downloadCsv("attendance.csv", [
      ["Date", "Teacher", "Class", "Attended", "Total", "Attendance", "Recording (min)", "Incident"],
      ...visibleRecords.map((r) => [
        r.date,
        r.teacher,
        r.className,
        r.attended,
        r.total,
        pct(r.attended, r.total),
        r.minutes,
        r.incident ?? "No incident",
      ]),
    ]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: `All (${TOTAL_CLASSES})` },
    { id: "live", label: `Live Now (${liveClasses.length})` },
    { id: "records", label: "Records" },
  ];

  return (
    <DashboardShell role="admin">
      <div className="pb-8 pt-1">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-9 tracking-[-0.03em] text-[#111c0f]">
              Classes
            </h1>
            <p className="mt-2 text-[12px] leading-4 text-[#63715d]">
              See every teaching space, live session and retained record.
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
        <div className="mt-[27px] flex flex-wrap items-center gap-2.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => goTo(t.id)}
              className={`h-[30px] rounded-full px-[17px] text-[11px] font-semibold transition-colors ${
                activeTab === t.id
                  ? "bg-[#263a20] text-white"
                  : "bg-[#f2f5ee] text-[#63715d] hover:bg-[#e3eedf]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Banner */}
        <div className="mt-9 rounded-xl bg-[#e3eedf] px-[22px] py-4">
          <div className="flex items-center gap-2">
            <Info size={13} className="shrink-0 text-[#263a20]" />
            <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
              Always recorded. Always retained.
            </p>
          </div>
          <p className="mt-[7px] pl-[21px] text-[11px] leading-[14px] text-[#63715d]">
            Every session is automatically recorded from start to finish.
            Recordings, attendance and flagged incident clips stay available
            after a class ends.
          </p>
        </div>

        {/* All classes */}
        <section
          id={sectionId.all}
          className={`${card} mt-[30px] px-[22px] pb-4 pt-[18px]`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cardTitle}>All classes</h2>
              <p className={cardSub}>
                {TOTAL_CLASSES} classes · Maximum {MAX_LEARNERS} learners per
                class
              </p>
            </div>
            <button type="button" onClick={exportClasses} className={pillBtn}>
              Export class list
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[960px]">
              <div
                className={`${tableHead} grid-cols-[224px_204px_99px_210px_116px_1fr]`}
              >
                <span>Class</span>
                <span>Teacher</span>
                <span>Learners</span>
                <span>Next / current session</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {visibleClasses.map((c) => (
                <div
                  key={c.id}
                  className={`${rowBase} grid-cols-[224px_204px_99px_210px_116px_1fr]`}
                >
                  <span className={c.id === selectedId ? "font-bold" : ""}>
                    {c.name}
                  </span>

                  <div className="flex items-center gap-[10px]">
                    <Avatar initials={c.initials} />
                    <span className="font-bold">{c.teacher}</span>
                  </div>

                  <span>
                    {c.learners}/{MAX_LEARNERS}
                  </span>
                  <span>{c.session}</span>

                  <span>
                    <StatusPill status={c.status} />
                  </span>

                  <div>
                    {c.status === "Live" ? (
                      <button
                        type="button"
                        onClick={() => join(c.id)}
                        className={joinBtn}
                      >
                        Join
                      </button>
                    ) : (
                      <button
                        type="button"
                        // TODO: open the class details page
                        className="text-[11px] font-semibold text-[#111c0f] hover:underline"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {visibleClasses.length === 0 && (
                <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                  No classes match your search.
                </p>
              )}
            </div>
          </div>

          <p className="mt-[18px] text-[10px] leading-[14px] text-[#778271]">
            {q
              ? `Showing ${visibleClasses.length} matching ${visibleClasses.length === 1 ? "class" : "classes"}`
              : `Showing 1–${classes.length} of ${TOTAL_CLASSES} classes`}
          </p>
        </section>

        {/* Live now + Learners */}
        <div
          id={sectionId.live}
          className="mt-[30px] grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_277px]"
        >
          {/* Live Now */}
          <section className={`${card} px-[22px] pb-[19px] pt-[18px]`}>
            <h2 className={cardTitle}>Live Now · alternate state</h2>
            <p className={cardSub}>
              {liveClasses.length} sessions in progress · Observation access
              only
            </p>

            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[640px]">
                <div
                  className={`${tableHead} grid-cols-[204px_143px_99px_128px_1fr]`}
                >
                  <span>Class</span>
                  <span>Teacher</span>
                  <span>Learners</span>
                  <span>Recording</span>
                  <span>Action</span>
                </div>

                {visibleLive.map((c) => (
                  <div
                    key={c.id}
                    className={`${rowBase} grid-cols-[204px_143px_99px_128px_1fr]`}
                  >
                    <span className={c.id === selected?.id ? "font-bold" : ""}>
                      {c.short}
                    </span>
                    <span>{c.teacher}</span>
                    <span>
                      {c.learners}/{MAX_LEARNERS}
                    </span>
                    <span>
                      <span className="inline-flex h-5 items-center gap-1.5 rounded-full bg-[#fce9e9] px-[10px] text-[10px] font-bold text-[#c33d42]">
                        <span className="h-[5px] w-[5px] rounded-full bg-[#d57376]" />
                        REC
                      </span>
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`${joinBtn} h-[34px] px-[15px]`}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}

                {visibleLive.length === 0 && (
                  <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                    No live sessions match your search.
                  </p>
                )}
              </div>
            </div>

            {selected?.live && (
              <div className="mt-[19px] rounded-xl bg-[#fae8db] px-[22px] py-4">
                <div className="flex items-center gap-2">
                  <Info size={13} className="shrink-0 text-[#7a4b2a]" />
                  <p className="text-[11px] font-bold leading-[14px] text-[#1f291c]">
                    {selected.name} selected
                  </p>
                </div>
                <p className="mt-2 pl-[21px] text-[11px] leading-[14px] text-[#63715d]">
                  {selected.learners} learners connected · Started{" "}
                  {selected.live.started} · {selected.live.raisedHands} raised{" "}
                  {selected.live.raisedHands === 1 ? "hand" : "hands"}
                  {selected.live.incident
                    ? ` · ${selected.live.incident} open`
                    : ""}
                </p>
              </div>
            )}
          </section>

          {/* Learners */}
          <section className={`${card} px-[22px] pb-[21px] pt-[18px]`}>
            <h2 className={cardTitle}>Learners</h2>
            <p className={cardSub}>
              {selected?.short} · {selected?.learners}/{MAX_LEARNERS}
            </p>

            {selected?.live && selected.live.roster.length > 0 ? (
              <>
                <div className="mt-5 space-y-[21px]">
                  {selected.live.roster.map((l) => (
                    <div key={l.name} className="flex h-[30px] items-center gap-[10px]">
                      <Avatar initials={l.initials} />
                      <div className="leading-none">
                        <p className="text-[11px] font-bold text-[#111c0f]">
                          {l.name}
                        </p>
                        <p className="mt-1 text-[10px] text-[#63715d]">
                          {l.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[10px] leading-[14px] text-[#778271]">
                  Showing {selected.live.roster.length} of {selected.learners}{" "}
                  learners
                </p>

                <button
                  type="button"
                  // TODO: open the full learner list
                  className="mt-[19px] h-[33px] rounded-full bg-[#f2f5ee] px-[18px] text-[11px] font-semibold text-[#263a20] transition-colors hover:bg-[#e3eedf]"
                >
                  View all learners
                </button>
              </>
            ) : (
              <p className="mt-5 text-[11px] text-[#63715d]">
                The learner list isn&apos;t available for this class yet.
              </p>
            )}
          </section>
        </div>

        {/* Records */}
        <section
          id={sectionId.records}
          className={`${card} mt-[30px] px-[22px] pb-4 pt-[18px]`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cardTitle}>Records · alternate state</h2>
              <p className={cardSub}>
                All completed sessions are retained, including incident
                evidence.
              </p>
            </div>
            <button type="button" onClick={exportAttendance} className={pillBtn}>
              Export attendance
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[900px]">
              <div
                className={`${tableHead} grid-cols-[158px_301px_168px_185px_1fr]`}
              >
                <span>Date</span>
                <span>Class / teacher</span>
                <span>Attendance</span>
                <span>Recording</span>
                <span>Incident</span>
              </div>

              {visibleRecords.map((r) => (
                <div
                  key={r.id}
                  className={`${rowBase} grid-cols-[158px_301px_168px_185px_1fr]`}
                >
                  <span>{r.date}</span>

                  <div className="flex items-center gap-[10px]">
                    <Avatar initials={r.initials} />
                    <div className="leading-none">
                      <p className="text-[11px] font-bold">{r.teacher}</p>
                      <p className="mt-1 text-[10px] text-[#808b7b]">
                        {r.className}
                      </p>
                    </div>
                  </div>

                  <span>
                    {r.attended}/{r.total} · {pct(r.attended, r.total)}
                  </span>

                  <div>
                    <button
                      type="button"
                      // TODO: open the recording player
                      className="flex h-8 items-center gap-1.5 rounded-full bg-[#f2f5ee] px-[17px] text-[11px] font-semibold text-[#111c0f] transition-colors hover:bg-[#e3eedf]"
                    >
                      <Play size={9} fill="currentColor" />
                      Play · {r.minutes} min
                    </button>
                  </div>

                  <span>
                    {r.incident ? (
                      <span className="inline-flex h-5 items-center rounded-full bg-[#fde8ef] px-[10px] text-[10px] font-bold text-[#ac4767]">
                        {r.incident}
                      </span>
                    ) : (
                      <span className="inline-flex h-5 items-center rounded-full bg-[#e3eedf] px-[10px] text-[10px] font-bold text-[#3d5038]">
                        No incident
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {visibleRecords.length === 0 && (
                <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                  No records match your search.
                </p>
              )}
            </div>
          </div>

          {/* placeholder wording: the screenshot cuts this line off after "Live Algebra I an" */}
          <p className="mt-[18px] text-[10px] leading-[14px] text-[#778271]">
            Live Algebra I and Biology D sessions will appear here once they
            end.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}