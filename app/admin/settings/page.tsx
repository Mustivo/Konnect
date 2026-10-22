"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { currentUser, deleteCurrentUser, updateCurrentUser } from "@/lib/api/auth";
import {
  Check,
  ChevronDown,
  Download,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Laptop,
  Tablet,
  KeyRound,
  Bell,
  Sliders,
  FileSpreadsheet,
} from "lucide-react";

type AuditEntry = {
  id: string;
  dateTime: string;
  admin: string;
  action: string;
  affectedRecord: string;
  result: "Saved" | "Success" | "Failed";
};

const initialAuditEntries: AuditEntry[] = [
  {
    id: "audit-1",
    dateTime: "16 Oct 2026 · 09:20",
    admin: "Alex Morgan",
    action: "Assigned substitute teacher",
    affectedRecord: "MATH-018 · Precalculus",
    result: "Saved",
  },
  {
    id: "audit-2",
    dateTime: "15 Oct 2026 · 14:32",
    admin: "Alex Morgan",
    action: "Signed in · 2-step verified",
    affectedRecord: "Administrator portal",
    result: "Success",
  },
  {
    id: "audit-3",
    dateTime: "13 Oct 2026 · 16:10",
    admin: "Alex Morgan",
    action: "Suspended teacher account",
    affectedRecord: "Thomas Lee",
    result: "Saved",
  },
  {
    id: "audit-4",
    dateTime: "11 Oct 2026 · 11:45",
    admin: "Alex Morgan",
    action: "Exported grade records",
    affectedRecord: "ENG-005 · Humanities",
    result: "Saved",
  },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"platform" | "notifications" | "security" | "audit">("platform");

  // Platform settings state
  const [platformName, setPlatformName] = useState("Konnect");
  const [supportEmail, setSupportEmail] = useState("support@konnect.edu");
  const [language, setLanguage] = useState("English (UK)");
  const [timeZone, setTimeZone] = useState("Europe/London (GMT)");
  const [defaultRoomLimit, setDefaultRoomLimit] = useState("Standard live classroom");
  const [maxLiveSeats, setMaxLiveSeats] = useState("100");
  const [automaticAttendance, setAutomaticAttendance] = useState(true);
  const [requireTeacherApproval, setRequireTeacherApproval] = useState(true);

  // Notifications state
  const [notifyTeacherApps, setNotifyTeacherApps] = useState(true);
  const [notifyIncidents, setNotifyIncidents] = useState(true);
  const [notifyCapacity, setNotifyCapacity] = useState(true);
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(false);
  const [routingEmail, setRoutingEmail] = useState("admin-ops@konnect.edu");

  // Security state
  const [twoStepVerification, setTwoStepVerification] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Admin user info
  const [adminName, setAdminName] = useState("Alex Morgan");
  const [adminEmail, setAdminEmail] = useState("alex.morgan@konnect.edu");
  const [adminRole, setAdminRole] = useState("Platform Administrator");
  const [editingAdminAccount, setEditingAdminAccount] = useState(false);
  const [savingAdminAccount, setSavingAdminAccount] = useState(false);

  // Feedback notifications
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Active sessions
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Chrome · macOS London", lastActive: "Current session", current: true },
    { id: "s2", device: "Safari · iPadOS London", lastActive: "15 Oct · 14:24", current: false },
  ]);

  // Audit log entries
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(initialAuditEntries);

  // Load real current user info if available
  useEffect(() => {
    if (!window.localStorage.getItem("konnect-access-token")) return;
    currentUser()
      .then((user) => {
        const full = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || user.username;
        if (full) setAdminName(full);
        if (user.email) setAdminEmail(user.email);
      })
      .catch(() => undefined);
  }, []);

  function showNotice(message: string, type: "success" | "error" = "success") {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3500);
  }

  function handleSavePlatform(e: FormEvent) {
    e.preventDefault();
    setSavingPlatform(true);
    setTimeout(() => {
      setSavingPlatform(false);
      showNotice("Platform settings updated successfully.");
    }, 400);
  }

  async function handleSaveAdminAccount() {
    setSavingAdminAccount(true);
    try {
      const [first_name, ...lastParts] = adminName.trim().split(/\s+/);
      await updateCurrentUser({ first_name, last_name: lastParts.join(" "), email: adminEmail });
      setEditingAdminAccount(false);
      showNotice("Admin profile updated.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Admin profile could not be updated.", "error");
    } finally {
      setSavingAdminAccount(false);
    }
  }

  async function handleDeleteAdminAccount() {
    if (!window.confirm("Delete your administrator account? This may remove your access to the admin portal.")) return;
    try {
      const response = await deleteCurrentUser();
      if (!response.ok) throw new Error(`Account deletion failed (${response.status}).`);
      localStorage.removeItem("konnect-access-token");
      localStorage.removeItem("konnect-refresh-token");
      router.replace("/login");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Your account could not be deleted.", "error");
    }
  }

  function handleSaveNotifications(e: FormEvent) {
    e.preventDefault();
    setSavingNotifications(true);
    setTimeout(() => {
      setSavingNotifications(false);
      showNotice("Notification preferences saved.");
    }, 400);
  }

  function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      showNotice("Password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotice("Passwords do not match.", "error");
      return;
    }
    setSavingSecurity(true);
    setTimeout(() => {
      setSavingSecurity(false);
      setNewPassword("");
      setConfirmPassword("");
      showNotice("Admin password updated securely.");
    }, 500);
  }

  function handleSignOutOtherDevices() {
    setSessions((prev) => prev.filter((s) => s.current));
    showNotice("Signed out of all other remote devices.");
  }

  function handleExportAuditLog() {
    const csvContent = [
      ["Date & Time", "Administrator", "Action", "Affected Record", "Result"].join(","),
      ...auditEntries.map((entry) =>
        `"${entry.dateTime}","${entry.admin}","${entry.action}","${entry.affectedRecord}","${entry.result}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `konnect-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice("Audit log exported to CSV.");
  }

  return (
    <DashboardShell role="admin">
      <div className="space-y-4 pb-12 pt-1 max-w-[1400px] mx-auto">
        {/* Top Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#172115] dark:text-[#ecf2ea]">
              Settings
            </h1>
            <p className="mt-0.5 text-[11px] text-[#707c6c] dark:text-[#9ea999]">
              Keep Konnect running smoothly, securely and transparently.
            </p>
          </div>
        </header>

        {/* Global Toast Notice */}
        {notice && (
          <div
            role="status"
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 ${
              notice.type === "success"
                ? "border-[#a5d697] bg-[#edf8eb] text-[#24541c]"
                : "border-[#f0a9a0] bg-[#fdf2f0] text-[#9a2818]"
            }`}
          >
            {notice.type === "success" ? <Check size={14} className="stroke-[3]" /> : <ShieldAlert size={14} />}
            <span>{notice.message}</span>
          </div>
        )}

        {/* Navigation Pills Bar */}
        <nav aria-label="Settings categories" className="flex items-center gap-1.5 pt-1">
          {[
            { id: "platform", label: "Platform" },
            { id: "notifications", label: "Notifications" },
            { id: "security", label: "Security" },
            { id: "audit", label: "Audit Log" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#233520] text-white shadow-xs"
                    : "text-[#556550] hover:bg-[#edf2ea] dark:text-[#a0af9b] dark:hover:bg-[#1a2418]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Top Section: Platform settings (Left) & Recording + Admin Account (Right) */}
        {(activeTab === "platform" || activeTab === "notifications" || activeTab === "security" || activeTab === "audit") && (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(310px,1.05fr)]">
            {/* Left: Platform Settings Form */}
            <section
              aria-label="Platform settings"
              className="rounded-2xl border border-[#dfe5db] bg-white p-5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-6"
            >
              <div>
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#edf2ea]">
                  Platform settings
                </h2>
                <p className="mt-0.5 text-[10px] text-[#707c6c] dark:text-[#9ea999]">
                  Core defaults for every room &amp; live session.
                </p>
              </div>

              <form onSubmit={handleSavePlatform} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {/* Platform Name */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                      Platform name
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                    />
                  </div>

                  {/* Support Email */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                      Support email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                      Language
                    </label>
                    <div className="relative mt-1">
                      <select
                        aria-label="Platform Language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#dce3d8] bg-white pl-3 pr-8 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                      >
                        <option value="English (UK)">English (UK)</option>
                        <option value="English (US)">English (US)</option>
                        <option value="French">Français</option>
                        <option value="Spanish">Español</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717e6d]"
                      />
                    </div>
                  </div>

                  {/* Time Zone */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                      Time zone
                    </label>
                    <div className="relative mt-1">
                      <select
                        aria-label="Platform Time zone"
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#dce3d8] bg-white pl-3 pr-8 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                      >
                        <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                        <option value="Africa/Kigali (CAT)">Africa/Kigali (CAT)</option>
                        <option value="America/New_York (EST)">America/New_York (EST)</option>
                        <option value="UTC">Universal Time (UTC)</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717e6d]"
                      />
                    </div>
                  </div>

                  {/* Default room limit */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                      Default room limit
                    </label>
                    <input
                      type="text"
                      value={defaultRoomLimit}
                      onChange={(e) => setDefaultRoomLimit(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                    />
                  </div>

                  {/* Maximum live seats */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                      Maximum live seats
                    </label>
                    <input
                      type="text"
                      value={maxLiveSeats}
                      onChange={(e) => setMaxLiveSeats(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3.5 border-t border-[#edf1ea] pt-3.5 dark:border-[#243021]">
                  {/* Automatic attendance */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                        Automatic attendance
                      </p>
                      <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                        Track arrival &amp; departure times for live participants.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={automaticAttendance}
                      onClick={() => setAutomaticAttendance(!automaticAttendance)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                        automaticAttendance ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                          automaticAttendance ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Require teacher approval */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                        Require teacher approval
                      </p>
                      <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                        Review teacher applications before publishing live classes.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={requireTeacherApproval}
                      onClick={() => setRequireTeacherApproval(!requireTeacherApproval)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                        requireTeacherApproval ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                          requireTeacherApproval ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-[#edf1ea] pt-3.5 dark:border-[#243021]">
                  <button
                    type="button"
                    onClick={() => {
                      setPlatformName("Konnect");
                      setSupportEmail("support@konnect.edu");
                      showNotice("Reset platform changes.");
                    }}
                    className="h-8 rounded-lg border border-[#dfe5db] bg-white px-3 text-[10.5px] font-semibold text-[#54644e] hover:bg-[#f6f9f3] dark:border-[#2e3b2b] dark:bg-[#1a2318] dark:text-[#c4d2bf]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlatform}
                    className="h-8 rounded-lg bg-[#233520] px-4 text-[10.5px] font-semibold text-white shadow hover:bg-[#324a2c] disabled:opacity-60 transition"
                  >
                    {savingPlatform ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* Right Column: Recording & Retention + Your Admin Account */}
            <div className="space-y-4">
              {/* Recording & Retention */}
              <section
                aria-label="Recording and retention policy"
                className="rounded-2xl border border-[#dfe5db] bg-white p-5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-6"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#edf2ea]">
                      Recording &amp; retention
                    </h2>
                    <p className="mt-0.5 text-[9.5px] text-[#707c6c] dark:text-[#9ea999]">
                      Legal requirement: record every learning session
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eaf4e6] px-2.5 py-0.5 text-[8.5px] font-bold text-[#2c6e21] dark:bg-[#1f301b] dark:text-[#86efac]">
                    Always on
                  </span>
                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-[#556450] dark:text-[#a0af9a]">
                  Every session is automatically recorded and retained for 90 days, with instant download links available in the original lesson logs.
                </p>

                {/* Safeguard Alert Box */}
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#d2e5ce] bg-[#edf5ea] p-3 dark:border-[#2b3c26] dark:bg-[#172215]">
                  <Clock size={15} className="mt-0.5 shrink-0 text-[#2f6823] dark:text-[#86efac]" />
                  <p className="text-[9px] font-medium leading-relaxed text-[#35532d] dark:text-[#bad4b2]">
                    <strong className="font-semibold text-[#204019] dark:text-[#d3ebd0]">
                      Recordings cannot be disabled.
                    </strong>{" "}
                    Required by local safeguard policy in all states. Includes guardian observation.
                  </p>
                </div>
              </section>

              {/* Your Admin Account */}
              <section
                aria-label="Your administrator account"
                className="rounded-2xl border border-[#dfe5db] bg-white p-5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-6"
              >
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#edf2ea]">
                  Your admin account
                </h2>
                {editingAdminAccount ? <div className="mt-3 space-y-2">
                  <label className="block text-[9px] font-semibold text-[#63715d]">Name<input value={adminName} onChange={(event) => setAdminName(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-[#e9ece4] bg-white px-3 text-[11px] text-[#172115] outline-none focus:border-[#263a20]" /></label>
                  <label className="block text-[9px] font-semibold text-[#63715d]">Email<input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-[#e9ece4] bg-white px-3 text-[11px] text-[#172115] outline-none focus:border-[#263a20]" /></label>
                </div> : <p className="mt-1.5 text-[17px] font-extrabold text-[#172115] dark:text-[#edf2ea]">{adminName}</p>}
                <p className="text-[10px] text-[#707c6c] dark:text-[#9ea999]">
                  {adminRole}
                </p>

                {!editingAdminAccount && <div className="mt-2.5">
                  <span className="inline-block rounded-full bg-[#eef6eb] px-3 py-1 font-mono text-[9.5px] font-semibold text-[#276a1f] dark:bg-[#1f2f1c] dark:text-[#86efac]">
                    {adminEmail}
                  </span>
                </div>}

                <p className="mt-3.5 border-t border-[#edf1ea] pt-2 text-[8.5px] text-[#828f7f] dark:border-[#243021] dark:text-[#9ea999]">
                  Active session · 16 Oct 2026, 09:20
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {editingAdminAccount ? <><button type="button" disabled={savingAdminAccount} onClick={() => void handleSaveAdminAccount()} className="rounded-full bg-[#263a20] px-3 py-1.5 text-[9px] font-semibold text-white disabled:opacity-50">{savingAdminAccount ? "Saving…" : "Save profile"}</button><button type="button" onClick={() => setEditingAdminAccount(false)} className="rounded-full bg-[#f2f5ee] px-3 py-1.5 text-[9px] font-semibold text-[#263a20]">Cancel</button></> : <button type="button" onClick={() => setEditingAdminAccount(true)} className="rounded-full bg-[#f2f5ee] px-3 py-1.5 text-[9px] font-semibold text-[#263a20]">Edit profile</button>}
                  <button type="button" onClick={() => void handleDeleteAdminAccount()} className="rounded-full border border-[#e9c7c2] px-3 py-1.5 text-[9px] font-semibold text-[#913f34]">Delete account</button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Middle Section: Notifications (Left) & Security (Right) */}
        {(activeTab === "notifications" || activeTab === "platform" || activeTab === "security" || activeTab === "audit") && (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {/* Notifications Card */}
            <section
              aria-label="Notifications configuration"
              className="rounded-2xl border border-[#dfe5db] bg-white p-5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-6"
            >
              <div>
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#edf2ea]">
                  Notifications
                </h2>
                <p className="mt-0.5 text-[9.5px] text-[#707c6c] dark:text-[#9ea999]">
                  Choose what pops for your admin team
                </p>
              </div>

              <form onSubmit={handleSaveNotifications} className="mt-4 space-y-3.5">
                {/* Teacher applications */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                      Teacher applications
                    </p>
                    <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                      New applications and missing documents.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyTeacherApps}
                    onClick={() => setNotifyTeacherApps(!notifyTeacherApps)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      notifyTeacherApps ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                        notifyTeacherApps ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Incident alerts */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                      Incident alerts
                    </p>
                    <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                      Immediate alerts for reporting and exam violations.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyIncidents}
                    onClick={() => setNotifyIncidents(!notifyIncidents)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      notifyIncidents ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                        notifyIncidents ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Class capacity alerts */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                      Class capacity alerts
                    </p>
                    <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                      Notify when a class approaches 95% capacity.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyCapacity}
                    onClick={() => setNotifyCapacity(!notifyCapacity)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      notifyCapacity ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                        notifyCapacity ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Weekly platform summary */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                      Weekly platform summary
                    </p>
                    <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                      Attendance, completed lessons and audits.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyWeeklySummary}
                    onClick={() => setNotifyWeeklySummary(!notifyWeeklySummary)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      notifyWeeklySummary ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                        notifyWeeklySummary ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Routing email field */}
                <div className="pt-2">
                  <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                    Routing email
                  </label>
                  <input
                    type="email"
                    value={routingEmail}
                    onChange={(e) => setRoutingEmail(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={savingNotifications}
                    className="h-8 rounded-lg bg-[#233520] px-4 text-[10.5px] font-semibold text-white shadow hover:bg-[#324a2c] disabled:opacity-60 transition"
                  >
                    {savingNotifications ? "Saving…" : "Save preferences"}
                  </button>
                </div>
              </form>
            </section>

            {/* Security Card */}
            <section
              aria-label="Security and credentials"
              className="rounded-2xl border border-[#dfe5db] bg-white p-5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-6"
            >
              <div>
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#edf2ea]">
                  Security
                </h2>
                <p className="mt-0.5 text-[9.5px] text-[#707c6c] dark:text-[#9ea999]">
                  Protect platform access and sensitive information.
                </p>
              </div>

              {/* Require 2-step verification toggle */}
              <div className="mt-4 flex items-center justify-between gap-3 border-b border-[#edf1ea] pb-3.5 dark:border-[#243021]">
                <div>
                  <p className="text-[11px] font-bold text-[#1b2518] dark:text-[#edf2ea]">
                    Require 2-step verification
                  </p>
                  <p className="text-[9.5px] text-[#6d7968] dark:text-[#9ea999]">
                    Mandatory for all administrative accounts.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={twoStepVerification}
                  onClick={() => setTwoStepVerification(!twoStepVerification)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                    twoStepVerification ? "bg-[#25491d]" : "bg-[#cfd6cb] dark:bg-[#344230]"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform mt-0.75 ml-0.75 ${
                      twoStepVerification ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Password update fields */}
              <form onSubmit={handleUpdatePassword} className="mt-3.5 space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#303d2d] dark:text-[#c5d3be]">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-[#dce3d8] bg-white px-3 text-[11px] font-medium text-[#172115] outline-none transition focus:border-[#426437] dark:border-[#2d3a29] dark:bg-[#1a2318] dark:text-[#edf2ea]"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={savingSecurity}
                    className="h-8 rounded-lg bg-[#233520] px-4 text-[10.5px] font-semibold text-white shadow hover:bg-[#324a2c] disabled:opacity-60 transition"
                  >
                    {savingSecurity ? "Updating…" : "Update password"}
                  </button>
                </div>
              </form>

              {/* Signed-in devices box */}
              <div className="mt-4 overflow-hidden rounded-xl border border-[#dfe5db] dark:border-[#273523]">
                <div className="flex items-center justify-between bg-[#edf4e8] px-3.5 py-1.5 text-[8.5px] font-bold uppercase tracking-wider text-[#495b42] dark:bg-[#1d291b] dark:text-[#b4c7ad]">
                  <span>Signed-in device</span>
                  <span>Last active</span>
                </div>
                <div className="divide-y divide-[#edf1ea] bg-white dark:divide-[#243021] dark:bg-[#151c14]">
                  {sessions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3.5 py-2 text-[10px] text-[#283524] dark:text-[#edf2ea]"
                    >
                      <span className="font-medium">{item.device}</span>
                      <span className="text-[9px] text-[#6f7c6b] dark:text-[#9ea999]">
                        {item.lastActive}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {sessions.length > 1 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleSignOutOtherDevices}
                    className="h-8 rounded-lg border border-[#dfe5db] bg-white px-3 text-[9.5px] font-semibold text-[#54644e] hover:bg-[#f6f9f3] dark:border-[#2e3b2b] dark:bg-[#1a2318] dark:text-[#c4d2bf] transition"
                  >
                    Sign out of other devices
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Bottom Section: Audit Log Card */}
        {(activeTab === "audit" || activeTab === "platform" || activeTab === "notifications" || activeTab === "security") && (
          <section
            aria-label="Platform audit log"
            className="rounded-2xl border border-[#dfe5db] bg-white p-5 shadow-2xs dark:border-[#273523] dark:bg-[#151c14] sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-[#172115] dark:text-[#edf2ea]">
                  Audit Log
                </h2>
                <p className="mt-0.5 text-[9.5px] text-[#707c6c] dark:text-[#9ea999]">
                  Read-only history of administrative actions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportAuditLog}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dfe5db] bg-white px-3 text-[9.5px] font-semibold text-[#485942] shadow-2xs hover:bg-[#f6f9f3] dark:border-[#2e3b2b] dark:bg-[#1a2318] dark:text-[#c4d2bf] transition"
              >
                <Download size={12} />
                <span>Export audit log</span>
              </button>
            </div>

            {/* Audit Log Table */}
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[650px] overflow-hidden rounded-xl border border-[#dfe5db] dark:border-[#273523]">
                {/* Table Header */}
                <div className="grid grid-cols-[140px_110px_minmax(0,1.8fr)_minmax(0,1.4fr)_80px] items-center bg-[#edf4e8] px-4 py-2 text-[8px] font-bold uppercase tracking-wider text-[#495b42] dark:bg-[#1d291b] dark:text-[#b4c7ad]">
                  <span>Date &amp; time</span>
                  <span>Administrator</span>
                  <span>Action</span>
                  <span>Affected record</span>
                  <span className="text-right">Result</span>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#edf1ea] bg-white dark:divide-[#243021] dark:bg-[#151c14]">
                  {auditEntries.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[140px_110px_minmax(0,1.8fr)_minmax(0,1.4fr)_80px] items-center px-4 py-2.5 text-[10px] text-[#20291e] dark:text-[#edf2ea]"
                    >
                      <span className="text-[9.5px] text-[#556550] dark:text-[#9ea999]">
                        {row.dateTime}
                      </span>
                      <span className="font-semibold text-[#182315] dark:text-[#edf2ea]">
                        {row.admin}
                      </span>
                      <span className="text-[10px] text-[#33422f] dark:text-[#c5d3be]">
                        {row.action}
                      </span>
                      <span className="truncate font-mono text-[9px] text-[#556550] dark:text-[#9ea999]">
                        {row.affectedRecord}
                      </span>
                      <div className="text-right">
                        <span className="inline-block rounded-full bg-[#eaf4e6] px-2.5 py-0.5 text-[8.5px] font-bold text-[#276e1d] dark:bg-[#1f301b] dark:text-[#86efac]">
                          {row.result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3.5 text-[8.5px] text-[#798574] dark:text-[#9ea999]">
              Audit log is retained for 7 years as mandatory by education privacy laws and standards.
            </p>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
