"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { currentUser, getTeacherProfile, updateCurrentUser, updateTeacherProfile } from "@/lib/api/auth";
import { Bell, Check, Globe2, Info, ShieldCheck, UserRound } from "lucide-react";

type SettingsTab = "profile" | "notifications" | "classes" | "security";
type TeacherSettings = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  qualifications: string;
  expertiseSubjects: string;
  language: string;
  timezone: string;
  photo: string;
  defaultClass: string;
  defaultDuration: string;
  reminderHours: string;
  notifications: { assignments: boolean; exams: boolean; attendance: boolean; messages: boolean };
  twoFactor: boolean;
};

const storageKey = "konnect-teacher-settings";
const defaults: TeacherSettings = {
  firstName: "Edna",
  lastName: "Francis",
  email: "edna.francis@maplewood.school.edu",
  phoneNumber: "",
  bio: "Helping students build confidence in mathematics, one clear step at a time.",
  qualifications: "",
  expertiseSubjects: "",
  language: "English (UK)",
  timezone: "London · GMT+1",
  photo: "",
  defaultClass: "Algebra I · Class A",
  defaultDuration: "50 minutes",
  reminderHours: "24 hours before",
  notifications: { assignments: true, exams: true, attendance: false, messages: true },
  twoFactor: false,
};

const tabs: { id: SettingsTab; label: string; icon: typeof UserRound }[] = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "classes", label: "Class Preferences", icon: Globe2 },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function readSettings(): TeacherSettings {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? { ...defaults, ...JSON.parse(value) as Partial<TeacherSettings> } : defaults;
  } catch {
    return defaults;
  }
}

