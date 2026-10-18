"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Award, Bell, Info, Search, Star, Users } from "lucide-react";

type Teacher = {
  id: string;
  initials: string;
  name: string;
  subject: string;
  best: boolean;
  active: number;
  limit: number;
  rating: number;
  suspended: boolean;
  attendance?: number; // only known for some teachers
};

const initialTeachers: Teacher[] = [
  { id: "mutiti-stivo", initials: "MS", name: "Mutiti Stivo", subject: "Python & Computer Science", best: true, active: 3, limit: 3, rating: 5.0, suspended: false, attendance: 99 },
  { id: "edna-francis", initials: "EF", name: "Edna Francis", subject: "Mathematics", best: true, active: 3, limit: 3, rating: 4.9, suspended: false },
  { id: "michael-reed", initials: "MR", name: "Michael Reed", subject: "Science", best: false, active: 2, limit: 3, rating: 4.8, suspended: false, attendance: 96 },
  { id: "priya-shah", initials: "PS", name: "Priya Shah", subject: "English", best: true, active: 3, limit: 3, rating: 4.9, suspended: false },
  { id: "oliver-grant", initials: "OG", name: "Oliver Grant", subject: "History", best: false, active: 2, limit: 3, rating: 4.5, suspended: false },
  { id: "helen-wright", initials: "HW", name: "Helen Wright", subject: "Geography", best: false, active: 1, limit: 3, rating: 4.3, suspended: false },
  { id: "thomas-lee", initials: "TL", name: "Thomas Lee", subject: "Physics", best: false, active: 0, limit: 3, rating: 3.8, suspended: true },
];

// Platform-wide numbers from the screenshot (the page only lists the first 6 teachers)
const TOTAL_TEACHERS = 24;
const BASE_SUSPENDED = 2;
const BASE_BEST = 3;
const DEFAULT_LIMIT = 3;
const initialSuspendedListed = initialTeachers.filter((t) => t.suspended).length;
const initialBestListed = initialTeachers.filter((t) => t.best).length;

const card =
  "rounded-xl border border-[#e9ece4] bg-white shadow-[0_1px_3px_rgba(21,32,18,0.04)]";
const cardTitle = "text-[14px] font-bold leading-5 text-[#111c0f]";
const cardSub = "text-[11px] leading-[14px] text-[#63715d]";
const pillBtn =
  "h-[35px] rounded-full bg-[#f2f5ee] text-[11px] font-semibold text-[#263a20] transition-colors hover:bg-[#e3eedf]";
const inputCls =
  "h-[37px] w-full rounded-lg border border-[#e9ece4] bg-white px-[14px] text-[11px] text-[#111c0f] outline-none placeholder:text-[#8a9485] focus:border-[#263a20]";
