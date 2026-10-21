"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { AlertCircle, Bell, Check, Info, LoaderCircle, Search } from "lucide-react";
import { apiJson, ApiError } from "@/lib/api/client";
import { approvePendingUser, getPendingAccounts, getPendingTeachers, rejectPendingTeacher, rejectPendingUser, verifyTeacher, type PendingAccount, type PendingTeacher } from "@/lib/api/admin";

const card = "rounded-xl border border-[#e9ece4] bg-white p-[22px] shadow-[0_1px_3px_rgba(21,32,18,0.04)]";
const cardTitle = "text-[14px] font-bold leading-5 text-[#111c0f]";
const cardSub = "mt-1 text-[11px] leading-[14px] text-[#63715d]";
const tableHead = "grid h-10 items-center rounded-lg bg-[#f2f5ee] px-[11px] text-[10px] font-medium text-[#63715d]";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "T";
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function errorText(error: unknown, action: string) {
  if (error instanceof ApiError && error.status === 401) return "Your admin sign-in was rejected or has expired. Sign out, sign in with the active superadmin account, and try again.";
  if (error instanceof ApiError && error.status === 403) return "The backend denied this action. Account approvals require an active superadmin account.";
  return error instanceof Error ? error.message : `Could not ${action}. Please try again.`;
}

