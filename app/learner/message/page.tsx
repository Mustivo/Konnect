"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  Link2,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  X,
} from "lucide-react";

type Person = {
  id: string;
  name: string;
  course: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  unread: number;
};

type ChatMessage = {
  id: string;
  sender: "teacher" | "learner";
  time: string;
  body: string;
  attachment?: string;
  link?: { title: string; url: string; site: string };
};

const initialPeople: Person[] = [
  { id: "amara", name: "Amara Okafor", course: "UI/UX Design", initials: "AO", color: "bg-[#f0eafd] text-[#72619a]", preview: "I’ll review your component states next.", time: "16:04", unread: 0 },
  { id: "sarah", name: "Sarah Mitchell", course: "React.js", initials: "SM", color: "bg-[#eaf0e3] text-[#627955]", preview: "The hooks notes are in Resources.", time: "12:15", unread: 1 },
  { id: "daniel", name: "Daniel Brooks", course: "Django", initials: "DB", color: "bg-[#edf0e5] text-[#657954]", preview: "We’ll walk through serializers tomorrow.", time: "09:30", unread: 1 },
  { id: "elena", name: "Dr. Elena Ruiz", course: "Mathematics for Everyday Life", initials: "ER", color: "bg-[#e8eee4] text-[#617555]", preview: "Try question 4 with the worked example.", time: "5 Oct", unread: 0 },
];

const initialMessages: Record<string, ChatMessage[]> = {
  amara: [
    {
      id: "amara-1",
      sender: "teacher",
      time: "15:38 BST",
      body: "Hi Gabriella! Here are the notes from our design systems lesson. The checklist on page 6 will help with your component-library assignment.",
      attachment: "Design-systems-and-component-libraries.pdf",
    },
    {
      id: "amara-2",
      sender: "teacher",
      time: "15:42 BST",
      body: "I also shared this reference in Resources. Look at how tokens and components work together before documenting your own library.",
      link: {
        title: "A practical introduction to design systems",
        url: "https://www.figma.com/resource-library/",
        site: "figma.com · Figma resource library",
      },
    },
    {
      id: "amara-3",
      sender: "learner",
      time: "15:51 BST",
      body: "Thank you, Amara! I’ve saved the notes. For the assignment, should I include hover and disabled states as well as the default buttons?",
    },
    {
      id: "amara-4",
      sender: "teacher",
      time: "16:04 BST",
      body: "Yes — include default, hover, focus and disabled states. Your spacing is already consistent; add a short usage note for each component. I’ll review your component states next.",
    },
  ],
  sarah: [{ id: "sarah-1", sender: "teacher", time: "12:15 BST", body: "The hooks notes are in Resources. Start with the examples on state and effects, then bring any questions to our next class." }],
  daniel: [{ id: "daniel-1", sender: "teacher", time: "09:30 BST", body: "We’ll walk through serializers tomorrow. Have a look at the short API guide before class if you have time." }],
  elena: [{ id: "elena-1", sender: "teacher", time: "15:08 BST", body: "Try question 4 with the worked example. It uses the same steps we practised together." }],
};

