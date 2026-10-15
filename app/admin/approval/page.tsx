"use client";

import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ArrowUpRight, Bell, Check, Info, Search } from "lucide-react";

type TabId = "pending" | "approved" | "rejected";

type Pending = {
  id: string;
  initials: string;
  name: string;
  subject: string;
  qualification: string;
  submitted: string;
  documents: number;
};

type Approved = {
  id: string;
  initials: string;
  name: string;
  qualification: string;
  approved: string;
};

type Rejected = {
  id: string;
  initials: string;
  name: string;
  subject: string;
  decision: string;
  reason: string;
};

const initialPending: Pending[] = [
  { id: "sarah-chen", initials: "SC", name: "Sarah Chen", subject: "Mathematics", qualification: "MSc Mathematics · QTS", submitted: "13 Oct 2026", documents: 3 },
  { id: "james-wilson", initials: "JW", name: "James Wilson", subject: "Science", qualification: "BSc Biology · PGCE", submitted: "13 Oct 2026", documents: 3 },
  { id: "amina-yusuf", initials: "AY", name: "Amina Yusuf", subject: "English", qualification: "MA English · QTS", submitted: "13 Oct 2026", documents: 3 },
  { id: "daniel-brooks", initials: "DB", name: "Daniel Brooks", subject: "History", qualification: "MA History · PGCE", submitted: "13 Oct 2026", documents: 3 },
];

const initialApproved: Approved[] = [
  { id: "edna-francis", initials: "EF", name: "Edna Francis", qualification: "MSc Mathematics · QTS", approved: "07 Sep 2026" },
  { id: "michael-reed", initials: "MR", name: "Michael Reed", qualification: "BSc Biology · PGCE", approved: "08 Sep 2026" },
  { id: "priya-shah", initials: "PS", name: "Priya Shah", qualification: "MA English · QTS", approved: "09 Sep 2026" },
];

const initialRejected: Rejected[] = [
  { id: "ben-carter", initials: "BC", name: "Ben Carter", subject: "History", decision: "12 Oct 2026", reason: "Qualification document expired" },
  { id: "lucy-evans", initials: "LE", name: "Lucy Evans", subject: "Science", decision: "10 Oct 2026", reason: "Identity verification incomplete" },
];

// The screenshot shows 24 approved teachers in total; only the latest 3 are listed
const APPROVED_TOTAL = 24;

const sectionId: Record<TabId, string> = {
  pending: "pending-applications",
  approved: "approved-state",
  rejected: "rejected-state",
};

const card =
  "rounded-xl border border-[#e9ece4] bg-white p-[22px] shadow-[0_1px_3px_rgba(21,32,18,0.04)]";
const cardTitle = "text-[14px] font-bold leading-5 text-[#111c0f]";
const cardSub = "mt-1 text-[11px] leading-[14px] text-[#63715d]";
const tableHead =
  "grid h-10 items-center rounded-lg bg-[#f2f5ee] px-[11px] text-[10px] font-medium text-[#63715d]";

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#e3eedf] text-[9px] font-bold text-[#263a20]">
      {initials}
    </span>
  );
}

