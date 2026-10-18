"use client";

import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  FileText,
  Link2,
  NotebookPen,
  Search,
} from "lucide-react";

type Kind = "link" | "note" | "file";
type Tab = "Notes & Files" | "Shared Links" | "Saved";
type Course = { name: string; teacher: string; className: string };
type Resource = {
  id: string;
  course: string;
  title: string;
  source: string;
  kind: Kind;
  date: string;
  url: string;
  description: string;
};

const courses: Course[] = [
  { name: "Python Core", teacher: "Jane Doe", className: "Introduction to Python & Web Systems (PY101)" },
  { name: "React.js", teacher: "Sarah Mitchell", className: "Modern Frontend Development" },
  { name: "UI/UX Design", teacher: "Amara Okafor", className: "Wireframes to Prototypes" },
  { name: "Django", teacher: "Daniel Brooks", className: "Full-Stack Web Applications" },
  { name: "Mathematics", teacher: "Dr. Elena Ruiz", className: "Mathematics for Everyday Life" },
];

const resources: Resource[] = [
  { id: "python-docs", course: "Python Core", title: "Official Python 3.12 documentation & Tutorial", source: "docs.python.org", kind: "link", date: "Oct 16, 2026", url: "https://docs.python.org/3/tutorial/", description: "Core syntax, data types, mutable vs immutable lists & tuples reference." },
  { id: "python-notes", course: "Python Core", title: "Lecture Notes: Variables, Scopes & Dict Comprehensions", source: "Jane Doe lecture notes", kind: "note", date: "Oct 15, 2026", url: "https://docs.python.org/3/tutorial/", description: "Summary cheatsheet for Python data types and in-class live exercises." },
  { id: "react-ui", course: "React.js", title: "Learn React: describing and updating your UI", source: "react.dev/learn", kind: "link", date: "Oct 6, 2026", url: "https://react.dev/learn", description: "A practical guide to building interfaces with components, props, and state." },
  { id: "react-docs", course: "React.js", title: "React documentation", source: "react.dev/learn", kind: "link", date: "Oct 5, 2026", url: "https://react.dev/learn", description: "The official React guide and API reference." },
  { id: "react-notes", course: "React.js", title: "Component patterns · lesson notes", source: "Shared class notes", kind: "note", date: "Oct 4, 2026", url: "https://react.dev/learn", description: "A recap of composition, reusable components, and props." },
  { id: "figma-intro", course: "UI/UX Design", title: "A practical introduction to design systems", source: "figma.com/resource-library", kind: "link", date: "Oct 6, 2026", url: "https://www.figma.com/resource-library/", description: "A practical introduction to design tokens and reusable components." },
  { id: "figma-library", course: "UI/UX Design", title: "Figma resource library", source: "figma.com/resource-library", kind: "link", date: "Oct 2, 2026", url: "https://www.figma.com/resource-library/", description: "Guides, templates, and practical resources for design teams." },
  { id: "figma-file", course: "UI/UX Design", title: "Design system starter file", source: "Figma class file", kind: "file", date: "Oct 1, 2026", url: "https://www.figma.com/resource-library/", description: "A starter file for exploring color, type, and component tokens." },
  { id: "django-docs", course: "Django", title: "Django 5.2 documentation", source: "docs.djangoproject.com", kind: "link", date: "Oct 3, 2026", url: "https://docs.djangoproject.com/en/5.2/", description: "The official Django documentation and tutorial." },
  { id: "django-rest", course: "Django", title: "Django REST framework guide", source: "django-rest-framework.org", kind: "link", date: "Oct 3, 2026", url: "https://www.django-rest-framework.org/", description: "A guide to building maintainable APIs with Django." },
  { id: "django-notes", course: "Django", title: "Request and response cycle · notes", source: "Shared class notes", kind: "note", date: "Sep 30, 2026", url: "https://docs.djangoproject.com/en/5.2/", description: "A quick summary of URL routing, views, and templates." },
  { id: "math-linear", course: "Mathematics", title: "Linear functions practice", source: "khanacademy.org/math", kind: "link", date: "Oct 2, 2026", url: "https://www.khanacademy.org/math/algebra/linear-equations-and-inequalities", description: "Guided practice with linear relationships and graphs." },
  { id: "math-resources", course: "Mathematics", title: "Khan Academy math resources", source: "khanacademy.org/math", kind: "link", date: "Oct 1, 2026", url: "https://www.khanacademy.org/math", description: "A library of guided practice and lessons for mathematics." },
  { id: "math-notes", course: "Mathematics", title: "Everyday percentages · class notes", source: "Shared class notes", kind: "note", date: "Sep 29, 2026", url: "https://www.khanacademy.org/math", description: "Examples for comparing discounts, tips, and percentage change." },
];

