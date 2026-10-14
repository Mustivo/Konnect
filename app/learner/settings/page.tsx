"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Globe2,
  Moon,
  Shield,
  Sun,
  UserRound,
} from "lucide-react";

type NoticeKey = "invitations" | "lessons" | "assignments" | "exams" | "messages";
type SettingsSection = "profile" | "notifications" | "appearance" | "account";
type NoticePreference = { inApp: boolean; email: boolean };
type Settings = {
  displayName: string;
  email: string;
  timezone: string;
  language: string;
  about: string;
  theme: "light" | "dark";
  photo: string;
  notifications: Record<NoticeKey, NoticePreference>;
};

const preferenceKey = "konnect-learner-settings";
const defaultSettings: Settings = {
  displayName: "Gabriella Igabe",
  email: "gabriella.igabe@example.com",
  timezone: "Europe/London",
  language: "English",
  about: "Learning to build thoughtful digital experiences — from frontend code to accessible interfaces.",
  theme: "light",
  photo: "",
  notifications: {
    invitations: { inApp: true, email: true },
    lessons: { inApp: true, email: false },
    assignments: { inApp: true, email: true },
    exams: { inApp: true, email: true },
    messages: { inApp: true, email: false },
  },
};

const notificationRows: { key: NoticeKey; title: string; description: string }[] = [
  { key: "invitations", title: "Class invitations", description: "New classes and schedule updates" },
  { key: "lessons", title: "Lesson reminders", description: "A reminder before your live lesson" },
  { key: "assignments", title: "Assignments", description: "Due dates and instructor feedback" },
  { key: "exams", title: "Exams", description: "Exam schedules and reminders" },
  { key: "messages", title: "Instructor messages", description: "New messages from your teachers" },
];

const timezones = ["Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "Africa/Lagos", "Asia/Kolkata"];
const languages = ["English", "French", "Spanish", "German"];
const settingSections = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance & Language", icon: Globe2 },
  { id: "account", label: "Account", icon: Shield },
] as const;

function freshDefaults(): Settings {
  return {
    ...defaultSettings,
    notifications: Object.fromEntries(
      Object.entries(defaultSettings.notifications).map(([key, value]) => [key, { ...value }]),
    ) as Settings["notifications"],
  };
}

function readSettings(): Settings {
  try {
    const stored = localStorage.getItem(preferenceKey);
    if (!stored) return freshDefaults();
    const parsed = JSON.parse(stored) as Partial<Settings>;
    return {
      ...freshDefaults(),
      ...parsed,
      notifications: { ...freshDefaults().notifications, ...parsed.notifications },
    };
  } catch {
    return freshDefaults();
  }
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "GT";
}