export default function TeacherApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState(initialApproved);
  const [rejected, setRejected] = useState(initialRejected);

  const q = query.trim().toLowerCase();
  const match = (...parts: string[]) =>
    !q || parts.join(" ").toLowerCase().includes(q);

  const visiblePending = pending.filter((t) =>
    match(t.name, t.subject, t.qualification)
  );
  const visibleApproved = approved
    .slice(0, 3)
    .filter((t) => match(t.name, t.qualification));
  const visibleRejected = rejected
    .slice(0, 2)
    .filter((t) => match(t.name, t.subject, t.reason));

  const approvedTotal = APPROVED_TOTAL + approved.length - initialApproved.length;

  const goTo = (tab: TabId) => {
    setActiveTab(tab);
    document
      .getElementById(sectionId[tab])
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const approve = (t: Pending) => {
    setPending((list) => list.filter((x) => x.id !== t.id));
    setApproved((list) => [
      {
        id: t.id,
        initials: t.initials,
        name: t.name,
        qualification: t.qualification,
        approved: today(),
      },
      ...list,
    ]);
  };

  const reject = (t: Pending) => {
    // "Rejections require a reason and are logged"
    const reason = window
      .prompt(`Reason for rejecting ${t.name} (required, it will be logged):`)
      ?.trim();
    if (!reason) return;

    setPending((list) => list.filter((x) => x.id !== t.id));
    setRejected((list) => [
      {
        id: t.id,
        initials: t.initials,
        name: t.name,
        subject: t.subject,
        decision: today(),
        reason,
      },
      ...list,
    ]);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "pending", label: `Pending (${pending.length})` },
    { id: "approved", label: `Approved (${approvedTotal})` },
    { id: "rejected", label: `Rejected (${rejected.length})` },
  ];

  return (
    <DashboardShell role="admin">
      <div className="pb-8 pt-1">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-9 tracking-[-0.03em] text-[#111c0f]">
              Teacher Approvals
            </h1>
            <p className="mt-2 text-[12px] leading-4 text-[#63715d]">
              Review qualifications. Welcome the right people into your
              classrooms.
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
              className={`h-[29px] rounded-full px-[17px] text-[11px] font-semibold transition-colors ${
                activeTab === t.id
                  ? "bg-[#263a20] text-white"
                  : "bg-[#f2f5ee] text-[#63715d] hover:bg-[#e3eedf]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Pending applications */}
        <section id={sectionId.pending} className={`${card} mt-[38px]`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={cardTitle}>Pending applications</h2>
              <p className={cardSub}>
                Check identity, qualifications and supporting documents before
                approval.
              </p>
            </div>
            <span className="rounded-full bg-[#fef4e8] px-[10px] py-[3px] text-[9px] font-bold text-[#b36a10]">
              {pending.length} pending
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[900px]">
              <div
                className={`${tableHead} grid-cols-[232px_225px_136px_169px_1fr]`}
              >
                <span>Teacher</span>
                <span>Qualifications</span>
                <span>Submitted</span>
                <span>Documents</span>
                <span>Actions</span>
              </div>

              {visiblePending.map((t) => (
                <div
                  key={t.id}
                  className="grid h-[59px] grid-cols-[232px_225px_136px_169px_1fr] items-center border-b border-[#f2f4ef] px-[11px] text-[11px] text-[#111c0f]"
                >
                  <div className="flex items-center gap-[10px]">
                    <Avatar initials={t.initials} />
                    <div className="leading-none">
                      <p className="text-[11px] font-bold">{t.name}</p>
                      <p className="mt-1 text-[10px] text-[#63715d]">
                        {t.subject}
                      </p>
                    </div>
                  </div>

                  <span>{t.qualification}</span>
                  <span>{t.submitted}</span>

                  <button
                    type="button"
                    // TODO: open the teacher's documents
                    className="flex w-fit items-center gap-1 text-[11px] font-semibold hover:underline"
                  >
                    <ArrowUpRight size={9} />
                    View {t.documents} documents
                  </button>

                  <div className="flex items-center gap-[7px]">
                    <button
                      type="button"
                      onClick={() => approve(t)}
                      className="flex h-[31px] items-center gap-[7px] rounded-full bg-[#263a20] px-[18px] text-[11px] font-semibold text-white transition-colors hover:bg-[#35522b]"
                    >
                      <Check size={11} />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(t)}
                      className="h-[31px] rounded-full bg-[#f2f5ee] px-4 text-[11px] font-semibold text-[#3a4636] transition-colors hover:bg-[#e3eedf]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {visiblePending.length === 0 && (
                <p className="border-b border-[#f2f4ef] py-6 text-center text-[11px] text-[#63715d]">
                  {pending.length === 0
                    ? "No pending applications."
                    : "No applications match your search."}
                </p>
              )}
            </div>
          </div>

          <p className="mt-[21px] text-[10px] leading-[14px] text-[#63715d]">
            {q
              ? `Showing ${visiblePending.length} of ${pending.length} pending applications`
              : `Showing all ${pending.length} pending ${
                  pending.length === 1 ? "application" : "applications"
                }`}{" "}
            · Newest first
          </p>
        </section>

        {/* Notice */}
        <div className="mt-[25px] rounded-xl bg-[#e3eedf] px-[22px] py-[17px]">
          <div className="flex items-center gap-2">
            <Info size={13} className="shrink-0 text-[#263a20]" />
            <p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">
              A careful review, a confident start
            </p>
          </div>
          <p className="mt-[7px] pl-[21px] text-[11px] leading-[14px] text-[#63715d]">
            Approving a teacher enables their account with a default limit of 3
            active classes and 100 seats per class. Rejections require a reason
            and are logged.
          </p>
        </div>

        {/* Alternate states */}
        <div className="mt-[25px] grid grid-cols-1 items-start gap-[21px] lg:grid-cols-2">
          {/* Approved */}
          <section id={sectionId.approved} className={`${card} pb-5`}>
            <h2 className={cardTitle}>Approved · alternate state</h2>
            <p className={cardSub}>Most recently approved teachers</p>

            <span className="mt-5 inline-flex h-[23px] items-center rounded-full bg-[#e3eedf] px-3 text-[10px] font-semibold text-[#263a20]">
              Approved ({approvedTotal})
            </span>

            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[440px]">
                <div className={`${tableHead} h-[39px] grid-cols-[155px_156px_1fr]`}>
                  <span>Teacher</span>
                  <span>Approved</span>
                  <span>Status</span>
                </div>

                {visibleApproved.map((t) => (
                  <div
                    key={t.id}
                    className="grid min-h-[59px] grid-cols-[155px_156px_1fr] items-center border-b border-[#f2f4ef] px-[11px] py-3 text-[11px] text-[#111c0f]"
                  >
                    <div className="flex items-center gap-[10px]">
                      <Avatar initials={t.initials} />
                      <div className="max-w-[98px]">
                        <p className="text-[11px] font-bold leading-[15px]">
                          {t.name}
                        </p>
                        <p className="text-[10px] leading-[13px] text-[#63715d]">
                          {t.qualification}
                        </p>
                      </div>
                    </div>

                    <span>{t.approved}</span>

                    <span>
                      <span className="inline-flex h-[19px] items-center rounded-full bg-[#e3eedf] px-[10px] text-[10px] font-bold text-[#2b5a2d]">
                        Verified
                      </span>
                    </span>
                  </div>
                ))}

                {visibleApproved.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-[#63715d]">
                    No approved teachers match your search.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Rejected */}
          <section id={sectionId.rejected} className={card}>
            <h2 className={cardTitle}>Rejected · alternate state</h2>
            <p className={cardSub}>Decisions remain available for review</p>

            <span className="mt-5 inline-flex h-[23px] items-center rounded-full bg-[#fbe9ee] px-3 text-[10px] font-semibold text-[#b65b78]">
              Rejected ({rejected.length})
            </span>

            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[440px]">
                <div className={`${tableHead} h-[39px] grid-cols-[155px_156px_1fr]`}>
                  <span>Teacher</span>
                  <span>Decision</span>
                  <span>Reason</span>
                </div>

                {visibleRejected.map((t) => (
                  <div
                    key={t.id}
                    className="grid min-h-[59px] grid-cols-[155px_156px_1fr] items-center border-b border-[#f2f4ef] px-[11px] py-2 text-[11px] text-[#111c0f]"
                  >
                    <div className="flex items-center gap-[10px]">
                      <Avatar initials={t.initials} />
                      <div className="leading-none">
                        <p className="text-[11px] font-bold">{t.name}</p>
                        <p className="mt-1 text-[10px] text-[#63715d]">
                          {t.subject}
                        </p>
                      </div>
                    </div>

                    <span>{t.decision}</span>
                    <span className="max-w-[128px] leading-[15px]">
                      {t.reason}
                    </span>
                  </div>
                ))}

                {visibleRejected.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-[#63715d]">
                    No rejected teachers match your search.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              // TODO: open the decision history
              className="mt-[19px] h-[35px] rounded-full bg-[#f2f5ee] px-[18px] text-[11px] font-semibold text-[#111c0f] transition-colors hover:bg-[#e3eedf]"
            >
              View decision history
            </button>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}