function KindIcon({ kind, size = 16 }: { kind: Kind; size?: number }) {
  if (kind === "note") return <NotebookPen size={size} />;
  if (kind === "file") return <FileText size={size} />;
  return <Link2 size={size} />;
}

export default function LearnerResourcesPage() {
  const [tab, setTab] = useState<Tab>("Shared Links");
  const [courseFilter, setCourseFilter] = useState("All enrolled courses");
  const [classFilter, setClassFilter] = useState("All classes");
  const [kindFilter, setKindFilter] = useState("All types");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(["figma-library", "python-notes"]);
  const [selectedId, setSelectedId] = useState("python-docs");

  const filtered = resources.filter((item) => {
    const course = courses.find((entry) => entry.name === item.course)!;
    const isTabMatch = tab === "Saved" ? saved.includes(item.id) : tab === "Shared Links" ? item.kind === "link" : item.kind !== "link";
    const isKindMatch = kindFilter === "All types" || (kindFilter === "Articles" && item.kind === "link") || (kindFilter === "Notes" && item.kind === "note") || (kindFilter === "Files" && item.kind === "file");
    const haystack = `${item.title} ${item.source} ${item.course} ${course.teacher}`.toLowerCase();
    return isTabMatch && isKindMatch && (courseFilter === "All enrolled courses" || item.course === courseFilter) && (classFilter === "All classes" || course.className === classFilter) && haystack.includes(search.toLowerCase());
  }).sort((a, b) => b.date.localeCompare(a.date));

  const groups = courses
    .filter((course) => courseFilter === "All enrolled courses" || course.name === courseFilter)
    .map((course) => ({ ...course, items: filtered.filter((item) => item.course === course.name) }))
    .filter((course) => course.items.length);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];
  const linkCount = filtered.filter((item) => item.kind === "link").length;

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="space-y-4 pb-8 pt-1">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#63774f] dark:text-[#a4af9e]">Your learning space</p>
          <h1 className="mt-1 text-[26px] font-bold leading-none text-[#172115] dark:text-[#ecf1ea]">Resources</h1>
          <p className="mt-2 text-xs text-[#72796f] dark:text-[#9aa592]">Notes, useful links and extra reading — shared by your instructors, all in one place.</p>
        </header>

        <section className="mt-4 flex flex-col gap-3 rounded-lg border border-[#dfe5d7] bg-[#e9efe3] p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-[#212f1f] dark:bg-[#192418]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-white/85 text-[#587449] dark:bg-[#20271e] dark:text-[#c5d6b8]"><NotebookPen size={18} /></div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase text-[#667c53] dark:text-[#c5d6b8]">From your latest lesson · 2 new resources</p>
              <h2 className="mt-0.5 truncate text-sm font-bold text-[#172115] dark:text-[#ecf1ea]">Python Core Types &amp; In-Class Labs</h2>
              <p className="mt-0.5 truncate text-[10px] text-[#777f73] dark:text-[#9aa592]">Introduction to Python (PY101) · Jane Doe · Today · Lesson completed</p>
            </div>
          </div>
          <button type="button" onClick={() => { setCourseFilter("Python Core"); setTab("Notes & Files"); setKindFilter("All types"); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#273c25] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#385235] dark:bg-[#35522b] dark:hover:bg-[#406334]">
            View lesson notes <FileText size={13} />
          </button>
        </section>

        <nav aria-label="Filter resources by course" className="mt-2 flex flex-wrap gap-1.5 pb-1">
          {["All enrolled courses", ...courses.map((course) => course.name)].map((name) => {
            const course = courses.find((entry) => entry.name === name);
            const active = courseFilter === name;
            return <button key={name} type="button" aria-pressed={active} onClick={() => setCourseFilter(name)} className={`shrink-0 rounded-md border px-2.5 py-1.5 text-[9px] font-semibold transition ${active ? "border-[#293e27] bg-[#293e27] text-white dark:border-[#35522b] dark:bg-[#35522b]" : "border-[#e2e6dd] bg-white text-[#64705e] hover:border-[#a8b59d] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#a4af9e]"}`}>{course ? `${name} · ${course.teacher}` : name}</button>;
          })}
        </nav>

        <div className="mt-2 flex gap-1.5" role="tablist" aria-label="Resource type">
          {([{ label: "Notes & Files" as const, icon: <BookOpen size={12} /> }, { label: "Shared Links" as const, icon: <Link2 size={12} /> }, { label: "Saved" as const, icon: <Bookmark size={12} /> }]).map((entry) => (
            <button key={entry.label} type="button" role="tab" aria-selected={tab === entry.label} onClick={() => setTab(entry.label)} className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[9px] font-semibold transition ${tab === entry.label ? "border-[#293e27] bg-[#293e27] text-white dark:border-[#35522b] dark:bg-[#35522b]" : "border-[#e2e6dd] bg-white text-[#64705e] hover:border-[#a8b59d] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#a4af9e]"}`}>{entry.icon}{entry.label}</button>
          ))}
        </div>

        <section className="mt-3 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_310px]" aria-label="Course resources">
          <div className="min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa296]" />
                <span className="sr-only">Search resources by title, topic or instructor</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources by title, topic or instructor..." className="h-[34px] w-full rounded-md border border-[#e0e5dc] bg-white pl-9 pr-3 text-[10px] outline-none placeholder:text-[#a2aaa0] focus:border-[#829576] focus:ring-2 focus:ring-[#dce6d5] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea]" />
              </label>
              <div className="flex gap-1.5">
                <label className="sr-only" htmlFor="class-filter">Filter by class</label>
                <select id="class-filter" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-[34px] min-w-0 flex-1 rounded-md border border-[#e0e5dc] bg-white px-2 text-[9px] font-semibold text-[#5e6a58] sm:max-w-[170px] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea]">
                  <option>All classes</option>{courses.map((course) => <option key={course.name}>{course.className}</option>)}
                </select>
                <label className="sr-only" htmlFor="kind-filter">Filter by type</label>
                <select id="kind-filter" value={kindFilter} onChange={(event) => setKindFilter(event.target.value)} className="h-[34px] min-w-0 flex-1 rounded-md border border-[#e0e5dc] bg-white px-2 text-[9px] font-semibold text-[#5e6a58] sm:max-w-[115px] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#ecf1ea]">
                  {["All types", "Articles", "Notes", "Files"].map((kind) => <option key={kind}>{kind}</option>)}
                </select>
              </div>
              <span className="inline-flex h-[34px] shrink-0 items-center justify-end gap-1.5 text-[9px] font-semibold text-[#63705d] dark:text-[#a4af9e] sm:ml-auto">Newest first <ArrowDownWideNarrow size={13} /></span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-bold text-[#172115] dark:text-[#ecf1ea]">{tab === "Shared Links" ? "Instructor-shared links by course" : tab === "Saved" ? "Your saved resources" : "Notes & files by course"}</h2>
              <p className="text-[9px] text-[#858c80] dark:text-[#9aa592]">{groups.length} enrolled courses · {linkCount} links</p>
            </div>

            {groups.length ? <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2.5 md:grid-cols-2">
              {groups.map((course) => <section key={course.name} className="min-w-0 rounded-lg border border-[#e0e5dd] bg-white p-3 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]">
                <header className="mb-2 flex items-start justify-between gap-2">
                  <div><h3 className="text-[11px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">{course.name}</h3><p className="mt-0.5 text-[8px] text-[#838a80] dark:text-[#9aa592]">{course.teacher} · {course.className}</p></div>
                  <span className="shrink-0 rounded-full bg-[#edf2e8] px-2 py-1 text-[8px] font-semibold text-[#657854] dark:bg-[#20271e] dark:text-[#c5d6b8]">{course.items.length} {course.items.length === 1 ? "item" : "links"}</span>
                </header>
                <div className="space-y-1.5">
                  {course.items.map((item) => {
                    const isSaved = saved.includes(item.id);
                    return <article key={item.id} onClick={() => setSelectedId(item.id)} className={`flex min-w-0 items-center gap-2 rounded-md border p-2 transition cursor-pointer ${selected?.id === item.id ? "border-[#879779] bg-[#edf2e8] dark:border-[#425d36] dark:bg-[#1a2618]" : "border-[#e7eae4] bg-white hover:border-[#c1cbbb] dark:border-[#212f1f] dark:bg-[#111910] dark:hover:border-[#384e31]"}`}>
                      <button type="button" aria-label={`Preview ${item.title}`} onClick={() => setSelectedId(item.id)} className="grid size-7 shrink-0 place-items-center rounded-md bg-[#edf2e8] text-[#68805a] dark:bg-[#20271e] dark:text-[#c5d6b8]"><KindIcon kind={item.kind} /></button>
                      <button type="button" onClick={() => setSelectedId(item.id)} className="min-w-0 flex-1 text-left"><span className="block truncate text-[9px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">{item.title}</span><span className="mt-0.5 block truncate text-[8px] text-[#7d8579] dark:text-[#9aa592]">{item.source} · Shared {item.date}</span></button>
                      <a href={item.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex shrink-0 items-center gap-1 rounded border border-[#e0e5dc] bg-white px-2 py-1.5 text-[8px] font-semibold text-[#586c4f] hover:bg-[#f2f5ef] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#c5d6b8]">Open link <ArrowUpRight size={11} /></a>
                      <button type="button" aria-label={isSaved ? `Remove ${item.title} from saved` : `Save ${item.title}`} aria-pressed={isSaved} onClick={(event) => { event.stopPropagation(); toggleSaved(item.id); }} className="grid size-7 shrink-0 place-items-center rounded text-[#71806a] hover:bg-[#eef2e9] dark:hover:bg-[#1e2a1b]">{isSaved ? <Check size={13} className="text-[#35522b] dark:text-[#a1b894]" /> : <Bookmark size={13} />}</button>
                    </article>;
                  })}
                </div>
              </section>)}
            </div> : <div className="mt-2 rounded-lg border border-dashed border-[#cbd4c4] bg-white/60 px-4 py-10 text-center dark:border-[#212f1f] dark:bg-[#141d13]"><p className="text-xs font-semibold text-[#172115] dark:text-[#ecf1ea]">No resources match these filters</p><p className="mt-1 text-[10px] text-[#7d8579] dark:text-[#9aa592]">Try another course, type, or search term.</p></div>}
            <p className="mt-2 text-[8px] text-[#8b9287] dark:text-[#9aa592]">Showing {tab === "Saved" ? "saved resources" : tab.toLowerCase()} across {groups.length} enrolled courses.</p>
          </div>

          <aside className="min-w-0 self-start rounded-lg border border-[#e0e5dd] bg-white p-3.5 shadow-sm dark:border-[#212f1f] dark:bg-[#141d13]" aria-label="Resource preview">
            <div className="flex items-center justify-between"><p className="text-[8px] font-bold uppercase tracking-[0.04em] text-[#6e7d60] dark:text-[#c5d6b8]">Resource preview</p><Link2 size={13} className="text-[#647a55] dark:text-[#c5d6b8]" /></div>
            {selected ? <>
              <div className="mt-2 rounded-md bg-[#f1f3ec] p-3 dark:bg-[#192418]"><p className="flex items-center gap-1.5 text-[8px] font-bold uppercase text-[#6e7e60] dark:text-[#c5d6b8]"><span className="grid size-4 place-items-center rounded-full bg-[#e3eadd] dark:bg-[#20271e]"><KindIcon kind={selected.kind} size={11} /></span>{selected.course} resource {selected.kind === "link" ? "library" : selected.kind}</p><h2 className="mt-2 break-words text-[17px] font-bold leading-[1.1] text-[#172115] dark:text-[#ecf1ea]">{selected.title}</h2></div>
              <h3 className="mt-3 break-words text-[13px] font-bold leading-tight text-[#172115] dark:text-[#ecf1ea]">{selected.title}</h3>
              <p className="mt-1 text-[9px] text-[#758070] dark:text-[#9aa592]">{selected.course} · {courses.find((course) => course.name === selected.course)?.className}</p>
              <a href={selected.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[8px] text-[#7d8c70] underline decoration-[#cad3c2] underline-offset-2 dark:text-[#c5d6b8]">{selected.source}</a>
              <div className="my-3 border-t border-[#edf0e9] dark:border-[#212f1f]" />
              <div className="flex items-center gap-2"><div className="grid size-6 place-items-center rounded-full bg-[#edf0e8] text-[8px] font-bold text-[#718263] dark:bg-[#20271e] dark:text-[#c5d6b8]">{courses.find((course) => course.name === selected.course)?.teacher.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><p className="text-[9px] font-semibold text-[#172115] dark:text-[#ecf1ea]">{courses.find((course) => course.name === selected.course)?.teacher}</p><p className="text-[8px] text-[#858c80] dark:text-[#9aa592]">Shared {selected.date} · 15:42 BST</p></div></div>
              <div className="mt-3 rounded-md bg-[#eaf0e4] p-2.5 dark:bg-[#192418]"><p className="text-[9px] font-bold text-[#172115] dark:text-[#ecf1ea]">Why this was shared</p><p className="mt-1 text-[9px] leading-[1.45] text-[#6d7867] dark:text-[#b0bdae]">{selected.description}</p></div>
              <div className="mt-2.5 flex gap-1.5"><a href={selected.url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md bg-[#293e27] px-2 py-2 text-[9px] font-semibold text-white hover:bg-[#385235] dark:bg-[#35522b]">Open link <ArrowUpRight size={12} /></a><button type="button" onClick={() => toggleSaved(selected.id)} aria-pressed={saved.includes(selected.id)} className="inline-flex items-center justify-center gap-1 rounded-md border border-[#dfe5dc] px-2.5 py-2 text-[9px] font-semibold text-[#596d4e] hover:bg-[#f2f5ef] dark:border-[#212f1f] dark:text-[#c5d6b8]">{saved.includes(selected.id) ? "Saved" : "Save"}{saved.includes(selected.id) ? <Check size={12} /> : <Bookmark size={12} />}</button></div>
              <p className="mt-2 text-[8px] text-[#899085] dark:text-[#9aa592]">External reference · Opens outside Konnect.</p>
            </> : <p className="mt-3 text-[10px] text-[#7d8579] dark:text-[#9aa592]">Choose a resource to see its details.</p>}
          </aside>
        </section>
      </div>
  );
}