export default function LearnerSettingsPage() {
  const [settings, setSettings] = useState<Settings>(freshDefaults);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(readSettings());

    function setSectionFromUrl(section: string | null) {
      if (settingSections.some((item) => item.id === section)) {
        setActiveSection(section as SettingsSection);
      }
    }

    function handleSectionRequest(event: Event) {
      const section = (event as CustomEvent<SettingsSection>).detail;
      setSectionFromUrl(section);
    }

    function handleHistoryChange() {
      setSectionFromUrl(new URLSearchParams(window.location.search).get("section"));
    }

    handleHistoryChange();
    window.addEventListener("konnect-settings-section", handleSectionRequest);
    window.addEventListener("popstate", handleHistoryChange);
    return () => {
      window.removeEventListener("konnect-settings-section", handleSectionRequest);
      window.removeEventListener("popstate", handleHistoryChange);
    };
  }, []);

  function selectSection(section: SettingsSection) {
    setActiveSection(section);
    const url = new URL(window.location.href);
    if (section === "profile") url.searchParams.delete("section");
    else url.searchParams.set("section", section);
    window.history.replaceState(window.history.state, "", url);
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateTheme(theme: Settings["theme"]) {
    update("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }

  function setNotice(key: NoticeKey, channel: keyof NoticePreference, enabled: boolean) {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: { ...current.notifications[key], [channel]: enabled },
      },
    }));
  }

  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => update("photo", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function saveSettings() {
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(settings));
      localStorage.setItem("konnect-theme", settings.theme);
      document.documentElement.setAttribute("data-theme", settings.theme);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function cancelChanges() {
    const restored = readSettings();
    setSettings(restored);
    document.documentElement.setAttribute("data-theme", restored.theme);
    setSaved(false);
  }

  return (
    <div>
      <div className="mx-auto max-w-[1320px]">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#63774f] dark:text-[#a8be97]">Your learning space</p>
          <h1 className="mt-1 text-[26px] font-bold leading-none">Settings &amp; Profile</h1>
          <p className="mt-2 text-xs text-[#72796f] dark:text-[#a6aea0]">Make your learning space feel like yours. Manage your details and preferences.</p>
        </header>

        <nav aria-label="Settings sections" className="mt-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
          {settingSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`settings-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={activeSection === id}
              aria-controls={id}
              onClick={() => selectSection(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[9px] font-semibold transition ${activeSection === id
                ? "border-[#293e27] bg-[#293e27] text-white"
                : "border-[#e2e6dd] bg-white text-[#64705e] hover:border-[#a8b59d] dark:border-white/10 dark:bg-[#1b211a] dark:text-[#d6dfd0]"
              }`}
            >
              {label} <Icon size={12} />
            </button>
          ))}
        </nav>

        <div className="mt-3">
          <div className="contents">
            <section id="profile" role="tabpanel" aria-labelledby="settings-tab-profile" hidden={activeSection !== "profile"} className="scroll-mt-4 rounded-lg border border-[#e0e5dd] bg-white p-3.5 dark:border-white/10 dark:bg-[#1b211a]">
              <h2 className="text-[11px] font-bold">Your profile</h2>
              <p className="mt-1 text-[8px] text-[#858c80] dark:text-[#a6aea0]">The learner information instructors see in class.</p>
              <div className="mt-3 flex items-center gap-2.5">
                <div role="img" aria-label={`${settings.displayName || "Learner"} profile photo`} className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eaf0e4] text-sm font-bold text-[#617555] ring-1 ring-[#e2e9dc] dark:bg-[#303b2c] dark:text-[#d5e3cb]">
                  {settings.photo ? <span aria-hidden="true" className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${settings.photo})` }} /> : initials(settings.displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold">{settings.displayName || "Your name"}</p>
                  <p className="mt-0.5 truncate text-[8px] text-[#858c80] dark:text-[#a6aea0]">{settings.email}</p>
                </div>
                <button type="button" onClick={() => selectSection("account")} className="shrink-0 rounded-md border border-[#e0e5dc] px-2.5 py-1.5 text-[8px] font-semibold text-[#596d4e] hover:bg-[#f2f5ef] dark:border-white/10 dark:text-[#d5e3cb] dark:hover:bg-[#252d23]">Edit account details</button>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div><p className="text-[8px] font-semibold">Timezone</p><p className="mt-0.5 text-[9px] text-[#596d4e] dark:text-[#d5e3cb]">{settings.timezone}</p></div>
                <div><p className="text-[8px] font-semibold">Language</p><p className="mt-0.5 text-[9px] text-[#596d4e] dark:text-[#d5e3cb]">{settings.language}</p></div>
              </div>
              <div className="mt-2.5 border-t border-[#edf0e9] pt-2.5 dark:border-white/10">
                <p className="text-[8px] font-semibold">About me</p>
                <p className="mt-1 text-[9px] leading-relaxed text-[#737b70] dark:text-[#a6aea0]">{settings.about || "No profile description added yet."}</p>
              </div>
            </section>

            <section id="account" role="tabpanel" aria-labelledby="settings-tab-account" hidden={activeSection !== "account"} className="scroll-mt-4 rounded-lg border border-[#e0e5dd] bg-white p-3.5 dark:border-white/10 dark:bg-[#1b211a]">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-bold">Account &amp; security</h2><Shield size={13} className="text-[#718064]" /></div>
              <h3 className="mt-2.5 text-[9px] font-bold">Learner information</h3>
              <div className="mt-2 flex items-center gap-2.5">
                <button type="button" onClick={() => photoInput.current?.click()} aria-label="Change profile photo" className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eaf0e4] text-sm font-bold text-[#617555] ring-1 ring-[#e2e9dc] dark:bg-[#303b2c] dark:text-[#d5e3cb]">
                  {settings.photo ? <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${settings.photo})` }} /> : initials(settings.displayName)}
                </button>
                <input ref={photoInput} type="file" accept="image/*" onChange={changePhoto} className="sr-only" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold">{settings.displayName || "Your name"}</p>
                  <p className="mt-0.5 text-[8px] text-[#858c80] dark:text-[#a6aea0]">Profile photo · JPG, PNG or WebP</p>
                </div>
                <button type="button" onClick={() => photoInput.current?.click()} className="shrink-0 rounded-md border border-[#e0e5dc] px-2.5 py-1.5 text-[8px] font-semibold text-[#596d4e] hover:bg-[#f2f5ef] dark:border-white/10 dark:text-[#d5e3cb] dark:hover:bg-[#252d23]">Change photo</button>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <label className="block text-[8px] font-semibold">Display name
                  <input value={settings.displayName} onChange={(event) => update("displayName", event.target.value)} className="mt-1 block h-[31px] w-full rounded-md border border-[#e0e5dc] bg-white px-2 text-[9px] font-normal outline-none focus:border-[#829576] dark:border-white/10 dark:bg-[#151a14] dark:text-[#edf1e9]" />
                </label>
                <label className="block text-[8px] font-semibold">Email address
                  <input type="email" value={settings.email} onChange={(event) => update("email", event.target.value)} className="mt-1 block h-[31px] w-full rounded-md border border-[#e0e5dc] bg-white px-2 text-[9px] font-normal outline-none focus:border-[#829576] dark:border-white/10 dark:bg-[#151a14] dark:text-[#edf1e9]" />
                </label>
                <label className="block text-[8px] font-semibold">Timezone
                  <select value={settings.timezone} onChange={(event) => update("timezone", event.target.value)} className="mt-1 block h-[31px] w-full rounded-md border border-[#e0e5dc] bg-white px-2 text-[9px] font-normal outline-none focus:border-[#829576] dark:border-white/10 dark:bg-[#151a14] dark:text-[#edf1e9]">
                    {timezones.map((timezone) => <option key={timezone}>{timezone}</option>)}
                  </select>
                </label>
                <label className="block text-[8px] font-semibold">Language
                  <select value={settings.language} onChange={(event) => update("language", event.target.value)} className="mt-1 block h-[31px] w-full rounded-md border border-[#e0e5dc] bg-white px-2 text-[9px] font-normal outline-none focus:border-[#829576] dark:border-white/10 dark:bg-[#151a14] dark:text-[#edf1e9]">
                    {languages.map((language) => <option key={language}>{language}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-2.5 block text-[8px] font-semibold">About me
                <textarea value={settings.about} onChange={(event) => update("about", event.target.value)} rows={2} className="mt-1 block min-h-[42px] w-full resize-y rounded-md border border-[#e0e5dc] bg-white px-2 py-1.5 text-[9px] font-normal leading-[1.4] outline-none focus:border-[#829576] dark:border-white/10 dark:bg-[#151a14] dark:text-[#edf1e9]" />
              </label>
              <p className="mt-2 text-[7px] text-[#899085] dark:text-[#929a8d]">Lesson times follow your timezone. {settings.timezone} currently uses BST.</p>
              <div className="my-3 border-t border-[#edf0e9] dark:border-white/10" />
              <h3 className="text-[9px] font-bold">Security</h3>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <div><p className="text-[9px] font-bold">Password</p><p className="mt-0.5 text-[8px] text-[#858c80] dark:text-[#a6aea0]">Choose a strong password for your account.</p></div>
                <Link href="/forgot-password" className="shrink-0 rounded-md border border-[#e0e5dc] px-2.5 py-1.5 text-[8px] font-semibold text-[#596d4e] hover:bg-[#f2f5ef] dark:border-white/10 dark:text-[#d5e3cb] dark:hover:bg-[#252d23]">Change password</Link>
              </div>
              <div className="my-2.5 border-t border-[#edf0e9] dark:border-white/10" />
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[9px] font-bold">Signing out</p><p className="mt-0.5 text-[8px] text-[#858c80] dark:text-[#a6aea0]">Leave your Konnect session on this device.</p></div>
                <Link href="/login" className="shrink-0 rounded-md border border-[#e0e5dc] px-2.5 py-1.5 text-[8px] font-semibold text-[#596d4e] hover:bg-[#f2f5ef] dark:border-white/10 dark:text-[#d5e3cb] dark:hover:bg-[#252d23]">Sign out <span aria-hidden="true">↗</span></Link>
              </div>
            </section>
          </div>

          <div className="contents">
            <section id="notifications" role="tabpanel" aria-labelledby="settings-tab-notifications" hidden={activeSection !== "notifications"} className="scroll-mt-4 rounded-lg border border-[#e0e5dd] bg-white p-3.5 dark:border-white/10 dark:bg-[#1b211a]">
              <h2 className="text-[11px] font-bold">Notifications</h2>
              <p className="mt-1 text-[8px] text-[#858c80] dark:text-[#a6aea0]">Choose what you hear about and where you receive it.</p>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_42px_42px] items-center gap-2 border-b border-[#edf0e9] pb-1.5 text-[7px] font-bold uppercase text-[#858c80] dark:border-white/10 dark:text-[#a6aea0]">
                <span>Learning updates</span><span className="text-center">In-app</span><span className="text-center">Email</span>
              </div>
              <div>
                {notificationRows.map((row) => <div key={row.key} className="grid min-h-[38px] grid-cols-[minmax(0,1fr)_42px_42px] items-center gap-2 border-b border-[#edf0e9] py-1.5 last:border-0 dark:border-white/10">
                  <div className="min-w-0"><p className="truncate text-[8px] font-bold">{row.title}</p><p className="mt-0.5 truncate text-[7px] text-[#858c80] dark:text-[#a6aea0]">{row.description}</p></div>
                  {(["inApp", "email"] as const).map((channel) => <label key={channel} className="flex justify-center">
                    <input type="checkbox" checked={settings.notifications[row.key][channel]} onChange={(event) => setNotice(row.key, channel, event.target.checked)} aria-label={`${row.title} ${channel === "inApp" ? "in-app" : "email"} notifications`} className="peer sr-only" />
                    <span aria-hidden="true" className="relative h-[14px] w-[27px] cursor-pointer rounded-full bg-[#dce1d8] transition peer-checked:bg-[#354c2e] after:absolute after:left-[2px] after:top-[2px] after:size-[10px] after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-[13px] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#718b61]" />
                  </label>)}
                </div>)}
              </div>
              <p className="mt-2 text-[7px] text-[#899085] dark:text-[#929a8d]">Lesson reminders arrive 15 minutes before the scheduled start.</p>
            </section>

            <section id="appearance" role="tabpanel" aria-labelledby="settings-tab-appearance" hidden={activeSection !== "appearance"} className="scroll-mt-4 rounded-lg border border-[#e0e5dd] bg-white p-3.5 dark:border-white/10 dark:bg-[#1b211a]">
              <h2 className="text-[11px] font-bold">Appearance &amp; language</h2>
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-[8px] font-bold">Theme</p><p className="mt-0.5 text-[7px] text-[#858c80] dark:text-[#a6aea0]">Choose your portal appearance.</p></div>
                <div className="inline-flex self-start rounded-md border border-[#e0e5dc] p-0.5 dark:border-white/10" role="group" aria-label="Theme">
                  <button type="button" aria-pressed={settings.theme === "light"} onClick={() => updateTheme("light")} className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[8px] font-semibold ${settings.theme === "light" ? "bg-[#293e27] text-white" : "text-[#64705e] dark:text-[#d6dfd0]"}`}>Light <Sun size={11} /></button>
                  <button type="button" aria-pressed={settings.theme === "dark"} onClick={() => updateTheme("dark")} className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[8px] font-semibold ${settings.theme === "dark" ? "bg-[#293e27] text-white" : "text-[#64705e] dark:text-[#d6dfd0]"}`}>Dark <Moon size={11} /></button>
                </div>
              </div>
              <div className="my-2.5 border-t border-[#edf0e9] dark:border-white/10" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-[8px] font-bold">Portal language</p><p className="mt-0.5 text-[7px] text-[#858c80] dark:text-[#a6aea0]">Used for navigation and notifications.</p></div>
                <label className="sr-only" htmlFor="portal-language">Portal language</label>
                <select id="portal-language" value={settings.language} onChange={(event) => update("language", event.target.value)} className="h-[31px] w-full rounded-md border border-[#e0e5dc] bg-white px-2 text-[8px] font-semibold text-[#52614a] outline-none focus:border-[#829576] dark:border-white/10 dark:bg-[#151a14] dark:text-[#edf1e9] sm:w-[140px]">
                  {languages.map((language) => <option key={language}>{language}</option>)}
                </select>
              </div>
              <p className="mt-2 text-[7px] text-[#899085] dark:text-[#929a8d]">Current appearance: {settings.theme === "light" ? "Light" : "Dark"} · Language: {settings.language}</p>
            </section>
          </div>
        </div>

        <footer className="mt-3 flex flex-col gap-2 rounded-lg border border-[#e0e5dd] bg-white/70 px-3.5 py-2.5 dark:border-white/10 dark:bg-[#1b211a]/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-[8px] text-[#75806e] dark:text-[#a6aea0]"><Check size={12} /><span aria-live="polite">{saved ? "Your settings are saved." : "Your changes apply when you save. You can update these preferences at any time."}</span></div>
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={cancelChanges} className="rounded-md border border-[#e0e5dc] bg-white px-3 py-1.5 text-[8px] font-semibold text-[#596d4e] hover:bg-[#f2f5ef] dark:border-white/10 dark:bg-[#151a14] dark:text-[#d5e3cb] dark:hover:bg-[#252d23]">Cancel</button>
            <button type="button" onClick={saveSettings} className="rounded-md bg-[#293e27] px-3 py-1.5 text-[8px] font-semibold text-white hover:bg-[#385235]">Save changes</button>
          </div>
        </footer>
      </div>
    </div>
  );
}