function Avatar({ person, small = false }: { person: Person; small?: boolean }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold ${small ? "size-7 text-[9px]" : "size-8 text-[10px]"} ${person.color}`}>
      {person.initials}
    </span>
  );
}

export default function LearnerMessagesPage() {
  const [people, setPeople] = useState(initialPeople);
  const [activeId, setActiveId] = useState("amara");
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showActions, setShowActions] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const activePerson = people.find((person) => person.id === activeId) ?? people[0];
  const activeMessages = messages[activeId] ?? [];
  const visiblePeople = useMemo(() => people.filter((person) => {
    const matchesSearch = `${person.name} ${person.course} ${person.preview}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!unreadOnly || person.unread > 0);
  }), [people, search, unreadOnly]);
  const unreadCount = people.reduce((sum, person) => sum + person.unread, 0);

  function openConversation(person: Person) {
    setActiveId(person.id);
    setShowActions(false);
    setPeople((current) => current.map((item) => item.id === person.id ? { ...item, unread: 0 } : item));
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() && !attachment) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const message: ChatMessage = {
      id: `${activeId}-${Date.now()}`,
      sender: "learner",
      time: `${timestamp} BST`,
      body: draft.trim(),
      attachment: attachment?.name,
    };
    setMessages((current) => ({ ...current, [activeId]: [...(current[activeId] ?? []), message] }));
    setPeople((current) => current.map((person) => person.id === activeId
      ? { ...person, preview: draft.trim() || `Attached ${attachment?.name}`, time: timestamp }
      : person));
    setDraft("");
    setAttachment(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div>
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-2">
          <h1 className="text-[26px] font-bold leading-none">Messages</h1>
        </header>

        <section className="grid h-[min(690px,calc(100dvh-110px))] min-h-0 min-w-0 overflow-hidden rounded-lg border border-[#e0e5dd] bg-white md:grid-cols-[225px_minmax(0,1fr)]" aria-label="Messages">
          <aside className="flex min-h-0 flex-col border-b border-[#e7eae4] md:border-b-0 md:border-r">
            <div className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold">Conversations</h2>
                <span className="text-[8px] font-semibold text-[#657854]">{unreadCount} unread</span>
              </div>
              <label className="relative mt-2 block">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa296]" />
                <span className="sr-only">Search teacher or course</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search teacher or course..." className="h-[30px] w-full rounded-md border border-[#e0e5dc] bg-white pl-8 pr-2 text-[9px] outline-none placeholder:text-[#a2aaa0] focus:border-[#829576] focus:ring-2 focus:ring-[#dce6d5]" />
              </label>
              <div className="mt-2 flex gap-1">
                <button type="button" aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)} className={`rounded-md px-2.5 py-1.5 text-[8px] font-semibold ${!unreadOnly ? "bg-[#293e27] text-white" : "border border-[#e2e6dd] text-[#64705e] hover:bg-[#f5f7f2]"}`}>All messages</button>
                <button type="button" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)} className={`rounded-md px-2.5 py-1.5 text-[8px] font-semibold ${unreadOnly ? "bg-[#293e27] text-white" : "border border-[#e2e6dd] text-[#64705e] hover:bg-[#f5f7f2]"}`}>Unread · {unreadCount}</button>
              </div>
            </div>

            <nav className="conversation-list-scroll min-h-0 flex-1 overflow-y-auto" aria-label="Conversations">
              {visiblePeople.map((person) => {
                const active = person.id === activeId;
                return <button key={person.id} type="button" onClick={() => openConversation(person)} aria-current={active ? "true" : undefined} className={`w-full border-b border-[#edf0e9] px-3 py-3 text-left transition ${active ? "bg-[#eaf0e4]" : "bg-white hover:bg-[#f6f7f3]"}`}>
                  <span className="flex items-center gap-2">
                    <Avatar person={person} small />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-bold">{person.name}</span><span className="shrink-0 text-[8px] text-[#858c80]">{person.time}</span></span>
                      <span className="mt-0.5 block truncate text-[8px] text-[#7d8579]">{person.course}</span>
                    </span>
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2 pl-9">
                    <span className="min-w-0 flex-1 truncate text-[8px] leading-4 text-[#737c70]">{person.preview}</span>
                    {person.unread > 0 && <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#293e27] text-[8px] font-bold text-white">{person.unread}</span>}
                  </span>
                  <span className="mt-1 block pl-9 text-[7px] text-[#899085]">Instructor</span>
                </button>;
              })}
              {!visiblePeople.length && <p className="px-3 py-8 text-center text-[9px] text-[#7d8579]">No conversations found.</p>}
            </nav>

          </aside>

          <section className="flex min-h-0 min-w-0 flex-col" aria-label={`Conversation with ${activePerson.name}`}>
            <header className="flex min-h-[53px] shrink-0 items-center justify-between gap-2 border-b border-[#e7eae4] px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar person={activePerson} />
                <div className="min-w-0"><h2 className="truncate text-[11px] font-bold">{activePerson.name}</h2><p className="mt-0.5 truncate text-[8px] text-[#7d8579]">{activePerson.course} · {coursesDescription(activePerson.course)} · Instructor</p></div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link href="/learner/resource" className="inline-flex items-center gap-1 rounded-md border border-[#e0e5dc] px-2.5 py-1.5 text-[8px] font-semibold text-[#586c4f] hover:bg-[#f2f5ef] sm:px-3">View resources <ArrowUpRight size={11} /></Link>
                <div className="relative">
                  <button type="button" aria-label="Conversation options" aria-expanded={showActions} onClick={() => setShowActions((current) => !current)} className="grid size-7 place-items-center rounded-md text-[#65705f] hover:bg-[#f2f5ef]"><MoreHorizontal size={15} /></button>
                  {showActions && <div className="absolute right-0 top-8 z-10 w-36 rounded-md border border-[#e0e5dc] bg-white p-1 shadow-lg"><button type="button" onClick={() => { setPeople((current) => current.map((person) => person.id === activeId ? { ...person, unread: person.unread ? 0 : 1 } : person)); setShowActions(false); }} className="w-full rounded px-2 py-1.5 text-left text-[9px] hover:bg-[#f2f5ef]">Mark {activePerson.unread ? "as read" : "as unread"}</button></div>}
                </div>
              </div>
            </header>

            <div className="message-history-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-white px-3 py-3 sm:px-4">
              <p className="text-center text-[8px] text-[#8a9187]">Today · Tuesday, 6 October 2026</p>
              {activeMessages.map((message) => {
                const own = message.sender === "learner";
                return <div key={message.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
                  <p className={`mb-1 text-[7px] text-[#858c80] ${own ? "text-right" : ""}`}>{own ? "Gabriella Igabe" : activePerson.name} · {message.time}</p>
                  <div className={`max-w-[88%] rounded-lg px-3 py-2 ${own ? "bg-[#eaf0e4]" : "bg-[#f1f3ed]"}`}>
                    {message.body && <p className="text-[9px] leading-[1.5] text-[#394136]">{message.body}</p>}
                    {message.attachment && <div className="mt-2 flex items-center gap-2 rounded-md border border-[#e4e8df] bg-white px-2 py-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded bg-[#edf2e8] text-[#68805a]"><FileText size={14} /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[8px] font-bold">{message.attachment}</span><span className="block text-[7px] text-[#81897d]">PDF · Lesson notes</span></span>
                      <ArrowDownToLine size={13} className="shrink-0 text-[#718064]" />
                    </div>}
                    {message.link && <a href={message.link.url} target="_blank" rel="noreferrer" className="mt-2 block rounded-md border border-[#e4e8df] bg-white p-2 hover:border-[#b8c4ad]">
                      <span className="flex items-center gap-1.5 text-[8px] font-bold"><Link2 size={11} className="shrink-0 text-[#6c805e]" /><span className="min-w-0 break-words">{message.link.title}</span><ArrowUpRight size={10} className="shrink-0" /></span>
                      <span className="mt-1 block truncate text-[7px] text-[#73816a]">{message.link.url}</span>
                      <span className="mt-1 block text-[7px] text-[#8a9187]">{message.link.site}</span>
                    </a>}
                  </div>
                </div>;
              })}
            </div>

            <form onSubmit={sendMessage} className="shrink-0 border-t border-[#e7eae4] bg-white px-3 py-2.5 sm:px-4">
              {attachment && <div className="mb-2 flex items-center gap-2 rounded-md bg-[#f2f5ef] px-2 py-1.5 text-[8px] text-[#53664a]"><FileText size={12} /><span className="min-w-0 flex-1 truncate">{attachment.name}</span><button type="button" aria-label="Remove attachment" onClick={() => { setAttachment(null); if (fileInput.current) fileInput.current.value = ""; }} className="grid size-5 place-items-center rounded hover:bg-white"><X size={12} /></button></div>}
              <div className="rounded-lg border border-[#e0e5dc] bg-white px-2.5 py-2 focus-within:border-[#829576] focus-within:ring-2 focus-within:ring-[#dce6d5]">
                <label htmlFor="message-draft" className="sr-only">Write a message to {activePerson.name}</label>
                <textarea id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Write a message to ${activePerson.name.split(" ")[0]}...`} rows={2} className="block min-h-[42px] w-full resize-none bg-transparent px-2 py-1 text-xs text-[#394136] outline-none placeholder:font-medium placeholder:text-[#52624b] placeholder:opacity-100" />
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf0e9] pt-1.5">
                  <div className="flex min-w-0 items-center gap-1">
                    <input ref={fileInput} type="file" className="sr-only" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} />
                    <button type="button" aria-label="Attach a file" onClick={() => fileInput.current?.click()} className="grid size-7 shrink-0 place-items-center rounded-md text-[#68785d] hover:bg-[#f2f5ef]"><Paperclip size={15} /></button>
                    <button type="button" aria-label="Add an emoji" onClick={() => setDraft((current) => `${current}${current ? " " : ""}🙂`)} className="grid size-7 shrink-0 place-items-center rounded-md text-[#68785d] hover:bg-[#f2f5ef]"><Smile size={15} /></button>
                    <span className="hidden items-center gap-1 pl-1 text-[7px] text-[#858c80] xl:inline-flex"><BookOpen size={11} /> Attach a file or share a useful link</span>
                  </div>
                  <button type="submit" disabled={!draft.trim() && !attachment} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#293e27] px-3 py-2 text-[8px] font-semibold text-white transition hover:bg-[#385235] disabled:cursor-not-allowed disabled:opacity-45">Send message <Send size={11} /></button>
                </div>
                <p className="mt-1 text-center text-[7px] text-[#91978e]">All message times are shown in BST.</p>
              </div>
            </form>
          </section>
        </section>
      </div>
    </div>
  );
}

function coursesDescription(course: string) {
  if (course === "UI/UX Design") return "From Wireframes to Prototypes";
  if (course === "React.js") return "Modern Frontend Development";
  if (course === "Django") return "Full-Stack Web Applications";
  return "Mathematics for Everyday Life";
}