function initials(settings: TeacherSettings) {
  return `${settings.firstName.trim()[0] ?? "E"}${settings.lastName.trim()[0] ?? "F"}`.toUpperCase();
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-[8px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2.5 text-[9px] font-normal text-[#30392d] outline-none focus:border-[#8ca47e] dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]" /></label>;
}

export default function TeacherSettingsPage() {
  const [settings, setSettings] = useState(defaults);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [notice, setNotice] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(readSettings());
    if (!window.localStorage.getItem("konnect-access-token")) return;
    currentUser().then((user) => {
      const [firstName, ...lastNameParts] = `${user.first_name} ${user.last_name}`.trim().split(/\s+/);
      setSettings((current) => ({ ...current, firstName: firstName || user.username, lastName: lastNameParts.join(" "), email: user.email, phoneNumber: user.phone_number ?? "" }));
    }).catch(() => undefined);
    getTeacherProfile().then((profile) => {
      setSettings((current) => ({
        ...current,
        bio: String(profile.bio ?? ""),
        qualifications: String(profile.qualifications ?? ""),
        expertiseSubjects: String(profile.expertise_subjects ?? ""),
      }));
    }).catch(() => undefined);
  }, []);

  function update<K extends keyof TeacherSettings>(key: K, value: TeacherSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => update("photo", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  async function save() {
    setNotice("");
    try {
      if (activeTab === "profile") {
        await updateCurrentUser({ first_name: settings.firstName, last_name: settings.lastName, email: settings.email, phone_number: settings.phoneNumber });
        await updateTeacherProfile({
          bio: settings.bio,
          qualifications: settings.qualifications,
          expertise_subjects: settings.expertiseSubjects,
        });
      }
      localStorage.setItem(storageKey, JSON.stringify(settings));
      setNotice("Your settings have been saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Your settings could not be saved.");
    }
  }

  function cancel() {
    setSettings(readSettings());
    setNotice("");
  }

  function updateNotification(key: keyof TeacherSettings["notifications"], checked: boolean) {
    setSettings((current) => ({ ...current, notifications: { ...current.notifications, [key]: checked } }));
    setNotice("");
  }

  return (
    <DashboardShell role="teacher">
      <div className="space-y-3">
        <nav className="flex gap-1.5 overflow-x-auto border-b border-[#e5e9e1] pb-2 dark:border-[#2a312a]" role="tablist" aria-label="Settings sections">
          {tabs.map(({ id, label }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[8px] font-semibold transition ${activeTab === id ? "bg-[#263d21] text-white" : "text-[#65715f] hover:bg-white dark:text-[#a8b39f] dark:hover:bg-[#202720]"}`}>{label}</button>)}
        </nav>

        {activeTab === "profile" && <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(250px,0.95fr)]">
          <div className="space-y-3">
            <section className="rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]" aria-labelledby="personal-information-title">
              <h2 id="personal-information-title" className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Personal information</h2>
              <p className="mt-0.5 text-[7px] text-[#798374] dark:text-[#9aa592]">Your name and role are visible to students in your classes.</p>
              <div className="mt-3 flex items-center gap-3">
                <button type="button" aria-label="Choose profile photo" onClick={() => photoInput.current?.click()} className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e4eee0] text-[12px] font-bold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">{settings.photo ? <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${settings.photo})` }} /> : initials(settings)}</button>
                <input ref={photoInput} type="file" accept="image/*" className="sr-only" onChange={changePhoto} />
                <button type="button" onClick={() => photoInput.current?.click()} className="rounded-full bg-[#f1f4ed] px-3 py-1.5 text-[7px] font-semibold text-[#43543a] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">Upload photo</button>
                <button type="button" onClick={() => update("photo", "")} className="px-1 py-1.5 text-[7px] font-semibold text-[#465341] hover:underline dark:text-[#c5d6b8]">Remove</button>
                <span className="ml-auto text-[6px] text-[#879181]">JPG or PNG · up to 5 MB</span>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <Field label="First name" value={settings.firstName} onChange={(value) => update("firstName", value)} />
                <Field label="Last name" value={settings.lastName} onChange={(value) => update("lastName", value)} />
                <div className="sm:col-span-2"><Field label="Email address" type="email" value={settings.email} onChange={(value) => update("email", value)} /></div>
                <div className="sm:col-span-2"><Field label="Phone number" type="tel" value={settings.phoneNumber} onChange={(value) => update("phoneNumber", value)} /></div>
                <Field label="Qualifications" value={settings.qualifications} onChange={(value) => update("qualifications", value)} />
                <Field label="Teaching subjects" value={settings.expertiseSubjects} onChange={(value) => update("expertiseSubjects", value)} />
                <div className="sm:col-span-2"><Field label="Bio" value={settings.bio} onChange={(value) => update("bio", value)} /></div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-[#edf0e9] pt-3 dark:border-[#2a312a]"><span role="status" className="mr-auto text-[7px] text-[#63745b]">{notice}</span><button type="button" onClick={cancel} className="rounded-full bg-[#f1f4ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">Cancel</button><button type="button" onClick={save} className="inline-flex items-center gap-1 rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white hover:bg-[#304d2b]"><Check size={10} /> Save changes</button></div>
            </section>

            <section className="rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]"><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Regional preferences</h2><p className="mt-0.5 text-[7px] text-[#798374] dark:text-[#9aa592]">For clear dates, times and communication.</p><div className="mt-3 grid gap-2.5 sm:grid-cols-2"><label className="text-[8px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Language<select value={settings.language} onChange={(event) => update("language", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2.5 text-[8px] font-normal dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"><option>English (UK)</option><option>English (US)</option><option>French</option><option>Spanish</option></select></label><label className="text-[8px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Time zone<select value={settings.timezone} onChange={(event) => update("timezone", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2.5 text-[8px] font-normal dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]"><option>London · GMT+1</option><option>Paris · GMT+2</option><option>New York · GMT−4</option><option>Lagos · GMT+1</option></select></label></div></section>
          </div>

          <aside className="space-y-3">
            <section className="rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]"><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Your teaching account</h2><span className="mt-2 inline-flex rounded-full bg-[#e5f0df] px-2 py-1 text-[7px] font-semibold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6b8]">Teacher</span><h3 className="mt-3 text-[13px] font-bold text-[#172115] dark:text-[#ecf1ea]">{settings.firstName} {settings.lastName}</h3><p className="mt-1 text-[8px] text-[#7a8575] dark:text-[#9aa592]">{settings.expertiseSubjects || "Add your teaching subjects"}</p><p className="mt-3 text-[8px] text-[#7a8575] dark:text-[#9aa592]">{settings.qualifications || "Add your qualifications"}</p></section>
            <aside className="flex items-start gap-2 rounded-lg bg-[#e6f0e1] p-3 text-[#40533a] dark:bg-[#202b1d] dark:text-[#c5d6b8]"><Info size={12} className="mt-0.5 shrink-0" /><div><p className="text-[8px] font-bold">A profile your students know</p><p className="mt-1 text-[7px] leading-relaxed">Use a familiar name and photo so students can easily recognize you in class and messages.</p></div></aside>
            <section className="rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]"><h2 className="text-[10px] font-bold text-[#273124] dark:text-[#e5ebdf]">Your information, protected</h2><p className="mt-2 text-[7px] leading-relaxed text-[#7a8575] dark:text-[#9aa592]">Your email address and security settings are private. Students only see your name, photo, role and bio.</p><Link href="/about" className="mt-3 inline-flex rounded-full bg-[#f1f4ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] hover:bg-[#e5ecdf] dark:bg-[#252e22] dark:text-[#d1ddc7]">View privacy policy</Link></section>
          </aside>
        </div>}

        {activeTab === "notifications" && <section className="rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]"><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Notifications</h2><p className="mt-1 text-[7px] text-[#798374] dark:text-[#9aa592]">Choose which classroom updates reach you.</p><div className="mt-3">{([ ["assignments", "Assignment submissions", "New student work and due dates"], ["exams", "Exam activity", "Schedules, completion and results"], ["attendance", "Attendance alerts", "Absences and late arrivals"], ["messages", "Student messages", "New conversations and replies"] ] as const).map(([key, title, detail]) => <label key={key} className="flex items-center justify-between gap-4 border-b border-[#edf0e9] py-3 last:border-0 dark:border-[#2a312a]"><span><span className="block text-[9px] font-semibold text-[#30392d] dark:text-[#e1e8dc]">{title}</span><span className="text-[7px] text-[#798374] dark:text-[#9aa592]">{detail}</span></span><input type="checkbox" checked={settings.notifications[key]} onChange={(event) => updateNotification(key, event.target.checked)} className="size-4 accent-[#314d2c]" /></label>)}</div><div className="mt-3 flex justify-end"><button type="button" onClick={save} className="rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white">Save changes</button></div></section>}

        {activeTab === "classes" && <section className="max-w-2xl rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]"><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Class preferences</h2><p className="mt-1 text-[7px] text-[#798374] dark:text-[#9aa592]">Set defaults for your teaching workspace.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[8px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Default class<select value={settings.defaultClass} onChange={(event) => update("defaultClass", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2.5 text-[8px] font-normal dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{["Algebra I · Class A", "Algebra I · Class B", "Geometry · Class C"].map((name) => <option key={name}>{name}</option>)}</select></label><label className="text-[8px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Default exam duration<select value={settings.defaultDuration} onChange={(event) => update("defaultDuration", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2.5 text-[8px] font-normal dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{["30 minutes", "45 minutes", "50 minutes", "60 minutes", "90 minutes"].map((duration) => <option key={duration}>{duration}</option>)}</select></label><label className="text-[8px] font-semibold text-[#34402f] dark:text-[#d8e0d2]">Exam reminder<select value={settings.reminderHours} onChange={(event) => update("reminderHours", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-[#e1e6dc] bg-white px-2.5 text-[8px] font-normal dark:border-[#303b2d] dark:bg-[#202720] dark:text-[#e1e8dc]">{["12 hours before", "24 hours before", "48 hours before"].map((reminder) => <option key={reminder}>{reminder}</option>)}</select></label></div><div className="mt-4 flex justify-end"><button type="button" onClick={save} className="rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white">Save changes</button></div></section>}

        {activeTab === "security" && <section className="max-w-2xl rounded-xl border border-[#e0e5dd] bg-white p-4 dark:border-[#2a312a] dark:bg-[#161b17]"><h2 className="text-[11px] font-bold text-[#273124] dark:text-[#e5ebdf]">Security</h2><p className="mt-1 text-[7px] text-[#798374] dark:text-[#9aa592]">Protect your teaching account and student conversations.</p><div className="mt-3 divide-y divide-[#edf0e9] dark:divide-[#2a312a]"><div className="flex items-center justify-between gap-4 py-3"><div><p className="text-[9px] font-semibold text-[#30392d] dark:text-[#e1e8dc]">Password</p><p className="text-[7px] text-[#798374] dark:text-[#9aa592]">Update your sign-in password.</p></div><Link href="/forgot-password" className="rounded-full bg-[#f1f4ed] px-3 py-1.5 text-[7px] font-semibold text-[#485443] dark:bg-[#252e22] dark:text-[#d1ddc7]">Change password</Link></div><label className="flex items-center justify-between gap-4 py-3"><span><span className="block text-[9px] font-semibold text-[#30392d] dark:text-[#e1e8dc]">Two-factor authentication</span><span className="text-[7px] text-[#798374] dark:text-[#9aa592]">Add an extra verification step when signing in.</span></span><input type="checkbox" checked={settings.twoFactor} onChange={(event) => update("twoFactor", event.target.checked)} className="size-4 accent-[#314d2c]" /></label></div><button type="button" onClick={save} className="mt-3 rounded-full bg-[#233c20] px-3 py-1.5 text-[7px] font-semibold text-white">Save changes</button></section>}
      </div>
    </DashboardShell>
  );
}