const darkBtn =
  "rounded-full bg-[#263a20] text-[11px] font-semibold text-white transition-colors hover:bg-[#35522b] disabled:opacity-50";

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#e3eedf] text-[9px] font-bold text-[#263a20]">
      {initials}
    </span>
  );
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [query, setQuery] = useState("");

  const [limitTargetId, setLimitTargetId] = useState("edna-francis");
  const [limitDraft, setLimitDraft] = useState("3");
  const [limitSaved, setLimitSaved] = useState(false);

  const [note, setNote] = useState("Consistent, engaging science lessons.");
  const [awarded, setAwarded] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = teachers.filter(
    (t) => !q || `${t.name} ${t.subject}`.toLowerCase().includes(q)
  );

  // ---- Derived numbers ----
  const suspendedListed = teachers.filter((t) => t.suspended).length;
  const suspendedTotal = BASE_SUSPENDED - initialSuspendedListed + suspendedListed;
  const activeTotal = TOTAL_TEACHERS - suspendedTotal;
  const bestTotal =
    BASE_BEST - initialBestListed + teachers.filter((t) => t.best).length;

  const limitTarget = teachers.find((t) => t.id === limitTargetId) ?? teachers[0];

  // Award candidate: the highest-rated teacher who is not suspended and not yet recognised
  const candidate = [...teachers]
    .filter((t) => !t.best && !t.suspended)
    .sort((a, b) => b.rating - a.rating)[0];

  const patch = (id: string, changes: Partial<Teacher>) =>
    setTeachers((list) =>
      list.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );

  const toggleSuspend = (t: Teacher) => {
    const message = t.suspended
      ? `Reactivate ${t.name}? They will be able to sign in and create classes again.`
      : `Suspend ${t.name}? They will not be able to sign in or create new classes. Learner records stay retained.`;
    if (window.confirm(message)) patch(t.id, { suspended: !t.suspended });
  };

  const pickForLimit = (t: Teacher) => {
    setLimitTargetId(t.id);
    setLimitDraft(String(t.limit));
    setLimitSaved(false);
    document
      .getElementById("set-class-limit")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const saveLimit = () => {
    const value = Number(limitDraft);
    if (!Number.isInteger(value) || value < 1 || value > 20) return;
    patch(limitTarget.id, { limit: value });
    setLimitSaved(true);
    setTimeout(() => setLimitSaved(false), 2000);
  };

  const award = () => {
    if (!candidate) return;
    patch(candidate.id, { best: true });
    setNote("");
    setAwarded(true);
    setTimeout(() => setAwarded(false), 2000);
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Subject", "Active classes", "Class limit", "Rating", "Status", "Best teacher"],
      ...visible.map((t) => [
        t.name,
        t.subject,
        t.active,
        t.limit,
        t.rating,
        t.suspended ? "Suspended" : "Active",
        t.best ? "Yes" : "No",
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
    a.download = "teachers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Approved teachers",
      value: String(TOTAL_TEACHERS),
      note: `${activeTotal} active · ${suspendedTotal} suspended`,
      icon: Users,
      tone: "bg-[#e3eedf]",
    },
    {
      label: "Average rating",
      value: "4.7/5",
      note: "From 842 learner reviews",
      icon: Star,
      tone: "bg-[#fae8db]",
    },
    {
      label: "Best teachers",
      value: String(bestTotal),
      note: "Recognised this term",
      icon: Award,
      tone: "bg-[#e3eedf]",
    },
  ];

  return (
    <DashboardShell role="admin">
      <div className="pb-8 pt-1">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-9 tracking-[-0.03em] text-[#111c0f]">
              Teacher Management
            </h1>
            <p className="mt-2 text-[12px] leading-4 text-[#63715d]">
              Support great teaching and manage access with confidence.
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

        {/* Stat cards */}
        <section className="mt-[29px] grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map(({ label, value, note, icon: Icon, tone }) => (
            <article key={label} className={`${card} p-5`}>
              <div className="flex h-[30px] items-center justify-between">
                <p className="text-[12px] text-[#63715d]">{label}</p>
                <span
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#263a20] ${tone}`}
                >
                  <Icon size={13} />
                </span>
              </div>
              <p className="mt-[14px] text-[28px] font-bold leading-[34px] tracking-[-0.02em] text-[#111c0f]">
                {value}
              </p>
              <p className="mt-[15px] text-[10.5px] leading-[14px] text-[#808b7b]">
                {note}
              </p>
            </article>
          ))}
        </section>

        {/* Teacher directory */}
        <section className={`${card} mt-[25px] px-[22px] pb-[17px] pt-[22px]`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cardTitle}>Teacher directory</h2>
              <p className={`${cardSub} mt-[6px]`}>
                {TOTAL_TEACHERS} approved teachers · Term 1, 2026–27
              </p>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="h-[36px] rounded-full bg-[#f2f5ee] px-[20px] text-[11px] font-semibold text-[#111c0f] transition-colors hover:bg-[#e3eedf]"
            >
              Export teachers
            </button>
          </div>

          <div className="mt-[18px] overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid h-10 grid-cols-[251px_103px_104px_127px_1fr] items-center rounded-lg bg-[#f2f5ee] px-[10px] text-[10px] font-medium text-[#63715d]">
                <span>Teacher</span>
                <span>Classes</span>
                <span>Rating</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {visible.map((t) => (
                <div
                  key={t.id}
                  className="grid h-[59px] grid-cols-[251px_103px_104px_127px_1fr] items-center border-b border-[#f2f4ef] px-[10px] text-[11px] text-[#111c0f]"
                >
                  <div className="flex items-center gap-[10px]">
                    <Avatar initials={t.initials} />
                    <div className="leading-none">
                      <p className="text-[11px] font-bold">{t.name}</p>
                      <p className="mt-1 text-[10px] text-[#808b7b]">
                        {t.subject}
                        {t.best ? " · Best Teacher" : ""}
                      </p>
                    </div>
                  </div>

                  <span>
                    {t.active}/{t.limit}
                  </span>
                  <span>★ {t.rating.toFixed(1)}</span>

                  <span>
                    {t.suspended ? (
                      <span className="inline-flex h-6 items-center rounded-full bg-[#fdeaf0] px-[10px] text-[10px] font-bold text-[#b1516f]">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex h-6 items-center rounded-full bg-[#e3eedf] px-[10px] text-[10px] font-bold text-[#263a20]">
                        Active
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSuspend(t)}
                      className={`${pillBtn} px-[19px]`}
                    >
                      {t.suspended ? "Review" : "Suspend"}
                    </button>
                    <button
                      type="button"
                      onClick={() => pickForLimit(t)}
                      className={`${pillBtn} px-3`}
                    >
                      Set Class Limit
                    </button>
                  </div>
                </div>
              ))}

              {visible.length === 0 && (
                <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                  No teachers match your search.
                </p>
              )}
            </div>
          </div>

          <p className="mt-[18px] text-[10px] leading-[14px] text-[#778271]">
            {q
              ? `Showing ${visible.length} matching ${visible.length === 1 ? "teacher" : "teachers"}`
              : `Showing 1–${teachers.length} of ${TOTAL_TEACHERS} teachers · Page 1 of 4`}
          </p>
        </section>

        {/* Set class limit + Award best teacher */}
        <div className="mt-9 grid grid-cols-1 items-stretch gap-[22px] lg:grid-cols-2">
          {/* Set Class Limit */}
          <section
            id="set-class-limit"
            className={`${card} px-[22px] pb-[17px] pt-[17px]`}
          >
            <h2 className={cardTitle}>Set Class Limit</h2>
            <p className={`${cardSub} mt-[6px]`}>
              {limitTarget.name} · {limitTarget.subject}
            </p>

            <div className="mt-[21px] flex items-center gap-[10px]">
              <Avatar initials={limitTarget.initials} />
              <div>
                <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
                  {limitTarget.name}
                </p>
                <p className="mt-1 text-[10px] leading-3 text-[#808b7b]">
                  {limitTarget.active} active classes · Default limit{" "}
                  {DEFAULT_LIMIT}
                </p>
              </div>
            </div>

            <label
              htmlFor="max-classes"
              className="mt-[23px] block text-[11px] font-bold leading-3 text-[#111c0f]"
            >
              Maximum active classes
            </label>
            <input
              id="max-classes"
              type="number"
              min={1}
              max={20}
              value={limitDraft}
              onChange={(e) => setLimitDraft(e.target.value)}
              className={`${inputCls} mt-[9px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            />

            <p className="mt-5 text-[10px] leading-[14px] text-[#63715d]">
              Applies to future class creation. Existing classes and their
              records are preserved.
            </p>

            <button
              type="button"
              onClick={saveLimit}
              className={`${darkBtn} mt-5 h-[34px] px-[22px]`}
            >
              {limitSaved ? "Saved" : "Save class limit"}
            </button>
          </section>

          {/* Award Best Teacher */}
          <section className={`${card} px-[22px] pb-[19px] pt-[17px]`}>
            <h2 className={cardTitle}>Award Best Teacher</h2>
            <p className={`${cardSub} mt-[6px]`}>
              Recognise a teacher&apos;s contribution
            </p>

            {candidate ? (
              <>
                <div className="mt-[21px] flex items-center gap-[10px]">
                  <Avatar initials={candidate.initials} />
                  <div>
                    <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
                      {candidate.name}
                    </p>
                    <p className="mt-1 text-[10px] leading-3 text-[#808b7b]">
                      {candidate.rating.toFixed(1)}/5
                      {candidate.attendance !== undefined
                        ? ` · ${candidate.attendance}% attendance`
                        : ""}
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="recognition-note"
                  className="mt-[23px] block text-[11px] font-bold leading-3 text-[#111c0f]"
                >
                  Recognition note
                </label>
                <input
                  id="recognition-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a short note"
                  className={`${inputCls} mt-[9px]`}
                />

                <button
                  type="button"
                  onClick={award}
                  className={`${darkBtn} mt-[19px] h-[35px] px-[22px]`}
                >
                  {awarded ? "Awarded" : "Award Best Teacher"}
                </button>

                <p className="mt-[18px] text-[10px] leading-[14px] text-[#63715d]">
                  The award appears on the teacher&apos;s profile for Term 1.
                </p>
              </>
            ) : (
              <p className="mt-[21px] text-[11px] text-[#63715d]">
                Every eligible teacher has already been recognised this term.
              </p>
            )}
          </section>
        </div>

        {/* Notice */}
        <div className="mt-[29px] rounded-xl bg-[#e3eedf] px-[22px] py-[18px]">
          <div className="flex items-center gap-2">
            <Info size={13} className="shrink-0 text-[#263a20]" />
            <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
              Suspend access, preserve learning
            </p>
          </div>
          <p className="mt-1 pl-[21px] text-[11px] leading-[14px] text-[#63715d]">
            Suspending a teacher blocks sign-in and new classes. Learner records,
            recordings and incident evidence remain retained. All changes are
            added to the audit log.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}