export default function TeacherApprovalsPage() {
  const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTeachers(await getPendingTeachers());
    } catch (loadError) {
      setError(errorText(loadError, "load pending teacher applications"));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingAccounts = useCallback(async () => {
    setAccountsError(null);
    try {
      setPendingAccounts(await getPendingAccounts());
    } catch (loadError) {
      setAccountsError(errorText(loadError, "load pending accounts"));
    }
  }, []);

  useEffect(() => {
    void loadTeachers();
    void loadPendingAccounts();
  }, [loadPendingAccounts, loadTeachers]);

  const pendingLearners = pendingAccounts.filter((account) => ["STUDENT", "LEARNER"].includes(account.role.toUpperCase()));

  const visibleTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return teachers;
    return teachers.filter((teacher) =>
      [teacher.name, teacher.email, teacher.subject, teacher.qualification].join(" ").toLowerCase().includes(normalizedQuery)
    );
  }, [query, teachers]);

  const approve = async (teacher: PendingTeacher) => {
    setBusyId(teacher.id);
    setError(null);
    setNotice(null);
    try {
      await apiJson(await verifyTeacher(teacher.id));
      setTeachers((current) => current.filter((item) => item.id !== teacher.id));
      setNotice(`${teacher.name} was approved and their account is now active.`);
    } catch (actionError) {
      setError(errorText(actionError, "approve this teacher"));
    } finally {
      setBusyId(null);
    }
  };

  const approveLearner = async (account: PendingAccount) => {
    setBusyId(account.id);
    setError(null);
    setNotice(null);
    try {
      await apiJson(await approvePendingUser(account.id));
      setPendingAccounts((current) => current.filter((item) => item.id !== account.id));
      setNotice(`${account.name}'s learner account was approved and is now active.`);
    } catch (actionError) {
      setError(errorText(actionError, "approve this learner"));
    } finally {
      setBusyId(null);
    }
  };

  const rejectLearner = async (account: PendingAccount) => {
    if (!window.confirm(`Reject ${account.name}'s learner account? The account will remain inactive.`)) return;
    setBusyId(account.id);
    setError(null);
    setNotice(null);
    try {
      await apiJson(await rejectPendingUser(account.id));
      setPendingAccounts((current) => current.filter((item) => item.id !== account.id));
      setNotice(`${account.name}'s learner account was rejected.`);
    } catch (actionError) {
      setError(errorText(actionError, "reject this learner"));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (teacher: PendingTeacher) => {
    if (!window.confirm(`Reject ${teacher.name}'s teacher application? Their account will remain inactive.`)) return;
    setBusyId(teacher.id);
    setError(null);
    setNotice(null);
    try {
      await apiJson(await rejectPendingTeacher(teacher.userId));
      setTeachers((current) => current.filter((item) => item.id !== teacher.id));
      setNotice(`${teacher.name}'s application was rejected.`);
    } catch (actionError) {
      setError(errorText(actionError, "reject this teacher"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell role="admin">
      <div className="pb-8 pt-1">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold leading-9 tracking-[-0.03em] text-[#111c0f]">Teacher Approvals</h1>
            <p className="mt-2 text-[12px] leading-4 text-[#63715d]">Review real applications from the Konnect backend and activate qualified teachers.</p>
          </div>
          <div className="mt-2 flex items-center gap-5">
            <label className="flex h-[39px] w-[247px] items-center gap-2.5 rounded-full border border-[#e9ece4] bg-white px-[15px]">
              <Search size={13} className="shrink-0 text-[#63715d]" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pending teachers" className="w-full bg-transparent text-[10px] text-[#111c0f] outline-none placeholder:text-[#8a9485]" />
            </label>
            <button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9ece4] bg-white text-[#263a20]"><Bell size={13} /></button>
          </div>
        </header>

        <section className={card}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={cardTitle}>Pending learner accounts</h2>
              <p className={cardSub}>Approve a learner to activate sign-in access.</p>
            </div>
            <button type="button" onClick={() => void loadPendingAccounts()} className="text-[10px] font-semibold text-[#35522b] hover:underline">Refresh</button>
          </div>
          {accountsError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] text-red-800">{accountsError}</div>}
          <div className="mt-4 divide-y divide-[#f2f4ef]">
            {pendingLearners.map((account) => (
              <div key={account.id || account.email} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1">
                <div>
                  <p className="text-[11px] font-bold text-[#111c0f]">{account.name}</p>
                  <p className="mt-1 text-[10px] text-[#63715d]">{account.email || "Email not provided"} · {account.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={busyId === account.id} onClick={() => void approveLearner(account)} className="flex h-[31px] items-center gap-[7px] rounded-full bg-[#263a20] px-4 text-[11px] font-semibold text-white disabled:cursor-wait disabled:opacity-60">
                    {busyId === account.id ? <LoaderCircle size={11} className="animate-spin" /> : <Check size={11} />} Approve learner
                  </button>
                  <button type="button" disabled={busyId === account.id} onClick={() => void rejectLearner(account)} className="h-[31px] rounded-full bg-[#f2f5ee] px-4 text-[11px] font-semibold text-[#3a4636] disabled:cursor-wait disabled:opacity-60">Reject</button>
                </div>
              </div>
            ))}
            {!accountsError && pendingLearners.length === 0 && <p className="py-5 text-center text-[11px] text-[#63715d]">No pending learner accounts.</p>}
          </div>
        </section>

        <section className={`${card} mt-8`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={cardTitle}>Pending applications</h2>
              <p className={cardSub}>Approving a teacher verifies their profile and activates their account.</p>
            </div>
            <span className="rounded-full bg-[#fef4e8] px-[10px] py-[3px] text-[9px] font-bold text-[#b36a10]">{teachers.length} pending</span>
          </div>

          {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] text-red-800"><AlertCircle size={15} className="mt-0.5 shrink-0" /><p>{error}</p></div>}
          {notice && <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-[11px] text-green-900">{notice}</div>}

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className={`${tableHead} grid-cols-[210px_155px_195px_120px_1fr]`}>
                <span>Teacher</span><span>Subject</span><span>Qualifications</span><span>Submitted</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-[#63715d]"><LoaderCircle size={15} className="animate-spin" /> Loading pending applications…</div>
              ) : visibleTeachers.map((teacher) => (
                <div key={teacher.id} className="grid min-h-[64px] grid-cols-[210px_155px_195px_120px_1fr] items-center border-b border-[#f2f4ef] px-[11px] py-2 text-[11px] text-[#111c0f]">
                  <div className="flex items-center gap-[10px]">
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#e3eedf] text-[9px] font-bold text-[#263a20]">{initials(teacher.name)}</span>
                    <div className="min-w-0 leading-none"><p className="truncate text-[11px] font-bold">{teacher.name}</p><p className="mt-1 truncate text-[10px] text-[#63715d]">{teacher.email || "Email not provided"}</p></div>
                  </div>
                  <span className="pr-3">{teacher.subject || "—"}</span>
                  <span className="pr-3">{teacher.qualification || "—"}{teacher.documentCount > 0 && <span className="mt-1 block text-[9px] text-[#63715d]">{teacher.documentCount} documents submitted</span>}</span>
                  <span>{formatDate(teacher.submittedAt)}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={busyId === teacher.id} onClick={() => void approve(teacher)} className="flex h-[31px] items-center gap-[7px] rounded-full bg-[#263a20] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#35522b] disabled:cursor-wait disabled:opacity-60">
                      {busyId === teacher.id ? <LoaderCircle size={11} className="animate-spin" /> : <Check size={11} />} Approve
                    </button>
                    {teacher.accountStatus === "PENDING" && <button type="button" disabled={busyId === teacher.id} onClick={() => void reject(teacher)} className="h-[31px] rounded-full bg-[#f2f5ee] px-4 text-[11px] font-semibold text-[#3a4636] transition-colors hover:bg-[#e3eedf] disabled:opacity-60">Reject</button>}
                  </div>
                </div>
              ))}
              {!loading && visibleTeachers.length === 0 && <p className="border-b border-[#f2f4ef] py-8 text-center text-[11px] text-[#63715d]">{error ? "Could not load applications." : teachers.length === 0 ? "No pending teacher applications." : "No applications match your search."}</p>}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-[10px] leading-[14px] text-[#63715d]">
            <span>{query.trim() ? `Showing ${visibleTeachers.length} of ${teachers.length} pending applications` : `${teachers.length} pending ${teachers.length === 1 ? "application" : "applications"}`}</span>
            <button type="button" onClick={() => void loadTeachers()} disabled={loading} className="font-semibold text-[#35522b] hover:underline disabled:opacity-50">Refresh</button>
          </div>
        </section>

        <div className="mt-[25px] rounded-xl bg-[#e3eedf] px-[22px] py-[17px]">
          <div className="flex items-center gap-2"><Info size={13} className="shrink-0 text-[#263a20]" /><p className="text-[11px] font-bold leading-[14px] text-[#111c0f]">Review before approval</p></div>
          <p className="mt-[7px] pl-[21px] text-[11px] leading-[14px] text-[#63715d]">Approve and reject actions are recorded by the backend. The current API returns application details but does not provide document download links or approved/rejected history.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
